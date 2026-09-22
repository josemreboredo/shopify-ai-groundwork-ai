/**
 * What happened to the bid.
 *
 * The tool could record a win and nothing else — not a loss, not a submission,
 * not a decision to walk away — so the one dataset only Merkle can accumulate
 * was thrown away on every engagement. Every number this tool quotes rests on
 * the offering rather than on a delivered project, because there has not been
 * one; this is what eventually fixes that.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { record, ledger, OUTCOMES, OUTCOME_IDS, outcomesFor } from '../../shared/outcome.js';
import { createDiscoveryService, ServiceError } from '../../shared/index.js';
import { createMemoryStore } from '../../shared/stores/memory-store.js';

const TODAY = '2026-09-20';
const consultant = { login: 'lc-one', role: 'consultant' };

describe('the outcome ledger', () => {
  test('each process can end every way that process actually ends', () => {
    assert.deepEqual(OUTCOME_IDS, ['submitted', 'won', 'lost', 'no_bid', 'withdrawn', 'delivered', 'cancelled']);
    for (const id of OUTCOME_IDS) {
      assert.ok(OUTCOMES[id].label && OUTCOMES[id].meaning, `${id} says what it means`);
    }
    // Offering "The proposal went to the client" on work Merkle already has is
    // how a form tells a consultant it has not understood them.
    assert.deepEqual(Object.keys(outcomesFor('rfp')), ['submitted', 'won', 'lost', 'no_bid', 'withdrawn']);
    assert.deepEqual(Object.keys(outcomesFor('discovery')), ['withdrawn', 'delivered', 'cancelled']);
  });

  test('a submission is still in play; the rest close it', () => {
    const at = { by: 'lc-one', at: TODAY };
    assert.equal(record({}, { outcome: 'submitted' }, at).closed, false);
    for (const outcome of ['won', 'lost', 'no_bid', 'withdrawn']) {
      assert.equal(record({}, { outcome }, at).closed, true, outcome);
    }
  });

  test('the engine’s position is frozen with it', () => {
    // A year from now the question is what the engine said at the time, not what
    // it says once the engagement has moved on.
    const r = record({}, { outcome: 'submitted', submitted_price: 88000, currency: 'EUR' }, {
      by: 'lc-one',
      at: TODAY,
      offer: { code: 'M', go: true, route: null },
      position: { verdict: 'go, but ask', assumptions: 5, decisions_settled: 28 },
    });
    const [entry] = r.history;
    assert.deepEqual(entry.as_at, { offer: 'M', within_offers: true, route: null, verdict: 'go, but ask', assumptions: 5, decisions_settled: 28 });
    assert.equal(entry.submitted_price, 88000);
    assert.equal(entry.by, 'lc-one');
  });

  test('nothing is overwritten — every step is kept', () => {
    const first = record({}, { outcome: 'submitted' }, { by: 'lc-one', at: TODAY });
    const second = record({ outcome: first }, { outcome: 'lost', note: 'price' }, { by: 'lc-one', at: '2026-10-02' });
    assert.equal(second.history.length, 2);
    assert.equal(second.current, 'lost');
    assert.equal(second.history[1].note, 'price');
  });

  test('a hit rate is withheld until it means something, and the gap is stated', () => {
    // A rate out of four is a number a meeting will quote and nothing supports.
    const few = ledger([{ outcome: 'won' }, { outcome: 'lost' }, { outcome: 'won' }]);
    assert.equal(few.hit_rate, null);
    assert.equal(few.needs, 7);
    assert.match(few.why_not_yet, /nothing supports/);

    const enough = ledger(Array.from({ length: 12 }, (_, i) => ({ outcome: i < 4 ? 'won' : 'lost' })));
    assert.deepEqual(enough.hit_rate, { of: 12, won: 4 });
    assert.equal(enough.why_not_yet, null);
  });

  test('a no-bid counts as recorded but never as a loss', () => {
    const l = ledger([{ outcome: 'no_bid' }, { outcome: 'won' }, { outcome: 'lost' }]);
    assert.equal(l.counts.no_bid, 1);
    assert.equal(l.closed, 3, 'it closes the bid');
    assert.equal(l.needs, 8, 'but only won and lost move a hit rate');
  });

  test('the position it freezes is the engine\u2019s, not the caller\u2019s', async () => {
    // The unit test above passes a verdict in and asserts it comes back, which
    // is true of anything and was why the production path recording no verdict
    // at all went unnoticed for as long as it existed.
    const svc = createDiscoveryService({ store: createMemoryStore(), today: () => TODAY });
    await svc.startInterview(consultant, { client: 'a-bid', language: 'en', mode: 'quick', process: 'rfp' });
    await svc.answerQuestion(consultant, 'a-bid', { question_id: 'Q10.5.2', values: { '/meta/consent/llm_processing': ['true'] } });
    const r = await svc.recordOutcome(consultant, 'a-bid', { outcome: 'submitted' });
    const [entry] = r.history;
    assert.ok('as_at' in entry, 'something is frozen with it');
    // On an engagement too thin for the engine to decide there is no position to
    // freeze, and the record says so rather than inventing one.
    assert.deepEqual(entry.as_at, {});
  });

  test('a price that is not a number is refused, not stored as null', async () => {
    const svc = createDiscoveryService({ store: createMemoryStore(), today: () => TODAY });
    await svc.startInterview(consultant, { client: 'a-bid', language: 'en', mode: 'quick', process: 'rfp' });
    await svc.answerQuestion(consultant, 'a-bid', { question_id: 'Q10.5.2', values: { '/meta/consent/llm_processing': ['true'] } });
    // "abc" became NaN, passed the !== undefined guard and was serialised as
    // null — a hole in the one record that exists to be counted later.
    await assert.rejects(
      svc.recordOutcome(consultant, 'a-bid', { outcome: 'submitted', submitted_price: Number('abc') }),
      (err) => err instanceof ServiceError && err.status === 400,
    );
    await assert.rejects(
      svc.recordOutcome(consultant, 'a-bid', { outcome: 'submitted', submitted_price: -5 }),
      (err) => err instanceof ServiceError && err.status === 400,
    );
  });

  test('the service records it against the engagement, and refuses an invented outcome', async () => {
    const svc = createDiscoveryService({ store: createMemoryStore(), today: () => TODAY });
    await svc.startInterview(consultant, { client: 'a-bid', language: 'en', mode: 'quick', process: 'rfp' });
    await svc.answerQuestion(consultant, 'a-bid', { question_id: 'Q10.5.2', values: { '/meta/consent/llm_processing': ['true'] } });

    await svc.recordOutcome(consultant, 'a-bid', { outcome: 'submitted', submitted_price: 88000, currency: 'EUR' });
    const lost = await svc.recordOutcome(consultant, 'a-bid', { outcome: 'lost', note: 'incumbent retained' });
    assert.equal(lost.current, 'lost');
    assert.equal(lost.history.length, 2);
    assert.equal((await svc.getSummary(consultant, 'a-bid')).engagement.outcome, 'lost');

    await assert.rejects(
      svc.recordOutcome(consultant, 'a-bid', { outcome: 'maybe' }),
      (err) => err instanceof ServiceError && err.status === 400,
    );
  });

  test('the ledger reads across engagements, and says what it cannot say yet', async () => {
    const svc = createDiscoveryService({ store: createMemoryStore(), today: () => TODAY });
    for (const [client, outcome] of [['bid-one', 'won'], ['bid-two', 'lost']]) {
      await svc.startInterview(consultant, { client, language: 'en', mode: 'quick', process: 'rfp' });
      await svc.answerQuestion(consultant, client, { question_id: 'Q10.5.2', values: { '/meta/consent/llm_processing': ['true'] } });
      await svc.recordOutcome(consultant, client, { outcome });
    }
    const l = await svc.getLedger(consultant);
    assert.equal(l.recorded, 2);
    assert.equal(l.counts.won, 1);
    assert.equal(l.counts.lost, 1);
    assert.equal(l.hit_rate, null, 'two bids is not a hit rate');
  });
});
