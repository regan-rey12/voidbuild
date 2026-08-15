// VoidBuild Projects - With user_id isolation, base64 share fallback, and Subdomain Management
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

const LS_KEY = 'voidbuild_projects_v2';

const RESERVED_SUBDOMAINS = [
  'api', 'admin', 'app', 'dashboard', 'builder', 'pricing', 'auth', 
  'www', 'voidbuild', 'mail', 'blog', 'help', 'status', 'support', 'test', 'demo'
];

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
    const rawUser = localStorage.getItem('voidbuild_user_demo') || localStorage.getItem('sb-xrqvdbjoezyszlvhffwj-auth-token');
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        return parsed?.user?.id || parsed?.id || null;
      } catch {}
    }
    const demo = localStorage.getItem('voidbuild_user_demo');
    if (demo) {
      try {
        const d = JSON.parse(demo);
        return d.id || null;
      } catch {}
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveProject(template: Template, phone?: string): Promise<SavedProject> {
  const supabase = getSupabase();
  const userId = getUserIdSync();

  try {
    const { canCreateProject, getUserPlan, PLANS } = await import('./payments');
    if (!canCreateProject()) {
      const plan = getUserPlan();
      const limit = PLANS[plan].limit;
      const err: any = new Error(`Limit reached: Your ${PLANS[plan].name} plan allows ${limit} website${limit === 1 ? '' : 's'}.`);
      err.code = 'LIMIT_REACHED';
      throw err;
    }
  } catch (e: any) {
    if (e.code === 'LIMIT_REACHED' || (e.message && e.message.includes('Limit reached'))) {
      throw e;
    }
  }

  const generatedSub = slugify(template.name || 'my-shop');

  const project: SavedProject = {
    id: template.id + '-' + Date.now().toString(36),
    business_name: template.name,
    category: template.category,
    template_json: template,
    created_at: new Date().toISOString(),
    published: false,
    phone: phone || template.blocks.find(b => b.data?.phone)?.data?.phone,
    user_id: userId || undefined,
    whatsapp_clicks: 0,
    views: 1,
    subdomain: generatedSub,
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          id: project.id,
          business_name: project.business_name,
          category: project.category,
          template_json: project.template_json,
          phone: project.phone,
          published: false,
          user_id: userId,
          subdomain: project.subdomain,
        })
        .select()
        .single();
      
      if (!error && data) {
        saveToLocalStorage(data as SavedProject);
        return data as SavedProject;
      }
    } catch (e) {
      console.warn('Supabase save failed, fallback to local:', e);
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
  const duplicate = existing.find(p => p.id !== id && (p.subdomain === cleanSub || (!p.subdomain && slugify(p.business_name) === cleanSub)));
  if (duplicate) {
    return { success: false, error: `Subdomain "${cleanSub}" is already taken by another website.` };
  }

  if (supabase) {
    try {
      await supabase.from('projects').update({ subdomain: cleanSub, custom_domain: cleanDomain }).eq('id', id);
    } catch {}
  }

  const idx = existing.findIndex(p => p.id === id);
  if (idx !== -1) {
    existing[idx].subdomain = cleanSub;
    if (cleanDomain !== undefined) existing[idx].custom_domain = cleanDomain;
    localStorage.setItem(LS_KEY, JSON.stringify(existing));
    return { success: true, project: existing[idx] };
  }

  return { success: false, error: 'Website not found' };
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
    const filtered = existing.filter(p => p.id !== id);
    localStorage.setItem(LS_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

function saveToLocalStorage(project: SavedProject) {
  try {
    const existing = getLocalProjects();
    existing.unshift(project);
    localStorage.setItem(LS_KEY, JSON.stringify(existing.slice(0, 50)));
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
  
  if (supabase) {
    try {
      let query = supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(50);
      if (userId) {
        query = query.or(`user_id.eq.${userId},user_id.is.null`);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const merged = [...data as SavedProject[], ...local].slice(0, 50);
        const seen = new Set();
        return merged.filter(p => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });
      }
    } catch (e) {
      console.warn('Supabase fetch failed, using local:', e);
    }
  }
  
  return local;
}

export async function getProjectById(id: string): Promise<SavedProject | null> {
  const supabase = getSupabase();
  
  if (supabase) {
    try {
      const { data } = await supabase.from('projects').select('*').eq('id', id).single();
      if (data) return data as SavedProject;
    } catch {}
  }
  
  const local = getLocalProjects().find(p => p.id === id);
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

// Analytics Tracking Helpers for SME owners
export function recordWhatsAppClick(projectId?: string) {
  try {
    if (typeof window === 'undefined') return;
    const globalCount = parseInt(localStorage.getItem('wb_total_whatsapp_clicks') || '0', 10) + 1;
    localStorage.setItem('wb_total_whatsapp_clicks', globalCount.toString());

    if (projectId) {
      const key = `wb_clicks_${projectId}`;
      const count = parseInt(localStorage.getItem(key) || '0', 10) + 1;
      localStorage.setItem(key, count.toString());

      const existing = getLocalProjects();
      const idx = existing.findIndex(p => p.id === projectId);
      if (idx !== -1) {
        existing[idx].whatsapp_clicks = (existing[idx].whatsapp_clicks || 0) + 1;
        localStorage.setItem(LS_KEY, JSON.stringify(existing));
      }
    }
  } catch {}
}

export function recordPageView(projectId?: string) {
  try {
    if (typeof window === 'undefined') return;
    const globalCount = parseInt(localStorage.getItem('wb_total_views') || '0', 10) + 1;
    localStorage.setItem('wb_total_views', globalCount.toString());

    if (projectId) {
      const key = `wb_views_${projectId}`;
      const count = parseInt(localStorage.getItem(key) || '0', 10) + 1;
      localStorage.setItem(key, count.toString());

      const existing = getLocalProjects();
      const idx = existing.findIndex(p => p.id === projectId);
      if (idx !== -1) {
        existing[idx].views = (existing[idx].views || 0) + 1;
        localStorage.setItem(LS_KEY, JSON.stringify(existing));
      }
    }
  } catch {}
}

export function getProjectStats(projectId?: string): { clicks: number; views: number } {
  try {
    if (typeof window === 'undefined') return { clicks: 0, views: 0 };
    if (projectId) {
      const clicks = parseInt(localStorage.getItem(`wb_clicks_${projectId}`) || '0', 10);
      const views = parseInt(localStorage.getItem(`wb_views_${projectId}`) || '0', 10);
      return { clicks, views: Math.max(views, clicks) };
    }
    const totalClicks = parseInt(localStorage.getItem('wb_total_whatsapp_clicks') || '0', 10);
    const totalViews = parseInt(localStorage.getItem('wb_total_views') || '0', 10);
    return { clicks: totalClicks, views: Math.max(totalViews, totalClicks) };
  } catch {
    return { clicks: 0, views: 0 };
  }
}
