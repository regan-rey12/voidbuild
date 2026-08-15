// VoidBuild Auth - Email + Google (Supabase Authentication)
import { getSupabase } from './supabase';

export interface User {
  id: string;
  email?: string;
  phone?: string;
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getUser();
    return data.user ? { id: data.user.id, email: data.user.email, phone: data.user.phone } as User : null;
  } catch {
    return null;
  }
}

export async function signInWithEmail(email: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');
  
  const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_ORIGIN || 'https://voidbuild.com');
  
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    }
  });
  if (error) throw error;
  return { success: true, message: 'Sign-in link sent to your email. Please check your inbox and spam folder.' };
}

export async function signInWithGoogle() {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');
  
  const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_ORIGIN || 'https://voidbuild.com');
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    }
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

export async function getEffectiveUser(): Promise<User | null> {
  const real = await getCurrentUser();
  if (real) return real;
  return getDemoUser();
}
