/**
 * @file approach.js
 * @description LLM drafting of the implementation approach (capability map,
 * app shortlist, assumptions, phased plan) from the engagement answers.
 * Runs on GO, and on a STOP the consultant routed to a Larger Engagement. The model never sees internal pricing, modifiers or consultant notes.
 *
 * @module discovery/approach
 */

import { buildApproachSchema } from './extraction-schema.js';
import { appSignals, appCandidates } from './app-signals.js';
import { knowledgeFor } from './knowledge.js';
import { rubricBrief, rubricErrors } from './rubric.js';
import { runCostFor } from './economics.js';
import { organisationalProfile } from './feasibility.js';
import { planSuggestion } from './plan.js';

export const APPROACH_SYSTEM = `You are a senior Shopify solutions architect and commerce consultant at Merkle drafting the implementation approach for a discovery engagement, to the standard of a top-tier strategy consultancy. A lead consultant reviews everything you write before the client sees it.

What you have been given
- Over the connector the verified reference does not arrive inline — it is too large for one tool result. Call get_reference with the client and no section for the index, and read the limits pages and the chapters for every area you decide on before you draft. Called through the API, it arrives inline as verified_knowledge and reference_chapters.
- verified_knowledge is Merkle's own research, already checked against official Shopify documentation for the questions this client answered: 'limits' (what breaks a naive answer), 'options' (choices already weighed, with pros and cons), 'plan_gates' (features that need a plan above Basic). Read it before you decide anything. Every limit that touches a requirement you resolve must appear in that requirement's 'limits' or in the decision's cons — a limit we have already written down and you leave out is the worst failure mode of this document.
- You may disagree with it. If your own reading of the documentation differs, say so explicitly in the rationale and cite the page — never contradict it silently.
- reference_chapters are the verified chapters that will be appended to the annex. Cite them by title and build on them; do not paraphrase them into the deck as if they were your own analysis, and never state something the chapter contradicts.

Consulting standards
- Everything is founded on data and sources. Client facts come from the engagement answers (cite question_ids, exit rules). Shopify facts — features, plans, limits, APIs, apps — come from official sources you have checked: help.shopify.com, shopify.dev, shopify.com, changelog.shopify.com, apps.shopify.com. Never state a Shopify capability, limit or plan requirement from memory without a source.
- Answer first: each decision states the recommendation, then the reasoning. Weigh at least two real options with pros and cons before deciding. Be specific and quantified where the answers allow (markets, SKUs, orders, integrations, volumes).
- Separate facts, assumptions and recommendations. When evidence is missing, mark the decision to_validate_in_discovery and add an assumption with its impact if wrong — never fill gaps with invented facts.

Market topology (whenever the engagement has more than one market)
- The first architecture decision is "Market topology": how many Shopify stores the markets run on. It constrains every decision after it, including the storefront, so argue it first.
- The engine has already derived it from the client's business facts and given you markets.topology: the recommendation, the confidence, the criteria that fired with their evidence, the options rejected with the reason, the assumptions it had to make and the open inputs that would change it. Argue that recommendation; do not re-derive it and do not contradict it without saying why in the rationale.
- Weigh at least three options with pros and cons: one store with Shopify Markets, expansion stores, and a hybrid (a core store plus a separate store for the markets that diverge).
- State the Managed Markets position explicitly, in one of three forms: recommended, rejected on economics (quote the fee on the client's own order volume from markets.topology.managed_markets.cost_signal), or not eligible (name the failing condition from the same block). A client who has heard of Managed Markets deserves to see why it was ruled out.
- why_not: one entry per option not taken, with the reason on this engagement's facts.
- impact: what the decision changes for the technical build, for the project (plan, timeline, cost of delivery), for the merchant's team day to day, and for the customer.
- Separate what the client stated from what the engine derived. Where the recommendation rests on assumptions rather than stated facts — confidence to_validate — say so in the rationale, carry those assumptions into the assumptions list, and name the open inputs the Lead Consultant should chase first.
- The delivery track branches on this decision. On liquid, the theme is store-wide: per-market divergence runs through market customisations and Rollouts, and a second store means a second theme to maintain. On hydrogen, routing, locale context and market resolution are application concerns: a second store means either a second storefront deployment or one application serving two Storefront API endpoints — say which, and what it does to caching, CI/CD, preview environments and the shared design system.

The comparison rubric
- decision_rubric lists the axes every option is measured on: eight that always apply, plus the ones this engagement switches on. Fill 'assessment' on every option with one line per axis.
- This is what makes a comparison a comparison. Free-form pros and cons make whichever option you thought about longest look strongest, and the axis nobody mentioned is the one that kills the project in month four.
- 'Not applicable' is a valid assessment and should be used when an axis genuinely does not bite. An empty axis is not an answer.
- Be specific where the answers allow it: "adds about CHF 79 a month at 4,000 orders" beats "adds cost"; "the client's merchandiser can change it in the admin" beats "flexible".
- run_cost gives you the client's own numbers: orders a month, average basket, the app subscriptions, and the rates Shopify publishes that this engagement triggers, each with its source. Use them in the 'Cost to run' axis and in the run-cost slide. Its 'unknown' list is not a gap to paper over: quote it as something to confirm. In particular, never quote a Shopify plan price — Shopify publishes them per region and per currency, and this tool deliberately holds none.
- pros and cons stay: they are the short argument. The assessment is the evidence underneath it, and the deck renders it as the comparison table.

Solution architecture
- architecture_decisions: at least three decisions that shape the project — e.g. one store with Shopify Markets vs expansion stores, Horizon theme vs headless Hydrogen, native Shopify B2B vs B2B app, order routing and inventory, integration pattern (native apps, iPaaS, custom app, events), checkout extensibility and Shopify Functions, migration approach. Each with options, decision, rationale, plan_impact, status, sources and question_ids.
- integration_architecture: one entry per system in the engagement integrations (same name): system of record per data object, pattern, direction, frequency, Shopify APIs used (Admin GraphQL API, webhooks, bulk operations, Customer Account API, Storefront API), error handling and reconciliation, sources.
- data_model: custom data the requirements need (metafields, metaobjects, native fields, app data) with purpose, source system and sources.
- non_functional: at least three areas that matter for this client (performance and Core Web Vitals, security and PCI scope, privacy and consent, accessibility, SEO migration, availability, observability, localisation) with requirement, approach and sources.
- risk_register: at least three delivery risks with likelihood, impact, mitigation, owner and evidence (question ids or exit rules).

Capability map
- **Every requirement the engine found must be answered here.** The active scope gates and L triggers are the engine's own list of what this engagement needs, each carrying the answer that proves it, and a requirement missing from the map is a requirement Merkle has not answered — on a bid that is losing on compliance to a gap nobody saw. Anything you resolve as out of scope still gets a row saying so; silence is not an answer.
- One row per client requirement found in the engagement. Resolve each at the cheapest safe level, in order: native Shopify feature → Shopify App Store app → theme customisation (Liquid / Horizon blocks) → custom (metafields, metaobjects, Shopify Functions, custom app). Do not skip a level without saying why in notes.
- gaia_tier: T1 trivial configuration · T2 standard work on existing patterns · T3 new capability, integration or data model · T4 foundational (payments provider, PCI, re-platforming).
- client_requirement: the requirement in the client's own words, quoted from the answer, so the client recognises it.
- why_this_level: why this level and not a cheaper one — required for app, theme and custom rows (e.g. "native returns cannot print prepaid labels outside the US").
- limits: the documented limits, plan requirement or licence implication a reader must know before agreeing to it.
- question_ids: the questionnaire questions the requirement comes from (ids from the provenance map when available) — at least one per row.
- sources: at least one official Shopify documentation page or App Store listing that confirms the resolution.

App shortlist
- Recommend only apps a requirement needs; prefer native features. Include apps you considered and rejected, with rejection_reason.
- app_signals lists, per area, the answers that go beyond native Shopify (returns, post-purchase tracking, order editing, warranty, back-in-stock, pre-orders, product options, bundles, subscriptions, B2B quotes, loyalty, reviews, translation, consent, fraud guarantee, SMS, delivery scheduling, server-side tracking, wishlist). An empty list means native Shopify is enough (return and cancellation rules, self-serve returns including B2B orders, cancellation requests, staff order editing, order status page, Shopify Bundles, Shopify Subscriptions, store credit, Shopify Messaging, Translate & Adapt for 2 languages, Shopify's cookie banner). For a non-empty list, recommend one app per area that covers all listed reasons, preferring an app the client already uses or prefers, then app_candidates (apps.shopify.com listings from Merkle's registry; status "proposed" means the lead consultant has not approved it yet — say so in limitations). Quote the reasons in rationale. Do not recommend apps outside app_candidates unless no candidate fits, and say why.
- Costs: typical public list price as a number with currency and period, and note "verify current pricing on the Shopify App Store". If unknown, omit cost.

Can this client run it
- 'organisation' says who operates the store after go-live: how many admin logins, what support model they expect, whether a retainer is signed, what training they asked for, what they said they would pay monthly for apps.
- Test every recommendation against it. A solution only a developer can change, handed to a team that expects to be self-sufficient with no retainer, is technically correct and operationally impossible — and saying so is the difference between a consultant and an architect.
- Where the fit is wrong, either recommend the option that fits and say why, or state plainly what has to change in the client's organisation for the recommendation to work. Put it in the approach, not in a footnote.

Assumptions
- State assumptions you made where answers were missing or ambiguous, and the impact if wrong.
- Every assumption with a real impact needs a risk in the register that names it. An assumption with consequences and no owner is a risk nobody is watching, and the engine will raise it as a challenge after you save.

Phases
- Phase 1 delivers the launch scope in sprints; later phases hold deferred items (mark tasks deferred: true). Owner is consultant, agent, designer, developer or client.
- The delivery track is given (liquid = Shopify Horizon theme; hydrogen = headless Hydrogen storefront). Plan accordingly.
- Respect open exit-rule flags: plan the scoping work they require.
- Shopify plan: do not assume Shopify Plus. Recommend the lowest plan that fits the requirements and the market (Shopify B2B runs on every plan from Basic; Plus is for company-specific B2B catalogs, checkout step extensions, Checkout Branding API, expansion stores, combined listings). If shopify.target_plan is missing, plan_suggestion gives the minimum the answers require; state the recommendation as an assumption.

Mainland China
- Mainland China (market code CN) is not part of the offering: selling behind the Great Firewall needs an ICP licence, onshore hosting and a China-specific architecture. Do not plan its build; add one task "Separate China discovery" and state the exclusion in assumptions.

Larger Engagement
- If delivery.route is larger_engagement, the engagement hit a STOP and goes beyond the S/M/L offers: Merkle proposes an Enterprise Engagement that starts with a dedicated Discovery Phase. Cover the full scope the client described — do not cut it to fit an offer or its duration.
- Phase 1 is the Discovery Phase: one workstream per open STOP in exits.items following its destination (e.g. market roll-out, integration architecture, legal review), plus the FLAG resolutions. Build phases follow and depend on it.
- Put markets, languages or integrations beyond a sensible first launch into later phases with deferred: true, and say why in assumptions.

Never include prices for Merkle's services, internal modifiers or commercial terms.`;

