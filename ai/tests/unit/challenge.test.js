/**
 * The adversarial pass: what a second expert would say, computed rather than
 * opined, so every criticism traces to a question id or a documented limit.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { challengeApproach, topChallenges } from '../../engine/challenge.js';
import { toApproachPayload } from '../../engine/approach.js';
import { deckErrors } from '../../shared/deck-template.js';

const fixture = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'fixtures', 'engagements', 'acme-watches.json'), 'utf8'));
const payload = () => toApproachPayload(fixture.approach);

describe('adversarial pass', () => {
  test('every finding traces to evidence, and the list stays small enough to act on', () => {
    const found = challengeApproach(payload(), fixture);
    assert.ok(found.length > 0 && found.length < 25, `${found.length} findings is either nothing or noise`);
    for (const f of found) {
      assert.ok(f.finding && f.why_it_matters && f.evidence, JSON.stringify(f));
      assert.ok(['high', 'medium'].includes(f.severity));
    }
    const top = topChallenges(found);
    assert.ok(top.length <= 12);
    assert.equal(top[0].severity, 'high', 'the worst finding is first');
  });

  test('it finds the alternative a decision dropped, against the option set we had already weighed', () => {
    const found = challengeApproach(payload(), fixture);
    const dropped = found.filter((f) => f.id.startsWith('dropped-alternative:'));
    assert.ok(dropped.length, 'the reference approach drops a documented option — that is the point of the check');
    assert.match(dropped[0].finding, /is not among the options the decision considered/);
  });

  test('it only complains about limits attached to answers the draft actually used', () => {
    const p = payload();
    const cited = new Set([...p.capability_map.flatMap((c) => c.question_ids ?? []), ...p.architecture_decisions.flatMap((d) => d.question_ids ?? [])]);
    for (const f of challengeApproach(p, fixture).filter((x) => x.id.startsWith('unaddressed-limit:'))) {
      const id = f.id.split(':')[1];
      assert.ok(cited.has(id), `${id} is not cited in the draft, so complaining about its limit is noise`);
    }
  });

  test('an assumption with consequences and no risk behind it is raised', () => {
    const found = challengeApproach(payload(), fixture);
    const uncovered = found.filter((f) => f.id.startsWith('uncovered-assumption:'));
    assert.ok(uncovered.length, 'the topology assumptions carry an impact and no risk names them');
    assert.match(uncovered[0].why_it_matters, /nobody is watching/);
  });

  test('it notices when the arithmetic was available and the argument stayed vague', () => {
    const vague = { capability_map: [], architecture_decisions: [], risk_register: [], assumptions: [] };
    const found = challengeApproach(vague, fixture);
    assert.ok(found.some((f) => f.id === 'unused-arithmetic'));
  });

  test('an open flag the draft never refers to is raised at the severity of the flag', () => {
    const found = challengeApproach({ capability_map: [], architecture_decisions: [] }, fixture);
    const flags = found.filter((f) => f.id.startsWith('unanswered-flag:'));
    assert.ok(flags.length, 'the reference engagement has open flags');
    assert.ok(flags.every((f) => ['high', 'medium'].includes(f.severity)));
  });

  test('a clean draft is not challenged for the sake of it', () => {
    const empty = challengeApproach({ capability_map: [], architecture_decisions: [] }, { markets: {}, exits: { items: [] } });
    assert.deepEqual(empty, []);
  });

  test('the deck has to answer a high finding, or it is rejected', () => {
    const doc = structuredClone(fixture);
    const deck = { slides: [{ layout: 'title', client: 'ACME', project: 'Discovery', subtitle: 'x', date: '2026-09-18' }] };
    const errors = deckErrors(deck, doc);
    assert.ok(errors.some((e) => /does not answer a challenge the engine raised/.test(e)), errors.slice(0, 3).join(' | '));
  });
});
