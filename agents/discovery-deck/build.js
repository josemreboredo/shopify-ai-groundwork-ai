#!/usr/bin/env node
/**
 * @file build.js
 * @description Discovery Closing Deck (implementation plan Phase 3).
 *
 * Reads clients/<slug>/engagement.json (and backlog.json when present) and writes:
 *   - discovery-deck.xml        client-safe data for the deck (docs/discovery/deck-template.md)
 *   - deck-internal-notes.md    consultant-only: modifiers, gate evidence, story points, commercial warnings
 *
 * The client sees the offer's price band only (D1). Modifiers, price adds,
 * effort weeks, story points and commercial warnings never enter the XML.
 *
 *   npm run deck -- --client <slug> [--clients-dir clients]
 *   npm run deck:check -- --client <slug>        # verify discovery-deck.md has no internal data
 */

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { offering, validateEngagement } from '../../schema/index.js';
import { XmlWriter, esc } from './xml.js';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SLUG = /^[a-z0-9][a-z0-9-]{0,62}$/;

export const STANDARD_EXCLUSIONS = [
  'Copywriting, product photography and content creation',
  'SEO copywriting and ongoing SEO services',
  'Third-party system changes and their SLAs (ERP, PIM, CRM, 3PL)',
  'Shopify, app and payment-provider subscription fees',
  'Post-launch support beyond the agreed support model',
];

const RESOLUTION_ORDER = ['native', 'app', 'theme', 'custom'];
const TRACK_LABEL = { liquid: 'Shopify Horizon theme (Liquid)', hydrogen: 'Headless Hydrogen storefront' };
const PLAN_LABEL = { none: 'None', basic: 'Basic', grow: 'Grow', advanced: 'Advanced', plus: 'Shopify Plus', plus_expansion: 'Shopify Plus (expansion stores)' };

