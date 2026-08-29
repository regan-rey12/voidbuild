export type EffectiveSubscriptionStatus = 'free' | 'active' | 'grace_period' | 'expired' | 'cancelled';

export interface SubscriptionSnapshot {
  plan: 'free' | 'hustler' | 'business' | 'pro';
  status: EffectiveSubscriptionStatus;
  startedAt?: string | null;
  expiresAt?: string | null;
  graceEndsAt?: string | null;
  isActive: boolean;
}

export const SUBSCRIPTION_GRACE_DAYS = 7;

export function addOneYear(from: Date): Date {
  const next = new Date(from);
  next.setFullYear(next.getFullYear() + 1);
  return next;
}

export function addDays(from: Date, days: number): Date {
  const next = new Date(from);
  next.setDate(next.getDate() + days);
  return next;
}

export function toIso(input: Date | string | null | undefined): string | null {
  if (!input) return null;
  if (input instanceof Date) return input.toISOString();
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function getEffectiveSubscriptionStatus(params: {
  rawStatus?: string | null;
  expiresAt?: string | null;
  now?: Date;
}): EffectiveSubscriptionStatus {
  const rawStatus = String(params.rawStatus || '').toLowerCase();
  const now = params.now || new Date();

  if (rawStatus === 'cancelled') return 'cancelled';

  if (!params.expiresAt) {
    return rawStatus === 'active' ? 'active' : 'free';
  }

  const expiry = new Date(params.expiresAt);
  if (Number.isNaN(expiry.getTime())) {
    return rawStatus === 'active' ? 'active' : 'free';
  }

  if (now <= expiry) return 'active';

  const graceEnds = addDays(expiry, SUBSCRIPTION_GRACE_DAYS);
  if (now <= graceEnds) return 'grace_period';

  return 'expired';
}

export function buildSubscriptionSnapshot(params: {
  plan?: 'free' | 'hustler' | 'business' | 'pro' | null;
  rawStatus?: string | null;
  startedAt?: string | null;
  expiresAt?: string | null;
  now?: Date;
}): SubscriptionSnapshot {
  const plan = params.plan || 'free';
  const status = getEffectiveSubscriptionStatus({
    rawStatus: params.rawStatus,
    expiresAt: params.expiresAt,
    now: params.now,
  });
  const expiryIso = toIso(params.expiresAt);
  const graceEndsAt = expiryIso ? toIso(addDays(new Date(expiryIso), SUBSCRIPTION_GRACE_DAYS)) : null;

  return {
    plan: status === 'expired' || status === 'cancelled' ? 'free' : plan,
    status,
    startedAt: toIso(params.startedAt),
    expiresAt: expiryIso,
    graceEndsAt,
    isActive: status === 'active' || status === 'grace_period',
  };
}
