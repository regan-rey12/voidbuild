"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getProjectById, SavedProject } from '../../../lib/projects';
import TemplateRenderer from '../../../components/TemplateRenderer';

export default function PublicPage() {
  const params = useParams();
  const id = params.id as string;
  const [project, setProject] = useState<SavedProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getProjectById(id).then(p => {
      setProject(p);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading website...</div>;
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-3">
        <div className="text-4xl">😕</div>
        <div className="font-bold">Website not found</div>
        <div className="text-sm text-gray-500">ID: {id} - maybe saved on different device (localStorage)</div>
        <a href="/" className="mt-3 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm">Create New Website</a>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-yellow-100 border-b text-center text-xs py-2">
        This site built with <a href="/" className="font-bold underline">VoidBuild.com</a> — AI for Ugandan SMEs • MTN MoMo Ready
      </div>
      <TemplateRenderer template={project.template_json} />
    </div>
  );
}
