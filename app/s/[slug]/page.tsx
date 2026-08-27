import type { Metadata } from 'next';
import Link from 'next/link';
import TemplateRenderer from '@/components/TemplateRenderer';
import PublicPageTracker from '@/components/PublicPageTracker';
import { buildProjectMetadata, getPublicProjectBySlugServer } from '@/lib/public-projects';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublicProjectBySlugServer(slug);

  if (!project) {
    return {
      title: 'Website Not Found | VoidBuild',
      description: 'This business website could not be found on VoidBuild.',
      robots: { index: false, follow: false },
    };
  }

  const canonical = `https://${project.subdomain || slug}.voidbuild.com`;
  return buildProjectMetadata(project, canonical);
}

export default async function SubdomainPage({ params }: PageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug).toLowerCase().trim();
  const project = await getPublicProjectBySlugServer(slug);

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
      <PublicPageTracker projectId={project.id} />
      <div className="bg-gray-900 text-white text-center text-[11px] py-1.5 px-4 flex items-center justify-center gap-2">
        <img src="/logo.png" alt="VoidBuild" className="w-3.5 h-3.5 object-contain flex-shrink-0" />
        <span className="font-bold">{project.business_name}</span>
        <span>•</span>
        <span className="text-gray-300">{project.subdomain || slug}.voidbuild.com</span>
        <span>•</span>
        <Link href="/" className="underline text-yellow-400 font-bold hover:text-yellow-300">
          Built with VoidBuild
        </Link>
      </div>
      <TemplateRenderer template={project.template_json} projectId={project.id} />
    </div>
  );
}
