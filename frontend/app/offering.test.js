/**
 * Weeks as a consultant reads them out: engine sums are floating point, and the
 * go/no-go page printed a total of "14.754999999999999–20.255 weeks".
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { weeks, weeksNear, signedWeeks } from './offering.js';

test('a span of weeks is rounded to the nearest twentieth, whatever the arithmetic left behind', () => {
  assert.equal(weeks({ min: 14.754999999999999, max: 20.255 }), '14.75–20.25');
  assert.equal(weeks({ min: 1.755, max: 1.755 }), '1.75');
  assert.equal(weeks({ min: 0.8775, max: 2.49 }), '0.9–2.5');
});

test('the figures the offering sells by come through as they are', () => {
  assert.equal(weeks({ min: 4, max: 5 }), '4–5');
  assert.equal(weeks({ min: 0.75, max: 0.75 }), '0.75');
  assert.equal(weeks({ min: 2.25, max: 3.25 }), '2.25–3.25');
  assert.equal(weeks({ min: 0.125, max: 0.125 }), '⅛', 'one app keeps its name');
  assert.equal(weeks(null), '—');
  assert.equal(weeksNear, weeks, 'one formatter, under both names');
});

test('a change in weeks is signed and rounded the same way', () => {
  assert.equal(signedWeeks({ min: 1.755, max: 1.755 }), '+1.75');
  assert.equal(signedWeeks({ min: -2, max: -2 }), '-2');
  assert.equal(signedWeeks({ min: 0.5, max: 1.0000000001 }), '+0.5 to +1');
});
