/**
 * @file approach.js
 * @description LLM drafting of the implementation approach (capability map,
 * app shortlist, assumptions, phased plan) from the engagement answers.
 * Only runs on GO. The model never sees internal pricing or modifiers.
 *
 * @module discovery/approach
 */

import { buildApproachSchema } from './extraction-schema.js';
import { appSignals } from './app-signals.js';

export const APPROACH_SYSTEM = `You are a senior Shopify solutions architect at Merkle drafting the implementation approach for a discovery engagement. A lead consultant reviews everything you write before the client sees it.

Capability map
- One row per client requirement found in the engagement. Resolve each at the cheapest safe level, in order: native Shopify feature → Shopify App Store app → theme customisation (Liquid / Horizon blocks) → custom (metafields, metaobjects, Shopify Functions, custom app). Do not skip a level without saying why in notes.
- gaia_tier: T1 trivial configuration · T2 standard work on existing patterns · T3 new capability, integration or data model · T4 foundational (payments provider, PCI, re-platforming).
- question_ids: the questionnaire questions the requirement comes from (ids from the provenance map when available).

App shortlist
- Recommend only apps a requirement needs; prefer native features. Include apps you considered and rejected, with rejection_reason.
- app_signals lists, per area, the answers that go beyond native Shopify (returns platform, post-purchase tracking platform, order editing, warranty claims). An empty list means native Shopify is enough: return rules and self-serve returns, staff refunds and exchanges, the order status page and email/SMS shipping notifications. For a non-empty list, recommend one app per area that covers all listed reasons (prefer an app the client already uses or prefers, see post_purchase.platform_preference and shipping.returns.solution) and quote the reasons in rationale.
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
    app_signals: appSignals(doc),
    question_ids_by_answer: Object.fromEntries(
      Object.entries(provenance ?? {}).map(([pointer, p]) => [pointer, p.question_id]).filter(([, id]) => id),
    ),
  };
}

/** Drop empty-string properties from an object. */
const compact = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined));

/**
 * Convert the all-required structured output into the engagement `approach`
 * shape: empty strings removed, cost fields regrouped, "none" capability dropped.
 *
 * @param {object} payload
 * @returns {object}  capability_map, app_shortlist, phases, risks.assumptions
 */
export function fromApproachPayload(payload) {
  return {
    capability_map: (payload.capability_map ?? []).map((row) => {
      const out = compact(row);
      if (!out.question_ids?.length) delete out.question_ids;
      return out;
    }),
    app_shortlist: (payload.app_shortlist ?? []).map(({ cost_amount, cost_currency, cost_period, cost_note, ...app }) => {
      const out = compact(app);
      if (out.recommended) delete out.rejection_reason;
      const cost = compact({
        ...(cost_amount >= 0 && cost_period !== 'unknown' ? { amount: cost_amount, period: cost_period } : {}),
        currency: cost_currency,
        note: cost_note,
      });
      if (Object.keys(cost).length) out.cost = cost;
      return out;
    }),
    phases: (payload.phases ?? []).map((phase) => ({
      name: phase.name,
      sprints: phase.sprints.map((sprint) => ({
        name: sprint.name,
        tasks: sprint.tasks.map(({ capability, deferred, ...task }) => ({
          ...compact(task),
          ...(capability !== 'none' ? { capability } : {}),
          ...(deferred ? { deferred: true } : {}),
        })),
      })),
    })),
    risks: { assumptions: (payload.assumptions ?? []).map(compact) },
  };
}

/**
 * Inverse of fromApproachPayload — encodes a stored approach as the model's
 * output shape. Used to replay recorded engagements in tests.
 *
 * @param {object} approach
 * @returns {object}
 */
export function toApproachPayload(approach) {
  return {
    capability_map: (approach.capability_map ?? []).map((r) => ({
      requirement: r.requirement, resolution: r.resolution, tool: r.tool ?? '', gaia_tier: r.gaia_tier ?? 'T2',
      notes: r.notes ?? '', question_ids: r.question_ids ?? [],
    })),
    app_shortlist: (approach.app_shortlist ?? []).map((a) => ({
      name: a.name, url: a.url ?? '', requirement: a.requirement ?? '', rationale: a.rationale ?? '', limitations: a.limitations ?? '',
      cost_amount: a.cost?.amount ?? -1, cost_currency: a.cost?.currency ?? '', cost_period: a.cost?.period ?? 'unknown', cost_note: a.cost?.note ?? '',
      integration_complexity: a.integration_complexity ?? 'none', gaia_tier: a.gaia_tier ?? 'T1',
      recommended: a.recommended, rejection_reason: a.rejection_reason ?? '',
    })),
    assumptions: (approach.risks?.assumptions ?? []).map((x) => ({ statement: x.statement, impact_if_wrong: x.impact_if_wrong ?? '' })),
    phases: (approach.phases ?? []).map((p) => ({
      name: p.name,
      sprints: p.sprints.map((sp) => ({
        name: sp.name,
        tasks: sp.tasks.map((t) => ({
          title: t.title, capability: t.capability ?? 'none', gaia_tier: t.gaia_tier ?? 'T2', owner: t.owner ?? 'agent', deferred: t.deferred ?? false,
        })),
      })),
    })),
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
  return fromApproachPayload(data);
}
