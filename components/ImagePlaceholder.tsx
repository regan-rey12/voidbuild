import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface Props {
  label?: string;
  className?: string;
  compact?: boolean;
}

// Clean, intentional-looking placeholder shown whenever an image slot holds a
// legacy keyword or is empty. Replaces broken external image links.
export default function ImagePlaceholder({ label, className = '', compact = false }: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-gradient-to-br from-stone-100 via-stone-50 to-stone-200 ${className}`}
    >
      <ImageIcon className={`${compact ? 'w-5 h-5' : 'w-7 h-7'} text-stone-300`} />
      {label && (
        <span className="mt-2 text-[10px] font-medium tracking-wide uppercase text-stone-400 px-3 text-center">
          {label}
        </span>
      )}
    </div>
  );
}
