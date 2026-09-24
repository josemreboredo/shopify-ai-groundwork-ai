/**
 * The questions Merkle sends back after reading an RFP.
 *
 * Two properties are worth pinning. The engine must only ask about unknowns that
 * actually move the proposal — a long list of discovery questions on a bid says
 * we did not read the client's document. And the client-facing document must
 * never carry what we would assume if they stay silent: an assumption shown
 * before the answer invites the client to accept it instead of answering.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { clarificationTopics, clarificationBrief } from '../../bid/clarifications.js';
import { renderClarificationsMarkdown } from '../../shared/clarifications-view.js';
import { clarificationsFreshness, repliesReceived, replyPrompt, statedAssumptions, shapeChangingIds, changesShape } from '../../shared/assumptions.js';
import { createDiscoveryService, ServiceError } from '../../shared/index.js';
import { createMemoryStore } from '../../shared/stores/memory-store.js';
import { questionBank } from '../../schema/index.js';
import { conditionMet } from '../../engagement/next.js';

const TODAY = '2026-09-20';
const consultant = { login: 'lc-one', role: 'consultant' };
const acme = () => JSON.parse(fs.readFileSync(new URL('../fixtures/engagements/acme-watches.json', import.meta.url), 'utf8'));

const QUESTION = {
  id: 'q1',
  status: 'accepted',
  question: 'Will the Swiss and EU stores sell the same catalogue at the same prices?',
  why_we_ask: 'Shopify Markets serves several countries from one store; genuinely different catalogues need separate stores, which changes the build and the running cost.',
  covers: ['Q3.4.13', 'Q6.2.14'],
  assume_if_unanswered: 'One store with Shopify Markets.',
  impact_if_wrong: 'A second catalogue forces a second store and moves the plan to Plus.',
};

describe('clarification questions (RFP)', () => {
  test('the engine asks only about unknowns that move the proposal, grouped by subject', () => {
    const topics = clarificationTopics(acme());
    assert.ok(topics.length > 0, 'an engagement with open items has something worth asking');
    // No ceiling here on purpose. A constant deciding how many questions matter
    // was truncating topics that move the price into assumptions nobody chose;
    // the Lead Consultant is the ceiling, and every cut they make is recorded.
    assert.ok(topics.every((t) => t.changes.length), 'but nothing that moves nothing gets in');
    for (const topic of topics) {
      assert.ok(topic.covers.length >= 1, `${topic.topic} covers at least one discovery question`);
      assert.ok(topic.changes.length >= 1, `${topic.topic} says what the answer changes — that is the whole entry condition`);
      assert.ok(topic.title, 'every topic is named by its question-bank section');
    }
  });

  test('a topic never claims to move something none of its questions feed', () => {
    const doc = acme();
    const byId = new Map(questionBank.questions.map((q) => [q.id, q]));
    const openInputs = new Set((doc.markets?.topology?.open_inputs ?? []).map((o) => o.question_id));
    for (const topic of clarificationTopics(doc)) {
      const ids = topic.covers.map((c) => c.question_id);
      const feeds = ids.flatMap((id) => byId.get(id)?.feeds ?? []);
      if (topic.changes.includes('how many stores the markets run on')) {
        assert.ok(ids.some((id) => openInputs.has(id)), `${topic.topic} claims topology, so one of its questions must be a topology open input`);
      }
      if (topic.changes.includes('the Shopify plan')) {
        assert.ok(feeds.includes('exit:11.1'), `${topic.topic} claims the plan, so one of its questions must feed the plan rule`);
      }
    }
  });

  test('"high" is kept for what changes the shape of the solution, not for everything that matters', () => {
    for (const topic of clarificationTopics(acme())) {
      if (topic.impact !== 'high') continue;
      const shape = topic.changes.includes('how many stores the markets run on') || topic.changes.includes('the size of the engagement');
      const swing = topic.covers.some((c) => c.swing === 'high');
      assert.ok(shape || swing, `${topic.title} is graded high, so it must change the store topology or the size of the engagement`);
    }
  });

  test('what the documents never covered is a candidate too, not only what the engine noted', () => {
    const doc = acme();
    // On a bid the Q&A runs before the approach exists, so open_items is empty
    // and the topics used to come almost entirely from the topology engine. A
    // required question the RFP never touched was neither asked nor assumed.
    const withoutApproach = structuredClone(doc);
    delete withoutApproach.approach;
    const before = clarificationTopics(doc).map((t) => t.topic).sort();
    const after = clarificationTopics(withoutApproach).map((t) => t.topic).sort();
    assert.ok(after.length >= before.length - 1, 'a bid sees essentially what a discovery sees');
    assert.ok(after.length > 3, 'and far more than the topology engine alone produced');
  });

  test('"what the document did not cover" needs a document — an empty engagement asks nothing', () => {
    assert.deepEqual(clarificationTopics({}), [], 'nobody drafts questions for an RFP no one has opened');
  });

  test('the questions are ordered by how much of the proposal each one unlocks', () => {
    const topics = clarificationTopics(acme()).filter((t) => t.impact === 'high');
    for (let i = 1; i < topics.length; i += 1) {
      assert.ok(topics[i - 1].covers.length >= topics[i].covers.length, 'a question that settles more unknowns comes first');
    }
  });

  test('the highest-impact topic comes first, and the brief carries what cannot be priced', () => {
    const brief = clarificationBrief(acme());
    assert.equal(brief.topics[0].impact, 'high');
    assert.ok(Array.isArray(brief.cannot_price_until_answered));
    assert.ok(!brief.cannot_price_until_answered.some((i) => /plan price/i.test(i)), 'Shopify plan prices are not in this repository, so they are never listed as a missing input');
  });

  test('the document that goes to the client carries the question and the trade-off, and nothing else', () => {
    const md = renderClarificationsMarkdown({ client: 'ricola-ag' }, { saved_at: TODAY, by: 'lc-one', questions: [QUESTION] });
    assert.match(md, /Will the Swiss and EU stores/);
    assert.match(md, /\*\*Why we ask\.\*\*/);
    assert.ok(!md.includes('Q3.4.13'), 'discovery question ids mean nothing to a client');
    assert.ok(!md.includes('One store with Shopify Markets.'), 'what we would assume is never shown before they answer');
    assert.ok(!/do not send/i.test(md), 'the client copy is not marked internal');
    assert.match(md, /^# Clarification questions — Ricola AG$/m, 'the company form keeps its own capitalisation');
  });

  test('only what the Lead Consultant accepted leaves the building', () => {
    const questions = [
      { ...QUESTION, id: 'q1', status: 'accepted' },
      { ...QUESTION, id: 'q2', status: 'proposed', question: 'Still being decided?' },
      { ...QUESTION, id: 'q3', status: 'rejected', question: 'Decided not to ask?' },
    ];
    const sent = renderClarificationsMarkdown({ client: 'ricola-ag' }, { saved_at: TODAY, questions });
    assert.match(sent, /Will the Swiss and EU stores/, 'the accepted one goes');
    assert.ok(!sent.includes('Still being decided?'), 'a draft is not a question to a client');
    assert.ok(!sent.includes('Decided not to ask?'), 'and one we chose not to ask is an assumption, not a question');

    const internal = renderClarificationsMarkdown({ client: 'ricola-ag' }, { saved_at: TODAY, questions }, { internal: true });
    for (const q of questions) assert.ok(internal.includes(q.question), 'the internal copy keeps all three, with what happened to each');
    assert.match(internal, /Not asked — stated as an assumption instead/);
  });

  test('nothing accepted means nothing to send, said plainly', () => {
    const md = renderClarificationsMarkdown({ client: 'ricola-ag' }, { saved_at: TODAY, questions: [{ ...QUESTION, status: 'proposed' }] });
    assert.match(md, /No questions have been accepted yet/);
  });

  test('the internal copy carries both, and says it must not be sent', () => {
    const md = renderClarificationsMarkdown({ client: 'ricola-ag' }, { saved_at: TODAY, by: 'lc-one', questions: [QUESTION] }, { internal: true });
    assert.match(md, /do not send/i);
    assert.match(md, /Covers Q3\.4\.13, Q6\.2\.14/);
    assert.match(md, /One store with Shopify Markets\./);
  });

  test('a question without its trade-off or its assumption is refused', async () => {
    const svc = createDiscoveryService({ store: createMemoryStore(), today: () => TODAY });
    await svc.startInterview(consultant, { client: 'demo-client', language: 'en', mode: 'quick' });
    await svc.answerQuestion(consultant, 'demo-client', { question_id: 'Q10.5.2', values: { '/meta/consent/llm_processing': ['true'] } });

    await assert.rejects(
      svc.saveClarifications(consultant, 'demo-client', { questions: [{ question: 'Anything?', why_we_ask: '', covers: [], assume_if_unanswered: '', impact_if_wrong: '' }] }),
      (err) => err instanceof ServiceError && err.status === 400 && err.errors.length === 4,
    );
    await assert.rejects(
      svc.saveClarifications(consultant, 'demo-client', { questions: [] }),
      (err) => err instanceof ServiceError && err.status === 400,
    );
  });

  test('saved questions come back with the engagement, ready to render', async () => {
    const svc = createDiscoveryService({ store: createMemoryStore(), today: () => TODAY });
    await svc.startInterview(consultant, { client: 'demo-client', language: 'en', mode: 'quick' });
    await svc.answerQuestion(consultant, 'demo-client', { question_id: 'Q10.5.2', values: { '/meta/consent/llm_processing': ['true'] } });

    const empty = await svc.getClarifications(consultant, 'demo-client');
    assert.equal(empty.clarifications, null, 'nothing saved yet is not an error');
    assert.equal(empty.engagement.client, 'demo-client');

    await svc.saveClarifications(consultant, 'demo-client', { questions: [QUESTION] }, { via: 'claude' });
    const saved = await svc.getClarifications(consultant, 'demo-client');
    assert.equal(saved.clarifications.questions.length, 1);
    assert.equal(saved.clarifications.by, 'lc-one');
    assert.equal(saved.clarifications.saved_at, TODAY);
    // Saved is not sent. The fixture carries status: 'accepted' and the service
    // ignores it — a payload that could set its own status is a question in
    // front of a client on an approval nobody gave.
    assert.equal(saved.clarifications.questions[0].status, 'proposed');
    assert.ok(!/Why we ask/.test(renderClarificationsMarkdown(saved.engagement, saved.clarifications)), 'nothing to send yet');

    await svc.decideClarifications(consultant, 'demo-client', { id: 'q1', status: 'accepted' });
    const decided = await svc.getClarifications(consultant, 'demo-client');
    assert.match(renderClarificationsMarkdown(decided.engagement, decided.clarifications), /Why we ask/);
  });

  test('an engagement with nothing recorded is told to read the RFP in first, not handed an empty list', async () => {
    const svc = createDiscoveryService({ store: createMemoryStore(), today: () => TODAY });
    await svc.startInterview(consultant, { client: 'demo-client', language: 'en', mode: 'quick' });
    await svc.answerQuestion(consultant, 'demo-client', { question_id: 'Q10.5.2', values: { '/meta/consent/llm_processing': ['true'] } });
    await assert.rejects(
      svc.prepareClarifications(consultant, 'demo-client'),
      (err) => err instanceof ServiceError && (err.status === 400 || err.status === 409) && (err.blockers ?? []).length > 0,
      'the consultant gets something to do, not an empty page',
    );
  });
});

