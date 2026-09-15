export const runtime = 'nodejs';

import { getPesapalToken, createPesapalOrder, registerPesapalIPN } from '@/lib/pesapal';
import { getAuthenticatedUserFromRequest } from '@/lib/auth-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { normalizeCustomDomain } from '@/lib/domain-provider';
import { getPaidDomainPlan, getOwnedProject } from '@/lib/domain-service';
import {
  getDomainEnding,
  searchDomains,
  validateRegistrant,
} from '@/lib/domain-registrar';

function safeOrigin(req: Request) {
  const configured = String(process.env.APP_ORIGIN || '').trim().replace(/\/$/, '');
  if (configured) return configured;
  const host = req.headers.get('host') || 'voidbuild.com';
  return `${host.includes('localhost') ? 'http' : 'https'}://${host}`;
}

function jsonOrder(order: any, redirectUrl?: string) {
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
    expiryDate: order.expiry_date,
    hostingStatus: order.hosting_status,
    redirectUrl,
    createdAt: order.created_at,
  };
}

export async function GET(req: Request) {
  const auth = await getAuthenticatedUserFromRequest(req);
  if (!auth?.id) return Response.json({ error: 'Please sign in again.' }, { status: 401 });
  const admin = getSupabaseAdmin();
  if (!admin) return Response.json({ error: 'Domain service is not configured on the server.' }, { status: 503 });
  const projectId = new URL(req.url).searchParams.get('projectId');
  let query = admin.from('domain_orders').select('id, project_id, domain, action, status, amount, currency, expiry_date, registration_date, transfer_code, registrar_order_id, registrant_details, ownership_details, hosting_status, hosting_verification, error_message, created_at, updated_at').eq('user_id', auth.id).order('created_at', { ascending: false }).limit(50);
  if (projectId) query = query.eq('project_id', projectId);
  const { data, error } = await query;
  if (error) return Response.json({ error: 'Unable to load domain orders.' }, { status: 500 });
  return Response.json({ orders: (data || []).map((order: any) => ({
    id: order.id,
    projectId: order.project_id,
    domain: order.domain,
    action: order.action,
    status: order.status,
    amount: order.amount,
    currency: order.currency,
    expiryDate: order.expiry_date,
    registrationDate: order.registration_date,
    transferCode: order.transfer_code,
    registrarOrderId: order.registrar_order_id,
    registrant: order.registrant_details,
    ownership: order.ownership_details,
    hostingStatus: order.hosting_status,
    hostingVerification: order.hosting_verification || [],
    error: order.error_message,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  })) });
}

