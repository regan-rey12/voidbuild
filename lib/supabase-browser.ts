// Browser Supabase client for auth + user-scoped client reads/writes.
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  hasUsableSupabaseKey,
  hasUsableSupabaseUrl,
  readSupabaseAnonKey,
  readSupabaseUrl,
} from './supabase-env';

let supabase: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient | null {
  const url = readSupabaseUrl();
  const anonKey = readSupabaseAnonKey();

  if (!hasUsableSupabaseUrl(url) || !hasUsableSupabaseKey(anonKey)) return null;

  if (!supabase) {
    try {
      supabase = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          storageKey: 'voidbuild_supabase_auth',
        },
      });
    } catch {
      return null;
    }
  }

  return supabase;
}

export function isSupabaseBrowserConfigured(): boolean {
  return !!getSupabaseBrowser();
}
