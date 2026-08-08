// VoidBuild Supabase Client
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  
  if (!url || !anonKey) return null;
  if (url.includes('placeholder') || url.includes('[')) return null;
  
  const cleanUrl = url.replace(/^\[/, '').replace(/\]\(.*\)$/, '').trim();
  const cleanKey = anonKey.replace(/^\[/, '').trim();
  
  if (!cleanUrl.startsWith('http')) return null;
  
  if (!supabase) {
    try {
      supabase = createClient(cleanUrl, cleanKey);
    } catch {
      return null;
    }
  }
  return supabase;
}

export function isSupabaseConfigured(): boolean {
  return !!getSupabase();
}
