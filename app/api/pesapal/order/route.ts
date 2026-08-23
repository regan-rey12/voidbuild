// VoidBuild Pesapal Order API - Direct Automated Payments (MTN MoMo, Airtel, Cards)
export const runtime = 'nodejs';

import { getPesapalToken, createPesapalOrder, registerPesapalIPN } from '@/lib/pesapal';
import { PLANS, Plan } from '@/lib/payments';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const plan = (body.plan || 'business') as Plan;
    const email = (body.email || 'hello@voidbuild.com').trim();
    const phone = (body.phone || '0751391318').trim();

    if (!PLANS[plan] || PLANS[plan].price === 0) {
      return Response.json({ error: 'Please select a paid plan to upgrade' }, { status: 400 });
    }

    const selectedPlan = PLANS[plan];
    const host = req.headers.get('host') || 'voidbuild.com';
    const proto = host.includes('localhost') ? 'http' : 'https';
    const origin = req.headers.get('origin') || `${proto}://${host}`;
    const merchantReference = `voidbuild-${plan}-${Date.now()}`;

    // 1. Get Pesapal Access Token with auto-environment detection
    const { token, baseUrl } = await getPesapalToken();

    // 2. Resolve IPN Notification ID
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

    const callbackUrl = `${origin}/api/pesapal/callback?merchant_reference=${merchantReference}&plan=${plan}`;
    const finalAmount = selectedPlan.price;

    // 3. Submit Pesapal Order
    const order = await createPesapalOrder({
      amount: finalAmount,
      currency: 'UGX',
      description: `VoidBuild ${selectedPlan.name} Plan - ${selectedPlan.limit} Websites`,
      callbackUrl,
      notificationId: notificationId || '',
      merchantReference,
      billingAddress: { email, phone, firstName: 'VoidBuild', lastName: 'Customer' },
    }, token, baseUrl);

    if (!order.redirect_url) {
      throw new Error(`Pesapal did not return a redirect URL. Response: ${JSON.stringify(order)}`);
    }

    return Response.json({
      success: true,
      orderTrackingId: order.order_tracking_id,
      merchantReference: order.merchant_reference,
      redirectUrl: order.redirect_url,
      plan,
      amount: finalAmount,
      amountUGX: selectedPlan.priceUGX,
    });

  } catch (e: any) {
    console.error('Pesapal order error:', e.message);
    return Response.json({ 
      error: e.message || 'Payment initiation failed. Please check Pesapal credentials.',
    }, { status: 500 });
  }
}
