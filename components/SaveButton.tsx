"use client";
import { useState } from 'react';
import { Save, Link2, Check, Loader2, X, Sparkles, ArrowRight, LayoutDashboard } from 'lucide-react';
import { Template } from '@/lib/types';
import { saveProject, generateShareLink } from '@/lib/projects';
import Paywall from './Paywall';
import Link from 'next/link';

export default function SaveButton({ template }: { template: Template }) {
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
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
            <a
              href={shareLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] bg-gray-900 text-white px-3 py-1 rounded-full font-bold flex items-center gap-1 hover:bg-black transition shadow-sm"
            >
              <Link2 className="w-3 h-3" />
              <span>View Live</span>
            </a>
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
