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
