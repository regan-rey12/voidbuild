// VoidBuild Supabase Client
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  
  if (!url || !anonKey) return null;
  if (url.includes('placeholder') || anonKey.includes('placeholder') || anonKey.includes('YOUR_ANON_KEY')) return null;
  
  // Clean leading/trailing quotes, brackets, whitespace, and 'Bearer ' prefix
  const cleanUrl = url.replace(/^['"`\[\s]+/, '').replace(/['"`\]\s]+$/, '').trim();
  const cleanKey = anonKey.replace(/^['"`\[\s]+/, '').replace(/['"`\]\s]+$/, '').replace(/^Bearer\s+/i, '').trim();
  
  if (!cleanUrl.startsWith('http')) return null;
  if (!cleanKey || cleanKey.length < 20) return null;
  
  if (!supabase) {
    try {
      supabase = createClient(cleanUrl, cleanKey, {
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

export function isSupabaseConfigured(): boolean {
  return !!getSupabase();
}
