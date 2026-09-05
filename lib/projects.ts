// VoidBuild Projects - cloud-first project access with local fallback where needed
import { Template } from './types';
import { getSupabase } from './supabase';
import { slugify } from './slugify';

export interface SavedProject {
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

export interface LeadInput {
  projectId: string;
  name: string;
  phone?: string;
  message: string;
  source?: string;
}

const LS_KEY = 'voidbuild_projects_v2';

const RESERVED_SUBDOMAINS = [
  'api', 'admin', 'app', 'dashboard', 'builder', 'pricing', 'auth',
  'www', 'voidbuild', 'mail', 'blog', 'help', 'status', 'support', 'test', 'demo',
];

function getVisitorHash(): string {
  try {
    if (typeof window === 'undefined') return 'server';
    const key = 'voidbuild_visitor_hash';
    let value = localStorage.getItem(key);
    if (!value) {
      value = `vh_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      localStorage.setItem(key, value);
    }
    return value;
  } catch {
    return 'unknown';
  }
}

async function postJson(url: string, body: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch {}
}

export function validateSubdomain(slug: string): { valid: boolean; error?: string } {
  const clean = slug.toLowerCase().trim();
  if (clean.length < 3) return { valid: false, error: 'Subdomain must be at least 3 characters long.' };
  if (clean.length > 30) return { valid: false, error: 'Subdomain cannot exceed 30 characters.' };
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(clean)) {
    return { valid: false, error: 'Only lowercase letters, numbers, and hyphens (cannot start or end with a hyphen).' };
  }
  if (RESERVED_SUBDOMAINS.includes(clean)) {
    return { valid: false, error: `"${clean}" is a reserved system address.` };
  }
  return { valid: true };
}

function getUserIdSync(): string | null {
  try {
    if (typeof window === 'undefined') return null;
    const authSession = localStorage.getItem('voidbuild_supabase_auth');
    if (authSession) {
      try {
        const parsed = JSON.parse(authSession);
        if (parsed?.user?.id) return parsed.user.id;
        if (parsed?.currentSession?.user?.id) return parsed.currentSession.user.id;
        if (Array.isArray(parsed) && parsed[0]?.user?.id) return parsed[0].user.id;
      } catch {}
    }
    const demo = localStorage.getItem('voidbuild_user_demo');
    if (demo) {
      try {
        const d = JSON.parse(demo);
        return d.id || null;
      } catch {}
    }
    const sbLegacy = localStorage.getItem('sb-xrqvdbjoezyszlvhffwj-auth-token');
    if (sbLegacy) {
      try {
        const p = JSON.parse(sbLegacy);
        return p?.user?.id || p?.id || null;
      } catch {}
    }
    return null;
  } catch {
    return null;
  }
}

function mergeProjects(cloud: SavedProject[], local: SavedProject[], userId?: string | null): SavedProject[] {
  const localFiltered = userId
    ? local.filter((p) => !p.user_id || p.user_id === userId || p.user_id.startsWith('demo'))
    : local;

  const merged = [...cloud, ...localFiltered].slice(0, 100);
  const seenIds = new Set<string>();
  const seenSubdomains = new Set<string>();

  return merged.filter((p) => {
    const sub = (p.subdomain || '').toLowerCase().trim();
    if (seenIds.has(p.id)) return false;
    if (sub && seenSubdomains.has(sub)) return false;
    seenIds.add(p.id);
    if (sub) seenSubdomains.add(sub);
    return true;
  });
}

function buildSubdomainCandidate(base: string, attempt: number): string {
  if (attempt <= 0) return base;
  const suffix = `-${attempt + 1}`;
  const trimmedBase = base.slice(0, Math.max(1, 30 - suffix.length)).replace(/-+$/g, '');
  return `${trimmedBase}${suffix}`;
}

async function resolveAvailableSubdomain(
  base: string,
  supabase: ReturnType<typeof getSupabase>,
  localProjects: SavedProject[]
): Promise<string> {
  for (let attempt = 0; attempt < 25; attempt++) {
    const candidate = buildSubdomainCandidate(base, attempt);
    const localTaken = localProjects.some((project) => (project.subdomain || '').toLowerCase().trim() === candidate);
    if (localTaken) continue;

    if (supabase) {
      try {
        const { data } = await supabase.from('projects').select('id').eq('subdomain', candidate).limit(1).maybeSingle();
        if (data?.id) continue;
      } catch {}
    }

    return candidate;
  }

  return `${base.slice(0, 24).replace(/-+$/g, '')}-${Date.now().toString(36).slice(-4)}`;
}

export async function saveProject(template: Template, phone?: string): Promise<SavedProject> {
  const supabase = getSupabase();
  const userId = getUserIdSync();
  const localProjects = getLocalProjects();

  const payments = await import('./payments');
  let plan = payments.getUserPlan();

  if (supabase && userId) {
    try {
      plan = await payments.refreshUserPlanFromCloud(userId);
      const { count, error } = await supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (!error) {
        const limit = payments.PLANS[plan].limit;
        if ((count || 0) >= limit) {
          const err: any = new Error(`Limit reached: Your ${payments.PLANS[plan].name} plan allows ${limit} website${limit === 1 ? '' : 's'}.`);
          err.code = 'LIMIT_REACHED';
          throw err;
        }
      }
    } catch (e: any) {
      if (e.code === 'LIMIT_REACHED' || (e.message && e.message.includes('Limit reached'))) {
        throw e;
      }
    }
  } else {
    try {
      if (!payments.canCreateProject()) {
        const limit = payments.PLANS[plan].limit;
        const err: any = new Error(`Limit reached: Your ${payments.PLANS[plan].name} plan allows ${limit} website${limit === 1 ? '' : 's'}.`);
        err.code = 'LIMIT_REACHED';
        throw err;
      }
    } catch (e: any) {
      if (e.code === 'LIMIT_REACHED' || (e.message && e.message.includes('Limit reached'))) {
        throw e;
      }
    }
  }

  const generatedSub = await resolveAvailableSubdomain(slugify(template.name || 'my-shop'), supabase, localProjects);

  const project: SavedProject = {
    id: `${template.id}-${Date.now().toString(36)}`,
    business_name: template.name,
    category: template.category,
    template_json: template,
    created_at: new Date().toISOString(),
    published: true,
    phone: phone || template.blocks.find((b) => b.data?.phone)?.data?.phone,
    user_id: userId || undefined,
    whatsapp_clicks: 0,
    views: 0,
    subdomain: generatedSub,
  };

  if (supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          id: project.id,
          business_name: project.business_name,
          category: project.category,
          template_json: project.template_json,
          phone: project.phone,
          published: true,
          user_id: userId,
          subdomain: project.subdomain,
          whatsapp_clicks: 0,
          views: 0,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        saveToLocalStorage(data as SavedProject);
        return data as SavedProject;
      }
    } catch (e: any) {
      console.warn('Supabase save failed:', e);
      throw new Error(e?.message || 'Unable to save this website to your live account right now. Please try again.');
    }
  }

  saveToLocalStorage(project);
  return project;
}

export async function claimLocalProjects(userId: string): Promise<void> {
  if (!userId) return;
  const supabase = getSupabase();
  const existing = getLocalProjects();
  let updated = false;

  for (let i = 0; i < existing.length; i++) {
    const proj = existing[i];
    if (proj && (!proj.user_id || proj.user_id.startsWith('demo'))) {
      proj.user_id = userId;
      updated = true;
      if (supabase) {
        try {
          await supabase.from('projects').upsert({
            id: proj.id,
            business_name: proj.business_name,
            category: proj.category,
            template_json: proj.template_json,
            phone: proj.phone,
            user_id: userId,
            subdomain: proj.subdomain,
            custom_domain: proj.custom_domain,
            published: proj.published ?? true,
            views: proj.views || 0,
            whatsapp_clicks: proj.whatsapp_clicks || 0,
          });
        } catch {}
      }
    }
  }

  if (updated) {
    localStorage.setItem(LS_KEY, JSON.stringify(existing));
  }
}

export async function updateProjectSubdomain(
  id: string,
  newSubdomain: string,
  customDomain?: string
): Promise<{ success: boolean; project?: SavedProject; error?: string }> {
  const val = validateSubdomain(newSubdomain);
  if (!val.valid) {
    return { success: false, error: val.error };
  }

  const supabase = getSupabase();
  const cleanSub = newSubdomain.toLowerCase().trim();
  const cleanDomain = customDomain?.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/$/, '') || undefined;

  const existing = getLocalProjects();
  const existingProject = existing.find((p) => p.id === id);
  const lockedCustomDomain = existingProject?.custom_domain?.toLowerCase().trim() || '';

  if (lockedCustomDomain && cleanDomain !== lockedCustomDomain) {
    return {
      success: false,
      error: 'This custom domain has already been requested or connected. Please contact VoidBuild support to change it safely.',
    };
  }

  const duplicate = existing.find((p) => p.id !== id && (p.subdomain === cleanSub || (!p.subdomain && slugify(p.business_name) === cleanSub)));
  if (duplicate) {
    return { success: false, error: `Subdomain "${cleanSub}" is already taken by another website.` };
  }

  if (supabase) {
    try {
      const updatePayload: Record<string, string | undefined> = { subdomain: cleanSub };
      if (!lockedCustomDomain && cleanDomain !== undefined) {
        updatePayload.custom_domain = cleanDomain;
      }

      const { error } = await supabase.from('projects').update(updatePayload).eq('id', id);
      if (error) {
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to update project link.' };
    }
  }

  const idx = existing.findIndex((p) => p.id === id);
  if (idx !== -1) {
    existing[idx].subdomain = cleanSub;
    if (!lockedCustomDomain && cleanDomain !== undefined) existing[idx].custom_domain = cleanDomain;
    localStorage.setItem(LS_KEY, JSON.stringify(existing));
    return { success: true, project: existing[idx] };
  }

  return {
    success: true,
    project: { id, business_name: '', category: '', template_json: {} as Template, subdomain: cleanSub, custom_domain: lockedCustomDomain || cleanDomain } as SavedProject,
  };
}

export async function deleteProject(id: string): Promise<boolean> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      await supabase.from('projects').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete failed, proceeding with local delete:', e);
    }
  }

  try {
    const existing = getLocalProjects();
    const filtered = existing.filter((p) => p.id !== id);
    localStorage.setItem(LS_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

function saveToLocalStorage(project: SavedProject) {
  try {
    const existing = getLocalProjects();
    const filtered = existing.filter((p) => p.id !== project.id);
    filtered.unshift(project);
    localStorage.setItem(LS_KEY, JSON.stringify(filtered.slice(0, 100)));
  } catch {}
}

export function getLocalProjects(): SavedProject[] {
  try {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function getProjects(): Promise<SavedProject[]> {
  const supabase = getSupabase();
  const userId = getUserIdSync();
  const local = getLocalProjects();

  if (!userId) {
    return local;
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        return mergeProjects(data as SavedProject[], local, userId);
      }
    } catch (e) {
      console.warn('Supabase fetch failed, using local:', e);
    }
  }

  return local.filter((p) => !p.user_id || p.user_id === userId || p.user_id.startsWith('demo'));
}

export async function getProjectById(id: string): Promise<SavedProject | null> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data } = await supabase.from('projects').select('*').eq('id', id).single();
      if (data) return data as SavedProject;
    } catch {}
  }

  const local = getLocalProjects().find((p) => p.id === id);
  if (local) return local;

  try {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const d = params.get('d');
      if (d) {
        const jsonStr = atob(d);
        const template = JSON.parse(jsonStr);
        if (template && template.blocks) {
          return {
            id,
            business_name: template.name || 'Shared Site',
            category: template.category || 'business',
            template_json: template,
            created_at: new Date().toISOString(),
            published: true,
          };
        }
      }
    }
  } catch {}

  return null;
}

export async function getPublicProjectBySlug(slug: string): Promise<SavedProject | null> {
  const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('subdomain', cleanSlug)
        .eq('published', true)
        .limit(1)
        .maybeSingle();

      if (data) return data as SavedProject;
    } catch {}

    try {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('id', cleanSlug)
        .eq('published', true)
        .limit(1)
        .maybeSingle();

      if (data) return data as SavedProject;
    } catch {}
  }

  const local = getLocalProjects().find((p) => {
    const sub = (p.subdomain || '').toLowerCase().trim();
    return p.published && (sub === cleanSlug || p.id.toLowerCase() === cleanSlug);
  });

  return local || null;
}

export function generateShareLink(project: SavedProject): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const supabase = getSupabase();

  if (supabase) {
    return `${origin}/p/${project.id}`;
  }

  try {
    const jsonStr = JSON.stringify(project.template_json);
    const base64 = btoa(jsonStr);
    if (base64.length > 1500) {
      return `${origin}/p/${project.id}?needSupabase=1`;
    }
    return `${origin}/p/${project.id}?d=${encodeURIComponent(base64)}`;
  } catch {
    return `${origin}/p/${project.id}`;
  }
}

export function recordWhatsAppClick(projectId?: string) {
  try {
    if (typeof window === 'undefined') return;
    if (projectId) {
      void postJson('/api/events/whatsapp-click', {
        projectId,
        visitorHash: getVisitorHash(),
        source: 'whatsapp_cta',
      });
    }
  } catch {}
}

export function recordPageView(projectId?: string) {
  try {
    if (typeof window === 'undefined') return;
    if (projectId) {
      void postJson('/api/events/view', {
        projectId,
        visitorHash: getVisitorHash(),
        source: 'public_page',
      });
    }
  } catch {}
}

export async function submitLead(input: LeadInput): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: input.projectId,
        name: input.name,
        phone: input.phone,
        message: input.message,
        source: input.source || 'website',
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to submit lead' };
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || 'Failed to submit lead' };
  }
}

export function getProjectStats(): { clicks: number; views: number } {
  return { clicks: 0, views: 0 };
}
