"use client";
import React from 'react';
import { Template, TemplateBlock } from '@/lib/types';
import Navbar from './blocks/Navbar';
import Hero from './blocks/Hero';
import Services from './blocks/Services';
import Contact from './blocks/Contact';
import Footer from './blocks/Footer';
import WhatsAppButton from './blocks/WhatsAppButton';
import Gallery from './blocks/Gallery';
import Testimonials from './blocks/Testimonials';
import Pricing from './blocks/Pricing';
import MapBlock from './blocks/Map';
import Stats from './blocks/Stats';
import BlockToolbar from './editor/BlockToolbar';

const BLOCK_MAP: Record<string, React.ComponentType<any>> = {
  navbar: Navbar,
  hero: Hero,
  services: Services,
  gallery: Gallery,
  testimonials: Testimonials,
  pricing: Pricing,
  stats: Stats,
  map: MapBlock,
  contact: Contact,
  footer: Footer,
  whatsapp: WhatsAppButton,
};

interface Props {
  template: Template;
  editMode?: boolean;
  onUpdateBlock?: (blockId: string, newData: any) => void;
  onMoveBlock?: (blockId: string, direction: 'up' | 'down') => void;
  onDuplicateBlock?: (blockId: string) => void;
  onDeleteBlock?: (blockId: string) => void;
}

export default function TemplateRenderer({ 
  template, 
  editMode = false, 
  onUpdateBlock, 
  onMoveBlock, 
  onDuplicateBlock, 
  onDeleteBlock 
}: Props) {
  return (
    <div className="min-h-screen bg-white antialiased">
      {template.blocks.map((block, index) => {
        const Component = BLOCK_MAP[block.type];
        if (!Component) {
          return (
            <div key={block.id} className="p-4 bg-yellow-50 border text-xs">
              Unknown block: {block.type}
              {editMode && onDeleteBlock && (
                <button onClick={() => onDeleteBlock(block.id)} className="ml-2 text-red-600">Delete</button>
              )}
            </div>
          );
        }

        // Edit mode wrapper
        if (editMode) {
          const isNavbar = block.type === 'navbar';

          return (
            <div key={block.id} className="relative group">
              {/* Floating Toolbar - Only for body sections (Omitted from Navbar to avoid obscuring header elements) */}
              {!isNavbar && (
                <div className="absolute right-3 top-2 z-30 opacity-0 group-hover:opacity-100 transition shadow-lg rounded-full">
                  <BlockToolbar
                    canMoveUp={index > 1}
                    canMoveDown={index < template.blocks.length - 1}
                    onMoveUp={() => onMoveBlock?.(block.id, 'up')}
                    onMoveDown={() => onMoveBlock?.(block.id, 'down')}
                    onDuplicate={() => onDuplicateBlock?.(block.id)}
                    onDelete={() => onDeleteBlock?.(block.id)}
                  />
                </div>
              )}

              {/* Block type label - Only for non-navbar sections */}
              {!isNavbar && (
                <div className="hidden md:block absolute top-2 left-3 z-20 bg-gray-900/90 text-white text-[9px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow">
                  {block.type} #{index + 1}
                </div>
              )}

              {/* Editable block */}
              <div className="group-hover:outline group-hover:outline-2 group-hover:outline-dashed group-hover:outline-blue-400 group-hover:outline-offset-[-2px]">
                <Component 
                  data={block.data} 
                  style={block.style}
                  editMode={editMode}
                  onUpdateData={(newData: any) => onUpdateBlock?.(block.id, newData)}
                />
              </div>
            </div>
          );
        }

        // View mode - normal render
        return <Component key={block.id} data={block.data} style={block.style} />;
      })}

      {/* Always ensure WhatsApp floating if not already */}
      {!template.blocks.find(b => b.type === 'whatsapp') && template.blocks.find(b => b.data?.whatsapp || b.data?.phone) && (
        <WhatsAppButton data={{ 
          phone: template.blocks.find(b => b.data?.whatsapp || b.data?.phone)?.data?.whatsapp || template.blocks.find(b => b.data?.phone)?.data?.phone || '',
        }} />
      )}
    </div>
  );
}
