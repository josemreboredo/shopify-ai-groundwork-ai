/**
 * @file engine.js
 * @description Discovery engine orchestration (implementation plan Phase 2):
 *   consent → redaction → LLM extraction → offer (code) → exit rules (code)
 *   → approach (LLM, on GO or when a STOP is routed to a Larger Engagement)
 *   → schema validation.
 *
 * @module discovery/engine
 */

import { validateEngagement, offering } from '../../schema/index.js';
import { hasConsent, redactQuestionnaire, InputRejectedError } from './input.js';
import { extractAnswers, flattenAnswers } from './extract.js';
import { isNotSure } from './values.js';
import { classifyOffer } from './classify.js';
import { evaluateTopology } from './topology.js';
import { evaluateExits } from './exits.js';
import { draftApproach } from './approach.js';
import { planSuggestion } from './plan.js';

/** Routes after a STOP that still draft the full approach (Larger Engagement). */
const DRAFTING_ROUTES = new Set(offering.routes.filter((r) => r.brief).map((r) => r.id));

/**
 * The route a STOP engagement follows, or null on GO / no decision.
 *
 * @param {object} doc
 * @returns {object|null}  offering.routes entry
 */
export function stopRoute(doc) {
  if (doc.delivery?.go !== false || !doc.delivery?.route) return null;
  return offering.routes.find((r) => r.id === doc.delivery.route) ?? null;
}

/**
 * Whether an approach must be drafted: on GO, or on a STOP routed to a Larger
 * Engagement.
 *
 * @param {object} doc
 */
export const needsApproach = (doc) => doc.delivery?.go === true || DRAFTING_ROUTES.has(stopRoute(doc)?.id);

class EngagementInvalidError extends Error {
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
 * @param {{ today: string, clientSlug?: string, source?: 'questionnaire'|'chatbot'|'brief' }} options
 */
export function assemble(answers, { today, clientSlug, source = 'questionnaire' }) {
  const { meta = {}, ...rest } = structuredClone(answers);
  // B2B follows the business model unless answered explicitly (question bank 1.1.0: DTC → no B2B; B2B or hybrid → B2B).
  const model = meta.client?.business_model;
  if (model && rest.b2b?.enabled === undefined) rest.b2b = { ...rest.b2b, enabled: model !== 'dtc' };
  return {
    schema_version: '1.0.0',
    meta: {
      ...meta,
      client: { ...meta.client, ...(clientSlug ? { slug: clientSlug } : {}) },
      source,
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
 * Deterministic part after extraction: offer, exit rules, GO/STOP, provenance,
 * open items and consultant notes. An open item for the Shopify plan says which
 * answers already require Plus.
 *
 * @param {{ answers: object, provenance: object, openItems: object[], exitCandidates: object[], notes?: object[] }} extraction
 * @param {{ today: string, clientSlug?: string }} options
 * @returns {object}  Engagement without approach content (risks.open_items only)
 */
/** Who is merchant of record, derived from the topology and the client's tax appetite. */
function crossBorderModel(doc, topology) {
  if (topology.recommendation === 'single_store_managed_markets') return 'managed_markets';
  if (doc.markets?.tax_registration_appetite === 'prefer_partner') return 'third_party_mor_app';
  return 'self_managed_markets';
}

export function decide(extraction, options) {
  /** @type {any} */
  const doc = assemble(extraction.answers, options);
  const topology = evaluateTopology(doc);
  if (topology) {
    // Derived, never answered: the questionnaire asks about the business, the
    // engine decides the architecture (docs/market-topology-audit.md).
    doc.markets = { ...doc.markets, topology, cross_border_model: crossBorderModel(doc, topology) };
  }
  doc.offer = classifyOffer(doc);
  doc.exits = evaluateExits(doc, extraction.exitCandidates);
  doc.delivery = { ...(doc.delivery ?? {}), go: !doc.exits.triggered };
  if (Object.keys(extraction.provenance).length) doc.provenance = extraction.provenance;
  if (extraction.notes?.length) doc.notes = extraction.notes;
  const plan = planSuggestion(doc);
  const notSure = flattenAnswers(extraction.answers)
    .filter((a) => isNotSure(JSON.parse(a.value_json)) && !extraction.openItems.some((o) => o.pointer === a.pointer))
    .map((a) => ({ pointer: a.pointer, question_id: extraction.provenance?.[a.pointer]?.question_id ?? '', why: 'Client not sure yet — confirm before scoping' }))
    .map(({ question_id, ...item }) => (question_id ? { ...item, question_id } : item));
  const openItems = [...extraction.openItems, ...notSure].map((item) => (plan && item.pointer === plan.pointer
    ? { ...item, why: `${item.why} — minimum plan for these answers: ${plan.value} (${plan.reasons.join('; ')})` }
    : item));
  doc.approach = { risks: { open_items: openItems } };
  return doc;
}

/**
 * Merge the drafted approach and validate the complete engagement.
 *
 * @param {object} doc       Output of decide()
 * @param {object|null} approach  Output of fromApproachPayload(), or null when no approach is needed
 * @returns {object}
 * @throws {EngagementInvalidError}
 */
export function finalize(doc, approach) {
  const out = structuredClone(doc);
  if (needsApproach(out)) {
    if (!approach) throw new Error(out.delivery.go ? 'A GO engagement needs a drafted approach.' : `A STOP routed to ${stopRoute(out).label} needs a drafted approach.`);
    out.approach = { ...approach, risks: { open_items: doc.approach.risks.open_items, assumptions: approach.risks?.assumptions ?? [], ...(approach.risks?.register?.length ? { register: approach.risks.register } : {}) } };
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
  if (needsApproach(doc)) {
    onStep('approach');
    approach = await draftApproach(llm, doc);
  }
  const engagement = finalize(doc, approach);
  return { engagement, go: engagement.delivery.go, redactions, model: extraction.model, repaired: extraction.repaired };
}
