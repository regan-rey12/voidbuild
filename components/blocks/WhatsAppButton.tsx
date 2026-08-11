"use client";
import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton({ data, style }: { data: { phone: string; message?: string }, style?: { primaryColor?: string } }) {
  if (!data.phone) return null;
  const link = `https://wa.me/${data.phone.replace(/[^0-9]/g,'')}?text=${encodeURIComponent(data.message || 'Hi! I came from your website')}`;
  return (
    <a href={link} target="_blank" className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-30 w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#25D366] shadow-xl flex items-center justify-center text-white hover:scale-105 hover:shadow-2xl transition-all">
      <MessageCircle className="w-6 h-6 fill-white" />
    </a>
  );
}
