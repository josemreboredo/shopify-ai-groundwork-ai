/**
 * The committed questionnaire must match what the question bank renders.
 */
import { test } from 'node:test';
import assert   from 'node:assert/strict';
import fs       from 'node:fs';

import { renderQuestionnaire, renderConsultantGuide, OUTPUT, GUIDE_OUTPUT } from '../../scripts/discovery/render-questionnaire.js';
import { questionBank } from '../../schema/index.js';

test('docs/discovery/client-questionnaire.md is up to date (npm run questionnaire:render)', () => {
  assert.equal(fs.readFileSync(OUTPUT, 'utf8'), renderQuestionnaire());
});

test('docs/discovery/consultant-guide.md is up to date (npm run questionnaire:render)', () => {
  assert.equal(fs.readFileSync(GUIDE_OUTPUT, 'utf8'), renderConsultantGuide());
});

test('Shopify plan requirements stay in the consultant guide, never in the client questionnaire', () => {
  const client = renderQuestionnaire();
  assert.doesNotMatch(client, /Shopify Plus|\bPlus\b|Advanced plan|Grow plan|Basic plan|plan_note|help\.shopify\.com/);
  const guide = renderConsultantGuide();
  assert.match(guide, /Shopify Plus/);
  for (const q of questionBank.questions.filter((x) => x.shopify)) assert.ok(guide.includes(`**${q.id}**`), q.id);
});

test('every question appears exactly once in the rendered questionnaire', () => {
  const rendered = renderQuestionnaire();
  for (const q of questionBank.questions) {
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
  const example = fs.readFileSync(new URL('../../docs/discovery/example-acme-questionnaire.md', import.meta.url), 'utf8');
  assert.deepEqual(ids(example), ids(renderQuestionnaire()));
});
