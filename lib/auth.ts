// VoidBuild Auth - Phone OTP + Email magic link + Google
// Uganda SMEs have phone, not always email - phone OTP is best

import { getSupabase } from './supabase';

export interface User {
  id: string;
  email?: string;
  phone?: string;
}

export async function getCurrentUser() {
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
  if (!supabase) throw new Error('Supabase not configured - add NEXT_PUBLIC_SUPABASE_URL and ANON_KEY to .env.local');
  
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    }
  });
  if (error) throw error;
  return { success: true, message: 'Magic link sent to email - check inbox (and spam)' };
}

export async function signInWithPhone(phone: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');
  
  // Supabase phone OTP requires Twilio or other SMS provider configured in Supabase dashboard
  // For Uganda, you would set up Africa's Talking or Twilio in Supabase Auth -> Phone
  // For MVP, if not configured, we fallback to demo mode
  const { error } = await supabase.auth.signInWithOtp({
    phone,
  });
  if (error) throw error;
  return { success: true, message: `OTP sent to ${phone} - enter code` };
}

export async function verifyPhoneOtp(phone: string, token: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');
  
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    }
  });
  if (error) throw error;
}

export async function signOut() {
  const supabase = getSupabase();
  if (!supabase) {
    localStorage.removeItem('voidbuild_user_demo');
    return;
  }
  await supabase.auth.signOut();
  // Also clear local demo
  localStorage.removeItem('voidbuild_user_demo');
}

// Demo mode for when Supabase not configured - local user via phone
export function getDemoUser(): User | null {
  try {
    const raw = localStorage.getItem('voidbuild_user_demo');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setDemoUser(user: User) {
  localStorage.setItem('voidbuild_user_demo', JSON.stringify(user));
}

export async function getEffectiveUser(): Promise<User | null> {
  const real = await getCurrentUser();
  if (real) return real;
  return getDemoUser();
}
