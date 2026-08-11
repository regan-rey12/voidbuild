"use client";
import React from 'react';
import EditableText from '../editor/EditableText';
import EditableImage from '../editor/EditableImage';

const DEFAULT_SERVICE_IMAGES = [
  'african salon braids',
  'african natural hair',
  'african boutique fashion',
  'african food restaurant',
  'african barbershop',
  'business service',
];

interface ServicesProps {
  data: {
    heading?: string;
    subheading?: string;
    services: {
      name: string;
      price?: string;
      description?: string;
      image?: string;
    }[];
  };
  style?: {
    primaryColor?: string;
  };
  editMode?: boolean;
  onUpdateData?: (newData: any) => void;
}

export default function Services({ data, style, editMode, onUpdateData }: ServicesProps) {
  const primary = style?.primaryColor || '#111827';
  
  const updateField = (field: string, value: string) => {
    if (onUpdateData) onUpdateData({ ...data, [field]: value });
  };
  const updateService = (idx: number, field: string, value: string) => {
    if (!onUpdateData) return;
    const newServices = [...data.services];
    newServices[idx] = { ...newServices[idx], [field]: value };
    onUpdateData({ ...data, services: newServices });
  };
  const addService = () => {
    if (!onUpdateData) return;
    onUpdateData({ ...data, services: [...data.services, { name: 'New Service', price: 'UGX 20,000', description: 'Describe service', image: 'business service' }] });
  };
  const removeService = (idx: number) => {
    if (!onUpdateData) return;
    if (!confirm('Delete?')) return;
    onUpdateData({ ...data, services: data.services.filter((_, i) => i !== idx) });
  };

  return (
    <section id="services" className="py-12 md:py-16 px-4 md:px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl md:text-2xl font-bold text-center">
          {editMode && onUpdateData ? (
            <EditableText value={data.heading || 'Our Services'} onChange={(v) => updateField('heading', v)} editMode={editMode} as="span" className="text-xl md:text-2xl font-bold" />
          ) : (
            data.heading || 'Our Services'
          )}
        </h2>
        {data.subheading && (
          <p className="text-center text-gray-600 mt-2 max-w-2xl mx-auto text-xs md:text-sm">
            {editMode && onUpdateData ? (
              <EditableText value={data.subheading} onChange={(v) => updateField('subheading', v)} editMode={editMode} as="span" multiline className="text-xs md:text-sm" />
            ) : (
              data.subheading
            )}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mt-8">
          {data.services?.map((service, i) => {
            const placeholder = DEFAULT_SERVICE_IMAGES[i % DEFAULT_SERVICE_IMAGES.length];
            const imageToShow = service.image || placeholder;
            return (
              <div key={i} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all flex flex-col">
                <div className="relative aspect-[16/9] md:aspect-[4/3] bg-gray-100">
                  {editMode && onUpdateData ? (
                    <EditableImage imageKeyword={imageToShow} alt={service.name} editMode={editMode} onChange={(url) => updateService(i, 'image', url)} className="w-full h-full object-cover" />
                  ) : (
                    <img src={imageToShow.startsWith('http') || imageToShow.startsWith('data:') ? imageToShow : `https://source.unsplash.com/600x450/?${encodeURIComponent(imageToShow)}`} alt={service.name} className="w-full h-full object-cover" loading="lazy" />
                  )}
                  {service.price && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-full text-[11px] font-bold bg-gray-900 text-white shadow">
                      {editMode && onUpdateData ? (
                        <EditableText value={service.price} onChange={(v) => updateService(i, 'price', v)} editMode={editMode} as="span" className="text-[11px]" />
                      ) : (
                        service.price
                      )}
                    </div>
                  )}
                  {editMode && onUpdateData && (
                    <button onClick={() => removeService(i)} className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition">✕</button>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-sm">
                    {editMode && onUpdateData ? (
                      <EditableText value={service.name} onChange={(v) => updateService(i, 'name', v)} editMode={editMode} as="span" className="font-bold text-sm" />
                    ) : (
                      service.name
                    )}
                  </h3>
                  <div className="mt-1 text-xs text-gray-600 flex-1">
                    {editMode && onUpdateData ? (
                      <EditableText value={service.description || ''} onChange={(v) => updateService(i, 'description', v)} editMode={editMode} as="span" multiline className="text-xs" />
                    ) : (
                      service.description
                    )}
                  </div>
                  <button className="mt-3 w-full py-2 rounded-lg text-white text-xs font-bold" style={{ backgroundColor: primary }}>Book on WhatsApp</button>
                </div>
              </div>
            );
          })}
        </div>
        {editMode && onUpdateData && (
          <div className="mt-6 text-center">
            <button onClick={addService} className="px-4 py-2 rounded-full bg-white border text-xs font-semibold">+ Add Service with Photo</button>
            <div className="mt-2 text-[11px] text-gray-500">Real photos show how your services will look - upload your own in Edit Mode</div>
          </div>
        )}
      </div>
    </section>
  );
}