/** Round percentages so they always add up to 100 (largest remainder). */
export function percentages(counts) {
  const total = counts.reduce((n, c) => n + c, 0);
  if (total === 0) return counts.map(() => 0);
  const raw = counts.map((c) => (c / total) * 100);
  const floors = raw.map(Math.floor);
  let remaining = 100 - floors.reduce((n, f) => n + f, 0);
  raw.map((r, i) => [r - floors[i], i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => {
    if (remaining > 0) { floors[i]++; remaining--; }
  });
  return floors;
}

/** Monthly app cost totals per currency (recommended apps with a monthly list price). */
export function monthlyAppCosts(apps = []) {
  const totals = {};
  for (const app of apps) {
    if (!app.recommended || app.cost?.period !== 'month' || typeof app.cost.amount !== 'number' || !app.cost.currency) continue;
    totals[app.cost.currency] = (totals[app.cost.currency] ?? 0) + app.cost.amount;
  }
  return totals;
}

/** @param {object} doc */
const openStops = (doc) => doc.exits.items.filter((i) => i.result === 'STOP' && i.resolution?.status === 'open');
/** @param {object} doc */
const clientExits = (doc) => doc.exits.items.filter((i) => i.result !== 'WARN');

// ─── Sections ─────────────────────────────────────────────────────────────────

function cover(x, doc) {
  const c = doc.meta.client;
  x.open('section', { id: 'cover', n: 1 });
  x.field('client-name', c.legal_name ?? c.name);
  x.field('project-name', `Shopify ${doc.offer.name}`);
  x.field('consultant', doc.meta.consultant?.name, 'Q10.5.1 not answered');
  x.field('date', doc.meta.updated_at ?? doc.meta.created_at);
  x.field('confidentiality', `Confidential — prepared for ${c.legal_name ?? c.name}`);
  x.close();
}

function executiveSummary(x, doc) {
  x.open('section', { id: 'executive-summary', n: 2 });
  x.field('status', doc.delivery.go ? 'GO' : 'STOP');
  if (!doc.delivery.go) {
    x.open('stop-reasons');
    for (const i of openStops(doc)) x.field('reason', `${i.rule_id}: ${i.evidence} → ${i.destination}`);
    x.close();
  }
  x.field('core-problem', doc.business?.primary_problem, 'Q0.1.1 not answered');
  x.open('proposed-solution');
  x.field('offer', doc.offer.name, undefined, { code: doc.offer.code });
  x.field('delivery-track', TRACK_LABEL[doc.offer.delivery_track]);
  x.field('shopify-plan', PLAN_LABEL[doc.shopify?.target_plan], 'Q1.2.3 not answered');
  x.list('key-capabilities', (doc.approach?.capability_map ?? []).slice(0, 4).map((r) => r.requirement), 'No approach drafted (STOP or not yet run)');
  x.close();
  x.list('expected-outcomes', [
    ...(doc.business?.kpis ?? []).map((k) => `${k.metric}: ${k.baseline ?? '?'} → ${k.target ?? '?'}${k.horizon_months ? ` in ${k.horizon_months} months` : ''}`),
    ...(doc.business?.growth_goals ?? []),
  ], 'Q0.4 not answered');
  x.close();
}

function businessContext(x, doc) {
  const b = doc.business ?? {};
  x.open('section', { id: 'business-context', n: 3 });
  x.field('revenue-monthly', b.revenue_monthly && `${b.revenue_monthly.currency} ${b.revenue_monthly.min ?? '?'}–${b.revenue_monthly.max ?? '?'}`, 'Q0.2.1 not answered');
  x.field('conversion-rate', b.conversion_rate_pct !== undefined ? `${b.conversion_rate_pct}%` : undefined, 'Q0.2.2 not answered');
  x.field('bottleneck', b.bottleneck, 'Q0.2.4 not answered');
  x.list('operational-pain', b.operational_pain, 'Q0.3.1 not answered');
  x.list('growth-goals', b.growth_goals, 'Q0.4.1 not answered');
  x.open('kpis');
  for (const k of b.kpis ?? []) x.empty('kpi', { metric: k.metric, baseline: k.baseline, target: k.target, 'horizon-months': k.horizon_months });
  x.close();
  x.field('go-live-target', doc.delivery?.target_launch_date, 'Q10.1.1 not answered', { reason: doc.delivery?.hard_deadline_reason });
  x.field('budget-envelope', b.budget?.min !== undefined ? `${b.budget.currency} ${b.budget.min}–${b.budget.max}` : undefined, 'Q0.6.1 not answered');
  x.field('budget-priority', b.budget?.priority, 'Q0.6.2 not answered');
  x.close();
}

function methodology(x, doc) {
  const provenance = Object.values(doc.provenance ?? {});
  x.open('section', { id: 'methodology', n: 4 });
  x.field('approach', 'Structured discovery questionnaire (sections 0–11) → engagement specification → rules-based offer and risk screening → solution design → backlog');
  x.field('input', doc.meta.source);
  x.field('confirmed-answers-traced', provenance.filter((p) => p.status === 'confirmed').length);
  x.field('answers-to-confirm', provenance.filter((p) => p.status === 'tbc').length);
  x.field('open-questions', doc.approach?.risks?.open_items?.length ?? 0);
  x.close();
}

function asIs(x, doc) {
  const source = doc.migration?.source_platform;
  x.open('section', { id: 'as-is', n: 5 });
  x.field('current-platform', source === 'none' ? 'New store (greenfield)' : source, 'Q8.2.1 not answered');
  x.field('engagement-trigger', doc.business?.engagement_trigger, 'Q0.5.1 not answered');
  x.list('must-preserve', doc.business?.must_preserve, 'Q0.5.2 not answered');
  x.list('current-frustrations', doc.business?.current_frustrations, 'Q0.5.3 not answered');
  x.list('underperforming-segments', doc.business?.underperforming_segments, 'Q0.2.3 not answered');
  x.close();
}

function solutionDesign(x, doc) {
  const markets = doc.markets?.list ?? [];
  const b2b = doc.b2b ?? {};
  x.open('section', { id: 'solution-design', n: 6 });
  x.field('offer', doc.offer.name, undefined, { code: doc.offer.code });
  x.field('delivery-track', TRACK_LABEL[doc.offer.delivery_track]);
  x.field('shopify-plan', PLAN_LABEL[doc.shopify?.target_plan], 'Q1.2.3 not answered');
  x.field('architecture', `${doc.offer.delivery_track === 'hydrogen' ? 'Headless' : 'Online Store 2.0'} · ${markets.length > 1 ? `multi-market (${markets.length} markets)` : 'single market'}${b2b.enabled ? ' · B2B and DTC on one store' : ''}`);
  x.field('theme', doc.offer.delivery_track === 'liquid' ? `Horizon${doc.design?.theme_preference && doc.design.theme_preference !== 'Horizon' ? ` (client preference noted: ${doc.design.theme_preference})` : ''}` : 'Hydrogen');
  x.open('markets', { strategy: doc.markets?.strategy, primary: doc.markets?.primary_market });
  for (const mk of markets) x.empty('market', { code: mk.code, currency: mk.currency, languages: (mk.languages ?? []).join(', '), domain: mk.domain, pricing: mk.price_strategy });
  x.close();
  x.open('payments-and-checkout');
  x.list('providers', doc.payments?.providers, 'Q4.1.1 not answered');
  x.list('local-methods', doc.payments?.local_methods, 'None recorded');
  x.field('checkout-customisation', doc.checkout?.customisation, 'Q4.2.1 not answered');
  x.list('checkout-extensions', doc.checkout?.extensions, 'None recorded');
  x.close();
  x.open('b2b', { enabled: String(b2b.enabled === true) });
  if (b2b.enabled) {
    x.list('features', [
      b2b.company_accounts && 'Company accounts',
      b2b.price_lists && 'Company price lists',
      b2b.volume_discounts && 'Volume pricing',
      b2b.approval_workflow && 'Account approval',
      ...(b2b.payment_terms ?? []).map((t) => `Payment terms: ${t}`),
    ].filter(Boolean));
    x.field('approach', b2b.approach, 'Q6.2.8 not answered');
  }
  x.close();
  x.open('integrations');
  for (const i of doc.integrations ?? []) {
    x.empty('integration', { system: i.system, category: i.category, direction: i.direction, connector: i.connector, middleware: i.middleware, data: (i.objects ?? []).join(', ') });
  }
  x.close();
  x.open('migration', { from: doc.migration?.source_platform });
  x.list('data', doc.migration?.data, 'No migration');
  x.close();
  x.close();
}

function capabilityMap(x, doc) {
  x.open('section', { id: 'capability-map', n: 7 });
  const rows = [...(doc.approach?.capability_map ?? [])]
    .sort((a, b) => RESOLUTION_ORDER.indexOf(a.resolution) - RESOLUTION_ORDER.indexOf(b.resolution));
  if (rows.length === 0) x.missing('capabilities', 'No approach drafted');
  for (const r of rows) {
    x.open('capability', { resolution: r.resolution, 'gaia-tier': r.gaia_tier });
    x.field('requirement', r.requirement);
    if (r.tool) x.field('tool', r.tool);
    if (r.notes) x.field('notes', r.notes);
    x.close();
  }
  x.close();
}

function scope(x, doc) {
  x.open('section', { id: 'scope', n: 8 });
  for (const phase of doc.approach?.phases ?? []) {
    x.open('phase', { name: phase.name });
    for (const sprint of phase.sprints) {
      x.open('sprint', { name: sprint.name });
      for (const t of sprint.tasks) x.field('task', t.title, undefined, { owner: t.owner, deferred: t.deferred ? 'true' : undefined });
      x.close();
    }
    x.close();
  }
  if (!(doc.approach?.phases ?? []).length) x.missing('phases', 'No approach drafted');
  x.close();
}

function apps(x, doc) {
  const list = doc.approach?.app_shortlist ?? [];
  x.open('section', { id: 'apps', n: 9 });
  x.open('recommended');
  for (const a of list.filter((app) => app.recommended)) {
    x.open('app', { name: a.name, integration: a.integration_complexity });
    x.field('requirement', a.requirement, 'Not recorded');
    x.field('why', a.rationale, 'Not recorded');
    if (a.limitations) x.field('limitations', a.limitations);
    x.field('cost', a.cost?.amount !== undefined ? `${a.cost.currency ?? ''} ${a.cost.amount}/${a.cost.period ?? '?'}`.trim() : a.cost?.note, 'Cost to confirm with the vendor');
    x.close();
  }
  x.close();
  x.open('not-recommended');
  for (const a of list.filter((app) => !app.recommended)) x.field('app', a.rejection_reason, 'No reason recorded', { name: a.name });
  x.close();
  const totals = monthlyAppCosts(list);
  x.open('monthly-app-cost', { note: 'List prices of apps with a known monthly price; verify on the Shopify App Store' });
  for (const [currency, amount] of Object.entries(totals)) x.empty('total', { currency, amount });
  x.close();
  x.close();
}

function workSplit(x, doc) {
  const rows = doc.approach?.capability_map ?? [];
  const counts = [
    rows.filter((r) => r.resolution === 'native' || r.resolution === 'app').length,
    rows.filter((r) => r.resolution === 'theme').length,
    rows.filter((r) => r.resolution === 'custom').length,
  ];
  const [config, theme, custom] = percentages(counts);
  x.open('section', { id: 'work-split', n: 10 });
  x.empty('bucket', { name: 'Configuration (native features and apps)', requirements: counts[0], percent: config });
  x.empty('bucket', { name: 'Theme customisation', requirements: counts[1], percent: theme });
  x.empty('bucket', { name: 'Custom development', requirements: counts[2], percent: custom });
  x.field('note', 'Share of requirements by resolution level. More configuration means lower risk and faster delivery.');
  x.close();
}

function scopeByEpic(x, backlog) {
  x.open('section', { id: 'scope-by-epic', n: 11 });
  if (!backlog) {
    x.missing('epics', 'No backlog yet — run npm run backlog -- --client <slug>');
  } else {
    for (const row of backlog.summary) x.empty('epic', { name: row.name, stories: row.stories, 'later-phase': row.deferred || undefined });
    x.field('total-stories', backlog.stories.length);
  }
  x.close();
}

function risks(x, doc) {
  x.open('section', { id: 'risks', n: 12 });
  for (const result of ['STOP', 'FLAG']) {
    x.open(result === 'STOP' ? 'hard-blockers' : 'flags');
    for (const i of clientExits(doc).filter((e) => e.result === result)) {
      x.open('risk', { rule: i.rule_id, status: i.resolution?.status, owner: i.resolution?.owner });
      x.field('finding', i.evidence);
      x.field('resolution-path', i.destination);
      x.close();
    }
    x.close();
  }
  x.open('open-questions');
  for (const o of doc.approach?.risks?.open_items ?? []) x.field('question', o.why, undefined, { question: o.question_id });
  x.close();
  x.open('assumptions');
  for (const a of doc.approach?.risks?.assumptions ?? []) x.field('assumption', a.statement, undefined, { 'impact-if-wrong': a.impact_if_wrong });
  x.close();
  x.close();
}

function outOfScope(x, doc) {
  const deferred = (doc.approach?.phases ?? []).flatMap((p) => p.sprints.flatMap((s) => s.tasks)).filter((t) => t.deferred).map((t) => t.title);
  x.open('section', { id: 'out-of-scope', n: 13 });
  if (deferred.length) x.list('later-phases', deferred);
  x.list('standard-exclusions', STANDARD_EXCLUSIONS);
  x.close();
}

function nextSteps(x, doc) {
  x.open('section', { id: 'next-steps', n: 14 });
  x.list('owner-actions', clientExits(doc).filter((i) => i.resolution?.status === 'open').map((i) => `${i.resolution.owner}: ${i.destination} (${i.rule_id})`), 'No open exit rules');
  x.list('client-to-confirm', (doc.approach?.risks?.open_items ?? []).map((o) => o.why), 'No open questions');
  x.list('standard', [
    'Client reviews and signs off this Discovery Closing Document',
    'Client confirms scope, exclusions and risk register',
    'Merkle issues the fixed-price proposal',
    'Sprint 1 kick-off',
  ]);
  x.close();
}

function timeline(x, doc) {
  const w = doc.offer.duration_weeks;
  x.open('section', { id: 'timeline', n: 15 });
  x.field('delivery-duration', `${w.min}–${w.max} weeks`);
  x.field('kick-off', doc.delivery?.kickoff_date, 'Q10.1.4 not answered');
  x.field('go-live-target', doc.delivery?.target_launch_date, 'Q10.1.1 not answered', { reason: doc.delivery?.hard_deadline_reason });
  x.list('phases', (doc.approach?.phases ?? []).map((p) => p.name), 'No approach drafted');
  const tight = doc.exits.items.find((i) => i.rule_id === '11.15');
  if (tight) x.field('timeline-risk', tight.evidence);
  x.close();
}

function investment(x, doc) {
  const band = doc.offer.price_band;
  x.open('section', { id: 'investment', n: 16 });
  x.field('offer', doc.offer.name, undefined, { code: doc.offer.code });
  x.empty('price-band', { currency: band.currency, from: band.min, to: band.open_ended ? undefined : band.max, 'open-ended': band.open_ended ? 'true' : undefined });
  x.field('note', 'Indicative band for the offer. A single fixed price is issued in the proposal after sprint planning.');
  if (doc.business?.budget?.min !== undefined) {
    x.empty('client-budget', { currency: doc.business.budget.currency, from: doc.business.budget.min, to: doc.business.budget.max });
  }
  const totals = monthlyAppCosts(doc.approach?.app_shortlist);
  x.open('recurring-costs', { note: 'Billed by third parties, not included in the band' });
  x.field('shopify-plan', PLAN_LABEL[doc.shopify?.target_plan], 'Plan not recorded');
  for (const [currency, amount] of Object.entries(totals)) x.empty('apps-monthly', { currency, amount });
  x.close();
  x.close();
}

function appendixStories(x, backlog) {
  x.open('section', { id: 'appendix-stories', n: 17 });
  if (!backlog) x.missing('stories', 'No backlog yet — run npm run backlog -- --client <slug>');
  for (const s of backlog?.stories ?? []) {
    x.push(`<story key="${esc(s.key)}" epic="${esc(s.epic_name)}"${s.deferred ? ' later-phase="true"' : ''}>${esc(s.title)}</story>`);
  }
  x.close();
}

// ─── Build ────────────────────────────────────────────────────────────────────

/**
 * Build the client-safe deck XML.
 *
 * @param {object} doc      Schema-valid engagement
 * @param {object|null} backlog  Parsed backlog.json, if any
 * @returns {{ xml: string, warnings: string[] }}
 */
export function buildDeckXml(doc, backlog = null) {
  const x = new XmlWriter();
  x.depth = 1;
  x.path.push('discovery-deck');

  cover(x, doc);
  executiveSummary(x, doc);
  if (doc.delivery.go) {
    for (const section of [businessContext, methodology, asIs, solutionDesign, capabilityMap, scope, apps, workSplit]) section(x, doc);
    scopeByEpic(x, backlog);
    for (const section of [risks, outOfScope, nextSteps, timeline, investment]) section(x, doc);
    appendixStories(x, backlog);
  } else {
    for (const section of [risks, nextSteps]) section(x, doc);
  }

  const head = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<discovery-deck client="${esc(doc.meta.client.slug)}" mode="${doc.delivery.go ? 'GO' : 'STOP'}" template="docs/discovery/deck-template.md">`,
    `  <warnings count="${x.warnings.length}">`,
    ...x.warnings.map((w) => `    <warning>${esc(w)}</warning>`),
    '  </warnings>',
  ];
  return { xml: `${head.join('\n')}\n${x.toString()}\n</discovery-deck>\n`, warnings: x.warnings };
}

/**
 * Consultant-only notes: why the offer is what it is, internal pricing levers,
 * commercial warnings and delivery effort.
 *
 * @param {object} doc
 * @param {object|null} backlog
 */
export function buildInternalNotes(doc, backlog = null) {
  const lines = [
    `# Deck internal notes — ${doc.meta.client.name}`,
    '',
    '> **INTERNAL — never share with the client.** Generated with `discovery-deck.xml`.',
    '',
    `## Offer ${doc.offer.code} — ${doc.offer.name}`,
    '',
    doc.offer.rationale ?? '',
    '',
    '| Scope gate | Active | Evidence |',
    '|---|---|---|',
    ...Object.entries(doc.offer.scope_gates).map(([id, g]) => `| ${id} | ${g.active ? 'yes' : 'no'} | ${g.evidence ?? ''} |`),
    '',
    '| L trigger | Active | Evidence |',
    '|---|---|---|',
    ...Object.entries(doc.offer.l_triggers ?? {}).map(([id, g]) => `| ${id} | ${g.active ? 'yes' : 'no'} | ${g.evidence ?? ''} |`),
    '',
    '## Internal modifiers',
    '',
  ];
  const modifiers = offering.modifiers.filter((mod) => doc.offer.modifiers?.includes(mod.id));
  lines.push(modifiers.length
    ? ['| Modifier | Effort | Price add |', '|---|---|---|', ...modifiers.map((mod) => `| ${mod.id} | +${mod.effort_weeks.min}–${mod.effort_weeks.max} weeks | +${offering.currency} ${mod.price_add.min}–${mod.price_add.max} |`)].join('\n')
    : '_None applied._');

  const band = doc.offer.price_band;
  const budget = doc.business?.budget;
  lines.push('', '## Budget vs band', '');
  lines.push(budget?.min !== undefined
    ? `Client budget ${budget.currency} ${budget.min}–${budget.max} · offer band ${band.currency} ${band.min}–${band.open_ended ? '…' : band.max}${budget.currency === band.currency && budget.max < band.min ? ' · **budget below the band**' : budget.currency === band.currency && budget.min < band.min ? ' · **budget overlaps only the low end of the band**' : ''}`
    : 'Client budget not recorded.');

  const warns = doc.exits.items.filter((i) => i.result === 'WARN');
  lines.push('', '## Commercial warnings', '');
  lines.push(warns.length ? warns.map((i) => {
    const rule = offering.exit_rules.find((r) => r.id === i.rule_id);
    return `- ${i.rule_id}: ${i.evidence} — ${rule?.internal_note ?? i.destination}`;
  }).join('\n') : '_None._');

  lines.push('', '## Delivery effort (backlog)', '');
  if (backlog) {
    const total = backlog.summary.reduce((n, r) => n + r.points, 0);
    lines.push('| Epic | Stories | Points |', '|---|---|---|', ...backlog.summary.map((r) => `| ${r.name} | ${r.stories} | ${r.points} |`), `| **Total** | **${backlog.stories.length}** | **${total}** |`);
    lines.push('', `Offer duration: ${doc.offer.duration_weeks.min}–${doc.offer.duration_weeks.max} weeks.`);
  } else {
    lines.push('_No backlog yet._');
  }

  const tbc = Object.entries(doc.provenance ?? {}).filter(([, p]) => p.status === 'tbc');
  lines.push('', '## Answers to confirm before presenting', '');
  lines.push(tbc.length ? tbc.map(([pointer, p]) => `- \`${pointer}\` (${p.question_id ?? '?'})${p.note ? ` — ${p.note}` : ''}`).join('\n') : '_None._');
  return `${lines.join('\n')}\n`;
}

