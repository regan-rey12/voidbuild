export const runtime = 'nodejs';

import { getPesapalToken, createPesapalOrder, registerPesapalIPN } from '@/lib/pesapal';
import { authorizeDomainRequest, domainRecordPayload, updateProjectDomain } from '@/lib/domain-service';
import { getLiveDomainPrice, refreshRegistrarOrder } from '@/lib/domain-registrar';
import { addDomainToHosting, domainStatusFromProvider, isDomainProviderConfigured } from '@/lib/domain-provider';

 type RouteContext = { params: Promise<{ id: string }> };

function originFor(req: Request) {
  const configured = String(process.env.APP_ORIGIN || '').trim().replace(/\/$/, '');
  if (configured) return configured;
  const host = req.headers.get('host') || 'voidbuild.com';
  return `${host.includes('localhost') ? 'http' : 'https'}://${host}`;
}

function orderJson(order: any, redirectUrl?: string) {
  return {
    id: order.id,
    domain: order.domain,
    action: order.action,
    status: order.status,
    amount: order.amount,
    currency: order.currency,
    firstYearPrice: order.first_year_price,
    renewalPrice: order.renewal_price,
    years: order.years,
    registrant: order.registrant_details,
    ownership: order.ownership_details,
    transferCode: order.transfer_code,
    registrarOrderId: order.registrar_order_id,
    registrationDate: order.registration_date,
    expiryDate: order.expiry_date,
    hostingStatus: order.hosting_status,
    hostingVerification: order.hosting_verification || [],
    error: order.error_message,
    redirectUrl,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  };
}

async function refreshPendingOrder(admin: any, order: any) {
  if (order.status !== 'registering' || !order.registrar_order_id) return order;
  const refreshed = await refreshRegistrarOrder(order.domain, order.registrar_order_id, order.action === 'renewal' ? 'renewal' : 'registration');
  if (!refreshed || refreshed.status === 'pending') return order;

  if (refreshed.status === 'failed') {
    const failedStatus = order.action === 'renewal' ? 'renewal_failed' : 'registration_failed';
    await admin.from('domain_orders').update({
      status: failedStatus,
      registrar_payload: refreshed.raw || {},
      error_message: refreshed.error || 'The registrar could not complete this order.',
      updated_at: new Date().toISOString(),
    }).eq('id', order.id);
    return { ...order, status: failedStatus, registrar_payload: refreshed.raw || {}, error_message: refreshed.error || 'The registrar could not complete this order.' };
  }

  let orderStatus = 'registered';
  let hostingStatus = 'provider_unconfigured';
  let hostingVerification: unknown[] = [];
  let hostingError: string | null = null;
  if (isDomainProviderConfigured() && order.project_id) {
    try {
      const provider = await addDomainToHosting(order.domain);
      orderStatus = domainStatusFromProvider(provider);
      hostingStatus = orderStatus;
      hostingVerification = provider.verification || [];
      await updateProjectDomain(admin, order.project_id, order.user_id, domainRecordPayload({
        domain: order.domain,
        status: orderStatus as any,
        verification: provider.verification || [],
        error: null,
        connectedAt: order.registration_date || new Date().toISOString(),
        verifiedAt: provider.verified ? new Date().toISOString() : null,
        removedAt: null,
      }));
    } catch {
      hostingError = 'Domain registration completed, but hosting connection needs to be retried from Domain Center.';
    }
  } else {
    hostingError = 'Domain registration completed. Hosting connection will be available after hosting credentials are configured.';
  }

  const patch = {
    status: orderStatus,
    registrar_payload: refreshed.raw || {},
    registrar_order_id: refreshed.registrarOrderId || order.registrar_order_id,
    transfer_code: refreshed.transferCode || order.transfer_code || null,
    registration_date: order.registration_date || refreshed.registrationDate || new Date().toISOString(),
    expiry_date: refreshed.expiryDate || order.expiry_date || null,
    hosting_status: hostingStatus,
    hosting_verification: hostingVerification,
    error_message: hostingError,
    updated_at: new Date().toISOString(),
  };
  await admin.from('domain_orders').update(patch).eq('id', order.id);
  return { ...order, ...patch };
}

