"use client";
import React, { useState } from 'react';

interface ContactProps {
  data: {
    phone?: string;
    whatsapp?: string;
    location?: string;
    hours?: string;
    email?: string;
    heading?: string;
  };
  style?: {
    primaryColor?: string;
  };
  editMode?: boolean;
  onUpdateData?: (newData: any) => void;
}

export default function Contact({ data, style, editMode, onUpdateData }: ContactProps) {
  const primary = style?.primaryColor || '#111827';
  const waNumber = data.whatsapp || data.phone || '';
  const waLink = waNumber ? `https://wa.me/${waNumber.replace(/[^0-9]/g, '')}?text=Hello!%20I%20saw%20your%20website%20on%20voidbuild.com` : '#';

  // Form state - makes contact form actually work via WhatsApp
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const update = (field: string, value: string) => {
    if (onUpdateData) onUpdateData({ ...data, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      alert('Please enter your name and message');
      return;
    }
    const businessName = 'Business';
    const text = `Hello! I came from your website (voidbuild.com)
Name: ${name}
Phone: ${phone || 'Not provided'}
Message: ${message}

Please reply on WhatsApp.`;
    
    const encoded = encodeURIComponent(text);
    const number = waNumber.replace(/[^0-9]/g, '');
    if (!number) {
      alert('Business WhatsApp number not set');
      return;
    }
    const url = `https://wa.me/${number}?text=${encoded}`;
    
    // Save inquiry locally + try Supabase
    try {
      const inquiries = JSON.parse(localStorage.getItem('voidbuild_inquiries') || '[]');
      inquiries.unshift({ name, phone, message, businessPhone: data.phone, date: new Date().toISOString() });
      localStorage.setItem('voidbuild_inquiries', JSON.stringify(inquiries.slice(0, 50)));
    } catch {}

    // Open WhatsApp
    window.open(url, '_blank');
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setName('');
      setPhone('');
      setMessage('');
    }, 3000);
  };

  return (
    <section id="contact" className="py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-8 items-start">
        <div className="md:col-span-2">
          <div className="inline-flex px-2.5 py-1 rounded-full bg-gray-100 text-xs font-semibold mb-3">Contact Us</div>
          <h2 className="text-2xl font-bold tracking-tight">
            {editMode && onUpdateData ? (
              <input value={data.heading || 'Visit Us Today'} onChange={(e) => update('heading', e.target.value)} className="w-full font-bold text-2xl border border-blue-300 rounded px-2 py-1" />
            ) : (
              data.heading || 'Visit Us Today'
            )}
          </h2>
          <p className="mt-2 text-sm text-gray-600">Fast reply in 5 minutes on WhatsApp.</p>
          
          <div className="mt-6 space-y-4 text-sm">
            {data.location && (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-50 border flex items-center justify-center flex-shrink-0 text-xs">📍</div>
                <div>
                  <div className="font-semibold text-xs">Location</div>
                  {editMode && onUpdateData ? (
                    <input value={data.location} onChange={(e) => update('location', e.target.value)} className="w-full text-xs border border-blue-300 rounded px-2 py-1 mt-1" />
                  ) : (
                    <div className="text-xs text-gray-600 mt-0.5">{data.location}</div>
                  )}
                </div>
              </div>
            )}
            {data.phone && (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-50 border flex items-center justify-center flex-shrink-0 text-xs">📞</div>
                <div>
                  <div className="font-semibold text-xs">Call</div>
                  {editMode && onUpdateData ? (
                    <input value={data.phone} onChange={(e) => update('phone', e.target.value)} className="w-full text-xs border border-blue-300 rounded px-2 py-1 mt-1" />
                  ) : (
                    <a href={`tel:${data.phone}`} className="text-xs text-gray-900 font-medium hover:underline mt-0.5 inline-block">{data.phone}</a>
                  )}
                </div>
              </div>
            )}
            {data.hours && (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-50 border flex items-center justify-center flex-shrink-0 text-xs">🕒</div>
                <div>
                  <div className="font-semibold text-xs">Hours</div>
                  {editMode && onUpdateData ? (
                    <input value={data.hours} onChange={(e) => update('hours', e.target.value)} className="w-full text-xs border border-blue-300 rounded px-2 py-1 mt-1" />
                  ) : (
                    <div className="text-xs text-gray-600 mt-0.5">{data.hours}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2">
            <a href={waLink} target="_blank" className="inline-flex justify-center items-center gap-1.5 px-4 py-2.5 rounded-lg text-white font-bold text-xs shadow" style={{ backgroundColor: '#25D366' }}>💬 WhatsApp</a>
            {data.phone && <a href={`tel:${data.phone}`} className="inline-flex justify-center items-center px-4 py-2.5 rounded-lg bg-gray-900 text-white font-bold text-xs">Call Now</a>}
          </div>
        </div>

        <div className="md:col-span-3 bg-gray-50 rounded-xl p-1 border">
          <div className="bg-white rounded-lg p-5 border shadow-sm">
            <h3 className="font-bold text-sm">Send a Quick Message</h3>
            <p className="text-xs text-gray-500 mt-1">Sends via WhatsApp to business number — works for Ugandan customers</p>
            
            {sent ? (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="text-2xl">✓</div>
                <div className="font-bold text-sm mt-2 text-green-800">Message sent via WhatsApp!</div>
                <div className="text-xs text-green-600 mt-1">Opened WhatsApp with your message. Business will reply in 5 minutes.</div>
              </div>
            ) : (
              <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-700">Your Name *</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Grace" required className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-700">Your Phone (MTN/Airtel)</label>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0700 123456" className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-700">How can we help? *</label>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="I want to book braids tomorrow..." rows={3} required className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 resize-none"></textarea>
                </div>
                <button type="submit" className="w-full py-3 rounded-lg text-white font-bold text-sm shadow hover:shadow-md transition" style={{ backgroundColor: primary }}>
                  Send via WhatsApp →
                </button>
                <div className="text-[10px] text-center text-gray-400">Clicking sends your message to {data.phone || 'business'} via WhatsApp • No email needed • Works on phone</div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
