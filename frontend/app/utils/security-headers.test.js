/**
 * The site-wide policy keeps forms on the site and GitHub; only a page that has
 * to hand a browser on to somewhere else — the connector's consent page, back
 * to Claude — widens form-action, and only by the origin it names.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { contentSecurityPolicy, getSecurityHeaders } from './security-headers.js';

const formAction = (csp) => csp.split('; ').find((d) => d.startsWith('form-action ')).split(' ').slice(1);

test('every page sends forms only to the site and to GitHub', () => {
  assert.deepEqual(formAction(getSecurityHeaders()['Content-Security-Policy']), ["'self'", 'https://github.com']);
  assert.equal(getSecurityHeaders()['Content-Security-Policy'], contentSecurityPolicy());
});

test('a page can add the one origin its form redirects to, and nothing else changes', () => {
  const widened = contentSecurityPolicy({ formAction: ['https://claude.ai'] });
  assert.deepEqual(formAction(widened), ["'self'", 'https://github.com', 'https://claude.ai']);
  const others = (csp) => csp.split('; ').filter((d) => !d.startsWith('form-action '));
  assert.deepEqual(others(widened), others(contentSecurityPolicy()), 'script, frame and connect rules stay as they are');
});
