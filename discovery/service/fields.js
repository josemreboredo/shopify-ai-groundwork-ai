/**
 * @file fields.js
 * @description Input specifications for interview questions, derived from the
 * engagement schema, and parsing of submitted form values. The engine still
 * validates every value (answer.js); this only turns form input into JSON.
 *
 * @module discovery/service/fields
 */

import { schemaNodeAt, enumValues, optionLabel } from '../schema/index.js';
import { DATE_PATTERN, resolveCode, resolveDate, vocabularyExample, vocabularyForPattern } from './vocabularies.js';


/**
 * @typedef {{ pointer: string, label?: string, root?: string, vocabulary?: 'country'|'currency'|'language', kind: 'boolean'|'enum'|'multi_enum'|'integer'|'number'|'date'|'text'|'long_text'|'list'|'table'|'json',
 *   options?: { value: string, label: string }[], columns?: (FieldSpec & { key: string, required: boolean })[] }} FieldSpec
 */

/**
 * @param {string[]} values
 * @param {Record<string, string>} [labels]  Option labels in the conversation language
 */
const options = (values, labels) => values.map((value) => ({ value, label: labels?.[value] ?? optionLabel(value) }));

/**
 * One input per field the question fills. When the described question carries
 * `option_labels` (the questionnaire in the engagement's language), the choices
 * are shown with those labels; the recorded value is the English code either way.
 *
 * @param {{ fields: string[], answer_type: string, option_labels?: Record<string, string> }} question  Described question (nextQuestions)
 * @returns {FieldSpec[]}
 */
export function fieldSpecs(question) {
  return question.fields.flatMap((pointer) => specsFor(pointer, question.answer_type, '', pointer, question.option_labels));
}

/**
 * @param {string} pointer @param {string} answerType @param {string} label  Sub-field path inside a group
 * @param {string} root  The question field the answer is recorded at
 * @param {Record<string, string>} [labels]  Option labels in the conversation language
 * @returns {FieldSpec[]}
 */
function specsFor(pointer, answerType, label, root, labels) {
  const node = schemaNodeAt(pointer);
  const base = { pointer, ...(label ? { label, root } : {}) };
  const values = enumValues(node);
  if (values && node.type === 'array') return [{ ...base, kind: 'multi_enum', options: options(values, labels) }];
  if (values) return [{ ...base, kind: 'enum', options: options(values, labels) }];
  if (node?.type === 'boolean') return [{ ...base, kind: 'boolean' }];
  if (node?.type === 'integer') return [{ ...base, kind: 'integer' }];
  if (node?.type === 'number') return [{ ...base, kind: 'number' }];
  if (node?.type === 'string') {
    if (node.format === 'date' || node.pattern === DATE_PATTERN) return [{ ...base, kind: 'date' }];
    const vocabulary = vocabularyForPattern(node.pattern);
    if (vocabulary) return [{ ...base, kind: 'text', vocabulary }];
    return [{ ...base, kind: answerType === 'long_text' ? 'long_text' : 'text' }];
  }
  if (node?.type === 'object' && node.properties) {
    // A group (e.g. a money range) gets one input per field and is recorded as one object at `root`.
    return Object.keys(node.properties).flatMap((key) => specsFor(`${pointer}/${key}`, answerType, label ? `${label} › ${key}` : key, root, labels));
  }
  const items = node?.type === 'array' ? schemaNodeAt(`${pointer}/*`) : null;
  if (items?.type === 'string') {
    const vocabulary = vocabularyForPattern(items.pattern);
    return [{ ...base, kind: 'list', ...(vocabulary ? { vocabulary } : {}) }];
  }
  if (items?.type === 'object' && items.properties) {
    // A table: one row per item, one column per item field (no JSON for the consultant).
    const required = new Set(items.required ?? []);
    const columns = Object.keys(items.properties).map((key) => ({
      ...specsFor(`${pointer}/*/${key}`, 'text', '', `${pointer}/*/${key}`, labels)[0],
      key,
      required: required.has(key),
    })).map(({ pointer: _p, root: _r, ...column }) => column);
    return [{ ...base, kind: 'table', columns }];
  }
  return [{ ...base, kind: 'json' }];
}

