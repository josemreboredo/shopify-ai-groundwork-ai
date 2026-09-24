/**
 * @file ai/engine/promise.js
 * @description The engagement a pack promises, built as a document.
 *
 * `closed_scope.limits` says what each pack holds — markets, languages, stores,
 * the storefront, the migration it carries. Read on its own that is a leaflet;
 * built into an engagement and run through the gates it becomes something the
 * engine can compare a real engagement against, which is how an engagement is
 * named "an M plus a second store" rather than pushed into the next pack.
 *
 * The same builder is what the closed-scope tests run, so the pages, the tests
 * and the classifier all read one promise.
 *
 * @module engine/promise
 */

import { offering } from '../schema/index.js';

const LANGS = ['de', 'fr', 'it', 'en', 'es', 'pt', 'nl'];
const CODES = ['CH', 'DE', 'AT', 'FR', 'IT', 'ES', 'NL', 'BE', 'PL', 'SE'];

/**
 * An engagement that takes exactly the given limits, and nothing more.
 *
 * @param {object} limits  a `closed_scope.limits` entry, or a variation of one
 * @returns {object}       engagement document
 */
export function engagementAt(limits) {
  const languages = LANGS.slice(0, limits.languages);
  return {
    schema_version: '1.0.0',
    meta: { client: { name: 'X', slug: 'x', business_model: limits.b2b ? 'hybrid' : 'dtc' }, source: 'questionnaire', created_at: '2026-09-01' },
    markets: {
      list: Array.from({ length: limits.markets }, (_, i) => ({
        code: CODES[i],
        currency: limits.multi_currency && i > 0 ? 'EUR' : 'CHF',
        price_strategy: 'base_currency',
        languages,
      })),
      /* The store estate is read off the derived topology, never off a count,
         so a pack that promises N stores has to be built with a topology that
         produces N — otherwise the gate never fires and the promise is a
         cheaper engagement than the one the pack sells. */
      topology: (limits.stores ?? 1) > 1
        ? {
            recommendation: 'expansion_stores',
            separate_store_markets: CODES.slice(1, limits.stores),
            additional_channel_stores: [],
          }
        : { recommendation: 'single_store_markets', separate_store_markets: [], additional_channel_stores: [] },
    },
    // A pack that promises complex variants has to be built with them, or the
    // catalogue gate never fires and the promise is the wrong engagement.
    catalogue: { sku_count: limits.sku_count, variant_options_max: limits.variant_options ?? 1 },
    /* A pack that promises N bespoke sections has to be built with N of them,
       for the same reason as the variants above. */
    design: {
      figma: { completeness: limits.storefront },
      ...(limits.bespoke_sections === undefined ? {} : { bespoke_sections: limits.bespoke_sections }),
      ...(limits.extra_theme_designs ? { extra_theme_designs: limits.extra_theme_designs } : {}),
      ...(limits.custom_templates ? { custom_templates: limits.custom_templates } : {}),
      ...(limits.headless ? { headless_required: true } : {}),
    },
    integrations: Array.from({ length: limits.integrations }, (_, i) => ({
      system: `sys${i}`, category: ['erp', 'pim', 'crm', 'oms', 'wms'][i], connector: 'custom', status: 'to_build', test_environment: 'available',
    })),
    retail: { store_count: limits.retail_locations, pos: limits.retail_locations ? 'shopify_pos' : false },
    // The redirect estate a pack carries is the SEO continuity row, read by the
    // gate off the migration volumes whether or not a migration runs.
    migration: {
      ...(limits.migration ? { source_platform: limits.migration, seo_equity: 'none' } : {}),
      ...(limits.redirects ? { volumes: { redirects: limits.redirects } } : {}),
    },
    // A pack that promises checkout blocks has to be built with them.
    checkout: limits.checkout ? { customisation: [limits.checkout] } : {},
    /* And a pack that promises measurement past GA4's own events has to be
       built with some, or the analytics gate never fires. */
    marketing: { analytics: limits.analytics_custom_events ? { custom_events: ['market_view', 'app_event'] } : {} },
    ...(limits.b2b ? { b2b: { enabled: true, ...(limits.b2b === 'advanced' ? { rfq_or_negotiated_pricing: true } : {}) } } : {}),
  };
}

/**
 * The engagement a pack promises.
 *
 * @param {'S'|'M'|'L'} code
 * @returns {object} engagement document
 */
export const promiseOf = (code) => engagementAt(offering.closed_scope.limits[code]);
