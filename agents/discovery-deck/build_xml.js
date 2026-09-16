#!/usr/bin/env node
/**
 * @file build_xml.js
 * @description CLI orchestrator for the Discovery Closing Deck pipeline.
 *
 * Collects every discovery artefact for one client, runs the estimate
 * calculations, and writes `discovery-deck.xml` — the single input the
 * consultant pastes into Claude together with docs/discovery/deck-prompt.md.
 *
 * Usage:
 *   node agents/discovery-deck/build_xml.js --client acme-watches
 *   node agents/discovery-deck/build_xml.js --client acme-watches \
 *     --questionnaire docs/discovery/example-acme-questionnaire.md \
 *     --clients-dir tests/fixtures/discovery-deck --output /tmp/deck.xml
 *
 * Inputs (all under <clients-dir>/<client>/):
 *   store-spec.yaml     required — written by the Frame Agent
 *   questionnaire.md    optional — override with --questionnaire
 *   capability-map.md   optional
 *   delivery-plan.md    optional
 *   app-shortlist.md    optional
 *   risks.md            optional
 *
 * Any absent artefact or field becomes <missing reason="…"/> and is listed in
 * the <warnings> block. Nothing is invented. Section contract:
 * docs/discovery/deck-template.md.
 *
 * No external dependencies — pure Node.js built-ins only.
 */

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseYaml, parseSpec } from '../../scripts/generate-stories/parseSpec.js';
import { selectStories }        from '../../scripts/generate-stories/storyRegistry.js';
import {
  COMPLEXITY_POINTS,
  estimateByEpic,
  totalEstimate,
  workSplit,
  domainLabel,
} from './estimateCalc.js';
import {
  parseCapabilityMap,
  parseDeliveryPlan,
  parseAppShortlist,
  parseRisks,
  parseQuestionnaire,
} from './parseMarkdown.js';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Soft size ceiling from the XML output contract. */
const MAX_XML_BYTES = 100 * 1024;

const STANDARD_EXCLUSIONS = [
  'Content migration (copy, blog articles, static pages)',
  'SEO copywriting',
  'Product photography',
  'Third-party system SLAs',
  'Post-launch support (unless retainer signed)',
];

/** Display order for Section 7 — cheapest/safest resolution first. */
const RESOLUTION_ORDER = ['native', 'app', 'theme', 'custom'];

// ─── CLI ──────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} DeckArgs
 * @property {string}      client
 * @property {string}      clientDir
 * @property {string}      questionnaire
 * @property {string}      output
 * @property {string|null} consultant
 * @property {string}      date
 */

/**
 * @param {string[]} argv
 * @param {string}   [cwd]
 * @returns {DeckArgs}
 */
export function parseArgs(argv, cwd = process.cwd()) {
  /** @type {Record<string, string>} */
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : '';
      flags[token.slice(2)] = value;
    }
  }

  if (!flags.client) {
    throw new Error(
      'Missing required argument: --client <slug>\n' +
      'Usage: npm run discovery-deck -- --client <slug> ' +
      '[--clients-dir clients] [--questionnaire path.md] [--output path.xml] ' +
      '[--consultant "Name"] [--date YYYY-MM-DD]',
    );
  }
  if (!/^[a-z0-9][a-z0-9-]*$/.test(flags.client)) {
    throw new Error(`Invalid --client "${flags.client}". Use a kebab-case slug.`);
  }

  const clientsDir = path.resolve(cwd, flags['clients-dir'] || path.join(REPO_ROOT, 'clients'));
  const clientDir  = path.join(clientsDir, flags.client);

  return {
    client:        flags.client,
    clientDir,
    questionnaire: path.resolve(cwd, flags.questionnaire || path.join(clientDir, 'questionnaire.md')),
    output:        path.resolve(cwd, flags.output || path.join(clientDir, 'discovery-deck.xml')),
    consultant:    flags.consultant || null,
    date:          flags.date || new Date().toISOString().slice(0, 10),
  };
}

// ─── XML writer ───────────────────────────────────────────────────────────────

