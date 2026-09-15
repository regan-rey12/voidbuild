import 'server-only';

import { normalizeCustomDomain } from './domain-provider';

export const SUPPORTED_DOMAIN_ENDINGS = ['.ug', '.co.ug', '.com'] as const;
export type SupportedDomainEnding = (typeof SUPPORTED_DOMAIN_ENDINGS)[number];
export type DomainCurrency = 'UGX' | 'USD';

export interface DomainPrice {
  currency: DomainCurrency;
  firstYear: number | null;
  renewal: number | null;
}

export interface DomainSearchResult {
  domain: string;
  ending: SupportedDomainEnding;
  available: boolean | null;
  firstYear: number | null;
  renewal: number | null;
  currency: DomainCurrency;
  registrar: string;
  checkedAt: string;
  configurationRequired?: boolean;
}

export interface RegistrantContact {
  firstName: string;
  lastName: string;
  organization?: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  postalCode?: string;
}

export interface RegisteredDomain {
  domain: string;
  status: 'registered' | 'pending' | 'failed';
  expiryDate?: string | null;
  registrationDate?: string | null;
  transferCode?: string | null;
  registrarOrderId?: string | null;
  ownership?: Record<string, unknown> | RegistrantContact | null;
  error?: string | null;
  raw?: unknown;
}

interface RegistrarQuote {
  available: boolean;
  price: DomainPrice;
}

export interface DomainRegistrar {
  name: string;
  canHandle(domain: string): boolean;
  isConfigured(): boolean;
  search(domains: string[]): Promise<Record<string, RegistrarQuote>>;
  getPrice(domain: string): Promise<DomainPrice>;
  register(domain: string, contact: RegistrantContact, years: number): Promise<RegisteredDomain>;
  renew(domain: string, years: number): Promise<RegisteredDomain>;
  refresh?(domain: string, registrarOrderId: string, action: 'registration' | 'renewal'): Promise<RegisteredDomain>;
}

function envNumber(name: string): number | null {
  const value = String(process.env[name] || '').trim();
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function getDomainEnding(domain: string): SupportedDomainEnding | null {
  const clean = domain.toLowerCase().trim();
  return [...SUPPORTED_DOMAIN_ENDINGS]
    .sort((a, b) => b.length - a.length)
    .find((ending) => clean.endsWith(ending) && clean.length > ending.length) || null;
}

export function getDomainPrice(domain: string): DomainPrice {
  const ending = getDomainEnding(domain);
  if (!ending) return { currency: 'UGX', firstYear: null, renewal: null };
  if (ending === '.com') return { currency: 'USD', firstYear: null, renewal: null };

  const key = ending === '.co.ug' ? 'CO_UG' : 'UG';
  return {
    currency: 'UGX',
    firstYear: envNumber(`DOMAIN_PRICE_${key}_FIRST_YEAR`),
    renewal: envNumber(`DOMAIN_PRICE_${key}_RENEWAL`),
  };
}

export function normalizeDomainSearch(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
}

export function buildSearchCandidates(query: string): string[] {
  const normalized = normalizeDomainSearch(query);
  if (!normalized) return [];
  if (normalized.endsWith('.com')) return [normalized];
  // New-domain purchases start with .com. Existing domains can still use the
  // separate connect-existing flow without going through this registrar path.
  if (normalized.includes('.')) return [];
  return [`${normalized}.com`];
}

function registryApiConfig() {
  const baseUrl = String(process.env.DOMAIN_REGISTRY_API_URL || 'https://new.registry.co.ug/api/v2').trim().replace(/\/$/, '');
  const token = String(process.env.DOMAIN_REGISTRY_API_KEY || '').trim();
  const sandbox = String(process.env.DOMAIN_REGISTRY_SANDBOX || '').toLowerCase() === 'true';
  return {
    baseUrl: sandbox ? 'https://sandbox.registry.co.ug/api/v2' : baseUrl,
    token,
  };
}

async function registryRequest(path: string, init: RequestInit = {}) {
  const { baseUrl, token } = registryApiConfig();
  if (!token) throw new Error('registrar_unconfigured');
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(String(body?.message || body?.error || `Registrar returned HTTP ${response.status}`));
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }
  return body;
}

function contactsPayload(contact: RegistrantContact) {
  const shared = {
    firstname: contact.firstName,
    lastname: contact.lastName,
    organization: contact.organization || '',
    country: contact.country || 'UG',
    city: contact.city,
    street_address: contact.address,
    phone: contact.phone,
    email: contact.email,
    postal_code: contact.postalCode || '',
    fax: '',
  };
  return { registrant: shared, admin: shared, billing: shared, tech: shared };
}

