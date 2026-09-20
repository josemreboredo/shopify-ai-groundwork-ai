/**
 * The engagement's language reaches what the client reads.
 *
 * It used to reach only what was asked. The clarification questions — the one
 * thing the tool writes and Merkle sends verbatim — and the proposal itself came
 * out in English however the engagement was run, and nothing in the code said so:
 * there was no language argument to forget, because there was no language
 * argument at all. These tests are the argument's receipt.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { LANGUAGES, LANGUAGE_NAMES, LANGUAGE_IN_ENGLISH, supported, writeInLanguage } from '../../agents/language.js';
import { clarificationsPrompt, CLARIFICATIONS_PROMPT } from '../../agents/discovery/clarifications.js';
import { deckBrief, deckGuide } from '../../service/closing.js';
import { createSession } from '../../agents/interview/session.js';
import { TRANSLATIONS, writtenIn } from '../../service/i18n.js';
import { createDiscoveryService } from '../../service/index.js';
import { createMemoryStore } from '../../service/stores/memory-store.js';

describe('the languages an engagement can be run in', () => {
  test('are the three the questionnaire has words for, and no others', () => {
    assert.deepEqual(LANGUAGES, ['en', 'de', 'fr']);
    // English is the source and has no translation file; every other language
    // offered must have one, or the tool is labelling an engagement with a
    // language it cannot ask a single question in.
    assert.deepEqual(LANGUAGES.filter((l) => l !== 'en').sort(), Object.keys(TRANSLATIONS).sort());
  });

  test('are named in both directions, and the two maps agree', () => {
    assert.deepEqual(Object.keys(LANGUAGE_NAMES), Object.keys(LANGUAGE_IN_ENGLISH));
    assert.equal(LANGUAGE_NAMES.de, 'Deutsch', 'the consultant’s notice speaks the language');
    assert.equal(LANGUAGE_IN_ENGLISH.de, 'German', 'the instruction to the model is in English');
  });

  test('an engagement cannot be started in one the tool does not have', () => {
    // it and es were offered in the app's dropdown and accepted by the session:
    // the engagement was recorded as Italian and then conducted entirely in
    // English. A label with nothing behind it is worse than no label.
    for (const language of ['it', 'es', 'pt', 'zz']) {
      assert.throws(() => createSession({ client: 'x', language, today: '2026-09-20' }), /Invalid language/, language);
    }
    for (const language of LANGUAGES) {
      assert.equal(createSession({ client: 'x', language, today: '2026-09-20' }).language, language);
    }
  });

  test('supported() is case-insensitive and safe on nothing', () => {
    assert.ok(supported('DE') && supported('de'));
    assert.ok(!supported('') && !supported(undefined) && !supported(null));
  });
});

describe('the instruction that puts a document in the client’s language', () => {
  test('is nothing at all in English, so the English prompt is the one that was tested', () => {
    assert.equal(writeInLanguage('en', { what: 'X' }), '');
    assert.equal(writeInLanguage(undefined, { what: 'X' }), '');
    assert.equal(clarificationsPrompt('en'), CLARIFICATIONS_PROMPT);
    assert.ok(!CLARIFICATIONS_PROMPT.startsWith('**Write in'));
    assert.ok(!deckGuide({ process: 'rfp' }).startsWith('**Write in'));
  });

  test('names the language in English and ends with a separator', () => {
    const de = writeInLanguage('de', { what: 'The deck is what they read' });
    assert.match(de, /^\*\*Write in German\.\*\*/);
    assert.ok(!/Write in Deutsch/.test(de), 'the instruction is addressed to the model, in English');
    assert.match(de, /\n---\n\n$/, 'the prompt it precedes starts on its own');
  });

  test('protects what cannot survive being translated', () => {
    const fr = writeInLanguage('fr', { what: 'X' });
    // A Shopify feature renamed into French cannot be checked against the page
    // that proves it, and a requirement paraphrased out of the client's own
    // words is no longer the thing they asked for.
    for (const keep of ['Shopify Markets', 'Shopify Plus', 'documentation URL', 'identifiers', 'exactly as they wrote it']) {
      assert.ok(fr.includes(keep), `it has to keep: ${keep}`);
    }
  });
});

