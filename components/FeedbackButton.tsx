"use client";
import { useState } from 'react';
import { MessageSquare, X, ThumbsUp, ThumbsDown, Star } from 'lucide-react';

interface FeedbackData {
  rating: 'up' | 'down' | null;
  comment: string;
  templateId?: string;
  businessName?: string;
}

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!rating) {
      alert('Please select thumbs up or down');
      return;
    }
    setLoading(true);
    try {
      // Get current template info if in builder
      let templateId = '';
      let businessName = '';
      try {
        const raw = localStorage.getItem('voidbuild_projects_v2');
        if (raw) {
          const projects = JSON.parse(raw);
          if (projects[0]) {
            templateId = projects[0].id || '';
            businessName = projects[0].business_name || '';
          }
        }
      } catch {}

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
          templateId,
          businessName,
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send feedback');

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setOpen(false);
        setRating(null);
        setComment('');
      }, 2500);
    } catch (e: any) {
      // Fallback to localStorage if API fails
      try {
        const existing = JSON.parse(localStorage.getItem('voidbuild_feedback') || '[]');
        existing.unshift({ rating, comment, templateId: '', businessName: '', date: new Date().toISOString() });
        localStorage.setItem('voidbuild_feedback', JSON.stringify(existing.slice(0, 50)));
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setOpen(false);
          setRating(null);
          setComment('');
        }, 2500);
      } catch {
        alert('Failed to send feedback - ' + e.message);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-30 w-12 h-12 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all group"
        title="Send feedback"
      >
        <MessageSquare className="w-5 h-5 text-gray-700 group-hover:text-black" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between">
              <h3 className="font-bold text-sm">Feedback - Help us improve VoidBuild</h3>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-5">
              {!submitted ? (
                <>
                  <div className="text-sm font-medium">How is VoidBuild for your business?</div>
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => setRating('up')}
                      className={`flex-1 py-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition ${rating === 'up' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                    >
                      <ThumbsUp className="w-6 h-6" />
                      <span className="text-xs font-bold">Good - I like it</span>
                    </button>
                    <button
                      onClick={() => setRating('down')}
                      className={`flex-1 py-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition ${rating === 'down' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                    >
                      <ThumbsDown className="w-6 h-6" />
                      <span className="text-xs font-bold">Bad - Needs work</span>
                    </button>
                  </div>

                  <div className="mt-5">
                    <label className="text-xs font-semibold">What do you think? (optional)</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="e.g. Salon template braids price wrong, need Luganda, images not Ugandan, button not working..."
                      rows={4}
                      className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 resize-none"
                    />
                    <div className="mt-1 text-[11px] text-gray-500">{comment.length}/500 • We read every feedback to improve AI templates</div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={!rating || loading}
                    className="mt-5 w-full py-3 rounded-xl bg-gray-900 text-white font-bold text-sm disabled:opacity-50 hover:bg-black transition"
                  >
                    {loading ? 'Sending...' : 'Send Feedback'}
                  </button>

                  <div className="mt-3 text-[10px] text-center text-gray-400">Your feedback helps us improve templates for Ugandan SMEs • Saved to Supabase if configured, else local</div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto text-xl">✓</div>
                  <div className="font-bold mt-3">Thank you for feedback!</div>
                  <div className="text-sm text-gray-600 mt-1">We read every feedback to make VoidBuild better for Uganda.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
