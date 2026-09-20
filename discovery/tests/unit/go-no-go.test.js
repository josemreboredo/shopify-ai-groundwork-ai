/**
 * The architect's side of Merkle's Go/No-Go scorecard.
 *
 * The scorecard has twenty-eight numbered questions and the meeting works
 * through them in order. The tool answers the ones it can evidence from the RFP
 * and the engine, and names an owner for the rest — the important property being
 * that no question quietly disappears. A page that skips nineteen of them looks
 * like a page that forgot them, and the number nobody notices missing is the one
 * that loses the bid.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { goNoGoView } from '../../service/go-no-go.js';

const fixture = (name) => JSON.parse(fs.readFileSync(new URL(`../fixtures/engagements/${name}.json`, import.meta.url), 'utf8'));
const coverage = { required_answered: 62, required_total: 85 };
const view = (name = 'acme-watches', opts = {}) => goNoGoView(fixture(name), coverage, null, opts);

describe('go/no-go support', () => {
  test('every one of the 28 scorecard questions is accounted for, exactly once', () => {
    const v = view();
    const answered = v.sections.flatMap((s) => s.questions.map((q) => q.n));
    const numbers = [v.headline.n, ...answered, ...v.not_ours.map((q) => q.n)].sort((a, b) => a - b);
    assert.equal(numbers.length, 28, 'the scorecard has 28 questions and all 28 appear');
    assert.deepEqual(numbers, Array.from({ length: 28 }, (_, i) => i + 1), 'none missing, none twice');
  });

  test('question 20 is the headline, because it is the architect’s question', () => {
    const v = view();
    assert.equal(v.headline.n, 20);
    assert.match(v.headline.ask, /can we grasp a scope that can be estimated/i);
    assert.ok(['enough to price', 'priceable with stated assumptions', 'not enough to price without asking'].includes(v.headline.verdict));
  });

  test('the verdict is banded, never a score', () => {
    assert.equal(typeof view().headline.verdict, 'string');
    const thin = goNoGoView(fixture('acme-watches'), { required_answered: 12, required_total: 85 }, null);
    assert.equal(thin.headline.verdict, 'not enough to price without asking');
    const full = goNoGoView(fixture('acme-watches'), { required_answered: 85, required_total: 85 }, null);
    assert.ok(full.headline.verdict !== 'not enough to price without asking');
  });

  test('every question it answers says something, and the evidence is the engine’s own', () => {
    const v = view();
    const gates = Object.entries(fixture('acme-watches').offer.scope_gates).filter(([, g]) => g.active);
    for (const section of v.sections) {
      assert.ok(section.title && section.questions.length, `${section.id} is a real section`);
      for (const q of section.questions) {
        assert.ok(q.says && q.says.length > 20, `Q${q.n} says something a person can read`);
        assert.ok(Array.isArray(q.detail));
      }
    }
    const capabilities = v.sections[0].questions[0].detail;
    assert.equal(capabilities.length, gates.length, 'the capabilities are the gates the engine fired, not a new list');
    for (const c of capabilities) assert.ok(c.evidence, 'each one carries the answer that proves it');
  });

  test('what the tool cannot see is named with who owns it, not left blank', () => {
    const v = view();
    assert.equal(v.not_ours.length, 19);
    for (const q of v.not_ours) {
      assert.ok(q.ask && q.owner, `Q${q.n} names an owner`);
    }
    assert.ok(v.not_ours.some((q) => /Salesforce|revenue|competitor|buying centre|pitch team/i.test(q.ask) || q.owner));
  });

  test('capacity is answered as demand, and says plainly that supply is somebody else’s', () => {
    const q3 = view().sections[0].questions.find((q) => q.n === 3);
    assert.match(q3.says, /weeks of build/);
    assert.match(q3.watch, /demand only/i, 'the tool knows the work, not who is free');
    assert.match(q3.watch, /Delivery Lead/);
  });

  test('Merkle’s commercial band travels only to owners', () => {
    const q4 = (opts) => goNoGoView(fixture('acme-watches'), coverage, null, opts).sections[1].questions.find((q) => q.n === 4);
    assert.match(q4({ pricing: true }).says, /EUR 65k–100k/);
    assert.ok(!/65k/.test(q4({}).says), 'a consultant without pricing rights never sees the band');
    assert.match(q4({}).says, /shown to engagement leads/);
  });

  test('an engagement beyond the offers says so rather than sizing work it cannot size', () => {
    const v = view('stop-custom-checkout');
    const q2 = v.sections[0].questions.find((q) => q.n === 2);
    const q3 = v.sections[0].questions.find((q) => q.n === 3);
    assert.match(q2.says, /beyond S\/M\/L|built from scratch/i);
    assert.match(q3.says, /Not sizeable/i);
  });
});
