"use client";
import EditableImage from '@/components/editor/EditableImage';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import { isUsableImageSrc } from '@/lib/imageUtils';

interface Props {
  data: {
    heading?: string;
    subheading?: string;
    images: string[];
    variant?: string;
  };
  style?: any;
  editMode?: boolean;
  onUpdateData?: (newData: any) => void;
}

const DEFAULT_IMAGES = [
  'african salon braids beautiful',
  'african braids style',
  'african natural hair',
  'business team',
  'african boutique fashion',
  'african food restaurant',
];

function getBoutiqueTileClass(index: number) {
  if (index === 0) return 'col-span-2 md:col-span-7';
  if (index === 1 || index === 2) return 'col-span-1 md:col-span-5';
  if (index === 3) return 'col-span-2 md:col-span-4';
  return 'col-span-1 md:col-span-4';
}

function getBoutiqueAspectClass(index: number) {
  if (index === 0) return 'aspect-[4/5] md:aspect-[16/12]';
  if (index === 3) return 'aspect-[16/10]';
  return 'aspect-[4/5]';
}

function getPharmacyTileClass(index: number) {
  if (index === 0) return 'col-span-2 md:col-span-4';
  if (index === 1 || index === 2) return 'col-span-1 md:col-span-2';
  return 'col-span-1 md:col-span-2';
}

function getPharmacyAspectClass(index: number) {
  if (index === 0) return 'aspect-[16/10]';
  if (index === 3) return 'aspect-[16/10]';
  return 'aspect-[4/5]';
}

function getHotelTileClass(index: number) {
  if (index === 0 || index === 3 || index === 6) return 'col-span-2';
  if (index === 1 || index === 2 || index === 4 || index === 5) return 'col-span-1';
  return 'col-span-1';
}

function getHotelMdTileClass(index: number) {
  if (index === 0 || index === 3) return 'md:col-span-7';
  if (index === 1 || index === 2) return 'md:col-span-5';
  return 'md:col-span-4';
}

function getHotelAspectClass(index: number) {
  if (index === 0 || index === 3) return 'aspect-[4/3] md:aspect-[16/11]';
  return 'aspect-[4/5]';
}

function getBarbershopTileClass(index: number) {
  if (index === 0 || index === 6) return 'col-span-2';
  return 'col-span-1';
}

function getBarbershopMdTileClass(index: number) {
  if (index === 0 || index === 6) return 'md:col-span-8';
  return 'md:col-span-4';
}

function getBarbershopAspectClass(index: number) {
  if (index === 0 || index === 6) return 'aspect-[4/3] md:aspect-[16/10]';
  return 'aspect-[4/5]';
}

function getHardwareTileClass(index: number) {
  if (index === 5) return 'col-span-2';
  return 'col-span-1';
}

function getHardwareMdTileClass(index: number) {
  if (index === 0 || index === 1) return 'md:col-span-6';
  if (index === 5) return 'md:col-span-12';
  return 'md:col-span-4';
}

function getHardwareAspectClass(index: number) {
  if (index === 0 || index === 1) return 'aspect-[4/3]';
  if (index === 5) return 'aspect-[4/3] md:aspect-[21/9]';
  return 'aspect-[4/5]';
}

