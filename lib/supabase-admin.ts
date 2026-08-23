import 'server-only';

// Service-role client for trusted server-side operations only.
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  hasUsableSupabaseKey,
  hasUsableSupabaseUrl,
  readSupabaseServiceRoleKey,
  readSupabaseUrl,
} from './supabase-env';

let supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = readSupabaseUrl();
  const serviceRoleKey = readSupabaseServiceRoleKey();

  if (!hasUsableSupabaseUrl(url) || !hasUsableSupabaseKey(serviceRoleKey)) return null;

  if (!supabaseAdmin) {
    try {
      supabaseAdmin = createClient(url, serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    } catch {
      return null;
    }
  }

  return supabaseAdmin;
}