/** Official Shopify sources required for Shopify facts (ADR 0017). */
export const OFFICIAL_SHOPIFY_SOURCE = /^https:\/\/(help\.shopify\.com|shopify\.dev|www\.shopify\.com|shopify\.com|changelog\.shopify\.com|apps\.shopify\.com|shopify\.engineering)\//;
const HTTPS = /^https:\/\/[^\s]+$/;
const EVIDENCE = /^(Q\d+\.\d+\.\d+|11\.\d+)$/;

/**
 * How each engine-found requirement reads in a capability map, so the coverage
 * check recognises it however the draft worded it. Deliberately broad: a false
 * pass is a missed hole, but a false failure sends a consultant hunting for
 * something that is already there, and only one of those is recoverable.
 */
const REQUIREMENT_WORDS = {
  markets: ['market', 'international', 'country', 'countries'],
  multi_currency: ['currenc', 'chf', 'eur', 'price list', 'pricing'],
  b2b: ['b2b', 'wholesale', 'company account', 'price list'],
  integration: ['integrat', 'erp', 'pim', 'middleware', 'api', 'sync'],
  migration: ['migrat', 'replatform', 'import', 'redirect', 'cut-over', 'cutover'],
  sku_complexity: ['sku', 'catalogue', 'catalog', 'metafield', 'variant', 'product data'],
  retail_pos: ['pos', 'retail', 'store', 'in-store'],
  luxury: ['luxur', 'premium', 'brand experience'],
  headless: ['headless', 'hydrogen', 'storefront api'],
  figma_design_system: ['design system', 'figma', 'component librar'],
};

