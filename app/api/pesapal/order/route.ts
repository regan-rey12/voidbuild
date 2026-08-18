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
    const host = req.headers.get('host') || 'voidbuild.com';
    const proto = host.includes('localhost') ? 'http' : 'https';
    const origin = req.headers.get('origin') || `${proto}://${host}`;
    const merchantReference = `voidbuild-${plan}-${Date.now()}`;

    // If Pesapal credentials not yet entered in Vercel, smoothly route to Kampala VIP WhatsApp for instant manual MoMo activation
    const hasKeys = process.env.PESAPAL_CONSUMER_KEY && 
      process.env.PESAPAL_CONSUMER_SECRET && 
      !process.env.PESAPAL_CONSUMER_KEY.includes('placeholder') &&
      !process.env.PESAPAL_CONSUMER_KEY.includes('your_');

    if (!hasKeys) {
      const waUrl = `https://wa.me/256751391318?text=${encodeURIComponent(
        `Hello VoidBuild Kampala, I would like to upgrade my site to the ${selectedPlan.name} Plan (UGX ${selectedPlan.priceUGX}/mo). Please provide MTN MoMo / Airtel payment instructions.`
      )}`;
      return Response.json({
        success: true,
        redirectUrl: waUrl,
        plan,
        amountUGX: selectedPlan.priceUGX,
      });
    }

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

    const order = await createPesapalOrder({
      amount: finalAmount,
      currency: 'UGX',
      description: `VoidBuild ${selectedPlan.name} Plan - ${selectedPlan.limit} Websites`,
      callbackUrl,
      notificationId: notificationId || '',
      merchantReference,
      billingAddress: { email, phone, firstName: 'VoidBuild', lastName: 'Customer' },
    }, token);

    if (!order.redirect_url) {
      const waUrl = `https://wa.me/256751391318?text=${encodeURIComponent(
        `Hello VoidBuild Kampala, I want to upgrade to ${selectedPlan.name} Plan (UGX ${selectedPlan.priceUGX}).`
      )}`;
      return Response.json({ success: true, redirectUrl: waUrl });
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
    const waUrl = `https://wa.me/256751391318?text=${encodeURIComponent(
      `Hello VoidBuild, I would like to upgrade my website plan via MTN MoMo / Airtel Money (+256 751 391318).`
    )}`;
    return Response.json({ 
      success: true,
      redirectUrl: waUrl,
    });
  }
}
