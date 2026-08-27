// Protected debug endpoint to test Pesapal auth
export const runtime = 'nodejs';
import { getPesapalToken } from '@/lib/pesapal';
import { requireAdminDebugAccess } from '@/lib/admin-guard';

export async function GET(req: Request) {
  const denied = requireAdminDebugAccess(req);
  if (denied) return denied;

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
