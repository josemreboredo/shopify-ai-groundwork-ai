/**
 * What Merkle has already verified reaches the model that reasons. Before this,
 * 154 documented limits and 139 weighed option sets were shown to the consultant
 * during the interview and then dropped: the drafting step never saw them.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { verifiedKnowledge, answeredQuestions } from '../../agents/discovery/knowledge.js';
import { approachInput } from '../../agents/discovery/approach.js';
import { deckBrief } from '../../service/closing.js';
import { chapterKnowledge } from '../../service/reference.js';
import { knowledgeFor } from '../../agents/discovery/knowledge.js';
import { runCostFor } from '../../agents/discovery/economics.js';
import { challengesFor } from '../../agents/discovery/challenge.js';
import { questionBank } from '../../schema/index.js';

const fixture = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'fixtures', 'engagements', 'acme-watches.json'), 'utf8'));

describe('verified knowledge reaches the drafting step', () => {
  test('only the questions this engagement answered, and everything they carry', () => {
    const asked = answeredQuestions(fixture);
    assert.ok(asked.length > 20, `expected a full engagement, got ${asked.length}`);
    assert.ok(asked.length < questionBank.questions.length, 'an engagement never answers the whole bank');
    const k = verifiedKnowledge(fixture);
    for (const entry of k.limits) {
      assert.ok(asked.some((q) => q.id === entry.question_id), `${entry.question_id} was not answered`);
      assert.ok(entry.limits.trim() && entry.about.trim());
    }
    for (const entry of k.options) {
      assert.ok(entry.options.length >= 2, `${entry.question_id}: an options block with one option is not a choice`);
    }
    for (const gate of k.plan_gates) {
      assert.ok(['grow', 'advanced', 'plus', 'enterprise'].includes(gate.plan), `${gate.feature}: ${gate.plan}`);
      assert.match(gate.docs, /^https:\/\//);
    }
    assert.ok(k.limits.length > 10 && k.options.length > 5, 'the fixture should carry real knowledge');
  });

  test('an engagement that answered nothing carries no knowledge, and does not crash', () => {
    const k = verifiedKnowledge({ meta: {} });
    assert.deepEqual([k.limits.length, k.options.length, k.plan_gates.length], [0, 0, 0]);
  });

  test('the approach step receives it, next to the answers it applies to', () => {
    const input = approachInput(fixture);
    assert.ok(input.verified_knowledge, 'the approach step was drafting blind');
    assert.ok(input.verified_knowledge.limits.length > 0);
    assert.match(input.verified_knowledge.note, /do not contradict it/i);
  });

  test('the deck step receives the chapter text, not a one-line summary of it', () => {
    const brief = deckBrief(fixture);
    assert.ok(brief.reference_chapters.length >= 4);
    for (const c of brief.reference_chapters) {
      assert.ok(c.markdown?.length > 1000 || c.body_omitted, `${c.slug}: neither body nor a reason for its absence`);
      assert.match(c.verified, /^\d{4}-\d{2}-\d{2}$/, `${c.slug}: every chapter states when it was checked`);
    }
    assert.ok(brief.verified_knowledge.limits.length > 0);
  });

  test('the payload stays within budget, and says so when a chapter had to be cut', () => {
    const tight = chapterKnowledge(fixture, { budget: 12_000 });
    const first = tight.chapters[0];
    // The budget is a cap on everything after the most relevant chapter, which
    // always travels in full — a budget that drops it would defeat the point.
    assert.ok(tight.bytes - Buffer.byteLength(first.markdown ?? '') <= 12_000, `${tight.bytes} bytes beyond the first chapter`);
    assert.ok(tight.summaries_only?.length, 'a cut chapter must be named');
    const cut = tight.chapters.find((c) => tight.summaries_only.includes(c.slug));
    assert.match(cut.body_omitted, /annex/, 'and must say where to read it');
    const core = tight.chapters[0];
    assert.ok(core.markdown, 'the chapter the most decisions lean on keeps its body');
  });
});

describe('what we send to the model', () => {
  test('the option sets are not sent twice: the deck step already carries the decisions they informed', () => {
    const forDrafting = verifiedKnowledge(fixture);
    const forWriting = verifiedKnowledge(fixture, { options: false });
    assert.ok(forDrafting.options.length > 0, 'the approach step needs them to decide');
    assert.equal(forWriting.options, undefined, 'the deck step does not need them again');
    assert.ok(forWriting.limits.length === forDrafting.limits.length, 'the limits still travel — they are what the deck must not omit');
    assert.ok(deckBrief(fixture).verified_knowledge.options === undefined);
  });

  test('the payload per document stays within budget, so nobody doubles it by accident', () => {
    const tokens = (o) => Object.values(o).reduce((n, v) => n + Buffer.byteLength(JSON.stringify(v)), 0) / 4 / 1000;
    const drafting = tokens(approachInput(fixture));
    const writing = tokens(deckBrief(fixture));
    assert.ok(drafting < 30, `approach step is ${Math.round(drafting)}k tokens`);
    assert.ok(writing < 75, `deck step is ${Math.round(writing)}k tokens`);
    assert.ok(drafting + writing < 100, `a closing document costs ${Math.round(drafting + writing)}k tokens of input`);
  });

  test('the heavy work is computed once per document, not once per caller', () => {
    const doc = structuredClone(fixture);
    const first = knowledgeFor(doc);
    assert.equal(knowledgeFor(doc), first, 'the same object, not an equal one');
    assert.equal(runCostFor(doc), runCostFor(doc));
    assert.equal(challengesFor(doc), challengesFor(doc), 'the deck path asks three times');
  });
});
