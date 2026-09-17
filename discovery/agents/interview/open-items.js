/**
 * @file open-items.js
 * @description Open items of an interview: questions left TBC, answered only by
 * a comment, or not answered in the interview mode. Shared by the hand-over to
 * the discovery pipeline (finish.js) and the web app summary.
 *
 * @module interview/open-items
 */

import { questionById, unansweredInMode } from './next.js';

/**
 * @param {import('./session.js').Session} session
 * @returns {{ pointer: string, question_id: string, why: string }[]}
 */
export function openItems(session) {
  const commented = session.commented ?? {};
  return [
    ...Object.entries(session.tbc).filter(([id]) => questionById(id)).map(([id, note]) => {
      const q = questionById(id);
      return { pointer: q.maps_to[0], question_id: id, why: note ? `TBC: ${note}` : `TBC in the interview: ${q.text}` };
    }),
    ...Object.entries(commented).filter(([id]) => questionById(id)).map(([id, note]) => {
      const q = questionById(id);
      return { pointer: q.maps_to[0], question_id: id, why: `Clarified by comment (no value recorded): ${note}` };
    }),
    ...unansweredInMode(session)
      .filter((q) => !(q.id in session.tbc) && !(q.id in commented))
      .filter((q) => q.priority !== 'optional')
      .map((q) => ({ pointer: q.maps_to[0], question_id: q.id, why: `Not answered in the interview: ${q.text}` })),
  ];
}
