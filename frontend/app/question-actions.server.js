import { discovery, serviceFailure } from './discovery.server.js';

/**
 * Question actions shared by the interview and the edit page:
 * answer, tbc, skipped, reopen, clear, confirm, note.
 *
 * @param {{ login: string, role: string }} user @param {string} client @param {FormData} form
 */
export async function questionAction(user, client, form) {
  const intent = String(form.get('intent') ?? '');
  const questionId = String(form.get('question_id') ?? '');
  const note = String(form.get('note') ?? '');
  const service = discovery();
  try {
    if (intent === 'answer') {
      const values = {};
      for (const key of new Set(form.keys())) if (key.startsWith('/')) values[key] = form.getAll(key).map(String);
      const result = await service.answerQuestion(user, client, { question_id: questionId, values, note, status: form.get('tbc_status') ? 'tbc' : 'confirmed' });
      // What was stored, in the words it was stored as. Recording an answer just
      // made the card vanish: a mis-click on a select was invisible, and only the
      // comment-only path ever said anything back.
      return { ok: true, intent, question_id: questionId, commented: Boolean(result.commented), recorded: result.recorded ?? null };
    }
    if (intent === 'tbc' || intent === 'skipped') await service.markQuestion(user, client, { question_id: questionId, as: intent, note });
    else if (intent === 'reopen') await service.reopenQuestion(user, client, { question_id: questionId });
    else if (intent === 'clear') await service.clearAnswer(user, client, { question_id: questionId });
    else if (intent === 'confirm') await service.confirmAnswer(user, client, { pointer: String(form.get('pointer') ?? '') });
    else if (intent === 'note') await service.addNote(user, client, { text: String(form.get('text') ?? '') });
    else return { error: `Unknown action ${intent}` };
  } catch (err) {
    return serviceFailure(err, { question_id: questionId, intent });
  }
  return { ok: true, intent, question_id: questionId, note: note || null };
}
