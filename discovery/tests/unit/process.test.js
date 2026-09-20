/**
 * One engine, two processes: an RFP to answer, or a discovery to run.
 *
 * The engine must not notice which one it is — the offer, the gates and the exit
 * rules read the same answers either way. What the process decides is the order
 * of the steps and the words the consultant reads, and the records written
 * before the tool knew about processes must keep working.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { createSession } from '../../agents/interview/session.js';
import { processOf, processMeta, tabsFor, PROCESSES, PROCESS_IDS } from '../../service/process.js';
import { createDiscoveryService, ServiceError } from '../../service/index.js';
import { createMemoryStore } from '../../service/stores/memory-store.js';
import { preview } from '../../agents/interview/preview.js';

const TODAY = '2026-09-20';
const consultant = { login: 'lc-one', role: 'consultant' };

const consented = async (svc, client, process) => {
  await svc.startInterview(consultant, { client, language: 'en', mode: 'quick', process });
  await svc.answerQuestion(consultant, client, { question_id: 'Q10.5.2', values: { '/meta/consent/llm_processing': ['true'] } });
};

describe('one engine, two processes', () => {
  test('a session records which way Merkle came to the client, and defaults to a discovery', () => {
    assert.equal(createSession({ client: 'acme-watches', today: TODAY }).process, 'discovery');
    assert.equal(createSession({ client: 'acme-watches', process: 'rfp', today: TODAY }).process, 'rfp');
    assert.throws(() => createSession({ client: 'acme-watches', process: 'pitch', today: TODAY }), /Invalid process/);
  });

  test('records written before the tool knew about processes are discoveries, and nothing throws', () => {
    assert.equal(processOf(undefined), 'discovery', 'every existing engagement is what it always was');
    assert.equal(processOf(null), 'discovery');
    assert.equal(processOf('nonsense'), 'discovery', 'a bad value in one row must not take the whole list down');
    assert.equal(processOf('rfp'), 'rfp');
  });

  test('a bid and an engagement are the same record in different words', () => {
    assert.equal(processMeta('rfp').record, 'Bid');
    assert.equal(processMeta('discovery').record, 'Engagement');
    assert.notEqual(processMeta('rfp').document, processMeta('discovery').document);
    for (const id of PROCESS_IDS) {
      const m = PROCESSES[id];
      for (const key of ['label', 'record', 'start', 'document', 'lede']) assert.ok(m[key], `${id} needs ${key}`);
    }
  });

  test('both processes reach the same pages — only the order changes', () => {
    const paths = (p) => tabsFor(p).map((t) => t.path);
    assert.deepEqual([...paths('rfp')].sort(), [...paths('discovery')].sort(), 'neither process loses a page');
    assert.notDeepEqual(paths('rfp'), paths('discovery'), 'and they are not done in the same order');
    // On a bid the window to send questions closes, so they come before the summary.
    const rfp = paths('rfp');
    assert.ok(rfp.indexOf('clarifications') < rfp.indexOf('summary'));
    const disc = paths('discovery');
    assert.ok(disc.indexOf('summary') < disc.indexOf('clarifications'));
    assert.equal(rfp[0], '', 'both start where the answers come from');
    assert.equal(disc.at(-1), 'closing-document', 'and end with what goes out');
  });

  test('the process travels with the engagement, so every page can speak the right words', async () => {
    const svc = createDiscoveryService({ store: createMemoryStore(), today: () => TODAY });
    await consented(svc, 'a-bid', 'rfp');
    await consented(svc, 'a-discovery', 'discovery');
    const list = await svc.listEngagements(consultant);
    assert.equal(list.find((e) => e.client === 'a-bid').process, 'rfp');
    assert.equal(list.find((e) => e.client === 'a-discovery').process, 'discovery');
  });

  test('a record moves between processes without touching a single answer', async () => {
    const store = createMemoryStore();
    const svc = createDiscoveryService({ store, today: () => TODAY });
    await consented(svc, 'ricola-test', 'discovery');
    const before = await svc.getSummary(consultant, 'ricola-test');

    const moved = await svc.setProcess(consultant, 'ricola-test', { process: 'rfp' });
    assert.deepEqual({ ok: moved.ok, process: moved.process, was: moved.was }, { ok: true, process: 'rfp', was: 'discovery' });

    const after = await svc.getSummary(consultant, 'ricola-test');
    assert.equal(after.engagement.process, 'rfp');
    assert.deepEqual(after.engagement.offer, before.engagement.offer, 'the engine concludes the same thing either way');
    assert.deepEqual(after.engagement.coverage, before.engagement.coverage, 'nothing recorded has changed');
  });

  test('a bid that is won becomes an engagement and keeps everything it gathered', async () => {
    const svc = createDiscoveryService({ store: createMemoryStore(), today: () => TODAY });
    await consented(svc, 'ricola-test', 'rfp');
    await svc.registerDocument(consultant, 'ricola-test', { name: 'RFP-2024.pdf', type: 'rfp', summary: 'The brief' });
    await svc.saveClarifications(consultant, 'ricola-test', {
      questions: [{ question: 'One catalogue?', why_we_ask: 'It decides the store count.', covers: ['Q3.4.13'], assume_if_unanswered: 'One store with Markets.' }],
    });
    const before = await svc.getSummary(consultant, 'ricola-test');

    const won = await svc.markBidWon(consultant, 'ricola-test');
    assert.equal(won.process, 'discovery');
    assert.equal(won.won_at, TODAY);

    const after = await svc.getSummary(consultant, 'ricola-test');
    assert.equal(after.engagement.process, 'discovery');
    assert.deepEqual(after.engagement.won, { at: TODAY, from: 'rfp', by: 'lc-one' }, 'a win is dated, so it is never confused with a correction');
    assert.deepEqual(after.engagement.coverage, before.engagement.coverage, 'not one answer moved');

    // The whole point of never making a bid a separate object.
    const kept = await svc.getClarifications(consultant, 'ricola-test');
    assert.equal(kept.clarifications.questions.length, 1, 'the questions sent to the client survive the win');
    assert.equal(kept.documents[0].name, 'RFP-2024.pdf', 'so does the RFP itself');
  });

  test('only a bid can be won, and a record made a bid again is no longer won', async () => {
    const svc = createDiscoveryService({ store: createMemoryStore(), today: () => TODAY });
    await consented(svc, 'a-discovery', 'discovery');
    await assert.rejects(
      svc.markBidWon(consultant, 'a-discovery'),
      (err) => err instanceof ServiceError && err.status === 409,
      'an engagement cannot be won — it was never a bid',
    );

    await consented(svc, 'a-bid', 'rfp');
    await svc.markBidWon(consultant, 'a-bid');
    assert.ok((await svc.getSummary(consultant, 'a-bid')).engagement.won);
    await svc.setProcess(consultant, 'a-bid', { process: 'rfp' });
    assert.equal((await svc.getSummary(consultant, 'a-bid')).engagement.won, null, 'a record must not carry a win it does not have');
  });

  test('an unknown process is refused rather than silently stored', async () => {
    const svc = createDiscoveryService({ store: createMemoryStore(), today: () => TODAY });
    await consented(svc, 'demo-client', 'rfp');
    await assert.rejects(
      svc.setProcess(consultant, 'demo-client', { process: 'pitch' }),
      (err) => err instanceof ServiceError && err.status === 400,
    );
  });

  test('the engine does not read the process at all', () => {
    const asBid = createSession({ client: 'x-one', process: 'rfp', today: TODAY });
    const asDiscovery = createSession({ client: 'x-one', process: 'discovery', today: TODAY });
    assert.deepEqual(preview(asBid, TODAY), preview(asDiscovery, TODAY), 'the offer, the gates and the exit rules are blind to it');
  });
});
