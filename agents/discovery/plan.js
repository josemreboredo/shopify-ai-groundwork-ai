/**
 * @file plan.js
 * @description Shopify plan implied by the answers. Native B2B, Checkout
 * Extensibility and expansion stores need Shopify Plus; exit rule 11.1 fires
 * when a non-Plus plan is chosen, and the interview suggests Plus while the
 * plan is still open. A suggestion, never an answer: the client chooses the plan.
 *
 * @module discovery/plan
 */

export const PLUS_PLANS = new Set(['plus', 'plus_expansion']);

/**
 * Features in the answers that require Shopify Plus.
 *
 * @param {object} doc  Engagement document or interview answers
 * @returns {string[]}
 */
export function plusRequirements(doc) {
  const needs = [];
  if (doc.b2b?.enabled === true && doc.b2b?.approach !== 'app') needs.push('native B2B');
  if (doc.checkout?.customisation === 'extensibility') needs.push('Checkout Extensibility');
  if (['expansion_stores', 'hybrid'].includes(doc.markets?.strategy)) needs.push('expansion stores');
  return needs;
}

/**
 * Plan suggestion while the target plan is unanswered.
 *
 * @param {object} doc
 * @returns {{ pointer: string, value: 'plus', reasons: string[] } | null}
 */
export function planSuggestion(doc) {
  if (doc.shopify?.target_plan) return null;
  const reasons = plusRequirements(doc);
  return reasons.length ? { pointer: '/shopify/target_plan', value: 'plus', reasons } : null;
}
