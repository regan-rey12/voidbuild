// VoidBuild Payments - plan catalog + browser-side cached subscription lookup
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

const PLAN_CACHE_KEY = 'voidbuild_plan_cache';
const PLAN_CACHE_DATE_KEY = 'voidbuild_plan_cache_date';

export const PLANS: Record<Plan, PlanInfo> = {
  free: {
    name: 'Free',
    price: 0,
    priceUGX: '0',
    limit: 1,
    features: ['1 website', 'Your link on voidbuild.com', 'WhatsApp booking', 'Community support'],
  },
  hustler: {
    name: 'Starter',
    price: 15000,
    priceUGX: '15,000',
    limit: 1,
    features: ['1 website', 'Your custom subdomain', 'WhatsApp button', '5,000 monthly visits', 'Fast Africa edge loading'],
  },
  business: {
    name: 'Business',
    price: 35000,
    priceUGX: '35,000',
    limit: 3,
    features: ['3 websites', 'Custom domain ready', 'Visitor analytics', 'Priority WhatsApp support', 'Remove VoidBuild badge'],
    popular: true,
  },
  pro: {
    name: 'Pro',
    price: 75000,
    priceUGX: '75,000',
    limit: 10,
    features: ['10 websites', 'Unlimited visits', 'Online store catalog', 'Dedicated support', 'VIP onboarding'],
  },
};

function normalizePlan(plan: unknown): Plan {
  if (typeof plan === 'string' && plan in PLANS) {
    return plan as Plan;
  }
  return 'free';
}

function setCachedUserPlan(plan: Plan) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PLAN_CACHE_KEY, plan);
  localStorage.setItem(PLAN_CACHE_DATE_KEY, new Date().toISOString());
  // Backward-compatible cache for older UI code during transition.
  localStorage.setItem('voidbuild_plan', plan);
  localStorage.setItem('voidbuild_plan_date', new Date().toISOString());
}

export function clearCachedUserPlan() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PLAN_CACHE_KEY);
  localStorage.removeItem(PLAN_CACHE_DATE_KEY);
  localStorage.removeItem('voidbuild_plan');
  localStorage.removeItem('voidbuild_plan_date');
}

export function getUserPlan(): Plan {
  if (typeof window === 'undefined') return 'free';
  return normalizePlan(localStorage.getItem(PLAN_CACHE_KEY) || localStorage.getItem('voidbuild_plan'));
}

// Backward compatibility only. Do not use for payment activation logic.
export function setUserPlan(plan: Plan) {
  setCachedUserPlan(plan);
}

export async function refreshUserPlanFromCloud(userId?: string): Promise<Plan> {
  const supabase = getSupabase();
  const cached = getUserPlan();

  if (!supabase || !userId) return cached;

  try {
    const { data: subscriptionRows, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('plan, status, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (!subscriptionError && subscriptionRows && subscriptionRows.length > 0) {
      const active = subscriptionRows[0] as { plan?: string; status?: string };
      const status = active.status || 'active';
      const resolvedPlan = status === 'cancelled' || status === 'expired' ? 'free' : normalizePlan(active.plan);
      setCachedUserPlan(resolvedPlan);
      return resolvedPlan;
    }
  } catch {}

  try {
    const { data: paymentRows, error: paymentError } = await supabase
      .from('payments')
      .select('plan, status, created_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1);

    if (!paymentError && paymentRows && paymentRows.length > 0) {
      const cloudPlan = normalizePlan(paymentRows[0].plan);
      setCachedUserPlan(cloudPlan);
      return cloudPlan;
    }
  } catch {}

  setCachedUserPlan('free');
  return 'free';
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
  return getUserPlan() !== 'free';
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
