"use client";
import React from 'react';
import EditableText from '@/components/editor/EditableText';
import EditableImage from '@/components/editor/EditableImage';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import { isUsableImageSrc } from '@/lib/imageUtils';
import { Trash2, Plus, MessageCircle } from 'lucide-react';
import { recordWhatsAppClick } from '@/lib/projects';

const DEFAULT_SERVICE_IMAGES = [
  'african salon braids',
  'african natural hair',
  'african boutique fashion',
  'african food restaurant',
  'african barbershop',
  'business service',
];

interface ServicesProps {
  data: {
    heading?: string;
    subheading?: string;
    phone?: string;
    whatsapp?: string;
    variant?: string;
    buttonLabel?: string;
    services: {
      name: string;
      price?: string;
      description?: string;
      image?: string;
    }[];
  };
  style?: {
    primaryColor?: string;
  };
  projectId?: string;
  editMode?: boolean;
  onUpdateData?: (newData: any) => void;
}

export default function Services({ data, style, projectId, editMode, onUpdateData }: ServicesProps) {
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

  const updateField = (field: string, value: string) => {
    if (onUpdateData) onUpdateData({ ...data, [field]: value });
  };
  const updateService = (idx: number, field: string, value: string) => {
    if (!onUpdateData) return;
    const newServices = [...data.services];
    newServices[idx] = { ...newServices[idx], [field]: value };
    onUpdateData({ ...data, services: newServices });
  };
  const addService = () => {
    if (!onUpdateData) return;
    onUpdateData({
      ...data,
      services: [
        ...(data.services || []),
        {
          name: 'New Service',
          price: isPharmacy || isClinic ? '' : 'UGX 20,000',
          description: 'Quality service for your needs',
          image: 'business service',
        },
      ],
    });
  };
  const removeService = (idx: number) => {
    if (!onUpdateData) return;
    onUpdateData({ ...data, services: data.services.filter((_, i) => i !== idx) });
  };

  const handleServiceOrderClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
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

  const sectionClass = isBoutique
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#fcf8f3]'
    : isPharmacy
    ? 'py-16 md:py-20 px-4 md:px-6 bg-white'
    : isHotel
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#f7f5ef]'
    : isBarbershop
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#f6f4f1]'
    : isHardware
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#f5f6f8]'
    : isClinic
    ? 'py-16 md:py-20 px-4 md:px-6 bg-white'
    : isBakery
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#fdf8f0]'
    : isGym
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#f4f6f0]'
    : isLaundry
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#f2fafc]'
    : isIt
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#f6f7fd]'
    : isTutoring
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#fdf7f0]'
    : isSchool
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#f3f6fd]'
    : isPortfolio
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#faf8f7]'
    : isRestaurant
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#fdf7ec]'
    : isSalon
    ? 'py-16 md:py-20 px-4 md:px-6 bg-[#fdf5f7]'
    : 'py-12 md:py-16 px-4 md:px-6 bg-gray-50';
  const headingClass = isBoutique || isPharmacy || isHotel || isBarbershop || isHardware || isClinic || isBakery || isGym || isLaundry || isIt || isTutoring || isSchool || isPortfolio || isRestaurant || isSalon ? 'text-2xl md:text-4xl font-extrabold text-center text-gray-900 tracking-tight' : 'text-xl md:text-2xl font-bold text-center text-gray-900';
  const subheadingClass = isBoutique || isPharmacy || isHotel || isBarbershop || isHardware || isClinic || isBakery || isGym || isLaundry || isIt || isTutoring || isSchool || isPortfolio || isRestaurant || isSalon ? 'text-center text-[13px] md:text-sm text-gray-600 mt-3 max-w-3xl mx-auto leading-relaxed' : 'text-center text-gray-600 mt-2 max-w-2xl mx-auto text-xs md:text-sm';
  const gridClass = isBoutique
    ? 'grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mt-10'
    : isPharmacy
    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6 mt-10'
    : isHotel
    ? 'grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mt-10'
    : isBarbershop || isGym || isPortfolio
    ? 'grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mt-10'
    : isHardware
    ? 'grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mt-10'
    : isClinic || isBakery || isLaundry || isIt || isTutoring || isSchool || isRestaurant || isSalon
    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6 mt-10'
    : 'grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mt-8';
  const defaultButtonLabel = data.buttonLabel || (isBoutique ? 'Ask About This Collection' : isPharmacy ? 'Ask About Availability' : isHotel ? 'Enquire About This Stay' : isBarbershop ? 'Book This Cut' : isHardware ? 'Ask Price & Stock' : variant === 'restaurant' ? 'Order This Meal' : variant === 'salon' ? 'Book This Service' : isBakery ? 'Order This Treat' : isGym ? 'Ask About This Program' : isLaundry ? 'Ask About This Service' : isIt ? 'Request a Quote' : isTutoring ? 'Ask About This Program' : isSchool ? 'Ask About This Section' : isPortfolio ? 'Ask About This Package' : 'Ask About This Service');

  return (
    <section id="services" className={sectionClass}>
      <div className="max-w-6xl mx-auto">
        <h2 className={headingClass}>
          {editMode && onUpdateData ? (
            <EditableText value={data.heading || 'Our Services'} onChange={(v) => updateField('heading', v)} editMode={editMode} as="span" className={isBoutique || isPharmacy || isHotel || isBarbershop || isHardware || isClinic || isSalon || isRestaurant ? 'text-2xl md:text-4xl font-extrabold' : 'text-xl md:text-2xl font-bold'} />
          ) : (
            data.heading || 'Our Services'
          )}
        </h2>
        {data.subheading && (
          <p className={subheadingClass}>
            {editMode && onUpdateData ? (
              <EditableText value={data.subheading} onChange={(v) => updateField('subheading', v)} editMode={editMode} as="span" multiline className={isBoutique || isPharmacy || isHotel || isBarbershop || isHardware || isClinic || isSalon || isRestaurant ? 'text-[13px] md:text-sm' : 'text-xs md:text-sm'} />
            ) : (
              data.subheading
            )}
          </p>
        )}

        <div className={gridClass}>
          {data.services?.map((service, i) => {
            const placeholder = DEFAULT_SERVICE_IMAGES[i % DEFAULT_SERVICE_IMAGES.length];
            const imageToShow = service.image || placeholder;
            const itemText = encodeURIComponent(
              isBoutique
                ? `Hello! I saw your boutique website and I would like to ask about ${service.name}${service.price ? ` (${service.price})` : ''}.`
                : isPharmacy
                ? `Hello! I saw your pharmacy website and I would like to ask about ${service.name}${service.price ? ` (${service.price})` : ''}.`
                : isHotel
                ? `Hello! I saw your lodge website and I would like to enquire about ${service.name}${service.price ? ` (${service.price})` : ''}.`
                : isBarbershop
                ? `Hello! I saw your barbershop website and I would like to book ${service.name}${service.price ? ` (${service.price})` : ''}.`
                : isHardware
                ? `Hello! I saw your hardware website and I would like to ask about ${service.name}${service.price ? ` (${service.price})` : ''}.`
                : isClinic
                ? `Hello! I saw your clinic website and I would like to ask about ${service.name}.`
                : variant === 'restaurant'
                ? `Hello! I saw your menu and I would like to order ${service.name}${service.price ? ` (${service.price})` : ''}.`
                : isBakery
                ? `Hello! I saw your bakery website and I would like to order ${service.name}${service.price ? ` (${service.price})` : ''}.`
                : isGym
                ? `Hello! I saw your gym website and I would like to ask about ${service.name}.`
                : isLaundry
                ? `Hello! I saw your laundry website and I would like to ask about ${service.name}.`
                : isIt
                ? `Hello! I saw your IT website and I would like to enquire about ${service.name}.`
                : isTutoring
                ? `Hello! I saw your tutoring website and I would like to ask about ${service.name}.`
                : isSchool
                ? `Hello! I saw your school website and I would like to ask about ${service.name}.`
                : isPortfolio
                ? `Hello! I saw your photography website and I would like to ask about ${service.name}${service.price ? ` (${service.price})` : ''}.`
                : `Hello! I saw your website and I would like to ask about ${service.name}${service.price ? ` (${service.price})` : ''}.`
            );
            const itemWaLink = waNumber ? `https://wa.me/${waNumber}?text=${itemText}` : '#contact';

            return (
              <div
                key={i}
                className={`group overflow-hidden transition-all flex flex-col justify-between ${
                  isBoutique
                    ? 'bg-white rounded-[28px] border border-stone-200 hover:border-stone-300 hover:shadow-xl hover:-translate-y-1 shadow-sm'
                    : isPharmacy
                    ? 'bg-white rounded-[26px] border border-emerald-100 hover:border-emerald-200 hover:shadow-lg shadow-sm'
                    : isHotel
                    ? 'bg-white rounded-[26px] border border-stone-200 hover:border-emerald-900/25 hover:shadow-xl hover:-translate-y-1 shadow-sm'
                    : isBarbershop
                    ? 'bg-white rounded-[26px] border border-stone-200 hover:border-amber-800/30 hover:shadow-xl hover:-translate-y-1 shadow-sm'
                    : isHardware
                    ? 'bg-white rounded-[26px] border border-stone-200 hover:border-orange-700/30 hover:shadow-xl hover:-translate-y-1 shadow-sm'
                    : isClinic
                    ? 'bg-white rounded-[26px] border border-cyan-100 hover:border-cyan-200 hover:shadow-lg shadow-sm'
                    : isBakery
                    ? 'bg-white rounded-[26px] border border-amber-100 hover:border-amber-200 hover:shadow-lg shadow-sm'
                    : isGym
                    ? 'bg-white rounded-[26px] border border-stone-200 hover:border-lime-700/30 hover:shadow-xl hover:-translate-y-1 shadow-sm'
                    : isLaundry
                    ? 'bg-white rounded-[26px] border border-cyan-100 hover:border-cyan-200 hover:shadow-lg shadow-sm'
                    : isIt
                    ? 'bg-white rounded-[26px] border border-indigo-100 hover:border-indigo-200 hover:shadow-lg shadow-sm'
                    : isTutoring
                    ? 'bg-white rounded-[26px] border border-orange-100 hover:border-orange-200 hover:shadow-lg shadow-sm'
                    : isSchool
                    ? 'bg-white rounded-[26px] border border-blue-100 hover:border-blue-200 hover:shadow-lg shadow-sm'
                    : isPortfolio
                    ? 'bg-white rounded-[26px] border border-stone-200 hover:border-red-800/25 hover:shadow-xl hover:-translate-y-1 shadow-sm'
                    : isRestaurant
                    ? 'bg-white rounded-[26px] border border-amber-100 hover:border-amber-200 hover:shadow-lg shadow-sm'
                    : isSalon
                    ? 'bg-white rounded-[26px] border border-rose-100 hover:border-rose-200 hover:shadow-lg shadow-sm'
                    : 'bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300'
                }`}
              >
                <div>
                  <div className={`relative ${isBoutique ? 'aspect-[4/5]' : isPharmacy ? 'aspect-[16/11]' : isHotel || isBarbershop || isHardware || isGym || isPortfolio ? 'aspect-[4/3]' : isClinic || isBakery || isLaundry || isIt || isTutoring || isSchool || isRestaurant || isSalon ? 'aspect-[16/11]' : 'aspect-[16/9] md:aspect-[4/3]'} bg-gray-100`}>
                    {editMode && onUpdateData ? (
                      <EditableImage imageKeyword={imageToShow} alt={service.name} editMode={editMode} onChange={(url) => updateService(i, 'image', url)} className="w-full h-full object-cover" category={isPharmacy ? 'pharmacy' : isBoutique ? 'boutique' : isHotel ? 'hotel' : isBarbershop ? 'barbershop' : isHardware ? 'hardware' : isClinic ? 'clinic' : isBakery ? 'bakery' : isGym ? 'gym' : isLaundry ? 'laundry' : isIt ? 'it' : isTutoring ? 'tutoring' : isSchool ? 'school' : isPortfolio ? 'portfolio' : isRestaurant ? 'restaurant' : isSalon ? 'salon' : undefined} />
                    ) : isUsableImageSrc(imageToShow) ? (
                      <img
                        src={imageToShow}
                        alt={service.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <ImagePlaceholder className="w-full h-full" label="Add a photo" />
                    )}
                    {service.price && (
                      <div
                        className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-bold shadow-sm ${
                          isBoutique
                            ? 'bg-white/95 text-stone-900 border border-stone-200'
                            : isPharmacy
                            ? 'bg-white/95 text-emerald-900 border border-emerald-100'
                            : isHotel
                            ? 'bg-white/95 text-emerald-950 border border-emerald-900/15'
                            : isBarbershop
                            ? 'bg-[#1c1917] text-amber-100 border border-amber-200/25'
                            : isHardware
                            ? 'bg-[#16283a] text-white border border-orange-400/25'
                            : isBakery
                            ? 'bg-white/95 text-amber-900 border border-amber-100'
                            : isGym
                            ? 'bg-[#101508] text-lime-100 border border-lime-400/25'
                            : isLaundry
                            ? 'bg-[#0c2733] text-cyan-100 border border-cyan-400/25'
                            : isIt
                            ? 'bg-[#131736] text-indigo-100 border border-indigo-400/25'
                            : isTutoring
                            ? 'bg-[#221208] text-orange-100 border border-orange-400/25'
                            : isSchool
                            ? 'bg-[#0b1b33] text-blue-100 border border-blue-400/25'
                            : isPortfolio
                            ? 'bg-[#14100e] text-red-100 border border-red-400/25'
                            : isRestaurant
                            ? 'bg-[#231509] text-amber-100 border border-amber-400/25'
                            : isSalon
                            ? 'bg-white/95 text-rose-900 border border-rose-100'
                            : 'bg-gray-900 text-white shadow'
                        }`}
                      >
                        {editMode && onUpdateData ? (
                          <EditableText value={service.price} onChange={(v) => updateService(i, 'price', v)} editMode={editMode} as="span" className="text-[11px]" />
                        ) : (
                          service.price
                        )}
                      </div>
                    )}
                    {editMode && onUpdateData && (
                      <button
                        onClick={() => removeService(i)}
                        className="absolute top-3 left-3 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                        title="Remove Service"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className={isBoutique || isPharmacy || isHotel || isBarbershop || isHardware || isClinic || isSalon || isRestaurant ? 'p-6' : 'p-5'}>
                    <h3 className={isBoutique || isPharmacy || isHotel || isBarbershop || isHardware || isClinic || isSalon || isRestaurant ? 'font-bold text-base text-gray-900 tracking-tight' : 'font-bold text-sm text-gray-900'}>
                      {editMode && onUpdateData ? (
                        <EditableText value={service.name} onChange={(v) => updateService(i, 'name', v)} editMode={editMode} as="span" className={isBoutique || isPharmacy || isHotel || isBarbershop || isHardware || isClinic || isSalon || isRestaurant ? 'font-bold text-base' : 'font-bold text-sm'} />
                      ) : (
                        service.name
                      )}
                    </h3>
                    <div className={isBoutique || isPharmacy || isHotel || isBarbershop || isHardware || isClinic || isSalon || isRestaurant ? 'mt-2 text-[13px] md:text-sm text-gray-600 leading-relaxed' : 'mt-1.5 text-xs text-gray-600 leading-relaxed'}>
                      {editMode && onUpdateData ? (
                        <EditableText value={service.description || ''} onChange={(v) => updateService(i, 'description', v)} editMode={editMode} as="span" multiline className={isBoutique || isPharmacy || isHotel || isBarbershop || isHardware || isClinic || isSalon || isRestaurant ? 'text-[13px] md:text-sm' : 'text-xs'} />
                      ) : (
                        service.description
                      )}
                    </div>
                  </div>
                </div>

                <div className={isBoutique || isPharmacy || isHotel || isBarbershop || isHardware || isClinic || isSalon || isRestaurant ? 'px-6 pb-6 pt-0' : 'p-5 pt-0'}>
                  <a
                    href={itemWaLink}
                    target={waNumber ? '_blank' : '_self'}
                    rel={waNumber ? 'noopener noreferrer' : undefined}
                    onClick={(e) => handleServiceOrderClick(e)}
                    className={`w-full rounded-xl text-white font-bold text-center transition flex items-center justify-center gap-1.5 shadow-sm hover:opacity-95 ${isBoutique || isPharmacy || isHotel || isBarbershop || isHardware || isClinic || isSalon || isRestaurant ? 'py-3 text-sm' : 'py-2.5 text-xs'}`}
                    style={{ backgroundColor: primary }}
                  >
                    <MessageCircle className={isBoutique || isPharmacy || isHotel || isBarbershop || isHardware || isClinic || isSalon || isRestaurant ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
                    <span>{defaultButtonLabel}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
        {editMode && onUpdateData && (
          <div className="mt-6 text-center">
            <button
              onClick={addService}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-gray-300 hover:bg-gray-50 text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Service with Photo</span>
            </button>
            <div className="mt-2 text-[11px] text-gray-500">Real photos show how your services will look — upload your own in Edit Mode</div>
          </div>
        )}
      </div>
    </section>
  );
}
