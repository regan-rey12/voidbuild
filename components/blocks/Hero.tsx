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
      
      <div className="relative max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-20 grid md:grid-cols-2 gap-8 md:gap-10 items-center">
        <div className={`${align === 'center' ? 'mx-auto max-w-2xl' : ''}`}>
          {data.badge && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-gray-900 text-white mb-4 shadow-sm max-w-full truncate">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse flex-shrink-0"></span>
              <span className="truncate">
                {editMode ? (
                  <EditableText value={data.badge} onChange={(v) => update('badge', v)} editMode={editMode!} as="span" className="text-[11px]" />
                ) : (
                  data.badge
                )}
              </span>
            </div>
          )}
          
          <h1 className="text-[28px] md:text-[44px] font-extrabold tracking-tight leading-[1.05] text-gray-900 break-words">
            {editMode ? (
              <EditableText value={data.title} onChange={(v) => update('title', v)} editMode={editMode!} as="span" className="text-[28px] md:text-[44px] font-extrabold leading-[1.05]" placeholder="Headline" />
            ) : (
              data.title
            )}
          </h1>

          {data.subtitle && (
            <p className="mt-4 text-sm md:text-base leading-relaxed text-gray-600 max-w-xl">
              {editMode ? (
                <EditableText value={data.subtitle} onChange={(v) => update('subtitle', v)} editMode={editMode!} as="span" multiline className="text-sm md:text-base leading-relaxed" placeholder="Subtitle" />
              ) : (
                data.subtitle
              )}
            </p>
          )}

          {data.ctaText && (
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href={data.ctaLink || '#contact'}
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                style={{ backgroundColor: primary }}
              >
                {editMode ? (
                  <EditableText value={data.ctaText} onChange={(v) => update('ctaText', v)} editMode={editMode!} as="span" className="text-sm" />
                ) : (
                  data.ctaText
                )}
              </a>
              <a href="#services" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 font-semibold text-sm hover:bg-gray-50 transition">
                View Services
              </a>
            </div>
          )}
        </div>
        
        <div className="relative mt-2 md:mt-0">
          <div className="relative aspect-[16/9] md:aspect-[4/3] rounded-xl md:rounded-2xl overflow-hidden border border-gray-100 shadow-xl bg-gray-100">
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
          </div>
        </div>
      </div>
    </section>
  );
}
