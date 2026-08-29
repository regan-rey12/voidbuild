// VoidBuild Pesapal Callback - verifies payment and activates subscription server-side
export const runtime = 'nodejs';

import { getPesapalToken, getPesapalTransactionStatus } from '@/lib/pesapal';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { addOneYear, toIso } from '@/lib/subscriptions';

async function handleCallback(req: Request) {
  const url = new URL(req.url);
  const orderTrackingId = url.searchParams.get('OrderTrackingId') || url.searchParams.get('orderTrackingId');
  const merchantReference =
    url.searchParams.get('OrderMerchantReference') ||
    url.searchParams.get('merchant_reference') ||
    url.searchParams.get('merchantReference');

  const host = req.headers.get('host') || 'voidbuild.com';
  const proto = host.includes('localhost') ? 'http' : 'https';
  const origin = req.headers.get('origin') || `${proto}://${host}`;

  if (!orderTrackingId && !merchantReference) {
    return Response.redirect(`${origin}/dashboard?payment=failed`, 302);
  }

  try {
    const admin = getSupabaseAdmin();
    if (!admin) throw new Error('Supabase service role is not configured on the server.');

    let orderQuery = admin.from('payment_orders').select('*').limit(1);

    if (merchantReference) {
      orderQuery = orderQuery.eq('merchant_reference', merchantReference);
    } else if (orderTrackingId) {
      orderQuery = orderQuery.eq('order_tracking_id', orderTrackingId);
    }

    const { data: orders, error: orderError } = await orderQuery;
    if (orderError) throw new Error(`Unable to read payment order: ${orderError.message}`);

    const order = orders?.[0];
    if (!order) {
      throw new Error('Payment order could not be found for this callback.');
    }

    const { token, baseUrl } = await getPesapalToken();
    const resolvedTrackingId = orderTrackingId || order.order_tracking_id;
    if (!resolvedTrackingId) {
      throw new Error('Payment tracking ID is missing.');
    }

    const statusData = await getPesapalTransactionStatus(resolvedTrackingId, token, baseUrl);

    const paymentStatus = statusData?.payment_status_description || statusData?.status || 'UNKNOWN';
    const isCompleted = paymentStatus === 'COMPLETED' || statusData?.payment_status === 1 || statusData?.status_code === 1;

    await admin
      .from('payment_orders')
      .update({
        order_tracking_id: resolvedTrackingId,
        status: isCompleted ? 'paid' : 'failed',
        callback_payload: statusData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    if (isCompleted) {
      const { data: existingPayments } = await admin
        .from('payments')
        .select('id')
        .eq('order_tracking_id', resolvedTrackingId)
        .limit(1);

      let paymentId = existingPayments?.[0]?.id || null;

      if (!paymentId) {
        const { data: insertedPayment, error: paymentInsertError } = await admin
          .from('payments')
          .insert({
            user_id: order.user_id,
            plan: order.plan,
            transaction_id: resolvedTrackingId,
            phone: order.phone || null,
            amount: order.amount,
            status: 'completed',
            provider: 'pesapal',
            merchant_reference: order.merchant_reference,
            order_tracking_id: resolvedTrackingId,
            raw_response: statusData,
            updated_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (paymentInsertError) {
          throw new Error(`Unable to record payment: ${paymentInsertError.message}`);
        }

        paymentId = insertedPayment?.id || null;
      }

      const now = new Date();
      const { data: existingSubscription } = await admin
        .from('subscriptions')
        .select('plan, status, started_at, expires_at')
        .eq('user_id', order.user_id)
        .limit(1)
        .maybeSingle();

      const isSamePlanRenewal = existingSubscription?.plan === order.plan;
      const existingExpiry = existingSubscription?.expires_at ? new Date(existingSubscription.expires_at) : null;
      const hasFutureExpiry = !!existingExpiry && !Number.isNaN(existingExpiry.getTime()) && existingExpiry > now;
      const renewalBase = isSamePlanRenewal && hasFutureExpiry && existingExpiry ? existingExpiry : now;
      const expiresAt = addOneYear(renewalBase);

      const { error: subscriptionError } = await admin.from('subscriptions').upsert(
        {
          user_id: order.user_id,
          plan: order.plan,
          status: 'active',
          started_at: toIso(now),
          expires_at: toIso(expiresAt),
          source_payment_id: paymentId,
          updated_at: toIso(now),
        },
        { onConflict: 'user_id' }
      );

      if (subscriptionError) {
        throw new Error(`Unable to activate subscription: ${subscriptionError.message}`);
      }

      const statusLabel = isSamePlanRenewal ? 'renewed' : 'success';
      return Response.redirect(`${origin}/dashboard?payment=${statusLabel}`, 302);
    }

    return Response.redirect(`${origin}/dashboard?payment=failed&status=${encodeURIComponent(paymentStatus)}`, 302);
  } catch (e: any) {
    console.error('Pesapal callback error:', e.message);
    return Response.redirect(`${origin}/dashboard?payment=error&message=${encodeURIComponent(e.message)}`, 302);
  }
}

export async function GET(req: Request) {
  return handleCallback(req);
}

export async function POST(req: Request) {
  return handleCallback(req);
}
