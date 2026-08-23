import 'server-only';

// Server-side anon client for request-safe reads when service role is not required.
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  hasUsableSupabaseKey,
  hasUsableSupabaseUrl,
  readSupabaseAnonKey,
  readSupabaseUrl,
} from './supabase-env';

let supabaseServer: SupabaseClient | null = null;

export function getSupabaseServer(): SupabaseClient | null {
  const url = readSupabaseUrl();
  const anonKey = readSupabaseAnonKey();

  if (!hasUsableSupabaseUrl(url) || !hasUsableSupabaseKey(anonKey)) return null;

  if (!supabaseServer) {
    try {
      supabaseServer = createClient(url, anonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    } catch {
      return null;
    }
  }

  return supabaseServer;
}
