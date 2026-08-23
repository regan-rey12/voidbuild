"use client";
import { useState } from 'react';
import Link from 'next/link';
import TopNav from '@/components/TopNav';
import { PLANS, Plan, PlanInfo } from '@/lib/payments';
import { getAccessToken, getEffectiveUser } from '@/lib/auth';
import { Check, Sparkles, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

export default function PricingPage() {
  const [loading, setLoading] = useState<Plan | null>(null);
  const [error, setError] = useState('');

  const handlePay = async (plan: Plan) => {
    setError('');
    setLoading(plan);
    try {
      const accessToken = await getAccessToken();
      const user = await getEffectiveUser();
      if (!accessToken || !user?.id) {
        throw new Error('Please sign in first before upgrading your plan.');
      }

      const res = await fetch('/api/pesapal/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ plan, email: user.email || undefined, phone: user.phone || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        throw new Error('Payment checkout page is preparing. Please try again.');
      }
    } catch (e: any) {
      let msg = e.message || 'Unable to start payment.';
      if (msg.includes('fetch') || msg.includes('Network')) {
        msg = 'Please check your internet connection and try again.';
      }
      setError(msg);
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <TopNav currentPage="pricing" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-16">
        <div className="text-center max-w-2xl mx-auto">
          <img src="/logo.png" alt="VoidBuild" className="w-10 h-10 object-contain mx-auto" />
          <h1 className="mt-4 text-2xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-2 text-sm md:text-base text-gray-600">
            Start 100% free with 1 website. Upgrade whenever your business is ready to expand.
          </p>
        </div>

        {error && (
          <div className="mt-6 max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-red-900">Payment Notice</div>
              <div className="text-xs text-red-700 mt-0.5">{error}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mt-10">
          {Object.entries(PLANS).map(([key, plan]: [string, PlanInfo]) => (
            <div
              key={key}
              className={`rounded-2xl p-6 border flex flex-col justify-between transition-all ${
                plan.popular
                  ? 'border-gray-900 shadow-xl bg-white ring-2 ring-gray-900 scale-[1.02]'
                  : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
              }`}
            >
              <div>
                {plan.popular && (
                  <div className="text-[9px] font-extrabold uppercase tracking-wider bg-yellow-400 text-gray-950 inline-flex px-2.5 py-0.5 rounded-full mb-3 shadow-sm">
                    MOST POPULAR
                  </div>
                )}
                <div className="font-bold text-base text-gray-900">{plan.name}</div>
                <div className="mt-3">
                  <span className="text-2xl md:text-3xl font-extrabold text-gray-900">UGX {plan.priceUGX}</span>
                  <span className="text-xs text-gray-500 font-normal"> / mo</span>
                </div>
                <div className="mt-1 text-xs text-gray-500 font-medium">
                  {plan.limit} {plan.limit === 1 ? 'website' : 'websites'}
                </div>
                <ul className="mt-5 space-y-2 text-xs text-gray-600">
                  {plan.features.map((f: string) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                {key === 'free' ? (
                  <Link
                    href="/builder"
                    className="block text-center py-2.5 rounded-xl bg-gray-100 text-gray-900 text-xs font-bold hover:bg-gray-200 transition"
                  >
                    Start Free
                  </Link>
                ) : (
                  <button
                    onClick={() => handlePay(key as Plan)}
                    disabled={!!loading}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      plan.popular
                        ? 'bg-gray-900 text-white hover:bg-black'
                        : 'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50'
                    } disabled:opacity-50`}
                  >
                    {loading === key ? (
                      'Opening checkout...'
                    ) : (
                      <>
                        <span>Get {plan.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                )}
                <div className="mt-2 text-[10px] text-center text-gray-400">
                  MTN MoMo • Airtel • Visa
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* How Flow B Works Card */}
        <div className="mt-14 bg-gray-900 text-white rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Try Before You Pay (Flow B)</span>
          </div>
          <h3 className="font-bold text-lg md:text-xl mt-2">How VoidBuild Works</h3>
          <div className="grid md:grid-cols-3 gap-5 mt-6 text-xs text-gray-300">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="font-bold text-white text-sm mb-1">1. Generate Free</div>
              <p className="leading-relaxed">
                Describe your shop (e.g. salon, clinic, hardware). Our AI crafts a full website in 30 seconds.
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="font-bold text-white text-sm mb-1">2. Edit &amp; Share Link</div>
              <p className="leading-relaxed">
                Customize photos, phone number, and services. First website is completely free to publish.
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="font-bold text-white text-sm mb-1">3. Upgrade When Growing</div>
              <p className="leading-relaxed">
                When you create additional websites, pay seamlessly via automated MTN MoMo or Airtel Money.
              </p>
            </div>
          </div>

          {/* Kampala VIP WhatsApp Concierge */}
          <div className="mt-8 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left text-xs">
              <div className="font-bold text-white text-sm">Prefer manual setup or want to pay directly?</div>
              <div className="text-gray-300 mt-0.5">Chat with our Kampala team on WhatsApp (+256 751 391318) for VIP onboarding.</div>
            </div>
            <a
              href="https://wa.me/256751391318?text=Hello%20VoidBuild%2C%20I%20want%20to%20upgrade%20my%20website%20plan"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs transition whitespace-nowrap"
            >
              WhatsApp Concierge
            </a>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/builder"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 text-white font-bold text-sm hover:bg-black transition shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>Start Building Free — No Card Required</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
