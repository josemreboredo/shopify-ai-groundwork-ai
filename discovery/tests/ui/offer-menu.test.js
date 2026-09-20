/**
 * The menu calls each offer what the offering calls it.
 *
 * The nav used to read "Offer S / Offer M / Offer L", which is a filing code:
 * nobody says it in a client conversation, and a consultant looking for what an
 * engagement was sold as is looking for the name. Names drift, though — the
 * offering was recalibrated three times in a week — so they are read out of
 * root.jsx and compared against offering.json rather than trusted.
 *
 * It sits under tests/ui because `npm test` is the only runner the repository
 * has; a test under frontend/ would never execute.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { offering } from '../../schema/index.js';

const root = fs.readFileSync(new URL('../../../frontend/app/root.jsx', import.meta.url), 'utf8');

/** The label each /offering/<slug> entry carries in the nav. */
const labels = new Map(
  [...root.matchAll(/\{ to: '\/offering\/([a-z-]+)', label: '([^']+)'/g)].map((m) => [m[1], m[2]]),
);

describe('the offer menu', () => {
  test('every offer is listed by its name, from the offering itself', () => {
    for (const [code, offer] of Object.entries(offering.offers)) {
      const label = labels.get(code.toLowerCase());
      assert.ok(label, `/offering/${code.toLowerCase()} is not in the menu`);
      assert.equal(label, offer.name, `the menu calls offer ${code} something the offering does not`);
    }
  });

  test('and what lies beyond them is listed too, but not as an offer', () => {
    assert.equal(labels.get('larger-engagement'), 'Beyond the offers');
    assert.ok(!Object.keys(offering.offers).includes('larger-engagement'));
  });

  test('no offer is listed twice or under a letter', () => {
    const names = [...labels.values()];
    assert.equal(new Set(names).size, names.length, 'duplicate label in the menu');
    for (const name of names) assert.doesNotMatch(name, /^Offer [SML]$/, `${name} is a filing code, not a name`);
  });
});
