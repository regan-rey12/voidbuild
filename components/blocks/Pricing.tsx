"use client";
import React from 'react';
import EditableText from '@/components/editor/EditableText';
import { Check, MessageCircle, Sparkles } from 'lucide-react';
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
    : 'py-16 md:py-20 px-4 md:px-6 bg-gray-50 border-t';
  const pillText = isBoutique ? 'Private Fittings • Kampala Delivery • Clear UGX Pricing' : isPharmacy ? 'Licensed care • Refill support • Delivery available' : 'Fair Prices • Transparent UGX • MTN MoMo Accepted';
  const buttonLabel = data.ctaText || (variant === 'salon' ? 'Book Package' : variant === 'restaurant' ? 'Choose Combo' : isBoutique ? 'Ask About This Option' : isPharmacy ? 'Ask About This Service' : 'Choose Package');

  return (
    <section id="pricing" className={sectionClass}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold mb-3 shadow-sm ${variant === 'salon' ? 'bg-white text-rose-900 border-rose-100' : isBoutique ? 'bg-white text-stone-800 border-stone-200' : isPharmacy ? 'bg-white text-emerald-800 border-emerald-100' : 'bg-white text-gray-800'}`}>
            <Sparkles className={`w-3.5 h-3.5 ${variant === 'salon' ? 'text-rose-500' : isBoutique ? 'text-amber-700' : isPharmacy ? 'text-emerald-600' : 'text-yellow-500'}`} />
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
                : `Hello! I saw your website and I am interested in the ${p.name}${p.price ? ` (${p.price})` : ''} option.`
            );
            const planWaLink = waNumber ? `https://wa.me/${waNumber}?text=${planText}` : '#contact';

            return (
              <div
                key={i}
                className={`relative rounded-2xl p-6 border bg-white flex flex-col justify-between transition ${
                  p.popular
                    ? variant === 'salon'
                      ? 'border-rose-300 shadow-xl ring-2 ring-rose-200'
                      : variant === 'boutique'
                      ? 'border-stone-900 shadow-xl ring-2 ring-stone-900/10'
                      : variant === 'pharmacy'
                      ? 'border-emerald-300 shadow-xl ring-2 ring-emerald-200'
                      : 'border-gray-900 shadow-xl ring-2 ring-gray-900'
                    : variant === 'salon'
                    ? 'border-rose-100 shadow-sm hover:border-rose-200'
                    : variant === 'boutique'
                    ? 'border-stone-200 shadow-sm hover:border-stone-300'
                    : variant === 'pharmacy'
                    ? 'border-emerald-100 shadow-sm hover:border-emerald-200'
                    : 'border-gray-200 shadow-sm hover:border-gray-300'
                }`}
              >
                <div>
                  {p.popular && (
                    <div className={`text-[9px] font-extrabold uppercase tracking-wider inline-flex px-2.5 py-0.5 rounded-full mb-2 ${variant === 'salon' ? 'bg-rose-500 text-white' : variant === 'restaurant' ? 'bg-amber-500 text-white' : variant === 'boutique' ? 'bg-stone-900 text-[#f7eadb]' : variant === 'pharmacy' ? 'bg-emerald-600 text-white' : 'bg-yellow-400 text-gray-950'}`}>
                      MOST POPULAR
                    </div>
                  )}

                  <div className="font-bold text-sm text-gray-900">
                    {editMode && onUpdateData ? (
                      <EditableText value={p.name} onChange={(v) => updatePlan(i, 'name', v)} editMode={editMode} as="span" className="font-bold text-sm" />
                    ) : (
                      p.name
                    )}
                  </div>

                  <div className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2">
                    {editMode && onUpdateData ? (
                      <EditableText value={p.price || ''} onChange={(v) => updatePlan(i, 'price', v)} editMode={editMode} as="span" className="text-2xl md:text-3xl font-extrabold" />
                    ) : (
                      p.price
                    )}
                  </div>

                  {p.sub && <div className="text-[11px] text-gray-500 mt-0.5">{p.sub}</div>}

                  <ul className="mt-5 space-y-2.5 text-xs text-gray-600">
                    {p.features?.map((f, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <Check className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${isBoutique ? 'text-stone-700' : isPharmacy ? 'text-emerald-600' : 'text-green-600'}`} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <a
                    href={planWaLink}
                    target={waNumber ? '_blank' : '_self'}
                    rel={waNumber ? 'noopener noreferrer' : undefined}
                    onClick={(e) => handlePlanClick(e)}
                    className="w-full py-2.5 rounded-xl text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-sm hover:opacity-95 transition"
                    style={{ backgroundColor: primary }}
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
