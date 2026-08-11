"use client";
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { getProjectById, SavedProject } from '../../../lib/projects';
import TemplateRenderer from '../../../components/TemplateRenderer';

export default function PublicPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const [project, setProject] = useState<SavedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    if (!id) return;
    getProjectById(id).then(p => {
      setProject(p);
      // Check if loaded via base64 fallback (cross-device without Supabase)
      const d = searchParams.get('d');
      if (d && p) setIsFallback(true);
      setLoading(false);
    });
  }, [id, searchParams]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">Loading website...</div>;
  }

  if (!project) {
    const needSupabase = searchParams.get('needSupabase');
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-3 px-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl">!</div>
        <div className="font-bold">Website not found on this device</div>
        <div className="text-sm text-gray-500 max-w-md">
          {needSupabase ? (
            <>This site was saved locally on creator's phone/laptop and is too large to share via link alone. Creator needs to enable Supabase sync in .env.local to make cross-device sharing work. Ask creator to add Supabase URL + Key and save again.</>
          ) : (
            <>ID: {id} - This site was saved locally on creator's device (localStorage). For cross-device sharing that works on any phone, creator needs to enable Supabase in .env.local. See supabase/schema.sql and add NEXT_PUBLIC_SUPABASE_URL to .env.local</>
          )}
        </div>
        <a href="/" className="mt-3 px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-bold">Create New Website - VoidBuild</a>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-yellow-100 border-b text-center text-xs py-2 px-4">
        {isFallback ? (
          <span>Shared via link with data (works without Supabase) - Built with <a href="/" className="font-bold underline">VoidBuild</a></span>
        ) : (
          <span>This site built with <a href="/" className="font-bold underline">VoidBuild.com</a> - AI for Ugandan SMEs</span>
        )}
      </div>
      <TemplateRenderer template={project.template_json} />
      {isFallback && (
        <div className="bg-blue-50 border-t text-center text-[11px] text-blue-700 py-2">
          This link contains site data (works cross-device even without Supabase). For larger sites, enable Supabase for better sharing.
        </div>
      )}
    </div>
  );
}
