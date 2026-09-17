/**
 * @file closing.js
 * @description Discovery Closing Document from an interview session, without
 * files (ADR 0016): the engine decides the engagement from the answers, Claude
 * drafts the implementation approach (validated here), the deck builder turns
 * the finalised engagement into deck data, and Claude writes the document from
 * the deck prompt. Same steps as `/discover` + `/deck` in Claude Code.
 *
 * @module discovery/service/closing
 */

import Ajv2020 from 'ajv/dist/2020.js';

import { flattenAnswers, processExtraction } from '../agents/discovery/extract.js';
import { answerValidator, decide, finalize, needsApproach, stopRoute } from '../agents/discovery/engine.js';
import { APPROACH_SYSTEM, approachInput, fromApproachPayload } from '../agents/discovery/approach.js';
import { buildApproachSchema } from '../agents/discovery/extraction-schema.js';
import { buildDeckXml } from '../agents/discovery-deck/build.js';
import { DECK_PROMPT } from '../agents/discovery-deck/prompt.js';
import { selectStories, summariseByEpic } from '../agents/backlog/select.js';
import { openItems } from '../agents/interview/open-items.js';

let approachValidator;

/** @param {object} payload @returns {string[]} */
export function approachErrors(payload) {
  approachValidator ??= new Ajv2020({ strict: false, allErrors: true }).compile(buildApproachSchema());
  return approachValidator(payload) ? [] : approachValidator.errors.map((e) => `${e.instancePath || '/'} ${e.message}`);
}

/**
 * The engagement the engine decides from the interview answers (offer, gates,
 * exit rules, open items) — before the approach is added.
 *
 * @param {import('../agents/interview/session.js').Session} session
 * @param {string} today
 * @returns {{ ok: true, doc: object } | { ok: false, errors: string[] }}
 */
export function decideFromSession(session, today) {
  const options = { today, clientSlug: session.client, source: 'chatbot' };
  const data = {
    answers: flattenAnswers(session.answers),
    provenance: Object.entries(session.provenance).map(([pointer, p]) => ({ pointer, source: p.source, status: p.status, question_id: p.question_id ?? '', note: p.note ?? '' })),
    exit_candidates: [],
    open_items: openItems(session),
  };
  const { errors, ...extraction } = processExtraction(data, answerValidator(options));
  if (errors.length) return { ok: false, errors };
  try {
    const notes = session.notes.map((n) => ({ author_role: 'consultant', at: n.at, text: n.text }));
    return { ok: true, doc: decide({ ...extraction, notes }, options) };
  } catch (err) {
    return { ok: false, errors: err.errors ?? [err.message] };
  }
}

/** Status of the engagement for the closing document. @param {object} doc */
export function closingStatus(doc) {
  const route = stopRoute(doc);
  if (doc.delivery?.go) return { decision: 'GO', offer: `${doc.offer.code} · ${doc.offer.name}`, route: null };
  return { decision: 'STOP', offer: `${doc.offer.code} · ${doc.offer.name}`, route: route?.label ?? null };
}

/**
 * What Claude needs to draft the approach.
 *
 * @param {object} doc
 */
export const approachBrief = (doc) => ({
  instructions: `${APPROACH_SYSTEM}\n\nReturn one JSON object matching approach_schema (capability_map, app_shortlist, assumptions, phases). Use "" for empty text, -1 / "unknown" for unknown app costs, "none" for tasks without a capability.`,
  engagement: approachInput(doc),
  approach_schema: buildApproachSchema(),
});

/**
 * Finalise the engagement with an approach (null when none is needed).
 *
 * @param {object} doc @param {object|null} approachPayload
 * @returns {{ ok: true, engagement: object } | { ok: false, errors: string[] }}
 */
export function finaliseEngagement(doc, approachPayload) {
  if (needsApproach(doc)) {
    if (!approachPayload) return { ok: false, errors: ['The implementation approach is not drafted yet'] };
    const shape = approachErrors(approachPayload);
    if (shape.length) return { ok: false, errors: shape };
  }
  try {
    return { ok: true, engagement: finalize(doc, needsApproach(doc) ? fromApproachPayload(approachPayload) : null) };
  } catch (err) {
    return { ok: false, errors: err.errors ?? [err.message] };
  }
}

/**
 * Deck data and the prompt Claude follows to write the document.
 *
 * @param {object} engagement  Finalised engagement
 */
export function deckBrief(engagement) {
  const stories = engagement.delivery?.go ? selectStories(engagement) : null;
  const backlog = stories ? { stories, summary: summariseByEpic(stories) } : null;
  const { xml, warnings } = buildDeckXml(engagement, backlog);
  return {
    instructions: `${DECK_PROMPT}\n\nThe deck data below (deck_xml) is the content of discovery-deck.xml. Write the complete document in Markdown and save it with save_closing_document.`,
    deck_xml: xml,
    warnings,
  };
}

export { needsApproach };