/**
 * Consulting-standard checks on a drafted approach (ADR 0017): every Shopify
 * statement cites an official source, decisions and requirements trace to the
 * client's answers, integrations cover the system landscape, risks rest on
 * evidence. Returns the gaps to fix; the schema check comes first.
 *
 * @param {object} payload  Approach in the drafting shape
 * @param {object} doc  Decided engagement
 * @returns {string[]}
 */
/** The topic that carries the market-topology decision. */
const TOPOLOGY_TOPIC = /market\s*topology|store\s*topology|markets?\s*(vs\.?|or)\s*expansion/i;
const MANAGED_MARKETS = /managed markets/i;
const STORE_SHAPE = /one store|single store|expansion store|hybrid|managed markets/i;
const STATED_VS_DERIVED = /stated|assum|derived|to validate|not yet confirmed/i;

export function approachQualityErrors(payload, doc) {
  const errors = [];
  const official = (list) => (list ?? []).some((s) => OFFICIAL_SHOPIFY_SOURCE.test(s));
  const badLinks = (list, where) => (list ?? []).filter((s) => !HTTPS.test(s)).forEach((s) => errors.push(`${where}: "${s}" is not an https link`));

  (payload.capability_map ?? []).forEach((row, i) => {
    const where = `capability_map[${i + 1}] "${row.requirement}"`;
    badLinks(row.sources, where);
    if (!official(row.sources)) errors.push(`${where}: cite at least one official Shopify source (help.shopify.com, shopify.dev, apps.shopify.com…)`);
    if (!(row.question_ids ?? []).length) errors.push(`${where}: trace it to at least one question id`);
    if (row.resolution !== 'native' && !row.why_this_level?.trim()) errors.push(`${where}: say why ${row.resolution} and not a cheaper level (native → app → theme → custom)`);
  });

  const decisions = payload.architecture_decisions ?? [];
  if (decisions.length < 3) errors.push(`architecture_decisions: at least three decisions are needed (got ${decisions.length})`);
  decisions.forEach((d, i) => {
    const where = `architecture_decisions[${i + 1}] "${d.topic}"`;
    badLinks(d.sources, where);
    if ((d.options ?? []).length < 2) errors.push(`${where}: weigh at least two options`);
    if (!official(d.sources)) errors.push(`${where}: cite at least one official Shopify source`);
    if (!(d.question_ids ?? []).length) errors.push(`${where}: found it on at least one client answer (question id)`);
    if (!d.decision?.trim() || !d.rationale?.trim()) errors.push(`${where}: state the decision and its rationale`);
    // Comparable or it is not a comparison: the same axes on every option.
    errors.push(...rubricErrors(d, doc, where));
  });

  // Market topology: mandatory on any engagement with more than one market, and
  // held to a higher bar than the other decisions, because it constrains them.
  const topology = doc?.markets?.topology;
  if ((doc?.markets?.list ?? []).length > 1) {
    const decision = decisions.find((d) => TOPOLOGY_TOPIC.test(String(d.topic ?? '')));
    if (!decision) {
      errors.push('architecture_decisions: add "Market topology" (every engagement with more than one market decides how many stores it runs on, and that decision constrains the storefront)');
    } else {
      const where = `architecture_decisions "${decision.topic}"`;
      if ((decision.options ?? []).length < 3) errors.push(`${where}: weigh at least three options — one store with Shopify Markets, expansion stores and a hybrid`);
      if (!(decision.why_not ?? []).length) errors.push(`${where}: say why each option was not taken (why_not)`);
      const impact = decision.impact ?? {};
      for (const lens of ['technical', 'project', 'merchant', 'customer']) {
        if (!impact[lens]?.trim()) errors.push(`${where}: impact.${lens} — one or two sentences on what this changes for that audience`);
      }
      if (!MANAGED_MARKETS.test(`${decision.rationale ?? ''} ${(decision.why_not ?? []).map((w) => `${w.option} ${w.reason}`).join(' ')}`)) {
        errors.push(`${where}: state the Managed Markets position explicitly — recommended, rejected on economics, or not eligible with the failing condition`);
      }
      if (topology && !new RegExp(topology.recommendation.replace(/_/g, '[ _]'), 'i').test(`${decision.decision ?? ''} ${decision.rationale ?? ''}`)
        && !STORE_SHAPE.test(`${decision.decision ?? ''}`)) {
        errors.push(`${where}: the decision must name the store shape the engine derived (${topology.recommendation}), or argue explicitly why it differs`);
      }
      if (topology?.confidence === 'to_validate' && !STATED_VS_DERIVED.test(`${decision.rationale ?? ''}`)) {
        errors.push(`${where}: the topology rests on assumptions, so the rationale must separate what the client stated from what the engine derived`);
      }
    }
  }

  // Every requirement the engine found has to be answered somewhere.
  //
  // Integrations were coverage-checked from the start and requirements were not,
  // so a requirement the draft simply did not enumerate vanished without anything
  // objecting — on a bid, that is losing on compliance to a gap nobody saw. The
  // scope gates and L triggers are the engine's own statement of what this
  // engagement needs, each already carrying the answer that proves it, so they
  // are the list to check against rather than one the model wrote itself.
  const capability = payload.capability_map ?? [];
  const addressed = (needle) => capability.some((r) => {
    const hay = `${r.requirement ?? ''} ${r.client_requirement ?? ''} ${r.tool ?? ''} ${(r.question_ids ?? []).join(' ')}`.toLowerCase();
    return needle.some((word) => hay.includes(word));
  });
  for (const [id, gate] of Object.entries(doc.offer?.scope_gates ?? {})) {
    if (!gate.active) continue;
    const words = REQUIREMENT_WORDS[id];
    if (words && !addressed(words)) {
      errors.push(`capability_map: nothing addresses "${id.replace(/_/g, ' ')}" (${gate.evidence}) — every requirement the engine found has to be answered somewhere in the map`);
    }
  }
  for (const [id, trigger] of Object.entries(doc.offer?.l_triggers ?? {})) {
    if (!trigger.active) continue;
    const words = REQUIREMENT_WORDS[id];
    if (words && !addressed(words)) {
      errors.push(`capability_map: nothing addresses "${id.replace(/_/g, ' ')}" (${trigger.evidence})`);
    }
  }

  const integrations = payload.integration_architecture ?? [];
  const covered = new Set(integrations.map((x) => String(x.system).trim().toLowerCase()));
  for (const system of (doc.integrations ?? []).map((x) => x.system)) {
    if (!covered.has(String(system).trim().toLowerCase())) errors.push(`integration_architecture: add "${system}" (every system in the engagement integrations)`);
  }
  integrations.forEach((x, i) => {
    badLinks(x.sources, `integration_architecture[${i + 1}] "${x.system}"`);
    if (!official(x.sources)) errors.push(`integration_architecture[${i + 1}] "${x.system}": cite the Shopify API documentation for the pattern`);
  });

  (payload.data_model ?? []).forEach((x, i) => {
    badLinks(x.sources, `data_model[${i + 1}] "${x.name}"`);
    if (!official(x.sources)) errors.push(`data_model[${i + 1}] "${x.name}": cite Shopify documentation`);
  });

  const nfr = payload.non_functional ?? [];
  if (nfr.length < 3) errors.push(`non_functional: cover at least three areas (got ${nfr.length})`);
  nfr.forEach((x, i) => {
    badLinks(x.sources, `non_functional[${i + 1}] ${x.area}`);
    if (!(x.sources ?? []).length) errors.push(`non_functional[${i + 1}] ${x.area}: cite at least one source`);
  });

  const register = payload.risk_register ?? [];
  if (register.length < 3) errors.push(`risk_register: at least three risks are needed (got ${register.length})`);
  register.forEach((r, i) => {
    if (!(r.evidence ?? []).some((e) => EVIDENCE.test(e))) errors.push(`risk_register[${i + 1}] "${r.risk}": found it on evidence — question ids (Q8.2.3) or exit rules (11.14)`);
    if (!r.mitigation?.trim()) errors.push(`risk_register[${i + 1}] "${r.risk}": add a mitigation`);
  });

  (payload.app_shortlist ?? []).filter((a) => a.recommended).forEach((a) => {
    if (!HTTPS.test(a.url ?? '')) errors.push(`app_shortlist "${a.name}": link the App Store listing or the vendor page (https)`);
  });
  return errors;
}

