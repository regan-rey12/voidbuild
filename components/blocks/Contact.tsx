"use client";
import React, { useState } from 'react';
import { MapPin, Phone, Clock, MessageCircle, AlertCircle, Check } from 'lucide-react';
import { recordWhatsAppClick } from '@/lib/projects';

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

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const update = (field: string, value: string) => {
    if (onUpdateData) onUpdateData({ ...data, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setFormError('Please enter your name and message');
      return;
    }
    const number = waNumber.replace(/[^0-9]/g, '');
    if (!number) {
      setFormError('Business WhatsApp number is not configured yet');
      return;
    }
    setFormError(null);
    const text = `Hello! I came from your website (voidbuild.com)\nName: ${name}\nPhone: ${phone || 'Not provided'}\nMessage: ${message}`;
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/${number}?text=${encoded}`;
    recordWhatsAppClick();
    try {
      const inquiries = JSON.parse(localStorage.getItem('voidbuild_inquiries') || '[]');
      inquiries.unshift({ name, phone, message, businessPhone: data.phone, date: new Date().toISOString() });
      localStorage.setItem('voidbuild_inquiries', JSON.stringify(inquiries.slice(0, 50)));
    } catch {}
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
                <div className="w-9 h-9 rounded-lg bg-gray-50 border flex items-center justify-center flex-shrink-0"><MapPin className="w-4 h-4 text-gray-600" /></div>
                <div>
                  <div className="font-semibold text-xs text-gray-900">Location</div>
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
                <div className="w-9 h-9 rounded-lg bg-gray-50 border flex items-center justify-center flex-shrink-0"><Phone className="w-4 h-4 text-gray-600" /></div>
                <div>
                  <div className="font-semibold text-xs text-gray-900">Call</div>
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
                <div className="w-9 h-9 rounded-lg bg-gray-50 border flex items-center justify-center flex-shrink-0"><Clock className="w-4 h-4 text-gray-600" /></div>
                <div>
                  <div className="font-semibold text-xs text-gray-900">Hours</div>
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
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex justify-center items-center gap-1.5 px-4 py-2.5 rounded-lg text-white font-bold text-xs shadow" style={{ backgroundColor: '#25D366' }}>
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
            {data.phone && (
              <a href={`tel:${data.phone}`} className="inline-flex justify-center items-center px-4 py-2.5 rounded-lg bg-gray-900 text-white font-bold text-xs">
                Call Now
              </a>
            )}
          </div>
        </div>

        <div className="md:col-span-3 bg-gray-50 rounded-xl p-1 border">
          <div className="bg-white rounded-lg p-5 border shadow-sm">
            <h3 className="font-bold text-sm text-gray-900">Send a Quick Message</h3>
            <p className="text-xs text-gray-500 mt-1">Sends via WhatsApp directly to business</p>
            
            {sent ? (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <div className="font-bold text-sm mt-2 text-green-800">Opening WhatsApp...</div>
                <div className="text-xs text-green-600 mt-1">Your message is ready to send.</div>
              </div>
            ) : (
              <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-700">Your Name *</label>
                    <input value={name} onChange={(e) => { setName(e.target.value); if (formError) setFormError(null); }} placeholder="e.g. Grace" required className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-700">Your Phone</label>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0700 123456" className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-700">Message *</label>
                  <textarea value={message} onChange={(e) => { setMessage(e.target.value); if (formError) setFormError(null); }} placeholder="I want to book..." rows={3} required className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 resize-none"></textarea>
                </div>
                
                {formError && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <button type="submit" className="w-full py-3 rounded-lg text-white font-bold text-sm shadow hover:shadow-md transition" style={{ backgroundColor: primary }}>
                  Send via WhatsApp
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