describe('asking or assuming, one or the other', () => {
  const started = async (svc, questions) => {
    await svc.startInterview(consultant, { client: 'a-bid', language: 'en', mode: 'quick', process: 'rfp' });
    await svc.answerQuestion(consultant, 'a-bid', { question_id: 'Q10.5.2', values: { '/meta/consent/llm_processing': ['true'] } });
    await svc.saveClarifications(consultant, 'a-bid', { questions });
    return svc;
  };
  const three = [
    { ...QUESTION, question: 'One catalogue?' },
    { ...QUESTION, question: 'Who invoices?' },
    { ...QUESTION, question: 'B2B in phase one?' },
  ].map(({ status, id, ...q }) => q);

  test('every question arrives undecided — the model drafts, the consultant sends', async () => {
    const svc = await started(createDiscoveryService({ store: createMemoryStore(), today: () => TODAY }), three);
    const { clarifications, triage } = await svc.getClarifications(consultant, 'a-bid');
    assert.deepEqual(clarifications.questions.map((q) => q.status), ['proposed', 'proposed', 'proposed']);
    assert.deepEqual(clarifications.questions.map((q) => q.id), ['q1', 'q2', 'q3'], 'each one is addressable on its own');
    assert.equal(triage.ready_to_send, false, 'a half-triaged list is the worst of both');
  });

  test('a rejected question does not vanish — it becomes what the proposal states', async () => {
    const svc = await started(createDiscoveryService({ store: createMemoryStore(), today: () => TODAY }), three);
    await svc.decideClarifications(consultant, 'a-bid', { id: 'q1', status: 'accepted' });
    await svc.decideClarifications(consultant, 'a-bid', { id: 'q2', status: 'rejected' });
    const { triage, assumptions } = await svc.getClarifications(consultant, 'a-bid');
    assert.equal(triage.accepted.length, 1);
    assert.equal(triage.rejected.length, 1);
    assert.equal(triage.proposed.length, 1);
    assert.ok(assumptions.some((a) => a.source === 'rejected' && a.assumed === QUESTION.assume_if_unanswered),
      'choosing not to ask is choosing to assume, and it is written down');
    assert.equal(triage.ready_to_send, false, 'one is still undecided');
  });

  test('all of them at once, because triaging eight questions one by one is how it stops being done', async () => {
    const svc = await started(createDiscoveryService({ store: createMemoryStore(), today: () => TODAY }), three);
    const r = await svc.decideClarifications(consultant, 'a-bid', { all: true, status: 'accepted' });
    assert.deepEqual({ accepted: r.accepted, rejected: r.rejected, proposed: r.proposed }, { accepted: 3, rejected: 0, proposed: 0 });
    assert.equal((await svc.getClarifications(consultant, 'a-bid')).triage.ready_to_send, true);
  });

  test('a decision on a question that is not there, or a status that is not real, is refused', async () => {
    const svc = await started(createDiscoveryService({ store: createMemoryStore(), today: () => TODAY }), three);
    await assert.rejects(svc.decideClarifications(consultant, 'a-bid', { id: 'q9', status: 'accepted' }), (e) => e instanceof ServiceError && e.status === 404);
    await assert.rejects(svc.decideClarifications(consultant, 'a-bid', { id: 'q1', status: 'maybe' }), (e) => e instanceof ServiceError && e.status === 400);
  });
});