/**
 * Engagement view sent to the model: answers, offer code/track and exits —
 * without price band, modifiers or rationale.
 *
 * @param {object} doc
 */
export function approachInput(doc) {
  const { offer, approach, provenance, notes, ...answers } = doc;
  return {
    ...answers,
    offer: { code: offer.code, name: offer.name, delivery_track: offer.delivery_track, scope_gates: offer.scope_gates, l_triggers: offer.l_triggers },
    app_signals: appSignals(doc),
    app_candidates: appCandidates(doc),
    // Everything Merkle has already checked against Shopify's documentation for the
    // questions this client answered — limits, options already weighed, plan gates.
    verified_knowledge: knowledgeFor(doc),
    // The axes every option is measured on — eight always, the rest switched on
    // by this engagement's own answers (markets, B2B, retail, checkout…).
    decision_rubric: rubricBrief(doc),
    // The client's own arithmetic: order volume, average basket, the rates Shopify
    // publishes that this engagement triggers, and what is not known.
    run_cost: runCostFor(doc),
    // Who has to run this after go-live, and with what.
    organisation: organisationalProfile(doc),
    ...(planSuggestion(doc) ? { plan_suggestion: planSuggestion(doc) } : {}),
    question_ids_by_answer: Object.fromEntries(
      Object.entries(provenance ?? {}).map(([pointer, p]) => [pointer, p.question_id]).filter(([, id]) => id),
    ),
  };
}