export default function Gallery({ data, style, editMode, onUpdateData }: Props) {
  const images = data.images && data.images.length > 0 ? data.images : DEFAULT_IMAGES.slice(0, 6);
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

  const updateImage = (idx: number, newUrl: string) => {
    if (!onUpdateData) return;
    const newImages = [...images];
    newImages[idx] = newUrl;
    onUpdateData({ ...data, images: newImages });
  };

  return (
    <section id="gallery" className={isBoutique ? 'py-16 md:py-20 px-4 md:px-6 bg-white' : isPharmacy ? 'py-16 md:py-20 px-4 md:px-6 bg-[#f7fcfa]' : isHotel || isBarbershop || isHardware || isGym ? 'py-16 md:py-20 px-4 md:px-6 bg-white' : isClinic ? 'py-16 md:py-20 px-4 md:px-6 bg-[#f7fcfd]' : isBakery ? 'py-16 md:py-20 px-4 md:px-6 bg-[#fdf8f0]' : isLaundry ? 'py-16 md:py-20 px-4 md:px-6 bg-[#f2fafc]' : isIt ? 'py-16 md:py-20 px-4 md:px-6 bg-[#f6f7fd]' : isTutoring ? 'py-16 md:py-20 px-4 md:px-6 bg-[#fdf7f0]' : isSchool ? 'py-16 md:py-20 px-4 md:px-6 bg-[#f3f6fd]' : isPortfolio ? 'py-16 md:py-20 px-4 md:px-6 bg-[#100c0b]' : isRestaurant ? 'py-16 md:py-20 px-4 md:px-6 bg-[#fdf7ec]' : 'py-16 px-6 bg-white'}>
      <div className="max-w-6xl mx-auto">
        <h2 className={isPortfolio ? 'text-2xl md:text-4xl font-extrabold text-white tracking-tight' : isBoutique || isPharmacy || isHotel || isBarbershop || isHardware || isClinic || isBakery || isGym || isLaundry || isIt || isTutoring || isSchool || isRestaurant ? 'text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight' : 'text-2xl font-bold text-gray-900'}>
          {data.heading || 'Our Work'}
        </h2>
        <p className={isPortfolio ? 'text-[13px] md:text-sm text-white/70 mt-3 leading-relaxed max-w-3xl' : isBoutique || isPharmacy || isHotel || isBarbershop || isHardware || isClinic || isBakery || isGym || isLaundry || isIt || isTutoring || isSchool || isRestaurant ? 'text-[13px] md:text-sm text-gray-600 mt-3 leading-relaxed max-w-3xl' : 'text-xs text-gray-500 mt-1 leading-relaxed'}>
          {data.subheading || 'Real photos of your work - click image to upload your own (in Edit Mode)'}
        </p>
        <div className={isBoutique ? 'grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-4 mt-8' : isPharmacy || isBakery || isLaundry || isIt || isTutoring || isSchool || isPortfolio || isRestaurant ? 'grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4 mt-8' : isHotel || isBarbershop || isHardware || isGym ? 'grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-4 mt-8' : isClinic ? 'grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4 mt-8' : 'grid grid-cols-2 md:grid-cols-3 gap-3 mt-6'}>
          {images.map((img: string, i: number) => {
            const tileClass = isBoutique ? getBoutiqueTileClass(i) : isPharmacy || isClinic || isBakery || isLaundry || isIt || isTutoring || isSchool || isPortfolio || isRestaurant ? getPharmacyTileClass(i) : isHotel ? `${getHotelTileClass(i)} ${getHotelMdTileClass(i)}` : isBarbershop || isGym ? `${getBarbershopTileClass(i)} ${getBarbershopMdTileClass(i)}` : isHardware ? `${getHardwareTileClass(i)} ${getHardwareMdTileClass(i)}` : '';
            const aspectClass = isBoutique ? getBoutiqueAspectClass(i) : isPharmacy || isClinic || isBakery || isLaundry || isIt || isTutoring || isSchool || isPortfolio || isRestaurant ? getPharmacyAspectClass(i) : isHotel ? getHotelAspectClass(i) : isBarbershop || isGym ? getBarbershopAspectClass(i) : isHardware ? getHardwareAspectClass(i) : 'aspect-[4/3]';

            return (
              <div
                key={i}
                className={`${tileClass} ${aspectClass} overflow-hidden group ${
                  isBoutique
                    ? 'rounded-[24px] border border-stone-200 bg-stone-100 shadow-sm'
                    : isPharmacy
                    ? 'rounded-[24px] border border-emerald-100 bg-white shadow-sm'
                    : isPharmacy || isClinic
                    ? 'rounded-[24px] border border-cyan-100 bg-white shadow-sm'
                    : isHotel || isBarbershop || isHardware
                    ? 'rounded-[24px] border border-stone-200 bg-stone-100 shadow-sm'
                    : isSchool
                    ? 'rounded-[24px] border border-blue-100 bg-white shadow-sm'
                    : isPortfolio
                    ? 'rounded-[24px] border border-white/10 bg-white/5 shadow-sm'
                    : isRestaurant
                    ? 'rounded-[24px] border border-amber-100 bg-white shadow-sm'
                    : 'rounded-xl bg-gray-100 border shadow-sm'
                }`}
              >
                {editMode && onUpdateData ? (
                  <EditableImage
                    imageKeyword={img}
                    alt=""
                    editMode={editMode}
                    onChange={(url) => updateImage(i, url)}
                    className="w-full h-full object-cover"
                    category={isPharmacy ? 'pharmacy' : isBoutique ? 'boutique' : isHotel ? 'hotel' : isBarbershop ? 'barbershop' : isHardware ? 'hardware' : isClinic ? 'clinic' : isBakery ? 'bakery' : isGym ? 'gym' : isLaundry ? 'laundry' : isIt ? 'it' : isTutoring ? 'tutoring' : isSchool ? 'school' : isPortfolio ? 'portfolio' : isRestaurant ? 'restaurant' : undefined}
                  />
                ) : isUsableImageSrc(img) ? (
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    loading="lazy"
                  />
                ) : (
                  <ImagePlaceholder className="w-full h-full" label="Add a photo" />
                )}
              </div>
            );
          })}
        </div>
        {editMode && (
          <div className="mt-4 text-[11px] text-gray-500 bg-blue-50 border border-blue-100 rounded-lg p-2.5 leading-relaxed">
            Click any image to upload your real shop photo. These placeholder images show how your gallery will look - replace with your own.
          </div>
        )}
      </div>
    </section>
  );
}
