"use client";
import React from 'react';
import { MapPin, Phone, ShieldCheck } from 'lucide-react';

export default function MapBlock({ data, style }: any) {
  const location = data.location || 'Wandegeya, Kampala';
  const query = encodeURIComponent(location);
  return (
    <section id="map" className="py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900">{data.heading || `Find Us — ${location}`}</h2>
        <p className="text-center text-gray-600 mt-2 text-sm">{data.subheading || 'We are easy to find. Call or message before coming.'}</p>
        <div className="mt-8 rounded-2xl overflow-hidden border border-gray-200 shadow-sm h-[350px] bg-gray-100">
          <iframe
            width="100%"
            height="100%"
            loading="lazy"
            style={{ border: 0 }}
            src={`https://maps.google.com/maps?q=${query}&z=15&output=embed`}
            title={`Map for ${location}`}
          />
        </div>
        <div className="mt-5 flex flex-wrap gap-4 justify-center items-center text-xs font-medium text-gray-600">
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
            <MapPin className="w-3.5 h-3.5 text-gray-700" />
            <span>{location}</span>
          </div>
          {data.phone && (
            <a href={`tel:${data.phone}`} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-100 transition text-gray-800">
              <Phone className="w-3.5 h-3.5 text-gray-700" />
              <span>{data.phone}</span>
            </a>
          )}
          <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-900 border border-yellow-200 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-yellow-700" />
            <span>MTN MoMo & Airtel Money Accepted</span>
          </div>
        </div>
      </div>
    </section>
  );
}
