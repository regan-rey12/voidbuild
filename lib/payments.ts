// VoidBuild Payments - yearly plan catalog + cached subscription lookup
import { getSupabase } from './supabase';
import { buildSubscriptionSnapshot, SubscriptionSnapshot } from './subscriptions';

export type Plan = 'free' | 'hustler' | 'business' | 'pro';

export interface PlanInfo {
  name: string;
  price: number;
  priceUGX: string;
  monthlyEquivalentUGX?: string;
  limit: number;
  billingPeriod: 'year';
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
    billingPeriod: 'year',
    features: ['1 website', 'Your link on voidbuild.com', 'WhatsApp booking', 'Community support'],
  },
  hustler: {
    name: 'Starter',
    price: 50000,
    priceUGX: '50,000',
    monthlyEquivalentUGX: '4,167',
    limit: 1,
    billingPeriod: 'year',
    features: ['1 website', 'Your custom subdomain', 'WhatsApp button', '5,000 monthly visits', 'Fast Africa edge loading'],
  },
  business: {
    name: 'Business',
    price: 100000,
    priceUGX: '100,000',
    monthlyEquivalentUGX: '8,333',
    limit: 3,
    billingPeriod: 'year',
    features: ['3 websites', 'Domain connection assistance', 'Visitor analytics', 'Priority WhatsApp support', 'Assisted rollout features'],
    popular: true,
  },
  pro: {
    name: 'Pro',
    price: 200000,
    priceUGX: '200,000',
    monthlyEquivalentUGX: '16,667',
    limit: 10,
    billingPeriod: 'year',
    features: ['10 websites', 'Unlimited visits', 'Online store catalog', 'Domain connection priority', 'VIP onboarding'],
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

export async function getSubscriptionSnapshotFromCloud(userId?: string): Promise<SubscriptionSnapshot> {
  const supabase = getSupabase();
  const cached = getUserPlan();

  if (!supabase || !userId) {
    return buildSubscriptionSnapshot({ plan: cached, rawStatus: cached === 'free' ? 'expired' : 'active' });
  }

  try {
    const { data: subscriptionRows, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('plan, status, started_at, expires_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (!subscriptionError && subscriptionRows && subscriptionRows.length > 0) {
      const row = subscriptionRows[0] as {
        plan?: string;
        status?: string;
        started_at?: string | null;
        expires_at?: string | null;
      };
      return buildSubscriptionSnapshot({
        plan: normalizePlan(row.plan),
        rawStatus: row.status,
        startedAt: row.started_at,
        expiresAt: row.expires_at,
      });
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
      const plan = normalizePlan(paymentRows[0].plan);
      return buildSubscriptionSnapshot({ plan, rawStatus: 'active' });
    }
  } catch {}

  return buildSubscriptionSnapshot({ plan: 'free', rawStatus: 'expired' });
}

export async function refreshUserPlanFromCloud(userId?: string): Promise<Plan> {
  const snapshot = await getSubscriptionSnapshotFromCloud(userId);
  setCachedUserPlan(snapshot.plan);
  return snapshot.plan;
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