/** Drop empty-string properties from an object. */
const compact = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined));

/**
 * Convert the all-required structured output into the engagement `approach`
 * shape: empty strings removed, cost fields regrouped, "none" capability dropped.
 *
 * @param {object} payload
 * @returns {object}  capability_map, app_shortlist, phases, risks.assumptions
 */
export function fromApproachPayload(payload) {
  return {
    capability_map: (payload.capability_map ?? []).map((row) => {
      const out = compact(row);
      if (!out.question_ids?.length) delete out.question_ids;
      if (!out.sources?.length) delete out.sources;
      return out;
    }),
    ...(() => {
      const architecture = Object.fromEntries(Object.entries({
        decisions: (payload.architecture_decisions ?? []).map((d) => ({ ...compact(d), options: (d.options ?? []).map(compact) })),
        integrations: (payload.integration_architecture ?? []).map(compact),
        data_model: (payload.data_model ?? []).map(compact),
        non_functional: (payload.non_functional ?? []).map(compact),
      }).filter(([, list]) => list.length));
      return Object.keys(architecture).length ? { architecture } : {};
    })(),
    app_shortlist: (payload.app_shortlist ?? []).map(({ cost_amount, cost_currency, cost_period, cost_note, ...app }) => {
      const out = compact(app);
      if (out.recommended) delete out.rejection_reason;
      const cost = compact({
        ...(cost_amount >= 0 && cost_period !== 'unknown' ? { amount: cost_amount, period: cost_period } : {}),
        currency: cost_currency,
        note: cost_note,
      });
      if (Object.keys(cost).length) out.cost = cost;
      return out;
    }),
    phases: (payload.phases ?? []).map((phase) => ({
      name: phase.name,
      sprints: phase.sprints.map((sprint) => ({
        name: sprint.name,
        tasks: sprint.tasks.map(({ capability, deferred, ...task }) => ({
          ...compact(task),
          ...(capability !== 'none' ? { capability } : {}),
          ...(deferred ? { deferred: true } : {}),
        })),
      })),
    })),
    risks: { assumptions: (payload.assumptions ?? []).map(compact), ...((payload.risk_register ?? []).length ? { register: payload.risk_register.map(compact) } : {}) },
  };
}