/**
 * Internal terms that must never appear in a client-facing deck.
 *
 * @param {object} doc
 * @param {object|null} backlog
 * @returns {string[]}
 */
export function internalTerms(doc, backlog = null) {
  const terms = new Set(['price_add', 'effort_weeks', 'modifier', 'story points', 'internal_note', '+25%']);
  for (const mod of offering.modifiers) terms.add(mod.id);
  for (const rule of offering.exit_rules) if (rule.internal_note) terms.add(rule.internal_note);
  for (const i of doc.exits.items.filter((e) => e.result === 'WARN')) terms.add(i.evidence);
  if (backlog) terms.add(`${backlog.summary.reduce((n, r) => n + r.points, 0)} points`);
  return [...terms];
}

/**
 * Check a client-facing text (XML or the generated deck) for internal data.
 *
 * @param {string} text
 * @param {object} doc
 * @param {object|null} backlog
 * @returns {string[]} leaked terms
 */
export function findLeaks(text, doc, backlog = null) {
  const lower = text.toLowerCase();
  return internalTerms(doc, backlog).filter((t) => lower.includes(t.toLowerCase()));
}

/**
 * Load inputs for a client directory.
 *
 * @param {string} clientDir
 */
export function loadClient(clientDir) {
  const file = path.join(clientDir, 'engagement.json');
  if (!fs.existsSync(file)) throw new Error(`engagement.json not found in ${clientDir} — run discovery first.`);
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  const { valid, errors } = validateEngagement(doc);
  if (!valid) throw new Error(`engagement.json is invalid:\n  • ${errors.slice(0, 10).join('\n  • ')}`);
  const backlogFile = path.join(clientDir, 'backlog.json');
  const backlog = fs.existsSync(backlogFile) ? JSON.parse(fs.readFileSync(backlogFile, 'utf8')) : null;
  return { doc, backlog };
}

