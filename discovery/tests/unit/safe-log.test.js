import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { safeLog } from '../../service/safe-log.js';

describe('safeLog (never log personal data, per CLAUDE.md)', () => {
  const originalEnv = process.env.NODE_ENV;
  afterEach(() => { process.env.NODE_ENV = originalEnv; });

  test('refuses to log a payload containing an e-mail address in production', () => {
    process.env.NODE_ENV = 'production';
    assert.throws(
      () => safeLog('error', 'answer rejected', { note: 'contact jane.doe@client.example' }),
      /Refusing to log/,
    );
  });

  test('refuses to log a payload containing a payment card number in production', () => {
    process.env.NODE_ENV = 'production';
    assert.throws(
      () => safeLog('error', 'card check', { text: '4111 1111 1111 1111' }),
      /Refusing to log/,
    );
  });

  test('allows clean payloads through in production', () => {
    process.env.NODE_ENV = 'production';
    assert.doesNotThrow(() => safeLog('info', 'engagement started', { client: 'acme-watches' }));
  });

  test('allows logging with no data payload at all', () => {
    process.env.NODE_ENV = 'production';
    assert.doesNotThrow(() => safeLog('info', 'server started'));
  });

  test('does not gate logging outside production (local development)', () => {
    process.env.NODE_ENV = 'development';
    assert.doesNotThrow(() => safeLog('warn', 'debug dump', { note: 'contact jane.doe@client.example' }));
  });
});
