"use client";
import { useState } from 'react';
import { Save, Link2, Check, Loader2, X, Sparkles, ArrowRight, LayoutDashboard, MessageCircle } from 'lucide-react';
import { Template } from '@/lib/types';
import { saveProject, generateShareLink } from '@/lib/projects';
import Paywall from './Paywall';
import Link from 'next/link';

export default function SaveButton({ template }: { template: Template }) {
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [savedSubdomain, setSavedSubdomain] = useState<string | null>(null);
  const [showSavedPanel, setShowSavedPanel] = useState(false);
  const [showLimitPaywall, setShowLimitPaywall] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg(null);
    try {
      const project = await saveProject(template);
      const link = generateShareLink(project);
      setSavedId(project.id);
      setShareLink(link);
      setSavedSubdomain(project.subdomain || null);
      setShowSavedPanel(true);
      try {
        await navigator.clipboard.writeText(link);
      } catch {}
    } catch (e: any) {
      if (e.code === 'LIMIT_REACHED' || (e.message && e.message.includes('Limit reached')) || (e.message && e.message.includes('allows'))) {
        setShowLimitPaywall(true);
      } else {
        setErrorMsg(e.message || 'Unable to save website. Please try again.');
        setTimeout(() => setErrorMsg(null), 6000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {errorMsg && (
          <span className="text-[11px] text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full animate-fade-in">
            {errorMsg}
          </span>
        )}

        {savedId && shareLink ? (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex text-[11px] bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full items-center gap-1 font-semibold">
              <Check className="w-3.5 h-3.5" />
              <span>Saved & Copied</span>
            </span>
            <button
              onClick={() => setShowSavedPanel(true)}
              className="text-[11px] bg-white border border-gray-200 text-gray-800 px-3 py-1 rounded-full font-bold hover:bg-gray-50 transition"
            >
              Launch Tips
            </button>
          </div>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gray-900 text-white text-xs font-bold hover:bg-black disabled:opacity-50 transition shadow-sm"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </>
            )}
          </button>
        )}
      </div>

      {showSavedPanel && savedId && shareLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between bg-gray-900 text-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm">Website saved successfully</div>
                  <div className="text-[11px] text-gray-300">Your link has been copied and your site is ready to share.</div>
                </div>
              </div>
              <button
                onClick={() => setShowSavedPanel(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="text-xs font-bold text-green-900">Live website</div>
                <div className="text-sm text-green-800 mt-1 break-all">
                  {savedSubdomain ? `https://${savedSubdomain}.voidbuild.com` : shareLink}
                </div>
                <div className="text-[11px] text-green-700 mt-1">Good next step: share this link on WhatsApp, TikTok bio, Instagram bio, and Google Business.</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={shareLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-black transition"
                >
                  <Link2 className="w-4 h-4" />
                  <span>View Live Website</span>
                </a>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 text-gray-900 text-sm font-bold hover:bg-gray-200 transition"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Open Dashboard</span>
                </Link>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="text-xs font-bold text-gray-900">Fast launch checklist</div>
                <ul className="mt-2 space-y-1.5 text-[12px] text-gray-600">
                  <li>• Confirm business phone, WhatsApp, prices, and location</li>
                  <li>• Replace sample images with real business photos if possible</li>
                  <li>• Share the link with customers immediately</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://wa.me/256751391318?text=Hello%20VoidBuild%2C%20I%20saved%20my%20website%20and%20need%20help%20launching%20it"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-bold transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Get Launch Help</span>
                </a>
                <button
                  onClick={() => setShowSavedPanel(false)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition"
                >
                  Keep Editing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inline Paywall Modal for limit reached - No browser alert() */}
      {showLimitPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            <Paywall
              limitReached={true}
              onDismiss={() => setShowLimitPaywall(false)}
              onDeleteOldSite={() => {
                window.location.href = '/dashboard';
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
