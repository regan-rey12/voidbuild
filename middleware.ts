import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // 1. Immediately pass through all system paths, API, auth, builder, dashboard, pricing, and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/builder') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/p/') ||
    pathname.startsWith('/s/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/logo') ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/apple-') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/sitemap') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/site.webmanifest') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Subdomain routing for {subdomain}.voidbuild.com -> /s/{subdomain}
  if (hostname) {
    const hostWithoutPort = hostname.split(':')[0].toLowerCase();

    // Skip root domain, www, localhost, and raw IPs
    if (
      hostWithoutPort === 'voidbuild.com' ||
      hostWithoutPort === 'www.voidbuild.com' ||
      hostWithoutPort === 'localhost' ||
      /^(\d{1,3}\.){3}\d{1,3}$/.test(hostWithoutPort)
    ) {
      return NextResponse.next();
    }

    let subdomain = '';

    // Handle local testing: {sub}.localhost
    if (hostWithoutPort.endsWith('.localhost')) {
      const sub = hostWithoutPort.replace('.localhost', '');
      if (sub && sub !== 'www') subdomain = sub;
    }
    // Handle production: {sub}.voidbuild.com
    else if (hostWithoutPort.endsWith('.voidbuild.com')) {
      const sub = hostWithoutPort.replace('.voidbuild.com', '');
      if (sub && sub !== 'www') subdomain = sub;
    }

    // Rewrite only the homepage of custom subdomains
    if (subdomain && (pathname === '/' || pathname === '')) {
      const url = request.nextUrl.clone();
      url.pathname = `/s/${subdomain}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo.png, etc.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png|icon-.*|apple-.*|robots.txt|sitemap.xml|manifest.json).*)',
  ],
};