describe('what the Lead Consultant decides not to ask reaches the proposal', () => {
  const bid = async () => {
    const svc = createDiscoveryService({ store: createMemoryStore(), today: () => TODAY });
    await svc.startInterview(consultant, { client: 'a-bid', language: 'en', mode: 'quick', process: 'rfp' });
    await svc.answerQuestion(consultant, 'a-bid', { question_id: 'Q10.5.2', values: { '/meta/consent/llm_processing': ['true'] } });
    await svc.saveClarifications(consultant, 'a-bid', { questions: [QUESTION] });
    return svc;
  };

  test('a rejected question becomes an assumption with a consequence and an owner', async () => {
    const svc = await bid();
    await svc.decideClarifications(consultant, 'a-bid', { id: 'q1', status: 'rejected' });
    const { assumptions } = await svc.getClarifications(consultant, 'a-bid');
    const chosen = assumptions.find((a) => a.source === 'rejected');
    assert.equal(chosen.assumed, QUESTION.assume_if_unanswered);
    // The one assumption a person chose used to be the only one with no
    // consequence stated, which is backwards — the engine's are forced, this
    // one was a decision, and a client prices an assumption without a
    // consequence as a gap.
    assert.equal(chosen.impact_if_wrong, QUESTION.impact_if_wrong);
    assert.equal(chosen.owner, 'lc-one');
  });

  test('a question with no stated consequence is refused at the door', async () => {
    const svc = createDiscoveryService({ store: createMemoryStore(), today: () => TODAY });
    await svc.startInterview(consultant, { client: 'a-bid', language: 'en', mode: 'quick', process: 'rfp' });
    await svc.answerQuestion(consultant, 'a-bid', { question_id: 'Q10.5.2', values: { '/meta/consent/llm_processing': ['true'] } });
    const { impact_if_wrong: _dropped, ...incomplete } = QUESTION;
    await assert.rejects(
      svc.saveClarifications(consultant, 'a-bid', { questions: [incomplete] }),
      (err) => err instanceof ServiceError && err.errors.some((e) => /costs us if that assumption is wrong/.test(e)),
    );
  });

  test('it travels into the deck the proposal is written from', async () => {
    const { deckBrief } = await import('../../shared/closing.js');
    const doc = acme();
    const stated = [{ about: 'Who invoices?', assumed: 'All markets sell through one entity', impact_if_wrong: 'A second entity forces expansion stores', owner: 'lc-one', source: 'rejected' }];
    // This is the bug the whole step existed to prevent: three screens of
    // ceremony deciding an assumption register, and one missing argument
    // between the service and the deck, so the proposal stated none of it.
    assert.ok(!deckBrief(doc).deck_xml.includes('All markets sell through one entity'));
    const xml = deckBrief(doc, { assumptions: stated }).deck_xml;
    assert.ok(xml.includes('All markets sell through one entity'));
    assert.ok(xml.includes('A second entity forces expansion stores'), 'with what it costs to be wrong');
    assert.ok(/owner="lc-one"/.test(xml), 'and who decided it');
  });

  test('a bid is not told to write a Discovery Closing Document', async () => {
    const { deckGuide } = await import('../../shared/closing.js');
    const discovery = deckGuide();
    const bidGuide = deckGuide({ process: 'rfp' });
    assert.match(discovery, /^You are a senior Shopify solutions consultant at Merkle closing a discovery engagement/);
    assert.match(bidGuide, /^\*\*This is a bid, not a discovery\.\*\*/);
    assert.match(bidGuide, /the document you are writing is \*\*the Proposal\*\*/i);
    assert.match(bidGuide, /Answer their document, not ours/);
    // and the eight thousand words that are right either way are not forked
    assert.ok(bidGuide.includes(discovery), 'the preamble is added, the instruction is not rewritten');
  });
});

