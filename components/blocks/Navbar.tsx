"use client";
import React, { useEffect, useState } from 'react';
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
    variant?: 'default' | 'overlay-light';
  };
  style?: { primaryColor?: string };
  projectId?: string;
  editMode?: boolean;
  onUpdateData?: (newData: any) => void;
}

export default function Navbar({ data, style, projectId, editMode, onUpdateData }: NavbarProps) {
  const primary = style?.primaryColor || '#111827';
  const variant = data.variant || 'default';
  const isOverlay = variant === 'overlay-light' && !editMode;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isOverlay) {
      setScrolled(false);
      return;
    }

    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOverlay]);

  const update = (field: string, value: string) => {
    if (onUpdateData) onUpdateData({ ...data, [field]: value });
  };

  const waNumber = (data.whatsapp || data.phone || '').replace(/[^0-9]/g, '');
  const overlayElevated = isOverlay && scrolled;

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
    <nav
      className={`${editMode ? 'relative' : isOverlay ? 'fixed top-0 left-0 w-full' : 'sticky top-0'} z-40 transition-all duration-300 ${
        isOverlay
          ? overlayElevated
            ? 'bg-[#16110d]/84 border-b border-white/10 shadow-lg backdrop-blur-xl'
            : 'bg-transparent'
          : 'bg-white border-b border-gray-100 shadow-sm'
      }`}
    >
      <div
        className={`max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between transition-all duration-300 ${
          isOverlay && !overlayElevated ? 'border-b border-white/10 backdrop-blur-[2px]' : ''
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 ${
              isOverlay ? 'bg-white/95 border border-white/20 shadow-lg' : 'bg-white border border-gray-100 shadow-sm'
            }`}
          >
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
          <div className={`font-semibold text-sm truncate max-w-[160px] md:max-w-none ${isOverlay ? 'text-white' : 'text-gray-900'}`}>
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
              className={`px-3.5 py-1.5 rounded-full transition font-medium ${
                isOverlay ? 'text-white/85 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
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
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-white text-xs font-bold shadow-sm hover:opacity-95 transition"
            style={{ backgroundColor: primary }}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
          <button
            onClick={() => setOpen(!open)}
            className={`md:hidden w-8 h-8 rounded-full flex items-center justify-center transition ${
              isOverlay ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            aria-label="Toggle navigation"
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className={`md:hidden border-t px-4 py-3 space-y-1 shadow-lg animate-fade-in ${isOverlay ? 'bg-[#16110d]/96 border-white/10 backdrop-blur-xl' : 'bg-white'}`}>
          {(data.links || [{ label: 'Services', href: '#services' }, { label: 'Contact', href: '#contact' }]).map((l, i) => (
            <a
              key={i}
              href={l.href}
              onClick={(e) => {
                setOpen(false);
                handleLinkClick(e, l.href);
              }}
              className={`block py-2 text-sm font-medium border-b last:border-0 ${
                isOverlay ? 'text-white/90 hover:text-white border-white/10' : 'text-gray-700 hover:text-black border-gray-50'
              }`}
            >
              {l.label}
            </a>
          ))}
          {waNumber && (
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => recordWhatsAppClick(projectId)}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold"
              style={{ backgroundColor: primary }}
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          )}
        </div>
      )}
    </nav>
  );
}
