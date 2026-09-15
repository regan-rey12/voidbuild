import { NextRequest, NextResponse } from 'next/server';

function requestHost(request: NextRequest): string {
  return (request.headers.get('x-forwarded-host') || request.headers.get('host') || '')
    .split(',')[0]
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, '')
    .replace(/\.$/, '');
}

function isPublicSiteHost(host: string): boolean {
  if (!host) return false;
  if (host === 'localhost' || host.endsWith('.localhost')) return false;
  if (host === '127.0.0.1' || host === '::1') return false;
  if (host === 'voidbuild.com' || host === 'www.voidbuild.com') return false;
  if (host.endsWith('.vercel.app') || host.endsWith('.e2b.app')) return false;
  return host.includes('.');
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isStaticAsset = /\.(?:avif|bmp|css|gif|ico|jpg|jpeg|js|json|map|png|svg|txt|webp|woff2?)$/i.test(pathname);
  if (
    pathname.startsWith('/custom-site') ||
    pathname === '/api' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    isStaticAsset
  ) {
    return NextResponse.next();
  }

  const host = requestHost(request);
  if (!isPublicSiteHost(host)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/custom-site/${host}${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