describe('the questions are a snapshot, and the engagement moves under them', () => {
  const svcWith = async (questions) => {
    const svc = createDiscoveryService({ store: createMemoryStore(), today: () => TODAY });
    await svc.startInterview(consultant, { client: 'a-bid', language: 'en', mode: 'quick', process: 'rfp' });
    await svc.answerQuestion(consultant, 'a-bid', { question_id: 'Q10.5.2', values: { '/meta/consent/llm_processing': ['true'] } });
    await svc.saveClarifications(consultant, 'a-bid', { questions });
    return svc;
  };
  const q = (question, covers) => ({ question, why_we_ask: 'the trade-off', covers, assume_if_unanswered: 'we assume', impact_if_wrong: 'it costs' });

  test('a topic no saved question covers is reported, rather than leaving a stale list looking current', () => {
    const topics = clarificationTopics(acme());
    const saved = { questions: topics.slice(0, 2).map((t, i) => ({ id: `q${i}`, covers: t.covers.map((c) => c.question_id) })) };
    const f = clarificationsFreshness(topics, saved);
    assert.equal(f.up_to_date, false);
    assert.equal(f.uncovered.length, topics.length - 2, 'everything the saved questions do not reach');
    for (const u of f.uncovered) assert.ok(u.title && u.settles > 0);
  });

  test('nothing saved is not out of date — it is not started', () => {
    const f = clarificationsFreshness(clarificationTopics(acme()), null);
    assert.deepEqual(f, { known: false, up_to_date: true, uncovered: [] });
  });

  test('writing them again keeps the decisions already taken', async () => {
    // Rewriting is a normal thing to do, and it used to cost the Lead Consultant
    // every verdict they had reached. A question resting on the same discovery
    // questions is the same question in better words.
    const svc = await svcWith([q('One catalogue?', ['Q3.4.13']), q('Who invoices?', ['Q3.1.1'])]);
    await svc.decideClarifications(consultant, 'a-bid', { id: 'q1', status: 'accepted' });
    await svc.decideClarifications(consultant, 'a-bid', { id: 'q2', status: 'rejected' });

    await svc.saveClarifications(consultant, 'a-bid', {
      questions: [q('Will the markets share one catalogue?', ['Q3.4.13']), q('Which entity invoices?', ['Q3.1.1']), q('Is B2B in scope?', ['Q6.2.14'])],
    });
    const { clarifications, triage: t } = await svc.getClarifications(consultant, 'a-bid');
    assert.deepEqual(clarifications.questions.map((x) => x.status), ['accepted', 'rejected', 'proposed']);
    assert.equal(clarifications.questions[0].question, 'Will the markets share one catalogue?', 'the better wording wins');
    assert.equal(clarifications.questions[0].decided_by, 'lc-one', 'and the decision keeps its author');
    assert.equal(t.proposed.length, 1, 'only what is genuinely new waits on a decision');
  });

  test('a question that now rests on different ground arrives undecided', async () => {
    const svc = await svcWith([q('One catalogue?', ['Q3.4.13'])]);
    await svc.decideClarifications(consultant, 'a-bid', { id: 'q1', status: 'accepted' });
    await svc.saveClarifications(consultant, 'a-bid', { questions: [q('One catalogue?', ['Q3.4.13', 'Q6.2.14'])] });
    const { clarifications } = await svc.getClarifications(consultant, 'a-bid');
    assert.equal(clarifications.questions[0].status, 'proposed', 'it covers something nobody ruled on');
  });
});

