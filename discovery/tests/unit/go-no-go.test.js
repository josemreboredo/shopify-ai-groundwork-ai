/**
 * Where the Solution Architect stands on a bid.
 *
 * The meeting's scorecard is mostly commercial and this desk does not answer it.
 * It answers one thing: can Merkle put a number on this work and stand behind it.
 * The order the reasons are checked in is the design — a position built on
 * extractions nobody has verified is not a position, however much of it there is
 * — so the tests walk that order rather than the numbers.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { goNoGoView } from '../../service/go-no-go.js';

const fixture = (name) => JSON.parse(fs.readFileSync(new URL(`../fixtures/engagements/${name}.json`, import.meta.url), 'utf8'));
const state = (over = {}) => ({ documents: 1, coverage: { required_answered: 62, required_total: 85 }, to_review: 0, ...over });
const view = (over = {}, name = 'acme-watches', opts = {}) => goNoGoView(fixture(name), state(over), null, opts);

describe('go/no-go support', () => {
  test('with nothing read, it says so instead of assessing thin air', () => {
    const r = view({ documents: 0, coverage: { required_answered: 0, required_total: 85 } }).recommendation;
    assert.equal(r.verdict, 'nothing to go on');
    assert.deepEqual(r.before_you_go, ['Read the RFP in on the first step.']);
  });

  test('unconfirmed extractions stop everything else — that is the whole point of Review', () => {
    const r = view({ to_review: 46 }).recommendation;
    assert.equal(r.verdict, 'not yet');
    assert.match(r.headline, /cannot stand behind/i);
    assert.ok(r.because.some((b) => /46 of those are still unconfirmed/.test(b)));
    assert.ok(r.before_you_go.some((b) => /Confirm what it says/.test(b)));
    // and it does not go on to argue about topics or assumptions first
    assert.ok(!r.because.some((b) => /topics are still open/.test(b)));
  });

  test('once confirmed, it says so and moves on to what is still unknown', () => {
    const r = view().recommendation;
    assert.notEqual(r.verdict, 'not yet');
    assert.ok(r.because.some((b) => /confirmed by a person/.test(b)));
  });

  test('a requirement outside the offers is a different conversation, not a worse price', () => {
    const r = goNoGoView(fixture('stop-custom-checkout'), state(), null).recommendation;
    assert.equal(r.verdict, 'not a standard bid');
    assert.ok(r.because.some((b) => /outside Merkle's standard offers/.test(b)));
    assert.ok(r.before_you_go.some((b) => /bespoke work at a standard price/.test(b)));
  });

  test('the reasons are facts, in the order he reads them, and never a percentage', () => {
    for (const over of [{}, { to_review: 12 }, { documents: 0 }]) {
      const r = view(over).recommendation;
      assert.ok(r.because.length, 'a position with no reasons is an opinion');
      for (const line of r.because) {
        assert.ok(!/%/.test(line), '"28% of what sets the price" was a coverage ratio wearing a claim it could not support');
      }
    }
  });

  test('every verdict it can reach is one a person would say out loud', () => {
    const seen = new Set([
      view({ documents: 0 }).recommendation.verdict,
      view({ to_review: 4 }).recommendation.verdict,
      view().recommendation.verdict,
      goNoGoView(fixture('stop-custom-checkout'), state(), null).recommendation.verdict,
    ]);
    for (const v of seen) assert.ok(/^(go|go, but ask|ask first|not yet|not a standard bid|nothing to go on)$/.test(v), v);
    assert.ok(seen.size >= 3, 'the chain actually discriminates');
  });

  test('it stands on what the engine derived, not on a second list', () => {
    const v = view();
    const gates = Object.entries(fixture('acme-watches').offer.scope_gates).filter(([, g]) => g.active);
    assert.equal(v.capabilities.length, gates.length);
    for (const c of v.capabilities) assert.ok(c.evidence, 'each capability carries the answer that proves it');
    assert.equal(v.rests_on.unconfirmed, 0);
    assert.equal(v.rests_on.documents, 1);
  });

  test('no price is quoted for an offer that does not apply, even to an owner', () => {
    const v = goNoGoView(fixture('stop-custom-checkout'), state(), null, { pricing: true });
    assert.equal(v.scope.applies, false);
    assert.equal(v.scope.band, null);
    assert.ok(!/(EUR|CHF|GBP|USD)\s*[\d]/.test(JSON.stringify(v)), 'no currency figure survives');
    assert.ok(v.scope.why_not.length, 'and the rule that took it outside is named');
  });

  test('a GO engagement quotes the band to an owner only', () => {
    assert.ok(view({}, 'acme-watches', { pricing: true }).scope.band);
    assert.equal(view({}, 'acme-watches', {}).scope.band, null);
  });

  test('the rest of the scorecard is named with who owns it', () => {
    const v = view();
    assert.equal(v.not_ours.length, 19);
    for (const q of v.not_ours) assert.ok(q.ask && q.owner, `Q${q.n} names an owner`);
  });
});
