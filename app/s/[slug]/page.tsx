"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getProjects, SavedProject } from '../../../lib/projects';
import TemplateRenderer from '../../../components/TemplateRenderer';
import { slugify } from '../../../lib/slugify';

export default function SubdomainPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [project, setProject] = useState<SavedProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    
    getProjects().then(projects => {
      // Find by slug: Check id, business_name slug, or generated subdomain
      const found = projects.find(p => {
        const businessSlug = slugify(p.business_name);
        const idSlug = p.id.toLowerCase();
        const generatedSubdomain = `${businessSlug}-${p.id.slice(-6).toLowerCase()}`;
        return (
          p.id === slug ||
          businessSlug === slug ||
          generatedSubdomain === slug ||
          idSlug.includes(slug) ||
          slug.includes(businessSlug)
        );
      });
      
      setProject(found || null);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Loading {slug}.voidbuild.com...</div>;
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-3 px-6 text-center">
        <img src="/logo.png" alt="" className="w-12 h-12 rounded-xl border object-contain bg-white p-1" />
        <div className="font-bold">Website not found: {slug}</div>
        <div className="text-sm text-gray-500 max-w-md">This subdomain doesn't exist yet. Create your website at voidbuild.com/builder and publish to get {slug}.voidbuild.com automatically.</div>
        <a href="/builder" className="mt-3 px-5 py-2.5 rounded-full bg-gray-900 text-white text-sm font-bold">Build Website</a>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-gray-900 text-white text-center text-[11px] py-1.5 px-4">
        {project.business_name} • Live at {slug}.voidbuild.com • Powered by <a href="/" className="underline font-bold">voidbuild</a> • Build yours free
      </div>
      <TemplateRenderer template={project.template_json} />
    </div>
  );
}
