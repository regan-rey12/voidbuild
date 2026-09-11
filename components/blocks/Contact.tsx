"use client";
import React, { useState } from 'react';
import { MapPin, Phone, Clock, MessageCircle, AlertCircle, Check } from 'lucide-react';
import { recordWhatsAppClick, submitLead } from '@/lib/projects';

interface ContactProps {
  data: {
    phone?: string;
    whatsapp?: string;
    location?: string;
    hours?: string;
    email?: string;
    heading?: string;
    subheading?: string;
    buttonText?: string;
    variant?: string;
  };
  style?: {
    primaryColor?: string;
  };
  projectId?: string;
  editMode?: boolean;
  onUpdateData?: (newData: any) => void;
}

export default function Contact({ data, style, projectId, editMode, onUpdateData }: ContactProps) {
  const primary = style?.primaryColor || '#111827';
  const variant = data.variant || 'default';
  const isBoutique = variant === 'boutique';
  const isPharmacy = variant === 'pharmacy';
  const isHotel = variant === 'hotel';
  const isBarbershop = variant === 'barbershop';
  const isHardware = variant === 'hardware';
  const isClinic = variant === 'clinic';
  const isBakery = variant === 'bakery';
  const isGym = variant === 'gym';
  const isLaundry = variant === 'laundry';
  const isIt = variant === 'it';
  const isTutoring = variant === 'tutoring';
  const isSchool = variant === 'school';
  const isPortfolio = variant === 'portfolio';
  const isRestaurant = variant === 'restaurant';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setFormError('Please enter your name and message');
      return;
    }
    const number = waNumber.replace(/[^0-9]/g, '');
    if (!number) {
      setFormError('Business contact number is not configured yet');
      return;
    }
    setFormError(null);
    const text = `Hello! I came from your website (voidbuild.com)\nName: ${name}\nPhone: ${phone || 'Not provided'}\nMessage: ${message}`;
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/${number}?text=${encoded}`;

    if (projectId) {
      const leadResult = await submitLead({
        projectId,
        name,
        phone,
        message,
        source: 'website_contact_form',
      });
      if (!leadResult.success) {
        console.warn('Lead save warning:', leadResult.error);
      }
    }

    recordWhatsAppClick(projectId);
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
    <section id="contact" className={isBoutique ? 'py-16 md:py-20 px-4 md:px-6 bg-[#fdfaf6]' : isPharmacy ? 'py-16 md:py-20 px-4 md:px-6 bg-[#f7fcfa]' : isHotel ? 'py-16 md:py-20 px-4 md:px-6 bg-[#0e2b21]' : isBarbershop ? 'py-16 md:py-20 px-4 md:px-6 bg-[#efede9]' : isHardware ? 'py-16 md:py-20 px-4 md:px-6 bg-[#eef1f4]' : isClinic ? 'py-16 md:py-20 px-4 md:px-6 bg-[#f7fcfd]' : isBakery ? 'py-16 md:py-20 px-4 md:px-6 bg-[#fdf8f0]' : isGym ? 'py-16 md:py-20 px-4 md:px-6 bg-[#f4f6f0]' : isLaundry ? 'py-16 md:py-20 px-4 md:px-6 bg-[#f2fafc]' : isIt ? 'py-16 md:py-20 px-4 md:px-6 bg-[#f6f7fd]' : isTutoring ? 'py-16 md:py-20 px-4 md:px-6 bg-[#fdf7f0]' : isSchool ? 'py-16 md:py-20 px-4 md:px-6 bg-[#f3f6fd]' : isPortfolio ? 'py-16 md:py-20 px-4 md:px-6 bg-[#faf8f7]' : isRestaurant ? 'py-16 md:py-20 px-4 md:px-6 bg-[#fdf7ec]' : 'py-16 px-6 bg-white'}>
      <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-8 items-start">
        <div className="md:col-span-2">
          <div className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold mb-3 ${isBoutique ? 'bg-stone-100 text-stone-800 border border-stone-200' : isPharmacy ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : isHotel ? 'bg-white/10 text-amber-200 border border-amber-200/25' : isBarbershop ? 'bg-[#1c1917] text-amber-100 border border-[#1c1917]' : isHardware ? 'bg-[#16283a] text-orange-100 border border-[#16283a]' : isClinic ? 'bg-cyan-50 text-cyan-800 border border-cyan-100' : isBakery ? 'bg-amber-50 text-amber-800 border border-amber-100' : isGym ? 'bg-lime-50 text-lime-800 border border-lime-100' : isLaundry ? 'bg-cyan-50 text-cyan-800 border border-cyan-100' : isIt ? 'bg-indigo-50 text-indigo-800 border border-indigo-100' : isTutoring ? 'bg-orange-50 text-orange-800 border border-orange-100' : isSchool ? 'bg-blue-50 text-blue-800 border border-blue-100' : isPortfolio ? 'bg-red-50 text-red-800 border border-red-100' : isRestaurant ? 'bg-amber-50 text-amber-800 border border-amber-100' : 'bg-gray-100 text-gray-800'}`}>
            {isPharmacy ? 'Talk to the Pharmacy' : isHotel ? 'Reservations' : isBarbershop ? 'Walk-ins & Booking' : isHardware ? 'Trade Counter & Quotes' : isClinic ? 'Clinic Reception' : isBakery ? 'Order Desk' : isGym ? 'Gym Reception' : isLaundry ? 'Pickup & Orders' : isIt ? 'Book a Consultation' : isTutoring ? 'Book an Assessment' : isSchool ? 'Admissions Office' : isPortfolio ? 'Studio & Bookings' : isRestaurant ? 'Order & Reservations' : 'Get in Touch'}
          </div>
          <h2 className={isBoutique || isPharmacy || isClinic || isRestaurant ? 'text-2xl md:text-4xl font-extrabold tracking-tight text-gray-900' : isHotel ? 'text-2xl md:text-4xl font-extrabold tracking-tight text-white' : isBarbershop || isHardware ? 'text-2xl md:text-4xl font-extrabold tracking-tight text-gray-900' : 'text-2xl font-bold tracking-tight'}>
            {editMode && onUpdateData ? (
              <input value={data.heading || 'Visit Us Today'} onChange={(e) => update('heading', e.target.value)} className="w-full font-bold text-2xl md:text-4xl border border-blue-300 rounded px-2 py-1" />
            ) : (
              data.heading || 'Visit Us Today'
            )}
          </h2>
          <p className={isBoutique || isPharmacy || isClinic || isRestaurant ? 'mt-3 text-sm md:text-base text-gray-600 leading-relaxed' : isHotel ? 'mt-3 text-sm md:text-base text-white/75 leading-relaxed' : isBarbershop || isHardware ? 'mt-3 text-sm md:text-base text-gray-600 leading-relaxed' : 'mt-2 text-sm text-gray-600'}>
            {data.subheading || 'Fast replies for inquiries, visits, orders, and bookings.'}
          </p>

          <div className="mt-6 space-y-4 text-sm">
            {data.location && (
              <div className="flex gap-3">
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${isBoutique ? 'bg-white border-stone-200' : isPharmacy || isClinic ? 'bg-white border-cyan-100' : isBakery || isRestaurant ? 'bg-white border-amber-100' : isGym ? 'bg-[#0e120c] border-[#0e120c]' : isLaundry ? 'bg-[#0c2733] border-[#0c2733]' : isIt ? 'bg-[#131736] border-[#131736]' : isTutoring ? 'bg-[#221208] border-[#221208]' : isSchool ? 'bg-[#0b1b33] border-[#0b1b33]' : isPortfolio ? 'bg-[#14100e] border-[#14100e]' : isHotel ? 'bg-white/10 border-white/15' : isBarbershop ? 'bg-[#1c1917] border-[#1c1917]' : isHardware ? 'bg-[#16283a] border-[#16283a]' : 'bg-gray-50 border-gray-200'}`}><MapPin className={`w-4 h-4 ${isHotel || isBarbershop ? 'text-amber-300' : isHardware ? 'text-orange-300' : isBakery || isRestaurant ? 'text-amber-600' : isGym ? 'text-lime-300' : isLaundry ? 'text-cyan-300' : isIt ? 'text-indigo-300' : isTutoring ? 'text-orange-300' : isSchool ? 'text-blue-300' : isPortfolio ? 'text-red-300' : 'text-gray-600'}`} /></div>
                <div>
                  <div className={`font-semibold text-xs ${isHotel ? 'text-white' : 'text-gray-900'}`}>Location</div>
                  {editMode && onUpdateData ? (
                    <input value={data.location} onChange={(e) => update('location', e.target.value)} className="w-full text-xs border border-blue-300 rounded px-2 py-1 mt-1" />
                  ) : (
                    <div className={`text-xs mt-0.5 ${isHotel ? 'text-white/70' : 'text-gray-600'}`}>{data.location}</div>
                  )}
                </div>
              </div>
            )}
            {data.phone && (
              <div className="flex gap-3">
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${isBoutique ? 'bg-white border-stone-200' : isPharmacy || isClinic ? 'bg-white border-cyan-100' : isBakery || isRestaurant ? 'bg-white border-amber-100' : isGym ? 'bg-[#0e120c] border-[#0e120c]' : isLaundry ? 'bg-[#0c2733] border-[#0c2733]' : isIt ? 'bg-[#131736] border-[#131736]' : isTutoring ? 'bg-[#221208] border-[#221208]' : isSchool ? 'bg-[#0b1b33] border-[#0b1b33]' : isPortfolio ? 'bg-[#14100e] border-[#14100e]' : isHotel ? 'bg-white/10 border-white/15' : isBarbershop ? 'bg-[#1c1917] border-[#1c1917]' : isHardware ? 'bg-[#16283a] border-[#16283a]' : 'bg-gray-50 border-gray-200'}`}><Phone className={`w-4 h-4 ${isHotel || isBarbershop ? 'text-amber-300' : isHardware ? 'text-orange-300' : isBakery || isRestaurant ? 'text-amber-600' : isGym ? 'text-lime-300' : isLaundry ? 'text-cyan-300' : isIt ? 'text-indigo-300' : isTutoring ? 'text-orange-300' : isSchool ? 'text-blue-300' : isPortfolio ? 'text-red-300' : 'text-gray-600'}`} /></div>
                <div>
                  <div className={`font-semibold text-xs ${isHotel ? 'text-white' : 'text-gray-900'}`}>Call</div>
                  {editMode && onUpdateData ? (
                    <input value={data.phone} onChange={(e) => update('phone', e.target.value)} className="w-full text-xs border border-blue-300 rounded px-2 py-1 mt-1" />
                  ) : (
                    <a href={`tel:${data.phone}`} className={`text-xs font-medium hover:underline mt-0.5 inline-block ${isHotel ? 'text-white' : 'text-gray-900'}`}>{data.phone}</a>
                  )}
                </div>
              </div>
            )}
            {data.hours && (
              <div className="flex gap-3">
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${isBoutique ? 'bg-white border-stone-200' : isPharmacy || isClinic ? 'bg-white border-cyan-100' : isBakery || isRestaurant ? 'bg-white border-amber-100' : isGym ? 'bg-[#0e120c] border-[#0e120c]' : isLaundry ? 'bg-[#0c2733] border-[#0c2733]' : isIt ? 'bg-[#131736] border-[#131736]' : isTutoring ? 'bg-[#221208] border-[#221208]' : isSchool ? 'bg-[#0b1b33] border-[#0b1b33]' : isPortfolio ? 'bg-[#14100e] border-[#14100e]' : isHotel ? 'bg-white/10 border-white/15' : isBarbershop ? 'bg-[#1c1917] border-[#1c1917]' : isHardware ? 'bg-[#16283a] border-[#16283a]' : 'bg-gray-50 border-gray-200'}`}><Clock className={`w-4 h-4 ${isHotel || isBarbershop ? 'text-amber-300' : isHardware ? 'text-orange-300' : isBakery || isRestaurant ? 'text-amber-600' : isGym ? 'text-lime-300' : isLaundry ? 'text-cyan-300' : isIt ? 'text-indigo-300' : isTutoring ? 'text-orange-300' : isSchool ? 'text-blue-300' : isPortfolio ? 'text-red-300' : 'text-gray-600'}`} /></div>
                <div>
                  <div className={`font-semibold text-xs ${isHotel ? 'text-white' : 'text-gray-900'}`}>Hours</div>
                  {editMode && onUpdateData ? (
                    <input value={data.hours} onChange={(e) => update('hours', e.target.value)} className="w-full text-xs border border-blue-300 rounded px-2 py-1 mt-1" />
                  ) : (
                    <div className={`text-xs mt-0.5 ${isHotel ? 'text-white/70' : 'text-gray-600'}`}>{data.hours}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => recordWhatsAppClick(projectId)}
              className="inline-flex justify-center items-center gap-1.5 px-4 py-2.5 rounded-lg text-white font-bold text-xs shadow"
              style={{ backgroundColor: primary }}
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isPharmacy ? 'Message Pharmacy' : isHotel ? 'Message the Lodge' : isBarbershop ? 'Message the Shop' : isHardware ? 'Message the Depot' : isClinic ? 'Message the Clinic' : isBakery ? 'Message the Bakery' : isGym ? 'Message the Gym' : isLaundry ? 'Message the Laundry' : isIt ? 'Message the Team' : isTutoring ? 'Message the Centre' : isSchool ? 'Message the School' : isPortfolio ? 'Message the Studio' : isRestaurant ? 'Message the Restaurant' : 'Message Store'}</span>
            </a>
            {data.phone && (
              <a href={`tel:${data.phone}`} className={`inline-flex justify-center items-center px-4 py-2.5 rounded-lg text-white font-bold text-xs ${isHotel ? 'bg-white/10 border border-white/15' : 'bg-gray-900'}`}>
                Call Now
              </a>
            )}
          </div>
        </div>

        <div className={`md:col-span-3 rounded-xl p-1 border ${isBoutique ? 'bg-[#f4ede6] border-stone-200' : isPharmacy ? 'bg-[#ecfdf5] border-emerald-100' : isHotel ? 'bg-white/10 border-white/15' : isBarbershop ? 'bg-[#e7e4de] border-stone-300' : isHardware ? 'bg-[#e2e8ee] border-slate-300' : isClinic ? 'bg-[#ecfdf9] border-cyan-100' : isBakery ? 'bg-[#faf0df] border-amber-100' : isGym ? 'bg-[#eaf2e0] border-lime-100' : isLaundry ? 'bg-[#e5f3f8] border-cyan-100' : isIt ? 'bg-[#eceefb] border-indigo-100' : isTutoring ? 'bg-[#fdeee0] border-orange-100' : isSchool ? 'bg-[#e8eefb] border-blue-100' : isPortfolio ? 'bg-[#f7ece9] border-red-100' : isRestaurant ? 'bg-[#faf0df] border-amber-100' : 'bg-gray-50 border-gray-200'}`}>
          <div className={`rounded-lg p-5 border shadow-sm ${isBoutique ? 'bg-white border-stone-200' : isPharmacy ? 'bg-white border-emerald-100' : isRestaurant ? 'bg-white border-amber-100' : 'bg-white border-gray-200'}`}>
            <h3 className="font-bold text-sm text-gray-900">Send a Quick Message</h3>
            <p className="text-xs text-gray-500 mt-1">{isHotel ? 'Tell us your dates and guest numbers — reservations replies within a few hours.' : isBarbershop ? 'Send your cut and time — we confirm your chair shortly after.' : isHardware ? 'Send your material list — we reply with current prices, stock and delivery costs.' : isClinic ? 'Tell us what you need — reception confirms your visit time shortly after.' : isBakery ? 'Tell us what you are ordering — we confirm price and pick-up time the same day.' : isGym ? 'Tell us when you want to train — we confirm your free trial session shortly after.' : isLaundry ? 'Send your location and bag size — we confirm your pickup window the same day.' : isIt ? 'Tell us about your systems and pain points — we schedule your free assessment.' : isTutoring ? 'Tell us your learner\u2019s class and subjects — we book the free assessment session.' : isSchool ? 'Tell us your child\u2019s class — the admissions office confirms an interview date.' : isPortfolio ? 'Tell us your event date and venue — we confirm availability and a quote.' : isRestaurant ? 'Tell us your order or table booking — we confirm quickly on WhatsApp.' : 'Your message opens directly in WhatsApp for fast follow-up.'}</p>

            {sent ? (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <div className="font-bold text-sm mt-2 text-green-800">Opening message...</div>
                <div className="text-xs text-green-600 mt-1">Your inquiry is ready to send.</div>
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
                  <textarea value={message} onChange={(e) => { setMessage(e.target.value); if (formError) setFormError(null); }} placeholder={isPharmacy ? 'Tell us the medicine or support you need...' : isHotel ? 'Tell us your dates, number of guests and any questions...' : isBarbershop ? 'Tell us the cut or package you want, and when you are coming...' : isHardware ? 'List the materials you need with quantities — e.g. 40 bags of cement...' : isClinic ? 'Tell us which service you need and a preferred time...' : isRestaurant ? 'Tell us your order or the time you would like a table...' : 'Tell us what you are looking for...'} rows={3} required className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 resize-none"></textarea>
                </div>

                {formError && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <button type="submit" className="w-full py-3 rounded-lg text-white font-bold text-sm shadow hover:shadow-md transition" style={{ backgroundColor: primary }}>
                  {data.buttonText || 'Send Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