function registryRegistrar(): DomainRegistrar {
  return {
    name: 'Uganda Registry',
    canHandle: (domain) => domain.endsWith('.ug') || domain.endsWith('.co.ug'),
    isConfigured: () => Boolean(registryApiConfig().token),
    async search(domains) {
      if (!registryApiConfig().token) throw new Error('registrar_unconfigured');
      const url = new URL(`${registryApiConfig().baseUrl}/domains/check-availability`);
      domains.forEach((domain, index) => url.searchParams.set(`domains[${index}][name]`, domain));
      const response = await registryRequest(`${url.pathname}${url.search}`, { method: 'GET' });
      const rows = Array.isArray(response?.data) ? response.data : [];
      return Object.fromEntries(rows.map((row: any) => {
        const domain = String(row.domain || row.name).toLowerCase();
        return [domain, { available: Number(row.available) === 1 || row.available === true, price: getDomainPrice(domain) }];
      }));
    },
    async getPrice(domain) {
      return getDomainPrice(domain);
    },
    async register(domain, contact, years) {
      const response = await registryRequest('/domains/register', {
        method: 'POST',
        body: JSON.stringify({ domain_name: domain, period: years, contacts: contactsPayload(contact) }),
      });
      const data = response?.data?.domain || response?.data || {};
      return {
        domain,
        status: 'registered',
        expiryDate: data.expiry_date || data.expiryDate || null,
        registrationDate: data.registration_date || new Date().toISOString(),
        transferCode: data.transfer_code || data.epp_code || null,
        ownership: data.contacts || contactsPayload(contact),
        raw: response,
      };
    },
    async renew(domain, years) {
      const response = await registryRequest('/domains/renew', {
        method: 'POST',
        body: JSON.stringify({ domain_name: domain, period: years }),
      });
      const data = response?.data?.domain || response?.data || {};
      return {
        domain,
        status: 'registered',
        expiryDate: data.expiry_date || data.expiryDate || null,
        registrationDate: data.registration_date || null,
        transferCode: data.transfer_code || data.epp_code || null,
        ownership: data.contacts || null,
        raw: response,
      };
    },
  };
}

function vercelConfig() {
  return {
    token: String(process.env.VERCEL_TOKEN || '').trim(),
    teamId: String(process.env.VERCEL_TEAM_ID || '').trim(),
    // Vercel's registrar price and expectedPrice values are handled as USD.
    currency: 'USD' as const,
  };
}

function vercelUrl(path: string) {
  const { teamId } = vercelConfig();
  const url = new URL(`https://api.vercel.com/v1/registrar${path}`);
  if (teamId) url.searchParams.set('teamId', teamId);
  return url.toString();
}

async function vercelRequest(path: string, init: RequestInit = {}) {
  const { token } = vercelConfig();
  if (!token) throw new Error('registrar_unconfigured');
  const response = await fetch(vercelUrl(path), {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(String(body?.message || body?.error || `Vercel registrar returned HTTP ${response.status}`));
    (error as Error & { status?: number; code?: string }).status = response.status;
    (error as Error & { status?: number; code?: string }).code = body?.code;
    throw error;
  }
  return body;
}

function numericPrice(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && Number.isFinite(Number(value))) return Number(value);
  if (value && typeof value === 'object') {
    const row = value as Record<string, unknown>;
    for (const key of ['amount', 'value', 'price', 'usd']) {
      const parsed = numericPrice(row[key]);
      if (parsed !== null) return parsed;
    }
  }
  return null;
}

function vercelContact(contact: RegistrantContact) {
  return {
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phone: contact.phone,
    address1: contact.address,
    city: contact.city,
    state: contact.city,
    zip: contact.postalCode || '',
    country: contact.country,
    companyName: contact.organization || '',
  };
}

function orderRow(response: any) {
  return Array.isArray(response?.domains) ? response.domains[0] || {} : {};
}

function orderStatus(response: any): 'registered' | 'pending' | 'failed' {
  const value = String(orderRow(response)?.status || response?.status || '').toLowerCase();
  if (['complete', 'completed', 'success', 'successful', 'registered', 'active'].includes(value)) return 'registered';
  if (['failed', 'error', 'cancelled', 'canceled'].includes(value)) return 'failed';
  return 'pending';
}

