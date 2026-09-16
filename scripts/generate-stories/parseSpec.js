/**
 * @file parseSpec.js
 * @description Hand-rolled YAML parser and store-spec validator.
 *
 * Supports the subset of YAML produced by questionnaire.js:
 *   - Comments (#)
 *   - Nested objects via indentation (2-space)
 *   - Block scalar lists (- item)
 *   - Inline lists ([a, b, c])
 *   - Booleans (true / false / yes / no)
 *   - Numbers (integers and floats)
 *   - Quoted strings ("…" or '…')
 *   - Null / empty values (~, null, or bare colon)
 *
 * No external dependencies — pure Node.js built-ins only.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/** At least one of these must appear at the root for the spec to be valid. */
const REQUIRED_TOP_LEVEL_KEYS = ['store', 'tier', 'client'];

/** All valid tier strings (lower-cased). */
const VALID_TIERS = ['starter', 'medium', 'large'];

// ─── JSDoc type definitions ──────────────────────────────────────────────────

/**
 * @typedef {Object} StoreSection
 * @property {string}  name
 * @property {string}  slug
 * @property {string}  industry
 * @property {string}  primaryMarketCountry
 * @property {string}  defaultLocale
 * @property {string}  defaultCurrency
 * @property {string}  shopifyPlan
 * @property {boolean} existingStore
 */

/**
 * @typedef {Object} TierSection
 * @property {'starter'|'medium'|'large'} selected
 * @property {string} rationale
 */

/**
 * @typedef {Object} MarketsSection
 * @property {number}   count
 * @property {string}   primaryMarket
 * @property {string}   strategy
 * @property {Array<{code:string,currency:string,languages:string[]}>} marketList
 */

/**
 * @typedef {Object} CatalogueSection
 * @property {string[]} productTypes
 * @property {number}   maxVariants
 * @property {boolean}  hasBundles
 * @property {boolean}  hasDigitalProducts
 * @property {boolean}  hasSubscriptions
 * @property {boolean}  hasPreorders
 * @property {boolean}  b2bWholesale
 * @property {string[]} metafields
 */

/**
 * @typedef {Object} PromotionsSection
 * @property {string[]} types
 * @property {boolean}  stackingAllowed
 * @property {boolean}  strictScheduling
 */

/**
 * @typedef {Object} CheckoutSection
 * @property {string[]} paymentGateways
 * @property {boolean}  expressCheckout
 * @property {boolean}  giftCards
 * @property {boolean}  b2bNetTerms
 */

/**
 * @typedef {Object} ThemeSection
 * @property {string}  baseTheme
 * @property {boolean} customSections
 * @property {boolean} brandTokens
 */

/**
 * @typedef {Object} IntegrationsSection
 * @property {string|null} erp
 * @property {string|null} crm
 * @property {string|null} loyalty
 * @property {string|null} reviews
 * @property {string|null} search
 * @property {string|null} analytics
 */

/**
 * @typedef {Object} StoreSpec
 * @property {StoreSection}        store
 * @property {TierSection}         tier
 * @property {MarketsSection}      markets
 * @property {CatalogueSection}    catalogue
 * @property {PromotionsSection}   promotions
 * @property {CheckoutSection}     checkout
 * @property {ThemeSection}        theme
 * @property {IntegrationsSection} integrations
 */

/**
 * @typedef {Object} ParseResult
 * @property {StoreSpec|null} spec
 * @property {string[]}       errors
 * @property {string[]}       warnings
 */

// ─── Low-level YAML scalar helpers ───────────────────────────────────────────

/**
 * Strips a trailing inline YAML comment, respecting quoted strings.
 * @param {string} raw
 * @returns {string}
 */
function stripInlineComment(raw) {
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    else if (ch === '"' && !inSingle) inDouble = !inDouble;
    else if (ch === '#' && !inSingle && !inDouble && (i === 0 || raw[i - 1] === ' ')) {
      return raw.slice(0, i).trimEnd();
    }
  }
  return raw;
}

/**
 * Parses a single YAML scalar value string into a JS primitive or array.
 * @param {string} raw
 * @returns {string|boolean|number|null|Array<string|boolean|number|null>}
 */
export function parseScalar(raw) {
  const v = stripInlineComment(raw).trim();

  if (v === '' || v === '~' || v === 'null') return null;

  // Inline list: [a, b, c]
  if (v.startsWith('[') && v.endsWith(']')) {
    const inner = v.slice(1, -1).trim();
    if (inner === '') return [];
    return inner.split(',').map(item => parseScalar(item.trim()));
  }

  // Quoted string (single or double)
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    return v.slice(1, -1);
  }

  // Booleans
  if (v === 'true'  || v === 'yes') return true;
  if (v === 'false' || v === 'no')  return false;

  // Numbers
  if (/^-?\d+$/.test(v))         return parseInt(v, 10);
  if (/^-?\d+\.\d+$/.test(v))    return parseFloat(v);

  return v;
}

