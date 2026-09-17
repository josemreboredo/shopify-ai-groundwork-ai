/**
 * @file schema/index.js
 * @description Loaders and helpers for the engagement contract (ADR 0002):
 *   - engagement.schema.json — shape of one client engagement
 *   - question-bank.json     — every discovery question and where its answer lands
 *   - offering.json          — offers, scope gates, L triggers, modifiers, exit rules, app signals, routes
 *   - apps.json              — App Store registry (question-bank shopify.apps, approach shortlist)
 *
 * @module schema
 */

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Ajv2020 = require('ajv/dist/2020');

const load = (name) => JSON.parse(readFileSync(new URL(`./${name}`, import.meta.url), 'utf8'));

export const engagementSchema = load('engagement.schema.json');
export const questionBank     = load('question-bank.json');
export const offering         = load('offering.json');
export const apps             = load('apps.json');
const OPTION_LABELS            = load('option-labels.json').labels;

/** Acronyms and brand spellings for generated option labels. */
const WORDS = {
  b2b: 'B2B', b2c: 'B2C', dtc: 'DTC', pos: 'POS', erp: 'ERP', pim: 'PIM', crm: 'CRM', oms: 'OMS', wms: 'WMS', cdp: 'CDP', esp: 'ESP',
  api: 'API', url: 'URL', seo: 'SEO', sms: 'SMS', vip: 'VIP', sku: 'SKU', ai: 'AI', ui: 'UI', ux: 'UX', us: 'US', uk: 'UK', eu: 'EU',
  cn: 'CN', hk: 'HK', prc: 'PRC', icp: 'ICP', nmpa: 'NMPA', pipl: 'PIPL', cbec: 'CBEC', ddp: 'DDP', pci: 'PCI', sso: 'SSO', ach: 'ACH',
  kol: 'KOL', koc: 'KOC', cms: 'CMS', js: 'JavaScript', '3d': '3D', '3pl': '3PL', i18n: 'i18n', shopify: 'Shopify', paypal: 'PayPal',
  hydrogen: 'Hydrogen', flow: 'Flow', rfq: 'RFQ', gdpr: 'GDPR', ccpa: 'CCPA', qr: 'QR', faq: 'FAQ', csv: 'CSV',
};

/**
 * Readable label for an answer option code, e.g. "3pl_system" → "3PL system".
 *
 * @param {string|boolean|number} code
 * @returns {string}
 */
export function optionLabel(code) {
  if (typeof code !== 'string') return String(code);
  if (OPTION_LABELS[code]) return OPTION_LABELS[code];
  const text = code.split('_').map((w) => WORDS[w] ?? w).join(' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ─── Validation ───────────────────────────────────────────────────────────────

let compiled;

/**
 * Validate an engagement document against the schema.
 *
 * @param {unknown} doc
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateEngagement(doc) {
  compiled ??= new Ajv2020({ strict: true, allErrors: true }).compile(engagementSchema);
  const valid = compiled(doc);
  const errors = (compiled.errors ?? []).map(
    (e) => `${e.instancePath || '/'} ${e.message}${e.params?.additionalProperty ? ` (${e.params.additionalProperty})` : ''}`,
  );
  return { valid, errors };
}

// ─── Pointer resolution against the schema ────────────────────────────────────

/**
 * Follow a local "$ref" (only "#/$defs/<name>" is used in this schema).
 *
 * @param {object} node
 * @returns {object}
 */
function deref(node) {
  let current = node;
  while (current?.$ref) {
    const name = current.$ref.replace('#/$defs/', '');
    current = engagementSchema.$defs[name];
  }
  return current;
}

/**
 * Resolve a data pointer (e.g. "/markets/list/*\/languages", "*" = every array
 * item) to the schema node describing that value. Returns null when the pointer
 * does not exist in the schema.
 *
 * @param {string} pointer
 * @returns {object|null}
 */
export function schemaNodeAt(pointer) {
  const segments = pointer.split('/').slice(1);
  let node = deref(engagementSchema);

  for (const segment of segments) {
    if (!node) return null;
    if (segment === '*') {
      if (node.type !== 'array' || !node.items) return null;
      node = deref(node.items);
      continue;
    }
    const child = node.properties?.[segment];
    if (!child) return null;
    node = deref(child);
  }
  return node;
}

/** @param {string} name */
export const defNode = (name) => engagementSchema.$defs[name];

/**
 * Allowed values for an enum-like node (enum, or array of enum).
 *
 * @param {object} node
 * @returns {string[]|null}
 */
export function enumValues(node) {
  if (node?.enum) return node.enum;
  const items = node?.type === 'array' ? deref(node.items) : null;
  return items?.enum ?? null;
}

// ─── Offering references ──────────────────────────────────────────────────────

/**
 * All ids a question may reference in `feeds`, e.g. "gate:markets", "exit:11.3",
 * "app:returns_platform".
 *
 * @returns {Map<string, { kind: string, id: string, inputs: string[] }>}
 */
export function offeringReferences() {
  const refs = new Map();
  for (const g of offering.scope_gates) refs.set(`gate:${g.id}`, { kind: 'gate', id: g.id, inputs: g.inputs });
  for (const t of offering.l_triggers)  refs.set(`l_trigger:${t.id}`, { kind: 'l_trigger', id: t.id, inputs: t.inputs });
  for (const r of offering.exit_rules)  refs.set(`exit:${r.id}`, { kind: 'exit', id: r.id, inputs: r.inputs });
  for (const a of offering.app_signals) refs.set(`app:${a.id}`, { kind: 'app', id: a.id, inputs: a.inputs });
  return refs;
}

/**
 * Question ids that feed a given offering reference.
 *
 * @param {string} ref  e.g. "exit:11.3"
 * @returns {string[]}
 */
export function questionsFeeding(ref) {
  return questionBank.questions.filter((q) => q.feeds?.includes(ref)).map((q) => q.id);
}