describe('the questions come home', () => {
  const asked = (covers) => ({ id: 'q1', status: 'accepted', question: 'One catalogue?', covers, assume_if_unanswered: 'one store', impact_if_wrong: 'a second store' });

  test('a question is answered when every discovery question it covers is', () => {
    const doc = acme();
    // Q3.1.1 is answered in the fixture; Q10.5.9 is not.
    const r = repliesReceived(doc, { questions: [asked(['Q3.1.1']), { ...asked(['Q10.5.9']), id: 'q2' }] });
    assert.equal(r.asked, 2);
    assert.equal(r.back, 1);
    assert.deepEqual(r.waiting.map((w) => w.id), ['q2']);
    assert.deepEqual(r.rows.find((x) => x.id === 'q2').outstanding, ['Q10.5.9']);
  });

  test('half an answer is not an answer', () => {
    const r = repliesReceived(acme(), { questions: [asked(['Q3.1.1', 'Q10.5.9'])] });
    assert.equal(r.back, 0);
    assert.equal(r.rows[0].partial, true, 'and it says so rather than rounding either way');
  });

  test('only what was accepted is waited on — a rejected question was never sent', () => {
    const r = repliesReceived(acme(), { questions: [{ ...asked(['Q10.5.9']), status: 'rejected' }] });
    assert.equal(r.asked, 0);
  });

  test('the instruction names each outstanding question and what it fills', () => {
    const r = repliesReceived(acme(), { questions: [{ ...asked(['Q10.5.9']), question: 'Who invoices?' }] });
    const prompt = replyPrompt('ricola', r.rows);
    assert.match(prompt, /Who invoices\?/);
    assert.match(prompt, /fills Q10\.5\.9/);
    assert.match(prompt, /register_document/);
    assert.match(prompt, /a guess recorded here becomes a number in the proposal/);
  });

  test('with nothing outstanding it says so instead of asking for a reply', () => {
    const r = repliesReceived(acme(), { questions: [asked(['Q3.1.1'])] });
    assert.match(replyPrompt('ricola', r.rows), /has been answered/);
  });

  test('an assumption retires when the client answers it anyway', () => {
    const doc = acme();
    const rejected = { id: 'q1', status: 'rejected', question: 'Who invoices?', assume_if_unanswered: 'one entity', impact_if_wrong: 'expansion stores' };
    // Clients volunteer things, and an assumption nobody needs to make any more
    // must not be stated to them as though we still did.
    const stillOpen = statedAssumptions(doc, { questions: [{ ...rejected, covers: ['Q10.5.9'] }] });
    assert.ok(stillOpen.some((a) => a.assumed === 'one entity'));
    const nowAnswered = statedAssumptions(doc, { questions: [{ ...rejected, covers: ['Q3.1.1'] }] });
    assert.ok(!nowAnswered.some((a) => a.assumed === 'one entity'));
  });
});

