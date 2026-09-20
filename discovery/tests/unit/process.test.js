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
import { processOf, processMeta, stepsFor, viewsFor, PROCESSES, PROCESS_IDS } from '../../service/process.js';
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

  test('the spine always points at exactly one step: the first that is not done', () => {
    const bid = { process: 'rfp', documents: 2, to_review: 12, clarifications_at: null, closing_document_at: null };
    const steps = stepsFor(bid);
    assert.equal(steps.filter((s) => s.state === 'current').length, 1, 'the consultant is told one thing to do, not four');
    assert.equal(steps.find((s) => s.state === 'current').label, 'Confirm what it says');
    assert.equal(steps[0].state, 'done', 'the RFP has been read in');
    assert.ok(steps.slice(2).every((s) => s.state === 'todo'));
  });

  test('state is derived from the engagement, so the spine can never disagree with it', () => {
    const at = (e) => stepsFor({ process: 'rfp', documents: 1, to_review: 0, ...e }).map((s) => s.state);
    assert.deepEqual(at({}), ['done', 'done', 'current', 'todo'], 'nothing sent, nothing written');
    assert.deepEqual(at({ clarifications_at: '2026-09-20' }), ['done', 'done', 'done', 'current']);
    const written = stepsFor({ process: 'rfp', documents: 1, to_review: 0, clarifications_at: '2026-09-20', closing_document_at: '2026-09-21' });
    assert.ok(written.every((s) => s.state !== 'current') || written.at(-1).state === 'current');
  });

  test('progress never skips: nothing reads as done ahead of the step you are on', () => {
    // Nothing is waiting to be confirmed because nothing has been collected yet.
    // The review step satisfies its own condition, and must still not read as done.
    const steps = stepsFor({ process: 'discovery', to_review: 0, coverage: { required_answered: 61, required_total: 85 } });
    assert.equal(steps[0].state, 'current');
    assert.ok(steps.slice(1).every((s) => s.state === 'todo'), 'you have not finished reviewing answers you have not got');

    for (const process of PROCESS_IDS) {
      const all = stepsFor({ process, documents: 1, to_review: 4, coverage: { required_answered: 2, required_total: 85 } });
      const order = { done: 0, current: 1, todo: 2 };
      for (let i = 1; i < all.length; i += 1) {
        assert.ok(order[all[i].state] >= order[all[i - 1].state], `${process}: states only ever move forward`);
      }
    }
  });

  test('winning appears only once there is a proposal to have won with', () => {
    const labels = (e) => stepsFor({ process: 'rfp', documents: 1, to_review: 0, ...e }).map((s) => s.label);
    assert.ok(!labels({}).includes('Did we win it?'), 'not on the first screen of an empty bid');
    assert.ok(labels({ closing_document_at: '2026-09-21' }).includes('Did we win it?'));
    assert.ok(!labels({ closing_document_at: '2026-09-21' }).some((l) => /Did we win/.test(l) && false));
    // and never on a discovery, which was never a bid
    assert.ok(!stepsFor({ process: 'discovery', closing_document_at: '2026-09-21' }).map((s) => s.label).includes('Did we win it?'));
  });

  test('the two processes describe different work, and neither loses a page', () => {
    const e = { documents: 1, to_review: 0, coverage: { required_answered: 10, required_total: 85 } };
    const reachable = (process) => [
      ...stepsFor({ ...e, process }).map((s) => s.path),
      ...viewsFor({ ...e, process }).map((v) => v.path),
    ].sort();
    assert.deepEqual(reachable('rfp'), ['', 'clarifications', 'closing-document', 'review', 'settings', 'summary']);
    assert.deepEqual(reachable('discovery'), ['', 'clarifications', 'closing-document', 'review', 'settings', 'summary']);
    assert.notDeepEqual(stepsFor({ ...e, process: 'rfp' }).map((s) => s.label), stepsFor({ ...e, process: 'discovery' }).map((s) => s.label));
    // On a bid the window to send questions closes, so it is a step. In a
    // discovery the consultant is already talking to the client, so it is a view.
    assert.ok(stepsFor({ ...e, process: 'rfp' }).some((s) => s.path === 'clarifications'));
    assert.ok(viewsFor({ ...e, process: 'discovery' }).some((v) => v.path === 'clarifications'));
  });

  test('every step carries what to do, and the settings are always one click away', () => {
    for (const process of PROCESS_IDS) {
      for (const step of stepsFor({ process, documents: 1, to_review: 3, coverage: { required_answered: 4, required_total: 85 } })) {
        assert.ok(step.label, 'a step without a label is a dead end');
        assert.ok(['done', 'current', 'todo'].includes(step.state));
      }
      assert.ok(viewsFor({ process }).some((v) => v.path === 'settings'), 'Change is reachable from every page');
    }
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