/**
 * Escape text for XML and strip characters that are illegal in XML 1.0.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function esc(value) {
  return String(value)
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Minimal indented XML writer. Collects warnings for every <missing> emitted.
 */
class XmlWriter {
  constructor() {
    /** @type {string[]} */ this.lines    = [];
    /** @type {string[]} */ this.warnings = [];
    this.depth = 0;
    /** @type {string[]} */ this.path = [];
  }

  /** @param {Record<string, unknown>} [attrs] */
  static attrs(attrs = {}) {
    return Object.entries(attrs)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => ` ${k}="${esc(v)}"`)
      .join('');
  }

  /** @param {string} line */
  push(line) {
    this.lines.push('  '.repeat(this.depth) + line);
  }

  /**
   * @param {string} name
   * @param {Record<string, unknown>} [attrs]
   */
  open(name, attrs) {
    this.push(`<${name}${XmlWriter.attrs(attrs)}>`);
    this.path.push(name);
    this.depth++;
  }

  close() {
    this.depth--;
    this.push(`</${this.path.pop()}>`);
  }

  /**
   * Emit <name>value</name>, or <name><missing reason/></name> when empty.
   *
   * @param {string}  name
   * @param {unknown} value
   * @param {string}  [reason]  Why the value would be missing (source hint)
   * @param {Record<string, unknown>} [attrs]
   */
  field(name, value, reason, attrs) {
    if (isBlank(value)) {
      this.missing(name, reason ?? 'No source value', attrs);
      return;
    }
    this.push(`<${name}${XmlWriter.attrs(attrs)}>${esc(value)}</${name}>`);
  }

  /**
   * Emit a list of <item> children; multi-line strings are split per line.
   *
   * @param {string} name
   * @param {unknown[]|string} values
   * @param {string} [reason]
   */
  list(name, values, reason) {
    const items = (Array.isArray(values) ? values : String(values ?? '').split('\n'))
      .map((v) => String(v ?? '').trim())
      .filter(Boolean);
    if (items.length === 0) {
      this.missing(name, reason ?? 'No source value');
      return;
    }
    this.open(name);
    for (const item of items) this.field('item', item);
    this.close();
  }

  /**
   * @param {string} name
   * @param {string} reason
   * @param {Record<string, unknown>} [attrs]
   */
  missing(name, reason, attrs) {
    const where = [...this.path.filter((p) => p !== 'discovery-deck'), name].join(' › ');
    this.warnings.push(`${where}: ${reason}`);
    this.push(`<${name}${XmlWriter.attrs(attrs)}><missing reason="${esc(reason)}"/></${name}>`);
  }

  /** @param {string} name  @param {Record<string, unknown>} attrs */
  empty(name, attrs) {
    this.push(`<${name}${XmlWriter.attrs(attrs)}/>`);
  }

  toString() {
    return this.lines.join('\n');
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** @param {unknown} v */
function isBlank(v) {
  return v === undefined || v === null || (typeof v === 'string' && v.trim() === '') ||
         (Array.isArray(v) && v.length === 0);
}

/**
 * Read a dotted path from the raw (un-normalised) spec, trying each candidate.
 *
 * @param {Object} raw
 * @param {...string} paths
 * @returns {any}
 */
function pick(raw, ...paths) {
  for (const p of paths) {
    const v = p.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), raw);
    if (!isBlank(v)) return v;
  }
  return undefined;
}

/**
 * Exit reasons may come back as single-key maps if the YAML was hand-edited
 * without quotes ("- EXIT: foo" → { EXIT: 'foo' }). Flatten them to strings.
 *
 * @param {unknown} reasons
 * @returns {string[]}
 */
function exitReasons(reasons) {
  if (!Array.isArray(reasons)) return isBlank(reasons) ? [] : [String(reasons)];
  return reasons.map((r) =>
    r && typeof r === 'object'
      ? Object.entries(r).map(([k, v]) => `${k}: ${v}`).join(', ')
      : String(r),
  );
}

/** @param {string} resolution */
function resolutionKey(resolution) {
  const lower = resolution.toLowerCase();
  return RESOLUTION_ORDER.find((k) => lower.includes(k)) ?? 'other';
}