/**
 * Returns the number of leading spaces on a line.
 * @param {string} line
 * @returns {number}
 */
function indentOf(line) {
  let count = 0;
  while (count < line.length && line[count] === ' ') count++;
  return count;
}

// ─── Core YAML block parser ───────────────────────────────────────────────────

/**
 * Recursively parses a YAML block (object or list) from an array of lines.
 *
 * @param {string[]} lines     - All lines in the document.
 * @param {number}   startIdx  - Line index to start from.
 * @param {number}   baseIndent- Minimum indent level for this block.
 * @returns {{ obj: Object, nextIdx: number }}
 */
function parseBlock(lines, startIdx, baseIndent) {
  const obj = {};
  let currentListKey = null;
  let i = startIdx;

  while (i < lines.length) {
    const rawLine = lines[i];
    const stripped = rawLine.trimEnd();

    // Skip blank lines and full-line comments
    if (stripped.trim() === '' || stripped.trim().startsWith('#')) {
      i++;
      continue;
    }

    const indent = indentOf(stripped);

    // Dedented past our block — return to parent
    if (indent < baseIndent) break;

    const trimmed = stripped.trim();

    // ── Block list item ────────────────────────────────────────────────────
    if (trimmed.startsWith('- ')) {
      if (currentListKey !== null) {
        if (!Array.isArray(obj[currentListKey])) obj[currentListKey] = [];

        const itemContent = trimmed.slice(2).trim();
        // Quoted items are scalars even if they contain ':' (e.g. "EXIT: …")
        const isQuoted = itemContent.startsWith('"') || itemContent.startsWith("'");
        const colonIdx = isQuoted ? -1 : itemContent.indexOf(':');

        if (colonIdx !== -1) {
          // Peek: is next meaningful line further indented? → nested map item
          let peekIdx = i + 1;
          while (peekIdx < lines.length && lines[peekIdx].trim() === '') peekIdx++;
          const peekIndent = peekIdx < lines.length ? indentOf(lines[peekIdx]) : -1;

          if (peekIndent > indent) {
            // Multi-line map item: first key is on the "- " line
            const firstKey = itemContent.slice(0, colonIdx).trim();
            const firstVal = itemContent.slice(colonIdx + 1).trim();
            const { obj: nested, nextIdx } = parseBlock(lines, i + 1, indent + 1);
            const mapItem = { [firstKey]: parseScalar(firstVal), ...nested };
            obj[currentListKey].push(mapItem);
            i = nextIdx;
            continue;
          } else {
            // Single-line map item: { key: value }
            const firstKey = itemContent.slice(0, colonIdx).trim();
            const firstVal = itemContent.slice(colonIdx + 1).trim();
            obj[currentListKey].push({ [firstKey]: parseScalar(firstVal) });
          }
        } else {
          // Plain scalar list item
          obj[currentListKey].push(parseScalar(itemContent));
        }
        i++;
        continue;
      }
      i++;
      continue;
    }

    // ── Key: value line ────────────────────────────────────────────────────
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) { i++; continue; }

    const key    = trimmed.slice(0, colonIdx).trim();
    const rawVal = trimmed.slice(colonIdx + 1);
    const val    = rawVal.trim();

    // Peek at the next non-blank line
    let peekIdx = i + 1;
    while (peekIdx < lines.length && lines[peekIdx].trim() === '') peekIdx++;
    const peekLine    = peekIdx < lines.length ? lines[peekIdx] : '';
    const peekTrimmed = peekLine.trim();
    const peekIndent  = peekTrimmed !== '' ? indentOf(peekLine) : -1;

    if (val === '' && peekTrimmed.startsWith('- ') && peekIndent >= indent) {
      // Block list value (PyYAML emits list items at the key's own indent)
      currentListKey = key;
      obj[key] = [];
      i++;
      continue;
    }

    if (val === '' && peekIndent > indent && !peekTrimmed.startsWith('- ')) {
      // Nested object value
      currentListKey = null;
      const { obj: nested, nextIdx } = parseBlock(lines, i + 1, peekIndent);
      obj[key] = nested;
      i = nextIdx;
      continue;
    }

    // Scalar value
    currentListKey = null;
    obj[key] = parseScalar(rawVal);
    i++;
  }

  return { obj, nextIdx: i };
}

/**
 * Parses a YAML string into a plain JS object.
 * @param {string} yamlText
 * @returns {{ data: Object, parseErrors: string[] }}
 */
