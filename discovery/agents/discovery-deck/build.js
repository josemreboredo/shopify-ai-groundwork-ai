#!/usr/bin/env node
/**
 * @file build.js
 * @description Discovery Closing Deck (implementation plan Phase 3).
 *
 * Reads clients/<slug>/engagement.json (and backlog.json when present) and writes
 * discovery-deck.xml (discovery/docs/deck-template.md).
 *
 * The deck is the Lead Consultant's working draft (ADR 0010): it carries all
 * information. Sections 1–17 are written for the client; section 18
 * `consultant-notes` holds what the client normally does not see (offer
 * rationale, modifiers, price adds, budget vs band, commercial warnings, story
 * points, answers to confirm, consultant notes). The Lead Consultant filters
 * before sharing and runs `deck:check` on the client version.
 * A Larger Engagement (STOP routed to a Merkle Enterprise Engagement, ADR 0009)
 * gets the solution sections without offer, price band or backlog: investment
 * and backlog are defined in the dedicated Discovery Phase.
 *
 *   npm run deck -- --client <slug> [--clients-dir clients]
 *   npm run deck:check -- --client <slug> [--file discovery-deck.client.md]   # client version has no internal data
 */

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { offering, validateEngagement, questionsFeeding } from '../../schema/index.js';
import { CLIENTS_DIR } from '../../paths.js';
import { XmlWriter, esc } from './xml.js';
import { stopRoute } from '../discovery/engine.js';
import { planRequirements, PLAN_LABEL as PLAN_NAME } from '../discovery/plan.js';
import { appSignals, appCandidates } from '../discovery/app-signals.js';

const SLUG = /^[a-z0-9][a-z0-9-]{0,62}$/;

