export const runtime = 'nodejs';

import { getPesapalToken, getPesapalTransactionStatus } from '@/lib/pesapal';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { addDomainToHosting, domainStatusFromProvider, isDomainProviderConfigured } from '@/lib/domain-provider';
import type { DomainStatus } from '@/lib/domain-provider';
import { domainRecordPayload, updateProjectDomain } from '@/lib/domain-service';
import { registerDomain, renewDomain } from '@/lib/domain-registrar';

function callbackOrigin(req: Request) {
  const configured = String(process.env.APP_ORIGIN || '').trim().replace(/\/$/, '');
  if (configured) return configured;
  const host = req.headers.get('host') || 'voidbuild.com';
  return `${host.includes('localhost') ? 'http' : 'https'}://${host}`;
}

async function findOrder(admin: any, url: URL) {
  const orderId = url.searchParams.get('orderId');
  const merchantReference = url.searchParams.get('OrderMerchantReference') || url.searchParams.get('merchant_reference') || url.searchParams.get('merchantReference');
  const trackingId = url.searchParams.get('OrderTrackingId') || url.searchParams.get('orderTrackingId');
  if (orderId) {
    const { data } = await admin.from('domain_orders').select('*').eq('id', orderId).limit(1).maybeSingle();
    return { order: data, trackingId: trackingId || data?.order_tracking_id };
  }
  const field = merchantReference ? 'merchant_reference' : 'order_tracking_id';
  const value = merchantReference || trackingId;
  if (!value) return { order: null, trackingId: null };
  const { data } = await admin.from('domain_orders').select('*').eq(field, value).limit(1).maybeSingle();
  return { order: data, trackingId: trackingId || data?.order_tracking_id };
}

async function handle(req: Request) {
  const origin = callbackOrigin(req);
  const url = new URL(req.url);
  try {
    const admin = getSupabaseAdmin();
    if (!admin) throw new Error('Domain service is not configured on the server.');
    const found = await findOrder(admin, url);
    const order = found.order;
    if (!order) throw new Error('Domain order not found.');
    if (!found.trackingId) throw new Error('Payment tracking ID is missing.');

    const { token, baseUrl } = await getPesapalToken();
    const payment = await getPesapalTransactionStatus(found.trackingId, token, baseUrl);
    const paymentStatus = payment?.payment_status_description || payment?.status || 'UNKNOWN';
    const paid = paymentStatus === 'COMPLETED' || payment?.payment_status === 1 || payment?.status_code === 1;

    await admin.from('domain_orders').update({
      order_tracking_id: found.trackingId,
      status: paid ? 'paid' : 'cancelled',
      payment_payload: payment,
      updated_at: new Date().toISOString(),
    }).eq('id', order.id);

    if (!paid) return Response.redirect(`${origin}/dashboard?domainOrder=failed`, 302);

    await admin.from('domain_orders').update({ status: 'registering', updated_at: new Date().toISOString() }).eq('id', order.id);
    const registration = order.action === 'renewal'
      ? await renewDomain(order.domain, order.years || 1)
      : await registerDomain(order.domain, order.registrant_details, order.years || 1);

    if (registration.status !== 'registered') {
      const failed = registration.status === 'failed';
      await admin.from('domain_orders').update({
        status: failed ? (order.action === 'renewal' ? 'renewal_failed' : 'registration_failed') : 'registering',
        registrar_order_id: registration.registrarOrderId || null,
        registrar_payload: registration.raw || {},
        ownership_details: registration.ownership || order.registrant_details,
        error_message: registration.error || (failed ? 'The registrar could not complete this order.' : 'The registrar is still completing this order.'),
        updated_at: new Date().toISOString(),
      }).eq('id', order.id);
      return Response.redirect(`${origin}/dashboard?domainOrder=${failed ? 'error' : 'pending'}&domain=${encodeURIComponent(order.domain)}`, 302);
    }

    const registrationDate = registration.registrationDate || new Date().toISOString();
    let status: DomainStatus = 'none';
    let hostingStatus = 'provider_unconfigured';
    let hostingVerification: unknown[] = [];
    let hostingError: string | null = null;

    if (isDomainProviderConfigured() && order.project_id) {
      try {
        const provider = await addDomainToHosting(order.domain);
        status = domainStatusFromProvider(provider);
        hostingStatus = status;
        hostingVerification = provider.verification || [];
        await updateProjectDomain(
          admin,
          order.project_id,
          order.user_id,
          domainRecordPayload({
            domain: order.domain,
            status,
            verification: provider.verification || [],
            error: null,
            connectedAt: registrationDate,
            verifiedAt: provider.verified ? new Date().toISOString() : null,
            removedAt: null,
          }),
        );
      } catch {
        hostingError = 'Domain registered, but hosting connection needs to be completed from Domain Center.';
      }
    } else {
      hostingError = 'Domain registered. Hosting connection will be available after hosting credentials are configured.';
    }

    await admin.from('domain_orders').update({
      status: status === 'none' ? 'registered' : status,
      registrar_order_id: registration.registrarOrderId || null,
      registrar_payload: registration.raw || {},
      ownership_details: registration.ownership || order.registrant_details,
      transfer_code: registration.transferCode || null,
      registration_date: registrationDate,
      expiry_date: registration.expiryDate || null,
      hosting_status: hostingStatus,
      hosting_verification: hostingVerification,
      error_message: hostingError,
      updated_at: new Date().toISOString(),
    }).eq('id', order.id);

    return Response.redirect(`${origin}/dashboard?domainOrder=success&domain=${encodeURIComponent(order.domain)}`, 302);
  } catch (error: any) {
    console.error('Domain order callback error:', error?.message || error);
    const admin = getSupabaseAdmin();
    const found = await findOrder(admin, url).catch(() => ({ order: null }));
    if (found.order?.id) {
      await admin?.from('domain_orders').update({ status: found.order.action === 'renewal' ? 'renewal_failed' : 'registration_failed', error_message: found.order.action === 'renewal' ? 'Renewal could not be completed. Please contact support before trying again.' : 'Registration could not be completed. Please contact support before placing another order.', updated_at: new Date().toISOString() }).eq('id', found.order.id);
    }
    return Response.redirect(`${origin}/dashboard?domainOrder=error`, 302);
  }
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