async function waitForVercelOrder(orderId: string, domain: string) {
  let latest: any = { orderId, status: 'pending' };
  for (let attempt = 0; attempt < 15; attempt++) {
    latest = await vercelRequest(`/orders/${encodeURIComponent(orderId)}`);
    const status = orderStatus(latest);
    if (status !== 'pending') return { latest, status };
    if (attempt < 14) await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return { latest, status: 'pending' as const, domain };
}

async function vercelTransferCode(domain: string) {
  try {
    const response = await vercelRequest(`/domains/${encodeURIComponent(domain)}/auth-code`);
    return response?.authCode || response?.auth_code || response?.code || null;
  } catch {
    return null;
  }
}

function vercelRegistrar(): DomainRegistrar {
  return {
    name: 'Vercel Domains Registrar',
    canHandle: (domain) => domain.endsWith('.com'),
    isConfigured: () => Boolean(vercelConfig().token),
    async search(domains) {
      const entries = await Promise.all(domains.map(async (domain) => {
        const availability = await vercelRequest(`/domains/${encodeURIComponent(domain)}/availability`);
        const available = availability?.available === true || availability?.available === 'true';
        const price = available ? await this.getPrice(domain) : getDomainPrice(domain);
        return [domain, { available, price }] as const;
      }));
      return Object.fromEntries(entries);
    },
    async getPrice(domain) {
      const response = await vercelRequest(`/domains/${encodeURIComponent(domain)}/price?years=1`);
      return {
        currency: vercelConfig().currency,
        firstYear: numericPrice(response?.purchasePrice),
        renewal: numericPrice(response?.renewalPrice),
      };
    },
    async register(domain, contact, years) {
      const price = await this.getPrice(domain);
      if (price.firstYear === null) throw new Error('Vercel did not return a purchase price for this domain.');
      const response = await vercelRequest(`/domains/${encodeURIComponent(domain)}/buy`, {
        method: 'POST',
        body: JSON.stringify({
          autoRenew: false,
          years,
          expectedPrice: price.firstYear,
          contactInformation: vercelContact(contact),
        }),
      });
      const registrarOrderId = response?.orderId || response?.order_id || null;
      if (!registrarOrderId) throw new Error('Vercel did not return a domain order ID.');
      const completed = await waitForVercelOrder(registrarOrderId, domain);
      const row = orderRow(completed.latest);
      const status = completed.status;
      return {
        domain,
        status,
        registrarOrderId,
        registrationDate: status === 'registered' ? new Date().toISOString() : null,
        expiryDate: row.expiryDate || row.expiry_date || null,
        transferCode: status === 'registered' ? await vercelTransferCode(domain) : null,
        ownership: contact,
        error: status === 'failed' ? row.error || completed.latest?.error || 'Vercel domain registration failed.' : null,
        raw: completed.latest,
      };
    },
    async renew(domain, years) {
      const price = await this.getPrice(domain);
      if (price.renewal === null) throw new Error('Vercel did not return a renewal price for this domain.');
      const response = await vercelRequest(`/domains/${encodeURIComponent(domain)}/renew`, {
        method: 'POST',
        body: JSON.stringify({ years, expectedPrice: price.renewal }),
      });
      const registrarOrderId = response?.orderId || response?.order_id || null;
      if (!registrarOrderId) throw new Error('Vercel did not return a renewal order ID.');
      const completed = await waitForVercelOrder(registrarOrderId, domain);
      const row = orderRow(completed.latest);
      return {
        domain,
        status: completed.status,
        registrarOrderId,
        expiryDate: row.expiryDate || row.expiry_date || null,
        transferCode: completed.status === 'registered' ? await vercelTransferCode(domain) : null,
        error: completed.status === 'failed' ? row.error || completed.latest?.error || 'Vercel domain renewal failed.' : null,
        raw: completed.latest,
      };
    },
    async refresh(domain, registrarOrderId, action) {
      const response = await vercelRequest(`/orders/${encodeURIComponent(registrarOrderId)}`);
      const status = orderStatus(response);
      const row = orderRow(response);
      return {
        domain,
        status,
        registrarOrderId,
        expiryDate: row.expiryDate || row.expiry_date || null,
        transferCode: status === 'registered' ? await vercelTransferCode(domain) : null,
        error: status === 'failed' ? row.error || response?.error || `Vercel ${action} failed.` : null,
        raw: response,
      };
    },
  };
}

export function getRegistrarForDomain(domain: string): DomainRegistrar | null {
  const ending = getDomainEnding(domain);
  if (ending === '.ug' || ending === '.co.ug') return registryRegistrar();
  if (ending === '.com') return vercelRegistrar();
  return null;
}

export async function refreshRegistrarOrder(domain: string, registrarOrderId: string, action: 'registration' | 'renewal') {
  const normalized = normalizeCustomDomain(domain);
  if (normalized.error || !normalized.domain) return null;
  const registrar = getRegistrarForDomain(normalized.domain);
  if (!registrar?.refresh || !registrar.isConfigured()) return null;
  return registrar.refresh(normalized.domain, registrarOrderId, action);
}

export async function getLiveDomainPrice(domain: string): Promise<DomainPrice> {
  const normalized = normalizeCustomDomain(domain);
  if (normalized.error || !normalized.domain) return { currency: 'UGX', firstYear: null, renewal: null };
  const registrar = getRegistrarForDomain(normalized.domain);
  if (!registrar || !registrar.isConfigured()) return getDomainPrice(normalized.domain);
  return registrar.getPrice(normalized.domain);
}

export async function searchDomains(domains: string[]): Promise<DomainSearchResult[]> {
  const checkedAt = new Date().toISOString();
  const grouped = new Map<string, string[]>();
  for (const domain of domains) {
    const registrar = getRegistrarForDomain(domain);
    if (!registrar) continue;
    const list = grouped.get(registrar.name) || [];
    list.push(domain);
    grouped.set(registrar.name, list);
  }

  const quotes = new Map<string, RegistrarQuote>();
  const configurationRequired = new Set<string>();
  for (const domain of domains) {
    const registrar = getRegistrarForDomain(domain);
    if (!registrar || !registrar.isConfigured()) configurationRequired.add(domain);
  }

  for (const [, registrarDomains] of grouped) {
    const registrar = getRegistrarForDomain(registrarDomains[0]);
    if (!registrar || !registrar.isConfigured()) continue;
    try {
      const values = await registrar.search(registrarDomains);
      Object.entries(values).forEach(([domain, quote]) => quotes.set(domain, quote));
    } catch {
      registrarDomains.forEach((domain) => configurationRequired.add(domain));
    }
  }

  return domains.map((domain) => {
    const quote = quotes.get(domain);
    const fallback = getDomainPrice(domain);
    const price = quote?.price || fallback;
    const registrar = getRegistrarForDomain(domain);
    return {
      domain,
      ending: getDomainEnding(domain) as SupportedDomainEnding,
      available: quote ? quote.available : null,
      firstYear: price.firstYear,
      renewal: price.renewal,
      currency: price.currency,
      registrar: registrar?.name || 'Not configured',
      checkedAt,
      configurationRequired: quote?.available !== false && (configurationRequired.has(domain) || price.firstYear === null || price.renewal === null),
    };
  });
}

export function validateRegistrant(value: unknown): { contact?: RegistrantContact; error?: string } {
  const input = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
  const firstName = String(input.firstName || '').trim();
  const lastName = String(input.lastName || '').trim();
  const email = String(input.email || '').trim().toLowerCase();
  const phone = String(input.phone || '').trim();
  const country = String(input.country || 'UG').trim().toUpperCase();
  const city = String(input.city || '').trim();
  const address = String(input.address || '').trim();
  const organization = String(input.organization || '').trim();
  const postalCode = String(input.postalCode || '').trim();

  if (!firstName || !lastName || !city || !address) return { error: 'Enter the registrant name, city, and address.' };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: 'Enter a valid registrant email address.' };
  if (!/^[+\d][\d ()-]{6,24}$/.test(phone)) return { error: 'Enter a valid registrant phone number.' };
  if (!/^[A-Z]{2}$/.test(country)) return { error: 'Use a two-letter country code, such as UG.' };
  if (firstName.length > 80 || lastName.length > 80 || address.length > 180 || city.length > 80) return { error: 'Registrant details are too long.' };

  return { contact: { firstName, lastName, organization, email, phone, country, city, address, postalCode } };
}

export async function registerDomain(domain: string, contact: RegistrantContact, years = 1) {
  const normalized = normalizeCustomDomain(domain);
  if (normalized.error || !normalized.domain) throw new Error(normalized.error || 'Invalid domain.');
  const registrar = getRegistrarForDomain(normalized.domain);
  if (!registrar || !registrar.isConfigured()) throw new Error('The selected registrar is not configured yet.');
  return registrar.register(normalized.domain, contact, years);
}

export async function renewDomain(domain: string, years = 1) {
  const normalized = normalizeCustomDomain(domain);
  if (normalized.error || !normalized.domain) throw new Error(normalized.error || 'Invalid domain.');
  const registrar = getRegistrarForDomain(normalized.domain);
  if (!registrar || !registrar.isConfigured()) throw new Error('The selected registrar is not configured yet.');
  return registrar.renew(normalized.domain, years);
}
