/**
 * @file ai/shared/estimation-view.js
 * @description How an estimate is built, as data for the page that explains it.
 *
 * Every estimate is weeks of one delivery team at one weekly cost. The offering
 * pages show what each pack holds; this shows the arithmetic underneath them —
 * who is in the team, how much of a week each one gives, what a week costs,
 * and the packs worked through line by line by the same engine that quotes a
 * client. Nothing here is written twice: the team and the rate are read from
 * `offering.pricing`, and every example is `classifyOffer` on a pack's promise.
 *
 * Prices are Merkle's internal position. With `pricing` off, no franc leaves
 * the server — only weeks, days and people.
 *
 * @module ai/shared/estimation-view
 */

import { offering } from '../schema/index.js';
import { classifyOffer } from '../engine/classify.js';
import { engagementAt } from '../engine/promise.js';

const DAYS_PER_WEEK = 5;

/** One worked example: the engine's quote on an engagement, line by line. */
function example(title, lead, limits, pricing) {
  const p = offering.pricing;
  const rate = p.weekly_rate;
  const quote = classifyOffer(engagementAt(limits));
  const S = offering.offers.S;
  const halfWeek = (days) => (days / DAYS_PER_WEEK) * rate * p.hypercare_rate_share;
  const d = p.design;
  // The Foundation build is S's band without S's own hypercare and design,
  // which are lines of their own below.
  const foundation = {
    min: S.price_band.min - halfWeek(S.hypercare_days) - d.foundation_days.min * d.day_price,
    max: S.price_band.max - halfWeek(S.hypercare_days) - d.foundation_days.max * d.day_price,
  };
  const days = quote.design.days;
  const span = days.min === days.max ? `${days.min}` : `${days.min}–${days.max}`;
  const money = (r) => (pricing ? { price: r } : {});
  const lines = [
    { what: 'The Foundation build', weeks: S.duration_weeks, ...money(foundation) },
    ...quote.scope_effort_by_gate.map((g) => ({
      what: g.label,
      weeks: g.weeks,
      ...money({ min: g.weeks.min * rate, max: g.weeks.max * rate }),
    })),
    {
      what: `Design by the experience designer, ${span} days`,
      weeks: null,
      design: true,
      ...money({ min: days.min * d.day_price, max: days.max * d.day_price }),
    },
    {
      what: `Hypercare after go-live, ${quote.hypercare.days} working days`,
      weeks: null,
      after_go_live: true,
      ...money({ min: halfWeek(quote.hypercare.days), max: halfWeek(quote.hypercare.days) }),
    },
  ];
  return {
    title,
    lead,
    code: quote.code,
    name: quote.name,
    addons: quote.addons.map((a) => a.label),
    lines,
    weeks: quote.duration_weeks,
    ...(pricing ? { price_band: { min: quote.price_band.min, max: quote.price_band.max } } : {}),
  };
}

/**
 * @param {{ pricing?: boolean }} [options]  pricing: include the weekly cost and every franc
 */
export function estimationView({ pricing = false } = {}) {
  const p = offering.pricing;
  const limits = offering.closed_scope.limits;
  const team = p.team.map((t) => ({
    role: t.role,
    fte: t.fte,
    days_per_week: Math.round(t.fte * DAYS_PER_WEEK * 100) / 100,
    share: Math.round((t.fte / p.people_per_week) * 1000) / 1000,
  }));
  return {
    pricing,
    currency: offering.currency,
    estimate: offering.estimate.line,
    team,
    people: p.people_per_week,
    person_days: Math.round(p.people_per_week * DAYS_PER_WEEK * 100) / 100,
    ...(pricing ? { weekly_cost: p.weekly_rate, hypercare_week: p.weekly_rate * p.hypercare_rate_share, app_cost: p.weekly_rate * p.app_weeks, design_day: p.design.day_price } : {}),
    designer: { role: p.design.role, sourcing: p.design.sourcing },
    hypercare_share: p.hypercare_rate_share,
    app_weeks: p.app_weeks,
    packs: ['S', 'M', 'L'].map((code) => ({
      code,
      name: offering.offers[code].name,
      weeks: offering.offers[code].duration_weeks,
      hypercare_days: offering.offers[code].hypercare_days,
      apps_included: offering.offers[code].apps_included,
      design_days: classifyOffer(engagementAt(limits[code])).design.days,
      ...(pricing ? { price_band: { min: offering.offers[code].price_band.min, max: offering.offers[code].price_band.max, open_ended: Boolean(offering.offers[code].price_band.open_ended) } } : {}),
    })),
    examples: [
      example(`${offering.offers.S.name}, as packaged`, 'One market, a configured theme, no scope gate: the Foundation build and its hypercare.', limits.S, pricing),
      example(`${offering.offers.M.name}, as packaged`, 'Everything M promises — three markets, four languages, bespoke sections, one integration, a WooCommerce migration.', limits.M, pricing),
      example(`${offering.offers.L.name}, as packaged`, 'Everything L promises — three stores, nine markets across them, six languages, the full template set, blocks inside the checkout.', limits.L, pricing),
      example(`${offering.offers.M.name}, after discovery finds a second store`, 'The same M, re-estimated: the second store is one more line, not a different project.', { ...limits.M, stores: 2 }, pricing),
    ],
    calibration: p.calibration,
  };
}