describe('what goes in the client’s language, and what stays in English', () => {
  test('the questions we send do, and the reasoning we keep does not', () => {
    const de = clarificationsPrompt('de');
    assert.match(de, /^\*\*Write in German\.\*\*/);
    // The split is the one the page already draws: the question and its "Why we
    // ask" are sent; what we would assume and what it costs are ours.
    assert.match(de, /"Why we ask" paragraph are sent to the client/);
    assert.match(de, /what that assumption costs if it is wrong — stays in English/);
    // And the instruction itself is still all there underneath.
    assert.ok(de.endsWith(CLARIFICATIONS_PROMPT), 'the language block is a preamble, not a rewrite');
  });

  test('the proposal does, and the bid preamble still follows it', () => {
    const bid = deckGuide({ process: 'rfp', language: 'de' });
    assert.match(bid, /^\*\*Write in German\.\*\*/);
    assert.ok(bid.indexOf('This is a bid, not a discovery') > bid.indexOf('Write in German'),
      'the language is settled first, then what kind of document it is');
    assert.ok(bid.endsWith(deckGuide({ process: 'rfp' }).slice(-200)), 'the rest of the guide is untouched');
  });

  test('a discovery closing document gets it too — it is read by the client as well', () => {
    assert.match(deckGuide({ process: 'discovery', language: 'fr' }), /^\*\*Write in French\.\*\*/);
  });

  test('and the brief the model is actually handed carries it, not just the guide', () => {
    // deckGuide takes the language; deckBrief is what the service calls. The
    // argument existing is not the same as it being passed on.
    const fixture = JSON.parse(fs.readFileSync(
      path.join(import.meta.dirname, '..', 'fixtures', 'engagements', 'acme-watches.json'), 'utf8'));
    assert.match(deckBrief(fixture, { process: 'rfp', language: 'de' }).instructions, /^\*\*Write in German\.\*\*/);
    assert.ok(!deckBrief(fixture, { process: 'rfp' }).instructions.startsWith('**Write in'));
  });
});

describe('the service hands the session’s language to the prompts', () => {
  // The unit tests above prove the argument works. They are blind to the wiring:
  // deleting `session.language` at the call site left every one of them green,
  // which is exactly the mistake this whole change is fixing one level down.
  const start = async (language) => {
    const svc = createDiscoveryService({ store: createMemoryStore(), today: () => '2026-09-20', visibility: 'all' });
    const lc = { login: 'lead', role: 'consultant' };
    await svc.startInterview(lc, { client: 'demo', mode: 'quick', process: 'rfp', language });
    await svc.recordAnswers(lc, 'demo', [{ question_id: 'Q10.5.2', values: { '/meta/consent/llm_processing': true } }]);
    await svc.recordAnswers(lc, 'demo', [{ question_id: 'Q1.1.1', values: { '/meta/client/name': 'Demo AG' } }]);
    return { svc, lc };
  };

  test('a German bid asks its clarification questions in German', async () => {
    const { svc, lc } = await start('de');
    let prepared;
    try {
      prepared = await svc.prepareClarifications(lc, 'demo');
    } catch (err) {
      // An almost-empty engagement has nothing worth asking yet; the language
      // still has to be on the instruction when there is.
      assert.match(err.message, /Nothing worth asking|Some answers are still missing/);
      return;
    }
    assert.match(prepared.instructions, /^\*\*Write in German\.\*\*/);
  });

  test('an English bid gets the instruction exactly as it was written', async () => {
    const { svc, lc } = await start('en');
    try {
      const prepared = await svc.prepareClarifications(lc, 'demo');
      assert.equal(prepared.instructions, CLARIFICATIONS_PROMPT);
    } catch (err) {
      assert.match(err.message, /Nothing worth asking|Some answers are still missing/);
    }
  });
});

