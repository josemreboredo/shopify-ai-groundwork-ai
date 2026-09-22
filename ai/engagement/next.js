/**
 * @file next.js
 * @description Chooses the next interview questions: consent first, then the
 * client questions in question bank order, then a consultant wrap-up block
 * (consultant-audience questions, starting with the route decision while a STOP
 * is open), filtered by mode, relevance, skip logic and what is already known. Questions that feed a scope gate,
 * L trigger or exit rule are asked in every mode; questions that feed only app
 * signals are asked outside their mode only when an earlier answer makes them
 * relevant (`ask_if`). Questions with `only_if` (e.g. mainland China) are asked,
 * in any mode, only when their condition holds. Feeding questions come first within their section.
 *
 * @module interview/next
 */

import { questionBank, offering, schemaNodeAt, enumValues, optionLabel } from '../schema/index.js';
import { assemble } from '../engine/engine.js';
import { classifyOffer } from '../engine/classify.js';
import { evaluateExits } from '../engine/exits.js';
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
function hasOpenStop(session) {
  const doc = assemble(session.answers, { today: session.updated_at, clientSlug: session.client, source: 'chatbot' });
  doc.offer = classifyOffer(doc);
  return evaluateExits(doc).triggered;
}

/**
 * Whether one `ask_if` condition holds for the answers so far.
 *
 * @param {object} cond  { pointer, equals | not_equals | in | includes_any | min | count_min | matches }
 * @param {object} answers
 */
export function conditionMet(cond, answers) {
  const values = valuesAt(answers, cond.pointer).flat();
  if (!values.length) return false;
  if ('equals' in cond) return values.includes(cond.equals);
  if ('not_equals' in cond) return values.some((v) => v !== cond.not_equals);
  if ('in' in cond) return values.some((v) => cond.in.includes(v));
  if ('includes_any' in cond) return values.some((v) => cond.includes_any.includes(v));
  if ('min' in cond) return values.some((v) => typeof v === 'number' && v >= cond.min);
  if ('count_min' in cond) return new Set(values).size >= cond.count_min;
  if ('matches' in cond) return values.some((v) => typeof v === 'string' && new RegExp(cond.matches, 'i').test(v));
  return false;
}

/** True when a question has no `ask_if`, or any of its conditions holds. @param {object} q @param {object} answers */
const isRelevant = (q, answers) => !q.ask_if || q.ask_if.some((c) => conditionMet(c, answers));

/**
 * Whether a question applies at all to these answers.
 *
 * `only_if` is how the bank says "this subject does not exist for this client" —
 * the twenty-one mainland China questions only exist when CN is a launch market.
 * The interview has always respected it; anything else that decides what to ask
 * has to respect it too, or it puts a question about a subject the client does
 * not have.
 *
 * @param {object} q @param {object} answers
 */
export const questionApplies = (q, answers) => (!q.only_if || q.only_if.some((c) => conditionMet(c, answers)))
  && isRelevant(q, answers);

/**
 * Whether a question belongs to the session's interview: its priority is in the
 * mode, it feeds the offer or an exit rule, or it feeds only app signals and an
 * earlier answer makes it relevant. STOP-only questions belong only while a STOP
 * is open.
 *
 * @param {object} q
 * @param {import('./session.js').Session} session
 * @param {boolean} stopOpen
 */
function inInterview(q, session, stopOpen) {
  if (q.ask_when === 'stop') return stopOpen;
  if (q.only_if && !q.only_if.some((c) => conditionMet(c, session.answers))) return false;
  // ask_if applies in quick and standard interviews (as on paper); a full interview asks everything in its mode.
  if (q.ask_if && session.mode !== 'full') return isRelevant(q, session.answers);
  if (PRIORITIES_BY_MODE[session.mode].includes(q.priority)) return true;
  if (!q.feeds?.length) return false;
  if (q.feeds.some((f) => !f.startsWith('app:'))) return true;
  return Boolean(q.ask_if) && isRelevant(q, session.answers);
}

/**
 * Whether a question's skip_if condition is met by the current answers.
 *
 * @param {object} question
 * @param {object} answers
 */
function isSkippedByRule(question, answers) {
  const rule = question.skip_if;
  if (!rule) return false;
  const target = BY_ID.get(rule.question);
  const value = valuesAt(answers, target.maps_to[0])[0];
  if (value === undefined) return false;
  if ('equals' in rule) return Array.isArray(value) ? value.length === 1 && value[0] === rule.equals : value === rule.equals;
  /* `excludes` takes one value or several, and several means none of them.
     A bundle is five values in the schema — fixed_bundle, multipack,
     mix_and_match_bundle, bundle, product_set — so a single exclusion would
     have shut the bundle question on a catalogue that sells multipacks. */
  if ('excludes' in rule) {
    const without = Array.isArray(rule.excludes) ? rule.excludes : [rule.excludes];
    return Array.isArray(value) && !without.some((v) => value.includes(v));
  }
  return false;
}

