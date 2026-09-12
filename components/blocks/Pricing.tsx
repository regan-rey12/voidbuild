"use client";
import React from 'react';
import EditableText from '@/components/editor/EditableText';
import { Check, MessageCircle, BadgeCheck } from 'lucide-react';
import { recordWhatsAppClick } from '@/lib/projects';

interface PricingProps {
  data: {
    heading?: string;
    subheading?: string;
    phone?: string;
    whatsapp?: string;
    variant?: string;
    ctaText?: string;
    plans?: {
      name: string;
      price?: string;
      sub?: string;
      features: string[];
      popular?: boolean;
    }[];
  };
  style?: { primaryColor?: string };
  projectId?: string;
  editMode?: boolean;
  onUpdateData?: (newData: any) => void;
}

export default function Pricing({ data, style, projectId, editMode, onUpdateData }: PricingProps) {
  const primary = style?.primaryColor || '#111827';
  const waNumber = (data.whatsapp || data.phone || '').replace(/[^0-9]/g, '');
  const variant = data.variant || 'default';
  const isBoutique = variant === 'boutique';
  const isPharmacy = variant === 'pharmacy';
  const isHotel = variant === 'hotel';
  const isBarbershop = variant === 'barbershop';
  const isHardware = variant === 'hardware';
  const isClinic = variant === 'clinic';
  const isBakery = variant === 'bakery';
  const isGym = variant === 'gym';
  const isLaundry = variant === 'laundry';
  const isIt = variant === 'it';
  const isTutoring = variant === 'tutoring';
  const isSchool = variant === 'school';
  const isPortfolio = variant === 'portfolio';
  const isRestaurant = variant === 'restaurant';
  const isSalon = variant === 'salon';
  // Popular cards use a dark surface; applied inline so it can never lose to bg-white in CSS order
  const popularDarkBg = isBarbershop ? '#17140f' : isHardware ? '#16283a' : isGym ? '#101508' : isLaundry ? '#0c2733' : isIt ? '#131736' : isTutoring ? '#221208' : isSchool ? '#10254a' : isPortfolio ? '#1f1310' : null;

  const plans = data.plans || [
    { name: 'Standard Package', price: 'UGX 35,000', sub: 'one-time', features: ['Full Service', 'Quality Guarantee', 'WhatsApp Support'], popular: false },
    { name: 'Executive Package', price: 'UGX 60,000', sub: 'popular choice', features: ['Premium Service', 'Priority Booking', 'Free Refreshment', 'Guarantee'], popular: true },
    { name: 'VIP Full Package', price: 'UGX 120,000', sub: 'complete experience', features: ['Full Treatment', 'Home or Studio', 'Dedicated Specialist', 'VIP Care'], popular: false },
  ];

  const updateField = (field: string, value: string) => {
    if (onUpdateData) onUpdateData({ ...data, [field]: value });
  };

  const updatePlan = (idx: number, field: string, value: any) => {
    if (!onUpdateData) return;
    const newPlans = [...plans];
    newPlans[idx] = { ...newPlans[idx], [field]: value };
    onUpdateData({ ...data, plans: newPlans });
  };

  const updateFeature = (planIdx: number, featureIdx: number, value: string) => {
    if (!onUpdateData) return;
    const newPlans = [...plans];
    const features = [...(newPlans[planIdx].features || [])];
    features[featureIdx] = value;
    newPlans[planIdx] = { ...newPlans[planIdx], features };
    onUpdateData({ ...data, plans: newPlans });
  };

  const handlePlanClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (editMode) return;
    recordWhatsAppClick(projectId);
    if (!waNumber) {
      e.preventDefault();
      const el = document.getElementById('contact');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const sectionClass = variant === 'salon'
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#fff8fb] border-t'
    : variant === 'boutique'
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#f8f2eb] border-t border-stone-200'
    : variant === 'pharmacy'
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#effaf5] border-t border-emerald-100'
    : variant === 'restaurant'
    ? 'py-16 md:py-20 px-4 md:px-6 bg-white border-t border-amber-100'
    : isHotel
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#f2f0e8] border-t border-stone-200'
    : isBarbershop
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#f6f4f1] border-t border-stone-200'
    : isHardware
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#f5f6f8] border-t border-stone-200'
    : isClinic
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#eff9fb] border-t border-cyan-100'
    : isBakery
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#fdf8f0] border-t border-amber-100'
    : isGym
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#f4f6f0] border-t border-lime-100'
    : isLaundry
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#f2fafc] border-t border-cyan-100'
    : isIt
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#f6f7fd] border-t border-indigo-100'
    : isTutoring
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#fdf7f0] border-t border-orange-100'
    : isSchool
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#f3f6fd] border-t border-blue-100'
    : isPortfolio
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#faf8f7] border-t border-stone-200'
    : 'py-16 md:py-20 px-4 md:px-6 bg-gray-50 border-t';
  const pillText = isBakery ? 'Baked fresh daily • Clear UGX prices • WhatsApp orders' : isGym ? 'Day passes • Monthly plans • No lock-in contracts' : isLaundry ? 'Free pickup & delivery • Clear per-kg prices • 48-hour turnaround' : isIt ? 'Free first assessment • Monthly plans • No lock-in contracts' : isTutoring ? 'Qualified tutors • Small groups • Honest progress updates' : isSchool ? 'Termly tuition • Installments via SchoolPay • Meals included' : isPortfolio ? '40% booking deposit • 48-hour highlights • Online gallery delivery' : isBoutique ? 'Private Fittings • Kampala Delivery • Clear UGX Pricing' : isPharmacy ? 'Licensed care • Refill support • Delivery available' : isHotel ? 'Breakfast included • Couples & family packages • Flexible dates' : isBarbershop ? 'Walk-ins welcome • Clear UGX prices • Open till late' : isHardware ? 'Direct factory prices • Site delivery • Retail & wholesale' : isClinic ? 'Registered doctors • Walk-ins welcome • Clear guidance' : isSalon ? 'Walk-ins welcome • Clear UGX prices • WhatsApp booking' : isRestaurant ? 'Fresh ingredients • Clear UGX prices • WhatsApp orders' : 'Fair Prices • Transparent UGX • MTN MoMo Accepted';
  const buttonLabel = data.ctaText || (variant === 'salon' ? 'Book Package' : variant === 'restaurant' ? 'Choose Combo' : isBoutique ? 'Ask About This Option' : isPharmacy ? 'Ask About This Service' : isHotel ? 'Enquire About This Package' : isBarbershop ? 'Book This Package' : isHardware ? 'Request This Package' : isClinic ? 'Ask About This Service' : isBakery ? 'Order This Package' : isGym ? 'Join This Plan' : isLaundry ? 'Book This Bundle' : isIt ? 'Request This Plan' : isTutoring ? 'Book Sessions' : isSchool ? 'Enroll This Term' : isPortfolio ? 'Book This Package' : 'Choose Package');

  return (
    <section id="pricing" className={sectionClass}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold mb-3 shadow-sm ${variant === 'salon' ? 'bg-white text-rose-900 border-rose-100' : isBoutique ? 'bg-white text-stone-800 border-stone-200' : isPharmacy ? 'bg-white text-emerald-800 border-emerald-100' : isHotel ? 'bg-white text-emerald-900 border-emerald-100' : isBarbershop ? 'bg-white text-stone-900 border-stone-300' : isHardware ? 'bg-white text-slate-900 border-slate-300' : isClinic ? 'bg-white text-cyan-800 border-cyan-100' : isBakery ? 'bg-white text-amber-800 border-amber-100' : isGym ? 'bg-white text-lime-800 border-lime-200' : isLaundry ? 'bg-white text-cyan-800 border-cyan-100' : isIt ? 'bg-white text-indigo-800 border-indigo-100' : isTutoring ? 'bg-white text-orange-800 border-orange-100' : isSchool ? 'bg-white text-blue-800 border-blue-100' : isPortfolio ? 'bg-white text-red-800 border-red-100' : 'bg-white text-gray-800'}`}>
            <BadgeCheck className={`w-3.5 h-3.5 ${variant === 'salon' ? 'text-rose-500' : isBoutique ? 'text-amber-700' : isPharmacy ? 'text-emerald-600' : isHotel ? 'text-emerald-700' : isBarbershop ? 'text-amber-600' : isHardware ? 'text-orange-600' : isClinic ? 'text-cyan-600' : isBakery ? 'text-amber-600' : isGym ? 'text-lime-600' : isLaundry ? 'text-cyan-600' : isIt ? 'text-indigo-600' : isTutoring ? 'text-orange-600' : isSchool ? 'text-blue-600' : isPortfolio ? 'text-red-600' : 'text-yellow-500'}`} />
            <span>{pillText}</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            {editMode && onUpdateData ? (
              <EditableText value={data.heading || 'Service Packages & Pricing'} onChange={(v) => updateField('heading', v)} editMode={editMode} as="span" className="text-2xl md:text-4xl font-extrabold" />
            ) : (
              data.heading || 'Service Packages & Pricing'
            )}
          </h2>
          {data.subheading && (
            <p className="mt-2 text-xs md:text-sm text-gray-600 leading-relaxed">
              {editMode && onUpdateData ? (
                <EditableText value={data.subheading} onChange={(v) => updateField('subheading', v)} editMode={editMode} as="span" className="text-xs md:text-sm" />
              ) : (
                data.subheading
              )}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {plans.map((p, i) => {
            const planText = encodeURIComponent(
              isBoutique
                ? `Hello! I saw your boutique website and I am interested in the ${p.name}${p.price ? ` option (${p.price})` : ' option'}.`
                : isPharmacy
                ? `Hello! I saw your pharmacy website and I am interested in ${p.name}${p.price ? ` (${p.price})` : ''}.`
                : isHotel
                ? `Hello! I saw your lodge website and I am interested in the ${p.name}${p.price ? ` package (${p.price})` : ' package'}.`
                : isBarbershop
                ? `Hello! I saw your barbershop website and I would like to book the ${p.name}${p.price ? ` (${p.price})` : ''}.`
                : isHardware
                ? `Hello! I saw your hardware website and I would like to ask about the ${p.name}${p.price ? ` (${p.price})` : ''} package.`
                : isClinic
                ? `Hello! I saw your clinic website and I would like to ask about ${p.name}.`
                : isSchool
                ? `Hello! I saw your school website and I would like to ask about the ${p.name} plan.`
                : isPortfolio
                ? `Hello! I saw your photography website and I am interested in the ${p.name}${p.price ? ` (${p.price})` : ''} package.`
                : `Hello! I saw your website and I am interested in the ${p.name}${p.price ? ` (${p.price})` : ''} option.`
            );
            const planWaLink = waNumber ? `https://wa.me/${waNumber}?text=${planText}` : '#contact';

            return (
              <div
                key={i}
                style={p.popular && popularDarkBg ? { backgroundColor: popularDarkBg } : undefined}
                className={`relative rounded-2xl p-6 border bg-white flex flex-col justify-between transition ${
                  p.popular
                    ? variant === 'salon'
                      ? 'border-rose-300 shadow-xl ring-2 ring-rose-200'
                      : variant === 'boutique'
                      ? 'border-stone-900 shadow-xl ring-2 ring-stone-900/10'
                      : variant === 'pharmacy'
                      ? 'border-emerald-300 shadow-xl ring-2 ring-emerald-200'
                      : isHotel
                      ? 'border-emerald-800 shadow-xl ring-2 ring-emerald-800/15'
                      : isBarbershop
                      ? 'border-amber-500/40 shadow-xl ring-2 ring-amber-400/15'
                      : isHardware
                      ? 'border-orange-500/40 shadow-xl ring-2 ring-orange-400/15'
                      : isClinic
                      ? 'border-cyan-300 shadow-xl ring-2 ring-cyan-200'
                      : isGym
                      ? 'border-lime-500/40 shadow-xl ring-2 ring-lime-400/15'
                      : isLaundry
                      ? 'border-cyan-500/40 shadow-xl ring-2 ring-cyan-400/15'
                      : isIt
                      ? 'border-indigo-500/40 shadow-xl ring-2 ring-indigo-400/15'
                      : isTutoring
                      ? 'border-orange-500/40 shadow-xl ring-2 ring-orange-400/15'
                      : isSchool
                      ? 'border-blue-500/40 shadow-xl ring-2 ring-blue-400/15'
                      : isPortfolio
                      ? 'border-red-500/40 shadow-xl ring-2 ring-red-400/15'
                      : 'border-gray-900 shadow-xl ring-2 ring-gray-900'
                    : variant === 'salon'
                    ? 'border-rose-100 shadow-sm hover:border-rose-200'
                    : variant === 'boutique'
                    ? 'border-stone-200 shadow-sm hover:border-stone-300'
                    : variant === 'pharmacy'
                    ? 'border-emerald-100 shadow-sm hover:border-emerald-200'
                    : isHotel
                    ? 'border-stone-200 shadow-sm hover:border-stone-300'
                    : isBarbershop
                    ? 'border-stone-300 shadow-sm hover:border-amber-800/40'
                    : isHardware
                    ? 'border-stone-300 shadow-sm hover:border-orange-700/40'
                    : isClinic
                    ? 'border-cyan-100 shadow-sm hover:border-cyan-200'
                    : isBakery
                    ? 'border-amber-100 shadow-sm hover:border-amber-200'
                    : isGym
                    ? 'border-stone-300 shadow-sm hover:border-lime-700/40'
                    : isLaundry
                    ? 'border-cyan-100 shadow-sm hover:border-cyan-200'
                    : isIt
                    ? 'border-indigo-100 shadow-sm hover:border-indigo-200'
                    : isTutoring
                    ? 'border-orange-100 shadow-sm hover:border-orange-200'
                    : isSchool
                    ? 'border-blue-100 shadow-sm hover:border-blue-200'
                    : isPortfolio
                    ? 'border-stone-200 shadow-sm hover:border-red-800/30'
                    : 'border-gray-200 shadow-sm hover:border-gray-300'
                }`}
              >
                <div>
                  {p.popular && (
                    <div className={`text-[9px] font-extrabold uppercase tracking-wider inline-flex px-2.5 py-0.5 rounded-full mb-2 ${variant === 'salon' ? 'bg-rose-600 text-white' : variant === 'restaurant' ? 'bg-amber-500 text-[#231509]' : variant === 'boutique' ? 'bg-stone-900 text-[#f7eadb]' : variant === 'pharmacy' ? 'bg-emerald-700 text-white' : isHotel ? 'bg-emerald-800 text-white' : isBarbershop ? 'bg-[#C9962E] text-[#221604]' : isHardware ? 'bg-[#C2410C] text-white' : isClinic ? 'bg-cyan-700 text-white' : isBakery ? 'bg-amber-500 text-amber-950' : isGym ? 'bg-lime-400 text-black' : isLaundry ? 'bg-cyan-700 text-white' : isIt ? 'bg-indigo-600 text-white' : isTutoring ? 'bg-orange-600 text-white' : isSchool ? 'bg-blue-700 text-white' : isPortfolio ? 'bg-red-600 text-white' : 'bg-yellow-400 text-gray-950'}`}>
                      MOST POPULAR
                    </div>
                  )}

                  <div className={`font-bold text-sm ${(isBarbershop || isHardware || isGym || isLaundry || isIt || isTutoring || isSchool || isPortfolio) && p.popular ? 'text-white' : 'text-gray-900'}`}>
                    {editMode && onUpdateData ? (
                      <EditableText value={p.name} onChange={(v) => updatePlan(i, 'name', v)} editMode={editMode} as="span" className="font-bold text-sm" />
                    ) : (
                      p.name
                    )}
                  </div>

                  <div className={`text-2xl md:text-3xl font-extrabold mt-2 ${(isBarbershop || isHardware || isGym || isLaundry || isIt || isTutoring || isSchool || isPortfolio) && p.popular ? 'text-white' : 'text-gray-900'}`}>
                    {editMode && onUpdateData ? (
                      <EditableText value={p.price || ''} onChange={(v) => updatePlan(i, 'price', v)} editMode={editMode} as="span" className="text-2xl md:text-3xl font-extrabold" />
                    ) : (
                      p.price
                    )}
                  </div>

                  {p.sub && (
                    <div className={`text-[11px] mt-0.5 ${(isBarbershop || isHardware || isGym || isLaundry || isIt || isTutoring || isSchool || isPortfolio) && p.popular ? 'text-white/55' : 'text-gray-500'}`}>
                      {editMode && onUpdateData ? (
                        <EditableText value={p.sub} onChange={(v) => updatePlan(i, 'sub', v)} editMode={editMode} as="span" className="text-[11px]" />
                      ) : (
                        p.sub
                      )}
                    </div>
                  )}

                  <ul className={`mt-5 space-y-2.5 text-xs ${(isBarbershop || isHardware || isGym || isLaundry || isIt || isTutoring || isSchool || isPortfolio) && p.popular ? 'text-white/75' : 'text-gray-600'}`}>
                    {p.features?.map((f, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <Check className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${isBoutique ? 'text-stone-700' : isPharmacy ? 'text-emerald-600' : isHotel ? 'text-emerald-700' : isBarbershop ? (p.popular ? 'text-amber-400' : 'text-amber-700') : isHardware ? (p.popular ? 'text-orange-400' : 'text-orange-700') : isClinic ? 'text-cyan-600' : isBakery ? 'text-amber-600' : isGym ? (p.popular ? 'text-lime-400' : 'text-lime-700') : isLaundry ? (p.popular ? 'text-cyan-300' : 'text-cyan-600') : isIt ? (p.popular ? 'text-indigo-300' : 'text-indigo-600') : isTutoring ? (p.popular ? 'text-orange-300' : 'text-orange-700') : isSchool ? (p.popular ? 'text-blue-300' : 'text-blue-600') : isPortfolio ? (p.popular ? 'text-red-300' : 'text-red-600') : 'text-green-600'}`} />
                        <span>
                          {editMode && onUpdateData ? (
                            <EditableText value={f} onChange={(v) => updateFeature(i, j, v)} editMode={editMode} as="span" className="text-xs" />
                          ) : (
                            f
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`mt-6 pt-4 border-t ${(isBarbershop || isHardware || isGym || isLaundry || isIt || isTutoring || isSchool || isPortfolio) && p.popular ? 'border-white/10' : 'border-gray-100'}`}>
                  <a
                    href={planWaLink}
                    target={waNumber ? '_blank' : '_self'}
                    rel={waNumber ? 'noopener noreferrer' : undefined}
                    onClick={(e) => handlePlanClick(e)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-sm hover:opacity-95 transition ${isBarbershop && p.popular ? 'text-[#221604]' : isGym && p.popular ? 'text-[#14210a]' : 'text-white'}`}
                    style={{ backgroundColor: isBarbershop && p.popular ? '#C9962E' : isHardware && p.popular ? '#C2410C' : isGym && p.popular ? '#A3E635' : primary }}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{buttonLabel}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