/** Form field name of a table cell, e.g. "/markets/list[0][code]". */
export const cellName = (pointer, row, key) => `${pointer}[${row}][${key}]`;

/**
 * Parse a table from form values named like "/markets/list[0][code]". Empty
 * rows are ignored; empty cells are left out. Returns `undefined` when no row
 * has a value.
 *
 * @param {FieldSpec} spec
 * @param {Record<string, string[]>} values  All submitted form values
 * @returns {{ value: object[] } | { error: string } | undefined}
 */
export function parseTable(spec, values) {
  const prefix = `${spec.pointer}[`;
  const rows = [...new Set(Object.keys(values).filter((k) => k.startsWith(prefix)).map((k) => Number(k.slice(prefix.length).split(']')[0])))].sort((a, b) => a - b);
  const items = [];
  const errors = [];
  for (const row of rows) {
    const item = {};
    for (const column of spec.columns) {
      const result = parseField({ ...column, pointer: column.key }, values[cellName(spec.pointer, row, column.key)] ?? []);
      if (!result) continue;
      if ('error' in result) errors.push(`Row ${items.length + 1}: ${result.error}`);
      else item[column.key] = result.value;
    }
    if (!Object.keys(item).length) continue;
    const missing = spec.columns.filter((c) => c.required && !(c.key in item)).map((c) => c.key);
    if (missing.length) errors.push(`Row ${items.length + 1}: fill in ${missing.join(', ')}`);
    items.push(item);
  }
  if (errors.length) return { error: errors.join('; ') };
  return items.length ? { value: items } : undefined;
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
  const empty = spec.kind === 'multi_enum' ? raw.filter(Boolean).length === 0 : first === '';
  if (empty) return undefined;
  switch (spec.kind) {
    case 'boolean':
      return first === 'true' || first === 'false' ? { value: first === 'true' } : { error: `${spec.pointer}: choose yes or no` };
    case 'enum':
      return { value: first };
    case 'multi_enum':
      return { value: [...new Set(raw.filter(Boolean))] };
    case 'integer':
      return /^-?\d+$/.test(first) ? { value: Number(first) } : { error: `${spec.pointer}: whole number expected` };
    case 'number':
      return Number.isFinite(Number(first)) ? { value: Number(first) } : { error: `${spec.pointer}: number expected` };
    case 'date': {
      const date = resolveDate(first);
      return date ? { value: date } : { error: `${spec.pointer}: “${first}” is not a date — pick it in the calendar or type it day first, e.g. 01.05.2027` };
    }
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

/**
 * Resolve countries, currencies and languages typed as names ("Switzerland",
 * "euros", "German") to the codes the schema stores, anywhere in a value
 * (fields, lists, groups, table rows). Unknown entries are reported in plain words.
 *
 * @param {string} pointer  Schema pointer of the value
 * @param {unknown} value
 * @returns {{ value: unknown, errors: string[] }}
 */
export function normalizeValue(pointer, value) {
  const errors = [];
  const walk = (nodePointer, v, label) => {
    const node = schemaNodeAt(nodePointer);
    if (!node || v === null || v === undefined) return v;
    if (node.type === 'array' && Array.isArray(v)) return v.map((item, i) => walk(`${nodePointer}/*`, item, `${label} row ${i + 1}`));
    if (node.type === 'object' && typeof v === 'object' && !Array.isArray(v)) {
      return Object.fromEntries(Object.entries(v).map(([k, child]) => [k, walk(`${nodePointer}/${k}`, child, `${label} › ${k}`)]));
    }
    if (node.type === 'string' && typeof v === 'string' && node.pattern === DATE_PATTERN) {
      const date = resolveDate(v);
      if (!date) errors.push(`${label}: “${v}” is not a date — type it day first, e.g. 01.05.2027, or as 2027-05-01`);
      return date ?? v;
    }
    const vocabulary = node.type === 'string' && typeof v === 'string' ? vocabularyForPattern(node.pattern) : null;
    if (!vocabulary) return v;
    const code = resolveCode(vocabulary, v);
    if (!code) errors.push(`${label}: “${v}” is not a known ${vocabulary} — use a name or code, e.g. ${vocabularyExample(vocabulary)}`);
    return code ?? v;
  };
  return { value: walk(pointer, value, pointer), errors };
}
