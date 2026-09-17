/**
 * @file plan.js
 * @description Shopify plan implied by the answers, from Shopify's own plan
 * boundaries (help.shopify.com, checked 2026-09-17). Shopify B2B runs on every
 * plan from Basic; Plus is needed for company-specific B2B catalogs, checkout
 * step extensions / Checkout Branding API and expansion stores. Exit rule 11.1
 * fires when the chosen plan is below what the answers require; the interview
 * suggests the minimum plan while the plan is open. A suggestion, never an
 * answer: the client chooses the plan.
 *
 * @module discovery/plan
 */

/** Plans from lowest to highest. `plus_expansion` ranks as Plus. */
export const PLAN_RANK = { none: 0, starter: 1, basic: 2, grow: 3, advanced: 4, plus: 5, plus_expansion: 5 };

export const PLAN_LABEL = { basic: 'Basic', grow: 'Grow', advanced: 'Advanced', plus: 'Shopify Plus' };

/**
 * @typedef {Object} PlanRequirement
 * @property {string} feature  Shopify feature the answers need
 * @property {'basic'|'grow'|'advanced'|'plus'} plan  Lowest plan that has it
 * @property {string} docs     Shopify help page
 */

/**
 * Features in the answers that need a plan above Basic.
 *
 * @param {object} doc  Engagement document or interview answers
 * @returns {PlanRequirement[]}
 */
export function planRequirements(doc) {
  const needs = [];
  if (doc.b2b?.enabled === true && doc.b2b?.approach !== 'app' && doc.b2b?.price_lists === true) {
    needs.push({ feature: 'company-specific B2B catalogs', plan: 'plus', docs: 'https://help.shopify.com/en/manual/b2b/getting-started/plan-features' });
  }
  if (doc.checkout?.customisation === 'extensibility') {
    needs.push({ feature: 'checkout UI extensions on the information, shipping or payment steps / Checkout Branding API', plan: 'plus', docs: 'https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility' });
  }
  if (['expansion_stores', 'hybrid'].includes(doc.markets?.strategy)) {
    needs.push({ feature: 'expansion stores', plan: 'plus', docs: 'https://help.shopify.com/en/manual/organization-settings/expansion-stores' });
  }
  return needs;
}

/**
 * Lowest plan that covers every requirement, or null when Basic is enough.
 *
 * @param {object} doc
 * @returns {'advanced'|'plus'|null}
 */
export function minimumPlan(doc) {
  const plans = planRequirements(doc).map((r) => r.plan);
  if (!plans.length) return null;
  return plans.reduce((top, p) => (PLAN_RANK[p] > PLAN_RANK[top] ? p : top));
}

/**
 * Requirements above the chosen plan (for exit rule 11.1).
 *
 * @param {object} doc
 * @returns {PlanRequirement[]}
 */
export function unmetPlanRequirements(doc) {
  const plan = doc.shopify?.target_plan;
  if (!plan) return [];
  return planRequirements(doc).filter((r) => PLAN_RANK[r.plan] > PLAN_RANK[plan]);
}

/** "company-specific B2B catalogs (Shopify Plus)". @param {PlanRequirement[]} reqs */
export const describeRequirements = (reqs) => reqs.map((r) => `${r.feature} (${PLAN_LABEL[r.plan]})`).join(', ');

/**
 * Plan suggestion while the target plan is unanswered.
 *
 * @param {object} doc
 * @returns {{ pointer: string, value: string, reasons: string[] } | null}
 */
export function planSuggestion(doc) {
  if (doc.shopify?.target_plan) return null;
  const plan = minimumPlan(doc);
  return plan ? { pointer: '/shopify/target_plan', value: plan, reasons: planRequirements(doc).map((r) => `${r.feature} (${PLAN_LABEL[r.plan]})`) } : null;
}
