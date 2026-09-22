// Simple in-memory rate limiter for protecting sensitive endpoints.
// Tracks requests by client identifier (IP by default) using a sliding window.

const defaultKeyGenerator = (req) => req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

/**
 * @param {{ maxRequests?: number, windowMs?: number, keyGenerator?: (req: Request) => string, now?: () => number }} [options]
 */
export function createRateLimiter({
  maxRequests = 10,
  windowMs = 60000,
  keyGenerator = defaultKeyGenerator,
  now = () => Date.now(),
} = {}) {
  // Own store per limiter instance — a limiter created for one endpoint must
  // never share buckets with a limiter created for another.
  const requestsByKey = new Map();

  return {
    check(request) {
      const key = keyGenerator(request);
      const t = now();
      const requests = (requestsByKey.get(key) ?? []).filter((time) => t - time < windowMs);

      if (requests.length >= maxRequests) {
        requestsByKey.set(key, requests);
        return { allowed: false, remaining: 0, retryAfter: Math.ceil((requests[0] + windowMs - t) / 1000) };
      }

      requests.push(t);
      requestsByKey.set(key, requests);
      return { allowed: true, remaining: maxRequests - requests.length, retryAfter: null };
    },
  };
}
