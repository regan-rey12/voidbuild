"use client";
import React from 'react';

interface FooterProps {
  data: { businessName: string; tagline?: string; year?: number };
  style?: { primaryColor?: string };
}

export default function Footer({ data }: FooterProps) {
  return (
    <footer className="mt-8 border-t bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 flex flex-col md:flex-row justify-between gap-4 text-xs">
        <div className="flex items-center">
          <div>
            <div className="font-semibold text-gray-900">{data.businessName} © {data.year || new Date().getFullYear()}</div>
            {data.tagline && <div className="mt-1 text-gray-500 max-w-sm">{data.tagline}</div>}
          </div>
        </div>
        <div className="flex gap-3 text-gray-500 items-center">
          <span>MTN MoMo</span>
          <span>•</span>
          <span>Airtel Money</span>
          <span>•</span>
          <span>WhatsApp</span>
        </div>
      </div>
      <div className="text-center py-3 border-t text-[10px] text-gray-500 flex items-center justify-center gap-2">
        <img src="/logo.png" alt="" className="w-4 h-4 object-contain flex-shrink-0" />
        <span>Powered by voidbuild.com</span>
      </div>
    </footer>
  );
}
