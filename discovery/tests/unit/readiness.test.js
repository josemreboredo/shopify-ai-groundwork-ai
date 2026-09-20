/**
 * Whether the bid can be priced yet, and what each gap costs.
 *
 * The owner asked for a completeness percentage and an eighty per cent
 * threshold. A percentage of the right thing is defensible; a threshold on it is
 * not, because thirty-two of thirty-three settled with the store topology open
 * is not ninety-seven per cent ready — it is not ready. So the number is the
 * trend and the gate is a list of blockers, each carrying its evidence.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { readiness, openPoints } from '../../service/readiness.js';
import { offering } from '../../schema/index.js';

const fixture = (name) => JSON.parse(fs.readFileSync(new URL(`../fixtures/engagements/${name}.json`, import.meta.url), 'utf8'));
const acme = () => fixture('acme-watches');
const state = (doc, over = {}) => ({ provenance: doc.provenance, toReview: 0, openTopics: [], cannotPrice: [], assumptions: [], ...over });

describe('can we price this yet', () => {
  test('the denominator is the engine’s own decisions, and it is a constant of the offering', () => {
    const r = readiness(acme(), state(acme()));
    assert.equal(r.decisions.total, offering.scope_gates.length + offering.l_triggers.length + offering.exit_rules.length);
    assert.equal(r.decisions.total, 33, 'seven gates, three triggers, twenty-three rules');
    // A ratio of questions is not comparable between bids: only_if moves the
    // question count per client, and one question can drive six rules.
    for (const d of [...offering.scope_gates, ...offering.l_triggers, ...offering.exit_rules]) {
      assert.ok((d.inputs ?? []).length, `${d.id} declares what it reads`);
    }
  });

  test('a decision is settled when it fired, or when everything it reads is answered and confirmed', () => {
    const doc = acme();
    const r = readiness(doc, state(doc));
    assert.ok(r.decisions.settled > 0 && r.decisions.settled < r.decisions.total);
    assert.equal(r.decisions.open.length, r.decisions.total - r.decisions.settled);
    for (const d of r.decisions.open) assert.ok(d.why, 'and each open one says why it is open');
  });

  test('an answer nobody has confirmed does not settle anything', () => {
    const doc = acme();
    const provenance = structuredClone(doc.provenance);
    for (const key of Object.keys(provenance)) provenance[key] = { ...provenance[key], status: 'tbc' };
    const before = readiness(doc, state(doc)).decisions.settled;
    const after = readiness(doc, state(doc, { provenance })).decisions.settled;
    assert.ok(after < before, 'a bid cannot rest on an extraction nobody has checked');
  });

  test('the gate is the blockers, never the ratio', () => {
    const doc = acme();
    // Everything settled that can be, and still not ready: one topic that
    // changes the shape of the solution is enough on its own.
    const r = readiness(doc, state(doc, { openTopics: [{ title: 'Markets', impact: 'high', changes: ['how many stores'] }] }));
    assert.equal(r.ready, false);
    assert.equal(r.blockers.length, 1);
    assert.match(r.blockers[0].what, /change the shape/);
    assert.ok(r.decisions.settled / r.decisions.total > 0.8, 'well past any percentage threshold, and still blocked');
  });

  test('every blocker names where to go and what the evidence is', () => {
    const doc = acme();
    const r = readiness(doc, state(doc, {
      toReview: 12,
      triage: { proposed: [{}, {}] },
      cannotPrice: ['Average basket'],
      openTopics: [{ title: 'Markets', impact: 'high', changes: [] }],
    }));
    assert.equal(r.ready, false);
    assert.equal(r.blockers.length, 4, 'four of the five clauses fire; no STOP rule in this fixture');
    for (const b of r.blockers) {
      assert.ok(b.what && b.why, 'a blocker with no evidence is an opinion');
      assert.ok(['review', 'go-no-go', 'clarifications'].includes(b.where), 'and somewhere to go about it');
    }
  });

  test('nothing blocking reads as ready, with what it is resting on', () => {
    const doc = acme();
    const r = readiness(doc, state(doc, { assumptions: [{ about: 'x', assumed: 'y', impact_if_wrong: 'z' }] }));
    assert.equal(r.ready, true);
    assert.equal(r.counts.assumptions, 1);
  });
});

describe('open points are grouped by what they cost', () => {
  const topics = [
    { title: 'Markets', impact: 'high', changes: ['how many stores the markets run on'], covers: [{ question_id: 'Q3.1.1' }] },
    { title: 'Catalogue', impact: 'medium', changes: ['the Shopify plan'], covers: [{ question_id: 'Q2.1.1' }] },
  ];

  test('what stops a price is separated from what is merely assumed', () => {
    const o = openPoints(topics, [], ['Average basket']);
    assert.equal(o.blocks_a_price.length, 2, 'the uncostable input and the shape-changing topic');
    assert.equal(o.priced_on_an_assumption.length, 1);
    assert.match(o.blocks_a_price[0].reason, /cannot be costed/);
  });

  test('an assumption nobody said the cost of is counted, because it is the worst row on the page', () => {
    const withConsequence = { about: 'One entity', assumed: 'one', impact_if_wrong: 'expansion stores', owner: 'lc-one', source: 'rejected' };
    const without = { about: 'B2B', assumed: 'none', impact_if_wrong: null, owner: 'lc-one', source: 'rejected' };
    const o = openPoints([], [withConsequence, without], []);
    assert.equal(o.without_consequence, 1, 'that is the one that becomes a scope argument');
    assert.equal(o.priced_on_an_assumption.find((r) => r.what === 'One entity').consequence, 'expansion stores');
  });

  test('every row says what it moves or where to settle it — never a bare question id', () => {
    const o = openPoints(topics, [], []);
    for (const row of [...o.blocks_a_price, ...o.priced_on_an_assumption]) {
      assert.ok(row.what, 'named in words');
      assert.ok(row.moves.length || row.settles.length || row.consequence, 'and carrying a consequence or a way to close it');
    }
  });
});
