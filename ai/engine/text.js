/**
 * @file text.js
 * @description Prose helpers shared by the engine, the views and the pages.
 *
 * @module engine/text
 */

/* Names keep their capital mid-sentence: Shopify's own features, the platforms
   a migration comes from, and the vendors an add-on names first. */
const NAMES = /^(Shopify|WooCommerce|Shopware|Magento|Salesforce|Klaviyo|Omnisend|Liquid|Hydrogen|Oxygen|React|Figma|Google|Meta|TikTok|Amazon|eBay)\b/;

/**
 * A label or a sentence as it reads mid-sentence: "Written SOPs" becomes
 * "written SOPs", while "B2B and wholesale" and "Shopify’s own B2B" stay as
 * they are. Lower-casing the first letter blindly printed "b2B" and "sEO".
 *
 * @param {string} text
 * @returns {string}
 */
export const lowerFirst = (text) => (!text || NAMES.test(text) || /^[A-Z][A-Z0-9]/.test(text)
  ? text
  : text.charAt(0).toLowerCase() + text.slice(1));
