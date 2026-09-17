/**
 * @file answer.js
 * @description Record interview answers: the value is checked against the
 * engagement schema, personal data is refused, and provenance is kept. An
 * invalid answer changes nothing.
 *
 * @module interview/answer
 */

import { validateEngagement, schemaNodeAt } from '../../schema/index.js';
import { assemble } from '../discovery/engine.js';
import { assembleAnswers, flattenAnswers, toSchemaPointer } from '../discovery/extract.js';
import { COMPUTED_POINTERS } from '../discovery/extraction-schema.js';
import { findPersonalData } from '../discovery/input.js';
import { questionById, hasConsent, CONSENT_QUESTION } from './next.js';

const SOURCES = ['client', 'consultant', 'inferred'];
const STATUSES = ['confirmed', 'tbc'];

/** @param {string} pointer */
const isComputed = (pointer) => COMPUTED_POINTERS.some((c) => pointer === c || pointer.startsWith(`${c}/`));

/**
 * Validate a candidate answer set as a full engagement envelope.
 *
 * @param {object} answers
 * @param {import('./session.js').Session} session
 * @param {string} today
 * @returns {string[]}
 */
export function answerErrors(answers, session, today) {
  const doc = assemble(answers, { today, clientSlug: session.client, source: 'chatbot' });
  if (!doc.meta.client.name) doc.meta.client.name = session.client; // name may come later in the interview
  const { valid, errors } = validateEngagement(doc);
  return valid ? [] : errors;
}

/**
 * Record one answer.
 *
 * @param {import('./session.js').Session} session  Mutated only when the answer is valid
 * @param {{ pointer: string, value: unknown, question_id?: string, source?: string, status?: string, note?: string, today: string }} input
 * @returns {{ ok: true } | { ok: false, errors: string[] }}
 */
export function recordAnswer(session, { pointer, value, question_id, source = 'client', status = 'confirmed', note, today }) {
  const errors = [];
  if (typeof pointer !== 'string' || !/^(\/[^/]+)+$/.test(pointer) || !schemaNodeAt(toSchemaPointer(pointer))) {
    return { ok: false, errors: [`${pointer}: not an engagement field`] };
  }
  if (isComputed(pointer)) return { ok: false, errors: [`${pointer}: computed by the engine — cannot be answered`] };
  if (value === undefined || value === null || value === '') return { ok: false, errors: [`${pointer}: empty answer — mark the question TBC instead`] };
  if (!SOURCES.includes(source)) errors.push(`source must be one of ${SOURCES.join(', ')}`);
  if (!STATUSES.includes(status)) errors.push(`status must be one of ${STATUSES.join(', ')}`);

  if (question_id !== undefined) {
    const q = questionById(question_id);
    if (!q) errors.push(`${question_id}: unknown question`);
    else if (!q.maps_to.some((m) => toSchemaPointer(pointer) === m || toSchemaPointer(pointer).startsWith(`${m}/`))) {
      errors.push(`${pointer}: not a field of ${question_id} (${q.maps_to.join(', ')})`);
    }
  }
  if (!hasConsent(session.answers) && pointer !== '/meta/consent/llm_processing') {
    errors.push(`Consent for AI processing (${CONSENT_QUESTION}) must be recorded as yes before other answers`);
  }
  const personal = findPersonalData(`${JSON.stringify(value)} ${note ?? ''}`);
  if (personal.length) errors.push(`${pointer}: answer ${personal.join(' and ')} — do not record personal data`);
  if (errors.length) return { ok: false, errors };

  const pairs = flattenAnswers(session.answers).filter((p) => p.pointer !== pointer && !p.pointer.startsWith(`${pointer}/`));
  pairs.push({ pointer, value_json: JSON.stringify(value) });
  const assembled = assembleAnswers(pairs);
  if (assembled.errors.length) return { ok: false, errors: assembled.errors };

  const invalid = answerErrors(assembled.answers, session, today);
  if (invalid.length) return { ok: false, errors: invalid };

  session.answers = assembled.answers;
  session.provenance[pointer] = { source, status, ...(question_id ? { question_id } : {}), ...(note ? { note } : {}) };
  if (question_id) {
    delete session.tbc[question_id];
    delete session.skipped[question_id];
  }
  session.updated_at = today;
  return { ok: true };
}

/**
 * Mark a question as TBC (client will confirm later) or skipped (not applicable).
 *
 * @param {import('./session.js').Session} session
 * @param {{ question_id: string, as: 'tbc'|'skipped', note?: string, today: string }} input
 * @returns {{ ok: true } | { ok: false, errors: string[] }}
 */
export function markQuestion(session, { question_id, as, note = '', today }) {
  if (!questionById(question_id)) return { ok: false, errors: [`${question_id}: unknown question`] };
  if (as !== 'tbc' && as !== 'skipped') return { ok: false, errors: ['mark as tbc or skipped'] };
  if (question_id === CONSENT_QUESTION) return { ok: false, errors: ['Consent cannot be skipped or left TBC'] };
  const personal = findPersonalData(note);
  if (personal.length) return { ok: false, errors: [`note ${personal.join(' and ')} — do not record personal data`] };
  delete session.tbc[question_id];
  delete session.skipped[question_id];
  session[as][question_id] = note;
  session.updated_at = today;
  return { ok: true };
}

/**
 * Add a consultant context note (English).
 *
 * @param {import('./session.js').Session} session
 * @param {{ text: string, today: string }} input
 */
export function addNote(session, { text, today }) {
  if (!text?.trim()) return { ok: false, errors: ['empty note'] };
  const personal = findPersonalData(text);
  if (personal.length) return { ok: false, errors: [`note ${personal.join(' and ')} — do not record personal data`] };
  session.notes.push({ text: text.trim(), at: today });
  session.updated_at = today;
  return { ok: true };
}
