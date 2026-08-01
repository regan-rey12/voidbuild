// VoidBuild Supabase Client - FIXED to debug env loading
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;
let warned = false;

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Debug log once
  if (!warned && typeof window !== 'undefined') {
    warned = true;
    console.log('[Supabase] URL exists:', !!url, 'Length:', url?.length, 'Has placeholder:', url?.includes('placeholder'));
    console.log('[Supabase] AnonKey exists:', !!anonKey, 'Length:', anonKey?.length);
    if (!url || !anonKey) {
      console.warn('[Supabase] Missing env vars. Check .env.local is in voidbuild/ root (same folder as package.json) and restart npm run dev');
    }
    if (url?.includes('placeholder') || anonKey?.includes('placeholder')) {
      console.warn('[Supabase] Env contains placeholder text - replace with real values from supabase.com dashboard Settings -> API');
    }
  }
  
  if (!url || !anonKey) {
    return null;
  }
  
  if (url.includes('placeholder') || anonKey.includes('placeholder') || url.includes('your-project') || anonKey.includes('your-anon')) {
    return null;
  }
  
  if (!supabase) {
    try {
      supabase = createClient(url, anonKey);
    } catch (e) {
      console.error('[Supabase] Failed to create client:', e);
      return null;
    }
  }
  return supabase;
}

export function isSupabaseConfigured(): boolean {
  const client = getSupabase();
  return !!client;
}