describe('the proposal waits for the triage', () => {
  test('a bid with questions still waiting is refused, and told what to do', async () => {
    const store = createMemoryStore();
    const svc = createDiscoveryService({ store, today: () => TODAY });
    await svc.startInterview(consultant, { client: 'a-bid', language: 'en', mode: 'quick', process: 'rfp' });
    await svc.answerQuestion(consultant, 'a-bid', { question_id: 'Q10.5.2', values: { '/meta/consent/llm_processing': ['true'] } });
    await svc.saveClarifications(consultant, 'a-bid', { questions: [QUESTION, { ...QUESTION, question: 'And B2B?' }] });

    // An undecided question reaches the client as neither: not in the questions
    // sent, not in the assumptions stated. That is the outcome the step exists
    // to prevent, so the proposal does not get written around it.
    await assert.rejects(
      svc.prepareClosingDocument(consultant, 'a-bid'),
      (err) => err instanceof ServiceError
        && (err.status === 409 ? /still waiting on you/.test(err.message) : err.status === 400),
    );
  });

  test('a discovery is never gated on it — it has no Q&A step', async () => {
    const svc = createDiscoveryService({ store: createMemoryStore(), today: () => TODAY });
    await svc.startInterview(consultant, { client: 'a-discovery', language: 'en', mode: 'quick', process: 'discovery' });
    await svc.answerQuestion(consultant, 'a-discovery', { question_id: 'Q10.5.2', values: { '/meta/consent/llm_processing': ['true'] } });
    await svc.saveClarifications(consultant, 'a-discovery', { questions: [QUESTION] });
    await assert.rejects(
      svc.prepareClosingDocument(consultant, 'a-discovery'),
      (err) => err instanceof ServiceError && err.status === 400 && !/still waiting on you/.test(err.message),
      'it stops for missing answers, never for an untriaged question list',
    );
  });
});