/** @param {string} s */
const titleCase = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// ─── Section builders ─────────────────────────────────────────────────────────

/**
 * @typedef {Object} DeckContext
 * @property {DeckArgs} args
 * @property {Object}   raw           Raw parsed YAML
 * @property {import('../../scripts/generate-stories/parseSpec.js').StoreSpec} spec
 * @property {string[]} specWarnings
 * @property {boolean}  go
 * @property {string[]} exits
 * @property {string}   plan          Recommended Shopify plan
 * @property {import('../../scripts/generate-stories/storyRegistry.js').Story[]} stories
 * @property {import('./estimateCalc.js').EpicEstimate[]}  epics
 * @property {import('./estimateCalc.js').TotalEstimate}   totals
 * @property {import('./estimateCalc.js').WorkSplit}       split
 * @property {import('./parseMarkdown.js').CapabilityMapResult}  capabilities
 * @property {import('./parseMarkdown.js').DeliveryPlanResult}   plan_
 * @property {import('./parseMarkdown.js').AppShortlistResult}   apps
 * @property {import('./parseMarkdown.js').RisksResult}          risks
 * @property {import('./parseMarkdown.js').QuestionnaireData}    q
 */

/** @param {XmlWriter} x @param {DeckContext} c */
function sectionCover(x, c) {
  const { raw, spec, args, q } = c;
  const clientName = spec.store.name === 'Unknown Store' ? '' : spec.store.name;
  const consultant = args.consultant ?? pick(raw, 'delivery.consultant') ?? q.consultant;

  x.open('section', { id: 'cover', n: 1 });
  x.field('client-name', clientName, 'store-spec client.name not set');
  x.field('project-name',
    pick(raw, 'client.project_name', 'store.project_name') ??
      `Shopify ${titleCase(spec.tier.selected)} Implementation`);
  x.field('consultant', consultant, 'Pass --consultant or set delivery.consultant in store-spec');
  x.field('date', args.date);
  x.field('confidentiality',
    `Confidential — prepared for ${clientName || '[Client]'} by ${consultant || '[Consultant]'}`);
  x.close();
}

/** @param {XmlWriter} x @param {DeckContext} c */
function sectionExecutiveSummary(x, c) {
  const { spec, q, capabilities } = c;
  x.open('section', { id: 'executive-summary', n: 2 });
  x.field('go', String(c.go));
  if (!c.go) {
    x.list('stop-reasons', c.exits, 'delivery.go is false but exits.reasons is empty');
  }
  x.field('core-problem', q.coreProblem, 'Questionnaire § 0.1 not answered');
  x.open('proposed-solution');
  x.field('tier', spec.tier.selected);
  x.field('tier-rationale', spec.tier.rationale, 'store-spec tier.rationale not set');
  x.field('shopify-plan', c.plan);
  x.list('top-capabilities',
    capabilities.rows.slice(0, 2).map((r) => `${r.requirement} — ${r.resolution} (${r.tool})`),
    capabilities.reason ?? 'capability-map.md has no rows');
  x.close();
  x.field('expected-outcome', q.successMetric || q.growthGoals, 'Questionnaire § 0.4 not answered');
  x.close();
}

/** @param {XmlWriter} x @param {DeckContext} c */
function sectionBusinessContext(x, c) {
  const { q, raw } = c;
  x.open('section', { id: 'business-context', n: 3 });
  x.list('revenue-gaps',     q.revenueGaps,  'Questionnaire § 0.2 not answered');
  x.list('pain-points',      q.painPoints,   'Questionnaire § 0.3 not answered');
  x.list('growth-goals',     q.growthGoals,  'Questionnaire § 0.4 not answered');
  x.field('deadline',        q.deadline || pick(raw, 'delivery.target_launch_date'),
    'No deadline in questionnaire § 0.4 or delivery.target_launch_date');
  x.field('budget',          q.budget,         'Questionnaire § 0.6 not answered');
  x.field('budget-priority', q.budgetPriority, 'Questionnaire § 0.6 priority not answered');
  x.close();
}

