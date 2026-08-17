"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { claimLocalProjects } from '@/lib/projects';
import { syncUserPlanWithCloud } from '@/lib/payments';

export default function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setStatus('error');
      setMessage('Supabase is not configured. Please check your environment variables.');
      return;
    }

    let isMounted = true;

    const handleAuth = async () => {
      try {
        const url = new URL(window.location.href);
        const searchParams = url.searchParams;
        const hash = window.location.hash.replace(/^#/, '');
        const hashParams = new URLSearchParams(hash);

        // Check for error parameters in query or hash
        const errorParam = searchParams.get('error') || hashParams.get('error');
        const errorDesc = searchParams.get('error_description') || hashParams.get('error_description');
        if (errorParam || errorDesc) {
          throw new Error(errorDesc || errorParam || 'Authentication link is invalid or expired.');
        }

        // 1. Check for PKCE Authorization Code (?code=...)
        const code = searchParams.get('code');
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          if (data?.session?.user) {
            await finalizeAuth(data.session.user.id);
            return;
          }
        }

        // 2. Check for OAuth / Magic Link hash tokens (#access_token=...&refresh_token=...)
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        if (accessToken && refreshToken) {
          const { data, error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (setSessionError) throw setSessionError;
          if (data?.session?.user) {
            await finalizeAuth(data.session.user.id);
            return;
          }
        }

        // 3. Check existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await finalizeAuth(session.user.id);
          return;
        }

        // 4. Listen for auth state change event
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          if (newSession?.user && isMounted) {
            subscription.unsubscribe();
            await finalizeAuth(newSession.user.id);
          }
        });

        // 5. Polling fallback for up to 6 seconds
        let attempts = 0;
        while (attempts < 12 && isMounted) {
          await new Promise(r => setTimeout(r, 500));
          const { data: { session: pollSession } } = await supabase.auth.getSession();
          if (pollSession?.user) {
            subscription.unsubscribe();
            await finalizeAuth(pollSession.user.id);
            return;
          }
          attempts++;
        }

        subscription.unsubscribe();
        throw new Error('Could not establish secure session. Please request a new sign-in link.');
      } catch (err: any) {
        if (!isMounted) return;
        setStatus('error');
        setMessage(err.message || 'Sign in failed. Please try again.');
      }
    };

    const finalizeAuth = async (userId: string) => {
      if (!isMounted) return;
      try {
        await claimLocalProjects(userId);
        await syncUserPlanWithCloud(userId);
      } catch {}
      setStatus('success');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 600);
    };

    handleAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border shadow-sm p-8 text-center">
        <div className="flex justify-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5 hover:opacity-90 transition">
            <img src="/logo.png" alt="VoidBuild" className="w-9 h-9 object-contain flex-shrink-0" />
            <span className="font-extrabold text-lg text-gray-900 tracking-tight">voidbuild</span>
          </Link>
        </div>

        {status === 'loading' && (
          <>
            <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin mx-auto"></div>
            <div className="mt-4 font-bold text-gray-900 text-base">Signing you in...</div>
            <div className="text-xs text-gray-500 mt-1">Verifying your account session, please wait</div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto text-xl font-bold">✓</div>
            <div className="mt-4 font-bold text-gray-900 text-base">Signed in successfully!</div>
            <div className="text-xs text-gray-500 mt-1">Redirecting to your dashboard...</div>
            <Link href="/dashboard" className="mt-6 inline-flex px-6 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-black transition shadow-sm">
              Go to Dashboard →
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-xl font-bold">✕</div>
            <div className="mt-4 font-bold text-gray-900 text-base">Sign in failed</div>
            <div className="text-xs text-gray-600 mt-2 max-w-sm mx-auto leading-relaxed bg-red-50 p-3 rounded-xl border border-red-200 text-red-700">
              {message}
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <Link href="/auth" className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-black transition shadow-sm">
                Request New Sign-in Link
              </Link>
              <Link href="/" className="w-full py-2.5 rounded-xl bg-gray-100 text-xs font-semibold hover:bg-gray-200 transition">
                Return Home
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