describe('mainland China is asked about, not only excluded', () => {
  const withChina = () => {
    const doc = acme();
    doc.markets.list.push({ code: 'CN', name: 'China' });
    doc.exits.items.push({ rule_id: '11.20', result: 'FLAG', evidence: 'Mainland China (CN) is a launch market' });
    return doc;
  };

  test('the route questions can reach the Q&A at all', () => {
    // All 21 China questions fed nothing, so by construction none of them could
    // ever be asked. The offering excludes mainland China, but which route the
    // client intends decides whether that is a carve-out or a second engagement,
    // and the tool would never have put the question.
    const covered = new Set(clarificationTopics(withChina()).flatMap((t) => t.covers.map((c) => c.question_id)));
    assert.ok(covered.has('Q3.5.1'), 'cross-border or onshore');
    assert.ok(covered.has('Q3.5.6'), 'and what Shopify’s role would be');
  });

  test('it is its own subject, not folded into "which markets do you sell in"', () => {
    const topics = clarificationTopics(withChina());
    const china = topics.find((t) => t.title === 'Mainland China');
    assert.ok(china, 'one question per subject, and this is not the markets subject');
    assert.deepEqual(china.covers.map((c) => c.question_id).sort(), ['Q3.5.1', 'Q3.5.6']);
    const markets = topics.find((t) => t.title === 'Markets & internationalisation');
    assert.ok(!markets.covers.some((c) => c.question_id.startsWith('Q3.5')), 'and it does not appear in both');
  });

  test('the nineteen that belong to the separate China discovery stay out of the bid', () => {
    const covered = new Set(clarificationTopics(withChina()).flatMap((t) => t.covers.map((c) => c.question_id)));
    const inBid = [...covered].filter((id) => id.startsWith('Q3.5'));
    assert.deepEqual(inBid.sort(), ['Q3.5.1', 'Q3.5.6'], 'ICP filings and bonded warehouses are not a bid question');
  });

  test('no China in the markets, no China topic', () => {
    assert.ok(!clarificationTopics(acme()).some((t) => t.title === 'Mainland China'));
  });
});

describe('a question about a subject the client does not have is never asked', () => {
  test('conditional questions follow the same rule the interview follows', () => {
    // `only_if` is how the bank says a whole subject does not exist for this
    // client. Widening the sources to every unanswered question walked straight
    // past it, and the moment a conditional question had feeds it leaked.
    const byId = new Map(questionBank.questions.map((q) => [q.id, q]));
    const asked = new Set(clarificationTopics(acme()).flatMap((t) => t.covers.map((c) => c.question_id)));
    const leaking = [...asked].filter((id) => {
      const q = byId.get(id);
      return q?.only_if && !q.only_if.some((c) => conditionMet(c, acme()));
    });
    assert.deepEqual(leaking, [], 'no question whose condition does not hold');
  });

  test('and the same question is asked once the condition does hold', () => {
    const doc = acme();
    doc.markets.list.push({ code: 'CN', name: 'China' });
    const asked = new Set(clarificationTopics(doc).flatMap((t) => t.covers.map((c) => c.question_id)));
    assert.ok(asked.has('Q3.5.1'), 'China is in the markets, so the route question applies');
  });
});

