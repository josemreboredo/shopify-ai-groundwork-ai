/**
 * @file next.js
 * @description Chooses the next interview questions: consent first, then the
 * question bank order filtered by mode, skip logic and what is already known;
 * questions that feed a scope gate or exit rule come first within their section.
 *
 * @module interview/next
 */

import { questionBank, schemaNodeAt, enumValues } from '../../schema/index.js';
import { isAnswered, valuesAt } from './session.js';

export const CONSENT_QUESTION = 'Q10.5.2';
const CONSENT_POINTER = '/meta/consent/llm_processing';

const PRIORITIES_BY_MODE = {
  quick: ['required'],
  standard: ['required', 'recommended'],
  full: ['required', 'recommended', 'optional'],
};

const BY_ID = new Map(questionBank.questions.map((q) => [q.id, q]));
const SECTION_OF = new Map(questionBank.sections.flatMap((s) => s.subsections.map((ss) => [ss.id, s])));
const SUBSECTION_TITLE = new Map(questionBank.sections.flatMap((s) => s.subsections.map((ss) => [ss.id, ss.title])));

/** @param {string} id */
export const questionById = (id) => BY_ID.get(id);

/** True when consent for AI processing has been recorded as yes. @param {object} answers */
export const hasConsent = (answers) => valuesAt(answers, CONSENT_POINTER)[0] === true;

/**
 * Whether a question's skip_if condition is met by the current answers.
 *
 * @param {object} question
 * @param {object} answers
 */
export function isSkippedByRule(question, answers) {
  const rule = question.skip_if;
  if (!rule) return false;
  const target = BY_ID.get(rule.question);
  const value = valuesAt(answers, target.maps_to[0])[0];
  if (value === undefined) return false;
  if ('equals' in rule) return value === rule.equals;
  if ('excludes' in rule) return Array.isArray(value) && !value.includes(rule.excludes);
  return false;
}

/** @param {object} question @param {object} answers */
const isKnown = (question, answers) => question.maps_to.some((p) => isAnswered(answers, p));

/**
 * Describe a question for the skill: text, help, answer type and allowed values.
 *
 * @param {object} q
 */
export function describeQuestion(q) {
  const node = q.maps_to.length === 1 ? schemaNodeAt(q.maps_to[0]) : null;
  const itemNode = node?.type === 'array' ? schemaNodeAt(`${q.maps_to[0]}/*`) : null;
  const fields = itemNode?.type === 'object'
    ? Object.fromEntries(Object.entries(itemNode.properties).map(([k]) => [k, enumValues(schemaNodeAt(`${q.maps_to[0]}/*/${k}`)) ?? schemaNodeAt(`${q.maps_to[0]}/*/${k}`)?.type ?? 'string']))
    : undefined;
  return {
    id: q.id,
    section: `§ ${SECTION_OF.get(q.subsection).id} ${SECTION_OF.get(q.subsection).title}`,
    subsection: `${q.subsection} ${SUBSECTION_TITLE.get(q.subsection)}`,
    text: q.text,
    ...(q.help ? { help: q.help } : {}),
    priority: q.priority,
    audience: q.audience,
    answer_type: q.answer_type,
    fields: q.maps_to,
    ...(node && enumValues(node) ? { allowed_values: enumValues(node) } : {}),
    ...(fields ? { item_fields: fields } : {}),
    ...(q.feeds?.length ? { feeds: q.feeds } : {}),
  };
}

/**
 * Next questions to ask.
 *
 * @param {import('./session.js').Session} session
 * @param {{ limit?: number }} [options]
 * @returns {{ questions: object[], remaining: number }}
 */
export function nextQuestions(session, { limit = 3 } = {}) {
  if (!hasConsent(session.answers)) {
    return { questions: [describeQuestion(BY_ID.get(CONSENT_QUESTION))], remaining: 1, consent_required: true };
  }
  const allowed = new Set(PRIORITIES_BY_MODE[session.mode]);
  const sectionOrder = questionBank.sections.map((s) => s.id);

  const open = questionBank.questions
    .map((q, index) => ({ q, index }))
    .filter(({ q }) => allowed.has(q.priority))
    .filter(({ q }) => !(q.id in session.tbc) && !(q.id in session.skipped))
    .filter(({ q }) => !isKnown(q, session.answers))
    .filter(({ q }) => !isSkippedByRule(q, session.answers))
    .sort((a, b) =>
      sectionOrder.indexOf(SECTION_OF.get(a.q.subsection).id) - sectionOrder.indexOf(SECTION_OF.get(b.q.subsection).id) ||
      (b.q.feeds?.length ? 1 : 0) - (a.q.feeds?.length ? 1 : 0) ||
      a.index - b.index);

  return { questions: open.slice(0, limit).map(({ q }) => describeQuestion(q)), remaining: open.length };
}

/**
 * Required / in-mode questions not answered, not TBC and not skipped by rule — for coverage and open items.
 *
 * @param {import('./session.js').Session} session
 */
export function unansweredInMode(session) {
  const allowed = new Set(PRIORITIES_BY_MODE[session.mode]);
  return questionBank.questions.filter((q) =>
    allowed.has(q.priority) && !isKnown(q, session.answers) && !(q.id in session.skipped) && !isSkippedByRule(q, session.answers));
}
