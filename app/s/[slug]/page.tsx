"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getProjects, SavedProject, recordPageView } from '@/lib/projects';
import TemplateRenderer from '@/components/TemplateRenderer';
import { slugify } from '@/lib/slugify';
import Link from 'next/link';

export default function SubdomainPage() {
  const params = useParams();
  const rawSlug = (params.slug as string) || '';
  const slug = decodeURIComponent(rawSlug).toLowerCase().trim();
  const [project, setProject] = useState<SavedProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    
    getProjects().then(projects => {
      const found = projects.find(p => {
        const customSub = (p.subdomain || '').toLowerCase().trim();
        const businessSlug = slugify(p.business_name || '');
        const idSlug = (p.id || '').toLowerCase();
        const generatedSubdomain = `${businessSlug}-${p.id.slice(-6).toLowerCase()}`;
        
        return (
          customSub === slug ||
          p.id === slug ||
          businessSlug === slug ||
          generatedSubdomain === slug ||
          idSlug.includes(slug)
        );
      });
      
      if (found) {
        recordPageView(found.id);
        setProject(found);
      } else {
        setProject(null);
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        <div className="w-6 h-6 rounded-full border-2 border-gray-300 border-t-gray-900 animate-spin mr-2.5"></div>
        <span>Loading {slug}.voidbuild.com...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-3 px-6 text-center bg-gray-50">
        <img src="/logo.png" alt="VoidBuild" className="w-12 h-12 object-contain mx-auto" />
        <div className="font-bold text-lg text-gray-900">Website not found: {slug}.voidbuild.com</div>
        <div className="text-xs text-gray-500 max-w-md leading-relaxed">
          This subdomain has not been registered yet. Build your shop website in 30 seconds and claim your custom voidbuild.com subdomain for free.
        </div>
        <Link href="/builder" className="mt-3 px-6 py-2.5 rounded-full bg-gray-900 text-white text-xs font-bold hover:bg-black transition shadow-sm">
          Claim Subdomain &amp; Build Website
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-gray-900 text-white text-center text-[11px] py-1.5 px-4 flex items-center justify-center gap-2">
        <img src="/logo.png" alt="VoidBuild" className="w-3.5 h-3.5 object-contain flex-shrink-0" />
        <span className="font-bold">{project.business_name}</span>
        <span>•</span>
        <span className="text-gray-300">{slug}.voidbuild.com</span>
        <span>•</span>
        <a href="/" className="underline text-yellow-400 font-bold hover:text-yellow-300">
          Built with VoidBuild
        </a>
      </div>
      <TemplateRenderer template={project.template_json} />
    </div>
  );
}