/** @param {XmlWriter} x @param {DeckContext} c */
function sectionMethodology(x, c) {
  const { q, capabilities, plan_, apps, risks } = c;
  x.open('section', { id: 'methodology', n: 4 });
  x.list('questionnaire-sections-completed',
    q.sectionsCompleted.map((n) => `§ ${n}`),
    q.reason ?? 'No answered questionnaire sections detected');

  x.open('artefacts');
  const artefacts = [
    ['questionnaire',  q.found],
    ['store-spec',     true],
    ['capability-map', capabilities.found],
    ['delivery-plan',  plan_.found],
    ['app-shortlist',  apps.found],
    ['risks',          risks.found],
    ['user-stories',   c.stories.length > 0],
  ];
  for (const [name, present] of artefacts) x.empty('artefact', { name, present: String(present) });
  x.close();

  x.field('methodology', 'Gaia-governed delivery · LWC biota · T1–T4 tier system');
  x.close();
}

/** @param {XmlWriter} x @param {DeckContext} c */
function sectionAsIs(x, c) {
  const { q, spec } = c;
  const migrationType = q.migrationType ||
    (spec.store.existingStore ? 'Shopify store rebuild'
      : q.currentPlatform ? 'Re-platform to Shopify' : '');

  x.open('section', { id: 'as-is', n: 5 });
  x.field('current-platform', q.currentPlatform, 'Questionnaire § 0.5 platform not stated');
  x.field('migration-type', migrationType, 'Migration type not stated',
    q.migrationType ? undefined : { derived: 'true' });
  x.field('must-preserve',   q.mustPreserve,  'Questionnaire § 0.5 "must not be lost" not answered');
  x.list('top-pain-points',  q.topPainPoints, 'Questionnaire § 0.5 "most unhappy with" not answered');
  x.list('performance-metrics', q.revenueGaps, 'Questionnaire § 0.2 not answered');
  x.close();
}

/** @param {XmlWriter} x @param {DeckContext} c */
function sectionSolutionDesign(x, c) {
  const { spec, raw } = c;
  const marketCount = spec.markets.count;
  const baseTheme   = String(spec.theme.baseTheme ?? '');
  const pattern     = /hydrogen|headless/i.test(baseTheme) ? 'headless'
    : marketCount > 1 ? 'multi-market' : 'single-market';

  const marketList = pick(raw, 'markets.market_list', 'markets.marketList') ?? [];
  const markets = Array.isArray(marketList)
    ? marketList.map((m) => (typeof m === 'object'
        ? [m.code, m.currency, toList(m.languages).join('/')].filter(Boolean).join(' · ')
        : String(m)))
    : [];

  const integrationList = toList(pick(raw, 'integrations.list'))
    .map((i) => (typeof i === 'object' ? Object.values(i).filter(Boolean).join(' — ') : String(i)));
  const namedIntegrations = Object.entries(spec.integrations)
    .filter(([, v]) => !isBlank(v))
    .map(([k, v]) => `${v} (${k})`);

  const b2b = spec.catalogue.b2bWholesale || pick(raw, 'catalogue.has_b2b') === true;

  x.open('section', { id: 'solution-design', n: 6 });
  x.field('tier', spec.tier.selected);
  x.field('shopify-plan', c.plan, undefined,
    { rationale: b2b ? 'B2B requires Shopify Plus' : `From store-spec (${spec.store.shopifyPlan})` });
  x.field('architecture-pattern', pattern, undefined, { derived: 'true' });

  x.open('theme');
  x.field('base-theme',      baseTheme, 'theme.base_theme not set');
  x.field('custom-sections', String(spec.theme.customSections));
  x.field('brand-tokens',    String(spec.theme.brandTokens));
  x.close();

  x.open('markets', { count: marketCount });
  x.field('strategy', spec.markets.strategy);
  x.list('market-list', markets, marketCount > 1 ? 'markets.market_list is empty' : 'Single market');
  x.close();

  x.open('checkout');
  x.field('checkout-type', pick(raw, 'payments.checkout_type'), 'payments.checkout_type not set');
  x.list('extensions', toList(pick(raw, 'payments.checkout_extensions')), 'No checkout extensions listed');
  x.field('express-checkout', String(spec.checkout.expressCheckout));
  x.field('gift-cards',       String(spec.checkout.giftCards));
  x.close();

  x.list('payment-providers',
    toList(pick(raw, 'payments.providers', 'payments.provider', 'checkout.payment_gateways', 'checkout.paymentGateways')),
    'No payment providers in store-spec');

  x.open('b2b', { enabled: String(b2b) });
  if (b2b) x.field('net-terms', String(spec.checkout.b2bNetTerms));
  x.close();

  x.list('integrations', [...integrationList, ...namedIntegrations], 'No integrations in store-spec');
  x.close();
}

