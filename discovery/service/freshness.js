/**
 * @file freshness.js
 * @description Whether a saved Discovery Closing Document still matches the
 * answers. Saving the document snapshots the answers; later the service diffs the
 * snapshot against the session and says exactly which questions moved, so the
 * Lead Consultant sees "out of date — 6 answers changed" instead of having to
 * remember (owner decision 2026-09-17: track what changed, redraft in full).
 *
 * @module discovery/service/freshness
 */

import { flattenAnswers } from '../agents/discovery/extract.js';
import { displayValue } from './summary.js';

/**
 * The answers as saved with a document: pointer → value JSON, plus the questions
 * parked as TBC, not applicable or clarified by comment.
 *
 * @param {import('../agents/interview/session.js').Session} session
 * @returns {{ values: Record<string, string>, parked: Record<string, string> }}
 */
export function answerSnapshot(session) {
  const values = Object.fromEntries(flattenAnswers(session.answers).map((a) => [a.pointer, a.value_json]));
  const parked = {};
  for (const [state, ids] of [['tbc', session.tbc], ['skipped', session.skipped], ['commented', session.commented ?? {}]]) {
    for (const id of Object.keys(ids ?? {})) parked[id] = state;
  }
  return { values, parked };
}

const PARKED_LABEL = { tbc: 'to confirm', skipped: 'not applicable', commented: 'clarified by comment', answered: 'answered' };

/**
 * What changed between the snapshot taken when the document was saved and the
 * answers now.
 *
 * @param {{ values: Record<string, string>, parked?: Record<string, string> }|null|undefined} snapshot
 * @param {import('../agents/interview/session.js').Session} session
 * @param {(pointer: string) => { question_id: string|null, question: string|null }} describe
 * @returns {{ known: boolean, up_to_date: boolean, changes: Array<object> }}
 */
export function answerChanges(snapshot, session, describe) {
  if (!snapshot?.values) return { known: false, up_to_date: true, changes: [] };
  const now = answerSnapshot(session);
  /** @type {Array<object>} */
  const changes = [];
  const pointers = new Set([...Object.keys(snapshot.values), ...Object.keys(now.values)]);
  for (const pointer of pointers) {
    const before = snapshot.values[pointer];
    const after = now.values[pointer];
    if (before === after) continue;
    const { question_id, question } = describe(pointer);
    changes.push({
      pointer,
      question_id,
      question,
      kind: before === undefined ? 'added' : after === undefined ? 'removed' : 'changed',
      before: before === undefined ? '' : displayValue(pointer, JSON.parse(before)),
      after: after === undefined ? '' : displayValue(pointer, JSON.parse(after)),
    });
  }
  for (const id of new Set([...Object.keys(snapshot.parked ?? {}), ...Object.keys(now.parked)])) {
    const before = snapshot.parked?.[id] ?? 'answered';
    const after = now.parked[id] ?? 'answered';
    if (before === after || changes.some((c) => c.question_id === id)) continue;
    changes.push({ pointer: '', question_id: id, question: null, kind: 'state', before: PARKED_LABEL[before], after: PARKED_LABEL[after] });
  }
  changes.sort((a, b) => (a.question_id ?? '').localeCompare(b.question_id ?? '', undefined, { numeric: true }));
  return { known: true, up_to_date: changes.length === 0, changes };
}

/**
 * The line a Lead Consultant pastes into Claude to redraft the document with the
 * changes named.
 *
 * @param {string} client @param {Array<object>} changes
 */
export function redraftPrompt(client, changes) {
  if (!changes.length) return `Draft the Discovery Closing Document for ${client}.`;
  const named = changes.slice(0, 12).map((c) => `${c.question_id ?? c.pointer}${c.after ? `: now ${c.after}` : ` (${c.kind})`}`);
  const more = changes.length > named.length ? ` and ${changes.length - named.length} more` : '';
  return `Redraft the Discovery Closing Document for ${client}. These answers changed since the last version — ${named.join('; ')}${more}.

Redraft it in full, not just the slides: call prepare_closing_document, draft the approach again from the engagement data it returns — the verified Shopify knowledge, the comparison rubric, the run cost and the organisation it gives you — save it with save_approach, then write the deck and the annex from the deck data and save both with save_closing_document. The answers that moved may have moved the engine's own decisions, the market topology among them, so a deck rewritten on top of the old approach would argue from a position the evidence no longer supports.

Tell me what changed and why: which decisions moved, which held, and what the changes did to the risks and the plan.`;
}
