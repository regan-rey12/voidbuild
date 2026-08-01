"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signInWithEmail, signInWithGoogle, getCurrentUser } from '../../lib/auth';
import { getSupabase } from '../../lib/supabase';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'sent'>('form');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const isConfigured = !!getSupabase();

  useEffect(() => {
    getCurrentUser().then(u => {
      if (u) window.location.href = '/dashboard';
    });
  }, []);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await signInWithEmail(email);
      setMessage(res.message);
      setStep('sent');
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl border shadow-sm p-6 md:p-8">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold mx-auto">V</div>
          <h1 className="mt-4 text-xl font-bold">Sign in to VoidBuild</h1>
          <p className="mt-1 text-sm text-gray-600">Save your websites, access on phone & laptop. Free.</p>
          {!isConfigured && (
            <div className="mt-3 text-xs bg-red-50 border border-red-200 rounded-lg p-2.5 text-red-700">
              Supabase not configured - add NEXT_PUBLIC_SUPABASE_URL and ANON_KEY to .env.local for real auth
            </div>
          )}
        </div>

        {step === 'form' && (
          <div className="mt-8 space-y-5">
            <button onClick={handleGoogle} disabled={loading || !isConfigured} className="w-full py-3 rounded-xl bg-white border border-gray-200 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm">
              <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">G</span>
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">OR</span></div>
            </div>

            <form onSubmit={handleEmail} className="space-y-3">
              <label className="text-xs font-semibold text-gray-700">Email — Magic Link (no password needed)</label>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@gmail.com" type="email" required className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900" />
              <button disabled={loading} className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-bold disabled:opacity-50 hover:bg-black">
                {loading ? 'Sending...' : 'Send Magic Link to Email →'}
              </button>
              <div className="text-[11px] text-gray-500 text-center">No password. Click link in email to sign in. Works on phone & laptop.</div>
            </form>

            <div className="text-center pt-2">
              <Link href="/builder" className="text-xs text-gray-500 hover:underline">Skip for now — Continue as guest to builder</Link>
            </div>
          </div>
        )}

        {step === 'sent' && (
          <div className="mt-8 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto text-xl">✓</div>
            <div className="font-bold mt-4">Check your email</div>
            <div className="text-sm text-gray-600 mt-2 max-w-sm mx-auto">{message}</div>
            <div className="mt-2 text-xs text-gray-500">Check spam folder. Link expires in 1 hour.</div>
            <div className="mt-6 flex flex-col gap-2">
              <Link href="/builder" className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold">Go to Builder</Link>
              <button onClick={() => setStep('form')} className="w-full py-2.5 rounded-xl bg-gray-100 text-sm">Back</button>
            </div>
          </div>
        )}

        {error && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs">{error}</div>}
      </div>
    </main>
  );
}
