// VoidBuild Payments - Fixed limits - Free 1 site, Starter 1, Business 3, Pro 10
import { getSupabase } from './supabase';

export type Plan = 'free' | 'hustler' | 'business' | 'pro';

export interface PlanInfo {
  name: string;
  price: number;
  priceUGX: string;
  limit: number;
  features: string[];
  popular?: boolean;
}

export const PLANS: Record<Plan, PlanInfo> = {
  free: { 
    name: 'Free', 
    price: 0, 
    priceUGX: '0', 
    limit: 1, 
    features: ['1 website', 'Your link on voidbuild.com', 'WhatsApp booking', 'Community support'] 
  },
  hustler: { 
    name: 'Starter', 
    price: 15000, 
    priceUGX: '15,000', 
    limit: 1, 
    features: ['1 website', 'Your custom subdomain', 'WhatsApp button', '5,000 monthly visits', 'Fast Africa edge loading'] 
  },
  business: { 
    name: 'Business', 
    price: 35000, 
    priceUGX: '35,000', 
    limit: 3, 
    features: ['3 websites', 'Custom domain ready', 'Visitor analytics', 'Priority WhatsApp support', 'Remove VoidBuild badge'], 
    popular: true 
  },
  pro: { 
    name: 'Pro', 
    price: 75000, 
    priceUGX: '75,000', 
    limit: 10, 
    features: ['10 websites', 'Unlimited visits', 'Online store catalog', 'Dedicated support', 'VIP onboarding'] 
  },
};

export function getUserPlan(): Plan {
  if (typeof window === 'undefined') return 'free';
  return (localStorage.getItem('voidbuild_plan') as Plan) || 'free';
}

export function setUserPlan(plan: Plan) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('voidbuild_plan', plan);
  localStorage.setItem('voidbuild_plan_date', new Date().toISOString());
}

export async function syncUserPlanWithCloud(userId?: string): Promise<Plan> {
  const localPlan = getUserPlan();
  const supabase = getSupabase();

  if (supabase && userId) {
    try {
      // Check if user has completed payment in Supabase
      const { data } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0 && data[0].plan && PLANS[data[0].plan as Plan]) {
        const cloudPlan = data[0].plan as Plan;
        setUserPlan(cloudPlan);
        return cloudPlan;
      }

      // If local plan is paid but not recorded in Supabase, sync it to Supabase
      if (localPlan !== 'free') {
        await supabase.from('payments').insert({
          user_id: userId,
          plan: localPlan,
          transaction_id: `sync-${Date.now()}`,
          status: 'completed',
          amount: PLANS[localPlan]?.price || 0,
        });
      }
    } catch (e) {
      console.warn('Plan sync failed:', e);
    }
  }

  return localPlan;
}

export function canCreateProject(): boolean {
  const plan = getUserPlan();
  const limit = PLANS[plan]?.limit || 1;
  try {
    const raw = localStorage.getItem('voidbuild_projects_v2');
    const projects = raw ? JSON.parse(raw) : [];
    return projects.length < limit;
  } catch {
    return true;
  }
}

export function isPaid(): boolean {
  const plan = getUserPlan();
  return plan !== 'free';
}

export function getRemainingSites(): number {
  const plan = getUserPlan();
  const limit = PLANS[plan]?.limit || 1;
  try {
    const raw = localStorage.getItem('voidbuild_projects_v2');
    const projects = raw ? JSON.parse(raw) : [];
    return Math.max(0, limit - projects.length);
  } catch {
    return limit;
  }
}
