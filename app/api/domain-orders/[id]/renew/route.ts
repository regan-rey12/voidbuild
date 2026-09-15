export const runtime = 'nodejs';

import { POST as renewDomainOrder } from '../route';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: Request, context: RouteContext) {
  return renewDomainOrder(req, context);
}