describe('correcting the language an engagement is run in', () => {
  // There was no way to do this at all. An engagement created in the wrong
  // language stayed in it for ever: asked in English, every document written in
  // English, on a record labelled French.
  const started = async (language = 'en') => {
    const svc = createDiscoveryService({ store: createMemoryStore(), today: () => '2026-09-20', visibility: 'all' });
    const lc = { login: 'lead', role: 'consultant' };
    await svc.startInterview(lc, { client: 'demo', mode: 'quick', process: 'rfp', language });
    await svc.recordAnswers(lc, 'demo', [{ question_id: 'Q10.5.2', values: { '/meta/consent/llm_processing': true } }]);
    return { svc, lc };
  };

  test('with nothing written, it is a plain correction and says so', async () => {
    const { svc, lc } = await started('en');
    const r = await svc.setLanguage(lc, 'demo', { language: 'fr' });
    assert.equal(r.language, 'fr');
    assert.equal(r.was, 'en');
    assert.deepEqual(r.written_in, [], 'nothing was left behind because nothing existed');
    assert.equal((await svc.getSummary(lc, 'demo')).engagement.language, 'fr');
  });

  test('recorded answers are untouched, because they are held in English either way', async () => {
    const { svc, lc } = await started('en');
    await svc.recordAnswers(lc, 'demo', [{ question_id: 'Q1.1.1', values: { '/meta/client/name': 'Demo AG' } }]);
    await svc.setLanguage(lc, 'demo', { language: 'de' });
    const answers = await svc.listAnswers(lc, 'demo');
    const name = JSON.stringify(answers).includes('Demo AG');
    assert.ok(name, 'the answer is still there, and still as it was recorded');
  });

  test('what the model already wrote keeps its own language, and is named', async () => {
    const { svc, lc } = await started('de');
    // A saved set of questions carries the language it was written in.
    await svc.saveClarifications(lc, 'demo', {
      questions: [{
        question: 'Welche Märkte starten zuerst?',
        why_we_ask: 'Weil es die Topologie bestimmt.',
        covers: ['Q3.1.1'],
        assume_if_unanswered: 'Alle gleichzeitig.',
        impact_if_wrong: 'Eine zweite Welle, die niemand kalkuliert hat.',
      }],
    });
    const before = await svc.languageState(lc, 'demo');
    assert.equal(before.length, 1);
    assert.equal(before[0].language, 'de');
    assert.equal(before[0].matches, true, 'while the engagement is German, the German questions match');

    const r = await svc.setLanguage(lc, 'demo', { language: 'fr' });
    assert.equal(r.written_in.length, 1);
    assert.equal(r.written_in[0].language, 'de', 'it does not re-write itself');
    assert.equal(r.written_in[0].matches, false, 'and it is reported as out of step');
    assert.match(r.written_in[0].what, /clarification question/);
    assert.equal(r.written_in[0].where, 'clarifications', 'the caller is told where to go and fix it');
  });

  test('a question already accepted to send is called out, because it may be with the client', async () => {
    const { svc, lc } = await started('de');
    await svc.saveClarifications(lc, 'demo', {
      questions: [{
        question: 'Welche Märkte starten zuerst?',
        why_we_ask: 'Weil es die Topologie bestimmt.',
        covers: ['Q3.1.1'],
        assume_if_unanswered: 'Alle gleichzeitig.',
        impact_if_wrong: 'Eine zweite Welle, die niemand kalkuliert hat.',
      }],
    });
    await svc.decideClarifications(lc, 'demo', { id: 'q1', status: 'accepted' });
    const r = await svc.setLanguage(lc, 'demo', { language: 'en' });
    assert.match(r.written_in[0].detail ?? '', /1 of them accepted to send/);
  });

  test('a language the tool does not have is refused, and nothing moves', async () => {
    const { svc, lc } = await started('de');
    for (const language of ['it', 'es', '', 'xx']) {
      await assert.rejects(() => svc.setLanguage(lc, 'demo', { language }), /language must be one of/, String(language));
    }
    assert.equal((await svc.getSummary(lc, 'demo')).engagement.language, 'de', 'a refused change changes nothing');
  });

  test('a document written before the stamp existed admits it does not know', () => {
    // Everything saved up to now has no language on it. Guessing "it must have
    // been English" would put a language on a document nobody checked.
    const [row] = writtenIn({ language: 'fr', closing: { document: { version: '1.0' } } });
    assert.equal(row.language, null);
    assert.equal(row.matches, false, 'unknown is not a match, so it is surfaced rather than assumed correct');

    // And the same on an English engagement, which is where "unknown must have
    // been English" is tempting and wrong: every document saved before the stamp
    // existed would silently claim to be in the right language.
    const [onEnglish] = writtenIn({ language: 'en', closing: { document: { version: '1.0' } } });
    assert.equal(onEnglish.language, null);
    assert.equal(onEnglish.matches, false, 'an unchecked document does not get the benefit of the doubt');
  });
});
