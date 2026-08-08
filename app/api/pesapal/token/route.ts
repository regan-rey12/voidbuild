// Debug endpoint to test Pesapal auth - GET returns token if configured
export const runtime = 'nodejs';
import { getPesapalToken } from '../../../lib/pesapal';

export async function GET() {
  try {
    const token = await getPesapalToken();
    return Response.json({ success: true, token: token.slice(0, 20) + '...', length: token.length, message: 'Pesapal auth OK - token obtained' });
  } catch (e: any) {
    return Response.json({ success: false, error: e.message, hint: 'Add PESAPAL_CONSUMER_KEY and SECRET to .env.local from pesapal.com/ug' }, { status: 500 });
  }
}