describe('assuming the shape of the solution is not assuming a detail', () => {
  const bid = async (questions) => {
    const svc = createDiscoveryService({ store: createMemoryStore(), today: () => TODAY });
    await svc.startInterview(consultant, { client: 'a-bid', language: 'en', mode: 'quick', process: 'rfp' });
    await svc.answerQuestion(consultant, 'a-bid', { question_id: 'Q10.5.2', values: { '/meta/consent/llm_processing': ['true'] } });
    await svc.saveClarifications(consultant, 'a-bid', { questions });
    return svc;
  };
  const q = (question, covers) => ({ question, why_we_ask: 'the trade-off', covers, assume_if_unanswered: 'we assume', impact_if_wrong: 'it costs' });

  test('the questions that decide whether there is an engagement at all are tagged', () => {
    // "Should the whole site run on Shopify, or should the shop sit behind a
    // separate content platform" is not a detail. It used to feed an L trigger,
    // which decided the offer outright; it now feeds exit rule 11.26, which
    // decides whether these offers apply at all.
    const byId = new Map(questionBank.questions.map((x) => [x.id, x]));
    assert.deepEqual(byId.get('Q9.2.1').feeds, ['gate:hydrogen', 'exit:11.25'], 'it prices the Hydrogen add-on; it no longer names the pack');
    assert.deepEqual(byId.get('Q9.2.8').feeds, ['exit:11.26'], 'where the content lives is the line, not whether it is headless');
    assert.deepEqual(byId.get('Q9.1.3').feeds, ['gate:storefront_design']);
  });

  test('the rule is a set of question ids, and only the high topics are in it', () => {
    const topics = clarificationTopics(acme());
    const ids = shapeChangingIds(topics);
    const high = topics.filter((t) => t.impact === 'high');
    assert.ok(high.length, 'the fixture has some');
    for (const t of high) for (const c of t.covers) assert.ok(ids.has(c.question_id));
    for (const t of topics.filter((x) => x.impact !== 'high')) {
      for (const c of t.covers) {
        if (!high.some((h) => h.covers.some((x) => x.question_id === c.question_id))) {
          assert.ok(!ids.has(c.question_id), `${c.question_id} is a detail`);
        }
      }
    }
  });

  test('a question resting on one of them changes the shape; one that does not, does not', () => {
    const ids = shapeChangingIds(clarificationTopics(acme()));
    const [anyShaping] = [...ids];
    assert.equal(changesShape({ covers: [anyShaping] }, ids), true);
    assert.equal(changesShape({ covers: ['Q7.3.4'] }, ids), false);
    assert.equal(changesShape({ covers: [] }, ids), false, 'a question resting on nothing shapes nothing');
  });

  test('a detail is rejected without ceremony', async () => {
    const svc = await bid([q('A detail', ['Q7.3.4'])]);
    const result = await svc.decideClarifications(consultant, 'a-bid', { id: 'q1', status: 'rejected' });
    assert.equal(result.rejected, 1);
    assert.ok(!result.warning, 'or the warning stops meaning anything');
  });

  test('accepting one never warns — it is being asked, not assumed', async () => {
    const doc = acme();
    const shaping = clarificationTopics(doc).find((t) => t.impact === 'high');
    const svc = await bid([q('The one that shapes it', shaping.covers.map((c) => c.question_id))]);
    const result = await svc.decideClarifications(consultant, 'a-bid', { id: 'q1', status: 'accepted' });
    assert.ok(!result.warning);
  });

  test('the assumption it creates carries which kind it was', () => {
    // The proposal has to be able to say whether Merkle guessed at a detail or
    // at what it is being asked to build.
    // On a question still open — an assumption about something the client has
    // since answered retires, which is its own rule.
    const rejected = { status: 'rejected', question: 'Headless or one storefront?', assume_if_unanswered: 'One Shopify storefront', impact_if_wrong: 'a second build stream', covers: ['Q10.5.9'], shape_changing: true, decided_by: 'lc-one' };
    const [a] = statedAssumptions(acme(), { questions: [rejected] });
    assert.equal(a.shape_changing, true);
    assert.equal(a.impact_if_wrong, 'a second build stream');
    assert.equal(a.owner, 'lc-one');
  });

});

describe('adding a topic does not cost the triage', () => {
  test('ten decided, one added: the ten keep their verdicts', async () => {
    // Claude refused to add a topic because re-saving "may reset your accepted
    // and rejected triage". It does not — but nothing in the tool told it so,
    // and a model protecting work the tool already protects is a model that
    // leaves a topic unasked.
    const svc = createDiscoveryService({ store: createMemoryStore(), today: () => TODAY });
    await svc.startInterview(consultant, { client: 'a-bid', language: 'en', mode: 'quick', process: 'rfp' });
    await svc.answerQuestion(consultant, 'a-bid', { question_id: 'Q10.5.2', values: { '/meta/consent/llm_processing': ['true'] } });
    const q = (question, covers) => ({ question, why_we_ask: 'w', covers, assume_if_unanswered: 'a', impact_if_wrong: 'i' });

    const ten = Array.from({ length: 10 }, (_, i) => q(`Question ${i + 1}`, [`Q${i + 1}.1.1`]));
    await svc.saveClarifications(consultant, 'a-bid', { questions: ten });
    for (let i = 1; i <= 10; i += 1) {
      await svc.decideClarifications(consultant, 'a-bid', { id: `q${i}`, status: i <= 7 ? 'accepted' : 'rejected' });
    }

    await svc.saveClarifications(consultant, 'a-bid', {
      questions: [...ten.map((x, i) => q(`Question ${i + 1}, better worded`, x.covers)), q('Mainland China', ['Q3.5.1', 'Q3.5.6'])],
    });

    const { triage: t } = await svc.getClarifications(consultant, 'a-bid');
    assert.equal(t.accepted.length, 7);
    assert.equal(t.rejected.length, 3);
    assert.deepEqual(t.proposed.map((x) => x.question), ['Mainland China'], 'only the new ground waits on a decision');
    assert.match(t.accepted[0].question, /better worded/, 'and the better wording wins');
  });

  test('the connector says so, or the model keeps guessing', async () => {
    const { CLARIFICATIONS_PROMPT } = await import('../../bid/clarifications.js');
    assert.match(CLARIFICATIONS_PROMPT, /re-saving is how a topic gets added/i);
    assert.match(CLARIFICATIONS_PROMPT, /keeps the Lead Consultant's decision/i);
  });
});