export async function GET(req: Request, context: RouteContext) {
  const auth = await authorizeDomainRequest(req, { requirePlan: false });
  if (auth.response) return auth.response;
  const { id } = await context.params;
  const { data, error } = await auth.admin.from('domain_orders').select('*').eq('id', id).eq('user_id', auth.user.id).limit(1).maybeSingle();
  if (error) return Response.json({ error: 'Unable to load this domain order.' }, { status: 500 });
  if (!data) return Response.json({ error: 'Domain order not found.' }, { status: 404 });
  const current = await refreshPendingOrder(auth.admin, data).catch(() => data);
  return Response.json({ order: orderJson(current) });
}

export async function POST(req: Request, context: RouteContext) {
  const auth = await authorizeDomainRequest(req);
  if (auth.response) return auth.response;
  const { id } = await context.params;

  let createdId: string | null = null;
  try {
    const { data: original, error } = await auth.admin.from('domain_orders').select('*').eq('id', id).eq('user_id', auth.user.id).limit(1).maybeSingle();
    if (error) throw new Error(error.message);
    if (!original) return Response.json({ error: 'Domain order not found.' }, { status: 404 });
    if (!['registered', 'pending_dns', 'active', 'renewal_due'].includes(original.status)) {
      return Response.json({ error: 'This domain is not ready for renewal.' }, { status: 409 });
    }

    const price = await getLiveDomainPrice(original.domain);
    if (!price.renewal) return Response.json({ error: 'Renewal pricing is not configured yet.' }, { status: 503 });
    const merchantReference = `voidbuild-renewal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const { data: renewal, error: insertError } = await auth.admin.from('domain_orders').insert({
      user_id: auth.user.id,
      project_id: original.project_id,
      parent_order_id: original.id,
      domain: original.domain,
      tld: original.tld,
      action: 'renewal',
      status: 'payment_pending',
      currency: price.currency,
      amount: price.renewal,
      first_year_price: original.first_year_price,
      renewal_price: price.renewal,
      years: 1,
      merchant_reference: merchantReference,
      provider: 'pesapal',
      registrar: original.registrar,
      registrant_details: original.registrant_details,
      ownership_details: original.ownership_details || {},
    }).select('*').single();
    if (insertError || !renewal) throw new Error(insertError?.message || 'Unable to create renewal order.');
    createdId = renewal.id;

    const { token, baseUrl } = await getPesapalToken();
    let notificationId = String(process.env.PESAPAL_IPN_ID || '').trim();
    if (!notificationId || notificationId.includes('your_')) {
      try {
        const ipn = await registerPesapalIPN(`${originFor(req)}/api/domain-orders/callback`, token, baseUrl);
        notificationId = ipn.ipn_id || ipn.ipnId || '';
      } catch {}
    }
    const payment = await createPesapalOrder({
      amount: price.renewal,
      currency: price.currency,
      description: `VoidBuild domain renewal: ${original.domain}`,
      callbackUrl: `${originFor(req)}/api/domain-orders/callback?orderId=${encodeURIComponent(createdId as string)}`, 
      notificationId,
      merchantReference,
      billingAddress: {
        email: original.registrant_details?.email || auth.user.email || 'hello@voidbuild.com',
        phone: original.registrant_details?.phone || auth.user.phone || '0751391318',
        firstName: original.registrant_details?.firstName || 'VoidBuild',
        lastName: original.registrant_details?.lastName || 'Customer',
      },
    }, token, baseUrl);
    if (!payment.redirect_url) throw new Error('Payment provider did not return a redirect URL.');

    await auth.admin.from('domain_orders').update({ order_tracking_id: payment.order_tracking_id || null, payment_payload: payment, updated_at: new Date().toISOString() }).eq('id', createdId);
    return Response.json({ success: true, order: orderJson(renewal, payment.redirect_url), orderTrackingId: payment.order_tracking_id, merchantReference });
  } catch (error: any) {
    if (createdId) await auth.admin.from('domain_orders').update({ status: 'cancelled', error_message: 'Renewal payment could not be started.', updated_at: new Date().toISOString() }).eq('id', createdId);
    return Response.json({ error: error?.message?.includes('Pesapal') ? 'Renewal payment could not be started. Please try again later.' : error?.message || 'Unable to start renewal.' }, { status: 500 });
  }
}
