"use client";
import { useState } from 'react';
import { Save, Link2, Check } from 'lucide-react';
import { Template } from '../lib/types';
import { saveProject, generateShareLink } from '../lib/projects';

export default function SaveButton({ template }: { template: Template }) {
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      const project = await saveProject(template);
      const link = generateShareLink(project);
      setSavedId(project.id);
      setShareLink(link);
      await navigator.clipboard.writeText(link);
    } catch (e: any) {
      // Show limit reached error
      if (e.message && e.message.includes('allows')) {
        alert(e.message + '\n\nGo to Dashboard to upgrade via MTN MoMo (Pesapal).');
        window.location.href = '/dashboard';
      } else {
        console.log(template);
        alert('Failed to save: ' + (e.message || 'Unknown error'));
      }
    }
    setSaving(false);
  };

  if (savedId && shareLink) {
    return (
      <div className="flex items-center gap-1">
        <span className="hidden md:inline-flex text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-full items-center gap-1"><Check className="w-3 h-3" /> Saved</span>
        <a href={shareLink} target="_blank" className="text-[11px] bg-gray-900 text-white px-2.5 py-1 rounded-full font-bold flex items-center gap-1"><Link2 className="w-3 h-3" /> View</a>
      </div>
    );
  }

  return (
    <button
      onClick={handleSave}
      disabled={saving}
      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-900 text-white text-xs font-bold hover:bg-black disabled:opacity-50 transition"
    >
      <Save className="w-3.5 h-3.5" />
      <span>Save</span>
    </button>
  );
}
