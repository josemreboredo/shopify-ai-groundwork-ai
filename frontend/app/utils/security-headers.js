// Security headers middleware for protecting against common web vulnerabilities

/**
 * The Content Security Policy, with any further origins a page's forms may send to.
 *
 * @param {{ formAction?: string[] }} [options]
 */
export function contentSecurityPolicy({ formAction = [] } = {}) {
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.anthropic.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    // 'self' for the app's own forms, github.com because the sign-in form
    // posts to /auth/github, which 302s to GitHub's OAuth authorize page —
    // form-action also gates redirects that follow a form submission. The
    // connector's consent page adds the client's own redirect origin, or
    // Allow posts, the server redirects to the client, and the browser drops it.
    `form-action ${["'self'", 'https://github.com', ...formAction].join(' ')}`
  ].join('; ');
}

/**
 * A policy that also lets this one response's inline scripts run.
 *
 * React Router starts the app from inline scripts — the router context, the
 * module import, the streamed data and the scroll restoration — and
 * script-src 'self' blocked every one, so no page ever ran its JavaScript:
 * buttons that only work in the browser, like Confirm all on Review, did
 * nothing. A nonce made for each response lets exactly those scripts run, and
 * nothing injected into the page can know it in advance.
 *
 * @param {string} csp
 * @param {string} nonce
 */
export function withScriptNonce(csp, nonce) {
  return csp
    .split('; ')
    .map((d) => (d.startsWith('script-src ') ? `${d} 'nonce-${nonce}'` : d))
    .join('; ');
}

export function getSecurityHeaders() {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    // Content Security Policy - prevents XSS, clickjacking, and other injection attacks
    'Content-Security-Policy': contentSecurityPolicy(),

    // Prevent clickjacking attacks
    'X-Frame-Options': 'DENY',

    // Prevent MIME-type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Enable XSS protection in older browsers
    'X-XSS-Protection': '1; mode=block',

    // Control referrer information
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // HTTP Strict Transport Security (HSTS) - force HTTPS
    ...(isProduction && {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    }),

    // Permissions Policy - restrict browser features
    'Permissions-Policy': [
      'geolocation=()',
      'microphone=()',
      'camera=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()'
    ].join(', ')
  };
}
