"use client";
import { useState } from 'react';
import Link from 'next/link';
import TopNav from '../../components/TopNav';
import { PLANS, Plan, PlanInfo } from '../../lib/payments';

export default function PricingPage() {
  const [loading, setLoading] = useState<Plan | null>(null);
  const [error, setError] = useState('');

  const handlePay = async (plan: Plan) => {
    setError('');
    setLoading(plan);
    try {
      const res = await fetch('/api/pesapal/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        throw new Error('Checkout not ready');
      }
    } catch (e: any) {
      setError(e.message || 'Unable to start payment');
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <TopNav currentPage="pricing" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-16">
        <div className="text-center max-w-2xl mx-auto">
          <img src="/logo.png" alt="" className="w-10 h-10 rounded-xl mx-auto border object-contain bg-white p-1" />
          <h1 className="mt-4 text-2xl md:text-3xl font-bold tracking-tight">Simple Pricing</h1>
          <p className="mt-2 text-sm text-gray-600">Start free, upgrade when ready. No hidden fees. Try before you pay.</p>
        </div>

        {error && (
          <div className="mt-8 max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="text-xs font-bold text-red-800">Payment Issue</div>
            <div className="text-xs text-red-700 mt-1">{error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-10">
          {Object.entries(PLANS).map(([key, plan]: [string, PlanInfo]) => (
            <div key={key} className={`rounded-xl p-5 border ${plan.popular ? 'border-gray-900 shadow-lg bg-gray-50' : 'bg-white'}`}>
              {plan.popular && <div className="text-[9px] font-bold bg-yellow-300 inline-flex px-2 py-0.5 rounded-full mb-2">POPULAR</div>}
              <div className="font-bold text-sm">{plan.name}</div>
              <div className="mt-2"><span className="text-2xl font-extrabold">UGX {plan.priceUGX}</span><span className="text-xs opacity-70">/mo</span></div>
              <div className="mt-1 text-xs text-gray-500">{plan.limit} websites</div>
              <ul className="mt-4 space-y-1.5 text-xs text-gray-600">
                {plan.features.map((f: string) => <li key={f} className="flex gap-2"><span className="text-green-600">✓</span><span>{f}</span></li>)}
              </ul>
              {key === 'free' ? (
                <Link href="/builder" className="mt-5 block text-center py-2.5 rounded-full bg-gray-100 text-xs font-bold hover:bg-gray-200">Start Free</Link>
              ) : (
                <button
                  onClick={() => handlePay(key as Plan)}
                  disabled={!!loading}
                  className={`mt-5 w-full py-2.5 rounded-full text-xs font-bold transition ${plan.popular ? 'bg-gray-900 text-white hover:bg-black' : 'bg-white border border-gray-200 hover:bg-gray-50'} disabled:opacity-50`}
                >
                  {loading === key ? 'Opening checkout...' : `Get ${plan.name} - UGX ${plan.priceUGX}`}
                </button>
              )}
              <div className="mt-2 text-[10px] text-center text-gray-400">MTN MoMo • Airtel • Card • Secure</div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gray-900 text-white rounded-2xl p-6 md:p-8">
          <h3 className="font-bold text-sm">How it works - Try before you pay (Flow B)</h3>
          <ol className="mt-4 text-xs text-gray-300 space-y-2 list-decimal pl-4 leading-relaxed">
            <li>Click any plan above (even Business) → Goes to Builder (free to try, no payment yet)</li>
            <li>Generate website in 30 seconds, see real preview</li>
            <li>Save & Get Link - First site free, share on WhatsApp</li>
            <li>When you try 2nd site (free limit 1), Dashboard shows Paywall → Pay via Pesapal auto MoMo → Instant unlock</li>
          </ol>
        </div>

        <div className="mt-8 text-center">
          <Link href="/builder" className="inline-flex px-6 py-3 rounded-full bg-gray-900 text-white font-bold text-sm">Start Building Free - No Payment</Link>
        </div>
      </div>
    </main>
  );
}
