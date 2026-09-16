/**
 * @file helpers.js
 * @description Small accessors shared by story definitions. Keep story files
 * declarative: read the engagement through these helpers, never mutate it.
 *
 * @module backlog/stories/helpers
 */

/** Markets at launch. @param {object} doc */
export const markets = (doc) => doc.markets?.list ?? [];

/** Distinct languages across markets. @param {object} doc */
export const languages = (doc) => [...new Set(markets(doc).flatMap((m) => m.languages ?? []))];

/** Integrations of a category. @param {object} doc @param {string} category */
export const integrationsOf = (doc, category) => (doc.integrations ?? []).filter((i) => i.category === category);

/** True when a scope gate is active. @param {object} doc @param {string} id */
export const gate = (doc, id) => doc.offer?.scope_gates?.[id]?.active === true;

/** True when an exit rule fired (any result). @param {object} doc @param {string} ruleId */
export const exitFired = (doc, ruleId) => (doc.exits?.items ?? []).some((i) => i.rule_id === ruleId);

/** "a, b and c". @param {string[]} items */
export function list(items) {
  const clean = items.filter(Boolean);
  if (clean.length <= 1) return clean[0] ?? '';
  return `${clean.slice(0, -1).join(', ')} and ${clean.at(-1)}`;
}

/** Store name for prose. @param {object} doc */
export const storeName = (doc) => doc.meta?.client?.name ?? 'the store';

/** Catalogue product types. @param {object} doc */
export const productTypes = (doc) => doc.catalogue?.product_types ?? [];

/** True when the catalogue includes a product type. @param {object} doc @param {string} type */
export const hasProductType = (doc, type) => productTypes(doc).includes(type);

/** True when data moves from a non-Shopify platform. @param {object} doc */
export const isMigration = (doc) => {
  const source = doc.migration?.source_platform;
  return Boolean(source) && source !== 'none' && source !== 'shopify';
};

/** True when native B2B is in scope. @param {object} doc */
export const isB2b = (doc) => doc.b2b?.enabled === true;

/** True on the Liquid (Online Store 2.0 theme) delivery track. @param {object} doc */
export const isLiquidTrack = (doc) => doc.offer?.delivery_track !== 'hydrogen';

/** Theme name for prose (defaults to Horizon). @param {object} doc */
export const themeName = (doc) => doc.design?.theme_preference || 'Horizon';

/** "500 EUR". @param {{ amount?: number, currency?: string }|undefined} money @param {string} [fallback] */
export const money = (money, fallback = 'the agreed amount') =>
  money && typeof money.amount === 'number' ? `${money.amount.toLocaleString('en')} ${money.currency ?? ''}`.trim() : fallback;

/** list() with a fallback when empty. @param {string[]|undefined} items @param {string} fallback */
export const listOr = (items, fallback) => (items?.filter(Boolean).length ? list(items) : fallback);

/** "4,200". @param {number|undefined} n @param {string} fallback */
export const count = (n, fallback) => (typeof n === 'number' ? n.toLocaleString('en') : fallback);

/** Recommended apps from the approach shortlist. @param {object} doc */
export const recommendedApps = (doc) => (doc.approach?.app_shortlist ?? []).filter((a) => a.recommended === true);

/** True when any market is in the EU (for EU-only legal duties). @param {object} doc */
export const hasEuMarket = (doc) => markets(doc).some((m) => EU_COUNTRIES.has(m.code));

export const EU_COUNTRIES = new Set(['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE']);
