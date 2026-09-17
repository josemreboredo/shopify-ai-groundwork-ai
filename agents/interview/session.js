/**
 * @file session.js
 * @description Resumable interview session (ADR 0008), stored as
 * clients/.work/<slug>/interview.json. Answers are English, schema-valid values
 * keyed into the engagement shape; provenance is keyed by JSON pointer.
 *
 * @module interview/session
 */

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export const DEFAULT_WORK_ROOT = path.join(REPO_ROOT, 'clients', '.work');
export const SLUG = /^[a-z0-9][a-z0-9-]{0,62}$/;
export const MODES = ['quick', 'standard', 'full'];
export const LANGUAGE = /^[a-z]{2}$/;

/**
 * @typedef {Object} Session
 * @property {string} client
 * @property {string} language            ISO 639-1 language the interview is held in
 * @property {'quick'|'standard'|'full'} mode
 * @property {object} answers              Engagement-shaped answers (English)
 * @property {Record<string, {source: string, status: string, question_id?: string, note?: string}>} provenance
 * @property {Record<string, string>} tbc  question id → note
 * @property {Record<string, string>} skipped  question id → note
 * @property {{ text: string, at: string }[]} notes
 * @property {string} started_at
 * @property {string} updated_at
 */

/**
 * @param {{ client: string, language?: string, mode?: string, today: string }} options
 * @returns {Session}
 */
export function createSession({ client, language = 'en', mode = 'standard', today }) {
  if (!SLUG.test(client ?? '')) throw new Error('Invalid client — use a kebab-case slug, e.g. acme-watches');
  if (!LANGUAGE.test(language)) throw new Error('Invalid language — use a two-letter ISO 639-1 code, e.g. de');
  if (!MODES.includes(mode)) throw new Error(`Invalid mode — use one of ${MODES.join(', ')}`);
  return {
    client,
    language,
    mode,
    answers: { meta: { client: { slug: client } } },
    provenance: {},
    tbc: {},
    skipped: {},
    notes: [],
    started_at: today,
    updated_at: today,
  };
}

/** @param {string} workRoot @param {string} client */
export function sessionFile(workRoot, client) {
  if (!SLUG.test(client ?? '')) throw new Error('Invalid client — use a kebab-case slug, e.g. acme-watches');
  return path.join(workRoot, client, 'interview.json');
}

/** @param {string} file @returns {Session} */
export function loadSession(file) {
  if (!fs.existsSync(file)) throw new Error(`No interview session at ${file} — start one first.`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/** @param {string} file @param {Session} session */
export function saveSession(file, session) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(session, null, 2)}\n`, 'utf8');
}

/**
 * Values at a data pointer; "*" expands array items. Returns every defined value found.
 *
 * @param {object} data
 * @param {string} pointer
 * @returns {unknown[]}
 */
export function valuesAt(data, pointer) {
  let current = [data];
  for (const segment of pointer.split('/').slice(1)) {
    const next = [];
    for (const node of current) {
      if (node === undefined || node === null) continue;
      if (segment === '*') {
        if (Array.isArray(node)) next.push(...node);
      } else if (typeof node === 'object') {
        next.push(node[segment]);
      }
    }
    current = next;
  }
  return current.filter((v) => v !== undefined && v !== null);
}

/**
 * True when every array item carries a value for a "*" pointer, or any value exists otherwise.
 *
 * @param {object} data
 * @param {string} pointer
 */
export function isAnswered(data, pointer) {
  if (!pointer.includes('/*/')) return valuesAt(data, pointer).length > 0;
  const [arrayPointer] = pointer.split('/*/');
  const items = valuesAt(data, arrayPointer)[0];
  return Array.isArray(items) && items.length > 0 && items.every((item) => valuesAt({ item }, `/item/${pointer.split('/*/')[1]}`).length > 0);
}
