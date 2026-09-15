export const runtime = 'nodejs';

import {
  addDomainToHosting,
  domainStatusFromProvider,
  isDomainProviderConfigured,
  normalizeCustomDomain,
} from '@/lib/domain-provider';
import {
  authorizeDomainRequest,
  domainRecordPayload,
  getOwnedProject,
  projectDomainResponse,
  providerFailure,
  updateProjectDomain,
} from '@/lib/domain-service';
import { GET as getProjectDomain, DELETE as deleteProjectDomain } from './[projectId]/route';

export async function POST(req: Request) {
  try {
    const auth = await authorizeDomainRequest(req);
    if (auth.response) return auth.response;

    const body = await req.json().catch(() => ({}));
    const projectId = String(body.projectId || '').trim();
    const normalized = normalizeCustomDomain(body.domain);
    if (!projectId) return Response.json({ error: 'projectId is required.' }, { status: 400 });
    if (normalized.error || !normalized.domain) return Response.json({ error: normalized.error }, { status: 400 });

    const project = await getOwnedProject(auth.admin, projectId, auth.user.id);
    if (!project) return Response.json({ error: 'Website not found.' }, { status: 404 });

    const { data: duplicate, error: duplicateError } = await auth.admin
      .from('projects')
      .select('id')
      .eq('custom_domain', normalized.domain)
      .neq('id', projectId)
      .limit(1)
      .maybeSingle();
    if (duplicateError) throw new Error(duplicateError.message);
    if (duplicate?.id) return Response.json({ error: 'That domain is already connected to another VoidBuild website.' }, { status: 409 });

    if (project.custom_domain === normalized.domain && project.custom_domain_status === 'active') {
      return Response.json({ success: true, ...projectDomainResponse(project) });
    }

    if (!isDomainProviderConfigured()) {
      await updateProjectDomain(
        auth.admin,
        projectId,
        auth.user.id,
        domainRecordPayload({ domain: normalized.domain, status: 'provider_unconfigured', error: 'Custom-domain hosting is not configured yet.' }),
      );
      return Response.json({ error: 'Custom-domain hosting is not configured yet.' }, { status: 503 });
    }

    let provider;
    try {
      provider = await addDomainToHosting(normalized.domain);
    } catch (error: any) {
      try {
        await updateProjectDomain(
          auth.admin,
          projectId,
          auth.user.id,
          domainRecordPayload({ domain: normalized.domain, status: 'error', verification: [], error: 'The hosting provider could not connect this domain.' }),
        );
      } catch {}
      throw error;
    }
    const status = domainStatusFromProvider(provider);
    const now = new Date().toISOString();
    await updateProjectDomain(
      auth.admin,
      projectId,
      auth.user.id,
      domainRecordPayload({
        domain: normalized.domain,
        status,
        verification: provider.verification || [],
        error: null,
        connectedAt: now,
        verifiedAt: provider.verified ? now : null,
        removedAt: null,
      }),
    );

    return Response.json({
      success: true,
      domain: normalized.domain,
      status,
      verified: provider.verified,
      verification: provider.verification || [],
      connectedAt: now,
    });
  } catch (error: any) {
    const failure = providerFailure(error);
    return Response.json({ error: failure.error }, { status: failure.status });
  }
}

// Kept for existing dashboard clients. New clients should use
// GET /api/domains/:projectId.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const projectId = String(url.searchParams.get('projectId') || '').trim();
  if (!projectId) return Response.json({ error: 'projectId is required.' }, { status: 400 });

  const forwarded = new Request(req.url, { headers: req.headers });
  return getProjectDomain(forwarded, { params: Promise.resolve({ projectId }) });
}

// Kept for existing dashboard clients. New clients should use
// DELETE /api/domains/:projectId.
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const projectId = String(url.searchParams.get('projectId') || '').trim();
  if (!projectId) return Response.json({ error: 'projectId is required.' }, { status: 400 });

  const forwarded = new Request(req.url, { method: 'DELETE', headers: req.headers });
  return deleteProjectDomain(forwarded, { params: Promise.resolve({ projectId }) });
}
