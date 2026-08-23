// VoidBuild Auth - Email + Google (Supabase Authentication)
import { getSupabase } from './supabase';
import { clearCachedUserPlan } from './payments';

export interface User {
  id: string;
  email?: string;
  phone?: string;
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (user && !error) {
      return { id: user.id, email: user.email, phone: user.phone };
    }
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      return { id: session.user.id, email: session.user.email, phone: session.user.phone };
    }
    return null;
  } catch {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        return { id: session.user.id, email: session.user.email, phone: session.user.phone };
      }
    } catch {}
    return null;
  }
}

export async function signInWithEmail(email: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_ORIGIN || 'https://voidbuild.com';

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) throw error;
  return { success: true, message: 'Sign-in link sent to your email. Please check your inbox and spam folder.' };
}

export async function signInWithGoogle() {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_ORIGIN || 'https://voidbuild.com';

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) throw error;
}

export async function signOut() {
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {}
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem('voidbuild_user_demo');
    clearCachedUserPlan();
  }
}

export function getDemoUser(): User | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('voidbuild_user_demo');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setDemoUser(user: User) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('voidbuild_user_demo', JSON.stringify(user));
}

export async function getAccessToken(): Promise<string | null> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) return session.access_token;
    } catch {}
  }

  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('voidbuild_supabase_auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.access_token) return parsed.access_token;
      if (parsed?.currentSession?.access_token) return parsed.currentSession.access_token;
      if (Array.isArray(parsed) && parsed[0]?.access_token) return parsed[0].access_token;
    }
  } catch {}

  return null;
}

export async function getEffectiveUser(): Promise<User | null> {
  const real = await getCurrentUser();
  if (real) return real;
  return getDemoUser();
}
