export const runtime = 'nodejs';

import { normalizeCustomDomain, verifyDomainWithHosting, domainStatusFromProvider, isDomainProviderConfigured } from '@/lib/domain-provider';
import {
  authorizeDomainRequest,
  domainRecordPayload,
  getOwnedProject,
  providerFailure,
  updateProjectDomain,
} from '@/lib/domain-service';

async function verifyForProject(req: Request, projectId: string) {
  const auth = await authorizeDomainRequest(req);
  if (auth.response) return auth.response;

  const body = await req.json().catch(() => ({}));
  const requestedDomain = body.domain;
  const project = await getOwnedProject(auth.admin, projectId, auth.user.id);
  if (!project) return Response.json({ error: 'Website not found.' }, { status: 404 });

  const normalized = normalizeCustomDomain(requestedDomain || project.custom_domain);
  if (normalized.error || !normalized.domain) return Response.json({ error: normalized.error }, { status: 400 });
  if (project.custom_domain !== normalized.domain) {
    return Response.json({ error: 'This domain is not connected to the selected website.' }, { status: 409 });
  }
  if (!isDomainProviderConfigured()) {
    return Response.json({ error: 'Custom-domain hosting is not configured yet.' }, { status: 503 });
  }

  const startedAt = new Date().toISOString();
  await updateProjectDomain(
    auth.admin,
    projectId,
    auth.user.id,
    domainRecordPayload({
      domain: normalized.domain,
      status: 'verifying',
      verification: project.custom_domain_verification || [],
      error: null,
      connectedAt: project.custom_domain_connected_at || startedAt,
      verifiedAt: project.custom_domain_verified_at || null,
      removedAt: null,
    }),
  );

  try {
    const provider = await verifyDomainWithHosting(normalized.domain);
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
        error: provider.error || null,
        connectedAt: project.custom_domain_connected_at || startedAt,
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
      checkedAt: now,
    });
  } catch (error: any) {
    const message = 'DNS verification could not be completed. Check the record and try again.';
    try {
      await updateProjectDomain(
        auth.admin,
        projectId,
        auth.user.id,
        domainRecordPayload({
          domain: normalized.domain,
          status: 'error',
          verification: project.custom_domain_verification || [],
          error: message,
          connectedAt: project.custom_domain_connected_at || startedAt,
          verifiedAt: null,
          removedAt: null,
        }),
      );
    } catch {}
    const failure = providerFailure(error);
    return Response.json({ error: failure.status === 503 ? failure.error : message }, { status: failure.status === 503 ? 503 : 502 });
  }
}

export async function POST(req: Request) {
  const body = await req.clone().json().catch(() => ({}));
  const projectId = String(body.projectId || '').trim();
  if (!projectId) return Response.json({ error: 'projectId is required.' }, { status: 400 });
  return verifyForProject(req, projectId);
}
