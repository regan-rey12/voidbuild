"use client";
import { useState } from 'react';
import { MessageSquare, X, ThumbsUp, ThumbsDown, Check, AlertCircle } from 'lucide-react';

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!rating) {
      setErrorMsg('Please select thumbs up or thumbs down');
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    try {
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
        setErrorMsg('Unable to submit feedback at this moment. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-30 w-11 h-11 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all group"
        title="Send feedback"
      >
        <MessageSquare className="w-5 h-5 text-gray-700 group-hover:text-black" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border">
            <div className="p-5 border-b flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="VoidBuild" className="w-6 h-6 object-contain flex-shrink-0" />
                <h3 className="font-bold text-sm text-gray-900">Feedback — Help us improve VoidBuild</h3>
              </div>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-5">
              {!submitted ? (
                <>
                  <div className="text-xs font-semibold text-gray-700">How is your experience with VoidBuild?</div>
                  <div className="flex gap-3 mt-2.5">
                    <button
                      onClick={() => {
                        setRating('up');
                        if (errorMsg) setErrorMsg(null);
                      }}
                      className={`flex-1 py-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition ${rating === 'up' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'}`}
                    >
                      <ThumbsUp className="w-5 h-5" />
                      <span className="text-xs font-bold">Good - I like it</span>
                    </button>
                    <button
                      onClick={() => {
                        setRating('down');
                        if (errorMsg) setErrorMsg(null);
                      }}
                      className={`flex-1 py-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition ${rating === 'down' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'}`}
                    >
                      <ThumbsDown className="w-5 h-5" />
                      <span className="text-xs font-bold">Needs work</span>
                    </button>
                  </div>

                  <div className="mt-4">
                    <label className="text-xs font-semibold text-gray-700">What can we improve? (optional)</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="e.g. Salon prices in UGX, more Ugandan images, custom color options..."
                      rows={3}
                      className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 resize-none"
                    />
                    <div className="mt-1 text-[11px] text-gray-400">{comment.length}/500</div>
                  </div>

                  {errorMsg && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-red-600">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={!rating || loading}
                    className="mt-4 w-full py-2.5 rounded-xl bg-gray-900 text-white font-bold text-xs disabled:opacity-50 hover:bg-black transition"
                  >
                    {loading ? 'Sending...' : 'Send Feedback'}
                  </button>
                </>
              ) : (
                <div className="py-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                    <Check className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-sm mt-3 text-gray-900">Thank you for your feedback!</div>
                  <div className="text-xs text-gray-600 mt-1">We review feedback continuously to improve VoidBuild for Uganda.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
