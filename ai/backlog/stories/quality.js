/**
 * @file quality.js — epic "Quality, accessibility & performance" (LWC-QA-*)
 */

import { markets, languages, listOr, list, gate, isB2b, hasEuMarket, integrationsOf } from './helpers.js';

const a11yTargets = { wcag21_aa: 'WCAG 2.1 AA', wcag22_aa: 'WCAG 2.2 AA', en301549: 'EN 301 549', section508: 'Section 508' };
const perf = (doc) => ({
  lcp: doc.design?.performance?.lcp_s ?? 2.5,
  cls: doc.design?.performance?.cls ?? 0.1,
  inp: doc.design?.performance?.inp_ms ?? 200,
});
const countedIntegrations = (doc) => ['erp', 'pim', 'crm', '3pl_wms', 'oms', 'custom'].flatMap((c) => integrationsOf(doc, c));

/** @type {import('../model.js').StoryDefinition[]} */
export default [
  {
    key: 'LWC-QA-001',
    epic: 'quality',
    title: (doc) => `Audit and fix accessibility to ${a11yTargets[doc.design?.accessibility?.target] ?? 'WCAG 2.1 AA'}`,
    user_story: 'As a shopper with a disability, I want to browse and buy with keyboard, screen reader or zoom, so that I can shop independently.',
    acceptance_criteria: (doc) => [
      'Given home, collection, product, cart, search, account and policy pages, when automated axe checks run, then there are no critical or serious violations',
      'Given a keyboard-only and a screen-reader user (VoiceOver and NVDA), when they complete the purchase journey up to checkout, then every step is operable with visible focus and meaningful announcements',
      'Given 400% zoom on a 1280 px window (320 CSS px), when pages are viewed, then content reflows without loss of information',
      ...(hasEuMarket(doc) ? ['Given the European Accessibility Act, when the store launches, then an accessibility statement describing conformance and a feedback contact is published'] : []),
    ],
    gaia_tier: 'T2',
    points: 5,
    owner: 'agent',
    depends_on: ['LWC-THM-005', 'LWC-THM-006'],
    spec_refs: ['/design/accessibility/target', '/design/accessibility/audit_done'],
    applies: (doc) => doc.design?.accessibility?.target !== 'none',
    agent_prompt: (doc) => `Target: ${a11yTargets[doc.design?.accessibility?.target] ?? 'WCAG 2.1 AA'}. Run axe (for example @axe-core/cli or Playwright with axe) on every template in each language, then manual keyboard and screen-reader passes on the purchase journey. Fix issues in theme code and settings (contrast, labels, alt text, focus order, aria on disclosure and modal components, app blocks). Report app-owned issues to the vendor. Checkout and customer accounts are Shopify-hosted — test them but log issues as vendor items. ${hasEuMarket(doc) ? 'Draft an accessibility statement for the European Accessibility Act for legal review. ' : ''}Deliver the audit report with before/after counts.`,
  },
  {
    key: 'LWC-QA-002',
    epic: 'quality',
    title: 'Meet Core Web Vitals budgets and review third-party scripts',
    description: (doc) => `Budgets (p75 mobile): LCP ${perf(doc).lcp} s, CLS ${perf(doc).cls}, INP ${perf(doc).inp} ms.`,
    user_story: 'As a mobile shopper, I want pages to load and respond instantly, so that I do not give up before buying.',
    acceptance_criteria: (doc) => [
      `Given home, collection and product pages on a throttled mid-range mobile profile, when lab tests run, then LCP is at or below ${perf(doc).lcp} s, CLS at or below ${perf(doc).cls} and TBT indicates INP at or below ${perf(doc).inp} ms`,
      `Given third-party scripts (${listOr(doc.design?.performance?.third_party_scripts, 'apps and pixels')}), when they are reviewed, then each has an owner and purpose, loads deferred or via app embeds or web pixels, and unused ones are removed`,
      'Given the live store after launch, when Shopify Web Performance reports 28 days of field data, then the p75 Core Web Vitals meet the budget or a remediation ticket exists',
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'developer',
    depends_on: ['LWC-THM-005'],
    spec_refs: ['/design/performance/lcp_s', '/design/performance/cls', '/design/performance/inp_ms', '/design/performance/third_party_scripts', '/design/performance/known_problem'],
    applies: () => true,
    agent_prompt: (doc) => `Budgets: LCP ${perf(doc).lcp} s, CLS ${perf(doc).cls}, INP ${perf(doc).inp} ms (p75 mobile). ${doc.design?.performance?.known_problem ? 'Performance is a known problem today, so record a baseline of the current site first. ' : ''}Run Lighthouse and WebPageTest on key templates; fix LCP image priority and sizes, render-blocking assets, layout shifts from images, fonts and app blocks, and long tasks. Inventory third-party scripts (${listOr(doc.design?.performance?.third_party_scripts, 'none listed')}), remove or defer each, and move tracking into web pixels. Add a Lighthouse CI budget to the pipeline and report before/after.`,
  },
  {
    key: 'LWC-QA-003',
    epic: 'quality',
    title: (doc) => `Run functional QA per market: ${listOr(markets(doc).map((m) => m.code), 'primary market')}`,
    user_story: 'As the delivery team, I want a documented test plan executed per market, language and device, so that launch defects are caught before customers see them.',
    acceptance_criteria: (doc) => [
      ...markets(doc).map((m) => `Given the ${m.code} market, when test orders run in ${m.currency ?? 'the market currency'} with each payment method, then order creation, taxes, shipping, notifications, fulfilment and refunds behave as specified`),
      `Given each language (${listOr(languages(doc), 'default')}) on iOS Safari, Android Chrome and desktop Chrome, Safari, Firefox and Edge, when the core journeys run, then no severity 1 or 2 defect remains open`,
      'Given the defect log, when QA signs off, then every defect has a severity, owner and status and retests are recorded',
    ],
    gaia_tier: 'T2',
    points: 5,
    owner: 'agent',
    depends_on: ['LWC-THM-006', 'LWC-PAY-001', 'LWC-SHP-001'],
    spec_refs: ['/markets/list', '/payments/providers', '/shipping/rates'],
    applies: () => true,
    agent_prompt: (doc) => `Write the test plan: journeys (browse, search, filter, product, cart, checkout, account, returns), markets ${listOr(markets(doc).map((m) => `${m.code}/${m.currency ?? '?'}`), 'primary')}, languages ${listOr(languages(doc), 'default')}, payment methods ${listOr(doc.payments?.providers, 'configured')}, devices and browsers. Automate smoke tests with Playwright against the build store (no real card data; use Shopify test mode). Execute manually where automation is not worth it, log defects with severity and retest. Sign-off requires zero open severity 1/2 defects.`,
  },
  {
    key: 'LWC-QA-004',
    epic: 'quality',
    title: 'Run user acceptance testing with the client team',
    user_story: 'As the client, I want to test the store with my own team against our real processes, so that we are confident to go live.',
    acceptance_criteria: (doc) => [
      `Given UAT scripts for ${listOr(doc.delivery?.admin_roles, 'each client role')}, when the client team executes them, then results and defects are logged in the agreed tracker`,
      'Given UAT defects, when they are triaged, then must-fix items are resolved and retested before the go/no-go meeting',
      'Given UAT completion, when the decision-maker reviews the results, then UAT sign-off is recorded in writing',
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'client',
    depends_on: ['LWC-QA-003'],
    spec_refs: ['/delivery/admin_roles', '/stakeholders/*/decision_maker'],
    applies: () => true,
    agent_prompt: (doc) => `Prepare UAT scripts per client role (${listOr(doc.delivery?.admin_roles, 'roles to confirm')}): daily operations such as order processing, returns, product edits, discounts${isB2b(doc) ? ', B2B company and order handling' : ''}. Provide test data, a defect template and a UAT schedule. Triage defects daily with the consultant. Collect written sign-off from the decision-maker.`,
  },
  {
    key: 'LWC-QA-005',
    scope: 'Run multi-market and B2B regression tests',
    epic: 'quality',
    title: (doc) => `Run ${[gate(doc, 'markets') ? 'multi-market' : '', isB2b(doc) ? 'B2B' : ''].filter(Boolean).join(' and ')} regression tests`,
    user_story: 'As the delivery team, I want the context-dependent behaviour tested explicitly, so that buyers never see the wrong prices, currency or catalogue.',
    acceptance_criteria: (doc) => [
      ...(gate(doc, 'markets') ? [`Given visitors from ${list(markets(doc).map((m) => m.code))}, when they switch market, language and domain, then prices, currency, taxes, duties, payment methods, shipping and policies always match the selected market`] : []),
      ...(isB2b(doc) ? ['Given a B2B buyer and a retail customer in parallel sessions, when both browse and check out, then catalog prices, quantity rules, payment terms and discounts never leak across contexts'] : []),
      'Given a regression suite, when any change is merged after sign-off, then the suite runs again and passes before release',
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'agent',
    depends_on: ['LWC-QA-003'],
    spec_refs: ['/markets/list', '/b2b/enabled', '/offer/scope_gates'],
    gates: ['markets', 'b2b'],
    applies: (doc) => gate(doc, 'markets') || isB2b(doc),
    agent_prompt: (doc) => `Build an automated regression matrix (Playwright) for ${[gate(doc, 'markets') ? `markets ${list(markets(doc).map((m) => m.code))}` : '', isB2b(doc) ? 'retail vs B2B buyer contexts' : ''].filter(Boolean).join(' and ')}: country/currency switching, domain redirects, price and tax display, payment method availability, catalog visibility and discount eligibility. Use test accounts only; no real customer data. Run it in CI against the staging theme before every release.`,
  },
  {
    key: 'LWC-QA-006',
    scope: 'Test every integration end to end and set up monitoring',
    epic: 'quality',
    title: (doc) => `Test ${list(countedIntegrations(doc).map((i) => i.system))} end to end and set up monitoring`,
    user_story: 'As an operations manager, I want integrations proven with real-world scenarios and monitored after launch, so that data problems are caught before customers notice.',
    acceptance_criteria: (doc) => [
      ...countedIntegrations(doc).map((i) => `Given the ${i.system} integration, when scenario tests run (create, update, cancel, refund, out-of-stock, invalid data, system offline), then each ends in the expected state in both systems`),
      'Given a sync failure in production, when it occurs, then the owner is alerted within 15 minutes with a link to the failed record and runbook',
      'Given a volume test at launch-peak load, when it runs, then no Shopify API rate limit errors go unhandled and sync latency stays within the agreed window',
    ],
    gaia_tier: 'T3',
    points: 5,
    owner: 'developer',
    depends_on: ['LWC-INT-001', 'LWC-INT-002', 'LWC-INT-003', 'LWC-INT-004', 'LWC-INT-005'],
    spec_refs: ['/integrations/*/system', '/integrations/*/frequency', '/integrations/*/owner'],
    gates: ['integration'],
    applies: (doc) => gate(doc, 'integration') && countedIntegrations(doc).length > 0,
    agent_prompt: (doc) => `Write and run end-to-end scenario tests for ${list(countedIntegrations(doc).map((i) => `${i.system} (${i.frequency ?? 'frequency to confirm'})`))} on the build store with sandbox instances of each system. Include failure scenarios and a peak-volume run. Set up monitoring and alerting (connector dashboard or logging platform) with named owners, and write the integration runbook. Logs must not contain personal data or secrets.`,
  },
];
