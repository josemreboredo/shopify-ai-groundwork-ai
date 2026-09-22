/**
 * The comparison rubric: every option measured on the same axes, so a decision is
 * compared rather than argued, and the axis nobody filled in is caught before the
 * client reads the deck.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { AXES, CORE_AXES, axesFor, axesForDecision, rubricErrors, comparisonTable, rubricBrief } from '../../agents/discovery/rubric.js';
import { approachQualityErrors } from '../../agents/discovery/approach.js';

const fixture = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'fixtures', 'engagements', 'acme-watches.json'), 'utf8'));
const dtc = { markets: { list: [{ code: 'CH' }] }, offer: { delivery_track: 'liquid' }, migration: { source_platform: 'none' } };

describe('comparison rubric', () => {
  test('eight axes always apply; the rest are switched on by the engagement', () => {
    assert.equal(CORE_AXES.length, 8);
    const plain = axesFor(dtc).map((a) => a.id);
    assert.deepEqual(plain, CORE_AXES, 'a single-market D2C store asks nothing extra');
    const acme = axesFor(fixture).map((a) => a.id);
    assert.ok(acme.includes('multi_market') && acme.includes('b2b'), 'three markets and wholesale switch their axes on');
    assert.ok(!acme.includes('retail'), 'no physical stores, no in-store axis');
    for (const axis of AXES) assert.ok(axis.label && axis.asks, `${axis.id} needs a label and a question`);
  });

  test('a decision is held to the axes it raises itself, not to every axis in play', () => {
    const themes = { topic: 'Theme', question: 'Horizon or custom?', decision: 'Horizon', rationale: 'Fits the scope', options: [{ option: 'Horizon' }, { option: 'Custom' }] };
    const ids = axesForDecision(themes, fixture).map((a) => a.id);
    assert.ok(!ids.includes('b2b'), 'a theme decision is not made to write "not applicable" about wholesale');
    const b2b = { topic: 'B2B wholesale', question: 'Native B2B or an app?', decision: 'Native', rationale: 'Company accounts', options: [{ option: 'Native' }] };
    assert.ok(axesForDecision(b2b, fixture).map((a) => a.id).includes('b2b'));
    const topology = { topic: 'Market topology', options: [{ option: 'One store' }] };
    assert.deepEqual(axesForDecision(topology, fixture).length, axesFor(fixture).length, 'topology touches every dimension by definition');
  });

  test('the axis list does not grow as it is answered', () => {
    const decision = { topic: 'Theme', question: 'Horizon or custom?', decision: 'Horizon', rationale: 'Fits', options: [{ option: 'Horizon' }] };
    const before = axesForDecision(decision, fixture).length;
    decision.options[0].assessment = { plan: 'No plan step', data_privacy: 'Customer data stays in Shopify', limits: 'Theme model bounds it' };
    assert.equal(axesForDecision(decision, fixture).length, before, 'writing "data" in an assessment must not earn a new axis');
  });

  test('a missing axis is named, with what it should have answered', () => {
    const decision = { topic: 'Theme', options: [{ option: 'Horizon', assessment: { plan: 'none' } }] };
    const errors = rubricErrors(decision, dtc, 'decision "Theme"');
    assert.equal(errors.length, 7, 'seven of the eight core axes are missing');
    assert.ok(errors.some((e) => /Cost to run is missing —/.test(e)));
    const empty = rubricErrors({ topic: 'Theme', options: [{ option: 'Horizon' }] }, dtc, 'x');
    assert.equal(empty.length, 1, 'an option with nothing gets one clear error, not eight');
    assert.match(empty[0], /"not applicable" is an answer, leaving it out is not/);
  });

  test('an axis that is not in the rubric is rejected', () => {
    const decision = { topic: 'Theme', options: [{ option: 'Horizon', assessment: { vibes: 'good' } }] };
    assert.ok(rubricErrors(decision, dtc, 'x').some((e) => /"vibes" is not one of the comparison axes/.test(e)));
  });

  test('the golden approach passes its own rubric', () => {
    const errors = approachQualityErrors(
      { ...JSON.parse(JSON.stringify(fixture.approach)), architecture_decisions: fixture.approach.architecture.decisions },
      fixture,
    ).filter((e) => /is missing —|every axis of the comparison/.test(e));
    assert.deepEqual(errors, [], 'the reference engagement is the example of the standard');
  });

  test('the comparison renders as a table: options across, axes down', () => {
    const decision = fixture.approach.architecture.decisions.find((d) => d.topic === 'Market topology');
    const table = comparisonTable(decision, fixture);
    assert.equal(table.columns.length, decision.options.length + 1);
    assert.equal(table.rows.length, axesForDecision(decision, fixture).length);
    for (const row of table.rows) assert.equal(row.length, table.columns.length, `row "${row[0]}" does not line up with the columns`);
    assert.ok(table.rows.every((r) => r.slice(1).every((cell) => cell && cell !== '—')), 'no gaps in the reference comparison');
  });

  test('the rubric travels to the model with what each axis asks', () => {
    const brief = rubricBrief(fixture);
    assert.equal(brief.length, axesFor(fixture).length);
    for (const entry of brief) assert.ok(entry.axis && entry.label && entry.asks);
  });
});
