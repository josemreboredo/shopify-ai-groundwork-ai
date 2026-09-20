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
export const SEGMENTS = ['s', 'm', 'l', 'larger-engagement'];

export const TRACK = { liquid: 'Online Store · Horizon', hydrogen: 'Headless · Hydrogen' };

/** "4" or "6–9". */
export const weeks = (w) => (w ? (w.min === w.max ? `${w.min}` : `${w.min}–${w.max}`) : '—');

const k = (n) => `${Math.round(n / 1000)}k`;

/** "EUR 40k–65k". Internal: the engine keeps these out of anything client-facing. */
export const band = (b, currency) => (b ? `${currency ?? ''} ${k(b.min)}–${k(b.max)}${b.open_ended ? '+' : ''}`.trim() : null);

/**
 * The segment a URL asks for, or null.
 *
 * "larger-engagement" is a segment of this page set without being an offer, so
 * it carries no `offer` — the page checks for that rather than inventing an
 * offer shape that the engine never produced.
 *
 * @param {object} view  offeringView()
 * @param {string} slug
 */
export function segmentOf(view, slug) {
  const key = String(slug ?? '').toLowerCase();
  if (!SEGMENTS.includes(key)) return null;
  if (key === 'larger-engagement') {
    return { slug: key, code: 'Beyond', name: 'Beyond the offers', offer: null };
  }
  const offer = view.offers.find((o) => o.code.toLowerCase() === key);
  return offer ? { slug: key, code: offer.code, name: offer.name, offer } : null;
}
