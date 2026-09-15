import type { Metadata } from 'next';
import Link from 'next/link';
import TemplateRenderer from '@/components/TemplateRenderer';
import PublicPageTracker from '@/components/PublicPageTracker';
import { buildProjectMetadata, getPublicProjectByHostServer } from '@/lib/public-projects';

type PageProps = {
  params: Promise<{ domain: string; path?: string[] }>;
};

function cleanDomain(value: string) {
  return decodeURIComponent(value).toLowerCase().trim();
}

function publicUrl(domain: string, path?: string[]) {
  const origin = domain === 'localhost' || domain.endsWith('.localhost') || domain === '127.0.0.1'
    ? `http://${domain}`
    : `https://${domain}`;
  const suffix = path?.length ? `/${path.map((part) => encodeURIComponent(part)).join('/')}` : '';
  return `${origin}${suffix}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { domain, path } = await params;
  const clean = cleanDomain(domain);
  const project = await getPublicProjectByHostServer(clean);

  if (!project) {
    return {
      title: 'Website Not Found',
      description: 'This business website could not be found on VoidBuild.',
      robots: { index: false, follow: false },
    };
  }

  return buildProjectMetadata(project, publicUrl(clean, path));
}

export default async function CustomDomainPage({ params }: PageProps) {
  const { domain } = await params;
  const clean = cleanDomain(domain);
  const project = await getPublicProjectByHostServer(clean);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-3 px-6 text-center bg-gray-50">
        <img src="/logo.png" alt="VoidBuild" className="w-12 h-12 object-contain mx-auto" />
        <div className="font-bold text-lg text-gray-900">Website not found</div>
        <div className="text-xs text-gray-500 max-w-md leading-relaxed">
          This domain is not connected to a published VoidBuild website.
        </div>
        <Link href="/builder" className="mt-3 px-6 py-2.5 rounded-full bg-gray-900 text-white text-xs font-bold hover:bg-black transition shadow-sm">
          Build a Website
        </Link>
      </div>
    );
  }

  return (
    <>
      <PublicPageTracker projectId={project.id} />
      <TemplateRenderer template={project.template_json} projectId={project.id} />
    </>
  );
}
