"use client";
import { useState } from 'react';
import { Template } from '../lib/types';
import { saveProject } from '../lib/projects';

export default function SaveButton({ template }: { template: Template }) {
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      const project = await saveProject(template);
      setSavedId(project.id);
      // Copy share link
      const link = `${window.location.origin}/p/${project.id}`;
      await navigator.clipboard.writeText(link);
    } catch (e) {
      alert('Save failed, but copied JSON to console');
      console.log(template);
    }
    setSaving(false);
  };

  if (savedId) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs bg-green-100 text-green-700 px-3 py-2 rounded-full">✓ Saved!</span>
        <a href={`/p/${savedId}`} target="_blank" className="text-xs bg-gray-900 text-white px-3 py-2 rounded-lg">View Link</a>
        <a href="/dashboard" className="text-xs bg-white border px-3 py-2 rounded-lg">Dashboard</a>
      </div>
    );
  }

  return (
    <button
      onClick={handleSave}
      disabled={saving}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-bold hover:bg-black disabled:opacity-50"
    >
      {saving ? 'Saving...' : '💾 Save & Get Link'}
    </button>
  );
}
