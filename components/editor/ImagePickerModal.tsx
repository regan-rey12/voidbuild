"use client";
import { useState } from 'react';
import { Image as ImageIcon, Upload, Link2, X, Sparkles } from 'lucide-react';

const CURATED_IMAGES = [
  { keyword: 'african salon braids kampala portrait', label: 'Salon Braids UG', category: 'salon' },
  { keyword: 'african woman knotless braids salon', label: 'Braids Style', category: 'salon' },
  { keyword: 'african natural hair salon treatment', label: 'Natural Hair', category: 'salon' },
  { keyword: 'african gel nails manicure salon', label: 'Nails', category: 'salon' },
  { keyword: 'hardware shop building materials', label: 'Hardware', category: 'hardware' },
  { keyword: 'cement bags construction', label: 'Cement', category: 'hardware' },
  { keyword: 'ugandan food matooke plated', label: 'Local Food', category: 'restaurant' },
  { keyword: 'restaurant uganda interior food', label: 'Restaurant', category: 'restaurant' },
  { keyword: 'boutique fashion african dress', label: 'Boutique', category: 'boutique' },
  { keyword: 'pharmacist medicine shelves clinic', label: 'Pharmacy Team', category: 'pharmacy' },
  { keyword: 'pharmacy counter customer guidance', label: 'Counter Support', category: 'pharmacy' },
  { keyword: 'supplements pharmacy shelf', label: 'Pharmacy Shelf', category: 'pharmacy' },
  { keyword: 'motorcycle garage repair', label: 'Boda Garage', category: 'boda' },
  { keyword: 'barbershop african man fade', label: 'Barbershop', category: 'barbershop' },
  { keyword: 'african school children classroom', label: 'School', category: 'school' }
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
                        <Sparkles className="w-6 h-6" />
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
