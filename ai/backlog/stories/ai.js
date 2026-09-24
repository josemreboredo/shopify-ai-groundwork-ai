/**
 * @file ai.js — epic "AI & agentic commerce" (LWC-AI-*)
 *
 * Thirteen questions in the bank and a 2,200-word verified reference chapter,
 * and not one story delivering any of it. The questionnaire already defines the
 * scope; these stories are that scope, in the order a project does it.
 *
 * Two facts shape every story here, both from the chapter and both easy to get
 * wrong in a room:
 *  - Agentic selling is a commercial and legal decision before it is a build.
 *    Supplemental Terms have to be accepted by someone with authority, and
 *    direct-checkout channels receive the customer's name, email, phone and
 *    address, which has to agree with the client's own privacy notice.
 *  - Blocking AI crawlers in robots.txt is advisory and affects open-web
 *    discoverability only. It does not stop Shopify Catalog syndicating product
 *    data to the agentic storefronts the merchant has activated. Clients assume
 *    the opposite.
 */

import { list, listOr, storeName } from './helpers.js';

const ai = (doc) => doc.ai ?? {};
const sellsThroughAgents = (doc) => ai(doc).sell_through_agents === true;
const set = (doc, key) => { const v = ai(doc)[key]; return v && v !== 'not_sure' ? v : null; };
const tools = (doc) => (ai(doc).merchant_ai_tools ?? []).filter((t) => t !== 'none' && t !== 'not_sure');
/** Anything recorded in this area at all — the epic is opt-in, like the answers. */
const inScope = (doc) => sellsThroughAgents(doc)
  || Boolean(set(doc, 'agentic_enrolment') || set(doc, 'crawler_policy') || set(doc, 'own_agent_surface'))
  || ai(doc).knowledge_base === true
  || tools(doc).length > 0;