const STANDARD_EXCLUSIONS = [
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

/** GO, LARGER_ENGAGEMENT or STOP. @param {object} doc */
function deckMode(doc) {
  if (doc.delivery.go) return 'GO';
  return stopRoute(doc)?.id === 'larger_engagement' ? 'LARGER_ENGAGEMENT' : 'STOP';
}

/** @param {object} doc */
const isLarger = (doc) => deckMode(doc) === 'LARGER_ENGAGEMENT';

/** The route entry for a Larger Engagement. @param {object} doc */
const larger = (doc) => stopRoute(doc);

/** @param {object} doc */
const openStops = (doc) => doc.exits.items.filter((i) => i.result === 'STOP' && i.resolution?.status === 'open');
/** @param {object} doc */
const clientExits = (doc) => doc.exits.items.filter((i) => i.result !== 'WARN');

// ─── Sections ─────────────────────────────────────────────────────────────────

function cover(x, doc) {
  const c = doc.meta.client;
  x.open('section', { id: 'cover', n: 1 });
  x.field('client-name', c.legal_name ?? c.name);
  x.field('project-name', isLarger(doc) ? `Shopify ${larger(doc).label}` : `Shopify ${doc.offer.name}`);
  x.field('consultant', doc.meta.consultant?.name, 'Q10.5.1 not answered');
  x.field('date', doc.meta.updated_at ?? doc.meta.created_at);
  x.field('confidentiality', `Confidential — prepared for ${c.legal_name ?? c.name}`);
  x.close();
}

function executiveSummary(x, doc) {
  x.open('section', { id: 'executive-summary', n: 2 });
  x.field('status', isLarger(doc) ? larger(doc).label : doc.delivery.go ? 'GO' : 'STOP');
  if (isLarger(doc)) {
    x.open('why-larger-engagement');
    for (const i of openStops(doc)) x.field('reason', `${i.detail}: ${i.evidence}`, undefined, { rule: i.rule_id, 'discovery-phase-workstream': i.destination });
    x.close();
  } else if (!doc.delivery.go) {
    x.open('stop-reasons');
    for (const i of openStops(doc)) x.field('reason', `${i.rule_id}: ${i.evidence} → ${i.destination}`);
    x.close();
  }
  x.field('core-problem', doc.business?.primary_problem, 'Q0.1.1 not answered');
  x.open('proposed-solution');
  if (isLarger(doc)) x.field('engagement', larger(doc).proposal);
  else x.field('offer', doc.offer.name, undefined, { code: doc.offer.code });
  x.field('delivery-track', TRACK_LABEL[doc.offer.delivery_track]);
  x.field('shopify-plan', PLAN_LABEL[doc.shopify?.target_plan], 'Q1.2.3 not answered');
  x.list('key-capabilities', (doc.approach?.capability_map ?? []).slice(0, 4).map((r) => r.requirement), 'No approach drafted (STOP or not yet run)');
  x.close();
  const kpis = doc.business?.kpis ?? [];
  // A goal that only restates a KPI (same metric, baseline and target) is listed once.
  const restatesKpi = (goal) => kpis.some((k) => [k.metric, k.baseline, k.target].every((v) => v && goal.toLowerCase().includes(String(v).toLowerCase())));
  x.list('expected-outcomes', [
    ...kpis.map((k) => `${k.metric}: ${k.baseline ?? '?'} → ${k.target ?? '?'}${k.horizon_months ? ` in ${k.horizon_months} months` : ''}`),
    ...(doc.business?.growth_goals ?? []).filter((g) => !restatesKpi(g)),
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
  x.field('approach', isLarger(doc)
    ? 'Structured discovery questionnaire (sections 0–11) → engagement specification → rules-based offer and risk screening → recommended solution approach; the backlog is defined in the dedicated Discovery Phase'
    : 'Structured discovery questionnaire (sections 0–11) → engagement specification → rules-based offer and risk screening → solution design → backlog');
  x.field('input', doc.meta.source);
  x.field('confirmed-answers-traced', provenance.filter((p) => p.status === 'confirmed').length);
  x.field('answers-to-confirm', provenance.filter((p) => p.status === 'tbc').length);
  x.field('open-questions', doc.approach?.risks?.open_items?.length ?? 0);
  x.close();
}

function asIs(x, doc) {
  const source = doc.migration?.source_platform;
  x.open('section', { id: 'as-is', n: 5 });
  x.field('current-platform', source === 'none' ? 'New store (greenfield)' : source, 'Q0.5.4 not answered');
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
  if (isLarger(doc)) x.field('engagement', larger(doc).proposal);
  else x.field('offer', doc.offer.name, undefined, { code: doc.offer.code });
  x.field('delivery-track', TRACK_LABEL[doc.offer.delivery_track]);
  x.field('shopify-plan', PLAN_LABEL[doc.shopify?.target_plan], 'Q1.2.3 not answered');
  x.field('architecture', `${doc.offer.delivery_track === 'hydrogen' ? 'Headless' : 'Online Store 2.0'} · ${markets.length > 1 ? `multi-market (${markets.filter((m) => m.code !== 'CN').length} markets${markets.some((m) => m.code === 'CN') ? ' + mainland China in a separate discovery' : ''})` : 'single market'}${b2b.enabled ? ' · B2B and DTC on one store' : ''}`);
  x.field('theme', doc.offer.delivery_track === 'liquid' ? `Horizon${doc.design?.theme_preference && doc.design.theme_preference !== 'Horizon' ? ` (client preference noted: ${doc.design.theme_preference})` : ''}` : 'Hydrogen');
  x.open('markets', { primary: doc.markets?.primary_markets?.join(', ') });
  for (const mk of markets) {
    x.empty('market', {
      code: mk.code, currency: mk.currency, languages: (mk.languages ?? []).join(', '), domain: mk.domain, pricing: mk.price_strategy,
      entity: mk.selling_entity, assortment: mk.assortment, 'run-by': mk.run_by,
      scope: mk.code === 'CN' ? 'separate China discovery' : undefined,
    });
  }
  for (const mk of markets.filter((m) => m.code !== 'CN' && !m.price_strategy)) x.missing('market-pricing', `Q3.1.1 pricing not answered for ${mk.code}`, { code: mk.code });
  topology(x, doc);
  x.close();
  x.open('payments-and-checkout');
  x.list('providers', doc.payments?.providers, 'Q4.1.1 not answered');
  x.list('local-methods', (doc.payments?.local_methods ?? []).filter((m) => m !== 'none').map((m) => m.replace(/_/g, ' ')), 'None recorded');
  x.list('checkout-customisation', (doc.checkout?.customisation ?? []).map((c) => c.replace(/_/g, ' ')), 'Q4.2.1 not answered');
  x.list('checkout-extensions', (doc.checkout?.extensions ?? []).map((e) => e.replace(/_/g, ' ')), 'None recorded');
  x.close();
  x.open('b2b', { enabled: String(b2b.enabled === true) });
  if (b2b.enabled) {
    x.list('features', [
      b2b.company_accounts && 'Company accounts',
      b2b.price_lists && 'Company price lists',
      b2b.volume_discounts && 'Volume pricing',
      b2b.approval_workflow && 'Account approval',
      ...(b2b.payment_terms ?? []).filter((t) => t !== 'none').map((t) => `Payment terms: ${t.replace(/_/g, ' ')}`),
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
  const source = doc.migration?.source_platform;
  x.list('data', doc.migration?.data, source && source !== 'none' ? 'Q8.2.2 not answered' : 'No migration');
  x.close();
  architecture(x, doc);
  x.close();
}

/** <sources> with one <source> per link (ADR 0017). */
function sources(x, list) {
  if (!list?.length) return;
  x.open('sources');
  for (const s of list) x.field('source', s);
  x.close();
}

const ids = (list) => (list?.length ? list.join(', ') : undefined);
const NO_ARCHITECTURE = 'No sourced solution architecture — run /architect in Claude Code (ADR 0017)';

/** Sourced architecture: decisions, integration architecture, data model, non-functional requirements. */
function architecture(x, doc) {
  const a = doc.approach?.architecture ?? {};
  x.open('architecture-decisions');
  if (!a.decisions?.length) x.missing('decision', NO_ARCHITECTURE);
  for (const d of a.decisions ?? []) {
    x.open('decision', { topic: d.topic, status: d.status, 'plan-impact': d.plan_impact, questions: ids(d.question_ids) });
    x.field('question', d.question, 'Not recorded');
    for (const o of d.options ?? []) {
      x.open('option', { name: o.option, chosen: o.option === d.decision ? 'true' : undefined });
      if (o.pros) x.field('pros', o.pros);
      if (o.cons) x.field('cons', o.cons);
      x.close();
    }
    x.field('decision', d.decision);
    x.field('rationale', d.rationale, 'Not recorded');
    sources(x, d.sources);
    x.close();
  }
  x.close();
  x.open('integration-architecture');
  if ((doc.integrations ?? []).length && !a.integrations?.length) x.missing('integration', NO_ARCHITECTURE);
  for (const i of a.integrations ?? []) {
    x.open('integration', { system: i.system, pattern: i.pattern, direction: i.direction, frequency: i.frequency, questions: ids(i.question_ids) });
    x.list('system-of-record-for', i.system_of_record_for, 'Not recorded');
    x.list('shopify-apis', i.shopify_apis, 'Not recorded');
    x.field('error-handling', i.error_handling, 'Not recorded');
    sources(x, i.sources);
    x.close();
  }
  x.close();
  x.open('data-model');
  for (const m of a.data_model ?? []) {
    x.open('custom-data', { object: m.object, kind: m.kind, name: m.name, 'source-system': m.source_system });
    x.field('purpose', m.purpose, 'Not recorded');
    sources(x, m.sources);
    x.close();
  }
  x.close();
  x.open('non-functional');
  if (!a.non_functional?.length) x.missing('requirement', NO_ARCHITECTURE);
  for (const n of a.non_functional ?? []) {
    x.open('requirement', { area: n.area });
    x.field('need', n.requirement);
    x.field('approach', n.approach);
    sources(x, n.sources);
    x.close();
  }
  x.close();
}

function capabilityMap(x, doc) {
  x.open('section', { id: 'capability-map', n: 7 });
  const rows = [...(doc.approach?.capability_map ?? [])]
    .sort((a, b) => RESOLUTION_ORDER.indexOf(a.resolution) - RESOLUTION_ORDER.indexOf(b.resolution));
  if (rows.length === 0) x.missing('capabilities', 'No approach drafted');
  for (const r of rows) {
    x.open('capability', { resolution: r.resolution, 'gaia-tier': r.gaia_tier, questions: ids(r.question_ids) });
    x.field('requirement', r.requirement);
    if (r.client_requirement) x.field('client-words', r.client_requirement);
    if (r.tool) x.field('tool', r.tool);
    if (r.why_this_level) x.field('why-this-level', r.why_this_level);
    if (r.limits) x.field('limits', r.limits);
    if (r.notes) x.field('notes', r.notes);
    sources(x, r.sources);
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
    x.open('app', { name: a.name, integration: a.integration_complexity, url: a.url });
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
    x.open(result === 'FLAG' ? 'flags' : isLarger(doc) ? 'discovery-phase-topics' : 'hard-blockers');
    for (const i of clientExits(doc).filter((e) => e.result === result)) {
      x.open('risk', { rule: i.rule_id, status: i.resolution?.status, owner: i.resolution?.owner });
      x.field('finding', i.evidence);
      x.field('resolution-path', i.destination);
      x.close();
    }
    x.close();
  }
  x.open('risk-register');
  if (doc.approach && (doc.delivery?.go || isLarger(doc)) && !doc.approach.risks?.register?.length) x.missing('risk', NO_ARCHITECTURE);
  for (const r of doc.approach?.risks?.register ?? []) {
    x.open('risk', { likelihood: r.likelihood, impact: r.impact, owner: r.owner, evidence: ids(r.evidence) });
    x.field('description', r.risk);
    x.field('mitigation', r.mitigation);
    x.close();
  }
  x.close();
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
  if ((doc.markets?.list ?? []).some((m) => m.code === 'CN')) x.list('separate-discovery', ['Mainland China — a separate China discovery (selling behind the Great Firewall or through cross-border channels)']);
  x.list('standard-exclusions', STANDARD_EXCLUSIONS);
  x.close();
}

function nextSteps(x, doc) {
  x.open('section', { id: 'next-steps', n: 14 });
  x.list('owner-actions', clientExits(doc).filter((i) => i.resolution?.status === 'open').map((i) => `${i.resolution.owner}: ${i.destination} (${i.rule_id})`), 'No open exit rules');
  x.list('client-to-confirm', (doc.approach?.risks?.open_items ?? []).map((o) => o.why), 'No open questions');
  x.list('standard', isLarger(doc)
    ? [
      'Client reviews this Discovery Closing Document',
      'Client confirms priorities, launch waves and the topics for the Discovery Phase',
      `Merkle issues the proposal for the ${larger(doc).proposal}`,
      'Discovery Phase kick-off; the build backlog, plan and investment are agreed at its end',
    ]
    : [
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
  x.field('delivery-duration', isLarger(doc) ? 'Defined in the Discovery Phase' : `${w.min}–${w.max} weeks`);
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
  if (isLarger(doc)) {
    x.field('engagement', larger(doc).proposal);
    x.field('note', 'The Discovery Phase is quoted in the Enterprise Engagement proposal. Build investment is defined at the end of the Discovery Phase, once scope, launch waves and architecture are agreed.');
  } else {
    x.field('offer', doc.offer.name, undefined, { code: doc.offer.code });
    x.empty('price-band', { currency: band.currency, from: band.min, to: band.open_ended ? undefined : band.max, 'open-ended': band.open_ended ? 'true' : undefined });
    x.field('note', 'Indicative band for the offer. A single fixed price is issued in the proposal after sprint planning.');
  }
  if (doc.business?.budget?.min !== undefined) {
    x.empty('client-budget', { currency: doc.business.budget.currency, from: doc.business.budget.min, to: doc.business.budget.max });
  }
  const totals = monthlyAppCosts(doc.approach?.app_shortlist);
  x.open('recurring-costs', { note: isLarger(doc) ? 'Billed by third parties' : 'Billed by third parties, not included in the band' });
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
/**
 * The derived market topology, as data: the recommendation the writer argues,
 * what fired it, what it rules out, what it assumed and what would change it.
 * The writer never re-derives this — the engine decided it (topology.js).
 */
function topology(x, doc) {
  const t = doc.markets?.topology;
  if (!t) return;
  x.open('topology', { recommendation: t.recommendation, confidence: t.confidence, 'separate-stores': (t.separate_store_markets ?? []).join(', ') || undefined });
  for (const trigger of t.triggers ?? []) {
    x.empty('trigger', { criterion: trigger.criterion, weight: String(trigger.weight ?? ''), markets: (trigger.markets ?? []).join(', ') || undefined, evidence: trigger.evidence, questions: (trigger.question_ids ?? []).join(', ') });
  }
  for (const r of t.rejected ?? []) x.empty('rejected', { option: r.option, reason: r.reason });
  for (const a of t.assumptions ?? []) x.empty('assumption', { about: a.about, assumed: a.assumed, 'impact-if-wrong': a.impact_if_wrong, question: a.question_id });
  for (const o of t.open_inputs ?? []) x.empty('open-input', { question: o.question_id, swing: o.swing, why: o.why_it_matters });
  const mm = t.managed_markets;
  if (mm) {
    x.open('managed-markets', { status: mm.status });
    for (const c of mm.conditions ?? []) x.empty('condition', { met: String(c.met), condition: c.condition, evidence: c.evidence, source: c.source });
    if (mm.cost_signal) {
      x.empty('cost-signal', {
        'fee-pct': String(mm.cost_signal.fee_pct ?? ''),
        'per-order': mm.cost_signal.per_order !== undefined ? String(mm.cost_signal.per_order) : undefined,
        'per-month': mm.cost_signal.per_month !== undefined ? String(mm.cost_signal.per_month) : undefined,
        currency: mm.cost_signal.currency,
        basis: mm.cost_signal.basis,
      });
    }
    x.close();
  }
  if (t.stated_preference) x.empty('stated-preference', { client: t.stated_preference, computed: t.recommendation, disagreement: t.disagreement ? t.disagreement.why_computed : undefined });
  x.close();
}

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
  } else if (isLarger(doc)) {
    for (const section of [businessContext, methodology, asIs, solutionDesign, capabilityMap, scope, apps, workSplit, risks, outOfScope, nextSteps, timeline, investment]) section(x, doc);
  } else {
    for (const section of [risks, nextSteps]) section(x, doc);
  }
  consultantNotes(x, doc, backlog);

  const head = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<discovery-deck client="${esc(doc.meta.client.slug)}" mode="${deckMode(doc)}" audience="lead-consultant" template="discovery/docs/deck-template.md">`,
    `  <warnings count="${x.warnings.length}">`,
    ...x.warnings.map((w) => `    <warning>${esc(w)}</warning>`),
    '  </warnings>',
  ];
  return { xml: `${head.join('\n')}\n${x.toString()}\n</discovery-deck>\n`, warnings: x.warnings };
}

/**
 * Section 18 — everything the Lead Consultant needs and the client normally does
 * not see. The consultant decides what to keep.
 *
 * @param {XmlWriter} x
 * @param {object} doc
 * @param {object|null} backlog
 */
function consultantNotes(x, doc, backlog) {
  const band = doc.offer.price_band;
  const route = stopRoute(doc);
  x.open('section', { id: 'consultant-notes', n: 18, audience: 'lead-consultant' });
  x.field('purpose', 'Internal information for the Lead Consultant. Keep, rewrite or remove before the document reaches the client.');

  x.open('engagement', { status: isLarger(doc) ? 'LARGER_ENGAGEMENT' : doc.delivery.go ? 'GO' : 'STOP', route: route?.id });
  if (route) x.field('route', route.label, undefined, { proposal: route.proposal });
  x.field(isLarger(doc) || !doc.delivery.go ? 'nearest-offer' : 'offer', doc.offer.name, undefined, { code: doc.offer.code, track: doc.offer.delivery_track });
  x.empty('price-band', { currency: band.currency, from: band.min, to: band.open_ended ? undefined : band.max, 'open-ended': band.open_ended ? 'true' : undefined, 'reference-only': doc.delivery.go ? undefined : 'true' });
  x.empty('duration-weeks', { from: doc.offer.duration_weeks.min, to: doc.offer.duration_weeks.max });
  if (doc.offer.rationale) x.field('rationale', doc.offer.rationale);
  x.close();

  x.open('scope-gates');
  for (const [id, g] of Object.entries(doc.offer.scope_gates)) x.field('gate', g.evidence ?? '—', undefined, { id, active: String(g.active) });
  for (const [id, g] of Object.entries(doc.offer.l_triggers ?? {})) x.field('l-trigger', g.evidence ?? '—', undefined, { id, active: String(g.active) });
  x.close();

  const modifiers = offering.modifiers.filter((mod) => doc.offer.modifiers?.includes(mod.id));
  x.open('modifiers');
  for (const mod of modifiers) x.empty('modifier', { id: mod.id, 'effort-weeks': `${mod.effort_weeks.min}–${mod.effort_weeks.max}`, 'price-add': `${offering.currency} ${mod.price_add.min}–${mod.price_add.max}` });
  x.close();

  const budget = doc.business?.budget;
  x.field('budget-vs-band', budget?.min !== undefined
    ? `Client budget ${budget.currency} ${budget.min}–${budget.max} · ${doc.delivery.go ? 'offer' : 'reference'} band ${band.currency} ${band.min}–${band.open_ended ? '…' : band.max}${budget.currency === band.currency && budget.max < band.min ? ' · budget below the band' : budget.currency === band.currency && budget.min < band.min ? ' · budget overlaps only the low end of the band' : ''}`
    : 'Client budget not recorded (Q0.6.1)');

  x.open('exit-rules');
  for (const i of doc.exits.items) {
    const rule = offering.exit_rules.find((r) => r.id === i.rule_id);
    x.open('rule', { id: i.rule_id, result: i.result, source: i.source, status: i.resolution?.status, owner: i.resolution?.owner, questions: questionsFeeding(`exit:${i.rule_id}`).join(', ') || undefined });
    x.field('evidence', i.evidence ?? '—');
    x.field('destination', i.destination ?? '—');
    if (rule?.internal_note) x.field('internal-note', rule.internal_note);
    x.close();
  }
  x.close();

  x.open('shopify-plan', { target: doc.shopify?.target_plan });
  for (const r of planRequirements(doc)) x.field('requirement', r.feature, undefined, { plan: PLAN_NAME[r.plan], docs: r.docs });
  x.close();

  x.open('app-signals');
  const candidates = appCandidates(doc);
  for (const [area, reasons] of Object.entries(appSignals(doc))) {
    for (const reason of reasons) x.field('signal', reason, undefined, { area });
    for (const app of candidates[area] ?? []) x.field('candidate', app.name, undefined, { area, url: app.url, status: app.status });
  }
  x.close();

  x.open('delivery-effort');
  if (backlog) {
    for (const row of backlog.summary) x.empty('epic', { name: row.name, stories: row.stories, points: row.points });
    x.field('total-points', backlog.summary.reduce((n, r) => n + r.points, 0));
  } else {
    x.field('note', isLarger(doc) || !doc.delivery.go ? 'No Jira backlog: defined in the Discovery Phase' : 'No backlog yet — npm run backlog -- --client <slug>');
  }
  x.close();

  x.open('answers-to-confirm');
  for (const [pointer, p] of Object.entries(doc.provenance ?? {}).filter(([, v]) => v.status === 'tbc')) {
    x.field('answer', p.note || pointer, undefined, { pointer, question: p.question_id, source: p.source });
  }
  x.close();

  if ((doc.markets?.list ?? []).some((m) => m.code === 'CN')) {
    x.open('mainland-china', { discovery: 'separate China discovery — discovery/docs/china-mainland.md' });
    for (const [key, value] of Object.entries(doc.china ?? {})) {
      x.field('answer', Array.isArray(value) ? value.join(', ') : String(value), undefined, { topic: key.replace(/_/g, ' ') });
    }
    x.close();
  }

  x.open('notes');
  for (const n of doc.notes ?? []) x.field('note', n.text, undefined, { at: n.at, author: n.author_role });
  x.close();
  x.close();
}

/**
 * The client-facing part of a deck text: everything except section 18.
 *
 * @param {string} text  XML or Markdown
 */
export function clientPart(text) {
  return text
    .replace(/<section id="consultant-notes"[\s\S]*?<\/section>\n?/, '')
    .replace(/\n## Consultant notes[\s\S]*$/, '\n');
}

/**
 * Internal terms that must never appear in a client-facing deck.
 *
 * @param {object} doc
 * @param {object|null} backlog
 * @returns {string[]}
 */
function internalTerms(doc, backlog = null) {
  const terms = new Set(['price_add', 'effort_weeks', 'modifier', 'story points', 'internal_note', '+25%']);
  for (const mod of offering.modifiers) terms.add(mod.id);
  for (const rule of offering.exit_rules) if (rule.internal_note) terms.add(rule.internal_note);
  for (const i of doc.exits.items.filter((e) => e.result === 'WARN')) terms.add(i.evidence);
  if (backlog) terms.add(`${backlog.summary.reduce((n, r) => n + r.points, 0)} points`);
  if (isLarger(doc)) {
    // No standard offer or band is proposed to a Larger Engagement client.
    for (const t of ['price-band', 'price band', doc.offer.name]) terms.add(t);
  }
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
function loadClient(clientDir) {
  const file = path.join(clientDir, 'engagement.json');
  if (!fs.existsSync(file)) throw new Error(`engagement.json not found in ${clientDir} — run discovery first.`);
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  const { valid, errors } = validateEngagement(doc);
  if (!valid) throw new Error(`engagement.json is invalid:\n  • ${errors.slice(0, 10).join('\n  • ')}`);
  const backlogFile = path.join(clientDir, 'backlog.json');
  // Only GO engagements have a Jira backlog; a stale file from an earlier run is ignored.
  const backlog = deckMode(doc) === 'GO' && fs.existsSync(backlogFile) ? JSON.parse(fs.readFileSync(backlogFile, 'utf8')) : null;
  return { doc, backlog };
}

/**
 * Write discovery-deck.xml (the Lead Consultant's full-information draft data).
 *
 * @param {{ clientDir: string }} options
 */
export function writeDeck({ clientDir }) {
  const { doc, backlog } = loadClient(clientDir);
  const { xml, warnings } = buildDeckXml(doc, backlog);
  const leaks = findLeaks(clientPart(xml), doc, backlog);
  if (leaks.length) throw new Error(`Internal data outside the consultant-notes section (${leaks.join(', ')}) — fix the deck builder`);
  fs.rmSync(path.join(clientDir, 'deck-internal-notes.md'), { force: true }); // replaced by section 18
  const files = { 'discovery-deck.xml': xml };
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
  const clientDir = path.join(path.resolve(process.cwd(), get('--clients-dir') ?? CLIENTS_DIR), client);

  if (maybeCommand === 'check') {
    const { doc, backlog } = loadClient(clientDir);
    const name = get('--file') ?? 'discovery-deck.md';
    const deckFile = path.join(clientDir, path.basename(name));
    if (!fs.existsSync(deckFile)) throw new Error(`${name} not found — generate the deck first (/deck skill).`);
    const leaks = findLeaks(fs.readFileSync(deckFile, 'utf8'), doc, backlog);
    if (leaks.length) {
      console.error(`✗ ${path.basename(deckFile)} still contains internal data — remove it before the document goes to the client:\n  • ${leaks.join('\n  • ')}`);
      process.exit(2);
    }
    console.log(`✓ ${path.basename(deckFile)} contains no internal pricing, modifiers, points or commercial warnings — ready for the client`);
    return;
  }

  const { doc, backlog, warnings, written } = writeDeck({ clientDir });
  const mode = { GO: 'GO', STOP: 'STOP', LARGER_ENGAGEMENT: 'Larger Engagement' }[deckMode(doc)];
  console.log(`✓ ${doc.meta.client.name} · ${mode} deck data${deckMode(doc) !== 'GO' ? '' : backlog ? ` · ${backlog.stories.length} stories` : ' · no backlog yet'}`);
  if (warnings.length) {
    console.log(`  ${warnings.length} field(s) to complete:`);
    for (const w of warnings) console.log(`  • ${w}`);
  }
  for (const file of written) console.log(`  wrote ${path.relative(process.cwd(), file)}`);
  console.log('  Lead Consultant draft: all information included (section 18 = consultant notes). Filter before sharing, then run deck:check on the client version.');
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (err) {
    console.error(`\n✗ ${err.message}\n`);
    process.exit(1);
  }
}
