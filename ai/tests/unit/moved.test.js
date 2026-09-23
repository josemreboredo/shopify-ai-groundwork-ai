/**
 * What an answer moved.
 *
 * The rule that matters is the silence: the line exists to report a
 * consequence, and one that speaks when nothing happened is a line people stop
 * reading — which is exactly what happened to the panel it replaced.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { whatMoved } from '../../shared/moved.js';

const base = {
  offer: { code: 'S', name: 'Ecommerce Foundation', provisional: true },
  go: true,
  route: null,
  scope_gates: { markets: 'unknown', b2b: 'unknown' },
  l_triggers: { luxury: 'inactive' },
  exit_rules: [],
  plan_suggestion: null,
};
const after = (over) => ({ ...base, ...over });

describe('what an answer moved', () => {
  test('an answer with no consequence says nothing at all', () => {
    assert.deepEqual(whatMoved(base, after({})), []);
    assert.deepEqual(whatMoved(base, after({ scope_gates: { markets: 'unknown', b2b: 'unknown' } })), []);
    // Missing either side is not "everything changed".
    assert.deepEqual(whatMoved(null, base), []);
    assert.deepEqual(whatMoved(base, null), []);
  });

  test('it names the offer, the gates and the rules, in the consultant’s words', () => {
    const moved = whatMoved(base, after({
      offer: { code: 'M', name: 'Ecommerce Scale', provisional: true },
      scope_gates: { markets: 'active', b2b: 'unknown' },
      exit_rules: [{ rule: '11.3', result: 'STOP', evidence: 'six markets at launch' }],
      plan_suggestion: { value: 'Advanced', reasons: [] },
    }));
    assert.deepEqual(moved, [
      'moved the offer to M · Ecommerce Scale',
      'put markets in scope',
      'fired 11.3 STOP — six markets at launch',
      'set the Shopify plan these answers need to Advanced',
    ]);
  });

  test('it reads the gates in the shape the preview reports them', () => {
    // { state, evidence } is what preview() returns; the bare string never met it.
    const was = { ...base, scope_gates: { markets: { state: 'unknown', evidence: null } }, l_triggers: { headless: { state: 'inactive' } } };
    const now = { ...was, scope_gates: { markets: { state: 'active', evidence: '3 markets' } }, l_triggers: { headless: { state: 'active' } } };
    assert.deepEqual(whatMoved(was, now), ['put markets in scope', 'made a headless storefront an L trigger']);
  });

  test('what goes past the pack is named as it arrives', () => {
    const was = after({ offer: { code: 'M', name: 'Ecommerce Scale', addons: [] } });
    const now = after({ offer: { code: 'M', name: 'Ecommerce Scale', addons: ['Each further Shopify store'] } });
    assert.deepEqual(whatMoved(was, now), ['added each further Shopify store on top of Ecommerce Scale']);
    assert.deepEqual(whatMoved(now, now), [], 'and only once');
  });

  test('going beyond the offers is reported as the route, not as a lost offer', () => {
    const moved = whatMoved(base, after({ go: false, route: 'larger_engagement' }));
    assert.deepEqual(moved, ['took it beyond the standard offers — larger engagement']);
  });

  test('a rule that was already firing is not news', () => {
    const firing = after({ exit_rules: [{ rule: '11.3', result: 'STOP', evidence: 'six markets' }] });
    assert.deepEqual(whatMoved(firing, firing), []);
  });

  test('an offer that stops being provisional is worth saying', () => {
    const settled = after({ offer: { code: 'S', name: 'Ecommerce Foundation', provisional: false } });
    assert.deepEqual(whatMoved(base, settled), ['settled the offer at S · Ecommerce Foundation']);
  });
});
