/**
 * @file extraction-schema.js
 * @description Derives the JSON schemas sent to Claude's structured outputs
 * from schema/engagement.schema.json. Structured outputs do not support
 * numeric/string constraints, pattern, uniqueItems, propertyNames, if/then or
 * map-style objects, so those are removed here (patterns become description
 * hints) and the full schema is re-validated locally with ajv afterwards.
 *
 * @module discovery/extraction-schema
 */

import { engagementSchema, offering } from '../../schema/index.js';

const UNSUPPORTED = ['minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf',
  'minLength', 'maxLength', 'uniqueItems', 'maxItems', 'propertyNames', 'if', 'then', 'else'];

/**
 * Recursively strip keywords structured outputs cannot enforce.
 *
 * @param {unknown} node
 * @returns {unknown}
 */
export function toStructuredOutputSchema(node) {
  if (Array.isArray(node)) return node.map(toStructuredOutputSchema);
  if (!node || typeof node !== 'object') return node;

  const out = {};
  for (const [key, value] of Object.entries(node)) {
    if (UNSUPPORTED.includes(key) || key === '$schema' || key === '$id') continue;
    if (key === 'minItems' && value > 1) continue;
    if (key === 'pattern') continue;
    out[key] = key === 'properties' || key === '$defs'
      ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toStructuredOutputSchema(v)]))
      : toStructuredOutputSchema(value);
  }
  if (typeof node.pattern === 'string') {
    out.description = [node.description, `Must match ${node.pattern}`].filter(Boolean).join(' ');
  }
  return out;
}

/** Fields the engine computes — never requested from the model. */
const COMPUTED_TOP_LEVEL = ['schema_version', 'offer', 'exits', 'approach', 'provenance', 'notes'];

/**
 * Schema for the extraction call: answers + provenance (as an array) +
 * exit-rule candidates + open items.
 *
 * @returns {object}
 */
export function buildExtractionSchema() {
  const answers = structuredClone(engagementSchema);
  delete answers.$defs;
  for (const key of COMPUTED_TOP_LEVEL) delete answers.properties[key];
  answers.required = ['meta'];

  delete answers.properties.meta.properties.source;
  answers.properties.meta.required = ['client'];
  delete answers.properties.delivery.properties.go;

  const provenanceEntry = engagementSchema.properties.provenance.additionalProperties;
  const openItem = engagementSchema.properties.approach.properties.risks.properties.open_items.items;

  const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['answers', 'provenance', 'exit_candidates', 'open_items'],
    properties: {
      answers: {
        ...answers,
        description: 'Answers extracted from the questionnaire. Omit any field that was not answered, is TBC, or is unknown.',
      },
      provenance: {
        type: 'array',
        description: 'One entry per extracted answer: JSON pointer into answers (array indices as numbers), who gave it, whether it is confirmed.',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['pointer', ...provenanceEntry.required],
          properties: { pointer: { $ref: '#/$defs/pointer' }, ...provenanceEntry.properties },
        },
      },
      exit_candidates: {
        type: 'array',
        description: 'Exit rules the answers indicate but the structured fields cannot express. Leave empty when unsure.',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['rule_id', 'evidence'],
          properties: {
            rule_id: { enum: offering.exit_rules.map((r) => r.id) },
            evidence: { type: 'string', description: 'Quote the questionnaire answer that supports this rule.' },
          },
        },
      },
      open_items: {
        type: 'array',
        description: 'Required or recommended questions left blank or TBC.',
        items: openItem,
      },
    },
    $defs: engagementSchema.$defs,
  };

  return toStructuredOutputSchema(schema);
}

/**
 * Schema for the approach call (capability map, app shortlist, assumptions, phases).
 *
 * @returns {object}
 */
export function buildApproachSchema() {
  const approach = structuredClone(engagementSchema.properties.approach);
  approach.properties.risks = {
    type: 'object',
    additionalProperties: false,
    required: ['assumptions'],
    properties: { assumptions: approach.properties.risks.properties.assumptions },
  };
  approach.required = ['capability_map', 'app_shortlist', 'risks', 'phases'];
  return toStructuredOutputSchema({ ...approach, $defs: engagementSchema.$defs });
}
