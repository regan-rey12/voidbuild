// VoidBuild Pesapal Callback - Handles redirect and IPN after payment
export const runtime = 'nodejs';

import { getPesapalToken, getPesapalTransactionStatus } from '@/lib/pesapal';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderTrackingId = url.searchParams.get('OrderTrackingId') || url.searchParams.get('orderTrackingId');
  const merchantReference = url.searchParams.get('OrderMerchantReference') || url.searchParams.get('merchant_reference') || url.searchParams.get('merchantReference');
  const plan = url.searchParams.get('plan') as any;

  const host = req.headers.get('host') || 'voidbuild.com';
  const proto = host.includes('localhost') ? 'http' : 'https';
  const origin = req.headers.get('origin') || `${proto}://${host}`;

  if (!orderTrackingId) {
    return Response.redirect(`${origin}/dashboard?payment=failed`, 302);
  }

  try {
    const { token, baseUrl } = await getPesapalToken();
    const statusData = await getPesapalTransactionStatus(orderTrackingId, token, baseUrl);

    const paymentStatus = statusData?.payment_status_description || statusData?.status || 'UNKNOWN';
    const isCompleted = paymentStatus === 'COMPLETED' || statusData?.payment_status === 1 || statusData?.status_code === 1;

    if (isCompleted) {
      return Response.redirect(`${origin}/dashboard?payment=success&plan=${plan || 'business'}&tracking=${orderTrackingId}&merchant=${merchantReference}`, 302);
    } else {
      return Response.redirect(`${origin}/dashboard?payment=failed&status=${paymentStatus}`, 302);
    }
  } catch (e: any) {
    console.error('Pesapal callback error:', e.message);
    return Response.redirect(`${origin}/dashboard?payment=error&message=${encodeURIComponent(e.message)}`, 302);
  }
}

export async function POST(req: Request) {
  return GET(req);
}
