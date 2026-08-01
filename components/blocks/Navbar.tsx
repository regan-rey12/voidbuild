"use client";
import React, { useState } from 'react';
import EditableImage from '../editor/EditableImage';
import EditableText from '../editor/EditableText';

interface NavbarProps {
  data: {
    businessName: string;
    logo?: string;
    phone?: string;
    whatsapp?: string;
    links?: { label: string; href: string }[];
  };
  style?: { primaryColor?: string };
  editMode?: boolean;
  onUpdateData?: (newData: any) => void;
}

export default function Navbar({ data, style, editMode, onUpdateData }: NavbarProps) {
  const primary = style?.primaryColor || '#111827';
  const [open, setOpen] = useState(false);
  
  const update = (field: string, value: string) => {
    if (onUpdateData) onUpdateData({ ...data, [field]: value });
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        {/* Logo - ONE logo only, real image if uploaded */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 border">
            {editMode && onUpdateData ? (
              <EditableImage
                imageKeyword={data.logo || ''}
                alt="Logo"
                editMode={editMode}
                onChange={(url) => update('logo', url)}
                className="w-full h-full object-cover"
              />
            ) : data.logo && (data.logo.startsWith('http') || data.logo.startsWith('data:')) ? (
              <img src={data.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs">{data.businessName?.[0]?.toUpperCase() || 'V'}</span>
            )}
          </div>
          <div className="font-semibold text-sm text-gray-900 truncate max-w-[120px] md:max-w-none">
            {editMode && onUpdateData ? (
              <EditableText value={data.businessName} onChange={(v) => update('businessName', v)} editMode={editMode} as="span" className="font-semibold text-sm" />
            ) : (
              <span className="truncate">{data.businessName}</span>
            )}
          </div>
          {editMode && (
            <span className="hidden md:inline-flex text-[9px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full ml-1">Click logo to upload real logo</span>
          )}
        </div>
        
        <div className="hidden md:flex items-center gap-1 text-[13px]">
          {(data.links || [{label:"Services", href:"#services"}, {label:"Contact", href:"#contact"}]).map((l,i) => (
            <a key={i} href={l.href} className="px-3 py-1.5 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition">{l.label}</a>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <a href={`https://wa.me/${(data.whatsapp || data.phone || '').replace(/[^0-9]/g,'')}`} className="inline-flex px-3.5 py-2 rounded-full text-white text-xs font-bold" style={{ backgroundColor: primary }}>WhatsApp</a>
          <button onClick={() => setOpen(!open)} className="md:hidden w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">☰</button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-1">
          {(data.links || [{label:"Services", href:"#services"}, {label:"Contact", href:"#contact"}]).map((l,i) => (
            <a key={i} href={l.href} onClick={() => setOpen(false)} className="block py-2.5 text-sm font-medium border-b last:border-0">{l.label}</a>
          ))}
        </div>
      )}
    </nav>
  );
}
