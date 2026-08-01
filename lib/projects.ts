// VoidBuild Projects - Save/Load with Supabase fallback to localStorage
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
}

const LS_KEY = 'voidbuild_projects_v2';

// Save project - tries Supabase first, then localStorage
export async function saveProject(template: Template, phone?: string): Promise<SavedProject> {
  const supabase = getSupabase();
  
  // Get current user for isolation
  let userId: string | null = null;
  try {
    const { getEffectiveUser } = await import('./auth');
    const user = await getEffectiveUser();
    userId = user?.id || null;
  } catch {}

  const project: SavedProject = {
    id: template.id + '-' + Date.now().toString(36),
    business_name: template.name,
    category: template.category,
    template_json: template,
    created_at: new Date().toISOString(),
    published: false,
    phone: phone || template.blocks.find(b => b.data?.phone)?.data?.phone,
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
      
      if (error) throw error;
      // Also save to local cache
      saveToLocalStorage(project);
      return data as SavedProject;
    } catch (e) {
      console.warn('Supabase save failed, falling back to localStorage:', e);
      // fallback
    }
  }

  // Fallback: localStorage
  saveToLocalStorage(project);
  return project;
}

function saveToLocalStorage(project: SavedProject) {
  try {
    const existing = getLocalProjects();
    existing.unshift(project);
    localStorage.setItem(LS_KEY, JSON.stringify(existing.slice(0, 50))); // keep 50 max
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
  
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      if (data && data.length > 0) return data as SavedProject[];
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
  return local || null;
}
