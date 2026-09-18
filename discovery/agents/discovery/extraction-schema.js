/**
 * @file extraction-schema.js
 * @description Output schemas for Claude's structured outputs, plus the field
 * catalogue that tells the model which answer fields exist.
 *
 * The API limits structured-output schemas to 24 optional parameters in total,
 * and does not enforce patterns, numeric limits or map-shaped objects. The
 * engagement schema has ~250 optional fields, so the model never receives it:
 *   - extraction returns a flat list of { pointer, value_json } pairs that code
 *     assembles and validates against the full schema (with one repair call);
 *   - approach uses an explicit schema where every field is required and
 *     "empty" sentinels are removed in code.
 *
 * @module discovery/extraction-schema
 */

import { engagementSchema, offering } from '../../schema/index.js';

/** Structured-output limit on optional (non-required) properties across a schema. */
export const MAX_OPTIONAL_PARAMETERS = 24;

/** Top-level fields the engine computes — never extracted. */
export const COMPUTED_POINTERS = ['/schema_version', '/offer', '/exits', '/approach', '/provenance', '/notes', '/meta/source', '/delivery/go', '/markets/topology', '/markets/cross_border_model'];

// ─── Extraction ───────────────────────────────────────────────────────────────

/** @returns {object} */
export function buildExtractionSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['answers', 'provenance', 'exit_candidates', 'open_items'],
    properties: {
      answers: {
        type: 'array',
        description: 'One entry per answered field. Omit unanswered, TBC and unknown fields.',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['pointer', 'value_json'],
          properties: {
            pointer: { type: 'string', description: 'JSON pointer from the field catalogue, e.g. "/catalogue/sku_count" or "/markets/list".' },
            value_json: { type: 'string', description: 'The value as a JSON literal: "text" in quotes, 800, true, ["de","fr"], or an array of objects for list fields.' },
          },
        },
      },
      provenance: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['pointer', 'source', 'status', 'question_id', 'note'],
          properties: {
            pointer: { type: 'string' },
            source: { enum: ['client', 'consultant', 'inferred'] },
            status: { enum: ['confirmed', 'tbc'] },
            question_id: { type: 'string', description: 'Question id such as Q3.1.1' },
            note: { type: 'string', description: 'Short caveat, or "" if none' },
          },
        },
      },
      exit_candidates: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['rule_id', 'evidence'],
          properties: {
            rule_id: { enum: offering.exit_rules.map((r) => r.id) },
            evidence: { type: 'string' },
          },
        },
      },
      open_items: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['pointer', 'question_id', 'why'],
          properties: {
            pointer: { type: 'string' },
            question_id: { type: 'string' },
            why: { type: 'string' },
          },
        },
      },
    },
  };
}

// ─── Approach ─────────────────────────────────────────────────────────────────

const GAIA_TIERS = ['T1', 'T2', 'T3', 'T4'];

