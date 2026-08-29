"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import TopNav from '@/components/TopNav';
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
  Dumbbell,
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

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash && window.location.hash.includes('access_token')) {
      window.location.href = `/auth/callback${window.location.hash}`;
    }
  }, []);

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

  const filteredTemplates = activeFilter === 'all' ? templates : templates.filter((t) => t.category === activeFilter);

  return (
    <main className="min-h-screen bg-white">
      <TopNav currentPage="home" />

      <section className="px-4 md:px-6 pt-4 pb-10 md:pt-6 md:pb-14 max-w-6xl mx-auto grid md:grid-cols-[1.15fr_0.85fr] gap-8 md:gap-8 items-start">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border text-[10px] sm:text-[11px] font-semibold text-gray-800">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>Built in Kampala • Designed for SMEs across East Africa</span>
          </div>

          <h1 className="mt-5 text-3xl md:text-5xl font-extrabold leading-[1.08] tracking-tight text-gray-900">
            Launch a professional business website and
            <span className="mt-2 block text-gray-950 font-black leading-[1.02]">
              <span className="inline-block rounded-lg bg-yellow-200 px-2 py-0.5 sm:px-2.5 sm:py-1">
                win more
              </span>
              <span className="mt-1 block w-fit rounded-lg bg-yellow-200 px-2 py-0.5 sm:mt-0 sm:ml-2 sm:inline-block sm:w-auto sm:px-2.5 sm:py-1">
                customers online
              </span>
            </span>
          </h1>

          <p className="mt-4 text-[15px] md:text-lg text-gray-600 leading-relaxed max-w-xl">
            VoidBuild helps small businesses publish a clean mobile website with pricing, customer contact, and fast setup support. Built in Kampala, it works especially well for businesses in Uganda and can also serve growing businesses across East Africa.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/builder"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-black transition shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Start Building Free</span>
            </Link>
            <a
              href="https://wa.me/256751391318?text=Hello%20VoidBuild%2C%20I%20need%20help%20setting%20up%20my%20business%20website"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm transition shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Get Setup Help</span>
            </a>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <a href="#templates" className="font-semibold text-gray-700 hover:text-black underline underline-offset-4">
              Explore 15 templates
            </a>
            <span>•</span>
            <a href="#pricing" className="font-semibold text-gray-700 hover:text-black underline underline-offset-4">
              See pricing
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-green-600" />
              <span>1st site free forever</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-green-600" />
              <span>Mobile Money and card ready</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-green-600" />
              <span>Live support from Kampala</span>
            </div>
          </div>
        </div>

        <div className="hidden md:block relative mt-2">
          <div className="rounded-2xl border border-gray-200 shadow-xl overflow-hidden bg-gray-50 p-2">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="h-8 bg-gray-900 flex items-center px-3 gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                <div className="ml-3 text-[10px] text-gray-300 font-mono truncate">aisha-braids.voidbuild.com</div>
              </div>

              <div className="p-4 md:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="" className="w-7 h-7 object-contain flex-shrink-0" />
                    <div>
                      <div className="font-bold text-sm text-gray-900">Aisha Beauty Braids</div>
                      <div className="text-[10px] text-gray-500">Wandegeya Market • Open 7am - 9pm</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-green-600" />
                    <span>Ready to Share</span>
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
                  <span>Use This Style for My Business</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-12 md:py-16 px-4 md:px-6 border-y">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            {
              icon: MessageCircle,
              title: 'Help customers reach you faster',
              desc: 'Customers can message, ask, order, or book quickly through the contact options on your website.',
            },
            {
              icon: Zap,
              title: 'Show clear pricing and offers',
              desc: 'Display your services and prices clearly so customers understand what you sell at a glance.',
            },
            {
              icon: ShieldCheck,
              title: 'Launch without technical stress',
              desc: 'Start free, edit quickly, and ask our Kampala team for setup help when you need it.',
            },
            {
              icon: Sparkles,
              title: 'Look more trusted online',
              desc: 'Share a clean business link on WhatsApp, Instagram bio, TikTok bio, Google Business, and beyond.',
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

      <section className="py-10 md:py-14 px-4 md:px-6 max-w-6xl mx-auto">
        <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white p-6 md:p-8 grid md:grid-cols-[1.2fr_0.8fr] gap-6 items-center shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold tracking-wide">
              <PhoneCall className="w-3.5 h-3.5 text-green-400" />
              <span>Prefer we do it with you?</span>
            </div>
            <h2 className="mt-4 text-2xl md:text-3xl font-extrabold tracking-tight">Get guided setup support from our Kampala team</h2>
            <p className="mt-2 text-sm text-gray-300 max-w-2xl">
              If you already have photos, prices, phone number, and business location, we can help you move faster. Start free yourself or reach out for guided setup.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-sm">
            <div className="font-bold text-white">Fast setup checklist</div>
            <div className="mt-3 space-y-2 text-gray-300 text-xs">
              <div>1. Business name and category</div>
              <div>2. Phone / WhatsApp number</div>
              <div>3. Price list and opening hours</div>
              <div>4. Photos and location</div>
            </div>
            <a
              href="https://wa.me/256751391318?text=Hello%20VoidBuild%2C%20I%20want%20guided%20help%20launching%20my%20website"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat for Setup Help</span>
            </a>
          </div>
        </div>
      </section>

      <section id="templates" className="py-12 md:py-20 px-4 md:px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 text-yellow-900 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start with a proven layout, then customize it</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">15 business templates ready to launch</h2>
          <p className="mt-2 text-sm text-gray-600">Pick your industry. Update photos, services, pricing, and phone number in minutes.</p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {[
            { id: 'all', label: 'All Templates (15)' },
            { id: 'beauty_health', label: 'Health & Beauty (5)' },
            { id: 'food_bakery', label: 'Food & Bakery (2)' },
            { id: 'retail_auto', label: 'Shops, Auto & Hardware (4)' },
            { id: 'community_hotel', label: 'Hotels, School & Community (4)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                activeFilter === tab.id ? 'bg-gray-900 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gaap-5 mt-8">
          {filteredTemplates.map((t) => {
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
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800">{t.highlight}</span>
                  </div>

                  <h3 className="font-bold mt-4 text-base text-gray-900 group-hover:text-black">{t.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{t.desc}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-gray-900 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">{t.price}</span>
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
            <span>Or generate a custom business website</span>
          </Link>
        </div>
      </section>

      <section id="pricing" className="py-12 md:py-20 px-4 md:px-6 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Simple pricing that grows with your business</h2>
            <p className="mt-2 text-sm text-gray-400">Start free, publish quickly, and upgrade only when you need more websites or more support.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {[
              { name: 'Free', price: '0', sub: 'Free forever', approx: '', features: ['1 website', 'voidbuild.com link', 'WhatsApp button', 'Free forever'], cta: 'Start Free', popular: false },
              { name: 'Starter', price: '50,000', sub: '/year', approx: 'About UGX 4,167 / month', features: ['1 website', 'Custom subdomain', '5k visits/mo', 'Fast Africa edge'], cta: 'Get Starter', popular: false },
              { name: 'Business', price: '100,000', sub: '/year', approx: 'About UGX 8,333 / month', features: ['3 websites', 'Domain connection assistance', 'Visitor analytics', 'Priority WhatsApp support'], cta: 'Try Business', popular: true },
              { name: 'Pro', price: '200,000', sub: '/year', approx: 'About UGX 16,667 / month', features: ['10 websites', 'Unlimited visits', 'Online store catalog', 'VIP onboarding'], cta: 'Get Pro', popular: false },
            ].map((p, i) => (
              <div
                key={i}
                className={`rounded-2xl p-5 border flex flex-col justify-between ${
                  p.popular ? 'bg-white text-gray-950 border-white shadow-xl ring-2 ring-yellow-400' : 'bg-gray-800 border-gray-700 text-white'
                }`}
              >
                <div>
                  {p.popular && (
                    <div className="text-[9px] font-extrabold uppercase tracking-wider bg-yellow-400 text-gray-950 inline-flex px-2.5 py-0.5 rounded-full mb-2">
                      MOST POPULAR
                    </div>
                  )}
                  <div className="font-bold text-sm">{p.name}</div>
                  <div className="mt-2 flex items-baseline gap-1 flex-wrap">
                    <span className="text-2xl font-extrabold">UGX {p.price}</span>
                    <span className="text-[11px] opacity-70">{p.sub}</span>
                  </div>
                  {p.approx && <div className="mt-1 text-[11px] opacity-70">{p.approx}</div>}
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

          <div className="mt-5 max-w-3xl mx-auto text-center text-xs text-gray-300 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
            Business and Pro domain connections are currently handled through an assisted rollout. Your VoidBuild subdomain works immediately, and our team can help with custom domains on request.
          </div>

          <div className="mt-10 max-w-2xl mx-auto bg-white/10 border border-white/15 rounded-2xl p-5 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <div className="font-bold text-sm text-white flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-green-400" />
                <span>Prefer guided setup before you pay?</span>
              </div>
              <div className="text-xs text-gray-300 mt-0.5">Chat with our Kampala team on WhatsApp (+256 751 391318) for fast launch assistance.</div>
            </div>
            <a
              href="https://wa.me/256751391318?text=Hello%20VoidBuild%2C%20I%20want%20guided%20help%20before%20launching%20my%20website"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs transition whitespace-nowrap"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-18 px-4 md:px-6 max-w-4xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">Questions business owners ask before launching</h2>
          <p className="mt-2 text-sm text-gray-600">Straight answers to the most common trust and setup questions.</p>
        </div>

        <div className="mt-8 space-y-4">
          {[
            {
              q: 'Do I need design or coding skills?',
              a: 'No. Start with a template or generate a layout, then edit your phone number, services, prices, and photos. If you get stuck, our team can help.',
            },
            {
              q: 'What happens after I save my website?',
              a: 'Your website gets a live shareable link immediately. You can send it to customers, add it to social bios, and come back later to edit from your dashboard.',
            },
            {
              q: 'Can I use my own domain name?',
              a: 'Your VoidBuild subdomain works instantly. Custom domains for Business and Pro are currently handled through an assisted rollout, and we can help you request setup when needed.',
            },
            {
              q: 'How do payments work?',
              a: 'Paid upgrades use Pesapal with MTN MoMo, Airtel Money, and card support. Your plan activates only after payment is verified successfully.',
            },
          ].map((item) => (
            <div key={item.q} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="font-bold text-sm text-gray-900">{item.q}</div>
              <div className="text-sm text-gray-600 mt-2 leading-relaxed">{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-10 md:py-12 px-4 md:px-6 text-center max-w-3xl mx-auto">
        <img src="/logo.png" alt="VoidBuild" className="w-10 h-10 object-contain mx-auto" />
        <h2 className="mt-5 text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">Your business deserves a website that is easy to share and easy to trust.</h2>
        <p className="mt-2 text-sm text-gray-600">Start free, publish quickly, and ask for help whenever you need guided setup.</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/builder"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gray-900 text-white font-bold text-sm hover:bg-black transition shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>Build My Website Free</span>
          </Link>
          <a
            href="https://wa.me/256751391318?text=Hello%20VoidBuild%2C%20I%20want%20help%20launching%20my%20website"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm transition shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Talk to Us on WhatsApp</span>
          </a>
        </div>
      </section>

      <footer className="py-8 px-4 md:px-6 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="VoidBuild" className="w-5 h-5 object-contain flex-shrink-0" />
          <span>© 2026 voidbuild — Built in Uganda for growing businesses</span>
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
