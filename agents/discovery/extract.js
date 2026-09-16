/**
 * @file extract.js
 * @description LLM extraction: redacted questionnaire → engagement answers,
 * provenance, open items and exit-rule candidates. The model only extracts;
 * offer, gates and exits are computed in code (classify.js, exits.js).
 *
 * @module discovery/extract
 */

import { questionBank, offering, schemaNodeAt } from '../../schema/index.js';
import { buildExtractionSchema } from './extraction-schema.js';

/** Question id → pointers table, kept compact for the (cached) system prompt. */
function questionMapping() {
  return questionBank.questions
    .map((q) => `${q.id} [${q.audience}] ${q.maps_to.join(', ')}`)
    .join('\n');
}

function exitRuleList() {
  return offering.exit_rules.map((r) => `${r.id} ${r.result}: ${r.condition}`).join('\n');
}

export const EXTRACTION_SYSTEM = `You extract a completed Shopify discovery questionnaire into structured data for Merkle lead consultants.

How to extract
- Record only what the questionnaire says. When a question is blank, "TBC", "unknown" or "n/a", omit the field and add an open_items entry for required or recommended questions. Never guess.
- Every question is marked "**Q<id>**". The mapping below shows which answer fields each question fills ("*" means one entry per array item).
- Ticked checkboxes are "- [x] option"; option labels use spaces where the stored value uses underscores (e.g. "custom ui" → "custom_ui").
- Dates are YYYY-MM-DD. Countries are ISO 3166-1 alpha-2 (CH, DE). Currencies are ISO 4217 (CHF, EUR). Languages are ISO 639-1 lowercase (de, fr).
- meta.client.slug is the client name in lowercase kebab-case (e.g. "ACME Watches SA" → "acme-watches").
- Money amounts are plain numbers without separators (€60–80k → min 60000, max 80000, currency EUR).
- "[redacted-…]" markers replace personal data. Leave those fields out.

Provenance
- Add one provenance entry for each answer you extract that feeds an offer decision or exit rule, plus any answer marked TBC or inferred. pointer is the JSON pointer inside answers (e.g. "/markets/list/0/currency").
- source: "client" for client questions, "consultant" for questions marked [consultant], "inferred" if you derived the value from other answers. status: "tbc" when the answer is marked TBC or uncertain, otherwise "confirmed".

Exit candidates
- Exit rules are evaluated in code from the structured answers. Add an exit_candidates entry only when free-text answers clearly indicate a rule that the structured fields cannot express (for example an industry description that implies a regulated industry while the regulated-industry question was left blank). Quote the evidence.

Question mapping (question id [audience] → answer fields)
${questionMapping()}

Exit rules
${exitRuleList()}`;

/**
 * Convert a data pointer with numeric indices ("/markets/list/0/currency")
 * to a schema pointer ("/markets/list/*\/currency").
 *
 * @param {string} pointer
 */
export const toSchemaPointer = (pointer) => pointer.replace(/\/\d+(?=\/|$)/g, '/*');

/**
 * Run extraction.
 *
 * @param {{ callStructured: Function }} llm
 * @param {string} redactedQuestionnaire
 * @returns {Promise<{ answers: object, provenance: object, openItems: object[], exitCandidates: object[], model: string }>}
 */
export async function extractAnswers(llm, redactedQuestionnaire) {
  const { data, model } = await llm.callStructured({
    system: EXTRACTION_SYSTEM,
    user: `Completed questionnaire:\n\n${redactedQuestionnaire}`,
    schema: buildExtractionSchema(),
  });

  const provenance = {};
  for (const { pointer, ...entry } of data.provenance ?? []) {
    if (schemaNodeAt(toSchemaPointer(pointer))) provenance[pointer] = entry;
  }
  const openItems = (data.open_items ?? []).filter((i) => schemaNodeAt(toSchemaPointer(i.pointer)));

  return {
    answers: data.answers,
    provenance,
    openItems,
    exitCandidates: data.exit_candidates ?? [],
    model,
  };
}
