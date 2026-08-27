"use client";
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { recordWhatsAppClick } from '@/lib/projects';

export default function WhatsAppButton({
  data,
  projectId,
}: {
  data: { phone: string; message?: string };
  style?: { primaryColor?: string };
  projectId?: string;
}) {
  if (!data.phone) return null;
  const link = `https://wa.me/${data.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(data.message || 'Hi! I came from your website')}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => recordWhatsAppClick(projectId)}
      className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-30 w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] shadow-xl flex items-center justify-center text-white hover:scale-105 hover:shadow-2xl transition-all"
      title="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 fill-white" />
    </a>
  );
}
