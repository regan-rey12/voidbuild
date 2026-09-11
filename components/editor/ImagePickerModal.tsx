"use client";
import { useState } from 'react';
import { Image as ImageIcon, Upload, Link2, X } from 'lucide-react';

const CURATED_IMAGES = [
  // Bundled local images (categories with included template-images)
  { keyword: '/template-images/salon/salon-1.jpg', label: 'Salon Session', category: 'salon' },
  { keyword: '/template-images/salon/salon-2.jpg', label: 'Box Braids', category: 'salon' },
  { keyword: '/template-images/salon/salon-3.jpg', label: 'Goddess Braids', category: 'salon' },
  { keyword: '/template-images/salon/salon-5.jpg', label: 'Hair Wash & Steam', category: 'salon' },
  { keyword: '/template-images/salon/salon-6.jpg', label: 'Gel Nails', category: 'salon' },
  { keyword: '/template-images/salon/salon-8.jpg', label: 'Braided Styles', category: 'salon' },
  { keyword: '/template-images/hardware/hardware-2.jpg', label: 'Cement & Blocks', category: 'hardware' },
  { keyword: '/template-images/hardware/hardware-3.jpg', label: 'Roofing Sheets', category: 'hardware' },
  { keyword: '/template-images/hardware/hardware-4.jpg', label: 'Steel Rebar', category: 'hardware' },
  { keyword: '/template-images/hardware/hardware-7.jpg', label: 'Tools & Fixings', category: 'hardware' },
  { keyword: '/template-images/hardware/hardware-8.jpg', label: 'Bricks Stack', category: 'hardware' },
  { keyword: '/template-images/boutique/boutique-1.jpg', label: 'Ankara Elegance', category: 'boutique' },
  { keyword: '/template-images/boutique/boutique-4.jpg', label: 'Boutique Window', category: 'boutique' },
  { keyword: '/template-images/boutique/boutique-5.jpg', label: 'Occasion Wear', category: 'boutique' },
  { keyword: '/template-images/boutique/boutique-7.jpg', label: 'Fitting Room', category: 'boutique' },
  { keyword: '/template-images/pharmacy/pharmacy-1.jpg', label: 'Pharmacy Shelves', category: 'pharmacy' },
  { keyword: '/template-images/pharmacy/pharmacy-2.jpg', label: 'Baby Care', category: 'pharmacy' },
  { keyword: '/template-images/pharmacy/pharmacy-5.jpg', label: 'Personal Care', category: 'pharmacy' },
  { keyword: '/template-images/pharmacy/pharmacy-7.jpg', label: 'Pharmacist', category: 'pharmacy' },
  { keyword: '/template-images/barbershop/barber-2.jpg', label: 'Skin Fade', category: 'barbershop' },
  { keyword: '/template-images/barbershop/barber-3.jpg', label: 'Beard Sculpt', category: 'barbershop' },
  { keyword: '/template-images/barbershop/barber-4.jpg', label: 'Dreadlock Care', category: 'barbershop' },
  { keyword: '/template-images/barbershop/barber-6.jpg', label: 'Classic Cut', category: 'barbershop' },
  { keyword: '/template-images/barbershop/barber-8.jpg', label: 'Shop Interior', category: 'barbershop' },
  { keyword: '/template-images/hotel/hotel-7.jpg', label: 'Boutique Room', category: 'hotel' },
  { keyword: '/template-images/hotel/hotel-2.jpg', label: 'Cottage Room', category: 'hotel' },
  { keyword: '/template-images/hotel/hotel-4.jpg', label: 'Boat Cruise', category: 'hotel' },
  { keyword: '/template-images/hotel/hotel-5.jpg', label: 'Lodge Dining', category: 'hotel' },
  { keyword: '/template-images/hotel/hotel-9.jpg', label: 'Events Lawn', category: 'hotel' },
  { keyword: '/template-images/hotel/hotel-10.jpg', label: 'Sunset Boat', category: 'hotel' },
  { keyword: '/template-images/clinic/clinic-2.jpg', label: 'Consultation', category: 'clinic' },
  { keyword: '/template-images/clinic/clinic-3.jpg', label: 'Laboratory', category: 'clinic' },
  { keyword: '/template-images/clinic/clinic-4.jpg', label: 'Ultrasound', category: 'clinic' },
  { keyword: '/template-images/clinic/clinic-5.jpg', label: 'Antenatal Care', category: 'clinic' },
  { keyword: '/template-images/clinic/clinic-6.jpg', label: 'Child Health', category: 'clinic' },
  { keyword: '/template-images/clinic/clinic-7.jpg', label: 'Dispensing Pharmacy', category: 'clinic' },
  { keyword: '/template-images/clinic/clinic-8.jpg', label: 'Waiting Area', category: 'clinic' },
  { keyword: '/template-images/clinic/clinic-9.jpg', label: 'Care Team', category: 'clinic' },
  { keyword: '/template-images/bakery/bakery-2.jpg', label: 'Fresh Bread', category: 'bakery' },
  { keyword: '/template-images/bakery/bakery-5.jpg', label: 'Croissants & Pastries', category: 'bakery' },
  { keyword: '/template-images/bakery/bakery-3.jpg', label: 'Cake Decorating', category: 'bakery' },
  { keyword: '/template-images/bakery/bakery-6.jpg', label: 'Wedding Cakes', category: 'bakery' },
  { keyword: '/template-images/bakery/bakery-8.jpg', label: 'Cookies & Cupcakes', category: 'bakery' },
  { keyword: '/template-images/bakery/bakery-7.jpg', label: 'Bakery Counter', category: 'bakery' },
  { keyword: '/template-images/gym/gym-2.jpg', label: 'Free Weights', category: 'gym' },
  { keyword: '/template-images/gym/gym-3.jpg', label: 'Personal Training', category: 'gym' },
  { keyword: '/template-images/gym/gym-4.jpg', label: 'Boxing Corner', category: 'gym' },
  { keyword: '/template-images/gym/gym-5.jpg', label: 'Kettlebell Zone', category: 'gym' },
  { keyword: '/template-images/gym/gym-6.jpg', label: 'Dumbbell Rack', category: 'gym' },
  { keyword: '/template-images/gym/gym-9.jpg', label: 'Training Floor', category: 'gym' },
  { keyword: '/template-images/laundry/laundry-1.jpg', label: 'Washing Machines', category: 'laundry' },
  { keyword: '/template-images/laundry/laundry-2.jpg', label: 'Sorting Laundry', category: 'laundry' },
  { keyword: '/template-images/laundry/laundry-3.jpg', label: 'Steam Ironing', category: 'laundry' },
  { keyword: '/template-images/laundry/laundry-5.jpg', label: 'Folding Service', category: 'laundry' },
  { keyword: '/template-images/laundry/laundry-6.jpg', label: 'Industrial Machines', category: 'laundry' },
  { keyword: '/template-images/laundry/laundry-8.jpg', label: 'Clean Workspace', category: 'laundry' },
  { keyword: '/template-images/it/it-1.jpg', label: 'Team at Work', category: 'it' },
  { keyword: '/template-images/it/it-2.jpg', label: 'Tech Bench', category: 'it' },
  { keyword: '/template-images/it/it-3.jpg', label: 'Server Panels', category: 'it' },
  { keyword: '/template-images/it/it-4.jpg', label: 'Device Repair', category: 'it' },
  { keyword: '/template-images/it/it-5.jpg', label: 'Cable Work', category: 'it' },
  { keyword: '/template-images/it/it-8.jpg', label: 'Network Cabling', category: 'it' },
  { keyword: '/template-images/tutoring/tutoring-1.jpg', label: 'Tutor & Student', category: 'tutoring' },
  { keyword: '/template-images/tutoring/tutoring-2.jpg', label: 'One-on-One', category: 'tutoring' },
  { keyword: '/template-images/tutoring/tutoring-4.jpg', label: 'Study Groups', category: 'tutoring' },
  { keyword: '/template-images/tutoring/tutoring-5.jpg', label: 'Class Sessions', category: 'tutoring' },
  { keyword: '/template-images/tutoring/tutoring-7.jpg', label: 'Whiteboard Lesson', category: 'tutoring' },
  { keyword: '/template-images/tutoring/tutoring-9.jpg', label: 'Classroom', category: 'tutoring' },
  { keyword: '/template-images/school/school-1.jpg', label: 'Class in Session', category: 'school' },
  { keyword: '/template-images/school/school-2.jpg', label: 'Kindergarten', category: 'school' },
  { keyword: '/template-images/school/school-3.jpg', label: 'Group Work', category: 'school' },
  { keyword: '/template-images/school/school-4.jpg', label: 'Focused Pupils', category: 'school' },
  { keyword: '/template-images/school/school-5.jpg', label: 'School Van', category: 'school' },
  { keyword: '/template-images/school/school-6.jpg', label: 'Computer Lab', category: 'school' },
  { keyword: '/template-images/school/school-7.jpg', label: 'Music & Dance', category: 'school' },
  { keyword: '/template-images/school/school-8.jpg', label: 'Graduation', category: 'school' },
  { keyword: '/template-images/school/school-9.jpg', label: 'Happy Pupils', category: 'school' },
  { keyword: '/template-images/portfolio/portfolio-1.jpg', label: 'Wedding Ceremony', category: 'portfolio' },
  { keyword: '/template-images/portfolio/portfolio-2.jpg', label: 'Kwanjula', category: 'portfolio' },
  { keyword: '/template-images/portfolio/portfolio-3.jpg', label: 'Reception Dance', category: 'portfolio' },
  { keyword: '/template-images/portfolio/portfolio-4.jpg', label: 'Studio Glamour', category: 'portfolio' },
  { keyword: '/template-images/portfolio/portfolio-5.jpg', label: 'Birthday Party', category: 'portfolio' },
  { keyword: '/template-images/portfolio/portfolio-6.jpg', label: 'Corporate Portrait', category: 'portfolio' },
  { keyword: '/template-images/portfolio/portfolio-7.jpg', label: 'Aerial / Drone', category: 'portfolio' },
  { keyword: '/template-images/portfolio/portfolio-8.jpg', label: 'Traditional Couple', category: 'portfolio' },
  { keyword: '/template-images/portfolio/portfolio-9.jpg', label: 'Outdoor Romance', category: 'portfolio' },
  { keyword: '/template-images/restaurant/restaurant-2.jpg', label: 'Local Dish', category: 'restaurant' },
  { keyword: '/template-images/restaurant/restaurant-3.jpg', label: 'Restaurant Interior', category: 'restaurant' },
  { keyword: '/template-images/restaurant/restaurant-1.jpg', label: 'Dining Ambience', category: 'restaurant' },
  { keyword: '/template-images/restaurant/restaurant-8.jpg', label: 'Plated Meals', category: 'restaurant' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentKeyword?: string;
  category?: string;
}

function getCardStyle(index: number) {
  const palettes = [
    'from-rose-100 via-pink-50 to-white',
    'from-amber-100 via-orange-50 to-white',
    'from-purple-100 via-fuchsia-50 to-white',
    'from-emerald-100 via-teal-50 to-white',
    'from-sky-100 via-cyan-50 to-white',
    'from-stone-200 via-stone-50 to-white',
  ];
  return palettes[index % palettes.length];
}

export default function ImagePickerModal({ isOpen, onClose, onSelect, category }: Props) {
  const [tab, setTab] = useState<'gallery' | 'upload' | 'url'>('gallery');
  const [urlInput, setUrlInput] = useState('');

  if (!isOpen) return null;

  const filtered = category ? CURATED_IMAGES.filter((img) => img.category === category) : [];
  const imagesToShow = filtered.length > 0 ? filtered : CURATED_IMAGES.slice(0, 9);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>

      <div className="relative bg-white text-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="font-bold text-gray-900">Choose Image</h3>
            <div className="text-[11px] text-gray-500 mt-1">Use a curated visual, upload your own, or paste a direct image URL.</div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700"
            aria-label="Close image picker"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 p-3 border-b bg-gray-50 flex-shrink-0 overflow-x-auto">
          <button onClick={() => setTab('gallery')} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${tab === 'gallery' ? 'bg-gray-900 text-white' : 'bg-white border text-gray-700'}`}>
            <ImageIcon className="w-4 h-4" />
            <span>Gallery</span>
          </button>
          <button onClick={() => setTab('upload')} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${tab === 'upload' ? 'bg-gray-900 text-white' : 'bg-white border text-gray-700'}`}>
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </button>
          <button onClick={() => setTab('url')} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${tab === 'url' ? 'bg-gray-900 text-white' : 'bg-white border text-gray-700'}`}>
            <Link2 className="w-4 h-4" />
            <span>URL</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'gallery' && (
            <div>
              <div className="text-xs text-gray-500 mb-3">Curated for Uganda</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {imagesToShow.map((img, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(img.keyword);
                    }}
                    className="group text-left rounded-2xl overflow-hidden border border-gray-200 hover:border-gray-900 hover:shadow-md transition bg-white"
                  >
                    <div className={`aspect-[4/3] bg-gradient-to-br ${getCardStyle(i)} flex flex-col items-center justify-center p-4`}>
                      <div className="w-12 h-12 rounded-2xl bg-white/80 border border-white shadow-sm flex items-center justify-center text-gray-800">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <div className="mt-3 text-xs font-semibold text-gray-800 text-center leading-snug">{img.label}</div>
                      <div className="mt-1 text-[11px] text-gray-500 text-center">Tap to use this style</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'upload' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700">
                <Upload className="w-7 h-7" />
              </div>
              <div className="font-bold mt-4 text-gray-900">Upload Your Photo</div>
              <div className="text-sm text-gray-500 mt-1">Real images usually create more trust than placeholder visuals.</div>
              <label className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white text-sm font-bold cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Choose Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => onSelect(reader.result as string);
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            </div>
          )}

          {tab === 'url' && (
            <div>
              <div className="text-sm font-semibold text-gray-900">Paste direct image URL</div>
              <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://..." className="mt-3 w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900" />
              <button onClick={() => { if (urlInput) onSelect(urlInput); }} disabled={!urlInput} className="mt-3 w-full py-3 rounded-xl bg-gray-900 text-white font-bold text-sm disabled:opacity-50">
                Use URL
              </button>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 rounded-b-2xl flex justify-between items-center gap-3 flex-shrink-0">
          <div className="text-[11px] text-gray-500">Real photo = more trust and better conversion.</div>
          <button onClick={onClose} className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gray-900 border border-gray-900 text-white text-sm font-medium min-w-[96px] shadow-sm hover:bg-black">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
