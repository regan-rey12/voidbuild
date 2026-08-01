// Example usage - copy this to your Next.js app/page.tsx
// This is how VoidBuild renders JSON -> Real Website

"use client";
import React, { useState } from 'react';
import TemplateRenderer from '../components/TemplateRenderer';
import sampleTemplate from '../templates/salon-ug-1.json';
import { Template } from '../lib/types';

export default function Page() {
  const [template, setTemplate] = useState<Template>(sampleTemplate as Template);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!input) return;
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ description: input }),
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      setTemplate(data);
    } catch (e) {
      alert('Failed - using sample. Check /api/generate route.');
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      {/* Builder Bar - simple, mobile friendly */}
      <div className="sticky top-0 z-[100] bg-gray-900 text-white p-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Salon in Wandegeya called Aisha Beauty, does braids 35k"
          className="flex-1 px-4 py-2 rounded-lg text-black text-sm"
        />
        <button
          onClick={generate}
          disabled={loading}
          className="px-6 py-2 rounded-lg bg-white text-black font-bold text-sm disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Website'}
        </button>
      </div>

      <TemplateRenderer template={template} />

      <div className="p-4 text-center text-xs text-gray-500">
        VoidBuild • Template JSON System • Block: {template.blocks.length} • AI generates DATA not HTML
      </div>
    </div>
  );
}
