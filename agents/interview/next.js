/**
 * @file next.js
 * @description Chooses the next interview questions: consent first, then the
 * route decision while a STOP is open, then the question bank order filtered by
 * mode, skip logic and what is already known. Questions that feed a scope gate,
 * L trigger, exit rule or app signal are asked in every mode, and come first
 * within their section.
 *
 * @module interview/next
 */

import { questionBank, schemaNodeAt, enumValues } from '../../schema/index.js';
import { assemble } from '../discovery/engine.js';
import { classifyOffer } from '../discovery/classify.js';
import { evaluateExits } from '../discovery/exits.js';
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
 * True when the answers so far fire an open STOP rule.
 *
 * @param {import('./session.js').Session} session
 */
export function hasOpenStop(session) {
  const doc = assemble(session.answers, { today: session.updated_at, clientSlug: session.client, source: 'chatbot' });
  doc.offer = classifyOffer(doc);
  return evaluateExits(doc).triggered;
}

/**
 * Whether a question belongs to the session's interview: its priority is in the
 * mode, or it feeds the offer, an exit rule or an app signal. STOP-only
 * questions belong only while a STOP is open.
 *
 * @param {object} q
 * @param {import('./session.js').Session} session
 * @param {boolean} stopOpen
 */
export function inInterview(q, session, stopOpen) {
  if (q.ask_when === 'stop') return stopOpen;
  return PRIORITIES_BY_MODE[session.mode].includes(q.priority) || Boolean(q.feeds?.length);
}

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
    ...(q.ask_when ? { ask_when: q.ask_when } : {}),
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
  const stopOpen = hasOpenStop(session);
  const sectionOrder = questionBank.sections.map((s) => s.id);

  const open = questionBank.questions
    .map((q, index) => ({ q, index }))
    .filter(({ q }) => inInterview(q, session, stopOpen))
    .filter(({ q }) => !(q.id in session.tbc) && !(q.id in session.skipped))
    .filter(({ q }) => !isKnown(q, session.answers))
    .filter(({ q }) => !isSkippedByRule(q, session.answers))
    .sort((a, b) =>
      (b.q.ask_when === 'stop' ? 1 : 0) - (a.q.ask_when === 'stop' ? 1 : 0) ||
      sectionOrder.indexOf(SECTION_OF.get(a.q.subsection).id) - sectionOrder.indexOf(SECTION_OF.get(b.q.subsection).id) ||
      (b.q.feeds?.length ? 1 : 0) - (a.q.feeds?.length ? 1 : 0) ||
      a.index - b.index);

  return { questions: open.slice(0, limit).map(({ q }) => describeQuestion(q)), remaining: open.length };
}

/**
 * Interview questions not answered, not skipped and not skipped by rule — for coverage and open items.
 *
 * @param {import('./session.js').Session} session
 */
export function unansweredInMode(session) {
  const stopOpen = hasOpenStop(session);
  return questionBank.questions.filter((q) =>
    inInterview(q, session, stopOpen) && !isKnown(q, session.answers) && !(q.id in session.skipped) && !isSkippedByRule(q, session.answers));
}
