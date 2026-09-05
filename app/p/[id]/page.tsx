import type { Metadata } from 'next';
import Link from 'next/link';
import TemplateRenderer from '@/components/TemplateRenderer';
import PublicPageTracker from '@/components/PublicPageTracker';
import {
  buildProjectMetadata,
  getPublicProjectByIdServer,
  parseSharedProjectFromParam,
} from '@/lib/public-projects';

type SearchValue = string | string[] | undefined;

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, SearchValue>>;
};

function pickFirst(value: SearchValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const encoded = pickFirst(resolvedSearchParams.d);

  const fallbackProject = parseSharedProjectFromParam(id, encoded);
  const project = (await getPublicProjectByIdServer(id)) || fallbackProject;

  if (!project) {
    return {
      title: 'Website Not Found | VoidBuild',
      description: 'This shared VoidBuild website could not be found.',
      robots: { index: false, follow: false },
    };
  }

  const canonical = `https://voidbuild.com/p/${id}`;
  return buildProjectMetadata(project, canonical, { noIndex: true });
}

export default async function PublicPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const encoded = pickFirst(resolvedSearchParams.d);
  const needSupabase = pickFirst(resolvedSearchParams.needSupabase);

  const fallbackProject = parseSharedProjectFromParam(id, encoded);
  const project = (await getPublicProjectByIdServer(id)) || fallbackProject;
  const isFallback = !!fallbackProject && !project?.user_id;

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-3 px-6 text-center bg-gray-50">
        <img src="/logo.png" alt="VoidBuild" className="w-12 h-12 object-contain mx-auto" />
        <div className="font-bold text-lg text-gray-900">Website not found</div>
        <div className="text-sm text-gray-500 max-w-md">
          {needSupabase ? (
            <>This shared website was not found in cloud storage. The creator may need to save it again from a signed-in account.</>
          ) : (
            <>ID: {id} — This shared link is unavailable or may have been removed.</>
          )}
        </div>
        <Link href="/" className="mt-3 px-5 py-2.5 rounded-full bg-gray-900 text-white text-xs font-bold hover:bg-black">
          Create Website on VoidBuild
        </Link>
      </div>
    );
  }

  return (
    <div>
      {!isFallback && <PublicPageTracker projectId={project.id} />}
      <div className="relative z-40 bg-gray-950 text-white text-center text-xs py-2 px-4 flex items-center justify-center gap-2 border-b border-white/10">
        <img src="/logo.png" alt="VoidBuild" className="w-4 h-4 object-contain flex-shrink-0" />
        {isFallback ? (
          <span>
            Shared via secure link • Built with{' '}
            <Link href="/" className="font-bold underline text-yellow-400">VoidBuild</Link>
          </span>
        ) : (
          <span>
            {project.business_name} • Built with{' '}
            <Link href="/" className="font-bold underline text-yellow-400">VoidBuild</Link>
          </span>
        )}
      </div>
      <TemplateRenderer template={project.template_json} projectId={isFallback ? undefined : project.id} />
      {isFallback && (
        <div className="bg-blue-50 border-t text-center text-[11px] text-blue-700 py-2">
          This shared link contains site data directly. Save while signed in for cloud analytics and dashboard management.
        </div>
      )}
    </div>
  );
}
