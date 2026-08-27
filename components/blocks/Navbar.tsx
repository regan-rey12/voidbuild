"use client";
import React, { useState } from 'react';
import EditableImage from '@/components/editor/EditableImage';
import EditableText from '@/components/editor/EditableText';
import { Menu, X, MessageCircle } from 'lucide-react';
import { recordWhatsAppClick } from '@/lib/projects';

interface NavbarProps {
  data: {
    businessName: string;
    logo?: string;
    phone?: string;
    whatsapp?: string;
    links?: { label: string; href: string }[];
  };
  style?: { primaryColor?: string };
  projectId?: string;
  editMode?: boolean;
  onUpdateData?: (newData: any) => void;
}

export default function Navbar({ data, style, projectId, editMode, onUpdateData }: NavbarProps) {
  const primary = style?.primaryColor || '#111827';
  const [open, setOpen] = useState(false);

  const update = (field: string, value: string) => {
    if (onUpdateData) onUpdateData({ ...data, [field]: value });
  };

  const waNumber = (data.whatsapp || data.phone || '').replace(/[^0-9]/g, '');

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (editMode) return;
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className={`${editMode ? 'relative' : 'sticky top-0'} z-10 bg-white border-b border-gray-100 shadow-sm`}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 bg-white border border-gray-100 shadow-sm">
            {editMode && onUpdateData ? (
              <EditableImage
                imageKeyword={data.logo || '/logo.png'}
                alt="Logo"
                editMode={editMode}
                onChange={(url) => update('logo', url)}
                className="w-full h-full object-contain"
              />
            ) : data.logo && (data.logo.startsWith('http') || data.logo.startsWith('data:')) ? (
              <img src={data.logo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <img src="/logo.png" alt="VoidBuild" className="w-full h-full object-contain" />
            )}
          </div>
          <div className="font-semibold text-sm text-gray-900 truncate max-w-[140px] md:max-w-none">
            {editMode && onUpdateData ? (
              <EditableText value={data.businessName} onChange={(v) => update('businessName', v)} editMode={editMode} as="span" className="font-semibold text-sm" />
            ) : (
              <span className="truncate">{data.businessName}</span>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1 text-[13px]">
          {(data.links || [{ label: 'Services', href: '#services' }, { label: 'Contact', href: '#contact' }]).map((l, i) => (
            <a
              key={i}
              href={l.href}
              onClick={(e) => handleLinkClick(e, l.href)}
              className="px-3.5 py-1.5 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition font-medium"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={waNumber ? `https://wa.me/${waNumber}` : '#contact'}
            target={waNumber ? '_blank' : '_self'}
            rel={waNumber ? 'noopener noreferrer' : undefined}
            onClick={() => recordWhatsAppClick(projectId)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-white text-xs font-bold shadow-sm hover:opacity-95 transition"
            style={{ backgroundColor: primary }}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition"
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-1 shadow-lg animate-fade-in">
          {(data.links || [{ label: 'Services', href: '#services' }, { label: 'Contact', href: '#contact' }]).map((l, i) => (
            <a
              key={i}
              href={l.href}
              onClick={(e) => {
                setOpen(false);
                handleLinkClick(e, l.href);
              }}
              className="block py-2 text-sm font-medium text-gray-700 hover:text-black border-b border-gray-50 last:border-0"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
