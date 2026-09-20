/**
 * @file go-no-go.js
 * @description What the Solution Architect brings to the Go/No-Go meeting.
 *
 * Merkle's bid decision runs off a scorecard of twenty-eight questions across
 * three headings — is it deliverable, is it profitable, is it winnable. The
 * architect does not answer twenty-eight of them. Most are commercial: the
 * opportunity value in Salesforce, the NPS, who sits in the buying centre, how
 * many competitors, whether a pitch team is confirmed. Guessing at those from an
 * RFP would be worse than leaving them blank, because a number on a scorecard
 * gets treated as a fact.
 *
 * So this answers the ones the engine can actually evidence, in the order the
 * meeting asks them, and names an owner for every one it cannot. Being explicit
 * about the boundary is half the value: nobody arrives expecting an answer that
 * was never coming.
 *
 * The question this page exists for is number 20 — "based on the RFP, can we
 * grasp a scope that can be estimated and leads to comparable offers?" That is
 * the architect's question, and everything else here supports it.
 *
 * @module discovery/service/go-no-go
 */

import { clarificationBrief } from '../agents/discovery/clarifications.js';
import { statedAssumptions } from './assumptions.js';
import { selectStories, summariseByEpic } from '../agents/backlog/select.js';

const SEVERITY = { STOP: 0, FLAG: 1, WARN: 2 };
const SEVERITY_LABEL = {
  STOP: 'Outside the standard offers',
  FLAG: 'Needs a named owner before build',
  WARN: 'Commercial adjustment',
};

/** Scope gates and L triggers read as capabilities the RFP is asking us for. */
const CAPABILITY = {
  markets: 'Selling into several markets',
  multi_currency: 'Multiple transactional currencies',
  b2b: 'B2B / wholesale',
  integration: 'Integration with the client’s systems',
  migration: 'Migration from another platform',
  sku_complexity: 'A complex catalogue',
  retail_pos: 'Retail / point of sale',
  luxury: 'Luxury-grade experience',
  headless: 'Headless storefront',
  figma_design_system: 'A full design system',
};

const TRACK = { liquid: 'Shopify Online Store (Horizon theme)', hydrogen: 'Headless Hydrogen on Oxygen' };

const money = (band) => (band ? `${band.currency ?? ''} ${Math.round(band.min / 1000)}k–${Math.round(band.max / 1000)}k${band.open_ended ? '+' : ''}`.trim() : null);
const weeks = (w) => (w ? (w.min === w.max ? `${w.min}` : `${w.min}–${w.max}`) : null);

const ROUTE = {
  larger_engagement: 'a Merkle Enterprise Engagement with a dedicated Discovery Phase',
  no_bid: 'no bid',
};

/**
 * Whether the offer classification is actually the answer.
 *
 * The engine keeps emitting offer.code even when an exit rule takes the
 * engagement beyond the offers, because the classification is a real thing: it is
 * what the scope gates say. It just stops being the answer. Reading it without
 * checking delivery.go produced a page that said "beyond S/M/L" in one question
 * and quoted M's price band three questions later — into a bid meeting, where
 * somebody writes the number down and a bespoke engagement gets sold at the price
 * of a standard one.
 *
 * So the offer is resolved once, here, and the band exists only when it applies.
 *
 * @param {object} doc
 */
function offerOf(doc) {
  const applies = Boolean(doc.delivery?.go);
  const stops = (doc.exits?.items ?? []).filter((i) => i.result === 'STOP');
  return {
    applies,
    code: doc.offer?.code ?? null,
    name: doc.offer?.name ?? null,
    track: doc.offer?.delivery_track ?? null,
    weeks: applies ? weeks(doc.offer?.duration_weeks) : null,
    band: applies ? doc.offer?.price_band ?? null : null,
    route: doc.delivery?.route ?? null,
    why_not: stops.map((i) => `${i.rule_id}: ${i.evidence}`),
  };
}

/**
 * How much of what sets the price the document actually told us.
 *
 * Banded, never scored. A single number invites the meeting to argue with the
 * number instead of with the gaps behind it.
 */
function evidenceOf(coverage, brief) {
  const total = coverage?.required_total ?? 0;
  const answered = coverage?.required_answered ?? 0;
  const pct = total ? Math.round((answered / total) * 100) : 0;
  return {
    answered,
    total,
    pct,
    open_topics: brief.topics.length,
    cannot_price: brief.cannot_price_until_answered,
    verdict: pct >= 80 && !brief.cannot_price_until_answered.length
      ? 'enough to price'
      : pct >= 55
        ? 'priceable with stated assumptions'
        : 'not enough to price without asking',
  };
}