/** @param {object} question @param {object} answers */
const isKnown = (question, answers) => question.maps_to.some((p) => isAnswered(answers, p));

/**
 * Describe a question for the skill: text, help, answer type and allowed values.
 *
 * @param {object} q
 */
/** What an answer changes in the engagement, in words (scope gate, L trigger, exit rule, app signal). */
const DRIVES = new Map([
  ...(offering.scope_gates ?? []).map((g) => [`gate:${g.id}`, `scope gate: ${g.label}`]),
  ...(offering.l_triggers ?? []).map((t) => [`l_trigger:${t.id}`, `larger-engagement trigger: ${t.label ?? t.id}`]),
  ...(offering.exit_rules ?? []).map((r) => [`exit:${r.id}`, `exit rule ${r.id} (${r.result})`]),
  ...(offering.app_signals ?? []).map((a) => [`app:${a.id}`, `app signal: ${String(a.id).replace(/_/g, ' ')}`]),
]);

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
    ...(node && enumValues(node) ? { allowed_values: enumValues(node), option_labels: Object.fromEntries(enumValues(node).map((v) => [v, optionLabel(v)])) } : {}),
    ...(fields ? { item_fields: fields } : {}),
    ...(q.feeds?.length ? { feeds: q.feeds } : {}),
    ...(q.ask_when ? { ask_when: q.ask_when } : {}),
    ...(q.shopify ? { shopify: q.shopify } : {}),
    ...(q.teach ? { teach: q.teach } : {}),
    ...((q.feeds ?? []).length ? { drives: q.feeds.map((f) => DRIVES.get(f) ?? f) } : {}),
  };
}

/**
 * Next questions to ask.
 *
 * @param {import('./session.js').Session} session
 * @param {{ limit?: number }} [options]
 * @returns {{ questions: object[], remaining: number }}
 */
export function nextQuestions(session, { limit = 3, section = null } = {}) {
  if (!hasConsent(session.answers)) {
    return { questions: [describeQuestion(BY_ID.get(CONSENT_QUESTION))], remaining: 1, consent_required: true };
  }
  const stopOpen = hasOpenStop(session);
  const sectionOrder = questionBank.sections.map((s) => s.id);

  const wrapUp = (q) => (q.audience === 'consultant' || q.ask_when === 'stop' ? 1 : 0);
  const open = questionBank.questions
    .map((q, index) => ({ q, index }))
    .filter(({ q }) => inInterview(q, session, stopOpen))
    .filter(({ q }) => !(q.id in session.tbc) && !(q.id in session.skipped) && !(q.id in (session.commented ?? {})))
    .filter(({ q }) => !isKnown(q, session.answers))
    .filter(({ q }) => !isSkippedByRule(q, session.answers))
    .sort((a, b) =>
      wrapUp(a.q) - wrapUp(b.q) ||
      (b.q.ask_when === 'stop' ? 1 : 0) - (a.q.ask_when === 'stop' ? 1 : 0) ||
      sectionOrder.indexOf(SECTION_OF.get(a.q.subsection).id) - sectionOrder.indexOf(SECTION_OF.get(b.q.subsection).id) ||
      (b.q.feeds?.length ? 1 : 0) - (a.q.feeds?.length ? 1 : 0) ||
      a.index - b.index);

  // Where the work sits, so a consultant can see the shape of what is left and
  // go to a part of it. Three cards at a time with no map made "how far through
  // am I" unanswerable and "go back to markets" impossible.
  const bySection = new Map();
  for (const { q } of open) {
    const sec = SECTION_OF.get(q.subsection);
    const entry = bySection.get(sec.id) ?? { id: sec.id, title: sec.title, open: 0 };
    entry.open += 1;
    bySection.set(sec.id, entry);
  }
  const sections = sectionOrder
    .map((id) => bySection.get(id))
    .filter(Boolean);

  const inSection = section
    ? open.filter(({ q }) => SECTION_OF.get(q.subsection).id === section)
    : open;
  const questions = inSection.slice(0, limit).map(({ q }) => ({ ...describeQuestion(q), block: wrapUp(q) ? 'consultant_wrap_up' : 'client' }));
  return {
    questions,
    remaining: open.length,
    remaining_client: open.filter(({ q }) => !wrapUp(q)).length,
    sections,
    section: section ?? null,
    in_section: section ? inSection.length : null,
  };
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
