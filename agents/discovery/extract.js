/**
 * @file extract.js
 * @description LLM extraction: redacted questionnaire → engagement answers,
 * provenance, open items and exit-rule candidates. The model returns flat
 * { pointer, value_json } pairs; code assembles and validates them, with one
 * repair call when validation fails. Offer, gates and exits are computed in
 * code (classify.js, exits.js).
 *
 * @module discovery/extract
 */

import { questionBank, offering, schemaNodeAt } from '../../schema/index.js';
import { buildExtractionSchema, fieldCatalogue, COMPUTED_POINTERS } from './extraction-schema.js';

export class ExtractionInvalidError extends Error {
  /** @param {string[]} errors */
  constructor(errors) {
    super(`Extracted answers failed validation after one repair attempt:\n  • ${errors.slice(0, 15).join('\n  • ')}`);
    this.name = 'ExtractionInvalidError';
    this.errors = errors;
  }
}

function questionMapping() {
  return questionBank.questions.map((q) => `${q.id} [${q.audience}] → ${q.maps_to.join(', ')}`).join('\n');
}

export const EXTRACTION_SYSTEM = `You extract a completed Shopify discovery questionnaire into structured data for Merkle lead consultants.

Output
- answers: one { pointer, value_json } entry per answered field. pointer comes from the field catalogue below. value_json is the value as a JSON literal: "text" (quoted), 800, true, ["de", "fr"], {"min": 60000, "max": 80000, "currency": "EUR"}.
- For list fields ("array of { … }") give the whole array in one entry, e.g. pointer "/markets/list" with value_json [{"code":"CH","currency":"CHF","languages":["de","fr","it"],"price_strategy":"base_currency"}]. Inside objects, leave out unknown properties.
- Enum values must be copied exactly from the catalogue (underscores, lowercase).

How to extract
- Record only what the questionnaire says. When a question is blank, "TBC", "unknown" or "n/a", do not add an answer; add an open_items entry for required or recommended questions. Never guess.
- Every question is marked "**Q<id>**". The question mapping shows which fields each question fills.
- Ticked checkboxes are "- [x] option"; option labels use spaces where values use underscores ("custom ui" → "custom_ui").
- meta.client.slug is the client name in lowercase kebab-case ("ACME Watches SA" → "acme-watches").
- Money amounts are plain numbers (€60–80k → min 60000, max 80000, currency "EUR").
- "[redacted-…]" markers replace personal data. Leave those fields out.

Provenance
- One entry for each answer that feeds an offer decision or exit rule (see the question mapping and exit rules), and for every answer that is TBC or inferred. pointer uses numeric array indices where needed ("/markets/list/0/currency").
- source: "client" for client questions, "consultant" for [consultant] questions, "inferred" when derived from other answers. status: "tbc" when marked TBC or uncertain, else "confirmed".

Exit candidates
- Exit rules are evaluated in code from the answers. Add an exit_candidates entry only when free text clearly indicates a rule the structured fields cannot express (e.g. an industry description implying a regulated industry while that question is blank). Quote the evidence.

Field catalogue (pointer — type)
${fieldCatalogue().join('\n')}

Question mapping (question id [audience] → fields)
${questionMapping()}

Exit rules
${offering.exit_rules.map((r) => `${r.id} ${r.result}: ${r.condition}`).join('\n')}`;

/**
 * Convert a data pointer with numeric indices to a schema pointer ("*").
 *
 * @param {string} pointer
 */
export const toSchemaPointer = (pointer) => pointer.replace(/\/\d+(?=\/|$)/g, '/*');

/** @param {string} pointer */
const isComputed = (pointer) => COMPUTED_POINTERS.some((c) => pointer === c || pointer.startsWith(`${c}/`));

/**
 * Assemble answer pairs into a nested object.
 *
 * @param {{ pointer: string, value_json: string }[]} pairs
 * @returns {{ answers: object, errors: string[] }}
 */