export function parseYaml(yamlText) {
  const parseErrors = [];
  const lines = yamlText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  let data = {};
  try {
    const { obj } = parseBlock(lines, 0, 0);
    data = obj;
  } catch (err) {
    parseErrors.push(`YAML parse error: ${err.message}`);
  }

  return { data, parseErrors };
}

// ─── Utility coercions ────────────────────────────────────────────────────────

/**
 * Coerces any value to a boolean.
 * @param {*} val
 * @returns {boolean}
 */
export function toBool(val) {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const lv = val.toLowerCase();
    return lv === 'true' || lv === 'yes' || lv === '1';
  }
  return Boolean(val);
}

/**
 * Coerces any value to an array of non-empty strings.
 * @param {*} val
 * @returns {string[]}
 */
export function toStringArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(v => String(v).trim()).filter(Boolean);
  if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
  return [String(val)];
}

// ─── Spec normaliser ──────────────────────────────────────────────────────────

/**
 * Safely reads a key from an object, returning defaultVal if absent or null.
 * @template T
 * @param {Object|null|undefined} obj
 * @param {string} key
 * @param {T} defaultVal
 * @returns {T}
 */
function g(obj, key, defaultVal) {
  if (obj && key in obj && obj[key] !== null && obj[key] !== undefined) {
    return /** @type {T} */ (obj[key]);
  }
  return defaultVal;
}

/**
 * Picks the first non-null value from a list of candidates.
 * @template T
 * @param {...T} candidates
 * @returns {T}
 */
function first(...candidates) {
  for (const c of candidates) {
    if (c !== null && c !== undefined) return c;
  }
  return candidates[candidates.length - 1];
}

/**
 * Normalises a raw parsed YAML object into a fully-typed StoreSpec.
 * Handles both camelCase and snake_case variants from the questionnaire.
 *
 * @param {Object} raw
 * @returns {StoreSpec}
 */
export function normaliseSpec(raw) {
  // Section roots — support both camelCase and snake_case top-level keys
  const store    = g(raw, 'store',        g(raw, 'client',      {}));
  const tier     = g(raw, 'tier',         {});
  const markets  = g(raw, 'markets',      {});
  const cat      = g(raw, 'catalogue',    g(raw, 'catalog',     {}));
  const promo    = g(raw, 'promotions',   {});
  const checkout = g(raw, 'checkout',     {});
  const theme    = g(raw, 'theme',        {});
  const integ    = g(raw, 'integrations', {});

  /** @type {StoreSpec} */
  return {
    store: {
      name:                 first(g(store, 'name',                 null), g(store, 'store_name', null), 'Unknown Store'),
      slug:                 first(g(store, 'slug',                 null), ''),
      industry:             first(g(store, 'industry',             null), ''),
      primaryMarketCountry: first(g(store, 'primaryMarketCountry', null), g(store, 'primary_market_country', null), g(store, 'hq_country', null), 'US'),
      defaultLocale:        first(g(store, 'defaultLocale',        null), g(store, 'default_locale',         null), 'en'),
      defaultCurrency:      first(g(store, 'defaultCurrency',      null), g(store, 'default_currency',       null), 'USD'),
      shopifyPlan:          first(g(store, 'shopifyPlan',          null), g(store, 'shopify_plan',           null), 'basic'),
      existingStore:        toBool(first(g(store, 'existingStore', null), g(store, 'existing_store',         null), false)),
    },

    tier: {
      selected:  String(first(g(tier, 'selected', null), g(tier, 'tier', null), 'starter')).toLowerCase(),
      rationale: first(g(tier, 'rationale', null), ''),
    },

    markets: {
      count:         Number(first(g(markets, 'count', null), 1)),
      primaryMarket: first(g(markets, 'primaryMarket', null), g(markets, 'primary_market', null), 'US'),
      strategy:      first(g(markets, 'strategy', null), 'shopify_markets'),
      marketList:    (() => {
                       const list = first(g(markets, 'marketList', null), g(markets, 'market_list', null), []);
                       return Array.isArray(list) ? list : [];
                     })(),
    },

    catalogue: {
      productTypes:       toStringArray(first(g(cat, 'productTypes', null),         g(cat, 'product_types',        null), [])),
      maxVariants:        Number(first(g(cat, 'maxVariants',         null),          g(cat, 'max_variants',         null), 0)),
      hasBundles:         toBool(first(g(cat, 'hasBundles',          null),          g(cat, 'has_bundles',          null), false)),
      hasDigitalProducts: toBool(first(g(cat, 'hasDigitalProducts',  null),          g(cat, 'has_digital_products', null), false)),
      hasSubscriptions:   toBool(first(g(cat, 'hasSubscriptions',    null),          g(cat, 'has_subscriptions',    null), false)),
      hasPreorders:       toBool(first(g(cat, 'hasPreorders',        null),          g(cat, 'has_preorders',        null), false)),
      b2bWholesale:       toBool(first(g(cat, 'b2bWholesale',        null),          g(cat, 'b2b_wholesale',        null), false)),
      metafields:         toStringArray(first(g(cat, 'metafields',   null),          [])),
    },

    promotions: {
      types:            toStringArray(first(g(promo, 'types',            null), [])),
      stackingAllowed:  toBool(first(g(promo, 'stackingAllowed',         null), g(promo, 'stacking_allowed',  null), false)),
      strictScheduling: toBool(first(g(promo, 'strictScheduling',        null), g(promo, 'strict_scheduling', null), false)),
    },

    checkout: {
      paymentGateways: toStringArray(first(
                         g(checkout, 'paymentGateways',  null),
                         g(checkout, 'payment_gateways', null),
                         ['shopify_payments']
                       )),
      expressCheckout: toBool(first(g(checkout, 'expressCheckout',  null), g(checkout, 'express_checkout', null), false)),
      giftCards:       toBool(first(g(checkout, 'giftCards',        null), g(checkout, 'gift_cards',       null), false)),
      b2bNetTerms:     toBool(first(g(checkout, 'b2bNetTerms',      null), g(checkout, 'b2b_net_terms',    null), false)),
    },

    theme: {
      baseTheme:      first(g(theme, 'baseTheme',      null), g(theme, 'base_theme',      null), 'dawn'),
      customSections: toBool(first(g(theme, 'customSections', null), g(theme, 'custom_sections', null), false)),
      brandTokens:    toBool(first(g(theme, 'brandTokens',    null), g(theme, 'brand_tokens',    null), false)),
    },

    integrations: {
      erp:       first(g(integ, 'erp',       null), null),
      crm:       first(g(integ, 'crm',       null), null),
      loyalty:   first(g(integ, 'loyalty',   null), null),
      reviews:   first(g(integ, 'reviews',   null), null),
      search:    first(g(integ, 'search',    null), null),
      analytics: first(g(integ, 'analytics', null), null),
    },
  };
}

