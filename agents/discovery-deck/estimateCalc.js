/**
 * @file estimateCalc.js
 * @description Effort estimation and custom/config split calculations for the
 * Discovery Closing Deck pipeline.
 *
 * All calculations are derived from the filtered user-story list produced by
 * the story generator. No external dependencies — pure Node.js built-ins only.
 *
 * @module estimateCalc
 */

// ─── Complexity → points mapping ─────────────────────────────────────────────

/**
 * Story-point weight per T-shirt size.
 * Matches the spec in docs/discovery/deck-template.md § Section 11.
 *
 * @type {Record<string, number>}
 */
export const COMPLEXITY_POINTS = {
  XS: 0.5,
  S:  1,
  M:  2,
  L:  4,
  XL: 8,
};

/**
 * Multipliers applied to story points to produce day-range estimates.
 *
 * Low  = optimistic (experienced team, no blockers)
 * High = conservative (discovery surprises, integration complexity)
 *
 * ±30% confidence band matches the deck-template disclosure.
 */
const LOW_MULTIPLIER  = 0.8;
const HIGH_MULTIPLIER = 1.4;

// ─── Domain label map ─────────────────────────────────────────────────────────

/**
 * Human-readable epic names for domain slugs used in the story registry.
 * Keys match the `domain` property on Story objects.
 *
 * @type {Record<string, string>}
 */
export const DOMAIN_LABELS = {
  'store-identity':       'Store Identity & Branding',
  'catalogue':            'Catalogue & Product Management',
  'checkout':             'Checkout & Payments',
  'markets':              'Markets & Internationalisation',
  'b2b':                  'B2B & Wholesale',
  'integrations':         'Integrations & Automation',
  'performance':          'Performance & SEO',
  'analytics':            'Analytics & Reporting',
  'apps':                 'App Configuration',
  'customer-accounts':    'Customer Accounts',
  'content':              'Content & CMS',
  'migrations':           'Data Migration',
  'theme':                'Theme Development',
  'infrastructure':       'Infrastructure & DevOps',
};

/**
 * Convert a domain slug to its human-readable epic label.
 * Falls back to title-casing the slug if not found in the map.
 *
 * @param {string} domain
 * @returns {string}
 */