/** @returns {object} */
export function buildApproachSchema() {
  const obj = (properties, optional = []) => ({
    type: 'object', additionalProperties: false,
    required: Object.keys(properties).filter((k) => !optional.includes(k)),
    properties,
  });
  const str = (description) => (description ? { type: 'string', description } : { type: 'string' });
  const sources = (description) => ({ type: 'array', items: { type: 'string' }, description });

  return obj({
    capability_map: {
      type: 'array',
      items: obj({
        requirement: str(),
        client_requirement: str('The requirement in the client\'s own words, quoted from the answer; "" if the answer has no usable wording'),
        resolution: { enum: ['native', 'app', 'theme', 'custom'] },
        tool: str('Shopify feature, app or approach; "" if none'),
        why_this_level: str('Why this level and not a cheaper one (native → app → theme → custom); required for app, theme and custom'),
        limits: str('Documented limits, plan requirements or licence implications; "" if none'),
        gaia_tier: { enum: GAIA_TIERS },
        notes: str('"" if none'),
        question_ids: { type: 'array', items: str(), description: 'Client answers this requirement comes from (at least one)' },
        sources: sources('Official Shopify documentation or App Store listings for the resolution (at least one)'),
      }),
    },
    architecture_decisions: {
      type: 'array',
      description: 'At least three: the architecture choices that shape the project (e.g. Markets vs expansion stores, theme vs headless, native B2B vs app, order routing, integration pattern, checkout extensibility, Functions)',
      items: obj({
        topic: str(),
        question: str('The decision to make, in one sentence'),
        options: { type: 'array', description: 'At least two options considered', items: obj({ option: str(), pros: str(), cons: str() }) },
        decision: str('The recommended option'),
        rationale: str('Why, referring to the client answers and the sources'),
        plan_impact: { enum: ['none', 'basic', 'grow', 'advanced', 'plus'] },
        status: { enum: ['recommended', 'to_validate_in_discovery'] },
        sources: sources('Official Shopify documentation the decision relies on (at least one)'),
        question_ids: { type: 'array', items: str(), description: 'Client answers the decision is founded on (at least one)' },
        why_not: {
          type: 'array',
          description: 'Options weighed and not taken, with the reason. Required for the "Market topology" decision.',
          items: obj({ option: str(), reason: str('Why this option was not taken, on this engagement\'s facts') }),
        },
        impact: {
          type: 'object',
          description: 'What the decision changes, per audience. Required for the "Market topology" decision.',
          properties: {
            technical: str('What it changes in the build and the platform'),
            project: str('What it changes for the plan, the timeline and the cost of delivery'),
            merchant: str('What it changes for the client\'s team day to day'),
            customer: str('What it changes for the shopper'),
          },
          required: ['technical', 'project', 'merchant', 'customer'],
          additionalProperties: false,
        },
      }, ['why_not', 'impact']),
    },
    integration_architecture: {
      type: 'array',
      description: 'One entry per system in the engagement integrations',
      items: obj({
        system: str('Exactly as named in the engagement integrations'),
        system_of_record_for: { type: 'array', items: str() },
        pattern: { enum: ['native_app', 'ipaas', 'custom_app', 'event_driven_middleware', 'file_batch', 'manual'] },
        direction: { enum: ['into_shopify', 'out_of_shopify', 'both_ways'] },
        frequency: { enum: ['realtime', 'near_realtime', 'scheduled_batch', 'manual'] },
        shopify_apis: { type: 'array', items: str(), description: 'e.g. Admin GraphQL API, webhooks, bulk operations, Customer Account API' },
        error_handling: str('Retries, reconciliation, alerting'),
        sources: sources('Shopify API documentation for the pattern (at least one)'),
        question_ids: { type: 'array', items: str() },
      }),
    },
    data_model: {
      type: 'array',
      items: obj({
        object: { enum: ['product', 'variant', 'collection', 'customer', 'company', 'company_location', 'order', 'market', 'metaobject', 'other'] },
        kind: { enum: ['native_field', 'metafield', 'metaobject', 'app_data'] },
        name: str(),
        purpose: str(),
        source_system: str('"" when maintained in Shopify'),
        sources: sources('Shopify documentation (at least one)'),
      }),
    },
    non_functional: {
      type: 'array',
      description: 'At least three areas relevant to the client (performance, security_pci, privacy, accessibility, seo_migration, availability, observability, localisation)',
      items: obj({
        area: { enum: ['performance', 'security_pci', 'privacy', 'accessibility', 'seo_migration', 'availability', 'observability', 'localisation', 'other'] },
        requirement: str(),
        approach: str(),
        sources: sources('Official documentation or standards (at least one)'),
      }),
    },
    risk_register: {
      type: 'array',
      description: 'At least three delivery risks founded on evidence',
      items: obj({
        risk: str(),
        likelihood: { enum: ['low', 'medium', 'high'] },
        impact: { enum: ['low', 'medium', 'high'] },
        mitigation: str(),
        owner: { enum: ['merkle', 'client', 'shared'] },
        evidence: { type: 'array', items: str(), description: 'Question ids (e.g. Q8.2.3) or exit rules (e.g. 11.14) the risk is founded on (at least one)' },
      }),
    },
    app_shortlist: {
      type: 'array',
      items: obj({
        name: str(),
        url: str('App Store URL or ""'),
        requirement: str(),
        rationale: str('"" for rejected apps'),
        limitations: str('"" if none'),
        cost_amount: { type: 'number', description: 'List price; -1 if unknown' },
        cost_currency: str('ISO currency such as USD, or ""'),
        cost_period: { enum: ['month', 'year', 'one_off', 'usage', 'unknown'] },
        cost_note: str('"" if none'),
        integration_complexity: { enum: ['none', 'config_only', 'theme_edit', 'custom'] },
        gaia_tier: { enum: GAIA_TIERS },
        recommended: { type: 'boolean' },
        rejection_reason: str('"" for recommended apps'),
      }),
    },
    assumptions: {
      type: 'array',
      items: obj({ statement: str(), impact_if_wrong: str('"" if none') }),
    },
    phases: {
      type: 'array',
      items: obj({
        name: str(),
        sprints: {
          type: 'array',
          items: obj({
            name: str(),
            tasks: {
              type: 'array',
              items: obj({
                title: str(),
                capability: { enum: ['native', 'app', 'theme', 'custom', 'none'] },
                gaia_tier: { enum: GAIA_TIERS },
                owner: { enum: ['consultant', 'agent', 'designer', 'developer', 'client'] },
                deferred: { type: 'boolean' },
              }),
            },
          }),
        },
      }),
    },
  });
}

