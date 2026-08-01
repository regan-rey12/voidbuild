"use client";
import React from 'react';

export default function WhatsAppButton({ data, style }: { data: { phone: string; message?: string }, style?: { primaryColor?: string } }) {
  if (!data.phone) return null;
  const link = `https://wa.me/${data.phone.replace(/[^0-9]/g,'')}?text=${encodeURIComponent(data.message || 'Hi! I came from your website')}`;
  return (
    <a href={link} target="_blank" className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] shadow-xl flex items-center justify-center text-white text-2xl hover:scale-110 transition">
      💬
    </a>
  );
}
