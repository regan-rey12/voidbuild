// VoidBuild Rate Limiter - Prevents token burn, fixes critical security hole
// Old backend had rateLimiter 20 req/IP/5min, new v2 had none - attacker could burn $5 tokens in minutes

interface RateLimitEntry {
  count: number;
  firstRequest: number;
}

const store = new Map<string, RateLimitEntry>();
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS = 10; // 10 requests per IP per 5 min for /api/generate ( stricter than old 20, saves tokens)

export function isRateLimited(ip: string): { limited: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry) {
    store.set(ip, { count: 1, firstRequest: now });
    return { limited: false, remaining: MAX_REQUESTS - 1, resetIn: WINDOW_MS };
  }

  // If window expired, reset
  if (now - entry.firstRequest > WINDOW_MS) {
    store.set(ip, { count: 1, firstRequest: now });
    return { limited: false, remaining: MAX_REQUESTS - 1, resetIn: WINDOW_MS };
  }

  // Within window, increment
  entry.count++;
  store.set(ip, entry);

  const remaining = MAX_REQUESTS - entry.count;
  const resetIn = WINDOW_MS - (now - entry.firstRequest);

  if (entry.count > MAX_REQUESTS) {
    return { limited: true, remaining: 0, resetIn };
  }

  return { limited: false, remaining, resetIn };
}

// Cleanup old entries every 10 minutes to prevent memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of store.entries()) {
      if (now - entry.firstRequest > WINDOW_MS * 2) {
        store.delete(ip);
      }
    }
  }, 10 * 60 * 1000);
}

export function getClientIp(req: Request): string {
  // Try to get real IP from headers (Vercel, Cloudflare)
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  // Fallback to CF-Connecting-IP (Cloudflare)
  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;
  return 'unknown-ip';
}
