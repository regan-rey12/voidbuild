"use client";
import React from 'react';
import EditableText from '../editor/EditableText';

interface StatsProps {
  data: {
    heading?: string;
    stats?: { number: string; label: string }[];
  };
  style?: { primaryColor?: string };
  editMode?: boolean;
  onUpdateData?: (newData: any) => void;
}

export default function Stats({ data, style, editMode, onUpdateData }: StatsProps) {
  const primary = style?.primaryColor || '#111827';
  const stats = data.stats || [
    { number: "500+", label: "Happy Customers" },
    { number: "100%", label: "Satisfaction Guaranteed" },
    { number: "30 Mins", label: "Average Delivery Time" },
  ];

  const updateStat = (idx: number, field: string, value: string) => {
    if (!onUpdateData) return;
    const newStats = [...stats];
    newStats[idx] = { ...newStats[idx], [field]: value };
    onUpdateData({ ...data, stats: newStats });
  };

  return (
    <section id="stats" className="py-12 md:py-16 px-4 md:px-6 bg-white border-y">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        {stats.map((s, i) => (
          <div key={i} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="text-3xl md:text-4xl font-extrabold" style={{ color: primary }}>
              {editMode && onUpdateData ? (
                <EditableText value={s.number} onChange={(v) => updateStat(i, 'number', v)} editMode={editMode} as="span" className="text-3xl md:text-4xl font-extrabold" />
              ) : (
                s.number
              )}
            </div>
            <div className="mt-1.5 text-xs md:text-sm text-gray-600 font-medium">
              {editMode && onUpdateData ? (
                <EditableText value={s.label} onChange={(v) => updateStat(i, 'label', v)} editMode={editMode} as="span" className="text-xs md:text-sm font-medium" />
              ) : (
                s.label
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
