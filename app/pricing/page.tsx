import Link from 'next/link';
import { PLANS } from '../../lib/payments';

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold">voidbuild.com</Link>
          <Link href="/builder" className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm">Build Website</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold">Pricing in UGX — Pay with MoMo</h1>
          <p className="mt-3 text-gray-600">No dollars. No cards needed. Pay with MTN MoMo or Airtel Money via Flutterwave. Demo mode works now, add keys for real payments.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mt-12">
          {(Object.entries(PLANS) as any).map(([key, plan]: any) => (
            <div key={key} className={`rounded-2xl p-6 border ${plan.popular ? 'border-gray-900 shadow-xl scale-105 bg-gray-50' : 'bg-white'}`}>
              {plan.popular && <div className="text-[10px] font-bold bg-yellow-300 inline-flex px-2 py-1 rounded-full mb-2">POPULAR</div>}
              <div className="font-bold text-lg">{plan.name}</div>
              <div className="mt-2"><span className="text-3xl font-extrabold">UGX {plan.priceUGX}</span><span className="text-sm opacity-70">/mo</span></div>
              <div className="mt-1 text-xs text-gray-500">{plan.limit} website{plan.limit>1?'s':''}</div>
              <ul className="mt-5 space-y-2 text-sm text-gray-600">
                {plan.features.map((f: string, i: number) => <li key={i}>✓ {f}</li>)}
              </ul>
              <Link href="/builder" className={`mt-6 block text-center py-3 rounded-lg font-bold text-sm ${plan.popular ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
                {key==='free' ? 'Start Free' : `Pay UGX ${plan.priceUGX}`}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gray-50 border rounded-2xl p-6">
          <h3 className="font-bold">How MoMo Payments Work (Flutterwave)</h3>
          <ol className="mt-3 text-sm text-gray-600 space-y-2 list-decimal pl-5">
            <li>Go to dashboard.flutterwave.com → Create account (free, Uganda supported)</li>
            <li>Settings → API Keys → Copy PUBLIC KEY</li>
            <li>Add to your voidbuild/.env.local: NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-...</li>
            <li>Restart npm run dev. Paywall now opens real MoMo checkout with MTN/Airtel options</li>
            <li>Test with MTN test number: 256704000000, OTP 123456 (Flutterwave sandbox)</li>
          </ol>
          <div className="mt-4 text-xs text-gray-500">Current build runs in DEMO mode (simulates payment, unlocks) so you can test without keys. Real money needs Flutterwave keys.</div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/builder" className="inline-flex px-6 py-3 rounded-lg bg-gray-900 text-white font-bold">Start Building Free →</Link>
        </div>
      </div>
    </main>
  );
}
