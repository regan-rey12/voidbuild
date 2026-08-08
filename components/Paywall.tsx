"use client";
import { useState } from 'react';
import { PLANS, Plan, PlanInfo } from '../lib/payments';

export default function Paywall({ onUnlocked, limitReached = false }: { onUnlocked?: () => void; limitReached?: boolean }) {
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
      if (!res.ok) throw new Error(data.error || 'Unable to start payment');
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        throw new Error('Payment page is not ready, please try again shortly');
      }
    } catch (e: any) {
      let msg = e.message || 'Unable to start payment';
      if (msg.includes('Network')) msg = 'Please check your internet connection and try again';
      setError(msg);
      setLoading(null);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="bg-gray-900 text-white p-4">
        <h3 className="font-bold text-sm">{limitReached ? 'Upgrade to Continue' : 'Choose Your Plan'}</h3>
        <p className="text-xs text-gray-300 mt-1">Secure payment with MTN MoMo, Airtel Money, or Card. Instant activation after payment.</p>
      </div>

      <div className="p-5">
        <div className="grid md:grid-cols-3 gap-3">
          {(Object.keys(PLANS) as Plan[]).filter(p => p !== 'free').map(planKey => {
            const plan: PlanInfo = PLANS[planKey];
            return (
              <div key={planKey} className={`border rounded-xl p-4 ${plan.popular ? 'border-gray-900 bg-gray-50 shadow-sm' : 'bg-white border-gray-200'}`}>
                {plan.popular && <div className="text-[9px] font-bold bg-yellow-300 inline-flex px-2 py-0.5 rounded-full mb-2">POPULAR</div>}
                <div className="font-bold text-sm">{plan.name}</div>
                <div className="text-lg font-extrabold mt-1">UGX {plan.priceUGX}<span className="text-[11px] font-normal">/mo</span></div>
                <div className="text-[11px] text-gray-500 mt-0.5">{plan.limit} websites</div>
                <ul className="mt-3 space-y-1 text-xs text-gray-600">
                  {plan.features.slice(0,3).map((f, i) => <li key={i} className="flex gap-2"><span>✓</span><span>{f}</span></li>)}
                </ul>
                <button
                  onClick={() => handlePay(planKey)}
                  disabled={!!loading}
                  className="w-full mt-4 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-black disabled:opacity-50 transition"
                >
                  {loading === planKey ? 'Opening secure checkout...' : `Get ${plan.name} - UGX ${plan.priceUGX}`}
                </button>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-3">
            <div className="text-xs font-bold text-red-800">Payment Issue</div>
            <div className="text-xs text-red-700 mt-1">{error}</div>
            <div className="text-[11px] text-gray-600 mt-2">Need help? Contact us on WhatsApp: +256 774 919318</div>
          </div>
        )}

        <div className="mt-5 bg-gray-50 border rounded-xl p-3">
          <div className="text-xs font-semibold">Secure payments via Pesapal</div>
          <div className="text-[11px] text-gray-600 mt-1">You will be redirected to Pesapal secure checkout. Choose your preferred method and complete payment. Your plan will be activated instantly after successful payment.</div>
          <div className="mt-2 flex gap-2 text-[10px] text-gray-500">
            <span>MTN MoMo</span><span>•</span><span>Airtel Money</span><span>•</span><span>Cards</span><span>•</span><span>Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
}
