/**
 * @file ai/shared/estimate.js
 * @description Where an estimate stands, and what moved since the last one.
 *
 * The Lead Consultant works in three stages. The offering pages are packaging:
 * a scope to open the conversation with. An RFP and its answers give an
 * estimate of the scope identified so far. A discovery closes the scope — every
 * question answered and confirmed — and the delivery team estimates the approach
 * from there. The engine quotes the same way at every stage; what changes is how
 * much of the scope is known, and that is what a reader has to be told.
 *
 * And when discovery changes what the RFP said — two stores where the RFP
 * assumed one — the re-estimate has to read as the same project with a store
 * more, gate by gate, not as a different number with no working behind it.
 *
 * @module ai/shared/estimate
 */

import { offering } from '../schema/index.js';

const STAGES = {
  rfp: {
    label: 'RFP estimate',
    line: 'An estimate of the scope the RFP and its answers identify. Answers read from documents stay to confirm until the client does.',
  },
  discovery: {
    label: 'Discovery in progress',
    line: 'The scope is still being closed: the estimate moves with every answer until every question is answered and confirmed.',
  },
  closed: {
    label: 'Discovery closed',
    line: 'Every required question answered and confirmed: the scope is closed. The delivery team estimates the approach from here.',
  },
};

/**
 * The stage an estimate stands at.
 *
 * @param {{ process: 'rfp'|'discovery', coverage: object, toReview: number, provisional: boolean }} state
 */
export function estimateStage({ process, coverage, toReview, provisional }) {
  const open = (coverage?.required_open ?? 0) + (coverage?.required_tbc ?? 0);
  const stage = process === 'rfp' ? 'rfp' : open === 0 && toReview === 0 && !provisional ? 'closed' : 'discovery';
  return {
    stage,
    ...STAGES[stage],
    required_open: coverage?.required_open ?? 0,
    required_tbc: coverage?.required_tbc ?? 0,
    to_confirm: toReview,
  };
}

/**
 * The offer as it stood, kept to measure a later estimate against.
 *
 * @param {object} offer  doc.offer as the engine computed it
 * @param {{ at: string, stage: string }} when
 */
export function estimateSnapshot(offer, { at, stage }) {
  return {
    at,
    stage,
    code: offer.code,
    name: offer.name,
    addons: (offer.addons ?? []).map(({ gate, label, units, tier }) => ({ gate, label, ...(units !== undefined ? { units } : {}), ...(tier ? { tier } : {}) })),
    price_band: offer.price_band,
    duration_weeks: offer.duration_weeks,
    hypercare_days: offer.hypercare?.days ?? null,
    gates: (offer.scope_effort_by_gate ?? []).map(({ gate, label, weeks }) => ({ gate, label, weeks })),
  };
}

const toThousand = (n) => Math.round(n / 1000) * 1000;
const delta = (a, b) => ({ min: b.min - a.min, max: b.max - a.max });

/**
 * What moved between two estimates, gate by gate.
 *
 * Every week of gate work is priced at one rate, so a gate's price moves by its
 * weeks at that rate and the list adds up to the quote's own move.
 *
 * @param {object} before   an estimateSnapshot
 * @param {object} after    an estimateSnapshot
 * @param {{ pricing?: boolean }} [options]  pricing: include the CHF moves
 */
export function reestimate(before, after, { pricing = false } = {}) {
  const rate = offering.pricing.weekly_rate;
  const was = new Map(before.gates.map((g) => [g.gate, g]));
  const now = new Map(after.gates.map((g) => [g.gate, g]));
  const moved = [];
  for (const id of new Set([...was.keys(), ...now.keys()])) {
    const x = was.get(id);
    const y = now.get(id);
    const weeks = delta(x?.weeks ?? { min: 0, max: 0 }, y?.weeks ?? { min: 0, max: 0 });
    if (weeks.min === 0 && weeks.max === 0) continue;
    moved.push({
      gate: id,
      label: (y ?? x).label,
      change: !x ? 'added' : !y ? 'removed' : weeks.max > 0 ? 'more' : 'less',
      weeks,
      ...(pricing ? { price: { min: toThousand(weeks.min * rate), max: toThousand(weeks.max * rate) } } : {}),
    });
  }
  moved.sort((a, b) => Math.abs(b.weeks.max) - Math.abs(a.weeks.max));
  /* Hypercare moves with the pack an engagement is named after (S five days,
     M ten, L fifteen) and with the days the client asks for. It runs after
     go-live, so it moves the price and not the weeks — and without its own
     line the list would not add up to the quote's move. */
  const days = (after.hypercare_days ?? 0) - (before.hypercare_days ?? 0);
  if (before.hypercare_days !== null && after.hypercare_days !== null && days !== 0) {
    const care = toThousand((days / 5) * rate * offering.pricing.hypercare_rate_share);
    moved.push({
      gate: 'hypercare',
      label: `Hypercare after go-live, ${before.hypercare_days} → ${after.hypercare_days} working days`,
      change: days > 0 ? 'more' : 'less',
      weeks: { min: 0, max: 0 },
      ...(pricing ? { price: { min: care, max: care } } : {}),
    });
  }

  const addonsWas = new Set(before.addons.map((a) => a.gate));
  const addonsNow = new Set(after.addons.map((a) => a.gate));
  const added = after.addons.filter((a) => !addonsWas.has(a.gate)).map((a) => a.label);
  const dropped = before.addons.filter((a) => !addonsNow.has(a.gate)).map((a) => a.label);

  const pack = before.code === after.code ? `Still ${after.name}` : `${before.name} → ${after.name}`;
  const lower = (s) => s.charAt(0).toLowerCase() + s.slice(1);
  const headline = [
    pack,
    ...(added.length ? [`plus ${added.map(lower).join(', ')}`] : []),
    ...(dropped.length ? [`no longer ${dropped.map(lower).join(', ')}`] : []),
  ].join(', ');

  return {
    since: { at: before.at, stage: before.stage },
    from: { code: before.code, name: before.name, duration_weeks: before.duration_weeks, ...(pricing ? { price_band: before.price_band } : {}) },
    to: { code: after.code, name: after.name, duration_weeks: after.duration_weeks, ...(pricing ? { price_band: after.price_band } : {}) },
    headline,
    addons_added: added,
    addons_dropped: dropped,
    moved,
    weeks: delta(before.duration_weeks, after.duration_weeks),
    ...(pricing ? { price: delta(before.price_band, after.price_band) } : {}),
  };
}
