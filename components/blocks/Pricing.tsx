"use client";
import React from 'react';
import EditableText from '../editor/EditableText';
import { Check, MessageCircle, Sparkles } from 'lucide-react';
import { recordWhatsAppClick } from '../../lib/projects';

interface PricingProps {
  data: {
    heading?: string;
    subheading?: string;
    phone?: string;
    whatsapp?: string;
    plans?: {
      name: string;
      price: string;
      sub?: string;
      features: string[];
      popular?: boolean;
    }[];
  };
  style?: { primaryColor?: string };
  editMode?: boolean;
  onUpdateData?: (newData: any) => void;
}

export default function Pricing({ data, style, editMode, onUpdateData }: PricingProps) {
  const primary = style?.primaryColor || '#111827';
  const waNumber = (data.whatsapp || data.phone || '').replace(/[^0-9]/g, '');

  const plans = data.plans || [
    { name: "Standard Package", price: "UGX 35,000", sub: "one-time", features: ["Full Service", "Quality Guarantee", "WhatsApp Support"], popular: false },
    { name: "Executive Package", price: "UGX 60,000", sub: "popular choice", features: ["Premium Service", "Priority Booking", "Free Refreshment", "Guarantee"], popular: true },
    { name: "VIP Full Package", price: "UGX 120,000", sub: "complete experience", features: ["Full Treatment", "Home or Studio", "Dedicated Specialist", "VIP Care"], popular: false },
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

  const handlePlanClick = (e: React.MouseEvent<HTMLAnchorElement>, planName: string) => {
    if (editMode) return;
    recordWhatsAppClick();
    if (!waNumber) {
      e.preventDefault();
      const el = document.getElementById('contact');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="pricing" className="py-16 md:py-20 px-4 md:px-6 bg-gray-50 border-t">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border text-xs font-semibold mb-3 shadow-sm text-gray-800">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            <span>Fair Prices • Transparent UGX • MTN MoMo Accepted</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            {editMode && onUpdateData ? (
              <EditableText value={data.heading || 'Service Packages & Pricing'} onChange={(v) => updateField('heading', v)} editMode={editMode} as="span" className="text-2xl md:text-4xl font-extrabold" />
            ) : (
              data.heading || 'Service Packages & Pricing'
            )}
          </h2>
          {data.subheading && (
            <p className="mt-2 text-xs md:text-sm text-gray-600">
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
            const planText = encodeURIComponent(`Hello! I saw your website and I am interested in the ${p.name} (${p.price}) package.`);
            const planWaLink = waNumber ? `https://wa.me/${waNumber}?text=${planText}` : '#contact';

            return (
              <div
                key={i}
                className={`relative rounded-2xl p-6 border bg-white flex flex-col justify-between transition ${
                  p.popular ? 'border-gray-900 shadow-xl ring-2 ring-gray-900' : 'border-gray-200 shadow-sm hover:border-gray-300'
                }`}
              >
                <div>
                  {p.popular && (
                    <div className="text-[9px] font-extrabold uppercase tracking-wider bg-yellow-400 text-gray-950 inline-flex px-2.5 py-0.5 rounded-full mb-2">
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
                      <EditableText value={p.price} onChange={(v) => updatePlan(i, 'price', v)} editMode={editMode} as="span" className="text-2xl md:text-3xl font-extrabold" />
                    ) : (
                      p.price
                    )}
                  </div>
                  
                  {p.sub && (
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {p.sub}
                    </div>
                  )}

                  <ul className="mt-5 space-y-2.5 text-xs text-gray-600">
                    {p.features?.map((f, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
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
                    onClick={(e) => handlePlanClick(e, p.name)}
                    className="w-full py-2.5 rounded-xl text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-sm hover:opacity-95 transition"
                    style={{ backgroundColor: primary }}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Choose Package on WhatsApp</span>
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
