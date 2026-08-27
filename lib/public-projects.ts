import 'server-only';

import type { Metadata } from 'next';
import { getSupabaseServer } from './supabase-server';
import type { Template } from './types';

export interface PublicProject {
  id: string;
  business_name: string;
  category: string;
  template_json: Template;
  whatsapp_clicks?: number;
  views?: number;
  created_at?: string;
  published?: boolean;
  phone?: string;
  user_id?: string;
  subdomain?: string;
  custom_domain?: string;
}

function safeDecodeBase64Json(input: string): any | null {
  try {
    const json = Buffer.from(decodeURIComponent(input), 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function parseSharedProjectFromParam(id: string, encoded?: string | null): PublicProject | null {
  if (!encoded) return null;
  const template = safeDecodeBase64Json(encoded);
  if (!template || !template.blocks) return null;

  return {
    id,
    business_name: template.name || 'Shared Site',
    category: template.category || 'business',
    template_json: template,
    published: true,
    created_at: new Date().toISOString(),
  };
}

export async function getPublicProjectByIdServer(id: string): Promise<PublicProject | null> {
  const supabase = getSupabaseServer();
  if (!supabase) return null;

  try {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('published', true)
      .limit(1)
      .maybeSingle();

    return (data as PublicProject | null) || null;
  } catch {
    return null;
  }
}

export async function getPublicProjectBySlugServer(slug: string): Promise<PublicProject | null> {
  const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();
  const supabase = getSupabaseServer();
  if (!supabase) return null;

  try {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('subdomain', cleanSlug)
      .eq('published', true)
      .limit(1)
      .maybeSingle();

    if (data) return data as PublicProject;
  } catch {}

  try {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('id', cleanSlug)
      .eq('published', true)
      .limit(1)
      .maybeSingle();

    return (data as PublicProject | null) || null;
  } catch {
    return null;
  }
}

function readHeroSubtitle(project: PublicProject): string {
  const hero = project.template_json?.blocks?.find((b: any) => b.type === 'hero');
  return String(hero?.data?.subtitle || '').trim();
}

function readLocation(project: PublicProject): string {
  const contact = project.template_json?.blocks?.find((b: any) => b.type === 'contact');
  return String(contact?.data?.location || '').trim();
}

function readServiceNames(project: PublicProject): string[] {
  const services = project.template_json?.blocks?.find((b: any) => b.type === 'services');
  const items = Array.isArray(services?.data?.services) ? services.data.services : [];
  return items.map((s: any) => String(s?.name || '').trim()).filter(Boolean).slice(0, 3);
}

export function buildProjectDescription(project: PublicProject): string {
  const subtitle = readHeroSubtitle(project);
  if (subtitle) return subtitle.slice(0, 160);

  const location = readLocation(project);
  const serviceNames = readServiceNames(project);
  const parts = [project.business_name, project.category, location, serviceNames.join(', ')].filter(Boolean);
  const description = parts.join(' • ');
  return (description || 'Professional business website built with VoidBuild.').slice(0, 160);
}

export function buildProjectMetadata(project: PublicProject, url: string, options?: { noIndex?: boolean }): Metadata {
  const title = `${project.business_name} | VoidBuild`;
  const description = buildProjectDescription(project);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    robots: options?.noIndex
      ? {
          index: false,
          follow: true,
        }
      : {
          index: true,
          follow: true,
        },
    openGraph: {
      title: project.business_name,
      description,
      url,
      type: 'website',
      siteName: 'VoidBuild',
      images: ['/og-image.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.business_name,
      description,
      images: ['/og-image.png'],
    },
  };
}
