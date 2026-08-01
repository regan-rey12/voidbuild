"use client";
import React from 'react';

interface FooterProps {
  data: { businessName: string; tagline?: string; year?: number };
  style?: { primaryColor?: string };
}

export default function Footer({ data }: FooterProps) {
  return (
    <footer className="mt-8 border-t bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between gap-4 text-xs">
        <div>
          <div className="font-semibold text-gray-900">{data.businessName} © {data.year || new Date().getFullYear()}</div>
          <div className="mt-1 text-gray-500 max-w-sm">{data.tagline || 'Built with VoidBuild'}</div>
        </div>
        <div className="flex gap-3 text-gray-500">
          <span>MTN MoMo</span>
          <span>•</span>
          <span>Airtel Money</span>
          <span>•</span>
          <span>WhatsApp</span>
        </div>
      </div>
    </footer>
  );
}