/** @param {unknown} v @returns {any[]} */
function toList(v) {
  if (isBlank(v)) return [];
  return Array.isArray(v) ? v : [v];
}

/**
 * @param {XmlWriter} x
 * @param {import('./parseMarkdown.js').CapabilityRow[]} rows
 */
function capabilityRows(x, rows) {
  for (const r of rows) {
    x.open('requirement', { resolution: resolutionKey(r.resolution), tier: r.tier });
    x.field('name', r.requirement);
    x.field('resolution', r.resolution, 'No resolution in capability-map row');
    x.field('tool', r.tool, 'No tool in capability-map row');
    if (!isBlank(r.notes)) x.field('notes', r.notes);
    x.close();
  }
}

/** @param {XmlWriter} x @param {DeckContext} c */
function sectionCapabilityMap(x, c) {
  x.open('section', { id: 'capability-map', n: 7 });
  if (!c.capabilities.found) {
    x.missing('capability-map', c.capabilities.reason ?? 'capability-map.md has no rows');
  } else {
    const sorted = [...c.capabilities.rows].sort((a, b) =>
      rank(resolutionKey(a.resolution)) - rank(resolutionKey(b.resolution)));
    x.open('capability-map', { rows: sorted.length });
    capabilityRows(x, sorted);
    x.close();
  }
  x.close();
}

/** @param {string} key */
function rank(key) {
  const i = RESOLUTION_ORDER.indexOf(key);
  return i === -1 ? RESOLUTION_ORDER.length : i;
}

/**
 * @param {XmlWriter} x
 * @param {string} name
 * @param {import('./parseMarkdown.js').DeliveryTask[]} tasks
 */
function taskList(x, name, tasks) {
  x.open(name, { tasks: tasks.length });
  for (const t of tasks) {
    x.open('task', { tier: t.tier, owner: t.owner, sprint: t.sprint });
    x.field('title', t.task);
    if (!isBlank(t.capability)) x.field('capability', t.capability);
    if (!isBlank(t.notes))      x.field('notes', t.notes);
    x.close();
  }
  x.close();
}

/** @param {XmlWriter} x @param {DeckContext} c */
function sectionScope(x, c) {
  x.open('section', { id: 'scope', n: 8 });
  if (!c.plan_.found) {
    x.missing('phase-1', c.plan_.reason ?? 'delivery-plan.md has no Phase 1 tasks');
  } else {
    taskList(x, 'phase-1', c.plan_.phase1);
    if (c.plan_.phase2.length > 0) taskList(x, 'phase-2', c.plan_.phase2);
  }
  x.list('out-of-scope', [...c.exits, ...deferredTasks(c)], 'No exits or deferred items');
  x.field('approach', 'Agile sprint delivery · T1–T4 gated · consultant-approved plans');
  x.close();
}

/** @param {DeckContext} c */
function deferredTasks(c) {
  return [...c.plan_.phase1, ...c.plan_.phase2]
    .filter((t) => /defer/i.test(`${t.task} ${t.notes}`))
    .map((t) => t.task);
}

