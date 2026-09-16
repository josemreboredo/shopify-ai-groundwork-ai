/**
 * @file approach.js
 * @description LLM drafting of the implementation approach (capability map,
 * app shortlist, assumptions, phased plan) from the engagement answers.
 * Only runs on GO. The model never sees internal pricing or modifiers.
 *
 * @module discovery/approach
 */

import { buildApproachSchema } from './extraction-schema.js';

export const APPROACH_SYSTEM = `You are a senior Shopify solutions architect at Merkle drafting the implementation approach for a discovery engagement. A lead consultant reviews everything you write before the client sees it.

Capability map
- One row per client requirement found in the engagement. Resolve each at the cheapest safe level, in order: native Shopify feature → Shopify App Store app → theme customisation (Liquid / Horizon blocks) → custom (metafields, metaobjects, Shopify Functions, custom app). Do not skip a level without saying why in notes.
- gaia_tier: T1 trivial configuration · T2 standard work on existing patterns · T3 new capability, integration or data model · T4 foundational (payments provider, PCI, re-platforming).
- question_ids: the questionnaire questions the requirement comes from (ids from the provenance map when available).

App shortlist
- Recommend only apps a requirement needs; prefer native features. Include apps you considered and rejected, with rejection_reason.
- Costs: typical public list price as a number with currency and period, and note "verify current pricing on the Shopify App Store". If unknown, omit cost.

Assumptions
- State assumptions you made where answers were missing or ambiguous, and the impact if wrong.

Phases
- Phase 1 delivers the launch scope in sprints; later phases hold deferred items (mark tasks deferred: true). Owner is consultant, agent, designer, developer or client.
- The delivery track is given (liquid = Shopify Horizon theme; hydrogen = headless Hydrogen storefront). Plan accordingly.
- Respect open exit-rule flags: plan the scoping work they require.

Never include prices for Merkle's services, internal modifiers or commercial terms.`;

/**
 * Engagement view sent to the model: answers, offer code/track and exits —
 * without price band, modifiers or rationale.
 *
 * @param {object} doc
 */
export function approachInput(doc) {
  const { offer, approach, provenance, notes, ...answers } = doc;
  return {
    ...answers,
    offer: { code: offer.code, name: offer.name, delivery_track: offer.delivery_track, scope_gates: offer.scope_gates, l_triggers: offer.l_triggers },
    question_ids_by_answer: Object.fromEntries(
      Object.entries(provenance ?? {}).map(([pointer, p]) => [pointer, p.question_id]).filter(([, id]) => id),
    ),
  };
}

/**
 * Draft the approach for a GO engagement.
 *
 * @param {{ callStructured: Function }} llm
 * @param {object} doc  Engagement with offer and exits computed
 * @returns {Promise<object>}  capability_map, app_shortlist, risks.assumptions, phases
 */
export async function draftApproach(llm, doc) {
  const { data } = await llm.callStructured({
    system: APPROACH_SYSTEM,
    user: `Engagement (JSON):\n\n${JSON.stringify(approachInput(doc), null, 2)}`,
    schema: buildApproachSchema(),
  });
  return data;
}
