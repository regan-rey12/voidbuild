import Link from 'next/link';
import AuthButton from '../components/AuthButton';

function AuthButtonWrapper() {
  return <AuthButton />;
}

export default function LandingPage() {
  const templates = [
    { id: 'salon', name: 'Salon', desc: 'Aisha Beauty Wandegeya', color: '#EC4899', price: 'UGX 35k', letter: 'S' },
    { id: 'hardware', name: 'Hardware', desc: 'Musa Hardware Mbale', color: '#F59E0B', price: 'UGX 35k/bag', letter: 'H' },
    { id: 'restaurant', name: 'Restaurant', desc: "Mama's Kitchen", color: '#EF4444', price: 'UGX 15k', letter: 'R' },
    { id: 'boda', name: 'Boda Garage', desc: 'Speed Garage Ntinda', color: '#111827', price: 'UGX 20k', letter: 'B' },
    { id: 'boutique', name: 'Boutique', desc: 'Trendy Boutique', color: '#EC4899', price: 'UGX 50k', letter: 'B' },
    { id: 'church', name: 'Church', desc: 'Victory Church Mbarara', color: '#6366F1', price: 'Free', letter: 'C' },
    { id: 'school', name: 'School', desc: 'Bright Future Primary', color: '#0EA5E9', price: 'UGX 80k/term', letter: 'S' },
    { id: 'clinic', name: 'Clinic', desc: 'Family Care Ntinda', color: '#06B6D4', price: 'UGX 20k', letter: 'C' },
    { id: 'barbershop', name: 'Barbershop', desc: 'Fresh Cuts Wandegeya', color: '#111827', price: 'UGX 8k', letter: 'B' },
    { id: 'portfolio', name: 'Portfolio', desc: 'John Photography', color: '#111827', price: 'UGX 100k', letter: 'P' },
  ];

  return (
    <main className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gray-900 text-white flex items-center justify-center font-bold text-xs">V</div>
            <span className="font-bold text-sm">voidbuild.com</span>
            <span className="ml-2 hidden md:inline-flex text-[10px] px-2 py-0.5 rounded-full bg-green-50 border border-green-100 text-green-700 font-bold">LIVE UGANDA</span>
          </div>
          <div className="hidden md:flex gap-5 text-[13px] text-gray-600">
            <a href="#templates" className="hover:text-black">Templates</a>
            <a href="#pricing" className="hover:text-black">Pricing UGX</a>
            <a href="/dashboard" className="hover:text-black">Dashboard</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/builder" className="px-3.5 py-2 rounded-full bg-gray-900 text-white text-xs font-bold">Build Website</Link>
            <div className="hidden md:block"><AuthButtonWrapper /></div>
          </div>
        </div>
      </nav>

      <section className="px-4 md:px-6 py-12 md:py-20 max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-[11px] font-medium">
            Built for Ugandan SMEs - MTN MoMo & Airtel Money
          </div>
          <h1 className="mt-5 text-3xl md:text-5xl font-extrabold leading-[1.1] tracking-tight">
            Build your shop website in <span className="bg-yellow-200 px-1.5">30 seconds</span>
          </h1>
          <p className="mt-4 text-[15px] md:text-lg text-gray-600 leading-relaxed">
            AI generates UGX pricing, WhatsApp button, map, MoMo badge. Loads in 2 seconds on MTN 2G. No email needed.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link href="/builder" className="px-6 py-3 rounded-xl bg-gray-900 text-white font-bold text-sm text-center">Generate Website Free</Link>
            <a href="#templates" className="px-6 py-3 rounded-xl bg-gray-100 font-bold text-sm text-center">See Templates</a>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
            <span>Wandegeya to Mbale</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>WhatsApp-first</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>2G Fast</span>
          </div>
        </div>
        <div className="relative mt-4 md:mt-0">
          <div className="rounded-2xl border shadow-lg overflow-hidden bg-gray-50 p-1.5 md:p-2">
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="h-7 bg-gray-900 flex items-center px-3 gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                <div className="ml-3 text-[9px] text-gray-400 truncate">aishas-beauty.voidbuild.com</div>
              </div>
              <div className="p-4">
                <div className="font-bold text-sm">Aisha's Beauty Wandegeya</div>
                <div className="text-[11px] text-gray-500 mt-1">Braids 35k - MTN MoMo Accepted</div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="h-14 bg-pink-100 rounded-lg"></div>
                  <div className="h-14 bg-pink-100 rounded-lg"></div>
                  <div className="h-14 bg-pink-100 rounded-lg"></div>
                </div>
                <div className="mt-3 bg-[#25D366] text-white text-[11px] text-center py-2 rounded-lg font-bold">Book on WhatsApp</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { title: 'WhatsApp-first', desc: 'Floating button + Book CTA on every section. Customers chat, not email.' },
            { title: 'UGX + MoMo', desc: 'All prices in UGX. Shows MTN MoMo & Airtel Money badge.' },
            { title: '2G Fast', desc: 'Under 100KB, under 2s load. Works on MTN/Airtel 2G.' },
            { title: 'Local Templates', desc: 'Salon, Hardware, Boda, Church, Boutique - not generic.' },
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
          <h2 className="text-2xl md:text-3xl font-bold">10 Templates Built for Uganda</h2>
          <p className="mt-2 text-sm text-gray-600">Salon has braids pricing, hardware has cement price per bag, boda has rescue CTA. No emojis, real photos.</p>
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
          <Link href="/builder" className="inline-flex px-5 py-2.5 rounded-full bg-gray-900 text-white font-bold text-sm">Try Any Template - Free</Link>
        </div>
      </section>

      <section id="pricing" className="py-12 md:py-16 px-4 md:px-6 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold">Pricing in UGX - Pay with MoMo</h2>
            <p className="mt-2 text-sm text-gray-400">Cheaper than 2 Rolexes. No renewal trap.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            {[
              { name: 'Free', price: '0', sub: '/mo', features: ['1 website', 'voidbuild.com/p/id', 'Badge'], cta: 'Start Free', popular: false },
              { name: 'Hustler', price: '15,000', sub: '/mo', features: ['1 site', 'No badge', 'WhatsApp'], cta: 'Get Hustler', popular: false },
              { name: 'Biashara', price: '35,000', sub: '/mo', features: ['3 sites', 'Custom domain', 'Analytics'], cta: 'Best', popular: true },
              { name: 'Pro', price: '75,000', sub: '/mo', features: ['10 sites', 'Unlimited', 'E-commerce'], cta: 'Get Pro', popular: false },
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
        <h2 className="text-2xl md:text-3xl font-bold">Your shop deserves a website. Now.</h2>
        <p className="mt-2 text-sm text-gray-600">Type business name, get site in 30s, share on WhatsApp status.</p>
        <Link href="/builder" className="mt-6 inline-flex px-6 py-3 rounded-full bg-gray-900 text-white font-bold text-sm">Build My Website Free</Link>
      </section>

      <footer className="py-8 px-4 md:px-6 border-t text-center text-[11px] text-gray-500">
        © 2026 voidbuild.com — Built in Kampala for Ugandan SMEs — MTN MoMo • Airtel Money
      </footer>
    </main>
  );
}
