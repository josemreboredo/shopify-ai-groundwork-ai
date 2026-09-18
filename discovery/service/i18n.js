/**
 * @file i18n.js
 * @description The questionnaire in the engagement's conversation language.
 *
 * Only what is asked is translated — question text, help, answer options, the
 * section titles and the consultant's briefing. Everything the tool *produces*
 * stays in English: answers are recorded in English, and so are the summary, the
 * approach, the deck and the annex. Each string falls back to English on its own,
 * so a half-translated language is usable rather than broken.
 *
 * Translations are JSON modules (not file reads) so they travel with the bundled
 * server code on Vercel, exactly like the question bank.
 *
 * @module discovery/service/i18n
 */

import de from '../schema/translations/de.json' with { type: 'json' };
import fr from '../schema/translations/fr.json' with { type: 'json' };
import { questionBank } from '../schema/index.js';

/** Translations by language code. English is the source, so it has no file. */
export const TRANSLATIONS = { de, fr };

/** Languages an engagement can be run in. */
export const LANGUAGES = ['en', ...Object.keys(TRANSLATIONS)];

/** Language names, in the language itself — for the consultant's language notice. */
export const LANGUAGE_NAMES = { en: 'English', de: 'Deutsch', fr: 'Français', it: 'Italiano', es: 'Español' };

/** @param {string} [language] */
export function translationFor(language) {
  return TRANSLATIONS[String(language ?? '').toLowerCase()] ?? null;
}

/**
 * How much of the question bank this language covers, for the notice in the app.
 *
 * @param {string} [language]
 * @returns {{ language: string, translated: boolean, questions: number, of: number, complete: boolean }}
 */
export function coverage(language) {
  const t = translationFor(language);
  const of = questionBank.questions.length;
  const questions = t ? questionBank.questions.filter((q) => t.questions?.[q.id]?.text).length : 0;
  return { language: language ?? 'en', translated: Boolean(t), questions, of, complete: Boolean(t) && questions === of };
}

const text = (value) => (typeof value === 'string' && value.trim() ? value : null);

/** "§ 0 Business outcomes" and "0.2 Revenue & conversion" keep their numbering. */
const heading = (value, titles) => {
  const match = /^(§\s*)?([\d.]+)\s+(.*)$/.exec(String(value ?? ''));
  const title = match && titles?.[match[2]];
  return title ? `${match[1] ?? ''}${match[2]} ${title}` : value;
};

/**
 * One question as `describeQuestion` returns it, in the conversation language.
 * Strings without a translation stay in English.
 *
 * @param {object} question a described question
 * @param {string} [language]
 */
export function translateQuestion(question, language) {
  const t = translationFor(language);
  if (!t || !question) return question;
  const q = t.questions?.[question.id];
  const labels = { ...(t.options ?? {}), ...(q?.options ?? {}) };
  const optionLabels = question.option_labels
    ? Object.fromEntries(Object.entries(question.option_labels).map(([value, label]) => [value, text(labels[value]) ?? label]))
    : undefined;
  const teach = question.teach && q?.teach
    ? {
        ...question.teach,
        ...(text(q.teach.why) ? { why: q.teach.why } : {}),
        ...(text(q.teach.limits) ? { limits: q.teach.limits } : {}),
        ...(Array.isArray(q.teach.options) && q.teach.options.length ? { options: q.teach.options } : {}),
      }
    : question.teach;
  return {
    ...question,
    ...(text(q?.text) ? { text: q.text } : {}),
    ...(text(q?.help) ? { help: q.help } : {}),
    ...(question.section ? { section: heading(question.section, t.sections) } : {}),
    ...(question.subsection ? { subsection: heading(question.subsection, t.subsections) } : {}),
    ...(optionLabels ? { option_labels: optionLabels } : {}),
    ...(teach ? { teach } : {}),
    language: language ?? 'en',
    ...(q?.text ? {} : { untranslated: Boolean(t) || undefined }),
  };
}

/**
 * A section or subsection heading ("§ 3 Markets…", "3.1 Markets at launch") in the
 * conversation language, numbering kept.
 *
 * @param {string} value @param {string} [language] @param {'sections'|'subsections'} [kind]
 */
export const translateHeading = (value, language, kind = 'sections') => {
  const t = translationFor(language);
  return t ? heading(value, t[kind]) : value;
};

/** @param {object[]} questions @param {string} [language] */
export const translateQuestions = (questions, language) =>
  (translationFor(language) ? questions.map((q) => translateQuestion(q, language)) : questions);

/**
 * The review table shows question text only: translate it without rebuilding the
 * whole description.
 *
 * @param {{ id: string, text: string }[]} rows @param {string} [language]
 */
export const translateRows = (rows, language) => {
  const t = translationFor(language);
  if (!t) return rows;
  return rows.map((row) => ({ ...row, ...(text(t.questions?.[row.id]?.text) ? { text: t.questions[row.id].text } : {}) }));
};
