export const runtime = 'nodejs';

import { buildSearchCandidates, normalizeDomainSearch, searchDomains } from '@/lib/domain-registrar';
import { getDomainEnding } from '@/lib/domain-registrar';
import { authorizeDomainRequest } from '@/lib/domain-service';
import { normalizeCustomDomain } from '@/lib/domain-provider';

export async function GET(req: Request) {
  try {
    const auth = await authorizeDomainRequest(req);
    if (auth.response) return auth.response;

    const query = normalizeDomainSearch(new URL(req.url).searchParams.get('query') || '');
    if (!query || query.length < 2 || query.length > 63 || !/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(query)) {
      return Response.json({ error: 'Enter a domain name or a short name to search.' }, { status: 400 });
    }

    const candidates = buildSearchCandidates(query).map((domain) => normalizeCustomDomain(domain).domain).filter(Boolean) as string[];
    if (!candidates.length || candidates.some((domain) => getDomainEnding(domain) !== '.com')) {
      return Response.json({ error: 'New-domain search currently supports .com domains.' }, { status: 400 });
    }

    const results = await searchDomains(candidates);
    return Response.json({ query, results });
  } catch (error: any) {
    if (error?.message === 'registrar_unconfigured') {
      return Response.json({ error: 'Domain search is not configured yet.' }, { status: 503 });
    }
    return Response.json({ error: 'Unable to search domains right now.' }, { status: 502 });
  }
}
