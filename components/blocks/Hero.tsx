"use client";
import React from 'react';
import EditableText from '../editor/EditableText';
import EditableImage from '../editor/EditableImage';

interface HeroProps {
  data: {
    title: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    image?: string;
    badge?: string;
  };
  style?: {
    primaryColor?: string;
    alignment?: 'left' | 'center';
  };
  editMode?: boolean;
  onUpdateData?: (newData: any) => void;
}

export default function Hero({ data, style, editMode, onUpdateData }: HeroProps) {
  const primary = style?.primaryColor || '#111827';
  const align = style?.alignment || 'left';

  const update = (field: string, value: string) => {
    if (onUpdateData) {
      onUpdateData({ ...data, [field]: value });
    }
  };

  return (
    <section className={`relative overflow-hidden bg-white ${align === 'center' ? 'text-center' : ''}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ backgroundColor: primary }} />
      
      <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div className={`${align === 'center' ? 'mx-auto max-w-2xl' : ''}`}>
          {data.badge && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-900 text-white mb-5 shadow-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              {editMode ? (
                <EditableText value={data.badge} onChange={(v) => update('badge', v)} editMode={editMode!} as="span" className="text-xs" />
              ) : (
                data.badge
              )}
            </div>
          )}
          
          <div className="text-4xl md:text-[48px] font-extrabold tracking-tight leading-[1.1] text-gray-900">
            {editMode ? (
              <EditableText value={data.title} onChange={(v) => update('title', v)} editMode={editMode!} as="h1" className="text-4xl md:text-[48px] font-extrabold" placeholder="Your business headline" />
            ) : (
              <h1>{data.title}</h1>
            )}
          </div>

          {data.subtitle && (
            <div className="mt-5 text-[17px] leading-relaxed text-gray-600 max-w-xl">
              {editMode ? (
                <EditableText value={data.subtitle} onChange={(v) => update('subtitle', v)} editMode={editMode!} as="p" multiline className="text-[17px] leading-relaxed" placeholder="Describe your business" />
              ) : (
                <p>{data.subtitle}</p>
              )}
            </div>
          )}

          {data.ctaText && (
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={data.ctaLink || '#contact'}
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl text-white font-bold shadow-lg shadow-gray-900/10 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                style={{ backgroundColor: primary }}
              >
                {editMode ? (
                  <EditableText value={data.ctaText} onChange={(v) => update('ctaText', v)} editMode={editMode!} as="span" />
                ) : (
                  data.ctaText
                )}
                <span className="ml-2">→</span>
              </a>
              <a href="#services" className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-900 font-semibold hover:bg-gray-50 transition shadow-sm">
                View Services
              </a>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white"></div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-white"></div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 border-2 border-white"></div>
              </div>
              <span className="text-gray-600">Trusted by 100+ in Kampala</span>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden border border-gray-100 shadow-2xl shadow-gray-900/10 bg-gray-100">
            {editMode ? (
              <EditableImage
                imageKeyword={data.image || ''}
                alt={data.title}
                editMode={editMode}
                onChange={(newUrl) => update('image', newUrl)}
                className="w-full h-full object-cover"
              />
            ) : (
              data.image && (
                <img 
                  src={data.image.startsWith('http') || data.image.startsWith('data:') ? data.image : `https://source.unsplash.com/800x600/?${encodeURIComponent(data.image)}`} 
                  alt={data.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </div>
          
          <div className="absolute -bottom-6 -left-6 bg-white shadow-xl shadow-gray-900/10 rounded-2xl p-4 border border-gray-100 hidden md:flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: primary }}>4.9</div>
            <div>
              <div className="font-bold text-sm">4.9/5 Rating</div>
              <div className="text-xs text-gray-500">87 reviews</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