/** @type {import('../model.js').StoryDefinition[]} */
export default [
  {
    key: 'LWC-AI-001',
    epic: 'ai',
    title: 'Decide and record the agentic commerce position',
    user_story: 'As the business owner, I want a written decision about selling inside AI assistants, so that nobody discovers the terms or the data sharing after we are already enrolled.',
    description: (doc) => `Enrolment: ${set(doc, 'agentic_enrolment') ?? 'to confirm'}. Direct checkout: ${set(doc, 'direct_checkout') ?? 'to confirm'}. Customer data sharing: ${ai(doc).customer_data_sharing ?? 'to confirm'}. Terms owner: ${ai(doc).terms_owner ?? 'to confirm'}.`,
    acceptance_criteria: (doc) => [
      `Given the enrolment choice (${set(doc, 'agentic_enrolment') ?? 'to confirm'}), when it is set in the admin, then it matches the decision on record and not the default`,
      'Given Shopify’s Supplemental Terms, when they are accepted, then the person who accepted them held the authority to, and that is recorded',
      ...(set(doc, 'direct_checkout') && set(doc, 'direct_checkout') !== 'off' ? [
        'Given direct checkout, when a channel is activated, then the customer name, email, phone and address it receives are reconciled with the client’s own privacy notice before go-live',
      ] : []),
      'Given the policy pages, when the store is reviewed for eligibility, then Terms of service, Privacy policy and Return and refund policy are complete and published',
      ...(ai(doc).us_buyers === false ? ['Given that the business does not sell to buyers in the United States, when channels are reviewed, then the ones limited to US buyers are excluded from scope and said so in writing'] : []),
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'consultant',
    depends_on: ['LWC-FND-001'],
    spec_refs: ['/ai/sell_through_agents', '/ai/agentic_enrolment', '/ai/direct_checkout', '/ai/customer_data_sharing', '/ai/terms_owner', '/ai/us_buyers'],
    security_flags: ['pii'],
    applies: inScope,
    agent_prompt: (doc) => `Write the agentic commerce decision record for ${storeName(doc)}: enrolment (${set(doc, 'agentic_enrolment') ?? 'to confirm'}), direct checkout (${set(doc, 'direct_checkout') ?? 'to confirm'}), and who accepts Shopify's Supplemental Terms (${ai(doc).terms_owner ?? 'to confirm — a role, never a name'}). Check the three policy pages are complete and published, because eligibility depends on them. Where direct checkout is on, list exactly which customer fields the channel receives and have the client's privacy owner confirm the privacy notice already covers it. Do not enrol anything before the decision is signed.`,
  },
  {
    key: 'LWC-AI-002',
    epic: 'ai',
    title: 'Get the product data to Shopify Catalog standard',
    user_story: 'As a merchandiser, I want our products to meet the Catalog requirements, so that assistants show them correctly rather than skipping them.',
    acceptance_criteria: (doc) => [
      'Given the Catalog requirements, when the catalogue is audited, then every product intended for agentic channels has a title, at least one image, a price above zero and a published product URL, is neither unlisted nor hidden from search engines, and the ones that fail are listed with an owner',
      ...(ai(doc).catalog_mapping_needed ? [
        'Given product data held in metafields, metaobjects or inside product titles, when Catalog Mapping is configured, then those attributes reach the Catalog as structured fields rather than as prose',
      ] : []),
      'Given the audit result, when it is handed over, then the client knows how many products are not eligible and what each one is missing',
    ],
    gaia_tier: 'T2',
    points: 5,
    owner: 'agent',
    depends_on: ['LWC-AI-001', 'LWC-CAT-001'],
    spec_refs: ['/ai/catalog_readiness', '/ai/catalog_mapping_needed', '/catalogue/custom_attributes'],
    gates: ['agentic_commerce'],
    applies: (doc) => inScope(doc) && sellsThroughAgents(doc),
    agent_prompt: (doc) => `Audit the catalogue against Shopify Catalog requirements (a title, at least one image, a price above zero, published with a product URL, not unlisted and not hidden from search engines). Current readiness per the client: ${set(doc, 'catalog_readiness') ?? 'to confirm'}. Produce a list of ineligible products and what each is missing, with a named owner for fixing it.${ai(doc).catalog_mapping_needed ? ' Key attributes sit in custom fields, so configure Catalog Mapping so they arrive as structured data rather than buried in the title.' : ''} Report counts, not a sample.`,
  },
  {
    key: 'LWC-AI-003',
    scope: 'Set the AI crawler policy',
    epic: 'ai',
    title: (doc) => `Set the AI crawler policy (${set(doc, 'crawler_policy') ?? 'to confirm'})`,
    user_story: 'As the business owner, I want a deliberate position on AI crawlers, so that our content is used on our terms and everyone knows what that choice does and does not do.',
    acceptance_criteria: (doc) => [
      `Given the agreed policy (${set(doc, 'crawler_policy') ?? 'to confirm'}), when robots.txt.liquid is edited, then it carries exactly the directives that policy asks for and nothing else`,
      'Given the edit, when it is reviewed, then the client has been told in writing that robots rules are directional and advisory and not every crawler follows them',
      'Given a decision to block, when it is explained, then the client understands it affects open-web discoverability only and does not stop Shopify Catalog sending product data to channels they have activated',
      'Given the change, when it is deployed, then /robots.txt is fetched and checked on the live domain, because an incorrect rule here can cost all traffic',
      ...(set(doc, 'crawler_policy') === 'selective' ? ['Given a selective policy, when it is configured, then each allowed and each blocked user agent is listed with the reason it is on that list'] : []),
    ],
    gaia_tier: 'T3',
    points: 3,
    owner: 'developer',
    depends_on: ['LWC-AI-001'],
    spec_refs: ['/ai/crawler_policy', '/marketing/seo/priority_channel'],
    applies: (doc) => inScope(doc) && Boolean(set(doc, 'crawler_policy')),
    agent_prompt: (doc) => `Implement the ${set(doc, 'crawler_policy') ?? 'agreed'} AI crawler policy in robots.txt.liquid. Shopify treats this as an unsupported customisation and incorrect use can lose all traffic, so change only what the policy requires, review the rendered /robots.txt before and after, and verify on the live domain. Also review /agents.md, /llms.txt and /llms-full.txt and agree whether they are left at Shopify's defaults or customised. Put in writing for the client that these rules are advisory and that they do not affect Shopify Catalog syndication to activated channels.`,
  },
  {
    key: 'LWC-AI-004',
    epic: 'ai',
    title: 'Control the answers assistants give about the store',
    user_story: 'As a customer-service lead, I want assistants answering questions about shipping and returns from our own words, so that shoppers are not told something we do not do.',
    acceptance_criteria: [
      'Given the questions customers actually ask about delivery, returns, sizing and stock, when the knowledge base is published, then each has an answer written by the client and approved by whoever owns that policy',
      'Given a policy change, when it is made, then the owner of the knowledge base is named and knows the answer has to change with it',
      'Given an assistant answering about the store, when the answers are spot-checked before launch, then they match the published policies rather than an older version of them',
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'consultant',
    depends_on: ['LWC-AI-001'],
    spec_refs: ['/ai/knowledge_base', '/shipping/returns', '/compliance/legal_pages_status'],
    gates: ['agentic_commerce'],
    applies: (doc) => inScope(doc) && ai(doc).knowledge_base === true,
    agent_prompt: () => 'Set up the Knowledge Base as the trusted source for agent answers. Draft FAQs from the real shipping, returns and warranty policies rather than from the site copy, have the policy owner approve each, and publish. Name the owner who keeps them true when a policy changes, and spot-check the answers assistants give before launch.',
  },
  {
    key: 'LWC-AI-005',
    epic: 'ai',
    title: (doc) => `Enable the Shopify AI tools the team will use${tools(doc).length ? `: ${list(tools(doc).map((t) => t.replace(/_/g, ' ')))}` : ''}`,
    user_story: 'As a merchandiser, I want the admin AI tools set up and understood, so that the team uses them on purpose rather than discovering them by accident.',
    acceptance_criteria: (doc) => [
      `Given the tools in scope (${listOr(tools(doc).map((t) => t.replace(/_/g, ' ')), 'to confirm')}), when they are enabled, then each has a named owner and the team has seen it used on this store's own data`,
      ...(tools(doc).includes('semantic_search') ? ['Given semantic search, when it is enabled, then the store is on a plan that supports it and the catalogue is within the product limit, and both are checked rather than assumed'] : []),
      'Given the tools, when they are handed over, then the client knows which ones generate customer-facing text and who approves it before it is published',
    ],
    gaia_tier: 'T1',
    points: 2,
    owner: 'consultant',
    depends_on: ['LWC-FND-001'],
    spec_refs: ['/ai/merchant_ai_tools', '/shopify/target_plan'],
    applies: (doc) => tools(doc).length > 0,
    agent_prompt: (doc) => `Enable and demonstrate ${listOr(tools(doc).map((t) => t.replace(/_/g, ' ')), 'the agreed Shopify AI tools')} on the build store with the client's own products. Check plan and catalogue eligibility where the tool needs it rather than assuming. Agree who approves anything customer-facing that a tool generates, and include the tools in the training pack.`,
  },
  {
    key: 'LWC-AI-006',
    epic: 'ai',
    title: 'Scope the store’s own agent surface',
    user_story: 'As the business owner, I want to know what exposing our own agent would take, so that the decision is costed rather than assumed into a later phase.',
    acceptance_criteria: (doc) => [
      `Given the client's intent (${set(doc, 'own_agent_surface') ?? 'to confirm'}), when the surface is scoped, then what it exposes, to whom and under what authentication is written down`,
      'Given the scope, when it is reviewed, then it says plainly which parts are available today and which depend on something not yet generally available',
      'Given the estimate, when it is presented, then it is a separate decision with its own cost rather than a line folded into this project',
    ],
    gaia_tier: 'T3',
    points: 3,
    owner: 'consultant',
    depends_on: ['LWC-AI-001'],
    spec_refs: ['/ai/own_agent_surface'],
    applies: (doc) => inScope(doc) && ['now', 'later'].includes(set(doc, 'own_agent_surface')),
    agent_prompt: (doc) => `Scope the store's own agent or MCP surface for ${storeName(doc)}: what it exposes, who may call it, how it authenticates and what it costs to run. Mark clearly anything that is pre-GA or unconfirmed rather than presenting it as available. Intent on record: ${set(doc, 'own_agent_surface') ?? 'to confirm'}. Present it as its own decision with its own price.`,
  },
  {
    /* The advanced tier of the agentic commerce add-on: the store's own
       assistant, built once the scope in LWC-AI-006 is agreed. */
    key: 'LWC-AI-007',
    epic: 'ai',
    title: 'Build the store’s own shopping assistant on its Storefront MCP endpoint',
    user_story: 'As a shopper, I want to ask the store for what I need in my own words, so that I find the right product and can buy it without searching page by page.',
    acceptance_criteria: [
      'Given the scope agreed in LWC-AI-006, when the assistant is built, then it searches the catalogue, manages the cart and answers policy questions through the store’s Storefront MCP endpoint and reaches nothing else',
      'Given a shopper’s personal data, when the assistant would send it to a model, then it asks for consent first and the request is logged without the data',
      'Given the evaluation set of questions the brand agreed, when the assistant is released, then every answer is checked against it and a wrong price, stock or policy answer blocks the release',
    ],
    gaia_tier: 'T3',
    points: 13,
    owner: 'developer',
    depends_on: ['LWC-AI-006'],
    spec_refs: ['/ai/own_agent_surface'],
    security_flags: ['pii', 'secrets'],
    gates: ['agentic_commerce'],
    applies: (doc) => inScope(doc) && set(doc, 'own_agent_surface') === 'now',
    agent_prompt: (doc) => `Build ${storeName(doc)}'s own shopping assistant on the store's Storefront MCP endpoint (https://{shop}.myshopify.com/api/mcp; catalogue search on /api/ucp/mcp): catalogue search, cart and the store's policies, nothing else. Design the conversation with the experience designer, agree an evaluation set of questions with the brand and block a release on any wrong price, stock or policy answer. Ask for consent before any shopper data reaches a model, and never log it. Name the model's running cost as the client's. The Universal Cart API is early access: scope it, do not promise it.`,
  },
];
