import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  
  // Security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Handle subdomain hosting: {business}.voidbuild.com -> /s/{business}
  // For local dev: {business}.localhost:3000 -> /s/{business}
  if (hostname) {
    const isLocalhost = hostname.includes('localhost');
    const isVoidbuildDomain = hostname.includes('voidbuild.com') || hostname.includes('voidbuild.') || isLocalhost;
    
    if (isVoidbuildDomain) {
      // Extract subdomain
      let subdomain = '';
      
      if (isLocalhost) {
        // For localhost: mybusiness.localhost:3000 -> mybusiness
        const parts = hostname.split('.');
        if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost') {
          subdomain = parts[0];
        } else if (parts.length > 2) {
          subdomain = parts[0];
        }
      } else {
        // For voidbuild.com: mybusiness.voidbuild.com -> mybusiness
        // Remove port if present
        const hostWithoutPort = hostname.split(':')[0];
        const parts = hostWithoutPort.split('.');
        // voidbuild.com has 2 parts, subdomain.voidbuild.com has 3 parts
        if (parts.length >= 3) {
          const potentialSubdomain = parts[0];
          // Ignore www
          if (potentialSubdomain !== 'www' && potentialSubdomain !== 'voidbuild') {
            subdomain = potentialSubdomain;
          }
        }
      }

      // If we have a subdomain and path is / (root of subdomain), rewrite to /s/{subdomain}
      // So mybusiness.voidbuild.com/ -> /s/mybusiness
      // But keep /builder, /dashboard, /pricing, /auth etc as is for main domain
      const path = url.pathname;
      const isMainPath = path.startsWith('/builder') || path.startsWith('/dashboard') || path.startsWith('/pricing') || path.startsWith('/auth') || path.startsWith('/api') || path.startsWith('/p/') || path.startsWith('/s/') || path === '/_next' || path.includes('.');

      if (subdomain && !isMainPath && (path === '/' || path === '')) {
        // Rewrite subdomain root to /s/[subdomain]
        url.pathname = `/s/${subdomain}`;
        const rewriteResponse = NextResponse.rewrite(url);
        // Add security headers to rewrite response too
        rewriteResponse.headers.set('X-Frame-Options', 'DENY');
        rewriteResponse.headers.set('X-Content-Type-Options', 'nosniff');
        return rewriteResponse;
      }
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png).*)'],
};
