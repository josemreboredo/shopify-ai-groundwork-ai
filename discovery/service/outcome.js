/**
 * @file outcome.js
 * @description What happened to the bid.
 *
 * The tool could record that a bid was won and nothing else. Not that one was
 * lost, not what was submitted, not that Merkle decided not to bid at all — so
 * the one dataset only Merkle can accumulate was being thrown away on every
 * engagement, and a year from now nobody could say whether any of this works.
 *
 * Every number in this tool today is derived from the offering: the S/M/L bands
 * and the effort modifiers rest on no delivered Shopify project, because there
 * has not been one. This is the file that eventually fixes that. Ten recorded
 * bids give a hit rate; ten recorded submissions against the engine's own
 * classification give the first calibration the price bands have ever had.
 *
 * It records, and it does not compute. A hit rate from four bids is a number
 * that will be quoted in a meeting, so nothing is averaged here until there is
 * something honest to average — the page says how far off that is instead.
 *
 * @module discovery/service/outcome
 */

/** What can happen to a bid, and what each one means. */
export const OUTCOMES = {
  submitted: { label: 'Submitted', meaning: 'The proposal went to the client and the decision is theirs' },
  won: { label: 'Won', meaning: 'Merkle was appointed' },
  lost: { label: 'Lost', meaning: 'The client appointed somebody else, or nobody' },
  no_bid: { label: 'No bid', meaning: 'Merkle decided not to respond' },
  withdrawn: { label: 'Withdrawn', meaning: 'Merkle pulled out after starting' },
};

export const OUTCOME_IDS = Object.keys(OUTCOMES);

/** Outcomes that close a bid. A submission is still in play. */
const CLOSED = new Set(['won', 'lost', 'no_bid', 'withdrawn']);

/**
 * The record for one engagement.
 *
 * The engine's own position is frozen with it — what it classified, what it
 * said about pricing, how much it had to assume. Without that the outcome is
 * just a win or a loss; with it, ten of them say whether the engine was right.
 *
 * @param {object} session
 * @param {{ outcome: string, submitted_price?: number, currency?: string, note?: string }} input
 * @param {{ position?: object, offer?: object, by: string, at: string }} context
 */
export function record(session, { outcome, submitted_price, currency, note }, { position, offer, by, at }) {
  const history = session.outcome?.history ?? [];
  const entry = {
    outcome,
    at,
    by,
    ...(submitted_price !== undefined && submitted_price !== null ? { submitted_price, currency: currency ?? null } : {}),
    ...(note?.trim() ? { note: note.trim() } : {}),
    // Frozen, because the engagement keeps moving and the question a year from
    // now is what the engine said at the time, not what it says now.
    as_at: {
      ...(offer ? { offer: offer.code ?? null, within_offers: Boolean(offer.go), route: offer.route ?? null } : {}),
      ...(position ? { verdict: position.verdict ?? null, assumptions: position.assumptions ?? null, decisions_settled: position.decisions_settled ?? null } : {}),
    },
  };
  return { current: outcome, closed: CLOSED.has(outcome), history: [...history, entry] };
}

/**
 * What the ledger can say, and what it cannot say yet.
 *
 * @param {object[]} records  one per engagement: { client, outcome, history }
 * @param {{ minimum?: number }} [options]  minimum: bids before a rate is quoted
 */
export function ledger(records, { minimum = 10 } = {}) {
  const closed = records.filter((r) => CLOSED.has(r.outcome));
  const decided = closed.filter((r) => r.outcome === 'won' || r.outcome === 'lost');
  const counts = Object.fromEntries(OUTCOME_IDS.map((id) => [id, records.filter((r) => r.outcome === id).length]));
  return {
    recorded: records.length,
    closed: closed.length,
    counts,
    // A hit rate from four bids is a number somebody will quote. It is withheld
    // until there is something honest to average, and the gap is stated rather
    // than the number being softened.
    hit_rate: decided.length >= minimum
      ? { of: decided.length, won: decided.filter((r) => r.outcome === 'won').length }
      : null,
    needs: Math.max(0, minimum - decided.length),
    why_not_yet: decided.length >= minimum
      ? null
      : `${decided.length} bid${decided.length === 1 ? '' : 's'} have been won or lost. A rate out of ${decided.length} is a number a meeting will quote and a number nothing supports; ${minimum} is where it starts meaning something.`,
  };
}
