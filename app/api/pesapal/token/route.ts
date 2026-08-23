// Debug endpoint to test Pesapal auth - GET returns token if configured
export const runtime = 'nodejs';
import { getPesapalToken } from '@/lib/pesapal';

export async function GET() {
  try {
    const { token, baseUrl } = await getPesapalToken();
    return Response.json({
      success: true,
      environment: baseUrl.includes('cybqa') ? 'sandbox' : 'live',
      baseUrl,
      token: token.slice(0, 20) + '...',
      length: token.length,
      message: 'Pesapal auth OK - token obtained successfully'
    });
  } catch (e: any) {
    return Response.json({
      success: false,
      error: e.message,
    }, { status: 500 });
  }
}
