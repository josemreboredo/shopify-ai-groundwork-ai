import { oauth } from '../discovery.server.js';
import { jsonResponse } from '../origin.server.js';
import { createRateLimiter } from '../utils/rate-limiter.js';

const tokenLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 60000 // 10 requests per minute per IP
});

export const loader = () => jsonResponse({ error: 'invalid_request', error_description: 'Use POST' }, 405);

export async function action({ request }) {
  // Rate limit token endpoint to prevent brute force attacks
  const rateLimit = tokenLimiter.check(request);
  if (!rateLimit.allowed) {
    return jsonResponse(
      {
        error: 'rate_limit_exceeded',
        error_description: `Too many token requests. Try again in ${rateLimit.retryAfter} seconds.`
      },
      429
    );
  }

  let form;
  try {
    form = Object.fromEntries((await request.formData()).entries());
  } catch {
    return jsonResponse({ error: 'invalid_request', error_description: 'Send application/x-www-form-urlencoded' }, 400);
  }
  const { status, body } = await oauth().token(form);
  return jsonResponse(body, status);
}
