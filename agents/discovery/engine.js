/**
 * @file engine.js
 * @description Discovery engine orchestration (implementation plan Phase 2):
 *   consent → redaction → LLM extraction → offer (code) → exit rules (code)
 *   → approach (LLM, GO only) → schema validation.
 *
 * @module discovery/engine
 */

import { validateEngagement } from '../../schema/index.js';
import { hasConsent, redactQuestionnaire, InputRejectedError } from './input.js';
import { extractAnswers } from './extract.js';
import { classifyOffer } from './classify.js';
import { evaluateExits } from './exits.js';
import { draftApproach } from './approach.js';

export class EngagementInvalidError extends Error {
  /** @param {string[]} errors */
  constructor(errors) {
    super(`Engagement failed schema validation:\n  • ${errors.slice(0, 20).join('\n  • ')}`);
    this.name = 'EngagementInvalidError';
    this.errors = errors;
  }
}

/**
 * Wrap extracted answers in the engine-owned envelope.
 *
 * @param {object} answers
 * @param {{ today: string, clientSlug?: string }} options
 */
export function assemble(answers, { today, clientSlug }) {
  const { meta = {}, ...rest } = structuredClone(answers);
  return {
    schema_version: '1.0.0',
    meta: {
      ...meta,
      client: { ...meta.client, ...(clientSlug ? { slug: clientSlug } : {}) },
      source: 'questionnaire',
      created_at: meta.created_at ?? today,
      updated_at: today,
    },
    ...rest,
  };
}

/**
 * Consent check and redaction — the only step that reads the raw questionnaire.
 *
 * @param {string} questionnaire
 * @returns {{ text: string, redactions: { emails: number, phones: number, names: number } }}
 */
export function prepareQuestionnaire(questionnaire) {
  if (!hasConsent(questionnaire)) {
    throw new InputRejectedError('Consent for AI processing is not recorded (Q10.5.2 must be ticked "Yes") — nothing was sent to the model.');
  }
  return redactQuestionnaire(questionnaire);
}

/**
 * Validator for extracted answers, used by both the API and Claude Code paths.
 *
 * @param {{ today: string, clientSlug?: string }} options
 * @returns {(answers: object) => string[]}
 */
export function answerValidator(options) {
  return (answers) => {
    const { valid, errors } = validateEngagement(assemble(answers, options));
    return valid ? [] : errors;
  };
}

/**
 * Deterministic part after extraction: offer, exit rules, GO/STOP, provenance, open items.
 *
 * @param {{ answers: object, provenance: object, openItems: object[], exitCandidates: object[] }} extraction
 * @param {{ today: string, clientSlug?: string }} options
 * @returns {object}  Engagement without approach content (risks.open_items only)
 */
export function decide(extraction, options) {
  /** @type {any} */
  const doc = assemble(extraction.answers, options);
  doc.offer = classifyOffer(doc);
  doc.exits = evaluateExits(doc, extraction.exitCandidates);
  doc.delivery = { ...(doc.delivery ?? {}), go: !doc.exits.triggered };
  if (Object.keys(extraction.provenance).length) doc.provenance = extraction.provenance;
  doc.approach = { risks: { open_items: extraction.openItems } };
  return doc;
}

/**
 * Merge the drafted approach (GO only) and validate the complete engagement.
 *
 * @param {object} doc       Output of decide()
 * @param {object|null} approach  Output of fromApproachPayload(), or null on STOP
 * @returns {object}
 * @throws {EngagementInvalidError}
 */
export function finalize(doc, approach) {
  const out = structuredClone(doc);
  if (out.delivery.go) {
    if (!approach) throw new Error('A GO engagement needs a drafted approach.');
    out.approach = { ...approach, risks: { open_items: doc.approach.risks.open_items, assumptions: approach.risks?.assumptions ?? [] } };
  }
  const { valid, errors } = validateEngagement(out);
  if (!valid) throw new EngagementInvalidError(errors);
  return out;
}

/**
 * @typedef {Object} DiscoveryResult
 * @property {object}  engagement   Schema-valid engagement document
 * @property {boolean} go
 * @property {{ emails: number, phones: number, names: number }} redactions
 * @property {string}  model
 * @property {boolean} repaired
 */

/**
 * Run discovery through the Anthropic API adapter.
 *
 * @param {Object} options
 * @param {string} options.questionnaire  Markdown text
 * @param {{ callStructured: Function, model?: string }} options.llm
 * @param {string} options.today          YYYY-MM-DD, used when the questionnaire has no date
 * @param {string} [options.clientSlug]   Overrides the extracted slug
 * @param {(step: string, detail?: unknown) => void} [options.onStep]  Progress callback
 * @returns {Promise<DiscoveryResult>}
 */
export async function runDiscovery({ questionnaire, llm, today, clientSlug, onStep = () => {} }) {
  const { text, redactions } = prepareQuestionnaire(questionnaire);
  const options = { today, clientSlug };

  const extraction = await extractAnswers(llm, text, answerValidator(options), onStep);
  const doc = decide(extraction, options);

  let approach = null;
  if (doc.delivery.go) {
    onStep('approach');
    approach = await draftApproach(llm, doc);
  }
  const engagement = finalize(doc, approach);
  return { engagement, go: engagement.delivery.go, redactions, model: extraction.model, repaired: extraction.repaired };
}
