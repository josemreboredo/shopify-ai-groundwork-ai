/**
 * @file launch.js — epic "Launch & handover" (LWC-LCH-*)
 */

import { markets, listOr, list, isMigration, storeName, recommendedApps, money } from './helpers.js';

const domains = (doc) => markets(doc).map((m) => m.domain).filter(Boolean);
const openExits = (doc) => (doc.exits?.items ?? []).filter((i) => ['STOP', 'FLAG'].includes(i.result) && i.resolution?.status !== 'resolved' && i.resolution?.status !== 'waived');
const supportText = {
  hypercare_only: 'hypercare only, then the client team is self-sufficient',
  retainer: 'hypercare followed by the Grow retainer',
  self_sufficient: 'short hypercare, then the client team runs the store',
  third_party: 'hypercare, then handover to the client\'s third-party support partner',
};

/** @type {import('../model.js').StoryDefinition[]} */
export default [
  {
    key: 'LWC-LCH-001',
    epic: 'launch',
    title: 'Plan, rehearse and run the go-live cut-over and domain switch',
    description: (doc) => `Domains: ${listOr(domains(doc), 'to confirm')}. Target launch: ${doc.delivery?.target_launch_date ?? 'to confirm'}.`,
    user_story: 'As the client, I want a rehearsed, minute-by-minute cut-over plan, so that the store goes live without lost orders or downtime.',
    acceptance_criteria: (doc) => [
      `Given the cut-over plan, when it is rehearsed on the build store${isMigration(doc) ? ' including a full delta migration' : ''}, then every step has an owner, duration, go/no-go check and rollback`,
      `Given DNS for ${listOr(domains(doc), 'the store domain')}, when the domains are connected, then TTLs were lowered 48 hours before, SSL is active, the primary domain per market is set and all other hostnames redirect`,
      ...(isMigration(doc) ? ['Given the old platform, when cut-over starts, then it is frozen for orders and content, the final delta (orders, customers, gift card balances) is imported and reconciled before the password is removed'] : []),
      ...(doc.delivery?.phased_launch ? ['Given a phased launch, when each phase goes live, then its markets, channels or customer groups are enabled in the agreed order with its own go/no-go'] : []),
      'Given launch, when the storefront password is removed, then a live test order per market and payment method is placed and refunded',
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'consultant',
    depends_on: ['LWC-QA-004', 'LWC-FND-004'],
    spec_refs: ['/markets/list/*/domain', '/delivery/target_launch_date', '/delivery/phased_launch', '/migration/source_platform'],
    security_flags: ['production_store'],
    applies: () => true,
    agent_prompt: (doc) => `Target launch: ${doc.delivery?.target_launch_date ?? 'to confirm'}${doc.delivery?.hard_deadline_reason ? ` (hard deadline: ${doc.delivery.hard_deadline_reason})` : ''}. Write the cut-over runbook for ${storeName(doc)}: T-14 to T+1 timeline, DNS changes for ${listOr(domains(doc), 'the store domain')} (lower TTL, connect in Shopify, set primary domains per market), ${isMigration(doc) ? 'source platform freeze and final delta migration with reconciliation, redirect verification, ' : ''}${doc.delivery?.phased_launch ? 'phase-by-phase enablement with separate go/no-go, ' : ''}app billing switch, payment live mode, password removal, live test orders and rollback. Rehearse it once. Every production step needs consultant approval at the time it runs.`,
  },
  {
    key: 'LWC-LCH-002',
    epic: 'launch',
    title: 'Complete the launch readiness checklist and go/no-go',
    user_story: 'As the decision-maker, I want an objective readiness checklist, so that we only launch when the store, team and contracts are ready.',
    acceptance_criteria: (doc) => [
      `Given the exit rules raised in discovery, when readiness is reviewed, then every STOP or FLAG item${openExits(doc).length ? ` (${list(openExits(doc).map((i) => i.rule_id))} still open)` : ''} is resolved or waived with a named owner`,
      'Given payments, when readiness is reviewed, then Shopify Payments verification and every provider are in live mode with payouts configured and test mode off',
      `Given apps, when readiness is reviewed, then every installed app is on its paid plan, billed to the client and within ${money(doc.business?.app_cost_ceiling_monthly, 'the agreed app budget')} per month, and development-only apps are removed`,
      'Given staff access, when readiness is reviewed, then agency collaborator access is limited to hypercare needs and client owner, two-step authentication and staff permissions are confirmed',
      // The build store is a client transfer store: ownership moves to the
      // client when it goes live, and the store then leaves Merkle's Partner
      // organisation. Unwritten, it is discovered at the worst moment — with
      // the billing, the storage limits and the owner account all attached to it.
      'Given the build store, when it is ready to go live, then ownership is transferred to the client, their billing and plan are in place, and the store leaves the Partner organisation with the agreed collaborator access left behind',
    ],
    gaia_tier: 'T2',
    points: 2,
    owner: 'consultant',
    depends_on: ['LWC-LCH-001'],
    spec_refs: ['/exits/items', '/business/app_cost_ceiling_monthly', '/payments/providers', '/delivery/decision_maker_confirmed'],
    security_flags: ['production_store', 'payments', 'auth'],
    applies: () => true,
    agent_prompt: (doc) => `Build the readiness checklist: open exits ${listOr(openExits(doc).map((i) => `${i.rule_id} (${i.destination ?? i.detail ?? 'see engagement'})`), 'none')}; UAT and QA sign-off; payments live (${listOr(doc.payments?.providers, 'providers')}); taxes signed off by finance; legal pages approved; consent banner live; apps on paid plans (${listOr(recommendedApps(doc).map((a) => a.name), 'none shortlisted')}); analytics verified; redirects verified; staff access and two-step authentication; support rota for hypercare. Transfer store ownership to the client with their billing and plan in place. Run the go/no-go meeting and record the decision.`,
  },
  {
    key: 'LWC-LCH-003',
    epic: 'launch',
    title: (doc) => `Train the client team${doc.delivery?.sops_required ? ' and hand over SOPs' : ''}`,
    user_story: 'As a client team member, I want hands-on training and clear operating procedures, so that I can run the store confidently from day one.',
    acceptance_criteria: (doc) => [
      ...(doc.delivery?.training?.length ? doc.delivery.training : ['Products and collections', 'Orders, returns and refunds', 'Discounts', 'Theme editor content changes']).map((t) => `Given the "${t}" session, when it is delivered, then attendees complete a hands-on exercise on the build store and the recording is shared`),
      ...(doc.delivery?.sops_required ? ['Given each recurring operation, when the SOP library is handed over, then every SOP has a purpose, steps with screenshots, owner and review date and is stored in the client\'s knowledge base'] : []),
      'Given training is complete, when the client owner reviews the handover pack, then admin roles, app list, integrations and escalation contacts are documented',
    ],
    gaia_tier: 'T1',
    points: 3,
    owner: 'consultant',
    depends_on: ['LWC-QA-004'],
    gates: ['post_launch_support'],
    spec_refs: ['/delivery/training', '/delivery/sops_required', '/delivery/admin_roles'],
    applies: () => true,
    agent_prompt: (doc) => `Prepare training for ${listOr(doc.delivery?.admin_roles, 'the client team')} covering ${listOr(doc.delivery?.training, 'products and collections, orders and returns, discounts and theme editor content changes')}: agenda, hands-on exercises on the build store and recordings. ${doc.delivery?.sops_required ? 'Write SOPs for each recurring operation (from the delivered stories: fraud review, returns, B2B approvals, data-subject requests, promotions, integrations monitoring where applicable) using a single template. ' : ''}Assemble the handover pack. Use test data only in training materials.`,
  },
  {
    key: 'LWC-LCH-004',
    epic: 'launch',
    title: 'Run hypercare and hand over to ongoing support',
    user_story: 'As the client, I want close support in the first weeks after launch, so that issues are fixed fast while the team settles in.',
    acceptance_criteria: (doc) => [
      'Given the hypercare period, when an incident is reported, then severity 1 issues get a response within 1 hour and severity 2 within 4 business hours',
      `Given the first two weeks, when daily checks run, then orders, payments, ${isMigration(doc) ? '404s and redirects, ' : ''}integrations, Core Web Vitals and analytics are reviewed and findings logged`,
      `Given the end of hypercare, when the handover meeting happens, then open issues move to ${supportText[doc.delivery?.support_model] ?? 'the agreed support model'} with an owner each`,
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'consultant',
    depends_on: ['LWC-LCH-001'],
    gates: ['post_launch_support'],
    spec_refs: ['/delivery/support_model', '/delivery/grow_retainer/signed'],
    security_flags: ['production_store'],
    applies: () => true,
    agent_prompt: (doc) => `Support model: ${supportText[doc.delivery?.support_model] ?? 'to confirm'}. Set up the hypercare rota, severity definitions and channels; run daily checks (orders and payments, app and integration errors, ${isMigration(doc) ? 'Search Console coverage and 404s, ' : ''}Web Performance dashboard, analytics sanity); log findings and fixes. Production fixes still follow the production change runbook. At the end, run the handover meeting, remove collaborator access that is no longer needed and move open items to the next owner.`,
  },
];
