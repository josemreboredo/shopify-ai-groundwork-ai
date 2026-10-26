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
