"use client";
import { useState } from 'react';
import { Template, BlockType } from '../../lib/types';

const BLOCK_TYPES: { type: BlockType; label: string; desc: string }[] = [
  { type: 'hero', label: 'Hero', desc: 'Title + image + CTA' },
  { type: 'services', label: 'Services', desc: 'UGX pricing with real photos' },
  { type: 'gallery', label: 'Gallery', desc: 'Your work photos' },
  { type: 'testimonials', label: 'Testimonials', desc: 'Client reviews' },
  { type: 'pricing', label: 'Pricing', desc: 'UGX price table' },
  { type: 'stats', label: 'Stats', desc: '500+ clients' },
  { type: 'map', label: 'Map', desc: 'Google Map' },
  { type: 'contact', label: 'Contact', desc: 'Phone + WhatsApp form' },
];

interface Props {
  template: Template;
  onUpdate: (newTemplate: Template) => void;
  onAddBlock: (type: BlockType) => void;
}

export default function EditorSidebar({ template, onUpdate, onAddBlock }: Props) {
  const [activeColor, setActiveColor] = useState(template.blocks[0]?.style?.primaryColor || '#111827');
  
  const colors = ['#EC4899', '#F59E0B', '#EF4444', '#6366F1', '#10B981', '#111827', '#0EA5E9', '#06B6D4'];

  const handleColorChange = (color: string) => {
    setActiveColor(color);
    const newTemplate = {
      ...template,
      blocks: template.blocks.map(b => ({ ...b, style: { ...b.style, primaryColor: color } }))
    };
    onUpdate(newTemplate);
  };

  return (
    <div className="w-[280px] bg-white border-r h-full overflow-y-auto">
      <div className="p-4 border-b">
        <div className="font-bold text-xs">VoidBuild Editor</div>
        <div className="text-[11px] text-gray-500 mt-1 leading-relaxed">Click text to edit, image to upload. Pro control at 15k UGX.</div>
      </div>

      <div className="p-4 border-b">
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Brand Color</div>
        <div className="flex flex-wrap gap-1.5">
          {colors.map(c => (
            <button
              key={c}
              onClick={() => handleColorChange(c)}
              className={`w-7 h-7 rounded-full border-2 ${activeColor === c ? 'border-gray-900 scale-110' : 'border-white'} shadow-sm`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="p-4 border-b">
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Blocks on page</div>
        <div className="space-y-1.5">
          {template.blocks.slice(0, 12).map((b, i) => (
            <div key={b.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-2.5 py-1.5">
              <span className="font-medium capitalize">{b.type}</span>
              <span className="text-[10px] text-gray-400">#{i+1}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Add Block</div>
        <div className="grid grid-cols-2 gap-2">
          {BLOCK_TYPES.map(bt => (
            <button
              key={bt.type}
              onClick={() => onAddBlock(bt.type)}
              className="text-left border rounded-lg p-2.5 hover:bg-gray-50 hover:border-gray-300 transition"
            >
              <div className="text-xs font-semibold">{bt.label}</div>
              <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{bt.desc}</div>
            </button>
          ))}
        </div>
        <div className="mt-3 text-[10px] text-gray-400 bg-gray-50 border rounded-lg p-2.5 leading-relaxed">
          Click text on preview to edit. Click image to upload real photo. Hover block for move/duplicate/delete. No emojis, real images only.
        </div>
      </div>
    </div>
  );
}