/**
 * Inverse of fromApproachPayload — encodes a stored approach as the model's
 * output shape. Used to replay recorded engagements in tests.
 *
 * @param {object} approach
 * @returns {object}
 */
export function toApproachPayload(approach) {
  return {
    capability_map: (approach.capability_map ?? []).map((r) => ({
      requirement: r.requirement, client_requirement: r.client_requirement ?? '', resolution: r.resolution, tool: r.tool ?? '',
      why_this_level: r.why_this_level ?? '', limits: r.limits ?? '', gaia_tier: r.gaia_tier ?? 'T2',
      notes: r.notes ?? '', question_ids: r.question_ids ?? [], sources: r.sources ?? [],
    })),
    architecture_decisions: (approach.architecture?.decisions ?? []).map((d) => ({
      topic: d.topic, question: d.question ?? '', options: (d.options ?? []).map((o) => ({ option: o.option, pros: o.pros ?? '', cons: o.cons ?? '', ...(o.assessment ? { assessment: o.assessment } : {}) })),
      decision: d.decision, rationale: d.rationale ?? '', plan_impact: d.plan_impact ?? 'none', status: d.status ?? 'recommended', sources: d.sources ?? [], question_ids: d.question_ids ?? [],
      ...(d.why_not?.length ? { why_not: d.why_not.map((w) => ({ option: w.option, reason: w.reason })) } : {}),
      ...(d.impact ? { impact: { technical: d.impact.technical ?? '', project: d.impact.project ?? '', merchant: d.impact.merchant ?? '', customer: d.impact.customer ?? '' } } : {}),
    })),
    integration_architecture: (approach.architecture?.integrations ?? []).map((x) => ({
      system: x.system, system_of_record_for: x.system_of_record_for ?? [], pattern: x.pattern, direction: x.direction ?? 'both_ways', frequency: x.frequency ?? 'near_realtime',
      shopify_apis: x.shopify_apis ?? [], error_handling: x.error_handling ?? '', sources: x.sources ?? [], question_ids: x.question_ids ?? [],
    })),
    data_model: (approach.architecture?.data_model ?? []).map((x) => ({ object: x.object, kind: x.kind, name: x.name, purpose: x.purpose ?? '', source_system: x.source_system ?? '', sources: x.sources ?? [] })),
    non_functional: (approach.architecture?.non_functional ?? []).map((x) => ({ area: x.area, requirement: x.requirement, approach: x.approach, sources: x.sources ?? [] })),
    risk_register: (approach.risks?.register ?? []).map((r) => ({ risk: r.risk, likelihood: r.likelihood ?? 'medium', impact: r.impact ?? 'medium', mitigation: r.mitigation, owner: r.owner ?? 'shared', evidence: r.evidence ?? [] })),
    app_shortlist: (approach.app_shortlist ?? []).map((a) => ({
      name: a.name, url: a.url ?? '', requirement: a.requirement ?? '', rationale: a.rationale ?? '', limitations: a.limitations ?? '',
      cost_amount: a.cost?.amount ?? -1, cost_currency: a.cost?.currency ?? '', cost_period: a.cost?.period ?? 'unknown', cost_note: a.cost?.note ?? '',
      integration_complexity: a.integration_complexity ?? 'none', gaia_tier: a.gaia_tier ?? 'T1',
      recommended: a.recommended, rejection_reason: a.rejection_reason ?? '',
    })),
    assumptions: (approach.risks?.assumptions ?? []).map((x) => ({ statement: x.statement, impact_if_wrong: x.impact_if_wrong ?? '' })),
    phases: (approach.phases ?? []).map((p) => ({
      name: p.name,
      sprints: p.sprints.map((sp) => ({
        name: sp.name,
        tasks: sp.tasks.map((t) => ({
          title: t.title, capability: t.capability ?? 'none', gaia_tier: t.gaia_tier ?? 'T2', owner: t.owner ?? 'agent', deferred: t.deferred ?? false,
        })),
      })),
    })),
  };
}

