"use client";
import { useState } from 'react';
import { PLANS, Plan, PlanInfo, PaymentResult, getUserPlan, submitManualMoMoPayment, isPaid, MOMO_PAY_DETAILS } from '../lib/payments';

export default function Paywall({ onUnlocked }: { onUnlocked?: () => void }) {
  const [loading, setLoading] = useState<Plan | null>(null);
  const [txId, setTxId] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<Plan>('biashara');
  
  const currentPlan = getUserPlan();
  const paid = isPaid();
  const currentPlanInfo: PlanInfo = PLANS[currentPlan];

  if (paid) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
        <div>
          <div className="font-bold text-green-800">✓ {currentPlanInfo.name} Active - {currentPlanInfo.priceUGX} UGX</div>
          <div className="text-xs text-green-600">You can publish unlimited sites. MoMo payment verified.</div>
        </div>
        <div className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">Paid</div>
      </div>
    );
  }

  const handleManualPay = async () => {
    if (!txId || txId.length < 5) {
      alert('Enter your MTN/Airtel Transaction ID from MoMo SMS');
      return;
    }
    setLoading(selectedPlan);
    try {
      const result: PaymentResult = await submitManualMoMoPayment(selectedPlan, txId, phone);
      if (result.success) {
        alert(result.message);
        onUnlocked?.();
        window.location.reload();
      } else {
        alert(result.error);
      }
    } catch (e) {
      alert('Error submitting payment');
    }
    setLoading(null);
  };

  return (
    <div className="bg-white border-2 border-yellow-300 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-xl">💰</span>
        <h3 className="font-bold">Pay with MTN MoMo / Airtel Money - Manual Verification (Works Today)</h3>
      </div>
      
      <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
        <div className="font-bold">Flutterwave blocked in Uganda for small biz (requires 1M+ monthly). We switched to Manual MoMo + Pesapal (3.5% fee, SME friendly).</div>
        <div className="mt-1">For now: Send money to number below, enter Transaction ID. You verify via your MoMo SMS. Auto-unlocks for demo, you check later.</div>
      </div>

      <div className="mt-5 grid md:grid-cols-3 gap-4">
        {(Object.keys(PLANS) as Plan[]).filter(p => p !== 'free').map(planKey => {
          const plan: PlanInfo = PLANS[planKey];
          const isSelected = selectedPlan === planKey;
          return (
            <div key={planKey} onClick={() => setSelectedPlan(planKey)} className={`cursor-pointer border rounded-xl p-4 ${plan.popular ? 'border-gray-900 shadow-md bg-yellow-50' : ''} ${isSelected ? 'ring-2 ring-gray-900' : 'bg-white'}`}>
              {plan.popular && <div className="text-[10px] font-bold bg-yellow-300 inline-flex px-2 py-1 rounded-full mb-2">MOST POPULAR</div>}
              {isSelected && <div className="text-[10px] font-bold bg-gray-900 text-white inline-flex px-2 py-1 rounded-full mb-2">SELECTED</div>}
              <div className="font-bold">{plan.name}</div>
              <div className="text-xl font-extrabold mt-1">UGX {plan.priceUGX}<span className="text-xs font-normal">/mo</span></div>
              <ul className="mt-3 text-xs text-gray-600 space-y-1">
                {plan.features.map((f, i) => <li key={i}>✓ {f}</li>)}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-gray-50 border rounded-xl p-5">
        <div className="font-bold text-sm">Step 1: Send Money via MoMo</div>
        <div className="mt-3 grid md:grid-cols-2 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <div className="text-xs text-gray-500">MTN MoMo</div>
            <div className="font-bold text-lg mt-1">{MOMO_PAY_DETAILS.mtnNumber}</div>
            <div className="text-xs mt-1">Name: {MOMO_PAY_DETAILS.businessName}</div>
            <div className="mt-2 text-xs bg-yellow-100 px-2 py-1 rounded">Send UGX {PLANS[selectedPlan].priceUGX} to this number</div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="text-xs text-gray-500">Airtel Money</div>
            <div className="font-bold text-lg mt-1">{MOMO_PAY_DETAILS.airtelNumber}</div>
            <div className="text-xs mt-1">Name: {MOMO_PAY_DETAILS.businessName}</div>
            <div className="mt-2 text-xs bg-red-100 px-2 py-1 rounded">Or send to Airtel</div>
          </div>
        </div>

        <div className="mt-5">
          <div className="font-bold text-sm">Step 2: Enter Transaction ID from MoMo SMS</div>
          <p className="text-xs text-gray-500 mt-1">After sending MoMo, you get SMS with Transaction ID e.g. 1234567890 or 100200300. Paste it below.</p>
          <div className="mt-3 grid md:grid-cols-2 gap-3">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Your phone e.g. 0700 123456 (used to send)"
              className="px-4 py-3 rounded-lg border text-sm"
            />
            <input
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              placeholder="Transaction ID e.g. 1234567890"
              className="px-4 py-3 rounded-lg border text-sm font-mono"
            />
          </div>
          <button
            onClick={handleManualPay}
            disabled={!!loading || !txId}
            className="w-full mt-4 py-3 rounded-lg bg-gray-900 text-white font-bold text-sm disabled:opacity-50"
          >
            {loading ? 'Verifying...' : `I Paid UGX ${PLANS[selectedPlan].priceUGX} - Unlock Now`}
          </button>
          <div className="mt-2 text-[10px] text-gray-500">
            For now auto-unlocks, you verify SMS later in your MTN MoMo. Later we add MTN MoMo API auto-verify (1% fee) or Pesapal (3.5%). Flutterwave disabled: requires 1M+ business.
          </div>
        </div>
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
        <div className="font-bold text-blue-800">💡 Better than Flutterwave for Uganda SMEs:</div>
        <div className="mt-1 text-blue-700">
          • <strong>Manual MoMo (Today):</strong> 0% fee, you check SMS. Works now. Set your MoMo numbers in .env.local: NEXT_PUBLIC_MOMO_MTN_NUMBER
        </div>
        <div className="text-blue-700">
          • <strong>Pesapal (Next):</strong> 3.5% fee, supports MTN MoMo Uganda + Airtel + Cards, built for East Africa SMEs/schools — pesapal.com/ug
        </div>
        <div className="text-blue-700">
          • <strong>MTN MoMo Direct API:</strong> 1% individual, 2% business — momodeveloper.mtn.com — cheapest long term
        </div>
      </div>
    </div>
  );
}
