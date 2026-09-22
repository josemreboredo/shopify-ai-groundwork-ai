import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { createRateLimiter } from './rate-limiter.js';

const requestFrom = (ip) => new Request('https://example.test', { headers: { 'x-forwarded-for': ip } });

describe('rate limiter', () => {
  test('allows requests under the limit and blocks once the limit is reached', () => {
    const limiter = createRateLimiter({ maxRequests: 3, windowMs: 60000 });
    const req = requestFrom('1.2.3.4');
    assert.equal(limiter.check(req).allowed, true);
    assert.equal(limiter.check(req).allowed, true);
    assert.equal(limiter.check(req).allowed, true);
    const blocked = limiter.check(req);
    assert.equal(blocked.allowed, false);
    assert.ok(blocked.retryAfter > 0);
  });

  test('tracks each client identifier independently', () => {
    const limiter = createRateLimiter({ maxRequests: 1, windowMs: 60000 });
    assert.equal(limiter.check(requestFrom('1.1.1.1')).allowed, true);
    assert.equal(limiter.check(requestFrom('1.1.1.1')).allowed, false);
    assert.equal(limiter.check(requestFrom('2.2.2.2')).allowed, true, 'a different client is not affected by another client’s limit');
  });

  test('two independent limiters (e.g. two endpoints) never share buckets', () => {
    const tokenEndpoint = createRateLimiter({ maxRequests: 1, windowMs: 60000 });
    const otherEndpoint = createRateLimiter({ maxRequests: 1, windowMs: 60000 });
    const req = requestFrom('9.9.9.9');
    assert.equal(tokenEndpoint.check(req).allowed, true);
    assert.equal(tokenEndpoint.check(req).allowed, false, 'second request to the same endpoint is blocked');
    assert.equal(otherEndpoint.check(req).allowed, true, 'a different endpoint’s limiter is unaffected');
  });

  test('requests age out of the sliding window', () => {
    let t = 0;
    const limiter = createRateLimiter({ maxRequests: 1, windowMs: 1000, now: () => t });
    const req = requestFrom('4.4.4.4');
    assert.equal(limiter.check(req).allowed, true);
    assert.equal(limiter.check(req).allowed, false, 'still within the window');
    t = 1001;
    assert.equal(limiter.check(req).allowed, true, 'the earlier request has aged out of the window');
  });
});
