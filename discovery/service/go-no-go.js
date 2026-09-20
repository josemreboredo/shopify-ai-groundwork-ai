/**
 * @file go-no-go.js
 * @description Where the Solution Architect stands on the bid, and why.
 *
 * Merkle's Go/No-Go meeting works through twenty-eight questions, most of them
 * commercial — the opportunity value, the NPS, the buying centre, the pitch team.
 * The architect is not there to answer those. He is there to say one thing: from
 * the documents we were sent and what we have actually verified in them, can
 * Merkle put a number on this work and stand behind it.
 *
 * So this gives a position and what it rests on, rather than a grid of answers
 * to questions nobody asked this desk. The position turns on two things, in this
 * order: whether a human has confirmed what was read out of the documents, and
 * whether what is still unknown would change the price. An architect cannot
 * stand behind an extraction nobody has checked, however much of it there is —
 * which is why "confirm what it says" is a precondition here and not a
 * formality.
 *
 * It is still a recommendation. The decision is taken in the room, weighing a
 * relationship and a pipeline this desk knows nothing about.
 *
 * @module discovery/service/go-no-go
 */

import { clarificationBrief } from '../agents/discovery/clarifications.js';
import { statedAssumptions } from './assumptions.js';
import { selectStories } from '../agents/backlog/select.js';
import { offering } from '../schema/index.js';

const SEVERITY = { STOP: 0, FLAG: 1, WARN: 2 };
const SEVERITY_LABEL = {
  STOP: 'Outside the standard offers',
  FLAG: 'Needs a named owner before build',
  WARN: 'Commercial adjustment',
};

/**
 * Where the complexity sits, on the engine's own axes.
 *
 * Three levels and no invented scale: a dimension is not in play, in play and
 * inside what Merkle's offers cover, or beyond them. "Beyond" is not a judgement
 * — an exit rule fired on the same answers the gate reads, and rules and gates
 * both declare the pointers they read, so the link is structural rather than a
 * guess at which rule belongs to which subject.
 *
 * A chart wants a number per axis, which is exactly where a tool like this
 * invents one. This is the only scale the engine can actually defend.
 *
 * @param {object} doc  decided engagement
 */
export function complexityProfile(doc) {
  const gates = new Map(offering.scope_gates.map((g) => [g.id, g]));
  const fired = doc.exits?.items ?? [];
  const ruleInputs = new Map(offering.exit_rules.map((r) => [r.id, r.inputs ?? []]));

  return offering.scope_gates.map((g) => {
    const state = doc.offer?.scope_gates?.[g.id];
    const active = Boolean(state?.active);
    // The rules that read the same answers this gate reads.
    const rules = fired.filter((i) => (ruleInputs.get(i.rule_id) ?? []).some((input) => (g.inputs ?? []).includes(input)));
    const beyond = rules.some((r) => r.result === 'STOP');
    return {
      id: g.id,
      label: g.label,
      level: !active ? 0 : beyond ? 2 : 1,
      standing: !active ? 'not in play' : beyond ? 'beyond the offers' : 'within the offers',
      evidence: state?.evidence ?? null,
      rules: rules.map((r) => ({ rule_id: r.rule_id, result: r.result, evidence: r.evidence })),
    };
  });
}

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
 * Where the architect stands, and the facts he stands on.
 *
 * Read in order, the first thing that stops him is the answer. Percentages are
 * deliberately absent: "28% of what sets the price is answered" was a coverage
 * ratio wearing a claim it could not support, and a number like that gets argued
 * with instead of acted on. Counts of real things do not.
 *
 * @param {object} doc @param {object} counts
 */
