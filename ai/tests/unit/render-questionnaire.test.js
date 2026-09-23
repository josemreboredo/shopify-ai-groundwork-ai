/**
 * The committed questionnaire must match what the question bank renders.
 */
import { test } from 'node:test';
import assert   from 'node:assert/strict';
import fs       from 'node:fs';

import { renderQuestionnaire, renderConsultantGuide, OUTPUT, GUIDE_OUTPUT } from '../../scripts/render-questionnaire.js';
import { questionBank } from '../../schema/index.js';

test('ai/docs/client-questionnaire.md is up to date (npm run questionnaire:render)', () => {
  assert.equal(fs.readFileSync(OUTPUT, 'utf8'), renderQuestionnaire());
});

test('ai/docs/consultant-guide.md is up to date (npm run questionnaire:render)', () => {
  assert.equal(fs.readFileSync(GUIDE_OUTPUT, 'utf8'), renderConsultantGuide());
});

test('Shopify plan requirements stay in the consultant guide, never in the client questionnaire', () => {
  // Plan names may appear as answer options of the plan question (Q1.2.3); plan requirements may not.
  const client = renderQuestionnaire().replace(/^- \[ \] .*$/gm, '');
  assert.doesNotMatch(client, /Shopify Plus|\bPlus\b|Advanced plan|Grow plan|Basic plan|plan_note|help\.shopify\.com/);
  const guide = renderConsultantGuide();
  assert.match(guide, /Shopify Plus/);
  for (const q of questionBank.questions.filter((x) => x.shopify)) assert.ok(guide.includes(`**${q.id}**`), q.id);
});

test('the client questionnaire uses neutral wording: no rule numbers, offers, STOP/FLAG or consultant-only STOP questions', () => {
  const client = renderQuestionnaire();
  // (?<![\d.]) so the offering's own version line — "offering 2.11.0" — is not
  // read as a rule number. A rule reference never has a digit or a dot in front.
  assert.doesNotMatch(client, /(?<![\d.])\b11\.\d+\b|§ 11|(?:Growth|Flagship) \(L\)|standard offers?\b|offer's|\bFLAG\b|\bSTOP\b|scope gate|hard stop|Larger Engagement|Exit-trigger/);
  for (const q of questionBank.questions.filter((x) => x.ask_when === 'stop')) assert.ok(!client.includes(`**${q.id}**`), q.id);
  assert.match(renderConsultantGuide(), /## § 11 — Exit rules/);
});

test('answer options read as labels, not codes; none and not sure are standard', () => {
  const client = renderQuestionnaire();
  const options = [...client.matchAll(/^- \[ \] (.+)$/gm)].map((m) => m[1]);
  assert.ok(options.length > 500);
  for (const label of options) {
    assert.doesNotMatch(label, /_/, label);
    assert.doesNotMatch(label, /\b(b2b|dtc|pos|erp|pim|oms|3pl|wfoe|kol|sms|url|api|us|uk|eu)\b/, `acronym not capitalised: ${label}`);
    assert.match(label, /^([A-Z0-9i]|checkout\.liquid)/, `label must start with a capital: ${label}`);
  }
  assert.doesNotMatch(client, /^- \[ \] (Unknown|Undecided|None other|None of these)$/m);
});

test('every question appears exactly once in the rendered questionnaire (STOP-only questions in the consultant guide)', () => {
  const rendered = renderQuestionnaire();
  for (const q of questionBank.questions.filter((x) => x.ask_when !== 'stop')) {
    assert.equal(rendered.split(`**${q.id}**`).length - 1, 1, q.id);
  }
});

test('client-facing questionnaire contains no internal pricing', () => {
  const rendered = renderQuestionnaire();
  const offering = JSON.parse(fs.readFileSync(new URL('../../schema/offering.json', import.meta.url), 'utf8'));
  const internal = [
    ...offering.modifiers.map((m) => m.id),
    ...offering.exit_rules.map((r) => r.internal_note).filter(Boolean),
    '+25%', '€', 'EUR', 'price band',
  ];
  for (const term of internal) assert.ok(!rendered.includes(term), `leaks internal term: ${term}`);
});

test('the ACME example questionnaire asks the same questions in the same order as the template', () => {
  const ids = (text) => [...text.matchAll(/\*\*(Q\d+\.\d+\.\d+)\*\*/g)].map((m) => m[1]);
  const example = fs.readFileSync(new URL('../../docs/example-acme-questionnaire.md', import.meta.url), 'utf8');
  assert.deepEqual(ids(example), ids(renderQuestionnaire()));
});

test('every question explains to the consultant why it is asked', () => {
  const missing = questionBank.questions.filter((q) => !q.teach?.why?.trim()).map((q) => q.id);
  assert.deepEqual(missing, [], 'questions without "why it matters"');
});

test('explanations stay short and cite official sources only', () => {
  const OFFICIAL = /^https:\/\/(help\.shopify\.com|shopify\.dev|www\.shopify\.com|changelog\.shopify\.com|apps\.shopify\.com|shopify\.engineering|www\.w3\.org)\//;
  for (const q of questionBank.questions) {
    const { why, options = [], sources = [] } = q.teach;
    assert.ok(why.split(/\s+/).length <= 60, `${q.id}: "why it matters" is too long for a question card`);
    for (const o of options) assert.ok(o.option && o.pros && o.cons, `${q.id}: an option is missing pros or cons`);
    for (const url of sources) assert.match(url, OFFICIAL, `${q.id}: ${url} is not an official source`);
  }
});
