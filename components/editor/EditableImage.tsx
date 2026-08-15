"use client";
import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import ImagePickerModal from './ImagePickerModal';

interface Props {
  imageKeyword: string;
  alt: string;
  editMode: boolean;
  onChange: (newUrl: string) => void;
  className?: string;
  category?: string;
}

export default function EditableImage({ imageKeyword, alt, editMode, onChange, className = '', category }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const displaySrc = preview || (imageKeyword?.startsWith('http') || imageKeyword?.startsWith('data:') 
    ? imageKeyword 
    : `https://source.unsplash.com/800x600/?${encodeURIComponent(imageKeyword || 'business')}`);

  const handleSelect = async (url: string) => {
    setShowPicker(false);
    
    // Close modal first to stop shaking loop
    setTimeout(() => {
      if (url.startsWith('data:')) {
        setPreview(url);
        onChange(url);
        return;
      }
      setPreview(url);
      onChange(url);
    }, 50);
  };

  if (!editMode) {
    return <img src={displaySrc} alt={alt} className={className} loading="lazy" />;
  }

  return (
    <>
      <div 
        className="relative group cursor-pointer" 
        onClick={(e) => {
          e.stopPropagation();
          setShowPicker(true);
        }}
      >
        <img src={displaySrc} alt={alt} className={`${className} group-hover:brightness-75 transition duration-200`} loading="lazy" />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center text-white p-2 text-center">
          <div className="bg-white text-black px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">📷 Change Image</div>
          <div className="text-[10px] mt-1.5 opacity-90">Upload your photo</div>
        </div>
        {preview?.startsWith('data:') && (
          <div className="absolute bottom-2 left-2 bg-yellow-400 text-black text-[8px] px-2 py-0.5 rounded-full font-bold">LOCAL</div>
        )}
      </div>

      {showPicker && (
        <ImagePickerModal
          isOpen={showPicker}
          onClose={() => setShowPicker(false)}
          onSelect={handleSelect}
          currentKeyword={imageKeyword}
          category={category}
        />
      )}
    </>
  );
}