/** The capabilities this RFP is asking Merkle for, each with the answer that says so. */
function capabilities(doc) {
  const gates = Object.entries(doc.offer?.scope_gates ?? {}).filter(([, g]) => g.active);
  const triggers = Object.entries(doc.offer?.l_triggers ?? {}).filter(([, t]) => t.active);
  return [...gates, ...triggers].map(([id, g]) => ({
    id,
    capability: CAPABILITY[id] ?? id.replace(/_/g, ' '),
    evidence: g.evidence,
  }));
}

/**
 * The scorecard, as the meeting reads it.
 *
 * @param {object} doc  decided engagement
 * @param {object} coverage  required-question coverage from the engine preview
 * @param {{ questions?: object[] }|null} clarifications
 * @param {{ pricing?: boolean }} [options]  pricing: include Merkle's internal bands
 */
export function goNoGoView(doc, coverage, clarifications, { pricing = false } = {}) {
  const brief = clarificationBrief(doc);
  const evidence = evidenceOf(coverage, brief);
  const assumptions = statedAssumptions(doc, clarifications);
  const items = (doc.exits?.items ?? []).slice().sort((a, b) => (SEVERITY[a.result] ?? 3) - (SEVERITY[b.result] ?? 3));
  const stops = items.filter((i) => i.result === 'STOP');
  const go = Boolean(doc.delivery?.go);
  const offer = offerOf(doc);
  const caps = capabilities(doc);
  const stories = go ? selectStories(doc) : [];
  const byOwner = {};
  for (const s of stories) byOwner[s.owner] = (byOwner[s.owner] ?? 0) + 1;
  const topology = doc.markets?.topology ?? null;

  const answer = (n, ask, body) => ({ n, ask, ...body });

  return {
    // Question 20, and the reason this page exists.
    headline: {
      n: 20,
      ask: 'Based on the RFP, can we grasp a scope that can be estimated and leads to comparable offers?',
      verdict: evidence.verdict,
      ...evidence,
      assumptions_total: assumptions.length,
    },
    sections: [
      {
        id: 'deliverable',
        title: 'Is it deliverable?',
        questions: [
          answer(1, 'Do we have the requested skills and capabilities?', {
            says: caps.length
              ? `The RFP asks for ${caps.length} capabilit${caps.length === 1 ? 'y' : 'ies'} beyond a standard store build.`
              : 'Nothing in the RFP goes beyond a standard store build.',
            detail: caps,
            watch: stops.length
              ? `${stops.length} requirement${stops.length === 1 ? '' : 's'} fall outside Merkle's standard offers and would be bespoke.`
              : null,
          }),
          answer(2, 'Do we know how to deliver this for the client?', {
            says: offer.applies
              ? `Yes — it maps to offer ${offer.code} (${offer.name}) on ${TRACK[offer.track] ?? offer.track}, a shape Merkle has a defined scope and backlog for.`
              : `Not as a standard offer — ${offer.why_not[0] ?? 'an exit rule'} takes it beyond S, M and L, so the approach would be built from scratch.`,
            detail: go && stories.length ? [{ capability: 'Build backlog already derived', evidence: `${stories.length} stories across ${summariseByEpic(stories).length} epics` }] : [],
            watch: topology && topology.confidence !== 'confirmed'
              ? `Store topology is a recommendation, not a fact yet: ${String(topology.recommendation).replace(/_/g, ' ')} at ${String(topology.confidence).replace(/_/g, ' ')}.`
              : null,
          }),
          answer(3, 'Can we mobilise sufficient resources to deliver if we were selected?', {
            says: offer.applies
              ? `The work is ${offer.weeks} weeks of build, shaped as ${Object.entries(byOwner).map(([o, n]) => `${n} ${o}`).join(', ')}.`
              : 'Not sizeable from the standard offers — the shape has to be built before it can be staffed.',
            detail: [],
            // The tool knows the demand. It knows nothing about who is free.
            watch: 'This is the demand only. Whether Merkle has those people free is not something this tool can see — Delivery Lead owns it.',
          }),
        ],
      },
      {
        id: 'profitable',
        title: 'Is it profitable?',
        questions: [
          answer(4, 'What is the estimated opportunity amount (TCV) that we pitch for?', {
            says: !offer.applies
              ? `There is no standard band for this. The requirements take it beyond S, M and L, so it would be scoped and priced on its own${offer.route ? ` as ${ROUTE[offer.route] ?? offer.route.replace(/_/g, ' ')}` : ''}.`
              : pricing && offer.band
                ? `Merkle's band for offer ${offer.code} is ${money(offer.band)} over ${offer.weeks} weeks. This is the build only — retainer, licences and media are not in it.`
                : `Offer ${offer.code} over ${offer.weeks} weeks. The commercial band is shown to engagement leads.`,
            detail: [],
            watch: !offer.applies
              ? `The scope gates classify it as ${offer.code}, and that is not the answer — ${offer.why_not[0] ?? 'an exit rule'} takes it outside. Pricing it at ${offer.code} would sell a bespoke engagement at a standard price.`
              : 'The total contract value is a commercial figure and comes from Salesforce, not from here.',
          }),
          answer(9, 'How likely is it that margins are jeopardised by risks?', {
            says: `${items.length} rule${items.length === 1 ? '' : 's'} fired on the requirements — ${stops.length} outside the offers, ${items.filter((i) => i.result === 'FLAG').length} needing a named owner before build — and the proposal would rest on ${assumptions.length} stated assumption${assumptions.length === 1 ? '' : 's'}.`,
            detail: items.map((i) => ({ capability: `${i.rule_id} · ${SEVERITY_LABEL[i.result] ?? i.result}`, evidence: i.evidence })),
            watch: assumptions.length > 6
              ? 'A proposal resting on this many assumptions is a different commercial object from one resting on two, whatever the price says.'
              : null,
          }),
          answer(10, 'Is the investment for the pitch in solid relation to the expected TCV?', {
            says: evidence.open_topics
              ? `${evidence.open_topics} topic${evidence.open_topics === 1 ? '' : 's'} still have to be settled before this can be priced properly — that is the work the pitch needs, before any writing.`
              : 'Nothing material is still open: the pitch is writing, not investigation.',
            detail: brief.topics.map((t) => ({ capability: t.title, evidence: `settles ${t.covers.length} unknown${t.covers.length === 1 ? '' : 's'}; changes ${t.changes.join(', ')}` })),
            watch: null,
          }),
        ],
      },
      {
        id: 'winnable',
        title: 'Is it winnable?',
        questions: [
          answer(19, 'Is the project budgeted, and does it match our estimation?', {
            says: !offer.applies
              ? 'We have no standard estimate to compare a budget against: this falls outside S, M and L and would be estimated on its own.'
              : pricing && offer.band
                ? `Our side of it: ${money(offer.band)}. Whether the client has budgeted that, and at what figure, is only known if the RFP says so.`
                : 'Our estimate is the offer band, shown to engagement leads. The client’s budget is only known if the RFP states it.',
            detail: [],
            watch: null,
          }),
          answer(22, 'What is the price weighting?', {
            says: 'Stated in the RFP or not at all — this tool does not infer it.',
            detail: [],
            watch: null,
          }),
        ],
      },
    ],
    // Named, so nobody waits in the meeting for an answer that was never coming.
    not_ours: [
      { n: 5, ask: 'Is the client an internationally known brand with high revenue?', owner: 'Client lead' },
      { n: 6, ask: 'If an international enterprise, which branch issued the RFP?', owner: 'Client lead' },
      { n: 7, ask: 'Estimated client revenue potential in year two, on top of the TCV?', owner: 'Client lead' },
      { n: 8, ask: 'Are the expected rates or margin attractive?', owner: 'Commercial' },
      { n: 11, ask: 'How many competitors are participating?', owner: 'Client lead' },
      { n: 12, ask: 'Is the incumbent participating, and how satisfied is the client?', owner: 'Client lead' },
      { n: 13, ask: 'How is our business relationship with the client?', owner: 'Client lead' },
      { n: 14, ask: 'General attitude towards Merkle, or reputation of recent services?', owner: 'Client lead' },
      { n: 15, ask: 'Are the main roles in the buying centre identified?', owner: 'Pitch lead' },
      { n: 16, ask: 'Is there an advocate for us in the buying centre?', owner: 'Pitch lead' },
      { n: 17, ask: 'How was the communication pattern with influencers before the RFP?', owner: 'Pitch lead' },
      { n: 18, ask: 'Is the decision process transparent, are we allowed to present?', owner: 'Pitch lead' },
      { n: 21, ask: 'Do we have a competitive advantage for sourcing/pricing?', owner: 'Commercial' },
      { n: 23, ask: 'How strong is our positioning in the market for the requested topic?', owner: 'Marketing' },
      { n: 24, ask: 'Are we solving a problem, or delivering services/projects?', owner: 'Pitch lead' },
      { n: 25, ask: 'Do we have the perfect reference cases?', owner: 'Pitch lead' },
      { n: 26, ask: 'Are we the leading alliance partner, or is there another key prove point?', owner: 'Pitch lead' },
      { n: 27, ask: 'Is an experienced pitch team staffed and confirmed?', owner: 'Delivery Lead' },
      { n: 28, ask: 'How differentiating and unique are our win themes?', owner: 'Pitch lead' },
    ],
    assumptions: assumptions.slice(0, 8),
    assumptions_total: assumptions.length,
  };
}
