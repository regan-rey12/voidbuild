"use client";
import React from 'react';
import EditableText from '../editor/EditableText';
import EditableImage from '../editor/EditableImage';

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
    const newService = { name: 'New Service', price: 'UGX 20,000', description: 'Describe service', image: 'business service' };
    onUpdateData({ ...data, services: [...data.services, newService] });
  };

  const removeService = (idx: number) => {
    if (!onUpdateData) return;
    if (!confirm('Delete this service?')) return;
    onUpdateData({ ...data, services: data.services.filter((_, i) => i !== idx) });
  };

  return (
    <section id="services" className="py-16 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center">
          {editMode && onUpdateData ? (
            <EditableText value={data.heading || 'Our Services'} onChange={(v) => updateField('heading', v)} editMode={editMode} as="span" className="text-2xl font-bold" />
          ) : (
            data.heading || 'Our Services'
          )}
        </h2>
        {data.subheading && (
          <p className="text-center text-gray-600 mt-2 max-w-2xl mx-auto text-sm">
            {editMode && onUpdateData ? (
              <EditableText value={data.subheading} onChange={(v) => updateField('subheading', v)} editMode={editMode} as="span" multiline className="text-sm" />
            ) : (
              data.subheading
            )}
          </p>
        )}

        <div className="grid md:grid-cols-3 gap-5 mt-10">
          {data.services?.map((service, i) => (
            <div key={i} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all flex flex-col">
              {/* Real image only - NO EMOJI */}
              <div className="relative aspect-[4/3] bg-gray-100">
                {editMode && onUpdateData ? (
                  <EditableImage
                    imageKeyword={service.image || 'business'}
                    alt={service.name}
                    editMode={editMode}
                    onChange={(url) => updateService(i, 'image', url)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img src={service.image?.startsWith('http') || service.image?.startsWith('data:') ? service.image : `https://source.unsplash.com/600x450/?${encodeURIComponent(service.image || 'business')}`} alt={service.name} className="w-full h-full object-cover" loading="lazy" />
                )}
                {service.price && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-900 text-white shadow">
                    {editMode && onUpdateData ? (
                      <EditableText value={service.price} onChange={(v) => updateService(i, 'price', v)} editMode={editMode} as="span" className="text-xs" />
                    ) : (
                      service.price
                    )}
                  </div>
                )}
                {editMode && onUpdateData && (
                  <button onClick={() => removeService(i)} className="absolute top-3 left-3 w-6 h-6 rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition">✕</button>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-[15px]">
                  {editMode && onUpdateData ? (
                    <EditableText value={service.name} onChange={(v) => updateService(i, 'name', v)} editMode={editMode} as="span" className="font-bold text-[15px]" />
                  ) : (
                    service.name
                  )}
                </h3>
                {service.description && (
                  <div className="mt-1.5 text-[13px] leading-relaxed text-gray-600 flex-1">
                    {editMode && onUpdateData ? (
                      <EditableText value={service.description} onChange={(v) => updateService(i, 'description', v)} editMode={editMode} as="span" multiline className="text-[13px]" />
                    ) : (
                      service.description
                    )}
                  </div>
                )}
                <button className="mt-4 w-full py-2.5 rounded-lg text-white text-xs font-bold" style={{ backgroundColor: primary }}>
                  Book on WhatsApp →
                </button>
              </div>
            </div>
          ))}
        </div>

        {editMode && onUpdateData && (
          <div className="mt-6 text-center">
            <button onClick={addService} className="px-4 py-2 rounded-full bg-white border text-xs font-semibold hover:bg-gray-50">+ Add Service with Photo</button>
          </div>
        )}
      </div>
    </section>
  );
}