export function assembleAnswers(pairs) {
  const answers = {};
  const errors = [];

  for (const { pointer, value_json } of pairs) {
    if (!/^(\/[^/]+)+$/.test(pointer) || !schemaNodeAt(toSchemaPointer(pointer))) {
      errors.push(`${pointer}: not a field in the catalogue`);
      continue;
    }
    if (isComputed(pointer)) {
      errors.push(`${pointer}: computed by the engine — do not extract`);
      continue;
    }
    let value;
    try {
      value = JSON.parse(value_json);
    } catch {
      errors.push(`${pointer}: value_json is not valid JSON`);
      continue;
    }
    if (value === null) continue;

    const segments = pointer.split('/').slice(1);
    let target = answers;
    for (let i = 0; i < segments.length - 1; i++) {
      const key = segments[i];
      const nextIsIndex = /^\d+$/.test(segments[i + 1]);
      target[key] ??= nextIsIndex ? [] : {};
      target = target[key];
    }
    target[segments.at(-1)] = value;
  }
  return { answers, errors };
}

/**
 * Flatten answers into { pointer, value_json } pairs (inverse of assembleAnswers):
 * objects are walked, arrays and scalars become values. Used to replay recorded
 * engagements in tests.
 *
 * @param {object} answers
 * @returns {{ pointer: string, value_json: string }[]}
 */
export function flattenAnswers(answers) {
  const pairs = [];
  const walk = (pointer, value) => {
    const node = schemaNodeAt(toSchemaPointer(pointer));
    const isLeafObject = node && (node.required?.includes('amount') || node.required?.includes('currency'));
    if (value && typeof value === 'object' && !Array.isArray(value) && !isLeafObject) {
      for (const [k, v] of Object.entries(value)) walk(`${pointer}/${k}`, v);
    } else {
      pairs.push({ pointer, value_json: JSON.stringify(value) });
    }
  };
  for (const [k, v] of Object.entries(answers)) walk(`/${k}`, v);
  return pairs;
}

/**
 * @param {{ callStructured: Function }} llm
 * @param {string} user
 */
async function call(llm, user) {
  return llm.callStructured({ system: EXTRACTION_SYSTEM, user, schema: buildExtractionSchema() });
}

/**
 * Run extraction, validating with `validate` and repairing once on errors.
 *
 * @param {{ callStructured: Function }} llm
 * @param {string} redactedQuestionnaire
 * @param {(answers: object) => string[]} validate  Returns schema errors for assembled answers
 * @param {(step: string, detail?: unknown) => void} [onStep]  Progress callback
 * @returns {Promise<{ answers: object, provenance: object, openItems: object[], exitCandidates: object[], model: string, repaired: boolean }>}
 */
export async function extractAnswers(llm, redactedQuestionnaire, validate, onStep = () => {}) {
  const base = `Completed questionnaire:\n\n${redactedQuestionnaire}`;
  onStep('extraction');
  let { data, model } = await call(llm, base);
  let { answers, errors } = assembleAnswers(data.answers ?? []);
  errors = errors.length ? errors : validate(answers);
  let repaired = false;

  if (errors.length) {
    repaired = true;
    onStep('repair', errors.length);
    const repairPrompt = `${base}\n\n---\nYour previous extraction had these problems:\n${errors.map((e) => `- ${e}`).join('\n')}\n\n` +
      `Previous answers:\n${JSON.stringify(data.answers)}\n\nReturn the complete corrected extraction.`;
    ({ data, model } = await call(llm, repairPrompt));
    ({ answers, errors } = assembleAnswers(data.answers ?? []));
    errors = errors.length ? errors : validate(answers);
    if (errors.length) throw new ExtractionInvalidError(errors);
  }

  const provenance = {};
  for (const { pointer, source, status, question_id, note } of data.provenance ?? []) {
    if (!schemaNodeAt(toSchemaPointer(pointer)) || isComputed(pointer)) continue;
    provenance[pointer] = {
      source,
      status,
      ...(/^Q\d+\.\d+\.\d+$/.test(question_id) ? { question_id } : {}),
      ...(note ? { note } : {}),
    };
  }
  const openItems = (data.open_items ?? [])
    .filter((i) => schemaNodeAt(toSchemaPointer(i.pointer)))
    .map(({ pointer, question_id, why }) => ({ pointer, why, ...(/^Q\d+\.\d+\.\d+$/.test(question_id) ? { question_id } : {}) }));

  return { answers, provenance, openItems, exitCandidates: data.exit_candidates ?? [], model, repaired };
}