// ─── Schema introspection ─────────────────────────────────────────────────────

/**
 * Count optional (non-required) properties across a schema, as the API does.
 *
 * @param {unknown} node
 * @returns {number}
 */
export function countOptionalParameters(node) {
  if (Array.isArray(node)) return node.reduce((n, child) => n + countOptionalParameters(child), 0);
  if (!node || typeof node !== 'object') return 0;
  let count = 0;
  if (node.properties) {
    const required = new Set(node.required ?? []);
    count += Object.keys(node.properties).filter((k) => !required.has(k)).length;
  }
  for (const value of Object.values(node)) count += countOptionalParameters(value);
  return count;
}

const DEF_HINTS = {
  slug: 'kebab-case slug',
  country: 'ISO 3166-1 alpha-2, e.g. "CH"',
  currency: 'ISO 4217, e.g. "EUR"',
  language: 'ISO 639-1 lowercase, e.g. "de"',
  date: 'date "YYYY-MM-DD"',
  pointer: 'JSON pointer',
  question_id: 'question id, e.g. "Q3.1.1"',
  strings: 'array of strings',
};

/** @param {object} node */
function deref(node) {
  let current = node;
  let name = null;
  while (current?.$ref) {
    name = current.$ref.replace('#/$defs/', '');
    current = engagementSchema.$defs[name];
  }
  return { node: current, name };
}

/**
 * Short type description of a schema node for the field catalogue.
 *
 * @param {object} raw
 * @returns {string}
 */
function describe(raw) {
  const { node, name } = deref(raw);
  if (name && DEF_HINTS[name]) return DEF_HINTS[name];
  if (node.enum) return `one of ${node.enum.join(' | ')}`;
  if (node.const) return `"${node.const}"`;
  if (node.type === 'array') {
    const { node: item } = deref(node.items);
    if (item.type === 'object') return `array of { ${Object.entries(item.properties).map(([k, v]) => `${k}: ${describe(v)}`).join('; ')} }`;
    return `array of (${describe(node.items)})`;
  }
  if (node.type === 'object') return `{ ${Object.entries(node.properties).map(([k, v]) => `${k}: ${describe(v)}`).join('; ')} }`;
  return node.type;
}

/**
 * Catalogue of extractable fields: leaf pointers, and arrays as single values.
 *
 * @returns {string[]}  lines "pointer — type"
 */
export function fieldCatalogue() {
  const lines = [];
  const walk = (pointer, raw) => {
    if (COMPUTED_POINTERS.includes(pointer)) return;
    const { node, name } = deref(raw);
    if (node.type === 'object' && node.properties && !(name && DEF_HINTS[name]) && name !== 'money' && name !== 'money_range') {
      for (const [key, child] of Object.entries(node.properties)) walk(`${pointer}/${key}`, child);
      return;
    }
    lines.push(`${pointer} — ${describe(raw)}`);
  };
  for (const [key, child] of Object.entries(engagementSchema.properties)) walk(`/${key}`, child);
  return lines;
}
