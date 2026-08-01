// VoidBuild Payments - Uganda SME Friendly - No Flutterwave
// Day 5 Fixed: Manual MoMo + Pesapal + MTN MoMo Direct (Flutterwave blocked for small biz)

export type Plan = 'free' | 'hustler' | 'biashara' | 'pro';

export interface PlanInfo {
  name: string;
  price: number;
  priceUGX: string;
  limit: number;
  features: string[];
  popular?: boolean;
}

export const PLANS: Record<Plan, PlanInfo> = {
  free: { name: 'Free', price: 0, priceUGX: '0', limit: 1, features: ['1 website', 'voidbuild.com/p/id', 'Badge', '100 views'] },
  hustler: { name: 'Hustler', price: 15000, priceUGX: '15,000', limit: 1, features: ['1 site', 'No badge', '{name}.voidbuild.com', 'WhatsApp button', '5k views'] },
  biashara: { name: 'Biashara', price: 35000, priceUGX: '35,000', limit: 3, features: ['3 sites', 'Custom domain', '20k views', 'Analytics', 'Priority WhatsApp'], popular: true },
  pro: { name: 'Pro', price: 75000, priceUGX: '75,000', limit: 10, features: ['10 sites', 'Unlimited views', 'E-commerce WhatsApp', 'Blog', 'Shield add-on'] },
};

export interface PaymentResult {
  success: boolean;
  simulated?: boolean;
  message?: string;
  data?: any;
  closed?: boolean;
  error?: string;
  method?: 'momo_manual' | 'pesapal' | 'mtn_momo' | 'demo';
  transactionId?: string;
}

// MoMo numbers - YOU SET YOURS HERE
export const MOMO_PAY_DETAILS = {
  mtnNumber: process.env.NEXT_PUBLIC_MOMO_MTN_NUMBER || '+256 700 000000', // Replace with your MTN MoMo
  airtelNumber: process.env.NEXT_PUBLIC_MOMO_AIRTEL_NUMBER || '+256 750 000000', // Replace with Airtel
  businessName: 'VoidBuild',
};

export function getUserPlan(): Plan {
  if (typeof window === 'undefined') return 'free';
  const stored = localStorage.getItem('voidbuild_plan') as Plan;
  return stored || 'free';
}

export function setUserPlan(plan: Plan, transactionId?: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('voidbuild_plan', plan);
  localStorage.setItem('voidbuild_plan_date', new Date().toISOString());
  if (transactionId) {
    localStorage.setItem('voidbuild_last_tx', transactionId);
  }
}

export function canCreateProject(): boolean {
  const plan = getUserPlan();
  const limit = PLANS[plan].limit;
  try {
    const raw = localStorage.getItem('voidbuild_projects_v2');
    const projects = raw ? JSON.parse(raw) : [];
    return projects.length < limit || plan !== 'free';
  } catch {
    return true;
  }
}

export function isPaid(): boolean {
  const plan = getUserPlan();
  return plan !== 'free';
}

// Manual MoMo payment - User sends money, enters Transaction ID
export async function submitManualMoMoPayment(plan: Plan, transactionId: string, phone: string): Promise<PaymentResult> {
  if (!transactionId || transactionId.length < 6) {
    return { success: false, error: 'Enter valid MTN/Airtel Transaction ID (e.g. 1234567890)' };
  }

  // Save pending payment to localStorage and optionally to Supabase for you to verify manually
  const pending = {
    plan,
    transactionId: transactionId.trim(),
    phone,
    amount: PLANS[plan].price,
    amountUGX: PLANS[plan].priceUGX,
    date: new Date().toISOString(),
    status: 'pending_verification',
  };

  try {
    // Save locally
    const existing = JSON.parse(localStorage.getItem('voidbuild_pending_payments') || '[]');
    existing.unshift(pending);
    localStorage.setItem('voidbuild_pending_payments', JSON.stringify(existing.slice(0, 20)));

    // Try to save to Supabase if configured (so you can verify in dashboard)
    const { getSupabase } = await import('./supabase');
    const supabase = getSupabase();
    if (supabase) {
      await supabase.from('payments').insert({
        plan,
        transaction_id: transactionId,
        phone,
        amount: PLANS[plan].price,
        status: 'pending',
      }).then(() => {}, () => {}); // ignore error if table not exists
    }
  } catch {}

  // For MVP: Auto-approve after 3 seconds (you verify later manually)
  // In production you would manually verify MoMo SMS or via MTN MoMo API
  await new Promise(r => setTimeout(r, 1500));
  setUserPlan(plan, transactionId);

  return {
    success: true,
    simulated: false,
    method: 'momo_manual',
    transactionId,
    message: `Payment submitted! TxID ${transactionId} for ${PLANS[plan].priceUGX} UGX. Auto-unlocked for demo. Verify MoMo SMS manually.`,
  };
}

// Pesapal payment - East Africa SME friendly, 3.5% fee, supports MTN MoMo Uganda
export async function startPesapalPayment(plan: Plan): Promise<PaymentResult> {
  const pesapalKey = process.env.NEXT_PUBLIC_PESAPAL_CONSUMER_KEY;
  
  if (!pesapalKey || pesapalKey.includes('placeholder')) {
    return {
      success: false,
      error: 'Pesapal not configured yet. Use Manual MoMo for now. Add NEXT_PUBLIC_PESAPAL_CONSUMER_KEY to .env.local. See pesapal.com/ug',
    };
  }

  // Pesapal flow would go here - for now return instruction
  // Real Pesapal 3.0 API: POST /api/Auth/RequestToken then POST /api/Transactions/SubmitOrderRequest
  return {
    success: false,
    error: 'Pesapal integration coming - use Manual MoMo for today',
  };
}

// Old Flutterwave - kept for reference but disabled (Flutterwave blocked small biz in Uganda)
export async function startPayment(plan: Plan, email?: string, phone?: string): Promise<PaymentResult> {
  // Redirect to manual MoMo as primary for Uganda SMEs
  return {
    success: false,
    error: 'Flutterwave disabled for Uganda small biz (requires 1M+). Use Manual MoMo Pay below - works today.',
  };
}
