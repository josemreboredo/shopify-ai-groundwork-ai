/**
 * @file offering.js
 * @description Shared between the offering index and the four segment pages.
 *
 * The formatters lived in the index route. Splitting the page per segment would
 * have copied them, and a price band formatted two ways on two pages is a bug
 * waiting for someone to notice the difference.
 *
 * @module app/offering
 */

/** In the order an engagement travels: the smallest offer first, then past them. */
export const SEGMENTS = ['s', 'm', 'l', 'arc'];

/* S and M are themes. Ecommerce Flagship builds either way and spends the same
   weeks differently — the track follows the answers, not the offer. */
export const TRACK = { liquid: 'Online Store · Horizon', hydrogen: 'Headless · Hydrogen on Oxygen' };

/** "4" or "6–9". */
export const weeks = (w) => (w ? (w.min === w.max ? `${w.min}` : `${w.min}–${w.max}`) : '—');

const k = (n) => `${Math.round(n / 1000)}k`;

/** "CHF 6.3k": a price under a band, to the hundred francs. */
export const chf = (n, currency) => `${currency} ${(Math.round(n / 100) / 10).toString()}k`;

/** "CHF 6.3k–12.6k", or one figure when it is fixed. */
export const chfSpan = (r, currency) => (r.min === r.max
  ? chf(r.min, currency)
  : `${chf(r.min, currency)}–${(Math.round(r.max / 100) / 10).toString()}k`);

/* Weeks as a consultant says them. A surcharge lands on 0.8775 or 2.49 weeks,
   which nobody reads out in a room; to the nearest twentieth it is 0.9 and 2.5,
   and the quarter weeks the offering sells by (0.75, 2.25) survive exactly. An
   eighth is the one smaller fraction it sells — one app — and keeps its name. */
const near = (n) => (n === 0.125 ? '⅛' : (Math.round(n * 20) / 20).toString());

/** "0.75", "2.25–3.25" or "⅛" — a span of weeks, rounded the one way. */
export const weeksNear = (w) => (w
  ? (near(w.min) === near(w.max) ? near(w.min) : `${near(w.min)}–${near(w.max)}`)
  : '—');

/** "EUR 40k–65k". Internal: the engine keeps these out of anything client-facing. */
// A fixed price is one figure: "CHF 5k", not "CHF 5k–5k".
export const band = (b, currency) => (b
  ? `${currency ?? ''} ${b.min === b.max ? k(b.min) : `${k(b.min)}–${k(b.max)}`}${b.open_ended ? '+' : ''}`.trim()
  : null);

/**
 * The segment a URL asks for, or null.
 *
 * "arc" is a segment of this page set without being an offer, so it carries no
 * `offer` — the page checks for that rather than inventing an offer shape the
 * engine never produced, and nothing here quotes or estimates Arc.
 *
 * @param {object} view  offeringView()
 * @param {string} slug
 */
export function segmentOf(view, slug) {
  const key = String(slug ?? '').toLowerCase();
  if (!SEGMENTS.includes(key)) return null;
  if (key === 'arc') {
    return { slug: key, code: 'Arc', name: 'Merkle Arc', offer: null };
  }
  const offer = view.offers.find((o) => o.code.toLowerCase() === key);
  return offer ? { slug: key, code: offer.code, name: offer.name, offer } : null;
}
