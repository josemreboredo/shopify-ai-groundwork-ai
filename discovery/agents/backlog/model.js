/**
 * @file model.js
 * @description Story model v2 for the Jira-ready backlog (implementation plan
 * Phase 4, ADR 0006). Stories live in discovery/agents/backlog/stories/<epic>.js as
 * definitions whose dynamic fields are functions of the engagement document.
 *
 * @module backlog/model
 */

/**
 * Epics — one component per epic in Jira. `prefix` builds stable story keys
 * (LWC-<prefix>-NNN); keys are never reused or renumbered.
 */
export const EPICS = [
  { id: 'foundation',   prefix: 'FND', name: 'Store foundation',               summary: 'Shopify Plus store set-up, users, apps baseline and environments.' },
  { id: 'theme',        prefix: 'THM', name: 'Storefront & theme',             summary: 'Horizon theme, brand tokens and page templates.' },
  { id: 'catalogue',    prefix: 'CAT', name: 'Catalogue & product data',       summary: 'Product model, metafields, collections, search and filters.' },
  { id: 'markets',      prefix: 'MKT', name: 'Markets & internationalisation', summary: 'Shopify Markets, currencies, languages, domains and duties.' },
  { id: 'checkout',     prefix: 'PAY', name: 'Payments & checkout',            summary: 'Payment providers, checkout configuration and extensions.' },
  { id: 'shipping',     prefix: 'SHP', name: 'Shipping, tax & returns',        summary: 'Delivery profiles, rates, tax set-up, returns and notifications.' },
  { id: 'retail',       prefix: 'RTL', name: 'Retail & POS',                  summary: 'Locations, Shopify POS, pickup in store, ship from store, in-store returns and stock across the estate.' },
  { id: 'customers',    prefix: 'CUS', name: 'Customers & B2B',                summary: 'Customer accounts, B2B companies, price lists and payment terms.' },
  { id: 'promotions',   prefix: 'PRM', name: 'Promotions & loyalty',           summary: 'Discounts, coupons, gift cards and loyalty programme.' },
  { id: 'marketing',    prefix: 'MKG', name: 'Marketing & analytics',          summary: 'SEO, tracking, email platform and reviews.' },
  { id: 'ai',           prefix: 'AI',  name: 'AI & agentic commerce',        summary: 'Selling inside AI assistants, Shopify Catalog readiness, crawler policy, the knowledge base and merchant AI tools.' },
  { id: 'integrations', prefix: 'INT', name: 'Integrations',                   summary: 'ERP, PIM, CRM, 3PL and other system connections.' },
  { id: 'migration',    prefix: 'MIG', name: 'Data migration',                 summary: 'Products, customers, orders, content and redirects from the current platform.' },
  { id: 'compliance',   prefix: 'CMP', name: 'Privacy & compliance',           summary: 'Cookie consent, legal pages, data-subject requests.' },
  { id: 'quality',      prefix: 'QA',  name: 'Quality, accessibility & performance', summary: 'Accessibility, Core Web Vitals, QA and UAT.' },
  { id: 'launch',       prefix: 'LCH', name: 'Launch & handover',              summary: 'Cut-over, go-live, training, SOPs and hypercare.' },
];

export const EPIC_IDS = EPICS.map((e) => e.id);

/** Allowed story point values (Fibonacci). */
export const POINTS = [1, 2, 3, 5, 8, 13];

export const GAIA_TIERS = ['T1', 'T2', 'T3', 'T4'];
export const PRIORITIES = ['Highest', 'High', 'Medium', 'Low'];
export const SECURITY_FLAGS = ['pii', 'payments', 'auth', 'webhook_hmac', 'secrets', 'production_store'];
export const OWNERS = ['consultant', 'agent', 'designer', 'developer', 'client'];

/** Definition of Done applied to every story (Gaia DoD, Shopify lens). */
export const DEFINITION_OF_DONE = [
  'Acceptance criteria met and demonstrated on the development store',
  'Consultant approved the plan before any store mutation (T2+)',
  'Theme Check / automated tests pass; no hard-coded brand values or secrets',
  'Works on mobile and desktop; WCAG 2.1 AA checks pass for changed UI',
  'Configuration or code documented for handover',
];

/**
 * @typedef {(doc: object) => any} Dyn
 *
 * @typedef {Object} StoryDefinition
 * @property {string}   key                 LWC-<PREFIX>-NNN, stable
 * @property {string}   epic                EPICS id
 * @property {string|Dyn} title             Short Jira summary
 * @property {string|Dyn} user_story        "As a …, I want …, so that …"
 * @property {string|Dyn} [description]
 * @property {string[]|Dyn} acceptance_criteria  Given / When / Then statements
 * @property {'T1'|'T2'|'T3'|'T4'} gaia_tier
 * @property {number}   points              One of POINTS
 * @property {'consultant'|'agent'|'designer'|'developer'|'client'} owner
 * @property {string[]} [depends_on]        Story keys
 * @property {string[]} spec_refs           Engagement JSON pointers ("*" for arrays) the story is based on
 * @property {string[]} [gates]             Scope gate ids this story delivers (labelled when active)
 * @property {string[]} [security_flags]
 * @property {string|Dyn} [priority]        Defaults to High (phase 1) / Low (deferred)
 * @property {boolean|Dyn} [deferred]       Later phase (default false)
 * @property {(doc: object) => boolean} applies
 * @property {string|Dyn} agent_prompt      Instructions for the build agent
 */

/**
 * @typedef {Object} Story
 * Materialised story — every dynamic field resolved for one engagement.
 * @property {string} key
 * @property {string} epic
 * @property {string} epic_name
 * @property {string} title
 * @property {string} user_story
 * @property {string} description
 * @property {string[]} acceptance_criteria
 * @property {string} gaia_tier
 * @property {number} points
 * @property {string} owner
 * @property {string[]} depends_on
 * @property {string[]} spec_refs
 * @property {string[]} security_flags
 * @property {string} priority
 * @property {boolean} deferred
 * @property {string[]} labels
 * @property {string} agent_prompt
 */