/** @param {XmlWriter} x @param {DeckContext} c */
function sectionApps(x, c) {
  const { apps } = c;
  x.open('section', { id: 'apps', n: 9 });
  if (!apps.found) {
    x.missing('recommended', apps.reason ?? 'app-shortlist.md has no apps');
  } else {
    const recommended = apps.apps.filter((a) => a.recommended);
    const rejected    = apps.apps.filter((a) => !a.recommended);

    x.open('recommended', { count: recommended.length });
    for (const a of recommended) {
      x.open('app', { tier: a.tier });
      x.field('name', a.name);
      x.field('why', a.rationale, `No rationale for ${a.name}`);
      x.field('cost', a.cost, `No cost for ${a.name}`, { monthly: a.costMonthly });
      x.field('integration', a.integration, `No integration complexity for ${a.name}`);
      x.close();
    }
    x.close();

    x.open('not-recommended', { count: rejected.length });
    for (const a of rejected) {
      x.open('app');
      x.field('name', a.name);
      x.field('reason', a.rejectionReason, `No rejection reason for ${a.name}`);
      x.close();
    }
    x.close();

    x.field('total-monthly', apps.totalMonthly, undefined, { currency: 'EUR' });
    x.field('total-annual',  apps.totalAnnual,  undefined, { currency: 'EUR' });
  }
  x.close();
}

/** @param {XmlWriter} x @param {DeckContext} c */
function sectionWorkSplit(x, c) {
  const s = c.split;
  x.open('section', { id: 'work-split', n: 10 });
  x.empty('bucket', { name: 'configuration', stories: s.configCount, percent: s.configPct });
  x.empty('bucket', { name: 'theme',         stories: s.themeCount,  percent: s.themePct });
  x.empty('bucket', { name: 'custom',        stories: s.customCount, percent: s.customPct });
  x.field('note', 'Higher configuration % = lower risk and faster delivery.');
  x.close();
}

/** @param {XmlWriter} x @param {DeckContext} c */
function sectionEstimate(x, c) {
  const t = c.totals;
  x.open('section', { id: 'estimate', n: 11 });
  x.open('points-scale');
  for (const [size, points] of Object.entries(COMPLEXITY_POINTS)) {
    x.empty('size', { name: size, points });
  }
  x.close();
  if (c.epics.length === 0) {
    x.missing('epics', 'No stories selected for this store-spec');
  } else {
    x.open('epics');
    for (const e of c.epics) {
      x.empty('epic', {
        domain: e.domain, label: e.label, stories: e.storyCount,
        points: e.points, 'days-low': e.daysLow, 'days-high': e.daysHigh,
      });
    }
    x.close();
  }
  x.empty('total', {
    stories: t.totalStories, points: t.totalPoints,
    'days-low': t.totalDaysLow, 'days-high': t.totalDaysHigh,
  });
  x.field('confidence', '±30% indicative; refined in sprint planning');
  x.close();
}

/**
 * @param {XmlWriter} x
 * @param {string} name
 * @param {import('./parseMarkdown.js').RiskItem[]} items
 */
function riskGroup(x, name, items) {
  x.open(name, { count: items.length });
  for (const r of items) {
    x.open('risk', { id: r.id, severity: r.severity, source: r.source });
    x.field('title', r.title);
    x.field('mitigation', r.mitigation, `No mitigation for ${name} #${r.id}`);
    x.field('owner', r.owner, `No owner for ${name} #${r.id}`);
    x.close();
  }
  x.close();
}

/** @param {XmlWriter} x @param {DeckContext} c */
function sectionRisks(x, c) {
  const { risks } = c;
  x.open('section', { id: 'risks', n: 12 });
  if (!risks.found) {
    x.missing('hard-blockers', risks.reason ?? 'risks.md not found');
  } else {
    riskGroup(x, 'hard-blockers', risks.hardBlockers);
    riskGroup(x, 'flags',         risks.flags);
    riskGroup(x, 'open-items',    risks.openItems);
    riskGroup(x, 'assumptions',   risks.assumptions);
  }
  x.field('rule', 'Every hard blocker needs a named owner and resolution deadline before GO.');
  x.close();
}

/** @param {XmlWriter} x @param {DeckContext} c */
function sectionOutOfScope(x, c) {
  x.open('section', { id: 'out-of-scope', n: 13 });
  if (c.exits.length > 0) x.list('exit-exclusions', c.exits);
  const deferred = deferredTasks(c);
  if (deferred.length > 0) x.list('deferred', deferred);
  x.list('standard-exclusions', STANDARD_EXCLUSIONS);
  x.close();
}

