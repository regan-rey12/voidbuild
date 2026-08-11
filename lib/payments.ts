// VoidBuild Payments - Fixed limits - Free 1 site, then paywall
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
  free: { name: 'Free', price: 0, priceUGX: '0', limit: 1, features: ['1 website', 'Your link on voidbuild.com', 'Support'] },
  hustler: { name: 'Starter', price: 15000, priceUGX: '15,000', limit: 1, features: ['1 site', 'Your subdomain', 'WhatsApp button', '5k visits'] },
  business: { name: 'Business', price: 35000, priceUGX: '35,000', limit: 3, features: ['3 sites', 'Custom domain', 'Analytics', 'Priority support'], popular: true },
  pro: { name: 'Pro', price: 75000, priceUGX: '75,000', limit: 10, features: ['10 sites', 'Unlimited visits', 'Online store'] },
};

export const MOMO_PAY_DETAILS = {
  mtnNumber: '+256774919318',
  airtelNumber: '+256750123456',
  businessName: 'VoidBuild',
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

export function canCreateProject(): boolean {
  const plan = getUserPlan();
  const limit = PLANS[plan].limit;
  try {
    const raw = localStorage.getItem('voidbuild_projects_v2');
    const projects = raw ? JSON.parse(raw) : [];
    // Free and Starter: 1 site max, Business: 3, Pro: 10
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
  const limit = PLANS[plan].limit;
  try {
    const raw = localStorage.getItem('voidbuild_projects_v2');
    const projects = raw ? JSON.parse(raw) : [];
    return Math.max(0, limit - projects.length);
  } catch {
    return limit;
  }
}
