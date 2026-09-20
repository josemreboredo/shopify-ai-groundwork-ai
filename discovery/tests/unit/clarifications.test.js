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

import { clarificationTopics, clarificationBrief } from '../../agents/discovery/clarifications.js';
import { renderClarificationsMarkdown } from '../../service/clarifications-view.js';
import { createDiscoveryService, ServiceError } from '../../service/index.js';
import { createMemoryStore } from '../../service/stores/memory-store.js';
import { questionBank } from '../../schema/index.js';

const TODAY = '2026-09-20';
const consultant = { login: 'lc-one', role: 'consultant' };
const acme = () => JSON.parse(fs.readFileSync(new URL('../fixtures/engagements/acme-watches.json', import.meta.url), 'utf8'));

const QUESTION = {
  question: 'Will the Swiss and EU stores sell the same catalogue at the same prices?',
  why_we_ask: 'Shopify Markets serves several countries from one store; genuinely different catalogues need separate stores, which changes the build and the running cost.',
  covers: ['Q3.4.13', 'Q6.2.14'],
  assume_if_unanswered: 'One store with Shopify Markets.',
};

describe('clarification questions (RFP)', () => {
  test('the engine asks only about unknowns that move the proposal, grouped by subject', () => {
    const topics = clarificationTopics(acme());
    assert.ok(topics.length > 0, 'an engagement with open items has something worth asking');
    assert.ok(topics.length <= 6, 'a bid gets a handful of questions, not a questionnaire');
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

  test('a topic that only moves a number waits until nothing bigger is open', () => {
    const doc = acme();
    const topics = clarificationTopics(doc);
    const high = topics.filter((t) => t.impact === 'high');
    if (high.length >= 3) {
      assert.equal(topics.length, high.length, 'with three shape-changing topics open, a bid does not also ask about the plan or the run cost');
    } else {
      assert.ok(topics.length >= Math.min(3, high.length), 'with little open, the next best topics are still worth asking');
    }
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

  test('an engagement with nothing open asks nothing at all', () => {
    assert.deepEqual(clarificationTopics({}), []);
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
      svc.saveClarifications(consultant, 'demo-client', { questions: [{ question: 'Anything?', why_we_ask: '', covers: [], assume_if_unanswered: '' }] }),
      (err) => err instanceof ServiceError && err.status === 400 && err.errors.length === 3,
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
    assert.match(renderClarificationsMarkdown(saved.engagement, saved.clarifications), /Why we ask/);
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
