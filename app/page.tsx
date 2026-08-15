"use client";
import { useState } from 'react';
import Link from 'next/link';
import TopNav from '../components/TopNav';
import { 
  Sparkles, 
  MessageCircle, 
  Zap, 
  ShieldCheck, 
  Check, 
  ArrowRight,
  Scissors,
  Hammer,
  Utensils,
  Bike,
  ShoppingBag,
  Heart,
  GraduationCap,
  Stethoscope,
  Camera,
  Star,
  PhoneCall,
  Pill,
  Cake,
  Car,
  Hotel,
  Dumbbell
} from 'lucide-react';

interface TemplateItem {
  id: string;
  name: string;
  desc: string;
  color: string;
  price: string;
  category: 'beauty_health' | 'food_bakery' | 'retail_auto' | 'community_hotel';
  icon: any;
  highlight: string;
}

export default function LandingPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'beauty_health' | 'food_bakery' | 'retail_auto' | 'community_hotel'>('all');

  const templates: TemplateItem[] = [
    { id: 'salon', name: "Aisha's Salon", desc: 'Braids, Natural Hair & Nails', color: '#E11D48', price: 'UGX 35k', category: 'beauty_health', icon: Scissors, highlight: 'Wandegeya' },
    { id: 'pharmacy', name: 'GoodLife Pharmacy', desc: 'Prescriptions, Baby Care & Refills', color: '#059669', price: 'UGX 15k', category: 'beauty_health', icon: Pill, highlight: 'Ntinda' },
    { id: 'clinic', name: 'Kampala Care Clinic', desc: 'Consultation, Lab Tests & Scans', color: '#0D9488', price: 'UGX 25k', category: 'beauty_health', icon: Stethoscope, highlight: 'Ntinda' },
    { id: 'barbershop', name: 'VIP Kigozi Barber', desc: 'Skin Fades, Shave & Dreadlocks', color: '#0F172A', price: 'UGX 10k', category: 'beauty_health', icon: Scissors, highlight: 'Kabalagala' },
    { id: 'gym', name: 'PowerFit Gym', desc: 'Weights, Zumba, Steam & Sauna', color: '#EA580C', price: 'UGX 10k', category: 'beauty_health', icon: Dumbbell, highlight: 'Wandegeya' },
    
    { id: 'restaurant', name: 'Mama Africa Kitchen', desc: 'Luwombo, Tilapia, Pilau & Rolex', color: '#DC2626', price: 'UGX 18k', category: 'food_bakery', icon: Utensils, highlight: 'Wandegeya' },
    { id: 'bakery', name: 'Sweet Crust Bakery', desc: 'Custom Wedding & Birthday Cakes', color: '#D97706', price: 'UGX 65k', category: 'food_bakery', icon: Cake, highlight: 'Bukoto' },
    
    { id: 'hardware', name: 'Musa Hardware', desc: 'Cement, Iron Sheets & Rebar', color: '#D97706', price: 'UGX 36k', category: 'retail_auto', icon: Hammer, highlight: 'Mbale' },
    { id: 'boutique', name: 'Zari Boutique', desc: 'Ankara Dresses, Suits & Handbags', color: '#BE185D', price: 'UGX 65k', category: 'retail_auto', icon: ShoppingBag, highlight: 'Ntinda' },
    { id: 'boda', name: 'Speed Boda Garage', desc: 'Boxer Parts, Oil & 24/7 Rescue', color: '#1F2937', price: 'UGX 18k', category: 'retail_auto', icon: Bike, highlight: 'Ntinda' },
    { id: 'carwash', name: 'Sparkle Auto Spa', desc: 'Snow Foam Wash & Interior Steam', color: '#2563EB', price: 'UGX 15k', category: 'retail_auto', icon: Car, highlight: 'Kabalagala' },

    { id: 'hotel', name: 'Nile View Lodge', desc: 'River Cottages, Cruises & Dining', color: '#0F766E', price: 'UGX 220k', category: 'community_hotel', icon: Hotel, highlight: 'Jinja' },
    { id: 'school', name: "St. Mary's Academy", desc: 'Nursery & Primary UNEB Center', color: '#0EA5E9', price: 'UGX 350k', category: 'community_hotel', icon: GraduationCap, highlight: 'Kisaasi' },
    { id: 'church', name: 'Victory Fellowship', desc: 'Sunday Services, Youth & MoMo', color: '#4F46E5', price: 'Free', category: 'community_hotel', icon: Heart, highlight: 'Mbarara' },
    { id: 'portfolio', name: 'Kato Photography', desc: 'Weddings, Kwanjula & 4K Video', color: '#18181B', price: 'UGX 120k', category: 'community_hotel', icon: Camera, highlight: 'Makindye' },
  ];

  const filteredTemplates = activeFilter === 'all' 
    ? templates 
    : templates.filter(t => t.category === activeFilter);

  return (
    <main className="min-h-screen bg-white">
      <TopNav currentPage="home" />

      {/* Hero Section */}
      <section className="px-4 md:px-6 py-12 md:py-20 max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gray-100 border text-[11px] font-semibold text-gray-800">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>Built for Ugandan SMEs • Kampala, Jinja, Mbale & Mbarara</span>
          </div>
          
          <h1 className="mt-5 text-3xl md:text-5xl font-extrabold leading-[1.15] tracking-tight text-gray-900">
            Build your shop website in{' '}
            <span className="bg-yellow-200 px-2 py-0.5 rounded-lg inline-block text-gray-950 font-black">
              30 seconds
            </span>
          </h1>
          
          <p className="mt-4 text-[15px] md:text-lg text-gray-600 leading-relaxed">
            Professional mobile website with your UGX prices, 1-click WhatsApp order button, and Google Map. Starts 100% free with no credit card required.
          </p>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/builder"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-black transition shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Generate Website Free</span>
            </Link>
            <a
              href="#templates"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-sm transition"
            >
              Explore 15 Templates
            </a>
          </div>

          <div className="mt-8 flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-green-600" />
              <span>1st site free forever</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-green-600" />
              <span>Instant WhatsApp orders</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-green-600" />
              <span>MTN MoMo ready</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Mockup with real mini services */}
        <div className="relative mt-4 md:mt-0">
          <div className="rounded-2xl border border-gray-200 shadow-xl overflow-hidden bg-gray-50 p-2">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="h-8 bg-gray-900 flex items-center px-3 gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                <div className="ml-3 text-[10px] text-gray-300 font-mono truncate">
                  aisha-braids.voidbuild.com
                </div>
              </div>
              
              <div className="p-4 md:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="" className="w-7 h-7 rounded-lg object-contain border bg-white p-0.5" />
                    <div>
                      <div className="font-bold text-sm text-gray-900">Aisha Beauty Braids</div>
                      <div className="text-[10px] text-gray-500">Wandegeya Market • Open 7am - 9pm</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-green-600" />
                    <span>Top Rated</span>
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Featured Braids &amp; Prices</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-center">
                      <div className="font-bold text-xs text-gray-900 truncate">Knotless</div>
                      <div className="text-[10px] font-extrabold text-pink-600 mt-1">35k UGX</div>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-center">
                      <div className="font-bold text-xs text-gray-900 truncate">Box Braids</div>
                      <div className="text-[10px] font-extrabold text-pink-600 mt-1">50k UGX</div>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-center">
                      <div className="font-bold text-xs text-gray-900 truncate">Wash &amp; Set</div>
                      <div className="text-[10px] font-extrabold text-pink-600 mt-1">20k UGX</div>
                    </div>
                  </div>
                </div>

                <Link
                  href="/builder?template=salon"
                  className="mt-4 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold py-2.5 rounded-xl shadow-sm transition"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Book on WhatsApp (Click to Customize)</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="bg-gray-50 py-12 md:py-16 px-4 md:px-6 border-y">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            {
              icon: MessageCircle,
              title: 'WhatsApp Ordering',
              desc: 'Customers message you directly on WhatsApp to order or book instantly.',
            },
            {
              icon: Zap,
              title: 'UGX Pricing & MoMo',
              desc: 'Display all prices in Ugandan Shillings with automated MTN MoMo and Airtel badges.',
            },
            {
              icon: ShieldCheck,
              title: 'Fast Everywhere',
              desc: 'Loads quickly even on 3G mobile data across Kampala, Jinja, Gulu & Mbale.',
            },
            {
              icon: Sparkles,
              title: '15 Local Templates',
              desc: 'Tailored for salons, pharmacies, bakeries, hardware shops, boda garages, hotels and clinics.',
            },
          ].map((f, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                <f.icon className="w-4 h-4 text-gray-900" />
              </div>
              <div className="font-bold text-sm text-gray-900">{f.title}</div>
              <div className="text-xs text-gray-600 mt-1.5 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Templates Section with Category Tabs & Direct Click-to-Load */}
      <section id="templates" className="py-12 md:py-20 px-4 md:px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 text-yellow-900 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Click any template to start editing immediately</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            15 Ugandan Templates Ready to Launch
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Pick your industry. Customize photos, services, and phone number in seconds.
          </p>
        </div>

        {/* Category Filters */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {[
            { id: 'all', label: 'All Templates (15)' },
            { id: 'beauty_health', label: 'Health & Beauty (5)' },
            { id: 'food_bakery', label: 'Food & Bakery (2)' },
            { id: 'retail_auto', label: 'Shops, Auto & Hardware (4)' },
            { id: 'community_hotel', label: 'Hotels, School & Community (4)' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                activeFilter === tab.id
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {filteredTemplates.map(t => {
            const Icon = t.icon;
            return (
              <Link
                key={t.id}
                href={`/builder?template=${t.id}`}
                className="group relative border border-gray-200 rounded-2xl p-5 hover:shadow-xl hover:border-gray-900 transition-all bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105"
                      style={{ backgroundColor: t.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800">
                      {t.highlight}
                    </span>
                  </div>

                  <h3 className="font-bold mt-4 text-base text-gray-900 group-hover:text-black">
                    {t.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {t.desc}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-gray-900 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
                    {t.price}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-900 group-hover:translate-x-0.5 transition">
                    <span>Use Template</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/builder"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 text-white font-bold text-xs hover:bg-black transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Or Generate Custom Business with AI</span>
          </Link>
        </div>
      </section>

      {/* Pricing Section (Flow B: Try free first) */}
      <section id="pricing" className="py-12 md:py-20 px-4 md:px-6 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Simple, Transparent Pricing</h2>
            <p className="mt-2 text-sm text-gray-400">
              Start building 100% free. Upgrade only when your business needs more sites.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {[
              { name: 'Free', price: '0', sub: '/mo', features: ['1 website', 'voidbuild.com link', 'WhatsApp button', 'Free forever'], cta: 'Start Free', popular: false },
              { name: 'Starter', price: '15,000', sub: '/mo', features: ['1 website', 'Custom subdomain', '5k visits/mo', 'Fast Africa edge'], cta: 'Get Starter', popular: false },
              { name: 'Business', price: '35,000', sub: '/mo', features: ['3 websites', 'Custom domain ready', 'Visitor analytics', 'Priority WhatsApp support'], cta: 'Try Business', popular: true },
              { name: 'Pro', price: '75,000', sub: '/mo', features: ['10 websites', 'Unlimited visits', 'Online store catalog', 'VIP onboarding'], cta: 'Get Pro', popular: false },
            ].map((p, i) => (
              <div
                key={i}
                className={`rounded-2xl p-5 border flex flex-col justify-between ${
                  p.popular
                    ? 'bg-white text-gray-950 border-white shadow-xl ring-2 ring-yellow-400'
                    : 'bg-gray-800 border-gray-700 text-white'
                }`}
              >
                <div>
                  {p.popular && (
                    <div className="text-[9px] font-extrabold uppercase tracking-wider bg-yellow-400 text-gray-950 inline-flex px-2.5 py-0.5 rounded-full mb-2">
                      MOST POPULAR
                    </div>
                  )}
                  <div className="font-bold text-sm">{p.name}</div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold">UGX {p.price}</span>
                    <span className="text-[11px] opacity-70">{p.sub}</span>
                  </div>
                  <ul className="mt-4 space-y-2 text-xs opacity-90">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href="/builder"
                  className={`mt-6 block text-center py-2.5 rounded-xl text-xs font-bold transition ${
                    p.popular ? 'bg-gray-900 text-white hover:bg-black' : 'bg-white text-gray-950 hover:bg-gray-100'
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* Kampala VIP Concierge Banner */}
          <div className="mt-10 max-w-2xl mx-auto bg-white/10 border border-white/15 rounded-2xl p-5 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <div className="font-bold text-sm text-white flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-green-400" />
                <span>Prefer we set it up for you or pay directly?</span>
              </div>
              <div className="text-xs text-gray-300 mt-0.5">
                Chat with our Kampala team on WhatsApp (+256 751 391318) for instant setup assistance.
              </div>
            </div>
            <a
              href="https://wa.me/256751391318?text=Hello%20VoidBuild%2C%20I%20need%20help%20building%20my%20website"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs transition whitespace-nowrap"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-12 md:py-16 px-4 md:px-6 text-center max-w-3xl mx-auto">
        <img src="/logo.png" alt="VoidBuild" className="w-10 h-10 rounded-xl mx-auto border shadow-sm object-contain bg-white p-1" />
        <h2 className="mt-5 text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
          Your Ugandan business deserves a website.
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Create it free in 30 seconds and start receiving orders on WhatsApp.
        </p>
        <Link
          href="/builder"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 text-white font-bold text-sm hover:bg-black transition shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>Build My Website Free</span>
        </Link>
      </section>

      {/* Footer with Privacy & Terms links for Uganda Data Protection Act */}
      <footer className="py-8 px-4 md:px-6 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="" className="w-5 h-5 rounded-md object-contain border bg-white" />
          <span>© 2026 voidbuild — Built for businesses in Uganda</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Link href="/privacy" className="hover:text-gray-900 transition">Privacy Policy (Uganda Cap 97)</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-gray-900 transition">Terms of Service</Link>
          <span>•</span>
          <Link href="/pricing" className="hover:text-gray-900 transition">Pricing</Link>
        </div>
      </footer>
    </main>
  );
}
