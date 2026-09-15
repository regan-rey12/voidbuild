import 'server-only';

export type DomainStatus =
  | 'none'
  | 'pending_dns'
  | 'verifying'
  | 'active'
  | 'error'
  | 'removed'
  | 'provider_unconfigured';

export interface DomainVerificationChallenge {
  type?: string;
  domain?: string;
  value?: string;
  reason?: string;
}

export interface DomainProviderResult {
  domain: string;
  verified: boolean;
  verification?: DomainVerificationChallenge[];
  error?: string;
}

const VERCEL_API = 'https://api.vercel.com';

function getVercelConfig() {
  const token = String(process.env.VERCEL_TOKEN || '').trim();
  const projectId = String(process.env.VERCEL_PROJECT_ID || '').trim();
  const teamId = String(process.env.VERCEL_TEAM_ID || '').trim();
  return { token, projectId, teamId };
}

function providerUrl(pathname: string, teamId: string) {
  const url = new URL(`${VERCEL_API}${pathname}`);
  if (teamId) url.searchParams.set('teamId', teamId);
  return url.toString();
}

async function vercelRequest(pathname: string, init: RequestInit = {}): Promise<any> {
  const { token, teamId } = getVercelConfig();
  if (!token) throw new Error('provider_unconfigured');

  const response = await fetch(providerUrl(pathname, teamId), {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof body?.error?.message === 'string'
      ? body.error.message
      : `Vercel returned HTTP ${response.status}`;
    const error = new Error(message);
    (error as Error & { status?: number; code?: string }).status = response.status;
    (error as Error & { status?: number; code?: string }).code = body?.error?.code;
    throw error;
  }
  return body;
}

function mapDomainResponse(data: any, fallbackDomain: string): DomainProviderResult {
  return {
    domain: String(data?.name || fallbackDomain),
    verified: data?.verified === true,
    verification: Array.isArray(data?.verification) ? data.verification : [],
  };
}

export function isDomainProviderConfigured() {
  const { token, projectId } = getVercelConfig();
  return Boolean(token && projectId);
}

export async function addDomainToHosting(domain: string): Promise<DomainProviderResult> {
  const { projectId } = getVercelConfig();
  if (!projectId) throw new Error('provider_unconfigured');

  try {
    const data = await vercelRequest(`/v10/projects/${encodeURIComponent(projectId)}/domains`, {
      method: 'POST',
      body: JSON.stringify({ name: domain }),
    });
    return mapDomainResponse(data, domain);
  } catch (error: any) {
    // A repeated connection attempt is idempotent when the domain is already
    // attached to this same Vercel project.
    if (error?.status === 400 || error?.status === 409) {
      try {
        return await getDomainFromHosting(domain);
      } catch {
        throw error;
      }
    }
    throw error;
  }
}

export async function getDomainFromHosting(domain: string): Promise<DomainProviderResult> {
  const { projectId } = getVercelConfig();
  if (!projectId) throw new Error('provider_unconfigured');

  const data = await vercelRequest(
    `/v9/projects/${encodeURIComponent(projectId)}/domains/${encodeURIComponent(domain)}`,
    { method: 'GET' },
  );
  return mapDomainResponse(data, domain);
}

export async function verifyDomainWithHosting(domain: string): Promise<DomainProviderResult> {
  const { projectId } = getVercelConfig();
  if (!projectId) throw new Error('provider_unconfigured');

  const data = await vercelRequest(
    `/v9/projects/${encodeURIComponent(projectId)}/domains/${encodeURIComponent(domain)}/verify`,
    { method: 'POST', body: JSON.stringify({}) },
  );
  return mapDomainResponse(data, domain);
}

export async function removeDomainFromHosting(domain: string): Promise<void> {
  const { projectId } = getVercelConfig();
  if (!projectId) throw new Error('provider_unconfigured');

  try {
    await vercelRequest(
      `/v9/projects/${encodeURIComponent(projectId)}/domains/${encodeURIComponent(domain)}`,
      { method: 'DELETE' },
    );
  } catch (error: any) {
    // Disconnect is intentionally idempotent. If the provider has already
    // removed the domain, clear VoidBuild's saved connection as well.
    if (Number(error?.status) === 404) return;
    throw error;
  }
}

function looksLikeIpv4(value: string) {
  const parts = value.split('.');
  return parts.length === 4 && parts.every((part) => /^\d+$/.test(part) && Number(part) >= 0 && Number(part) <= 255);
}

export function normalizeCustomDomain(value: unknown): { domain?: string; error?: string } {
  if (typeof value !== 'string') return { error: 'Enter a domain name.' };

  let domain = value.trim().toLowerCase();
  domain = domain.replace(/^https?:\/\//, '').replace(/\/+$/, '');

  if (!domain || /\s/.test(domain) || /[/?#:@]/.test(domain)) {
    return { error: 'Enter only the domain name, such as www.example.com.' };
  }
  if (!/^[\x00-\x7F]+$/.test(domain)) return { error: 'Use a domain name with standard letters and numbers.' };
  if (domain.length < 4 || domain.length > 253) return { error: 'Enter a valid domain name.' };
  if (
    domain === 'voidbuild.com' ||
    domain.endsWith('.voidbuild.com') ||
    domain === 'localhost' ||
    domain.endsWith('.localhost') ||
    domain === '0.0.0.0' ||
    domain === '127.0.0.1' ||
    domain === '::1' ||
    looksLikeIpv4(domain)
  ) {
    return { error: 'Enter a public domain outside voidbuild.com.' };
  }

  const labels = domain.split('.');
  if (
    labels.length < 2 ||
    labels.some(
      (label) =>
        !label ||
        label.length > 63 ||
        label.startsWith('-') ||
        label.endsWith('-') ||
        !/^[a-z0-9-]+$/.test(label),
    )
  ) {
    return { error: 'Use letters, numbers, hyphens, and a valid domain ending.' };
  }

  const tld = labels[labels.length - 1];
  if (tld.length < 2 || /^\d+$/.test(tld)) return { error: 'Enter a valid public domain ending.' };

  return { domain };
}

export function domainStatusFromProvider(result: DomainProviderResult): DomainStatus {
  return result.verified ? 'active' : 'pending_dns';
}
