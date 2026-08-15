import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;
  
  // Security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Skip all API routes, internal Next.js paths, static assets, and main application routes
  const isExcludedPath = 
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/builder') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/p/') ||
    pathname.startsWith('/s/') ||
    pathname.includes('.');

  if (isExcludedPath) {
    return response;
  }

  // Handle subdomain routing: {shop}.voidbuild.com -> /s/{shop}
  if (hostname) {
    const hostWithoutPort = hostname.split(':')[0].toLowerCase();
    
    // Ignore direct IP addresses (127.0.0.1, 0.0.0.0, etc.)
    const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostWithoutPort);
    if (isIpAddress || hostWithoutPort === 'localhost') {
      return response;
    }

    let subdomain = '';

    // Handle local dev testing: shop.localhost -> shop
    if (hostWithoutPort.endsWith('.localhost')) {
      const sub = hostWithoutPort.replace('.localhost', '');
      if (sub && sub !== 'www') {
        subdomain = sub;
      }
    } 
    // Handle production: shop.voidbuild.com -> shop
    else if (hostWithoutPort.endsWith('.voidbuild.com')) {
      const sub = hostWithoutPort.replace('.voidbuild.com', '');
      if (sub && sub !== 'www') {
        subdomain = sub;
      }
    }

    // Only rewrite root path of subdomains (e.g. shop.voidbuild.com/ -> /s/shop)
    if (subdomain && (pathname === '/' || pathname === '')) {
      url.pathname = `/s/${subdomain}`;
      const rewriteResponse = NextResponse.rewrite(url);
      rewriteResponse.headers.set('X-Frame-Options', 'DENY');
      rewriteResponse.headers.set('X-Content-Type-Options', 'nosniff');
      return rewriteResponse;
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo.png|.*\\..*).*)'],
};