/** @param {XmlWriter} x @param {DeckContext} c */
function sectionNextSteps(x, c) {
  const { risks } = c;
  x.open('section', { id: 'next-steps', n: 14 });
  x.list('open-questions',
    risks.openItems.map((r) => (r.mitigation ? `${r.title} — ${r.mitigation}` : r.title)),
    risks.found ? 'No open items in risks.md' : (risks.reason ?? 'risks.md not found'));
  x.list('client-actions',
    risks.flags.map((r) => r.mitigation).filter(Boolean),
    risks.found ? 'No flag actions in risks.md' : (risks.reason ?? 'risks.md not found'));
  x.field('next-milestone', 'Discovery sign-off → Sprint 1 kick-off');
  x.field('sign-off', 'Client confirms: scope · out-of-scope list · risk register');
  x.close();
}

/** @param {XmlWriter} x @param {DeckContext} c */
function sectionTimeline(x, c) {
  const { totals, q, raw } = c;
  x.open('section', { id: 'timeline', n: 15 });
  x.empty('sprints', {
    low: totals.sprintCountLow, high: totals.sprintCountHigh, 'days-per-sprint': 10,
  });
  x.field('kickoff', pick(raw, 'delivery.kickoff_date'), 'delivery.kickoff_date not set');
  x.field('go-live-target', pick(raw, 'delivery.target_launch_date') || q.deadline,
    'No go-live target in store-spec or questionnaire');
  x.list('milestones', ['Sprint 1 kick-off', 'Phase 1 complete', 'UAT', 'Go-live']);
  x.field('buffer', '+20% contingency built into day-range estimates');
  x.close();
}

/** @param {XmlWriter} x @param {DeckContext} c */
function sectionInvestment(x, c) {
  const { totals, apps, q } = c;
  x.open('section', { id: 'investment', n: 16 });
  x.field('budget-envelope', q.budget, 'Questionnaire § 0.6 budget not answered');
  x.empty('delivery-days', { low: totals.totalDaysLow, high: totals.totalDaysHigh });
  x.field('consultant-rate', '[CONSULTANT RATE]');
  if (apps.found) {
    x.field('apps-monthly', apps.totalMonthly, undefined, { currency: 'EUR' });
    x.field('apps-annual',  apps.totalAnnual,  undefined, { currency: 'EUR' });
  } else {
    x.missing('apps-annual', apps.reason ?? 'app-shortlist.md not found');
  }
  x.field('shopify-plan', c.plan);
  x.field('note', 'Indicative. Fixed-price quote issued after sprint planning.');
  x.close();
}

/** @param {XmlWriter} x @param {DeckContext} c */
function sectionAppendixStories(x, c) {
  x.open('section', { id: 'appendix-stories', n: 17 });
  x.open('stories', { count: c.stories.length });
  c.stories.forEach((s, i) => {
    x.push(
      `<story n="${i + 1}" slug="${esc(s.slug)}" domain="${esc(domainLabel(s.domain))}" ` +
      `size="${esc(s.complexity)}">${esc(s.title)}</story>`,
    );
  });
  x.close();
  x.close();
}

/** @param {XmlWriter} x @param {DeckContext} c */
function sectionAppendixCapabilities(x, c) {
  x.open('section', { id: 'appendix-capabilities', n: 18 });
  x.field('note', 'Full capability map is in section 7 (unabridged); full app list in section 9.');
  x.close();
}

// ─── Assembly ─────────────────────────────────────────────────────────────────

/**
 * Build the full XML document for a client.
 *
 * @param {DeckArgs} args
 * @returns {{ xml: string, warnings: string[], go: boolean, stories: number }}
 */
