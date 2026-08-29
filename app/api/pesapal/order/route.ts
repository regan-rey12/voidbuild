// VoidBuild Pesapal Order API - server-trusted order creation
export const runtime = 'nodejs';

import { getPesapalToken, createPesapalOrder, registerPesapalIPN } from '@/lib/pesapal';
import { PLANS, Plan } from '@/lib/payments';
import { getAuthenticatedUserFromRequest } from '@/lib/auth-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const authUser = await getAuthenticatedUserFromRequest(req);
    if (!authUser?.id) {
      return Response.json({ error: 'Please sign in before upgrading your plan.' }, { status: 401 });
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return Response.json({ error: 'Supabase service role is not configured on the server.' }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const plan = (body.plan || 'business') as Plan;
    const email = String(body.email || authUser.email || 'hello@voidbuild.com').trim();
    const phone = String(body.phone || authUser.phone || '').trim() || null;

    if (!PLANS[plan] || PLANS[plan].price === 0 || plan === 'free') {
      return Response.json({ error: 'Please select a paid plan to upgrade' }, { status: 400 });
    }

    const selectedPlan = PLANS[plan];
    const host = req.headers.get('host') || 'voidbuild.com';
    const proto = host.includes('localhost') ? 'http' : 'https';
    const origin = req.headers.get('origin') || `${proto}://${host}`;
    const merchantReference = `voidbuild-${plan}-${Date.now()}`;
    const finalAmount = selectedPlan.price;

    const { error: pendingOrderError } = await admin.from('payment_orders').insert({
      user_id: authUser.id,
      plan,
      amount: finalAmount,
      merchant_reference: merchantReference,
      status: 'pending',
      phone,
      email,
      provider: 'pesapal',
      callback_payload: { phase: 'created_locally', billing_period: 'year' },
    });

    if (pendingOrderError) {
      throw new Error(`Unable to create payment order: ${pendingOrderError.message}`);
    }

    const { token, baseUrl } = await getPesapalToken();

    let notificationId = (process.env.PESAPAL_IPN_ID || process.env.NEXT_PUBLIC_PESAPAL_IPN_ID || '').trim();
    if (!notificationId || notificationId.includes('placeholder') || notificationId.includes('your_')) {
      try {
        const callbackUrl = `${origin}/api/pesapal/callback`;
        const ipnResult = await registerPesapalIPN(callbackUrl, token, baseUrl);
        notificationId = ipnResult.ipn_id || ipnResult.ipnId || '';
      } catch (ipnErr: any) {
        console.warn('Auto IPN register note:', ipnErr.message);
      }
    }

    const callbackUrl = `${origin}/api/pesapal/callback?merchant_reference=${merchantReference}`;

    const order = await createPesapalOrder(
      {
        amount: finalAmount,
        currency: 'UGX',
        description: `VoidBuild ${selectedPlan.name} Annual Plan - ${selectedPlan.limit} Websites`,
        callbackUrl,
        notificationId: notificationId || '',
        merchantReference,
        billingAddress: {
          email,
          phone: phone || '0751391318',
          firstName: 'VoidBuild',
          lastName: 'Customer',
        },
      },
      token,
      baseUrl
    );

    if (!order.redirect_url) {
      await admin
        .from('payment_orders')
        .update({
          status: 'failed',
          callback_payload: { phase: 'missing_redirect_url', order },
          updated_at: new Date().toISOString(),
        })
        .eq('merchant_reference', merchantReference);
      throw new Error(`Pesapal did not return a redirect URL. Response: ${JSON.stringify(order)}`);
    }

    await admin
      .from('payment_orders')
      .update({
        order_tracking_id: order.order_tracking_id || null,
        status: 'redirected',
        callback_payload: order,
        updated_at: new Date().toISOString(),
      })
      .eq('merchant_reference', merchantReference);

    return Response.json({
      success: true,
      orderTrackingId: order.order_tracking_id,
      merchantReference: order.merchant_reference,
      redirectUrl: order.redirect_url,
      amount: finalAmount,
      amountUGX: selectedPlan.priceUGX,
      billingPeriod: 'year',
    });
  } catch (e: any) {
    console.error('Pesapal order error:', e.message);
    return Response.json(
      {
        error: e.message || 'Payment initiation failed. Please check Pesapal credentials.',
      },
      { status: 500 }
    );
  }
}