export async function POST(req: Request) {
  let orderId: string | null = null;
  try {
    const authUser = await getAuthenticatedUserFromRequest(req);
    if (!authUser?.id) return Response.json({ error: 'Please sign in before buying a domain.' }, { status: 401 });

    const admin = getSupabaseAdmin();
    if (!admin) return Response.json({ error: 'Domain service is not configured on the server.' }, { status: 503 });
    if (!(await getPaidDomainPlan(admin, authUser.id))) {
      return Response.json({ error: 'Domain Center is available on Business and Pro plans.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const projectId = String(body.projectId || '').trim();
    const normalized = normalizeCustomDomain(body.domain);
    const registrant = validateRegistrant(body.registrant);
    if (!projectId) return Response.json({ error: 'projectId is required.' }, { status: 400 });
    if (normalized.error || !normalized.domain) return Response.json({ error: normalized.error }, { status: 400 });
    if (registrant.error || !registrant.contact) return Response.json({ error: registrant.error }, { status: 400 });

    const ending = getDomainEnding(normalized.domain);
    if (ending !== '.com') return Response.json({ error: 'New-domain registration currently supports .com domains.' }, { status: 400 });
    const project = await getOwnedProject(admin, projectId, authUser.id);
    if (!project) return Response.json({ error: 'Website not found.' }, { status: 404 });
    if (project.custom_domain && project.custom_domain !== normalized.domain) {
      return Response.json({ error: 'Disconnect the current custom domain before buying a different one for this website.' }, { status: 409 });
    }

    const { data: existingOrder } = await admin
      .from('domain_orders')
      .select('id, status')
      .eq('domain', normalized.domain)
      .in('status', ['payment_pending', 'paid', 'registering', 'registered', 'pending_dns', 'active'])
      .limit(1)
      .maybeSingle();
    if (existingOrder?.id) return Response.json({ error: 'That domain already has an active or pending order.' }, { status: 409 });

    const search = await searchDomains([normalized.domain]);
    const result = search[0];
    if (!result || result.available === false) return Response.json({ error: 'That domain is not available.' }, { status: 409 });
    if (result.available !== true) return Response.json({ error: 'Domain availability could not be confirmed yet.' }, { status: 503 });
    if (result.firstYear === null || result.renewal === null) return Response.json({ error: 'Live pricing for this domain is not available yet.' }, { status: 503 });

    const price = {
      currency: result.currency,
      firstYear: result.firstYear,
      renewal: result.renewal,
    };
    const merchantReference = `voidbuild-domain-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const { data: createdOrder, error: insertError } = await admin
      .from('domain_orders')
      .insert({
        user_id: authUser.id,
        project_id: projectId,
        domain: normalized.domain,
        tld: ending,
        action: 'registration',
        status: 'payment_pending',
        currency: price.currency,
        amount: price.firstYear,
        first_year_price: price.firstYear,
        renewal_price: price.renewal,
        years: 1,
        merchant_reference: merchantReference,
        provider: 'pesapal',
        registrar: result.registrar,
        registrant_details: registrant.contact,
      })
      .select('*')
      .single();
    if (insertError || !createdOrder) throw new Error(insertError?.message || 'Unable to create domain order.');
    orderId = createdOrder.id;

    const { token, baseUrl } = await getPesapalToken();
    let notificationId = String(process.env.PESAPAL_IPN_ID || '').trim();
    if (!notificationId || notificationId.includes('your_')) {
      try {
        const ipn = await registerPesapalIPN(`${safeOrigin(req)}/api/domain-orders/callback`, token, baseUrl);
        notificationId = ipn.ipn_id || ipn.ipnId || '';
      } catch {}
    }

    const payment = await createPesapalOrder(
      {
        amount: price.firstYear,
        currency: price.currency,
        description: `VoidBuild domain registration: ${normalized.domain}`,
        callbackUrl: `${safeOrigin(req)}/api/domain-orders/callback?orderId=${encodeURIComponent(orderId as string)}`, 
        notificationId,
        merchantReference,
        billingAddress: {
          email: registrant.contact.email,
          phone: registrant.contact.phone,
          firstName: registrant.contact.firstName,
          lastName: registrant.contact.lastName,
        },
      },
      token,
      baseUrl,
    );

    if (!payment.redirect_url) throw new Error('Payment provider did not return a redirect URL.');
    await admin
      .from('domain_orders')
      .update({ order_tracking_id: payment.order_tracking_id || null, status: 'payment_pending', payment_payload: payment, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    return Response.json({ success: true, order: jsonOrder(createdOrder, payment.redirect_url), orderTrackingId: payment.order_tracking_id, merchantReference });
  } catch (error: any) {
    if (orderId) {
      const admin = getSupabaseAdmin();
      await admin?.from('domain_orders').update({ status: 'cancelled', error_message: 'Payment could not be started.', updated_at: new Date().toISOString() }).eq('id', orderId);
    }
    const message = error?.message === 'registrar_unconfigured'
      ? 'The selected registrar is not configured yet.'
      : error?.message?.includes('Pesapal')
      ? 'Domain payment could not be started. Please try again later.'
      : error?.message || 'Unable to start the domain order.';
    return Response.json({ error: message }, { status: error?.message?.includes('Pesapal') ? 502 : 500 });
  }
}
