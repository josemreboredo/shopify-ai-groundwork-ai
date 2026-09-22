/**
 * What Merkle has already verified reaches the model that reasons. Before this,
 * 154 documented limits and 139 weighed option sets were shown to the consultant
 * during the interview and then dropped: the drafting step never saw them.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { verifiedKnowledge, answeredQuestions } from '../../engine/knowledge.js';
import { approachInput } from '../../engine/approach.js';
import { deckBrief } from '../../shared/closing.js';
import { chapterKnowledge } from '../../shared/reference.js';
import { knowledgeFor } from '../../engine/knowledge.js';
import { runCostFor } from '../../engine/economics.js';
import { challengesFor } from '../../engine/challenge.js';
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

describe('the API chapter reaches the engagements that need it', () => {
  test('a system to connect, or a storefront that is an API consumer', async () => {
    // The topic existed in no chapter and was emitted by nothing, so the first
    // chapter tagged with it surfaced through "storefront" — which every
    // engagement has — and therefore surfaced on all of them, by accident.
    const { topicsFor } = await import('../../shared/reference.js');
    const has = (doc) => topicsFor(doc).has('integrations');

    assert.equal(has({}), false, 'a theme store with nothing behind it does not need it');
    // An App Store app with a native connector is an app, not an integration —
    // the same definition the integration gate prices on.
    assert.equal(has({ integrations: [{ system: 'Klaviyo', category: 'esp', connector: 'native_app' }] }), false);
    assert.equal(has({ integrations: [{ system: 'Client ERP', category: 'erp', connector: 'custom' }] }), true);
    // And a headless storefront is an API consumer whether or not anything else is.
    assert.equal(has({ design: { headless_required: true } }), true);
  });

  test('the storefront chapters price what happens after launch, not only the build', async () => {
    // Two facts a consultant is asked for in the room and cannot invent: what
    // the client's own team can change without a developer, and how many review
    // links a headless build gets below Plus.
    const { REFERENCE_CHAPTERS } = await import('../../shared/reference-chapters.js');
    const theme = REFERENCE_CHAPTERS.find((c) => c.slug === 'theme-autonomy');
    assert.match(theme.markdown, /25 sections/, 'the composition limit is on the page');
    assert.match(theme.markdown, /presets/, 'and the thing that makes a section placeable at all');
    assert.match(theme.markdown, /gift card and checkout pages/, 'and the pages a theme cannot reach');

    const storefront = REFERENCE_CHAPTERS.find((c) => c.slug === 'liquid-vs-hydrogen');
    const flat = (text) => text.replace(/\s+/g, ' ');
    assert.match(flat(storefront.markdown), /only one environment can be public/);
    assert.match(storefront.markdown, /11\.25/, 'and it points at the rule that raises it');
  });

  test('the custom-apps chapter follows the checkout, not only the integrations', async () => {
    // A Plus client with live Scripts has a deadline and usually no integration
    // at all: Scripts stop executing on 30 June 2026 and the work surfaces as
    // checkout answers. Tagging the chapter "checkout" did nothing until
    // something emitted it.
    const { topicsFor } = await import('../../shared/reference.js');
    const has = (doc) => topicsFor(doc).has('checkout');

    assert.equal(has({}), false);
    assert.equal(has({ checkout: { customisation: ['branding_in_editor'] } }), false,
      'the editor is in every offer');
    assert.equal(has({ checkout: { extensions: ['custom_fields'] } }), true);
    assert.equal(has({ checkout: { custom_fields: ['PO number'] } }), true);
    assert.equal(has({ checkout: { order_restrictions: ['block_countries'] } }), false,
      'blocking a country is a market setting');
    assert.equal(has({ checkout: { order_restrictions: ['quantity_limits'] } }), true);
  });

  test('both new chapters are chapters like any other: front matter, citations, checked dates', async () => {
    const { REFERENCE_CHAPTERS } = await import('../../shared/reference-chapters.js');
    for (const slug of ['shopify-apis', 'custom-apps', 'theme-autonomy']) {
    const c = REFERENCE_CHAPTERS.find((x) => x.slug === slug);
    assert.ok(c, `${slug} is rendered into the module`);
    assert.match(c.verified, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(c.summary.length > 40);
    const cited = new Set((c.markdown.match(/\[(\d+)\]/g) ?? []).map((m) => m.slice(1, -1)));
    // Counted in the Sources section alone: a numbered list in the body is prose.
    const sources = c.markdown.slice(c.markdown.indexOf('## Sources'));
    const listed = (sources.match(/^\d+\. /gm) ?? []).length;
    assert.ok(cited.size >= 3, `${slug}: a chapter that asserts Shopify facts cites them`);
    assert.equal(listed, cited.size, `${slug}: every citation has a source and every source is cited`);
    for (const url of c.markdown.match(/https?:\/\/[^\s)\]]+/g) ?? []) {
      assert.match(url, /^https:\/\/(shopify\.dev|help\.shopify\.com|changelog\.shopify\.com|www\.shopify\.com)\//, url);
    }
    }
  });
});