/**
 * Draft the approach for a GO engagement or a routed STOP.
 *
 * @param {{ callStructured: Function }} llm
 * @param {object} doc  Engagement with offer and exits computed
 * @returns {Promise<object>}  capability_map, app_shortlist, risks.assumptions, phases
 */
export async function draftApproach(llm, doc) {
  const user = `Engagement (JSON):\n\n${JSON.stringify(approachInput(doc), null, 2)}`;
  let { data } = await llm.callStructured({ system: APPROACH_SYSTEM, user, schema: buildApproachSchema() });
  let errors = approachQualityErrors(data, doc);
  if (errors.length) {
    ({ data } = await llm.callStructured({
      system: APPROACH_SYSTEM,
      user: `${user}\n\nYour previous approach had these problems — return the complete approach with them fixed:\n- ${errors.join('\n- ')}\n\nPrevious approach (JSON):\n${JSON.stringify(data)}`,
      schema: buildApproachSchema(),
    }));
    errors = approachQualityErrors(data, doc);
    if (errors.length) throw new ApproachQualityError(errors);
  }
  return fromApproachPayload(data);
}

/** The drafted approach does not meet the consulting standard after one repair (ADR 0017). */
export class ApproachQualityError extends Error {
  /** @param {string[]} errors */
  constructor(errors) {
    super(`The drafted approach does not meet the consulting standard after one repair attempt:\n  • ${errors.slice(0, 15).join('\n  • ')}`);
    this.errors = errors;
  }
}
