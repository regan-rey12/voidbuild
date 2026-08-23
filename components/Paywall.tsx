"use client";
import { useState } from 'react';
import { PLANS, Plan, PlanInfo, getUserPlan } from '@/lib/payments';
import { getAccessToken, getEffectiveUser } from '@/lib/auth';
import { Sparkles, Check, ArrowRight, ShieldCheck, Trash2, X, AlertCircle } from 'lucide-react';

interface PaywallProps {
  limitReached?: boolean;
  onUnlocked?: () => void;
  onDismiss?: () => void;
  onDeleteOldSite?: () => void;
}

export default function Paywall({
  limitReached = false,
  onUnlocked,
  onDismiss,
  onDeleteOldSite,
}: PaywallProps) {
  const [loading, setLoading] = useState<Plan | null>(null);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<Plan>('business');
  const currentPlan = getUserPlan();

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
      if (!res.ok) {
        throw new Error(data.error || 'Unable to start secure checkout. Please try again.');
      }
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        throw new Error('Payment checkout page is preparing. Please try again in a few seconds.');
      }
    } catch (e: any) {
      let msg = e.message || 'Unable to start payment.';
      if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('network')) {
        msg = 'Please check your internet connection and try again.';
      }
      setError(msg);
      setLoading(null);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Positive Framing Header */}
      {limitReached ? (
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400 text-gray-950 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>You&apos;re growing!</span>
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <h3 className="text-lg md:text-xl font-bold mt-3 text-white">
            You&apos;ve created 1 website on Free.
          </h3>
          <p className="text-xs md:text-sm text-gray-300 mt-1.5 leading-relaxed max-w-2xl">
            Free allows 1 site to keep it free for everyone. Upgrade to create more and keep all your sites live. Your first site remains live.
          </p>

          {/* Quick Actions Bar */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={() => handlePay('business')}
              disabled={!!loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-gray-900 text-xs font-bold hover:bg-gray-100 disabled:opacity-50 transition shadow-sm"
            >
              {loading === 'business' ? (
                'Opening checkout...'
              ) : (
                <>
                  <span>Upgrade to Business (UGX 35,000/mo)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {onDeleteOldSite && (
              <button
                onClick={onDeleteOldSite}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition"
              >
                <Trash2 className="w-3.5 h-3.5 text-gray-300" />
                <span>Delete old site to create new one</span>
              </button>
            )}

            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-3.5 py-2.5 rounded-xl text-gray-300 hover:text-white text-xs font-medium transition"
              >
                Maybe Later
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 text-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base">Choose Your VoidBuild Plan</h3>
              <p className="text-xs text-gray-300 mt-1">
                Instant automated activation via MTN MoMo, Airtel Money, or Card.
              </p>
            </div>
            <div className="text-[11px] px-2.5 py-1 rounded-full bg-white/10 text-gray-300">
              Current: <span className="font-bold text-white capitalize">{PLANS[currentPlan]?.name || 'Free'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Plan Cards Grid */}
      <div className="p-5 md:p-6 bg-gray-50/50">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Available Subscription Plans
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.keys(PLANS) as Plan[]).filter(p => p !== 'free').map(planKey => {
            const plan: PlanInfo = PLANS[planKey];
            const isPopular = plan.popular;
            const isSelected = selectedPlan === planKey;

            return (
              <div
                key={planKey}
                onClick={() => setSelectedPlan(planKey)}
                className={`relative rounded-2xl p-5 border cursor-pointer transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-gray-900 bg-white shadow-md ring-2 ring-gray-900'
                    : isPopular
                    ? 'border-gray-900/60 bg-white shadow-sm ring-1 ring-gray-900/30'
                    : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-2.5 left-5 text-[9px] font-extrabold uppercase tracking-wider bg-yellow-400 text-gray-950 px-2.5 py-0.5 rounded-full shadow-sm">
                    POPULAR CHOICE
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm text-gray-900">{plan.name}</div>
                    <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {plan.limit} {plan.limit === 1 ? 'website' : 'websites'}
                    </span>
                  </div>

                  <div className="mt-3">
                    <span className="text-2xl font-extrabold text-gray-900">UGX {plan.priceUGX}</span>
                    <span className="text-xs text-gray-500 font-normal"> / month</span>
                  </div>

                  <ul className="mt-4 space-y-2 text-xs text-gray-600">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePay(planKey);
                    }}
                    disabled={!!loading}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      isPopular || isSelected
                        ? 'bg-gray-900 text-white hover:bg-black'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    {loading === planKey ? (
                      'Opening checkout...'
                    ) : (
                      <>
                        <span>Get {plan.name}</span>
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3 Visual Payment Cards (Like Pesapal Payment Page) */}
        <div className="mt-6 pt-5 border-t border-gray-200">
          <div className="text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
            Secure Payment Channels via Pesapal
          </div>
          
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            {/* Card 1: MTN MoMo (Clean - No circle M letter) */}
            <div className="bg-[#FFCC00] rounded-xl px-3 py-2.5 flex items-center justify-center border border-amber-300 shadow-sm h-14 select-none">
              <span className="font-black text-sm sm:text-base tracking-tight text-gray-950">
                MTN MoMo
              </span>
            </div>

            {/* Card 2: Airtel Money */}
            <div className="bg-[#ED1C24] rounded-xl px-3 py-2.5 flex items-center justify-center border border-red-500 shadow-sm h-14 select-none text-white">
              <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                <div className="leading-tight text-center">
                  <div className="font-black text-xs sm:text-sm tracking-tight text-white">airtel</div>
                  <div className="text-[9px] bg-white text-[#ED1C24] px-1 rounded font-black uppercase tracking-wider">money</div>
                </div>
              </div>
            </div>

            {/* Card 3: Visa / Mastercard */}
            <div className="bg-white rounded-xl px-3 py-2.5 flex items-center justify-center gap-2 border border-gray-300 shadow-sm h-14 select-none">
              <span className="font-black text-blue-900 text-xs sm:text-sm italic tracking-tighter">VISA</span>
              <div className="flex items-center -space-x-1.5">
                <div className="w-4 h-4 rounded-full bg-[#EB001B]"></div>
                <div className="w-4 h-4 rounded-full bg-[#F79E1B]/90"></div>
              </div>
            </div>
          </div>

          <div className="mt-3 text-center text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-green-600 inline" />
            <span>Instant automated account activation • Bank of Uganda approved gateway</span>
          </div>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs font-bold text-red-900">Payment Notice</div>
              <div className="text-xs text-red-700 mt-0.5">{error}</div>
              <div className="text-[11px] text-gray-600 mt-2">
                Need immediate help? Reach us directly on WhatsApp:{' '}
                <a
                  href="https://wa.me/256751391318?text=Hello%20VoidBuild%2C%20I%20need%20help%20with%20payment"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-gray-900 underline hover:text-black"
                >
                  +256 751 391318
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
