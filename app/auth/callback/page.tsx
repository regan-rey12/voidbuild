"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';

export default function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setStatus('error');
      setMessage('Supabase not configured');
      return;
    }

    const handleCallback = async () => {
      try {
        // Parse hash params if available (access_token & refresh_token from OAuth)
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          if (accessToken && refreshToken) {
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (!setSessionError) {
              setStatus('success');
              setTimeout(() => {
                window.location.href = '/dashboard';
              }, 800);
              return;
            }
          }
        }

        // Supabase handles PKCE code exchange automatically via URL search params
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data.session) {
          setStatus('success');
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 800);
          return;
        }

        // Wait a bit for session to be established
        let attempts = 0;
        while (attempts < 8) {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session) {
            setStatus('success');
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 800);
            return;
          }
          await new Promise(r => setTimeout(r, 400));
          attempts++;
        }

        // Check for error in URL
        const search = window.location.search;
        if (hash.includes('error') || search.includes('error')) {
          throw new Error('Sign-in link expired or already used. Request a new link.');
        }

        // If session established or fallback, proceed to dashboard
        setStatus('success');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 800);
      } catch (e: any) {
        setStatus('error');
        setMessage(e.message || 'Failed to sign in. Please request a new link.');
      }
    };

    handleCallback();
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
            <div className="mt-4 font-bold text-gray-900">Signing you in...</div>
            <div className="text-sm text-gray-500 mt-1">Verifying your account, please wait</div>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto text-xl">✓</div>
            <div className="mt-4 font-bold text-gray-900">Signed in successfully!</div>
            <div className="text-sm text-gray-500 mt-1">Redirecting to your dashboard...</div>
            <Link href="/dashboard" className="mt-6 inline-flex px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-black transition">Go to Dashboard →</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-xl">✕</div>
            <div className="mt-4 font-bold text-gray-900">Sign in failed</div>
            <div className="text-sm text-gray-600 mt-2 max-w-sm mx-auto">{message}</div>
            <div className="mt-6 flex flex-col gap-2">
              <Link href="/auth" className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-black transition">Try Again - Sign In</Link>
              <Link href="/builder" className="w-full py-2.5 rounded-xl bg-gray-100 text-sm font-semibold hover:bg-gray-200 transition">Continue to Builder</Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
