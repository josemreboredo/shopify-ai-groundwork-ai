/**
 * The site-wide policy keeps forms on the site and GitHub; only a page that has
 * to hand a browser on to somewhere else — the connector's consent page, back
 * to Claude — widens form-action, and only by the origin it names.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { contentSecurityPolicy, getSecurityHeaders, withScriptNonce } from './security-headers.js';

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

test('a response nonce lets that page’s own inline scripts run, and changes nothing else', () => {
  const base = contentSecurityPolicy({ formAction: ['https://claude.ai'] });
  const nonced = withScriptNonce(base, 'abc123==');
  const directive = (csp, name) => csp.split('; ').find((d) => d.startsWith(`${name} `));
  assert.equal(directive(nonced, 'script-src'), "script-src 'self' 'nonce-abc123=='");
  assert.doesNotMatch(directive(nonced, 'script-src'), /unsafe-inline/, 'still no unsafe-inline for scripts');
  for (const name of ['default-src', 'style-src', 'connect-src', 'frame-ancestors', 'form-action']) {
    assert.equal(directive(nonced, name), directive(base, name), `${name} unchanged`);
  }
});
