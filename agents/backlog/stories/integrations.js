/**
 * @file integrations.js — epic "Integrations" (LWC-INT-*)
 *
 * One story per counted integration category; custom-built connectors get an
 * extra build story with webhook HMAC and secret handling.
 */

import { integrationsOf, list, listOr, exitFired } from './helpers.js';

/**
 * Default data ownership (can be changed per client in the field mapping):
 * the PIM — or Shopify when there is no PIM — masters product content and
 * attributes; the ERP masters prices, inventory, orders and financials.
 */
export const DATA_OWNERSHIP = 'Default data ownership: product content, attributes and media come from the PIM (or are maintained in Shopify when there is no PIM); prices, inventory, orders and financials come from the ERP. Confirm any deviation with the client in the field mapping.';

const connectorText = {
  native_app: 'a native Shopify App Store connector',
  ipaas: 'an iPaaS',
  custom: 'a custom-built connector',
  none: 'no connector yet',
  unknown: 'a connector still to be decided',
};

/** "Client ERP via Celigo (iPaaS), bidirectional, batch". @param {object} i */
const describe = (i) => `${i.system} via ${i.middleware ?? connectorText[i.connector] ?? 'a connector to decide'}${i.middleware && i.connector ? ` (${connectorText[i.connector] ?? i.connector})` : ''}, ${i.direction ?? 'direction to confirm'}, ${i.frequency ?? 'frequency to confirm'}, objects ${listOr(i.objects, 'to confirm')}`;
const systems = (items) => list(items.map((i) => i.system));
const customConnectors = (doc) => (doc.integrations ?? []).filter((i) => i.connector === 'custom' || ((i.category === 'custom' || i.category === 'other' || i.category === 'oms') && i.connector !== 'native_app'));

/**
 * Shared shape for category stories.
 * @param {object} o
 */
const categoryStory = ({ key, category, noun, title, user_story, extraCriteria = () => [], extraPrompt = () => '', points, gaia_tier, security_flags, depends_on }) => ({
  key,
  epic: 'integrations',
  title: (doc) => title(systems(integrationsOf(doc, category))),
  user_story,
  description: (doc) => integrationsOf(doc, category).map(describe).join('; '),
  acceptance_criteria: (doc) => [
    ...integrationsOf(doc, category).map((i) => `Given a change to ${listOr(i.objects, 'the mapped objects')} in ${i.direction === 'inbound' ? i.system : i.direction === 'outbound' ? 'Shopify' : `${i.system} or Shopify (per the source of truth of each field)`}, when the ${i.frequency ?? 'agreed'} sync runs, then the change appears in the target system with the agreed field mapping`),
    `Given the ${noun} field mapping document, when it is reviewed, then every mapped field has a source of truth, a transformation rule and an owner`,
    'Given a failed or rejected record, when the sync runs, then it is retried with back-off, logged without personal data and alerted to the named owner',
    ...extraCriteria(doc),
  ],
  gaia_tier,
  points,
  owner: 'developer',
  depends_on,
  spec_refs: ['/integrations/*/system', '/integrations/*/category', '/integrations/*/objects', '/integrations/*/direction', '/integrations/*/frequency', '/integrations/*/connector', '/integrations/*/middleware'],
  gates: ['integration'],
  security_flags,
  applies: (doc) => integrationsOf(doc, category).length > 0,
  agent_prompt: (doc) => `Integrations: ${integrationsOf(doc, category).map(describe).join('; ')}. Produce the field mapping (Shopify object and field, source system field, direction, transformation, source of truth) and the error-handling design for consultant approval before building. Use the Admin GraphQL API (latest stable version) with bulk operations for large syncs and respect rate limits. Credentials live in the connector's secret store or environment variables only — never in the repository or logs. Owner: ${listOr(integrationsOf(doc, category).map((i) => `${i.system}: ${i.owner ?? 'to confirm'}`), 'to confirm')}. ${extraPrompt(doc)}`.trim(),
});

