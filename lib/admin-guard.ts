import 'server-only';

function sanitize(value?: string | null): string {
  return (value || '').trim().replace(/^['"`\s]+/, '').replace(/['"`\s]+$/, '');
}

function isLocalHost(hostname: string): boolean {
  const host = hostname.split(':')[0].toLowerCase();
  return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost');
}

export function requireAdminDebugAccess(req: Request): Response | null {
  const url = new URL(req.url);
  const host = req.headers.get('host') || url.host || '';

  if (isLocalHost(host)) {
    return null;
  }

  const configuredKey = sanitize(process.env.VOIDBUILD_ADMIN_DEBUG_KEY);
  const providedKey = sanitize(
    req.headers.get('x-voidbuild-admin-key') ||
      req.headers.get('x-admin-debug-key') ||
      url.searchParams.get('adminKey')
  );

  if (configuredKey && providedKey && configuredKey === providedKey) {
    return null;
  }

  return Response.json(
    {
      error: 'This debug endpoint is disabled in production.',
      message:
        'To use it intentionally, set VOIDBUILD_ADMIN_DEBUG_KEY on the server and send the same value in the x-voidbuild-admin-key header.',
    },
    { status: 403 }
  );
}