// ─── Validator ────────────────────────────────────────────────────────────────

/**
 * Validates a normalised StoreSpec.
 * @param {StoreSpec} spec
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function validateSpec(spec) {
  /** @type {string[]} */ const errors   = [];
  /** @type {string[]} */ const warnings = [];

  if (!spec.store.name || spec.store.name === 'Unknown Store') {
    warnings.push('store.name is missing — stories will use "the store" as a placeholder.');
  }

  if (!VALID_TIERS.includes(spec.tier.selected)) {
    errors.push(
      `tier.selected "${spec.tier.selected}" is invalid. Must be one of: ${VALID_TIERS.join(', ')}.`
    );
  }

  if (spec.markets.count > 1 && spec.markets.marketList.length === 0) {
    warnings.push('markets.count > 1 but no market_list entries — market stories may be incomplete.');
  }

  if (spec.catalogue.hasSubscriptions) {
    warnings.push('Subscriptions detected — confirm subscription app (e.g. Recharge) is listed in integrations.');
  }

  if (spec.catalogue.b2bWholesale && !spec.checkout.b2bNetTerms) {
    warnings.push('B2B wholesale enabled but b2b_net_terms is false — confirm payment terms with client.');
  }

  return { errors, warnings };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Parses and validates a store-spec YAML string.
 *
 * @param {string} yamlText
 * @returns {ParseResult}
 */
export function parseSpec(yamlText) {
  if (typeof yamlText !== 'string') {
    return { spec: null, errors: ['parseSpec: input must be a string.'], warnings: [] };
  }
  if (yamlText.trim() === '') {
    return { spec: null, errors: ['parseSpec: input is empty.'], warnings: [] };
  }

  const { data, parseErrors } = parseYaml(yamlText);
  if (parseErrors.length > 0) {
    return { spec: null, errors: parseErrors, warnings: [] };
  }

  const hasRequiredKey = REQUIRED_TOP_LEVEL_KEYS.some(k => k in data);
  if (!hasRequiredKey) {
    return {
      spec: null,
      errors: [`Missing required top-level key. Expected at least one of: ${REQUIRED_TOP_LEVEL_KEYS.join(', ')}.`],
      warnings: [],
    };
  }

  const spec = normaliseSpec(data);
  const { errors, warnings } = validateSpec(spec);

  return {
    spec:     errors.length === 0 ? spec : null,
    errors,
    warnings,
  };
}
