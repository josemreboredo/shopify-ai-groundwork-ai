/**
 * The questionnaire in the engagement's conversation language: what is asked is
 * translated, what is produced (answers, summary, documents) stays in English.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { createDiscoveryService } from '../../shared/index.js';
import { createMemoryStore } from '../../shared/stores/memory-store.js';
import { TRANSLATIONS, LANGUAGES, coverage, translateQuestion, translateRows, sourceDigest } from '../../shared/i18n.js';
import { questionBank } from '../../schema/index.js';
import { describeQuestion } from '../../engagement/next.js';
import { renderQuestionnaire } from '../../scripts/render-questionnaire.js';

const TODAY = '2026-09-18';
const lc = { login: 'lc-one', role: 'consultant' };
const ids = new Set(questionBank.questions.map((q) => q.id));

async function started(language) {
  const svc = createDiscoveryService({ store: createMemoryStore(), today: () => TODAY });
  await svc.startInterview(lc, { client: 'demo-client', language, mode: 'quick' });
  await svc.answerQuestion(lc, 'demo-client', { question_id: 'Q10.5.2', values: { '/meta/consent/llm_processing': ['true'] } });
  return svc;
}

describe('questionnaire translations', () => {
  test('every translation file only names questions, sections and subsections that exist', () => {
    const subsections = new Set(questionBank.sections.flatMap((s) => s.subsections.map((ss) => ss.id)));
    const sections = new Set(questionBank.sections.map((s) => String(s.id)));
    for (const [language, t] of Object.entries(TRANSLATIONS)) {
      assert.equal(t.language, language, `${language}.json declares its own language`);
      for (const id of Object.keys(t.questions ?? {})) assert.ok(ids.has(id), `${language}: unknown question ${id}`);
      for (const id of Object.keys(t.sections ?? {})) assert.ok(sections.has(id), `${language}: unknown section ${id}`);
      for (const id of Object.keys(t.subsections ?? {})) assert.ok(subsections.has(id), `${language}: unknown subsection ${id}`);
      for (const [id, q] of Object.entries(t.questions ?? {})) {
        assert.ok(typeof q.text === 'string' && q.text.trim(), `${language} ${id}: needs the question text`);
        if (q.options) for (const value of Object.keys(q.options)) assert.ok(typeof q.options[value] === 'string', `${language} ${id}: option ${value}`);
      }
    }
  });

  test('no translation is left behind when the English moves', () => {
    // The failure this catches actually happened: Q8.1.1 gained a column and a
    // sentence of help, German and French kept the eight-column version, and the
    // whole suite stayed green. A German client was handed a questionnaire asking
    // for less than the schema holds.
    //
    // If this fails, the English changed and the translation did not. Retranslate
    // the question, then re-run the digest — do not just update the digest.
    const byId = new Map(questionBank.questions.map((q) => [q.id, q]));
    for (const [language, t] of Object.entries(TRANSLATIONS)) {
      const from = t.translated_from ?? {};
      for (const id of Object.keys(t.questions ?? {})) {
        assert.ok(from[id], `${language} ${id}: translated with no record of the English it came from`);
        assert.equal(from[id], sourceDigest(byId.get(id)),
          `${language} ${id}: the English has changed since this was translated`);
      }
      for (const id of Object.keys(from)) assert.ok(t.questions?.[id], `${language}: ${id} has a digest but no translation`);
    }
  });

  test('a question is served in the conversation language, and falls back to English string by string', async () => {
    const [id, tr] = Object.entries(TRANSLATIONS.de.questions ?? {})[0] ?? [];
    if (!id) return; // nothing translated yet
    const english = describeQuestion(questionBank.questions.find((q) => q.id === id));
    const german = translateQuestion(english, 'de');
    assert.equal(german.text, tr.text);
    assert.equal(german.answer_type, english.answer_type, 'the engine side of the question is untouched');
    assert.deepEqual(german.fields, english.fields);
    assert.equal(translateQuestion(english, 'it').text, english.text, 'a language without a file stays English');
    const rows = translateRows([{ id, text: english.text }], 'de');
    assert.equal(rows[0].text, tr.text);
  });

  test('the service reports the coverage and answers stay English codes', async () => {
    const svc = await started('de');
    const view = await svc.getInterview(lc, 'demo-client');
    assert.equal(view.language.language, 'de');
    assert.equal(view.language.translated, true);
    assert.equal(view.language.of, questionBank.questions.length);
    const en = await (await started('en')).getInterview(lc, 'demo-client');
    assert.equal(en.language.translated, false, 'English is the source, not a translation');
    const answers = await svc.listAnswers(lc, 'demo-client');
    assert.equal(answers.find((a) => a.pointer === '/meta/consent/llm_processing').value, true);
  });

  test('the printable questionnaire renders per language and keeps the question ids', () => {
    const en = renderQuestionnaire();
    const de = renderQuestionnaire('de');
    assert.match(en, /\*\*Q0\.1\.1\*\*/);
    assert.match(de, /\*\*Q0\.1\.1\*\*/);
    assert.equal(de.match(/^\*\*Q/gm)?.length, en.match(/^\*\*Q/gm)?.length, 'same questions, whatever the language');
  });

  test('the languages the app offers are the source plus the files that exist', () => {
    assert.deepEqual(LANGUAGES, ['en', ...Object.keys(TRANSLATIONS)]);
    assert.equal(coverage('en').translated, false);
    assert.equal(coverage('de').of, questionBank.questions.length);
  });
});
