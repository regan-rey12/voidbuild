// VoidBuild Pesapal Register IPN - Get IPN ID
export const runtime = 'nodejs';
import { getPesapalToken, registerPesapalIPN } from '@/lib/pesapal';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const host = req.headers.get('host') || 'voidbuild.com';
  const proto = host.includes('localhost') ? 'http' : 'https';
  const origin = req.headers.get('origin') || `${proto}://${host}`;
  const callbackUrl = url.searchParams.get('url') || `${origin}/api/pesapal/callback`;

  try {
    const { token, baseUrl } = await getPesapalToken();
    const result = await registerPesapalIPN(callbackUrl, token, baseUrl);
    
    return Response.json({
      success: true,
      message: 'IPN registered successfully',
      callbackUrl,
      result,
      ipn_id: result.ipn_id || result.ipnId || result.id,
      instruction: 'Add to Vercel Environment Variables: PESAPAL_IPN_ID',
    });
  } catch (e: any) {
    return Response.json({
      success: false,
      error: e.message,
      callbackUrl,
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}
