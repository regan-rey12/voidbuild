import Link from 'next/link';
import TopNav from '../components/TopNav';

export default function LandingPage() {
  const templates = [
    { id: 'salon', name: 'Salon', desc: 'Beauty & Braids', color: '#EC4899', price: 'UGX 35k', letter: 'S' },
    { id: 'hardware', name: 'Hardware', desc: 'Building Materials', color: '#F59E0B', price: 'UGX 35k', letter: 'H' },
    { id: 'restaurant', name: 'Restaurant', desc: 'Local Food', color: '#EF4444', price: 'UGX 15k', letter: 'R' },
    { id: 'boda', name: 'Boda Garage', desc: 'Repair & Parts', color: '#111827', price: 'UGX 20k', letter: 'B' },
    { id: 'boutique', name: 'Boutique', desc: 'Fashion & Style', color: '#EC4899', price: 'UGX 50k', letter: 'B' },
    { id: 'church', name: 'Church', desc: 'Fellowship', color: '#6366F1', price: 'Free', letter: 'C' },
    { id: 'school', name: 'School', desc: 'Education', color: '#0EA5E9', price: 'UGX 80k', letter: 'S' },
    { id: 'clinic', name: 'Clinic', desc: 'Health Care', color: '#06B6D4', price: 'UGX 20k', letter: 'C' },
    { id: 'barbershop', name: 'Barbershop', desc: 'Haircuts', color: '#111827', price: 'UGX 8k', letter: 'B' },
    { id: 'portfolio', name: 'Portfolio', desc: 'Photography', color: '#111827', price: 'UGX 100k', letter: 'P' },
  ];

  return (
    <main className="min-h-screen bg-white">
      <TopNav currentPage="home" />

      <section className="px-4 md:px-6 py-12 md:py-20 max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border text-[11px] font-medium">
            For businesses in Uganda • Fast & Affordable
          </div>
          <h1 className="mt-5 text-3xl md:text-5xl font-extrabold leading-[1.1] tracking-tight">
            Build your shop website in <span className="bg-yellow-200 px-1.5">30 seconds</span>
          </h1>
          <p className="mt-4 text-[15px] md:text-lg text-gray-600 leading-relaxed">
            Professional website with your prices, WhatsApp button, and map. Works fast on any phone. No technical skills needed.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link href="/builder" className="px-6 py-3 rounded-xl bg-gray-900 text-white font-bold text-sm text-center">Generate Website Free</Link>
            <a href="#templates" className="px-6 py-3 rounded-xl bg-gray-100 font-bold text-sm text-center">See Templates</a>
          </div>
        </div>
        <div className="relative mt-4 md:mt-0">
          <div className="rounded-2xl border shadow-lg overflow-hidden bg-gray-50 p-1.5 md:p-2">
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="h-7 bg-gray-900 flex items-center px-3 gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                <div className="ml-3 text-[9px] text-gray-400 truncate">your-business.voidbuild.com</div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="" className="w-6 h-6 rounded-lg object-contain border bg-white" />
                  <div className="font-bold text-sm">Your Business Name</div>
                </div>
                <div className="text-[11px] text-gray-500 mt-1">Professional website • Ready in seconds</div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="h-14 bg-gray-100 rounded-lg"></div>
                  <div className="h-14 bg-gray-100 rounded-lg"></div>
                  <div className="h-14 bg-gray-100 rounded-lg"></div>
                </div>
                <div className="mt-3 bg-gray-900 text-white text-[11px] text-center py-2 rounded-lg font-bold">Book on WhatsApp</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-12 md:py-16 px-4 md:px-6 border-y">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { title: 'WhatsApp Ready', desc: 'Customers message you directly on WhatsApp to order or book.' },
            { title: 'Local Pricing', desc: 'All prices in UGX. Professional look without high cost.' },
            { title: 'Fast Everywhere', desc: 'Loads quickly even on slow connections.' },
            { title: 'Built for You', desc: 'Templates for salons, shops, restaurants and more.' },
          ].map((f, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border">
              <div className="font-bold text-sm">{f.title}</div>
              <div className="text-xs text-gray-600 mt-1.5 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="templates" className="py-12 md:py-16 px-4 md:px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold">Templates for Your Business</h2>
          <p className="mt-2 text-sm text-gray-600">Professional designs ready for your shop.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mt-8">
          {templates.map(t => (
            <div key={t.id} className="border rounded-xl p-3 hover:shadow-md transition bg-white hover:border-gray-300">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: t.color }}>{t.letter}</div>
              <div className="font-semibold mt-2.5 text-sm">{t.name}</div>
              <div className="text-[11px] text-gray-500 mt-0.5 truncate">{t.desc}</div>
              <div className="mt-2 text-[11px] font-bold inline-flex px-2 py-0.5 rounded-full bg-gray-900 text-white">{t.price}</div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/builder" className="inline-flex px-5 py-2.5 rounded-full bg-gray-900 text-white font-bold text-sm">Try Any Template</Link>
        </div>
      </section>

      <section id="pricing" className="py-12 md:py-16 px-4 md:px-6 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold">Simple Pricing</h2>
            <p className="mt-2 text-sm text-gray-400">Start free, upgrade when ready.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            {[
              { name: 'Free', price: '0', sub: '/mo', features: ['1 website', 'Your link', 'Support'], cta: 'Start Free', popular: false },
              { name: 'Starter', price: '15,000', sub: '/mo', features: ['1 site', 'Custom link', 'WhatsApp'], cta: 'Get Starter', popular: false },
              { name: 'Business', price: '35,000', sub: '/mo', features: ['3 sites', 'Custom domain', 'Analytics'], cta: 'Popular', popular: true },
              { name: 'Pro', price: '75,000', sub: '/mo', features: ['10 sites', 'Unlimited', 'Store'], cta: 'Get Pro', popular: false },
            ].map((p, i) => (
              <div key={i} className={`rounded-xl p-5 border ${p.popular ? 'bg-white text-black border-white' : 'bg-gray-800 border-gray-700'}`}>
                {p.popular && <div className="text-[9px] font-bold bg-yellow-300 text-black inline-flex px-2 py-0.5 rounded-full mb-2">POPULAR</div>}
                <div className="font-bold text-sm">{p.name}</div>
                <div className="mt-1 flex items-end gap-1"><span className="text-xl font-extrabold">UGX {p.price}</span><span className="text-[11px] opacity-70">{p.sub}</span></div>
                <ul className="mt-3 space-y-1.5 text-xs opacity-80">
                  {p.features.map((f, j) => <li key={j}>✓ {f}</li>)}
                </ul>
                <Link href="/builder" className={`mt-4 block text-center py-2.5 rounded-lg text-xs font-bold ${p.popular ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 px-4 md:px-6 text-center max-w-3xl mx-auto">
        <img src="/logo.png" alt="VoidBuild" className="w-10 h-10 rounded-xl mx-auto border shadow-sm object-contain bg-white p-1" />
        <h2 className="mt-5 text-2xl md:text-3xl font-bold tracking-tight">Your business deserves a website.</h2>
        <p className="mt-2 text-sm text-gray-600">Create it in 30 seconds, share on WhatsApp.</p>
        <Link href="/builder" className="mt-6 inline-flex px-6 py-3 rounded-full bg-gray-900 text-white font-bold text-sm">Build My Website Free</Link>
      </section>

      <footer className="py-8 px-4 md:px-6 border-t flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-gray-500 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="" className="w-5 h-5 rounded-md object-contain border bg-white" />
          <span>© 2026 voidbuild — Built for businesses in Uganda</span>
        </div>
        <div>Fast • Affordable • WhatsApp Ready</div>
      </footer>
    </main>
  );
}
