// VoidBuild Pesapal Order - Automated payments for Uganda SMEs (MTN MoMo, Airtel, Cards)
export const runtime = 'nodejs';

import { getPesapalToken, createPesapalOrder, registerPesapalIPN } from '@/lib/pesapal';
import { PLANS, Plan } from '@/lib/payments';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const plan = (body.plan || 'business') as Plan;
    const email = body.email || 'hello@voidbuild.com';
    const phone = body.phone || '256751391318';

    if (!PLANS[plan] || PLANS[plan].price === 0) {
      return Response.json({ error: 'Please select a paid plan to upgrade' }, { status: 400 });
    }

    const selectedPlan = PLANS[plan];
    const origin = process.env.APP_ORIGIN || process.env.NEXT_PUBLIC_APP_ORIGIN || 'http://localhost:3000';
    const merchantReference = `voidbuild-${plan}-${Date.now()}`;

    const token = await getPesapalToken();

    let notificationId = process.env.PESAPAL_IPN_ID || process.env.NEXT_PUBLIC_PESAPAL_IPN_ID || '';
    if (!notificationId || notificationId.includes('placeholder')) {
      try {
        const callbackUrl = `${origin}/api/pesapal/callback`;
        const ipnResult = await registerPesapalIPN(callbackUrl, token);
        notificationId = ipnResult.ipn_id || ipnResult.ipnId || '';
      } catch {
        notificationId = '';
      }
    }

    const callbackUrl = `${origin}/api/pesapal/callback?merchant_reference=${merchantReference}&plan=${plan}`;
    const finalAmount = selectedPlan.price;

    try {
      const order = await createPesapalOrder({
        amount: finalAmount,
        currency: 'UGX',
        description: `VoidBuild ${selectedPlan.name} Plan - ${selectedPlan.limit} Websites`,
        callbackUrl,
        notificationId: notificationId || '',
        merchantReference,
        billingAddress: { email, phone, firstName: 'VoidBuild', lastName: 'Customer' },
      }, token);

      if (!order.redirect_url) throw new Error('No checkout link returned from Pesapal');

      return Response.json({
        success: true,
        orderTrackingId: order.order_tracking_id,
        merchantReference: order.merchant_reference,
        redirectUrl: order.redirect_url,
        plan,
        amount: finalAmount,
        amountUGX: selectedPlan.priceUGX,
      });
    } catch (orderErr: any) {
      throw orderErr;
    }

  } catch (e: any) {
    console.error('Pesapal order error:', e.message);
    let userMsg = 'Payment checkout is momentarily unavailable. Please try again shortly or contact support on WhatsApp (+256 751 391318).';
    if (e.message && e.message.includes('not configured')) {
      userMsg = 'Payment gateway is currently in maintenance. Please contact support on WhatsApp (+256 751 391318) for instant activation.';
    }
    return Response.json({ 
      error: userMsg,
    }, { status: 500 });
  }
}
