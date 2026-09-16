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
 * @typedef {Object} DiscoveryResult
 * @property {object}  engagement   Schema-valid engagement document
 * @property {boolean} go
 * @property {{ emails: number, phones: number, names: number }} redactions
 * @property {string}  model
 */

/**
 * Run discovery for one completed questionnaire.
 *
 * @param {Object} options
 * @param {string} options.questionnaire  Markdown text
 * @param {{ callStructured: Function, model?: string }} options.llm
 * @param {string} options.today          YYYY-MM-DD, used when the questionnaire has no date
 * @param {string} [options.clientSlug]   Overrides the extracted slug
 * @returns {Promise<DiscoveryResult>}
 */
export async function runDiscovery({ questionnaire, llm, today, clientSlug }) {
  if (!hasConsent(questionnaire)) {
    throw new InputRejectedError('Consent for AI processing is not recorded (Q10.5.2 must be ticked "Yes") — nothing was sent to the model.');
  }
  const { text, redactions } = redactQuestionnaire(questionnaire);

  const extraction = await extractAnswers(llm, text);
  const { meta, ...answers } = extraction.answers;

  /** @type {any} */
  const doc = {
    schema_version: '1.0.0',
    meta: {
      ...meta,
      client: { ...meta.client, ...(clientSlug ? { slug: clientSlug } : {}) },
      source: 'questionnaire',
      created_at: meta.created_at ?? today,
      updated_at: today,
    },
    ...answers,
  };

  doc.offer = classifyOffer(doc);
  doc.exits = evaluateExits(doc, extraction.exitCandidates);
  doc.delivery = { ...(doc.delivery ?? {}), go: !doc.exits.triggered };
  if (Object.keys(extraction.provenance).length) doc.provenance = extraction.provenance;

  const risks = { open_items: extraction.openItems };
  if (doc.delivery.go) {
    const approach = await draftApproach(llm, doc);
    doc.approach = { ...approach, risks: { ...risks, assumptions: approach.risks?.assumptions ?? [] } };
  } else {
    doc.approach = { risks };
  }

  const { valid, errors } = validateEngagement(doc);
  if (!valid) throw new EngagementInvalidError(errors);

  return { engagement: doc, go: doc.delivery.go, redactions, model: extraction.model };
}
