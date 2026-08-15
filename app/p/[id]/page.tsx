"use client";
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { getProjectById, SavedProject, recordPageView } from '../../../lib/projects';
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
    recordPageView(id);
    getProjectById(id).then(p => {
      setProject(p);
      const d = searchParams.get('d');
      if (d && p) setIsFallback(true);
      setLoading(false);
    });
  }, [id, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
        <div className="w-6 h-6 rounded-full border-2 border-gray-300 border-t-gray-900 animate-spin mr-2.5"></div>
        <span>Loading website...</span>
      </div>
    );
  }

  if (!project) {
    const needSupabase = searchParams.get('needSupabase');
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-3 px-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl">!</div>
        <div className="font-bold">Website not found on this device</div>
        <div className="text-sm text-gray-500 max-w-md">
          {needSupabase ? (
            <>This site was saved locally on creator&apos;s phone/laptop and is too large to share via link alone. Creator needs to enable Supabase sync in .env.local to make cross-device sharing work.</>
          ) : (
            <>ID: {id} — This site was saved locally. Connect Supabase to enable global cross-device synchronization.</>
          )}
        </div>
        <a href="/" className="mt-3 px-5 py-2.5 rounded-full bg-gray-900 text-white text-xs font-bold hover:bg-black">Create Website on VoidBuild</a>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-yellow-100 border-b text-center text-xs py-2 px-4 text-yellow-950 font-medium">
        {isFallback ? (
          <span>Shared via link • Built with <a href="/" className="font-bold underline">VoidBuild</a></span>
        ) : (
          <span>{project.business_name} • Built with <a href="/" className="font-bold underline">VoidBuild</a> (AI for Ugandan SMEs)</span>
        )}
      </div>
      <TemplateRenderer template={project.template_json} />
      {isFallback && (
        <div className="bg-blue-50 border-t text-center text-[11px] text-blue-700 py-2">
          This link contains site data. Connect Supabase for instant custom domain &amp; analytics.
        </div>
      )}
    </div>
  );
}
