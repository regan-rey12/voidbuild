"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signInWithEmail, signInWithGoogle, getCurrentUser } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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
    if (!email || !email.includes('@')) {
      setError('Enter valid email');
      return;
    }
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
    setGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message);
      setGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl border shadow-sm p-6 md:p-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mx-auto hover:opacity-90 transition">
            <img src="/logo.png" alt="VoidBuild" className="w-10 h-10 object-contain flex-shrink-0" />
            <span className="font-extrabold text-xl tracking-tight text-gray-900">voidbuild</span>
          </Link>
          <h1 className="mt-5 text-xl font-bold tracking-tight text-gray-900">Welcome to VoidBuild</h1>
          <p className="mt-1.5 text-sm text-gray-600">Sign in to save your websites. Free forever.</p>
        </div>

        {step === 'form' && (
          <div className="mt-8 space-y-5">
            <button onClick={handleGoogle} disabled={googleLoading || !isConfigured} className="w-full py-3 rounded-xl bg-white border border-gray-200 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2.5 shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              {googleLoading ? 'Opening...' : 'Continue with Google'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">OR</span></div>
            </div>

            <form onSubmit={handleEmail} className="space-y-3">
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@gmail.com" type="email" required className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900" />
              <button disabled={loading} className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-bold disabled:opacity-50 hover:bg-black">
                {loading ? 'Sending...' : 'Continue with Email'}
              </button>
              <div className="text-[11px] text-gray-500 text-center">We will send you a secure link to sign in. No password needed.</div>
            </form>
          </div>
        )}

        {step === 'sent' && (
          <div className="mt-8 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto text-xl">✓</div>
            <div className="font-bold mt-4">Check your email</div>
            <div className="text-sm text-gray-600 mt-2">We sent a link to <span className="font-semibold">{email}</span></div>
            <div className="text-xs text-gray-500 mt-1">Click the link to sign in. Check spam folder if you don't see it.</div>
            <div className="mt-6 flex flex-col gap-2">
              <button onClick={() => window.open('https://mail.google.com', '_blank')} className="w-full py-2.5 rounded-xl bg-white border text-sm font-semibold">Open Gmail</button>
              <button onClick={() => setStep('form')} className="w-full py-2.5 rounded-xl bg-gray-100 text-sm">Back</button>
            </div>
          </div>
        )}

        {error && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs">{error}</div>}
      </div>
    </main>
  );
}
