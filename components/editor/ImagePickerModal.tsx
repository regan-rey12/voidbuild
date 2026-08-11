"use client";
import { useState } from 'react';

const CURATED_IMAGES = [
  { keyword: 'african salon braids Kampala', label: 'Salon Braids UG', category: 'salon' },
  { keyword: 'african woman braids beautiful', label: 'Braids Style', category: 'salon' },
  { keyword: 'african natural hair', label: 'Natural Hair', category: 'salon' },
  { keyword: 'nails art african', label: 'Nails', category: 'salon' },
  { keyword: 'hardware shop building materials', label: 'Hardware', category: 'hardware' },
  { keyword: 'cement bags construction', label: 'Cement', category: 'hardware' },
  { keyword: 'ugandan food matooke', label: 'Local Food', category: 'restaurant' },
  { keyword: 'restaurant uganda', label: 'Restaurant', category: 'restaurant' },
  { keyword: 'boutique fashion african dress', label: 'Boutique', category: 'boutique' },
  { keyword: 'motorcycle garage repair', label: 'Boda Garage', category: 'boda' },
  { keyword: 'barbershop african man', label: 'Barbershop', category: 'barbershop' },
  { keyword: 'african school children', label: 'School', category: 'school' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentKeyword?: string;
  category?: string;
}

export default function ImagePickerModal({ isOpen, onClose, onSelect, currentKeyword, category }: Props) {
  const [tab, setTab] = useState<'gallery' | 'upload' | 'url'>('gallery');
  const [urlInput, setUrlInput] = useState('');

  if (!isOpen) return null;

  const filtered = category ? CURATED_IMAGES.filter(img => img.category === category) : [];
  const imagesToShow = filtered.length > 0 ? filtered : CURATED_IMAGES.slice(0, 9);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="p-5 border-b flex items-center justify-between flex-shrink-0">
          <h3 className="font-bold">Choose Image</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">✕</button>
        </div>

        <div className="flex gap-2 p-3 border-b bg-gray-50 flex-shrink-0">
          <button onClick={() => setTab('gallery')} className={`px-4 py-2 rounded-full text-sm font-medium ${tab==='gallery' ? 'bg-gray-900 text-white' : 'bg-white border'}`}>Gallery</button>
          <button onClick={() => setTab('upload')} className={`px-4 py-2 rounded-full text-sm font-medium ${tab==='upload' ? 'bg-gray-900 text-white' : 'bg-white border'}`}>Upload</button>
          <button onClick={() => setTab('url')} className={`px-4 py-2 rounded-full text-sm font-medium ${tab==='url' ? 'bg-gray-900 text-white' : 'bg-white border'}`}>URL</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'gallery' && (
            <div>
              <div className="text-xs text-gray-500 mb-3">Curated for Uganda</div>
              <div className="grid grid-cols-3 gap-3">
                {imagesToShow.map((img, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(`https://source.unsplash.com/600x450/?${encodeURIComponent(img.keyword)}`);
                    }}
                    className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 hover:border-gray-900"
                  >
                    <img src={`https://source.unsplash.com/300x225/?${encodeURIComponent(img.keyword)}`} alt={img.label} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] p-1.5 text-center truncate">{img.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'upload' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center text-2xl">📷</div>
              <div className="font-bold mt-4">Upload Your Photo</div>
              <label className="mt-6 inline-flex px-6 py-3 rounded-xl bg-gray-900 text-white text-sm font-bold cursor-pointer">
                Choose Photo
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => onSelect(reader.result as string);
                  reader.readAsDataURL(file);
                }} />
              </label>
            </div>
          )}

          {tab === 'url' && (
            <div>
              <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://..." className="mt-3 w-full px-4 py-3 rounded-xl border text-sm" />
              <button onClick={() => { if (urlInput) onSelect(urlInput); }} disabled={!urlInput} className="mt-3 w-full py-3 rounded-xl bg-gray-900 text-white font-bold text-sm disabled:opacity-50">Use URL</button>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 rounded-b-2xl flex justify-between items-center flex-shrink-0">
          <div className="text-[10px] text-gray-500">Real photo = +50% trust</div>
          <button onClick={onClose} className="px-4 py-2 rounded-full bg-white border text-sm">Cancel</button>
        </div>
      </div>
    </div>
  );
}
