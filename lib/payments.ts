// VoidBuild Payments - Finished for Uganda SMEs - Manual MoMo + Pesapal (Flutterwave blocked)
// Plans: Free / Starter / Business / Pro - Business renamed from Biashara

export type Plan = 'free' | 'hustler' | 'business' | 'pro';
// Keep hustler as internal key for backward compatibility, but display as Starter

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

export interface PaymentResult {
  success: boolean;
  simulated?: boolean;
  message?: string;
  data?: any;
  closed?: boolean;
  error?: string;
  method?: 'momo_manual' | 'pesapal' | 'demo';
  transactionId?: string;
}

export const MOMO_PAY_DETAILS = {
  mtnNumber: process.env.NEXT_PUBLIC_MOMO_MTN_NUMBER || '+256774919318',
  airtelNumber: process.env.NEXT_PUBLIC_MOMO_AIRTEL_NUMBER || '+256750123456',
  businessName: 'VoidBuild',
};

export function getUserPlanKey(): Plan {
  if (typeof window === 'undefined') return 'free';
  return (localStorage.getItem('voidbuild_plan') as Plan) || 'free';
}

export function getUserPlan(): Plan {
  return getUserPlanKey();
}

export function setUserPlan(plan: Plan, transactionId?: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('voidbuild_plan', plan);
  localStorage.setItem('voidbuild_plan_date', new Date().toISOString());
  if (transactionId) {
    localStorage.setItem('voidbuild_last_tx', transactionId);
    // Save to pending list for admin verification
    try {
      const existing = JSON.parse(localStorage.getItem('voidbuild_pending_payments') || '[]');
      existing.unshift({ plan, transactionId, date: new Date().toISOString(), amount: PLANS[plan].priceUGX });
      localStorage.setItem('voidbuild_pending_payments', JSON.stringify(existing.slice(0, 20)));
    } catch {}
  }
}

export function canCreateProject(): boolean {
  const plan = getUserPlan();
  const limit = PLANS[plan].limit;
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

// Manual MoMo - User sends money to YOUR MTN number, enters TxID
export async function submitManualMoMoPayment(plan: Plan, transactionId: string, phone: string): Promise<PaymentResult> {
  if (!transactionId || transactionId.trim().length < 5) {
    return { success: false, error: 'Enter valid Transaction ID from MoMo SMS (e.g. 1234567890)' };
  }
  if (!phone || phone.trim().length < 9) {
    return { success: false, error: 'Enter your phone number used to send MoMo' };
  }

  const pending = {
    plan,
    transactionId: transactionId.trim(),
    phone: phone.trim(),
    amount: PLANS[plan].price,
    amountUGX: PLANS[plan].priceUGX,
    date: new Date().toISOString(),
    status: 'pending_verification',
  };

  try {
    const { getSupabase } = await import('./supabase');
    const supabase = getSupabase();
    if (supabase) {
      // Save to payments table for you to verify manually via Supabase dashboard
      await supabase.from('payments').insert({
        plan,
        transaction_id: transactionId.trim(),
        phone: phone.trim(),
        amount: PLANS[plan].price,
        status: 'pending',
      }).then(() => {}, () => {});
    }
  } catch {}

  // For MVP: Auto-unlock immediately so user can continue, you verify SMS later
  await new Promise(r => setTimeout(r, 1000));
  setUserPlan(plan, transactionId);

  return {
    success: true,
    method: 'momo_manual',
    transactionId,
    message: `Payment received! TxID ${transactionId} for UGX ${PLANS[plan].priceUGX}. Your ${PLANS[plan].name} plan is now active. We will verify your MoMo SMS.`,
  };
}