export function domainLabel(domain) {
  if (DOMAIN_LABELS[domain]) return DOMAIN_LABELS[domain];
  return domain
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ─── Per-story calculations ───────────────────────────────────────────────────

/**
 * Return the story-point value for a given complexity string.
 * Unknown sizes default to M (2 points) with a warning.
 *
 * @param {string} complexity  T-shirt size string ('XS'|'S'|'M'|'L'|'XL')
 * @param {string[]} [warnings]  Mutable array to push warnings into
 * @returns {number}
 */
export function storyPoints(complexity, warnings = []) {
  const pts = COMPLEXITY_POINTS[complexity];
  if (pts === undefined) {
    warnings.push(
      `Unknown complexity "${complexity}" — defaulted to M (2 points).`,
    );
    return COMPLEXITY_POINTS['M'];
  }
  return pts;
}

/**
 * Convert story points to a day range [low, high].
 *
 * @param {number} points
 * @returns {{ low: number, high: number }}
 */
export function pointsToDays(points) {
  return {
    low:  Math.round(points * LOW_MULTIPLIER  * 10) / 10,
    high: Math.round(points * HIGH_MULTIPLIER * 10) / 10,
  };
}

// ─── Epic (domain-grouped) estimate ──────────────────────────────────────────

/**
 * @typedef {Object} EpicEstimate
 * @property {string} domain      Domain slug
 * @property {string} label       Human-readable epic name
 * @property {number} storyCount  Number of stories in this domain
 * @property {number} points      Total story points
 * @property {number} daysLow     Optimistic day estimate
 * @property {number} daysHigh    Conservative day estimate
 */

/**
 * Group a list of stories by domain and compute effort estimates per epic.
 *
 * @param {import('../../scripts/generate-stories/storyRegistry.js').Story[]} stories
 * @param {string[]} [warnings]
 * @returns {EpicEstimate[]}
 */
export function estimateByEpic(stories, warnings = []) {
  /** @type {Map<string, { stories: typeof stories, points: number }>} */
  const grouped = new Map();

  for (const story of stories) {
    const { domain, complexity } = story;
    if (!grouped.has(domain)) {
      grouped.set(domain, { stories: [], points: 0 });
    }
    const entry = grouped.get(domain);
    entry.stories.push(story);
    entry.points += storyPoints(complexity, warnings);
  }

  return Array.from(grouped.entries())
    .map(([domain, { stories: domainStories, points }]) => {
      const { low, high } = pointsToDays(points);
      return {
        domain,
        label:      domainLabel(domain),
        storyCount: domainStories.length,
        points:     Math.round(points * 10) / 10,
        daysLow:    low,
        daysHigh:   high,
      };
    })
    .sort((a, b) => b.points - a.points); // largest epics first
}

/**
 * @typedef {Object} TotalEstimate
 * @property {number} totalStories
 * @property {number} totalPoints
 * @property {number} totalDaysLow
 * @property {number} totalDaysHigh
 * @property {number} sprintCountLow   Estimated sprint count (10 days/sprint, optimistic)
 * @property {number} sprintCountHigh  Estimated sprint count (conservative)
 */

/**
 * Compute totals across all epics.
 *
 * @param {EpicEstimate[]} epics
 * @returns {TotalEstimate}
 */
export function totalEstimate(epics) {
  const totalStories  = epics.reduce((s, e) => s + e.storyCount, 0);
  const totalPoints   = Math.round(epics.reduce((s, e) => s + e.points, 0) * 10) / 10;
  const totalDaysLow  = Math.round(epics.reduce((s, e) => s + e.daysLow,  0) * 10) / 10;
  const totalDaysHigh = Math.round(epics.reduce((s, e) => s + e.daysHigh, 0) * 10) / 10;

  return {
    totalStories,
    totalPoints,
    totalDaysLow,
    totalDaysHigh,
    sprintCountLow:  Math.ceil(totalDaysLow  / 10),
    sprintCountHigh: Math.ceil(totalDaysHigh / 10),
  };
}

// ─── Custom vs Configuration split ───────────────────────────────────────────

/**
 * @typedef {Object} WorkSplit
 * @property {number} configCount       Stories classified as Configuration
 * @property {number} themeCount        Stories classified as Theme customisation
 * @property {number} customCount       Stories classified as Custom development
 * @property {number} configPct         % of total
 * @property {number} themePct          % of total
 * @property {number} customPct         % of total
 */

/**
 * Classify stories into Configuration / Theme / Custom and return percentages.
 *
 * Classification rules (from deck-template.md § Section 10):
 *   - CONFIG : complexity XS or S, domain NOT in theme/identity group
 *   - THEME  : domain is 'store-identity', 'theme', or 'content'
 *   - CUSTOM : complexity L or XL
 *
 * Stories that match multiple rules are assigned to the highest-cost bucket
 * (CUSTOM > THEME > CONFIG).
 *
 * @param {import('../../scripts/generate-stories/storyRegistry.js').Story[]} stories
 * @returns {WorkSplit}
 */
export function workSplit(stories) {
  const THEME_DOMAINS  = new Set(['store-identity', 'theme', 'content']);
  const CUSTOM_SIZES   = new Set(['L', 'XL']);
  const CONFIG_SIZES   = new Set(['XS', 'S']);

  let configCount = 0;
  let themeCount  = 0;
  let customCount = 0;

  for (const story of stories) {
    if (CUSTOM_SIZES.has(story.complexity)) {
      customCount++;
    } else if (THEME_DOMAINS.has(story.domain)) {
      themeCount++;
    } else if (CONFIG_SIZES.has(story.complexity)) {
      configCount++;
    } else {
      // M complexity, non-theme domain — count as config (medium effort, standard patterns)
      configCount++;
    }
  }

  const total = stories.length || 1; // avoid division by zero

  return {
    configCount,
    themeCount,
    customCount,
    configPct: Math.round((configCount / total) * 100),
    themePct:  Math.round((themeCount  / total) * 100),
    customPct: Math.round((customCount / total) * 100),
  };
}
