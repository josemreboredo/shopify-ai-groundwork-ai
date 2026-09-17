import { vocabularyExample, vocabularyOptions } from '../../discovery/service/vocabularies.js';

/** Name suggestions only for the countries, currencies and languages the given questions ask for. @param {object[]} questions */
export function vocabulariesFor(questions) {
  const used = new Set(questions.flatMap((q) => q.inputs.flatMap((i) => [i.vocabulary, ...(i.columns ?? []).map((c) => c.vocabulary)])).filter(Boolean));
  return Object.fromEntries([...used].map((v) => [v, { example: vocabularyExample(v), options: vocabularyOptions(v).map((o) => `${o.label} (${o.value})`) }]));
}
