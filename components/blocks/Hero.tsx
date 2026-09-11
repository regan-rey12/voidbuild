"use client";
import React, { useState } from 'react';
import EditableText from '@/components/editor/EditableText';
import EditableImage from '@/components/editor/EditableImage';
import ImagePickerModal from '@/components/editor/ImagePickerModal';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import { isUsableImageSrc } from '@/lib/imageUtils';
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
  const imageSrc = isUsableImageSrc(data.image) ? data.image : '';

  const isSalon = variant === 'salon-background';
  const isRestaurant = variant === 'restaurant-background';
  const isBoutique = variant === 'boutique-background';
  const isPharmacyBackground = variant === 'pharmacy-background';
  const isHotelBackground = variant === 'hotel-background';
  const isBarbershopBackground = variant === 'barbershop-background';
  const isHardwareBackground = variant === 'hardware-background';
  const isClinicBackground = variant === 'clinic-background';
  const isBakeryBackground = variant === 'bakery-background';
  const isGymBackground = variant === 'gym-background';
  const isLaundryBackground = variant === 'laundry-background';
  const isItBackground = variant === 'it-background';
  const isTutoringBackground = variant === 'tutoring-background';
  const isSchoolBackground = variant === 'school-background';
  const isPortfolioBackground = variant === 'portfolio-background';
  const isPharmacyClean = variant === 'pharmacy-clean';
  const isBackgroundVariant = isSalon || isRestaurant || isBoutique || isPharmacyBackground || isHotelBackground || isBarbershopBackground || isHardwareBackground || isClinicBackground || isBakeryBackground || isGymBackground || isLaundryBackground || isItBackground || isTutoringBackground || isSchoolBackground || isPortfolioBackground;

  if (isBackgroundVariant) {
    const surfaceClass = isRestaurant || isBakeryBackground
      ? 'bg-[#1a120d]'
      : isBoutique
      ? 'bg-[#201913]'
      : isPharmacyBackground
      ? 'bg-[#071611]'
      : isHotelBackground
      ? 'bg-[#081510]'
      : isBarbershopBackground
      ? 'bg-[#100d0a]'
      : isHardwareBackground
      ? 'bg-[#101a26]'
      : isClinicBackground
      ? 'bg-[#06181e]'
      : isGymBackground
      ? 'bg-[#0a0f0a]'
      : isLaundryBackground
      ? 'bg-[#08202c]'
      : isItBackground
      ? 'bg-[#0d1128]'
      : isTutoringBackground
      ? 'bg-[#26160a]'
      : isSchoolBackground
      ? 'bg-[#0b1b33]'
      : isPortfolioBackground
      ? 'bg-[#14100e]'
      : 'bg-[#12070d]';

    const accentClass = isRestaurant || isBakeryBackground
      ? 'text-amber-300'
      : isBoutique
      ? 'text-[#f0d9c3]'
      : isPharmacyBackground
      ? 'text-emerald-300'
      : isHotelBackground
      ? 'text-amber-300'
      : isBarbershopBackground
      ? 'text-amber-400'
      : isHardwareBackground
      ? 'text-orange-400'
      : isClinicBackground
      ? 'text-cyan-300'
      : isGymBackground
      ? 'text-lime-300'
      : isLaundryBackground
      ? 'text-cyan-300'
      : isItBackground
      ? 'text-indigo-300'
      : isTutoringBackground
      ? 'text-orange-300'
      : isSchoolBackground
      ? 'text-blue-300'
      : isPortfolioBackground
      ? 'text-red-300'
      : 'text-pink-300';

    const fallbackBg = isRestaurant || isBakeryBackground
      ? 'bg-gradient-to-br from-amber-200 via-orange-100 to-stone-100'
      : isBoutique
      ? 'bg-gradient-to-br from-stone-300 via-amber-100 to-stone-50'
      : isPharmacyBackground
      ? 'bg-gradient-to-br from-emerald-200 via-teal-50 to-white'
      : isHotelBackground
      ? 'bg-gradient-to-br from-[#1d4d3e] via-[#2f6b58] to-[#0d211a]'
      : isBarbershopBackground
      ? 'bg-gradient-to-br from-[#3a2f22] via-[#241c13] to-[#0f0c09]'
      : isHardwareBackground
      ? 'bg-gradient-to-br from-[#2b3f52] via-[#1d2c3b] to-[#0f1823]'
      : isClinicBackground
      ? 'bg-gradient-to-br from-cyan-200 via-sky-50 to-white'
      : isGymBackground
      ? 'bg-gradient-to-br from-[#26361a] via-[#18240f] to-[#0b1206]'
      : isLaundryBackground
      ? 'bg-gradient-to-br from-cyan-200 via-sky-50 to-white'
      : isItBackground
      ? 'bg-gradient-to-br from-[#252d5e] via-[#1a2142] to-[#0b0e20]'
      : isTutoringBackground
      ? 'bg-gradient-to-br from-[#3d2412] via-[#2a180c] to-[#160c05]'
      : isSchoolBackground
      ? 'bg-gradient-to-br from-[#1d3a6d] via-[#152b4d] to-[#0a1428]'
      : isPortfolioBackground
      ? 'bg-gradient-to-br from-[#3a1a17] via-[#241110] to-[#120a09]'
      : 'bg-gradient-to-br from-rose-200 via-rose-100 to-stone-100';

    const badgeClass = isRestaurant || isBakeryBackground
      ? 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-black/35 text-white border border-white/10 mb-4 backdrop-blur-sm'
      : isBoutique
      ? 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/12 text-white border border-white/15 mb-4 backdrop-blur-sm'
      : isPharmacyBackground
      ? 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/12 text-white border border-white/15 mb-4 backdrop-blur-sm'
      : isHotelBackground
      ? 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-white border border-amber-200/30 mb-4 backdrop-blur-sm'
      : isBarbershopBackground
      ? 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-white border border-amber-300/25 mb-4 backdrop-blur-sm'
      : isHardwareBackground
      ? 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-white border border-orange-300/25 mb-4 backdrop-blur-sm'
      : isClinicBackground
      ? 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/12 text-white border border-white/15 mb-4 backdrop-blur-sm'
      : isGymBackground
      ? 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-white border border-lime-300/25 mb-4 backdrop-blur-sm'
      : isLaundryBackground
      ? 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-white border border-cyan-300/25 mb-4 backdrop-blur-sm'
      : isItBackground
      ? 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-white border border-indigo-300/25 mb-4 backdrop-blur-sm'
      : isTutoringBackground
      ? 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-white border border-orange-300/25 mb-4 backdrop-blur-sm'
      : isSchoolBackground
      ? 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-white border border-blue-300/25 mb-4 backdrop-blur-sm'
      : isPortfolioBackground
      ? 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-white border border-red-400/30 mb-4 backdrop-blur-sm'
      : 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-white border border-white/15 mb-4 backdrop-blur-sm';

    const chipClass = isRestaurant || isBakeryBackground
      ? 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] text-white/95 backdrop-blur-sm bg-black/35 border border-white/10'
      : isBoutique
      ? 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] text-white/95 backdrop-blur-sm bg-black/25 border border-white/15'
      : isPharmacyBackground
      ? 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] text-white/95 backdrop-blur-sm bg-black/25 border border-white/15'
      : isHotelBackground
      ? 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] text-white/95 backdrop-blur-sm bg-black/30 border border-white/15'
      : isBarbershopBackground
      ? 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] text-white/95 backdrop-blur-sm bg-black/35 border border-white/15'
      : isHardwareBackground
      ? 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] text-white/95 backdrop-blur-sm bg-black/35 border border-white/15'
      : isClinicBackground
      ? 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] text-white/95 backdrop-blur-sm bg-black/25 border border-white/15'
      : isGymBackground
      ? 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] text-white/95 backdrop-blur-sm bg-black/45 border border-lime-300/20'
      : isLaundryBackground
      ? 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] text-white/95 backdrop-blur-sm bg-black/45 border border-cyan-300/20'
      : isItBackground
      ? 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] text-white/95 backdrop-blur-sm bg-black/45 border border-indigo-300/20'
      : isTutoringBackground
      ? 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] text-white/95 backdrop-blur-sm bg-black/45 border border-orange-300/20'
      : isSchoolBackground
      ? 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] text-white/95 backdrop-blur-sm bg-black/45 border border-blue-300/20'
      : isPortfolioBackground
      ? 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] text-white/95 backdrop-blur-sm bg-black/55 border border-red-400/20'
      : 'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] text-white/95 backdrop-blur-sm bg-white/10 border border-white/15';

    const overlayClass = isHotelBackground
      ? 'bg-[#06110d]/52'
      : isBarbershopBackground
      ? 'bg-gradient-to-r from-black/80 via-black/55 to-black/25'
      : isHardwareBackground
      ? 'bg-gradient-to-r from-[#0b141d]/80 via-[#0b141d]/55 to-[#0b141d]/25'
      : isClinicBackground
      ? 'bg-gradient-to-r from-[#04141a]/85 via-[#04141a]/60 to-[#04141a]/22'
      : isBoutique
      ? 'bg-gradient-to-r from-black/80 via-black/55 to-black/15'
      : isPharmacyBackground
      ? 'bg-gradient-to-r from-[#04110c]/85 via-[#04110c]/60 to-[#04110c]/22'
      : isGymBackground
      ? 'bg-gradient-to-r from-[#050a03]/80 via-[#050a03]/55 to-[#050a03]/25'
      : isLaundryBackground
      ? 'bg-gradient-to-r from-[#03121a]/85 via-[#03121a]/60 to-[#03121a]/25'
      : isItBackground
      ? 'bg-gradient-to-r from-[#070a18]/82 via-[#070a18]/58 to-[#070a18]/25'
      : isTutoringBackground
      ? 'bg-gradient-to-r from-[#170b03]/82 via-[#170b03]/58 to-[#170b03]/25'
      : isSchoolBackground
      ? 'bg-gradient-to-r from-[#050f24]/82 via-[#050f24]/58 to-[#050f24]/25'
      : isPortfolioBackground
      ? 'bg-gradient-to-r from-black/88 via-black/62 to-black/38'
      : 'bg-gradient-to-r from-black/75 via-black/60 to-black/25';

    const containerSpacing = isHotelBackground
      ? 'pt-32 pb-20 md:pt-36 md:pb-32'
      : isBarbershopBackground || isGymBackground || isLaundryBackground || isItBackground || isTutoringBackground || isSchoolBackground || isPortfolioBackground
      ? 'pt-28 pb-16 md:pt-36 md:pb-28'
      : isHardwareBackground
      ? 'pt-28 pb-16 md:pt-36 md:pb-28'
      : isClinicBackground
      ? 'pt-28 pb-16 md:pt-36 md:pb-24'
      : isBoutique
      ? 'pt-28 pb-16 md:pt-36 md:pb-28'
      : isPharmacyBackground
      ? 'pt-28 pb-16 md:pt-36 md:pb-26'
      : 'pt-24 pb-14 md:pt-32 md:pb-24';

    const titleClass = isHotelBackground
      ? 'text-[34px] sm:text-[46px] md:text-[70px]'
      : isBarbershopBackground || isGymBackground || isLaundryBackground || isItBackground || isTutoringBackground || isSchoolBackground || isPortfolioBackground
      ? 'text-[33px] sm:text-[46px] md:text-[68px]'
      : isHardwareBackground
      ? 'text-[33px] sm:text-[44px] md:text-[66px]'
      : isClinicBackground
      ? 'text-[33px] sm:text-[44px] md:text-[64px]'
      : isBoutique
      ? 'text-[33px] sm:text-[44px] md:text-[68px]'
      : isPharmacyBackground
      ? 'text-[33px] sm:text-[44px] md:text-[64px]'
      : 'text-[31px] sm:text-[40px] md:text-[62px]';

    const subtitleClass = isBoutique || isPharmacyBackground || isHotelBackground || isBarbershopBackground || isHardwareBackground || isClinicBackground || isGymBackground || isLaundryBackground || isItBackground || isTutoringBackground || isSchoolBackground || isPortfolioBackground ? 'text-[15px] md:text-[18px]' : 'text-sm md:text-lg';

    return (
      <section id="hero" className={`relative overflow-hidden text-white ${surfaceClass} ${isHotelBackground || isBarbershopBackground || isGymBackground || isLaundryBackground || isItBackground || isTutoringBackground || isSchoolBackground || isPortfolioBackground ? 'flex items-center min-h-[88vh] md:min-h-[94vh]' : ''}`}>
        <div className="absolute inset-0">
          {imageSrc ? (
            <img src={imageSrc} alt={data.title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className={`w-full h-full ${fallbackBg}`} />
          )}
        </div>
        <div className={`absolute inset-0 pointer-events-none ${overlayClass}`} />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/45 via-transparent to-black/20" />
        {(isHotelBackground || isBarbershopBackground || isGymBackground || isLaundryBackground || isItBackground || isTutoringBackground || isSchoolBackground || isPortfolioBackground) && (
          <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none bg-gradient-to-t from-black/55 to-transparent" />
        )}

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

        <div className={`relative w-full max-w-6xl mx-auto px-4 md:px-6 ${containerSpacing}`}>
          <div className={isHotelBackground ? 'max-w-3xl mx-auto text-center' : 'max-w-2xl md:max-w-3xl'}>
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

            <h1 className={`font-extrabold tracking-tight leading-[0.98] text-white max-w-2xl ${isHotelBackground ? 'mx-auto' : ''} drop-shadow-[0_2px_10px_rgba(0,0,0,0.25)] ${titleClass}`}>
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

            <div className={`mt-6 flex flex-col sm:flex-row gap-3 ${isHotelBackground ? 'sm:justify-center' : 'max-w-xl'}`}>
              <a
                href={targetLink}
                onClick={(e) => handleSmoothScroll(e, targetLink)}
                className={`inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all ${isBarbershopBackground ? 'text-[#221604]' : isGymBackground ? 'text-[#14210a]' : 'text-white'}`}
                style={{ backgroundColor: isBarbershopBackground ? '#C9962E' : isGymBackground ? '#A3E635' : primary }}
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
              <div className={`mt-6 flex flex-wrap gap-2.5 ${isHotelBackground ? 'justify-center max-w-none' : 'max-w-2xl'}`}>
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
            category={isRestaurant || isBakeryBackground ? (isBakeryBackground ? 'bakery' : 'restaurant') : isBoutique ? 'boutique' : isPharmacyBackground ? 'pharmacy' : isHotelBackground ? 'hotel' : isBarbershopBackground ? 'barbershop' : isHardwareBackground ? 'hardware' : isClinicBackground ? 'clinic' : isGymBackground ? 'gym' : isLaundryBackground ? 'laundry' : isItBackground ? 'it' : isTutoringBackground ? 'tutoring' : isSchoolBackground ? 'school' : isPortfolioBackground ? 'portfolio' : 'salon'}
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
            ) : data.image ? (
              imageSrc ? (
                <img src={imageSrc} alt={data.title} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <ImagePlaceholder className="w-full h-full" label="Add a photo" />
              )
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