/** @type {import('../model.js').StoryDefinition[]} */
export default [
  categoryStory({
    key: 'LWC-INT-001',
    category: 'erp',
    noun: 'ERP',
    title: (names) => `Connect ${names} (ERP) to Shopify`,
    user_story: 'As an operations manager, I want Shopify and our ERP to exchange prices, stock and orders automatically, so that they are never keyed twice.',
    extraCriteria: (doc) => [
      ...(integrationsOf(doc, 'erp').some((i) => (i.objects ?? []).includes('inventory')) ? ['Given stock changes in the ERP, when the sync runs, then Shopify inventory is updated per location and overselling does not occur during the sync window'] : []),
      ...(integrationsOf(doc, 'erp').some((i) => (i.objects ?? []).includes('prices')) ? [`Given a price change in the ERP, when the sync runs, then the Shopify price${(doc.markets?.list ?? []).length > 1 ? ' for each market price list' : ''}${doc.b2b?.enabled ? ' and B2B catalog' : ''} is updated and no other product field changes`] : []),
      `Given ${integrationsOf(doc, 'pim').length ? 'a PIM is connected' : 'product content is maintained in Shopify'}, when the ERP sync runs, then product titles, descriptions, attributes and media are not overwritten by the ERP`,
      ...(exitFired(doc, '11.12') ? ['Given exit rule 11.12 (no existing connector or iPaaS), when this story is planned, then the separate integration scoping track has approved the connector design'] : []),
    ],
    extraPrompt: (doc) => `${DATA_OWNERSHIP} Recorded for this client: catalogue data source ${doc.catalogue?.data_source ?? 'to confirm'}, inventory source ${doc.catalogue?.inventory?.source ?? 'to confirm'}${integrationsOf(doc, 'pim').length ? `, PIM ${systems(integrationsOf(doc, 'pim'))}` : ', no PIM'}. The ERP must not overwrite product content or fields mastered in Shopify (SEO, merchandising).${doc.b2b?.enabled ? ' Include B2B price lists and payment terms in the mapping where the ERP masters them.' : ''}`,
    gaia_tier: 'T3',
    points: 8,
    security_flags: ['secrets', 'pii'],
    depends_on: ['LWC-CAT-001', 'LWC-CAT-002'],
  }),
  categoryStory({
    key: 'LWC-INT-002',
    category: 'pim',
    noun: 'PIM',
    title: (names) => `Connect ${names} (PIM) to Shopify`,
    user_story: 'As a content manager, I want product content and attributes published from our PIM to Shopify, so that we maintain them in one place.',
    extraCriteria: (doc) => [
      `Given product attributes ${listOr(doc.catalogue?.custom_attributes, 'defined in the model')}, when they are published from the PIM, then they land in the matching metafields and translations for every storefront language`,
    ],
    extraPrompt: () => `${DATA_OWNERSHIP} Map PIM attributes to metafield definitions and PIM locales to Shopify translations (translationsRegister). Images go to product media with alt text. Do not import prices or stock from the PIM.`,
    gaia_tier: 'T3',
    points: 5,
    security_flags: ['secrets'],
    depends_on: ['LWC-CAT-002'],
  }),
  categoryStory({
    key: 'LWC-INT-003',
    category: 'crm',
    noun: 'CRM',
    title: (names) => `Connect ${names} (CRM) to Shopify`,
    user_story: 'As a service or sales team member, I want customer and order data from Shopify in our CRM, so that we see the full customer history.',
    extraCriteria: (doc) => [
      `Given a customer who has not consented to marketing, when their profile syncs to the CRM, then consent status is carried over and ${doc.compliance?.gdpr_deletion_workflow ? 'deletion requests propagate to the CRM' : 'no marketing use is possible'}`,
    ],
    extraPrompt: () => 'Sync only the personal data the CRM use case needs (data minimisation) and carry email/SMS consent state. Deletion requests from Shopify (customers/redact) must propagate.',
    gaia_tier: 'T3',
    points: 5,
    security_flags: ['pii', 'secrets'],
    depends_on: ['LWC-CUS-001'],
  }),
  categoryStory({
    key: 'LWC-INT-004',
    category: '3pl_wms',
    noun: '3PL/WMS',
    title: (names) => `Connect ${names} (3PL/WMS) to Shopify`,
    user_story: 'As an operations manager, I want orders, tracking and stock exchanged with the warehouse system automatically, so that fulfilment runs without manual exports.',
    extraCriteria: () => [
      'Given an order that is cancelled or edited before shipment, when the change syncs, then the warehouse stops or updates the pick without shipping the old order',
    ],
    extraPrompt: () => 'Use fulfillment orders (not legacy fulfillments) and a fulfilment service location; handle holds, cancellations and partial shipments.',
    gaia_tier: 'T2',
    points: 5,
    security_flags: ['pii', 'secrets'],
    depends_on: ['LWC-SHP-003'],
  }),
  {
    key: 'LWC-INT-005',
    epic: 'integrations',
    title: (doc) => `Build the custom or middleware connector for ${systems(customConnectors(doc))}`,
    user_story: 'As the business, I want a secure, observable custom connector where no off-the-shelf connector exists, so that data flows reliably and safely.',
    description: (doc) => customConnectors(doc).map(describe).join('; '),
    acceptance_criteria: (doc) => [
      'Given an inbound Shopify webhook, when the connector receives it, then the X-Shopify-Hmac-Sha256 header is verified against the raw body before any processing and invalid requests get 401',
      'Given the same webhook delivered twice, when it is processed, then the result is idempotent (deduplicated by webhook ID)',
      'Given the app credentials and system API keys, when the code and logs are scanned, then no secret or customer personal data appears',
      ...(exitFired(doc, '11.12') ? ['Given exit rule 11.12, when the connector is built, then it follows the design approved in the integration scoping track'] : []),
      `Given the connector for ${systems(customConnectors(doc))}, when it is deployed, then it has health checks, alerting to the named owner and a runbook`,
    ],
    gaia_tier: 'T3',
    points: 13,
    owner: 'developer',
    depends_on: ['LWC-FND-002'],
    spec_refs: ['/integrations/*/connector', '/integrations/*/category', '/integrations/*/system', '/integrations/*/frequency', '/integrations/*/owner'],
    gates: ['integration'],
    security_flags: ['webhook_hmac', 'secrets', 'pii'],
    applies: (doc) => customConnectors(doc).length > 0,
    agent_prompt: (doc) => `Custom connector scope: ${customConnectors(doc).map(describe).join('; ')}. Scaffold a custom app with Shopify CLI (never hand-roll the app structure), request the minimum access scopes, and declare webhook subscriptions in shopify.app.toml including the mandatory privacy compliance webhooks. Verify X-Shopify-Hmac-Sha256 on the raw request body with a timing-safe comparison before parsing. Process webhooks asynchronously through a queue, make handlers idempotent, reconcile with a scheduled full sync, and use bulk operations for large reads. Store secrets in the hosting platform's secret manager. Do not log personal data. Write a threat model and get Security Engineer review before deploying.`,
  },
];