function recommend({ documents, answered, unconfirmed, openTopics, stops, cannotPrice, assumptions }) {
  // Two different things were being read as one list. The fact that decides the
  // position, and the facts it rests on. Printed together they read as a wall,
  // and the sentence that actually answers "why" sat third with nothing marking
  // it. So: one why, and the ground underneath it.
  const ground = [];
  const said = (verdict, headline, why, before = []) => ({ verdict, headline, why, because: [...ground], before_you_go: before });

  if (!documents) {
    return said(
      'nothing to go on',
      'Nothing has been read yet.',
      'No document has been read into this bid, so there is nothing for this desk to assess.',
      ['Read the RFP in on the first step.'],
    );
  }

  ground.push(`${documents} document${documents === 1 ? '' : 's'} read, ${answered} answer${answered === 1 ? '' : 's'} taken from ${documents === 1 ? 'it' : 'them'}.`);

  // 1 — nothing else matters until a human has checked what the model read.
  if (unconfirmed) {
    return said(
      'not yet',
      'I cannot stand behind this until what was read has been confirmed.',
      `${unconfirmed} of those ${unconfirmed === 1 ? 'is' : 'are'} still unconfirmed: a model read ${unconfirmed === 1 ? 'it' : 'them'} out of the document and nobody has checked ${unconfirmed === 1 ? 'it' : 'them'} yet.`,
      [`Confirm what it says — ${unconfirmed} answer${unconfirmed === 1 ? '' : 's'} waiting.`],
    );
  }

  ground.push('Everything read out of the documents has been confirmed by a person.');

  // 2 — requirements that put the work outside what Merkle sells as a standard offer.
  if (stops.length) {
    return said(
      'not a standard bid',
      'We can describe this, but not price it as one of our offers.',
      `${stops.length} requirement${stops.length === 1 ? '' : 's'} put this outside Merkle's standard offers: ${stops.map((s) => s.evidence).join('; ')}.`,
      [
        'Decide the route before pricing: an Enterprise Engagement with its own Discovery Phase, or no bid.',
        'Anything quoted at S, M or L here would sell bespoke work at a standard price.',
      ],
    );
  }

  // 3 — things that cannot be costed at all, whatever we assume.
  if (cannotPrice.length) {
    return said(
      'ask first',
      'Part of this cannot be costed at all from what we were sent.',
      `${cannotPrice.length} input${cannotPrice.length === 1 ? '' : 's'} cannot be costed at all until answered: ${cannotPrice.join('; ')}.`,
      ['Use the Q&A window on the inputs above — there is no assumption that covers them.'],
    );
  }

  // 4 — open topics that move the price, but that we could assume around.
  //
  // Counted by the ones that change the *shape* of the solution. The raw total
  // is now everything the documents never covered, which on any real RFP is
  // several pages' worth — a threshold on that number would read "ask" forever
  // and stop meaning anything.
  const shaping = openTopics.filter((t) => t.impact === 'high');
  if (shaping.length > 2) {
    return said(
      'go, but ask',
      'We can price this, and the price would rest on more assumptions than it should.',
      `${shaping.length} topics are still open that change the shape of the solution: ${shaping.map((t) => t.title).join(', ')}${openTopics.length > shaping.length ? `, with ${openTopics.length - shaping.length} smaller ones behind them` : ''}.`,
      [
        `Send the questions on the ${shaping.length} topics above before the price is committed.`,
        `Anything left unanswered becomes one of the ${assumptions} assumptions the proposal states.`,
      ],
    );
  }

  return said(
    'go',
    'We can put a number on this and stand behind it.',
    openTopics.length
      ? `${openTopics.length} topic${openTopics.length === 1 ? '' : 's'} still open, none of them large enough to move the shape of the solution.`
      : 'Nothing material is still open.',
    assumptions ? [`The proposal will state ${assumptions} assumption${assumptions === 1 ? '' : 's'}. Read them before the price is committed.`] : [],
  );
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
 * Where the architect stands on this bid.
 *
 * @param {object} doc  decided engagement
 * @param {{ coverage?: object, to_review?: number, documents?: number }} state  what the engagement holds now
 * @param {{ questions?: object[] }|null} clarifications
 * @param {{ pricing?: boolean }} [options]  pricing: include Merkle's internal bands
 */
export function goNoGoView(doc, state, clarifications, { pricing = false } = {}) {
  const brief = clarificationBrief(doc);
  const assumptions = statedAssumptions(doc, clarifications);
  const items = (doc.exits?.items ?? []).slice().sort((a, b) => (SEVERITY[a.result] ?? 3) - (SEVERITY[b.result] ?? 3));
  const stops = items.filter((i) => i.result === 'STOP');
  const offer = offerOf(doc);
  const stories = offer.applies ? selectStories(doc) : [];
  const byOwner = {};
  for (const st of stories) byOwner[st.owner] = (byOwner[st.owner] ?? 0) + 1;

  const recommendation = recommend({
    documents: state.documents ?? 0,
    answered: state.coverage?.required_answered ?? 0,
    unconfirmed: state.to_review ?? 0,
    openTopics: brief.topics,
    stops,
    cannotPrice: brief.cannot_price_until_answered,
    assumptions: assumptions.length,
  });

  return {
    recommendation,
    // The facts behind the position, so it can be argued with on its evidence
    // rather than taken or left on trust.
    rests_on: {
      documents: state.documents ?? 0,
      answered: state.coverage?.required_answered ?? 0,
      required: state.coverage?.required_total ?? 0,
      unconfirmed: state.to_review ?? 0,
      open_topics: brief.topics.map((t) => ({ title: t.title, changes: t.changes, settles: t.covers.length })),
      cannot_price: brief.cannot_price_until_answered,
    },
    // What the RFP is asking for, from the gates the engine fired.
    capabilities: capabilities(doc),
    // The same gates as a shape, so where the complexity sits is visible before
    // it is read.
    profile: complexityProfile(doc),
    scope: {
      applies: offer.applies,
      offer: offer.code,
      name: offer.name,
      track: offer.track ? TRACK[offer.track] ?? offer.track : null,
      weeks: offer.weeks,
      band: pricing ? offer.band : null,
      route: offer.route,
      why_not: offer.why_not,
      shape: Object.entries(byOwner).map(([owner, n]) => ({ owner, stories: n })).sort((a, b) => b.stories - a.stories),
    },
    risks: items.map((i) => ({
      rule_id: i.rule_id,
      result: i.result,
      severity: SEVERITY_LABEL[i.result] ?? i.result,
      evidence: i.evidence,
    })),
    assumptions: assumptions.slice(0, 8),
    assumptions_total: assumptions.length,
    // Kept because the meeting will ask, and "that one is the Client lead's" is a
    // useful answer where a guess would be a liability.
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
      { n: 26, ask: 'Are we the leading alliance partner, or another key prove point?', owner: 'Pitch lead' },
      { n: 27, ask: 'Is an experienced pitch team staffed and confirmed?', owner: 'Delivery Lead' },
      { n: 28, ask: 'How differentiating and unique are our win themes?', owner: 'Pitch lead' },
    ],
  };
}
