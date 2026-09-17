/**
 * @file plan.js
 * @description Shopify plan implied by the answers, benchmarked against
 * Shopify's plan documentation (checked 2026-09-17; question-bank `shopify`
 * blocks carry the same facts for the consultant). The offers do not assume
 * Shopify Plus: exit rule 11.1 fires when the chosen plan is below what the
 * answers require, and the interview suggests the minimum plan while the plan
 * is open. A suggestion, never an answer: the consultant recommends the plan
 * that best fits the market and the client chooses.
 *
 * @module discovery/plan
 */

import { distinctLanguages } from './classify.js';

/** Plans from lowest to highest. */
export const PLAN_RANK = { none: 0, starter: 1, retail: 1, basic: 2, grow: 3, advanced: 4, plus: 5, enterprise: 6 };

export const PLAN_LABEL = { basic: 'Basic', grow: 'Grow', advanced: 'Advanced', plus: 'Shopify Plus' };

const H = 'https://help.shopify.com/en/manual/';

/**
 * @typedef {Object} PlanRule
 * @property {string} feature
 * @property {'grow'|'advanced'|'plus'} plan
 * @property {string} docs
 * @property {(doc: object) => boolean} applies
 * @property {string[]} inputs  JSON pointers read by `applies` (tested against offering 11.1 inputs)
 */

const has = (list, ...values) => Array.isArray(list) && values.some((v) => list.includes(v));

/** @type {PlanRule[]} */
export const PLAN_RULES = [
  { feature: 'company-specific B2B catalogs', plan: 'plus', docs: `${H}b2b/getting-started/plan-features`, inputs: ['/b2b/company_specific_catalogs', '/b2b/price_lists'],
    applies: (d) => d.b2b?.enabled === true && d.b2b?.approach !== 'b2b_app_only' && (d.b2b?.company_specific_catalogs === true || (d.b2b?.company_specific_catalogs === undefined && d.b2b?.price_lists === true)) },
  { feature: 'more than 3 active B2B catalogs', plan: 'plus', docs: `${H}b2b/getting-started/plan-features`, inputs: ['/b2b/catalog_count'],
    applies: (d) => (d.b2b?.catalog_count ?? 0) > 3 },
  { feature: 'B2B deposits, partial payments or payment requests per fulfilment', plan: 'plus', docs: `${H}b2b/getting-started/plan-features`, inputs: ['/b2b/payment_terms'],
    applies: (d) => has(d.b2b?.payment_terms, 'deposits', 'partial_payments', 'pay_per_fulfilment') },
  { feature: 'contextual B2B storefront and checkout', plan: 'advanced', docs: `${H}b2b/getting-started/plan-features`, inputs: ['/b2b/contextual_experience'],
    applies: (d) => d.b2b?.contextual_experience === true },
  { feature: 'checkout UI extensions on the information, shipping or payment steps / Checkout Branding API', plan: 'plus', docs: `${H}checkout-settings/checkout-extensibility`, inputs: ['/checkout/customisation'],
    applies: (d) => has(d.checkout?.customisation, 'checkout_step_blocks_or_fields', 'checkout_branding_api_styling') },
  { feature: 'expansion stores', plan: 'plus', docs: `${H}organization-settings/expansion-stores`, inputs: ['/markets/strategy'],
    applies: (d) => ['expansion_stores', 'hybrid'].includes(d.markets?.strategy) },
  { feature: 'selling from several legal entities', plan: 'plus', docs: `${H}payments/shopify-payments/onboarding/selling-with-multiple-entities`, inputs: ['/meta/client/legal_entities'],
    applies: (d) => (d.meta?.client?.legal_entities ?? []).length > 1 },
  { feature: 'combined listings', plan: 'plus', docs: `${H}products/combined-listings-app`, inputs: ['/catalogue/combined_listings'],
    applies: (d) => d.catalogue?.combined_listings === true },
  { feature: 'sign-in from another site (Multipass)', plan: 'plus', docs: 'https://shopify.dev/docs/storefronts/headless/building-with-the-customer-account-api', inputs: ['/customers/sign_in_methods'],
    applies: (d) => has(d.customers?.sign_in_methods, 'sign_in_from_another_site') },
  { feature: 'more than 10 locations', plan: 'plus', docs: `${H}fulfillment/setup/locations/setup`, inputs: ['/shipping/fulfilment_locations'],
    applies: (d) => (d.shipping?.fulfilment_locations ?? 0) > 10 },
  { feature: 'more than 20 published languages', plan: 'plus', docs: `${H}international/languages`, inputs: ['/markets/list'],
    applies: (d) => distinctLanguages(d).length > 20 },
  { feature: 'several product discounts on the same item', plan: 'plus', docs: `${H}discounts/discount-combinations`, inputs: ['/promotions/stacking'],
    applies: (d) => d.promotions?.stacking === 'multiple_discounts_same_item' },
  { feature: 'theme, checkout or account customisation per market', plan: 'advanced', docs: `${H}online-store/themes/customizing-themes-for-markets`, inputs: ['/markets/per_market_customisation'],
    applies: (d) => d.markets?.per_market_customisation === true },
  { feature: 'carrier-calculated shipping rates', plan: 'advanced', docs: `${H}fulfillment/setup/shipping-rates/third-party-carrier-calculated-shipping`, inputs: ['/shipping/rates'],
    applies: (d) => has(d.shipping?.rates, 'carrier_calculated') },
  { feature: 'multi-currency payouts', plan: 'advanced', docs: `${H}payments/shopify-payments/store-currency/payouts-in-multiple-currencies`, inputs: ['/payments/multi_currency_settlement'],
    applies: (d) => d.payments?.multi_currency_settlement === true },
  { feature: 'more than 15 staff accounts', plan: 'plus', docs: `${H}your-account/users/users-plan-requirements`, inputs: ['/shopify/staff_users'],
    applies: (d) => (d.shopify?.staff_users ?? 0) > 15 },
  { feature: 'more than 5 staff accounts', plan: 'advanced', docs: `${H}your-account/users/users-plan-requirements`, inputs: ['/shopify/staff_users'],
    applies: (d) => (d.shopify?.staff_users ?? 0) > 5 && (d.shopify?.staff_users ?? 0) <= 15 },
  { feature: 'staff accounts', plan: 'grow', docs: `${H}your-account/users/users-plan-requirements`, inputs: ['/shopify/staff_users'],
    applies: (d) => (d.shopify?.staff_users ?? 0) > 0 && (d.shopify?.staff_users ?? 0) <= 5 },
  { feature: 'A/B testing with Rollouts', plan: 'grow', docs: `${H}markets/rollouts`, inputs: ['/design/ab_testing'],
    applies: (d) => d.design?.ab_testing === true },
];

/**
 * @typedef {Object} PlanRequirement
 * @property {string} feature
 * @property {'grow'|'advanced'|'plus'} plan
 * @property {string} docs
 */

/**
 * Features in the answers that need a plan above Basic.
 *
 * @param {object} doc  Engagement document or interview answers
 * @returns {PlanRequirement[]}
 */
export function planRequirements(doc) {
  return PLAN_RULES.filter((r) => r.applies(doc)).map(({ feature, plan, docs }) => ({ feature, plan, docs }));
}

/**
 * Lowest plan that covers every requirement, or null when Basic is enough.
 *
 * @param {object} doc
 * @returns {'grow'|'advanced'|'plus'|null}
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
