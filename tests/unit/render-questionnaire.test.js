/**
 * The committed questionnaire must match what the question bank renders.
 */
import { test } from 'node:test';
import assert   from 'node:assert/strict';
import fs       from 'node:fs';

import { renderQuestionnaire, OUTPUT } from '../../scripts/discovery/render-questionnaire.js';
import { questionBank } from '../../schema/index.js';

test('docs/discovery/client-questionnaire.md is up to date (npm run questionnaire:render)', () => {
  assert.equal(fs.readFileSync(OUTPUT, 'utf8'), renderQuestionnaire());
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
