/**
 * @file go-no-go.js
 * @description What a Solution Architect brings to the bid/no-bid meeting.
 *
 * The decision itself is taken in a room, by people, weighing things this tool
 * knows nothing about — the client relationship, the pipeline, who else is
 * pitching. So this is not a verdict and it never renders one. It is the evidence
 * the architect is asked for and usually has to assemble by hand the night
 * before: can we actually price this from what we were sent, what does the
 * document commit us to that we would rather it did not, where does it land, and
 * what are we betting on being true.
 *
 * Every number here is already computed by the engine. Nothing is invented for
 * the dashboard, because a bid decision made on a made-up number is worse than
 * one made on none.
 *
 * @module discovery/service/go-no-go
 */

import { clarificationBrief } from '../agents/discovery/clarifications.js';
import { statedAssumptions } from './assumptions.js';

/** How a fired rule reads on a risk matrix, worst first. */
const SEVERITY = { STOP: 0, FLAG: 1, WARN: 2 };
const SEVERITY_LABEL = {
  STOP: 'Outside the standard offers',
  FLAG: 'Needs a named owner before build',
  WARN: 'Commercial adjustment',
};

/**
 * How much of what we need the document actually told us.
 *
 * A bid written on a quarter of the answers is not a bid, it is a guess with a
 * price on it — and this is the number nobody computes before saying yes.
 */
function evidence(coverage, brief) {
  const total = coverage?.required_total ?? 0;
  const answered = coverage?.required_answered ?? 0;
  const pct = total ? Math.round((answered / total) * 100) : 0;
  return {
    answered,
    total,
    pct,
    // Topics the engine will not price around: they move the offer, the plan, the
    // topology or the cost, and no safe assumption exists for them.
    open_topics: brief.topics.length,
    cannot_price: brief.cannot_price_until_answered,
    // Deliberately banded rather than scored. A single number invites the meeting
    // to argue with the number instead of with the gaps behind it.
    verdict: pct >= 80 && !brief.cannot_price_until_answered.length
      ? 'enough to price'
      : pct >= 55
        ? 'priceable with stated assumptions'
        : 'not enough to price without asking',
  };
}

/**
 * The evidence for the decision. Never the decision.
 *
 * @param {object} doc  decided engagement
 * @param {object} coverage  required-question coverage from the engine preview
 * @param {{ questions?: object[] }|null} clarifications
 */
export function goNoGoView(doc, coverage, clarifications) {
  const brief = clarificationBrief(doc);
  const items = (doc.exits?.items ?? []).slice().sort((a, b) => (SEVERITY[a.result] ?? 3) - (SEVERITY[b.result] ?? 3));
  const assumptions = statedAssumptions(doc, clarifications);
  const topology = doc.markets?.topology ?? null;

  return {
    evidence: evidence(coverage, brief),
    fit: {
      offer: doc.offer?.code ?? null,
      name: doc.offer?.name ?? null,
      within_offers: Boolean(doc.delivery?.go),
      route: doc.delivery?.route ?? null,
      plan: doc.shopify?.plan_suggestion?.plan ?? doc.shopify?.target_plan ?? null,
      markets: (doc.markets?.list ?? []).length,
      topology: topology ? { recommendation: topology.recommendation, confidence: topology.confidence } : null,
    },
    risks: items.map((i) => ({
      rule_id: i.rule_id,
      result: i.result,
      severity: SEVERITY_LABEL[i.result] ?? i.result,
      evidence: i.evidence,
      destination: i.destination ?? null,
    })),
    risk_counts: {
      stop: items.filter((i) => i.result === 'STOP').length,
      flag: items.filter((i) => i.result === 'FLAG').length,
      warn: items.filter((i) => i.result === 'WARN').length,
    },
    // What we would be betting on. The count is the headline: a proposal resting
    // on fourteen assumptions is a different commercial object from one resting
    // on two, whatever the price says.
    betting_on: assumptions.slice(0, 8),
    assumptions_total: assumptions.length,
    // The questions that would most change the answer, so the meeting can decide
    // to spend the Q&A window rather than guess.
    would_settle_it: brief.topics.map((t) => ({ title: t.title, changes: t.changes, settles: t.covers.length })),
  };
}
