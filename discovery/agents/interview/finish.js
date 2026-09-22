/**
 * @file finish.js
 * @description Hand the interview over to the discovery pipeline: write
 * state.json and extraction.json in the same format `discover:prepare` expects,
 * then run `assemble` (validation, offer, exit rules, approach instructions).
 *
 * @module interview/finish
 */

import fs   from 'node:fs';
import path from 'node:path';

import { flattenAnswers } from '../discovery/extract.js';
import { assembleWork, WORK_FILES } from '../discovery/claude-code.js';
import { openItems } from './open-items.js';

/**
 * Build the extraction payload from a session.
 *
 * @param {import('./session.js').Session} session
 */
export function toExtraction(session) {
  return {
    answers: flattenAnswers(session.answers),
    provenance: Object.entries(session.provenance).map(([pointer, p]) => ({
      pointer, source: p.source, status: p.status, question_id: p.question_id ?? '', note: p.note ?? '',
    })),
    exit_candidates: [],
    open_items: openItems(session),
  };
}

/**
 * Write the work files and run assemble.
 *
 * @param {import('./session.js').Session} session
 * @param {{ workDir: string, today: string }} options
 * @returns {ReturnType<typeof assembleWork> & { open_items?: number }}
 */
export function finishInterview(session, { workDir, today }) {
  fs.mkdirSync(workDir, { recursive: true });
  const write = (name, value) => fs.writeFileSync(path.join(workDir, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  write(WORK_FILES.state, {
    client: session.client, today, redactions: { emails: 0, phones: 0, names: 0 }, source: 'chatbot', language: session.language,
    notes: session.notes.map((n) => ({ author_role: 'consultant', at: n.at, text: n.text })),
  });
  const extraction = toExtraction(session);
  write(WORK_FILES.extraction, extraction);
  if (session.notes.length) {
    fs.writeFileSync(path.join(workDir, 'consultant-notes.md'), `# Consultant notes\n\n${session.notes.map((n) => `- ${n.at}: ${n.text}`).join('\n')}\n`, 'utf8');
  }
  const result = assembleWork({ workDir });
  return result.ok ? { ...result, open_items: extraction.open_items.length } : result;
}
