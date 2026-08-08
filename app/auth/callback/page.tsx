"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '../../../lib/supabase';

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
        // Supabase handles PKCE code exchange automatically via URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        // Wait a bit for session to be established from URL hash
        let attempts = 0;
        while (attempts < 10) {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session) {
            setStatus('success');
            setTimeout(() => window.location.href = '/dashboard', 1500);
            return;
          }
          await new Promise(r => setTimeout(r, 500));
          attempts++;
        }

        // Check for error in URL
        const hash = window.location.hash;
        const search = window.location.search;
        if (hash.includes('error') || search.includes('error')) {
          throw new Error('Sign-in link expired or already used. Request new link.');
        }

        // If no session after retries, still redirect to dashboard, guest mode will handle
        setStatus('success');
        setTimeout(() => window.location.href = '/dashboard', 1500);
      } catch (e: any) {
        setStatus('error');
        setMessage(e.message || 'Failed to sign in - link may have expired');
      }
    };

    handleCallback();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border shadow-sm p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin mx-auto"></div>
            <div className="mt-4 font-bold">Signing you in...</div>
            <div className="text-sm text-gray-500 mt-1">Verifying your sign-in link, please wait</div>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto text-xl">✓</div>
            <div className="mt-4 font-bold">Signed in successfully!</div>
            <div className="text-sm text-gray-500 mt-1">Redirecting to dashboard...</div>
            <Link href="/dashboard" className="mt-6 inline-flex px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold">Go to Dashboard →</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-xl">✕</div>
            <div className="mt-4 font-bold">Sign in failed</div>
            <div className="text-sm text-gray-600 mt-2 max-w-sm mx-auto">{message}</div>
            <div className="mt-6 flex flex-col gap-2">
              <Link href="/auth" className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold">Try Again - Request New Link</Link>
              <Link href="/builder" className="w-full py-2.5 rounded-xl bg-gray-100 text-sm font-semibold">Continue as Guest to Builder</Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
