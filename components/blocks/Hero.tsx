"use client";
import React, { useState } from 'react';
import EditableText from '@/components/editor/EditableText';
import EditableImage from '@/components/editor/EditableImage';
import ImagePickerModal from '@/components/editor/ImagePickerModal';
import { ArrowRight, Check, Image as ImageIcon } from 'lucide-react';

interface HeroProps {
  data: {
    title: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    image?: string;
    badge?: string;
    variant?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
    trustPoints?: string[];
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
  const variant = data.variant || 'default';
  const [showHeroPicker, setShowHeroPicker] = useState(false);

  const update = (field: string, value: string) => {
    if (onUpdateData) {
      onUpdateData({ ...data, [field]: value });
    }
  };

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    if (editMode) return;
    if (target.startsWith('#')) {
      e.preventDefault();
      const targetId = target.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const targetLink = data.ctaLink || '#contact';
  const secondaryLink = data.secondaryCtaLink || '#services';
  const imageSrc = data.image
    ? data.image.startsWith('http') || data.image.startsWith('data:') || data.image.startsWith('/')
      ? data.image
      : `https://source.unsplash.com/1600x1200/?${encodeURIComponent(data.image)}`
    : '';

  const isSalon = variant === 'salon-background';
  const isRestaurant = variant === 'restaurant-background';
  const isBoutique = variant === 'boutique-background';
  const isPharmacyBackground = variant === 'pharmacy-background';
  const isPharmacyClean = variant === 'pharmacy-clean';
  const isBackgroundVariant = isSalon || isRestaurant || isBoutique || isPharmacyBackground;

  if (isBackgroundVariant) {
    const surfaceClass = isRestaurant
      ? 'bg-[#1a120d]'
      : isBoutique
      ? 'bg-[#201913]'
      : isPharmacyBackground
      ? 'bg-[#071611]'
      : 'bg-[#12070d]';

    const accentClass = isRestaurant
      ? 'text-amber-300'
      : isBoutique
      ? 'text-[#f0d9c3]'
      : isPharmacyBackground
      ? 'text-emerald-300'
      : 'text-pink-300';

    const fallbackBg = isRestaurant
      ? 'bg-gradient-to-br from-amber-200 via-orange-100 to-stone-100'
      : isBoutique
      ? 'bg-gradient-to-br from-stone-300 via-amber-100 to-stone-50'
      : isPharmacyBackground
      ? 'bg-gradient-to-br from-emerald-200 via-teal-50 to-white'
      : 'bg-gradient-to-br from-rose-200 via-rose-100 to-stone-100';

    const badgeClass = isRestaurant
      ? 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-black/35 text-white border border-white/10 mb-4 backdrop-blur-sm'
      : isBoutique
      ? 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/12 text-white border border-white/15 mb-4 backdrop-blur-sm'
      : isPharmacyBackground
      ? 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/12 text-white border border-white/15 mb-4 backdrop-blur-sm'
      : 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-white border border-white/15 mb-4 backdrop-blur-sm';

    const chipClass = isRestaurant
      ? 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] text-white/95 backdrop-blur-sm bg-black/35 border border-white/10'
      : isBoutique
      ? 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] text-white/95 backdrop-blur-sm bg-black/25 border border-white/15'
      : isPharmacyBackground
      ? 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] text-white/95 backdrop-blur-sm bg-black/25 border border-white/15'
      : 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] text-white/95 backdrop-blur-sm bg-white/10 border border-white/15';

    const overlayClass = isBoutique
      ? 'bg-gradient-to-r from-black/80 via-black/55 to-black/15'
      : isPharmacyBackground
      ? 'bg-gradient-to-r from-[#04110c]/85 via-[#04110c]/60 to-[#04110c]/22'
      : 'bg-gradient-to-r from-black/75 via-black/60 to-black/25';

    const containerSpacing = isBoutique
      ? 'pt-28 pb-16 md:pt-36 md:pb-28'
      : isPharmacyBackground
      ? 'pt-28 pb-16 md:pt-36 md:pb-26'
      : 'pt-24 pb-14 md:pt-32 md:pb-24';

    const titleClass = isBoutique
      ? 'text-[33px] sm:text-[44px] md:text-[68px]'
      : isPharmacyBackground
      ? 'text-[33px] sm:text-[44px] md:text-[64px]'
      : 'text-[31px] sm:text-[40px] md:text-[62px]';

    const subtitleClass = isBoutique || isPharmacyBackground ? 'text-[15px] md:text-[18px]' : 'text-sm md:text-lg';

    return (
      <section id="hero" className={`relative overflow-hidden text-white ${surfaceClass}`}>
        <div className="absolute inset-0">
          {imageSrc ? (
            <img src={imageSrc} alt={data.title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className={`w-full h-full ${fallbackBg}`} />
          )}
        </div>
        <div className={`absolute inset-0 pointer-events-none ${overlayClass}`} />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/45 via-transparent to-black/20" />

        {editMode && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowHeroPicker(true);
            }}
            className="absolute top-20 right-4 md:right-6 z-30 inline-flex items-center gap-2 rounded-full bg-white text-gray-900 px-4 py-2 text-xs font-bold shadow-lg hover:bg-gray-100 transition"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Change Hero Image</span>
          </button>
        )}

        <div className={`relative max-w-6xl mx-auto px-4 md:px-6 ${containerSpacing}`}>
          <div className="max-w-2xl md:max-w-3xl">
            {data.badge && (
              <div className={badgeClass}>
                <span>
                  {editMode ? (
                    <EditableText value={data.badge} onChange={(v) => update('badge', v)} editMode={editMode} as="span" className="text-[11px]" />
                  ) : (
                    data.badge
                  )}
                </span>
              </div>
            )}

            <h1 className={`font-extrabold tracking-tight leading-[0.98] text-white max-w-2xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.25)] ${titleClass}`}>
              {editMode ? (
                <EditableText value={data.title} onChange={(v) => update('title', v)} editMode={editMode} as="span" className={`${titleClass} font-extrabold leading-[0.98]`} placeholder="Headline" />
              ) : (
                data.title
              )}
            </h1>

            {data.subtitle && (
              <p className={`mt-4 leading-relaxed text-white/90 max-w-xl ${subtitleClass}`}>
                {editMode ? (
                  <EditableText value={data.subtitle} onChange={(v) => update('subtitle', v)} editMode={editMode} as="span" multiline className={`${subtitleClass} leading-relaxed`} placeholder="Subtitle" />
                ) : (
                  data.subtitle
                )}
              </p>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-xl">
              <a
                href={targetLink}
                onClick={(e) => handleSmoothScroll(e, targetLink)}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: primary }}
              >
                {editMode ? (
                  <EditableText value={data.ctaText || 'Book Now'} onChange={(v) => update('ctaText', v)} editMode={editMode} as="span" className="text-sm" />
                ) : (
                  <>
                    <span>{data.ctaText || 'Book Now'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </a>
              <a
                href={secondaryLink}
                onClick={(e) => handleSmoothScroll(e, secondaryLink)}
                className={`inline-flex w-full sm:w-auto items-center justify-center px-6 py-3.5 rounded-xl border text-white font-semibold text-sm transition ${isBoutique || isPharmacyBackground ? 'bg-white/8 backdrop-blur-sm border-white/15 hover:bg-white/12' : 'bg-white/10 backdrop-blur-sm border-white/15 hover:bg-white/15'}`}
              >
                {editMode ? (
                  <EditableText value={data.secondaryCtaText || 'View Services'} onChange={(v) => update('secondaryCtaText', v)} editMode={editMode} as="span" className="text-sm" />
                ) : (
                  data.secondaryCtaText || 'View Services'
                )}
              </a>
            </div>

            {!!data.trustPoints?.length && (
              <div className="mt-6 flex flex-wrap gap-2.5 max-w-2xl">
                {data.trustPoints.map((point) => (
                  <div key={point} className={chipClass}>
                    <Check className={`w-3.5 h-3.5 ${accentClass}`} />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {editMode && (
          <ImagePickerModal
            isOpen={showHeroPicker}
            onClose={() => setShowHeroPicker(false)}
            onSelect={(url) => {
              setShowHeroPicker(false);
              update('image', url);
            }}
            currentKeyword={data.image}
            category={isRestaurant ? 'restaurant' : isBoutique ? 'boutique' : isPharmacyBackground ? 'pharmacy' : 'salon'}
          />
        )}
      </section>
    );
  }

  if (isPharmacyClean) {
    const trustPoints = data.trustPoints && data.trustPoints.length > 0
      ? data.trustPoints
      : ['Licensed pharmacy', 'Genuine medicines', 'Pickup and delivery available'];

    return (
      <section id="hero" className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.10),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.08),_transparent_30%)] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 md:px-6 pt-24 pb-14 md:pt-28 md:pb-20 grid lg:grid-cols-[1.02fr_0.98fr] gap-8 md:gap-10 items-center">
          <div>
            {data.badge && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100 mb-4">
                {editMode ? (
                  <EditableText value={data.badge} onChange={(v) => update('badge', v)} editMode={editMode} as="span" className="text-[11px]" />
                ) : (
                  data.badge
                )}
              </div>
            )}

            <h1 className="text-[31px] sm:text-[40px] md:text-[56px] font-extrabold tracking-tight leading-[1.02] text-gray-900 max-w-2xl">
              {editMode ? (
                <EditableText value={data.title} onChange={(v) => update('title', v)} editMode={editMode} as="span" className="text-[31px] sm:text-[40px] md:text-[56px] font-extrabold leading-[1.02]" placeholder="Headline" />
              ) : (
                data.title
              )}
            </h1>

            {data.subtitle && (
              <p className="mt-4 text-[15px] md:text-[18px] leading-relaxed text-gray-600 max-w-xl">
                {editMode ? (
                  <EditableText value={data.subtitle} onChange={(v) => update('subtitle', v)} editMode={editMode} as="span" multiline className="text-[15px] md:text-[18px] leading-relaxed" placeholder="Subtitle" />
                ) : (
                  data.subtitle
                )}
              </p>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-xl">
              <a
                href={targetLink}
                onClick={(e) => handleSmoothScroll(e, targetLink)}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: primary }}
              >
                {editMode ? (
                  <EditableText value={data.ctaText || 'Send Prescription'} onChange={(v) => update('ctaText', v)} editMode={editMode} as="span" className="text-sm" />
                ) : (
                  <>
                    <span>{data.ctaText || 'Send Prescription'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </a>
              <a
                href={secondaryLink}
                onClick={(e) => handleSmoothScroll(e, secondaryLink)}
                className="inline-flex w-full sm:w-auto items-center justify-center px-6 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-900 font-semibold text-sm hover:bg-gray-50 transition"
              >
                {editMode ? (
                  <EditableText value={data.secondaryCtaText || 'See Services'} onChange={(v) => update('secondaryCtaText', v)} editMode={editMode} as="span" className="text-sm" />
                ) : (
                  data.secondaryCtaText || 'See Services'
                )}
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5 max-w-2xl">
              {trustPoints.map((point) => (
                <div key={point} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] text-gray-700 bg-white border border-gray-200 shadow-sm">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-[28px] overflow-hidden border border-emerald-100 shadow-2xl bg-gray-100 aspect-[4/5] md:aspect-[4/3]">
              {editMode ? (
                <EditableImage
                  imageKeyword={data.image || ''}
                  alt={data.title}
                  editMode={editMode}
                  onChange={(newUrl) => update('image', newUrl)}
                  className="w-full h-full object-cover"
                  category="pharmacy"
                />
              ) : (
                data.image && (
                  <img src={imageSrc} alt={data.title} className="w-full h-full object-cover" loading="lazy" />
                )
              )}

              <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 bg-gradient-to-t from-[#07140f]/82 via-[#07140f]/35 to-transparent">
                <div className="rounded-2xl bg-white/95 backdrop-blur-sm border border-white/80 shadow-xl p-4 md:p-5 max-w-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Why customers trust this pharmacy</div>
                  <div className="mt-3 space-y-2.5">
                    {trustPoints.slice(0, 3).map((point) => (
                      <div key={point} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {editMode && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHeroPicker(true);
                  }}
                  className="absolute top-4 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-white text-gray-900 px-4 py-2 text-xs font-bold shadow-lg hover:bg-gray-100 transition"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Change Hero Image</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {editMode && (
          <ImagePickerModal
            isOpen={showHeroPicker}
            onClose={() => setShowHeroPicker(false)}
            onSelect={(url) => {
              setShowHeroPicker(false);
              update('image', url);
            }}
            currentKeyword={data.image}
            category="pharmacy"
          />
        )}
      </section>
    );
  }

  return (
    <section id="hero" className={`relative overflow-hidden bg-white ${align === 'center' ? 'text-center' : ''}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-20 grid md:grid-cols-2 gap-8 md:gap-10 items-center">
        <div className={`${align === 'center' ? 'mx-auto max-w-2xl' : ''}`}>
          {data.badge && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-gray-900 text-white mb-4 shadow-sm max-w-full truncate">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse flex-shrink-0"></span>
              <span className="truncate">
                {editMode ? (
                  <EditableText value={data.badge} onChange={(v) => update('badge', v)} editMode={editMode} as="span" className="text-[11px]" />
                ) : (
                  data.badge
                )}
              </span>
            </div>
          )}

          <h1 className="text-[28px] md:text-[44px] font-extrabold tracking-tight leading-[1.05] text-gray-900 break-words">
            {editMode ? (
              <EditableText value={data.title} onChange={(v) => update('title', v)} editMode={editMode} as="span" className="text-[28px] md:text-[44px] font-extrabold leading-[1.05]" placeholder="Headline" />
            ) : (
              data.title
            )}
          </h1>

          {data.subtitle && (
            <p className="mt-4 text-sm md:text-base leading-relaxed text-gray-600 max-w-xl">
              {editMode ? (
                <EditableText value={data.subtitle} onChange={(v) => update('subtitle', v)} editMode={editMode} as="span" multiline className="text-sm md:text-base leading-relaxed" placeholder="Subtitle" />
              ) : (
                data.subtitle
              )}
            </p>
          )}

          {data.ctaText && (
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href={targetLink}
                onClick={(e) => handleSmoothScroll(e, targetLink)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                style={{ backgroundColor: primary }}
              >
                {editMode ? (
                  <EditableText value={data.ctaText} onChange={(v) => update('ctaText', v)} editMode={editMode} as="span" className="text-sm" />
                ) : (
                  <>
                    <span>{data.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </a>
              <a
                href="#services"
                onClick={(e) => handleSmoothScroll(e, '#services')}
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 font-semibold text-sm hover:bg-gray-50 transition"
              >
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
                  src={data.image.startsWith('http') || data.image.startsWith('data:') || data.image.startsWith('/') ? data.image : `https://source.unsplash.com/800x600/?${encodeURIComponent(data.image)}`}
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
