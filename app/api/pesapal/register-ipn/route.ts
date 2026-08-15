// VoidBuild Pesapal Register IPN - Get IPN ID
// Call this once to register your callback URL and get IPN ID
// GET /api/pesapal/register-ipn?url=https://yourdomain.com/api/pesapal/callback

export const runtime = 'nodejs';
import { getPesapalToken, registerPesapalIPN } from '@/lib/pesapal';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const callbackUrl = url.searchParams.get('url') || `${process.env.APP_ORIGIN || 'http://localhost:3000'}/api/pesapal/callback`;

  try {
    const token = await getPesapalToken();
    const result = await registerPesapalIPN(callbackUrl, token);
    
    return Response.json({
      success: true,
      message: 'IPN registered successfully - Save the ipn_id below to .env.local as PESAPAL_IPN_ID',
      callbackUrl,
      result,
      ipn_id: result.ipn_id || result.ipnId || result.id,
      instruction: 'Add to .env.local: PESAPAL_IPN_ID=your-ipn-id-here and NEXT_PUBLIC_PESAPAL_IPN_ID=your-ipn-id-here',
    });
  } catch (e: any) {
    return Response.json({
      success: false,
      error: e.message,
      hint: 'Make sure PESAPAL_CONSUMER_KEY and SECRET are set in .env.local. For sandbox, use PESAPAL_BASE_URL=https://cybqa.pesapal.com/pesapalv3',
      callbackUrl,
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}
