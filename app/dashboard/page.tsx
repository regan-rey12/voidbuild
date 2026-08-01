"use client";
import { useEffect, useState } from 'react';
import { getProjects, SavedProject } from '../../lib/projects';
import { isSupabaseConfigured } from '../../lib/supabase';
import { getEffectiveUser, User } from '../../lib/auth';
import AuthButton from '../../components/AuthButton';
import Link from 'next/link';

export default function Dashboard() {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getEffectiveUser().then(u => setUser(u));
    getProjects().then(p => {
      setProjects(p);
      setLoading(false);
    });
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold">← VoidBuild</Link>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500 hidden md:block">
              {isSupabaseConfigured() ? '● Supabase Connected' : '○ Local Mode - works offline'}
            </div>
            <AuthButton />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Your Websites</h1>
            {user && <div className="text-xs text-gray-500 mt-1">Signed in as {user.email || user.phone || user.id.slice(0, 12)} • {projects.length} sites</div>}
            {!user && <div className="text-xs text-gray-500 mt-1"><Link href="/auth" className="underline">Sign in</Link> to save across devices, or continue as guest (local only)</div>}
          </div>
          <Link href="/builder" className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm">+ New Website</Link>
        </div>
        <p className="text-gray-600 mt-2 text-sm">All features free for MVP launch. {user ? `Projects linked to your account.` : 'Sign in to sync across phone and laptop.'}</p>

        {loading ? (
          <div className="mt-10 text-center text-gray-500">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="mt-16 text-center border-2 border-dashed rounded-2xl p-12 bg-white">
            <div className="text-4xl">📄</div>
            <div className="mt-3 font-bold">No websites yet</div>
            <div className="text-sm text-gray-500 mt-1">Go to Builder, generate a site, click Save & Get Link</div>
            <Link href="/builder" className="mt-4 inline-flex px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm">Generate Website</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {projects.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border p-5 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div className="text-xs px-2 py-1 rounded-full bg-gray-100">{p.category}</div>
                  <div className="text-xs text-gray-400">{p.created_at ? new Date(p.created_at).toLocaleDateString() : ''}</div>
                </div>
                <div className="font-bold mt-3">{p.business_name}</div>
                <div className="text-xs text-gray-500 mt-1">{p.template_json?.blocks?.length} blocks • {p.id.slice(-6)}</div>
                <div className="mt-4 flex gap-2">
                  <a href={`/p/${p.id}`} className="flex-1 text-center px-3 py-2 rounded-lg bg-gray-900 text-white text-xs font-bold">View Live</a>
                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/p/${p.id}`;
                      navigator.clipboard.writeText(link);
                      alert('Link copied: ' + link + ' - Send to customer on WhatsApp');
                    }}
                    className="px-3 py-2 rounded-lg bg-gray-100 text-xs"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
