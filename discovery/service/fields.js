/**
 * @file fields.js
 * @description Input specifications for interview questions, derived from the
 * engagement schema, and parsing of submitted form values. The engine still
 * validates every value (answer.js); this only turns form input into JSON.
 *
 * @module discovery/service/fields
 */

import { schemaNodeAt, enumValues, optionLabel } from '../schema/index.js';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * @typedef {{ pointer: string, label?: string, root?: string, kind: 'boolean'|'enum'|'multi_enum'|'integer'|'number'|'date'|'text'|'long_text'|'list'|'json',
 *   options?: { value: string, label: string }[], item_fields?: Record<string, unknown> }} FieldSpec
 */

/** @param {string[]} values */
const options = (values) => values.map((value) => ({ value, label: optionLabel(value) }));

/**
 * One input per field the question fills.
 *
 * @param {{ fields: string[], answer_type: string }} question  Described question (nextQuestions)
 * @returns {FieldSpec[]}
 */
export function fieldSpecs(question) {
  return question.fields.flatMap((pointer) => specsFor(pointer, question.answer_type, '', pointer));
}

/**
 * @param {string} pointer @param {string} answerType @param {string} label  Sub-field path inside a group
 * @param {string} root  The question field the answer is recorded at
 * @returns {FieldSpec[]}
 */
function specsFor(pointer, answerType, label, root) {
  const node = schemaNodeAt(pointer);
  const base = { pointer, ...(label ? { label, root } : {}) };
  const values = enumValues(node);
  if (values && node.type === 'array') return [{ ...base, kind: 'multi_enum', options: options(values) }];
  if (values) return [{ ...base, kind: 'enum', options: options(values) }];
  if (node?.type === 'boolean') return [{ ...base, kind: 'boolean' }];
  if (node?.type === 'integer') return [{ ...base, kind: 'integer' }];
  if (node?.type === 'number') return [{ ...base, kind: 'number' }];
  if (node?.type === 'string') {
    if (node.format === 'date') return [{ ...base, kind: 'date' }];
    return [{ ...base, kind: answerType === 'long_text' ? 'long_text' : 'text' }];
  }
  if (node?.type === 'object' && node.properties) {
    // A group (e.g. a money range) gets one input per field and is recorded as one object at `root`.
    return Object.keys(node.properties).flatMap((key) => specsFor(`${pointer}/${key}`, answerType, label ? `${label} › ${key}` : key, root));
  }
  const items = node?.type === 'array' ? schemaNodeAt(`${pointer}/*`) : null;
  if (items?.type === 'string') return [{ ...base, kind: 'list' }];
  if (items?.type === 'object') {
    const itemFields = Object.fromEntries(Object.keys(items.properties ?? {}).map((k) => {
      const child = schemaNodeAt(`${pointer}/*/${k}`);
      return [k, enumValues(child) ?? child?.type ?? 'string'];
    }));
    return [{ ...base, kind: 'json', item_fields: itemFields }];
  }
  return [{ ...base, kind: 'json' }];
}

/**
 * Parse a submitted value for one field. Returns `undefined` when the field was left empty.
 *
 * @param {FieldSpec} spec
 * @param {string[]} raw  All submitted values for the field (FormData.getAll)
 * @returns {{ value: unknown } | { error: string } | undefined}
 */
export function parseField(spec, raw) {
  const first = (raw[0] ?? '').trim();
  const empty = spec.kind === 'multi_enum' ? raw.length === 0 : first === '';
  if (empty) return undefined;
  switch (spec.kind) {
    case 'boolean':
      return first === 'true' || first === 'false' ? { value: first === 'true' } : { error: `${spec.pointer}: choose yes or no` };
    case 'enum':
      return { value: first };
    case 'multi_enum':
      return { value: [...new Set(raw)] };
    case 'integer':
      return /^-?\d+$/.test(first) ? { value: Number(first) } : { error: `${spec.pointer}: whole number expected` };
    case 'number':
      return Number.isFinite(Number(first)) ? { value: Number(first) } : { error: `${spec.pointer}: number expected` };
    case 'date':
      return DATE.test(first) ? { value: first } : { error: `${spec.pointer}: date expected (YYYY-MM-DD)` };
    case 'list':
      return { value: first.split(/\n|,/).map((s) => s.trim()).filter(Boolean) };
    case 'json':
      try {
        return { value: JSON.parse(first) };
      } catch {
        return { error: `${spec.pointer}: valid JSON expected` };
      }
    default:
      return { value: first };
  }
}
