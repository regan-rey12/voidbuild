import 'server-only';

import { getSupabaseServer } from './supabase-server';

export interface AuthenticatedRequestUser {
  id: string;
  email?: string;
  phone?: string;
}

function getBearerToken(req: Request): string | null {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export async function getAuthenticatedUserFromRequest(req: Request): Promise<AuthenticatedRequestUser | null> {
  const token = getBearerToken(req);
  const supabase = getSupabaseServer();

  if (!token || !supabase) return null;

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) return null;

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
    };
  } catch {
    return null;
  }
}
