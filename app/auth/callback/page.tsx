"use client";
import { useEffect } from 'react';
import { getSupabase } from '../../../lib/supabase';

export default function AuthCallback() {
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      window.location.href = '/dashboard';
      return;
    }
    // Supabase automatically handles the callback via URL hash
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        window.location.href = '/dashboard';
      } else {
        setTimeout(() => window.location.href = '/dashboard', 2000);
      }
    };
    check();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin mx-auto"></div>
        <div className="mt-4 font-bold text-sm">Signing you in...</div>
        <div className="text-xs text-gray-500 mt-1">Please wait, redirecting to dashboard</div>
      </div>
    </main>
  );
}
