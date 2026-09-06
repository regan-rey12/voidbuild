"use client";
import React from 'react';
import EditableText from '@/components/editor/EditableText';

interface StatsProps {
  data: {
    heading?: string;
    variant?: string;
    stats?: { number: string; label: string }[];
  };
  style?: { primaryColor?: string };
  editMode?: boolean;
  onUpdateData?: (newData: any) => void;
}

export default function Stats({ data, style, editMode, onUpdateData }: StatsProps) {
  const primary = style?.primaryColor || '#111827';
  const variant = data.variant || 'default';
  const isBoutique = variant === 'boutique';
  const isPharmacy = variant === 'pharmacy';
  const isHotel = variant === 'hotel';
  const isBarbershop = variant === 'barbershop';
  const isHardware = variant === 'hardware';
  const stats = data.stats || [
    { number: '500+', label: 'Happy Customers' },
    { number: '100%', label: 'Satisfaction Guaranteed' },
    { number: '30 Mins', label: 'Average Delivery Time' },
  ];

  const updateStat = (idx: number, field: string, value: string) => {
    if (!onUpdateData) return;
    const newStats = [...stats];
    newStats[idx] = { ...newStats[idx], [field]: value };
    onUpdateData({ ...data, stats: newStats });
  };

  return (
    <section id="stats" className={isBoutique ? 'py-16 md:py-20 px-4 md:px-6 bg-[#f8f2eb] border-y border-stone-200' : isPharmacy ? 'py-16 md:py-20 px-4 md:px-6 bg-[#effaf5] border-y border-emerald-100' : isHotel ? 'py-16 md:py-20 px-4 md:px-6 bg-[#0e2b21]' : isBarbershop ? 'py-16 md:py-20 px-4 md:px-6 bg-[#141210]' : isHardware ? 'py-16 md:py-20 px-4 md:px-6 bg-[#16283a]' : 'py-12 md:py-16 px-4 md:px-6 bg-white border-y'}>
      <div className="max-w-6xl mx-auto">
        {data.heading && (
          <div className="text-center max-w-2xl mx-auto mb-6 md:mb-8">
            <h2 className={isBoutique || isPharmacy ? 'text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight' : isHotel || isBarbershop || isHardware ? 'text-2xl md:text-4xl font-extrabold text-white tracking-tight' : 'text-xl md:text-2xl font-bold text-gray-900 tracking-tight'}>
              {editMode && onUpdateData ? (
                <EditableText value={data.heading} onChange={(v) => onUpdateData({ ...data, heading: v })} editMode={editMode} as="span" className={isBoutique || isPharmacy || isHotel || isBarbershop || isHardware ? 'text-2xl md:text-4xl font-extrabold' : 'text-xl md:text-2xl font-bold'} />
              ) : (
                data.heading
              )}
            </h2>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {stats.map((s, i) => (
            <div key={i} className={isBoutique ? 'p-6 rounded-[24px] bg-white border border-stone-200 shadow-sm' : isPharmacy ? 'p-6 rounded-[24px] bg-white border border-emerald-100 shadow-sm' : isHotel || isBarbershop || isHardware ? 'p-6 rounded-[24px] bg-white/[0.06] border border-white/10' : 'p-4 rounded-2xl bg-gray-50 border border-gray-100'}>
              <div className="text-3xl md:text-4xl font-extrabold" style={{ color: isHotel || isBarbershop ? '#e3b04b' : isHardware ? '#fb923c' : primary }}>
                {editMode && onUpdateData ? (
                  <EditableText value={s.number} onChange={(v) => updateStat(i, 'number', v)} editMode={editMode} as="span" className="text-3xl md:text-4xl font-extrabold" />
                ) : (
                  s.number
                )}
              </div>
              <div className={`mt-1.5 font-medium ${isBoutique || isPharmacy ? 'text-[13px] md:text-sm text-gray-600' : isHotel || isBarbershop || isHardware ? 'text-[13px] md:text-sm text-white/75' : 'text-xs md:text-sm text-gray-600'}`}>
                {editMode && onUpdateData ? (
                  <EditableText value={s.label} onChange={(v) => updateStat(i, 'label', v)} editMode={editMode} as="span" className={isBoutique || isPharmacy || isHotel || isBarbershop || isHardware ? 'text-[13px] md:text-sm font-medium' : 'text-xs md:text-sm font-medium'} />
                ) : (
                  s.label
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
