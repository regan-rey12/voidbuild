import 'server-only';

import { getSupabaseAdmin } from './supabase-admin';
import { getAuthenticatedUserFromRequest } from './auth-server';
import { buildSubscriptionSnapshot } from './subscriptions';
import type { DomainStatus, DomainVerificationChallenge } from './domain-provider';

export interface DomainRecord {
  custom_domain?: string | null;
  custom_domain_status?: DomainStatus | null;
  custom_domain_verification?: DomainVerificationChallenge[] | null;
  custom_domain_error?: string | null;
  custom_domain_connected_at?: string | null;
  custom_domain_verified_at?: string | null;
  custom_domain_removed_at?: string | null;
}

export async function getPaidDomainPlan(admin: any, userId: string): Promise<'business' | 'pro' | null> {
  const { data: subscription } = await admin
    .from('subscriptions')
    .select('plan, status, started_at, expires_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (subscription?.plan === 'business' || subscription?.plan === 'pro') {
    const snapshot = buildSubscriptionSnapshot({
      plan: subscription.plan,
      rawStatus: subscription.status,
      startedAt: subscription.started_at,
      expiresAt: subscription.expires_at,
    });
    if (snapshot.isActive) return subscription.plan;
  }

  const { data: payment } = await admin
    .from('payments')
    .select('plan, status, created_at')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (payment?.plan === 'business' || payment?.plan === 'pro') return payment.plan;
  return null;
}

export async function authorizeDomainRequest(req: Request, options: { requirePlan?: boolean } = {}) {
  const user = await getAuthenticatedUserFromRequest(req);
  if (!user) return { response: Response.json({ error: 'Please sign in again.' }, { status: 401 }) };

  const admin = getSupabaseAdmin();
  if (!admin) return { response: Response.json({ error: 'Domain service is not configured on the server.' }, { status: 503 }) };

  const plan = await getPaidDomainPlan(admin, user.id);
  if (options.requirePlan !== false && !plan) {
    return { response: Response.json({ error: 'Custom domains are available on Business and Pro plans.' }, { status: 403 }) };
  }

  return { user, admin, plan };
}

export async function getOwnedProject(admin: any, projectId: string, userId: string) {
  const { data, error } = await admin
    .from('projects')
    .select('id, user_id, custom_domain, custom_domain_status, custom_domain_verification, custom_domain_error, custom_domain_connected_at, custom_domain_verified_at, custom_domain_removed_at')
    .eq('id', projectId)
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    // This fallback keeps the first deployment compatible until the migration
    // is applied, while the migration remains the production source of truth.
    const fallback = await admin
      .from('projects')
      .select('id, user_id, custom_domain')
      .eq('id', projectId)
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();
    if (fallback.error) throw new Error(fallback.error.message);
    return fallback.data as (DomainRecord & { id: string; user_id: string }) | null;
  }

  return data as (DomainRecord & { id: string; user_id: string }) | null;
}

export function domainRecordPayload(params: {
  domain?: string | null;
  status: DomainStatus;
  verification?: DomainVerificationChallenge[];
  error?: string | null;
  connectedAt?: string | null;
  verifiedAt?: string | null;
  removedAt?: string | null;
}) {
  return {
    custom_domain: params.domain ?? null,
    custom_domain_status: params.status,
    custom_domain_verification: params.verification || [],
    custom_domain_error: params.error || null,
    custom_domain_connected_at: params.connectedAt || null,
    custom_domain_verified_at: params.verifiedAt || null,
    custom_domain_removed_at: params.removedAt || null,
  };
}

export async function updateProjectDomain(admin: any, projectId: string, userId: string, payload: Record<string, unknown>) {
  const result = await admin
    .from('projects')
    .update(payload)
    .eq('id', projectId)
    .eq('user_id', userId);

  if (!result.error) return;

  // Compatibility fallback for an instance that has the original
  // custom_domain column but has not applied the Domain Center migration yet.
  if (Object.prototype.hasOwnProperty.call(payload, 'custom_domain')) {
    const fallback = await admin
      .from('projects')
      .update({ custom_domain: payload.custom_domain })
      .eq('id', projectId)
      .eq('user_id', userId);
    if (!fallback.error) return;
  }

  throw new Error(result.error.message);
}

export function providerFailure(error: any) {
  if (error?.message === 'provider_unconfigured') {
    return { status: 503, error: 'Custom-domain hosting is not configured yet.' };
  }
  const status = Number(error?.status);
  if (status === 404) return { status: 404, error: 'The hosting provider could not find this domain connection.' };
  if (status === 409) return { status: 409, error: 'That domain is already connected to another hosting project.' };
  if (status === 403) return { status: 403, error: 'The hosting provider rejected this domain connection.' };
  return { status: 502, error: 'The hosting provider could not process this domain right now.' };
}

export function projectDomainResponse(project: DomainRecord | null) {
  return {
    domain: project?.custom_domain || null,
    status: project?.custom_domain_status || (project?.custom_domain ? 'pending_dns' : 'none'),
    verification: project?.custom_domain_verification || [],
    error: project?.custom_domain_error || null,
    connectedAt: project?.custom_domain_connected_at || null,
    verifiedAt: project?.custom_domain_verified_at || null,
    removedAt: project?.custom_domain_removed_at || null,
  };
}
