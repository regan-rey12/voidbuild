export const runtime = 'nodejs';

import {
  getDomainFromHosting,
  isDomainProviderConfigured,
  removeDomainFromHosting,
  domainStatusFromProvider,
} from '@/lib/domain-provider';
import {
  authorizeDomainRequest,
  domainRecordPayload,
  getOwnedProject,
  projectDomainResponse,
  providerFailure,
  updateProjectDomain,
} from '@/lib/domain-service';

type RouteContext = { params: Promise<{ projectId: string }> };

export async function GET(req: Request, context: RouteContext) {
  try {
    const auth = await authorizeDomainRequest(req);
    if (auth.response) return auth.response;

    const { projectId } = await context.params;
    const project = await getOwnedProject(auth.admin, projectId, auth.user.id);
    if (!project) return Response.json({ error: 'Website not found.' }, { status: 404 });
    if (!project.custom_domain) return Response.json(projectDomainResponse(project));

    if (!isDomainProviderConfigured()) {
      return Response.json({
        ...projectDomainResponse(project),
        status: 'provider_unconfigured',
      });
    }

    const provider = await getDomainFromHosting(project.custom_domain);
    const status = domainStatusFromProvider(provider);
    const now = new Date().toISOString();
    await updateProjectDomain(
      auth.admin,
      projectId,
      auth.user.id,
      domainRecordPayload({
        domain: project.custom_domain,
        status,
        verification: provider.verification || [],
        error: null,
        connectedAt: project.custom_domain_connected_at || now,
        verifiedAt: provider.verified ? project.custom_domain_verified_at || now : null,
        removedAt: null,
      }),
    );

    return Response.json({
      ...projectDomainResponse({
        ...project,
        custom_domain_status: status,
        custom_domain_verification: provider.verification || [],
        custom_domain_error: null,
        custom_domain_verified_at: provider.verified ? project.custom_domain_verified_at || now : null,
      }),
      verified: provider.verified,
    });
  } catch (error: any) {
    const failure = providerFailure(error);
    return Response.json({ error: failure.error }, { status: failure.status });
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const auth = await authorizeDomainRequest(req);
    if (auth.response) return auth.response;

    const { projectId } = await context.params;
    const project = await getOwnedProject(auth.admin, projectId, auth.user.id);
    if (!project) return Response.json({ error: 'Website not found.' }, { status: 404 });
    if (!project.custom_domain) return Response.json({ success: true, ...projectDomainResponse(project) });

    if (isDomainProviderConfigured()) {
      await removeDomainFromHosting(project.custom_domain);
    }

    const now = new Date().toISOString();
    await updateProjectDomain(
      auth.admin,
      projectId,
      auth.user.id,
      domainRecordPayload({
        domain: null,
        status: 'removed',
        verification: [],
        error: null,
        connectedAt: project.custom_domain_connected_at || null,
        verifiedAt: project.custom_domain_verified_at || null,
        removedAt: now,
      }),
    );

    return Response.json({ success: true, domain: null, status: 'removed', removedAt: now });
  } catch (error: any) {
    const failure = providerFailure(error);
    return Response.json({ error: failure.error }, { status: failure.status });
  }
}
