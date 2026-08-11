// VoidBuild Projects - With user_id isolation and base64 share fallback for /p broken fix
import { Template } from './types';
import { getSupabase } from './supabase';

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
}

const LS_KEY = 'voidbuild_projects_v2';
const LS_PENDING = 'voidbuild_pending_payments';

function getUserIdSync(): string | null {
  try {
    if (typeof window === 'undefined') return null;
    // Try Supabase auth first
    const rawUser = localStorage.getItem('voidbuild_user_demo') || localStorage.getItem('sb-xrqvdbjoezyszlvhffwj-auth-token');
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        return parsed?.user?.id || parsed?.id || null;
      } catch {}
    }
    // Fallback to demo user id
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

  // Enforce plan limits - Free 1 site, Starter 1, Business 3, Pro 10
  try {
    const { canCreateProject, getUserPlan, PLANS } = await import('./payments');
    if (!canCreateProject()) {
      const plan = getUserPlan();
      const limit = PLANS[plan].limit;
      throw new Error(`Free plan allows ${limit} website. You have reached limit. Upgrade to Business (3 sites) or Pro (10 sites) to create more. Go to Dashboard -> Paywall to upgrade via MTN MoMo.`);
    }
  } catch (e: any) {
    // If error is about limit, re-throw it to show to user
    if (e.message && e.message.includes('allows')) {
      throw e;
    }
    // Otherwise ignore and continue saving
  }

  const project: SavedProject = {
    id: template.id + '-' + Date.now().toString(36),
    business_name: template.name,
    category: template.category,
    template_json: template,
    created_at: new Date().toISOString(),
    published: false,
    phone: phone || template.blocks.find(b => b.data?.phone)?.data?.phone,
    user_id: userId || undefined,
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
  
  if (supabase) {
    try {
      let query = supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(50);
      // Filter by user_id if we have it - fixes RLS open public issue
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        // Also merge with local for offline
        const local = getLocalProjects();
        const merged = [...data as SavedProject[], ...local].slice(0, 50);
        // Deduplicate by id
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
  
  return getLocalProjects();
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

  // Critical #3 fix: Check URL for base64 data param ?d= for cross-device sharing when Supabase not configured
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

// Generate share link that works cross-device even without Supabase - base64 data in URL
export function generateShareLink(project: SavedProject): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const supabase = getSupabase();
  
  // If Supabase configured, simple /p/id link works cross-device
  if (supabase) {
    return `${origin}/p/${project.id}`;
  }
  
  // If no Supabase (localStorage only mode), encode template in URL for cross-device sharing - fixes /p broken
  try {
    const jsonStr = JSON.stringify(project.template_json);
    const base64 = btoa(jsonStr);
    // Check length - if too long (>2000 chars), URL may be too long for WhatsApp, fallback to id only with warning
    if (base64.length > 1500) {
      return `${origin}/p/${project.id}?needSupabase=1`;
    }
    return `${origin}/p/${project.id}?d=${encodeURIComponent(base64)}`;
  } catch {
    return `${origin}/p/${project.id}`;
  }
}