/**
 * Write discovery-deck.xml and deck-internal-notes.md.
 *
 * @param {{ clientDir: string }} options
 */
export function writeDeck({ clientDir }) {
  const { doc, backlog } = loadClient(clientDir);
  const { xml, warnings } = buildDeckXml(doc, backlog);
  const leaks = findLeaks(xml, doc, backlog);
  if (leaks.length) throw new Error(`Refusing to write: client XML contains internal data (${leaks.join(', ')})`);
  const files = { 'discovery-deck.xml': xml, 'deck-internal-notes.md': buildInternalNotes(doc, backlog) };
  const written = Object.entries(files).map(([name, content]) => {
    const target = path.join(clientDir, name);
    fs.writeFileSync(target, content, 'utf8');
    return target;
  });
  return { doc, backlog, warnings, written };
}

function main() {
  const [maybeCommand, ...rest] = process.argv.slice(2);
  const argv = maybeCommand === 'check' ? rest : process.argv.slice(2);
  const get = (flag) => {
    const i = argv.indexOf(flag);
    return i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : undefined;
  };
  const client = get('--client');
  if (!client || !SLUG.test(client)) throw new Error('Usage: npm run deck -- --client <slug> [--clients-dir clients]');
  const clientDir = path.join(path.resolve(process.cwd(), get('--clients-dir') ?? path.join(REPO_ROOT, 'clients')), client);

  if (maybeCommand === 'check') {
    const { doc, backlog } = loadClient(clientDir);
    const deckFile = path.join(clientDir, 'discovery-deck.md');
    if (!fs.existsSync(deckFile)) throw new Error('discovery-deck.md not found — generate it first (/deck skill).');
    const leaks = findLeaks(fs.readFileSync(deckFile, 'utf8'), doc, backlog);
    if (leaks.length) {
      console.error(`✗ discovery-deck.md contains internal data — remove before sharing:\n  • ${leaks.join('\n  • ')}`);
      process.exit(2);
    }
    console.log('✓ discovery-deck.md contains no internal pricing, modifiers, points or commercial warnings');
    return;
  }

  const { doc, backlog, warnings, written } = writeDeck({ clientDir });
  console.log(`✓ ${doc.meta.client.name} · ${doc.delivery.go ? 'GO' : 'STOP'} deck data${backlog ? ` · ${backlog.stories.length} stories` : ' · no backlog yet'}`);
  if (warnings.length) {
    console.log(`  ${warnings.length} field(s) to complete:`);
    for (const w of warnings) console.log(`  • ${w}`);
  }
  for (const file of written) console.log(`  wrote ${path.relative(process.cwd(), file)}`);
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (err) {
    console.error(`\n✗ ${err.message}\n`);
    process.exit(1);
  }
}
