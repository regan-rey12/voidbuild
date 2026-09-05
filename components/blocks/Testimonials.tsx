"use client";
import React from 'react';
import { Star } from 'lucide-react';
import EditableText from '@/components/editor/EditableText';

interface TestimonialsProps {
  data: {
    heading?: string;
    subheading?: string;
    variant?: string;
    testimonials: {
      name: string;
      role?: string;
      text: string;
      rating?: number;
    }[];
  };
  style?: { primaryColor?: string };
  editMode?: boolean;
  onUpdateData?: (newData: any) => void;
}

export default function Testimonials({ data, style, editMode, onUpdateData }: TestimonialsProps) {
  const primary = style?.primaryColor || '#111827';
  const variant = data.variant || 'default';
  const isBoutique = variant === 'boutique';
  const isPharmacy = variant === 'pharmacy';
  const testimonials = data.testimonials || [
    { name: 'Grace N.', role: 'Wandegeya', text: 'Aisha is the best! My knotless braids lasted over 5 weeks.', rating: 5 },
    { name: 'Musa K.', role: 'Mbale', text: 'Fast delivery right to my building site. Fair cement price.', rating: 5 },
    { name: 'Sarah L.', role: 'Kampala', text: 'WhatsApp booking was so smooth, received my food in 25 mins.', rating: 5 },
  ];

  const updateField = (field: string, value: string) => {
    if (onUpdateData) onUpdateData({ ...data, [field]: value });
  };

  const updateTestimonial = (idx: number, field: string, value: string) => {
    if (!onUpdateData) return;
    const newItems = [...testimonials];
    newItems[idx] = { ...newItems[idx], [field]: value };
    onUpdateData({ ...data, testimonials: newItems });
  };

  const sectionClass = variant === 'salon'
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#fff8fb] border-t'
    : variant === 'boutique'
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#fcf8f3] border-t border-stone-200'
    : variant === 'pharmacy'
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#f7fcfa] border-t border-emerald-100'
    : 'py-16 md:py-20 px-4 md:px-6 bg-gray-50 border-t';
  const badgeLabel = variant === 'restaurant' ? 'Guest Favorite' : isBoutique ? 'Style Favorite' : isPharmacy ? 'Verified Customer' : 'Verified Client';

  return (
    <section id="testimonials" className={sectionClass}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            {editMode && onUpdateData ? (
              <EditableText value={data.heading || 'What Our Clients Say'} onChange={(v) => updateField('heading', v)} editMode={editMode} as="span" className="text-2xl md:text-3xl font-extrabold" />
            ) : (
              data.heading || 'What Our Clients Say'
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
          {testimonials.map((t, i) => (
            <div key={i} className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-between hover:shadow-md transition ${variant === 'salon' ? 'bg-white border-rose-100' : isBoutique ? 'bg-white border-stone-200' : isPharmacy ? 'bg-white border-emerald-100' : 'bg-white border-gray-200'}`}>
              <div>
                <div className="flex items-center gap-1 text-yellow-400">
                  {[...Array(t.rating || 5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className={`mt-4 text-gray-700 leading-relaxed italic ${isBoutique || isPharmacy ? 'text-sm md:text-[15px]' : 'text-xs md:text-sm'}`}>
                  &ldquo;
                  {editMode && onUpdateData ? (
                    <EditableText value={t.text} onChange={(v) => updateTestimonial(i, 'text', v)} editMode={editMode} as="span" multiline className={isBoutique || isPharmacy ? 'text-sm md:text-[15px]' : 'text-xs md:text-sm'} />
                  ) : (
                    t.text
                  )}
                  &rdquo;
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-xs md:text-sm text-gray-900">
                    {editMode && onUpdateData ? (
                      <EditableText value={t.name} onChange={(v) => updateTestimonial(i, 'name', v)} editMode={editMode} as="span" className="font-bold text-xs md:text-sm" />
                    ) : (
                      t.name
                    )}
                  </div>
                  {t.role && (
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {editMode && onUpdateData ? (
                        <EditableText value={t.role} onChange={(v) => updateTestimonial(i, 'role', v)} editMode={editMode} as="span" className="text-[11px]" />
                      ) : (
                        t.role
                      )}
                    </div>
                  )}
                </div>
                <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${variant === 'salon' ? 'bg-rose-50 text-rose-700 border-rose-200' : variant === 'restaurant' ? 'bg-amber-50 text-amber-700 border-amber-200' : isBoutique ? 'bg-stone-100 text-stone-700 border-stone-200' : isPharmacy ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-green-50 text-green-700 border-green-200'}`} style={variant === 'salon' ? { color: primary } : undefined}>
                  {badgeLabel}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