export function buildDeck(args) {
  const specPath = path.join(args.clientDir, 'store-spec.yaml');
  if (!fs.existsSync(specPath)) {
    throw new Error(`store-spec.yaml not found at ${specPath} — run the Frame Agent first.`);
  }
  const yamlText = fs.readFileSync(specPath, 'utf8');
  const { spec, errors, warnings: specWarnings } = parseSpec(yamlText);
  if (!spec) {
    throw new Error(`store-spec validation failed:\n  • ${errors.join('\n  • ')}`);
  }
  const raw = parseYaml(yamlText).data;

  const exits = exitReasons(pick(raw, 'exits.reasons'));
  const goRaw = pick(raw, 'delivery.go');
  const go    = goRaw === undefined ? pick(raw, 'exits.triggered') !== true : goRaw === true;

  const b2b  = spec.catalogue.b2bWholesale || pick(raw, 'catalogue.has_b2b') === true;
  const plan = b2b ? 'plus' : String(spec.store.shopifyPlan);

  const estimateWarnings = [];
  const stories = selectStories(spec);
  const epics   = estimateByEpic(stories, estimateWarnings);

  /** @type {DeckContext} */
  const c = {
    args, raw, spec, specWarnings, go, exits, plan, stories, epics,
    totals:       totalEstimate(epics),
    split:        workSplit(stories),
    capabilities: parseCapabilityMap(path.join(args.clientDir, 'capability-map.md')),
    plan_:        parseDeliveryPlan(path.join(args.clientDir, 'delivery-plan.md')),
    apps:         parseAppShortlist(path.join(args.clientDir, 'app-shortlist.md')),
    risks:        parseRisks(path.join(args.clientDir, 'risks.md')),
    q:            parseQuestionnaire(args.questionnaire),
  };

  const x = new XmlWriter();
  x.depth = 1;
  x.path.push('discovery-deck');

  sectionCover(x, c);
  sectionExecutiveSummary(x, c);

  if (go) {
    for (const build of [
      sectionBusinessContext, sectionMethodology, sectionAsIs, sectionSolutionDesign,
      sectionCapabilityMap, sectionScope, sectionApps, sectionWorkSplit, sectionEstimate,
      sectionRisks, sectionOutOfScope, sectionNextSteps, sectionTimeline, sectionInvestment,
      sectionAppendixStories, sectionAppendixCapabilities,
    ]) build(x, c);
  }

  const warnings = [...specWarnings, ...estimateWarnings, ...x.warnings];

  const head = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<discovery-deck client="${esc(args.client)}" generated="${esc(args.date)}" ` +
      `mode="${go ? 'GO' : 'STOP'}" template="docs/discovery/deck-template.md">`,
    `  <go>${go}</go>`,
  ];
  if (warnings.length > 0) {
    head.push(`  <warnings count="${warnings.length}">`);
    for (const w of warnings) head.push(`    <warning>${esc(w)}</warning>`);
    head.push('  </warnings>');
  } else {
    head.push('  <warnings count="0"/>');
  }

  const xml = `${head.join('\n')}\n${x.toString()}\n</discovery-deck>\n`;
  return { xml, warnings, go, stories: stories.length };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(`\n✗ ${err.message}\n`);
    process.exit(1);
  }

  let result;
  try {
    result = buildDeck(args);
  } catch (err) {
    console.error(`\n✗ ${err.message}\n`);
    if (process.env.DEBUG) console.error(err.stack);
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(args.output), { recursive: true });
  fs.writeFileSync(args.output, result.xml, 'utf8');

  const bytes = Buffer.byteLength(result.xml, 'utf8');
  console.log(
    `\n✓ ${args.client} · mode=${result.go ? 'GO' : 'STOP'} · ` +
    `${result.stories} stories · ${(bytes / 1024).toFixed(1)} KB`,
  );
  if (bytes > MAX_XML_BYTES) {
    console.warn(`⚠ XML exceeds ${MAX_XML_BYTES / 1024} KB — check the story appendix size.`);
  }
  if (result.warnings.length > 0) {
    console.warn(`⚠ ${result.warnings.length} warning(s) — consultant must resolve before presenting:`);
    for (const w of result.warnings) console.warn(`  • ${w}`);
  }
  console.log(`✓ Written → ${path.relative(process.cwd(), args.output)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
