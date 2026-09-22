/**
 * @file clarifications-view.js
 * @description The clarification questions as a document: the version that goes
 * to the client, and the version the consultant keeps.
 *
 * The split is the point. "Why we ask" is written to be read by the client — it
 * is the paragraph that shows we already understand the trade-off, and it is the
 * whole reason a short list of questions reads as expertise rather than as a
 * form. What we would assume if they do not answer, and the discovery question
 * ids behind each one, are ours: an assumption shown to a client before they
 * have answered invites them to accept it instead of answering, and the ids mean
 * nothing to them.
 *
 * So the internal version is a separate download, never a section of the client
 * one — the same rule the price bands follow in offering-view.js. A document
 * that has to be edited before it is safe to send will one day be sent
 * unedited.
 *
 * @module ai/shared/clarifications-view
 */

const clean = (s) => String(s ?? '').trim();

/**
 * Company forms keep their own capitalisation. A heading that reads "Ricola Ag"
 * on the first page of a bid document undoes the work the questions are there to
 * do, and the slug is all the engagement holds.
 */
const FORMS = new Map([
  ['ag', 'AG'], ['sa', 'SA'], ['nv', 'NV'], ['bv', 'BV'], ['gmbh', 'GmbH'],
  ['srl', 'SRL'], ['spa', 'SpA'], ['plc', 'plc'], ['ltd', 'Ltd'], ['llc', 'LLC'],
  ['inc', 'Inc.'], ['kg', 'KG'], ['oy', 'Oy'], ['ab', 'AB'], ['as', 'AS'],
]);

/** Title case for the client-facing heading, from the engagement slug. */
const clientName = (slug) => String(slug ?? '')
  .split('-')
  .filter(Boolean)
  .map((w) => FORMS.get(w.toLowerCase()) ?? w[0].toUpperCase() + w.slice(1))
  .join(' ');

/**
 * The questions as Markdown.
 *
 * @param {{ client: string }} engagement
 * @param {{ questions: object[], saved_at?: string, by?: string }} clarifications
 * @param {{ internal?: boolean }} [options]  internal: add what we would assume
 *   and which discovery questions each one covers. Never send that version out.
 * @returns {string}
 */
export function renderClarificationsMarkdown(engagement, clarifications, { internal = false, assumptions = [] } = {}) {
  const all = clarifications?.questions ?? [];
  // Only what the Lead Consultant accepted leaves the building. A question still
  // marked proposed is a draft, and a rejected one is now an assumption.
  const questions = internal ? all : all.filter((q) => (q.status ?? 'proposed') === 'accepted');
  const name = clientName(engagement?.client);
  const out = [];

  out.push(`# Clarification questions — ${name}`);
  out.push('');
  out.push(internal
    ? `Merkle · prepared ${clarifications?.saved_at ?? ''}${clarifications?.by ? ` by ${clarifications.by}` : ''} · **internal copy — do not send**`
    : `Merkle · ${clarifications?.saved_at ?? ''}`);
  out.push('');

  if (!questions.length) {
    out.push(all.length && !internal
      ? '_No questions have been accepted yet — nothing is ready to send._'
      : '_No questions have been prepared yet._');
    return `${out.join('\n')}\n`;
  }

  out.push(internal
    ? 'The client-facing text is the question and the "Why we ask" paragraph. Everything under "For us" stays here: it is what the proposal will state if the question comes back unanswered.'
    : 'Before we submit our proposal we would like to confirm a small number of points. Each one changes the solution we would recommend, so we have set out what it changes and why we are asking.');
  out.push('');

  questions.forEach((q, i) => {
    out.push(`## ${i + 1}. ${clean(q.question)}`);
    out.push('');
    out.push(`**Why we ask.** ${clean(q.why_we_ask)}`);
    out.push('');
    if (internal) {
      const covers = (q.covers ?? []).filter(Boolean);
      const status = q.status ?? 'proposed';
      out.push('> **For us**  ');
      out.push(`> ${status === 'accepted' ? 'Accepted — sent to the client' : status === 'rejected' ? 'Not asked — stated as an assumption instead' : 'Still to decide'}${q.decided_by ? ` (${q.decided_by}, ${q.decided_at})` : ''}  `);
      if (covers.length) out.push(`> Covers ${covers.join(', ')}  `);
      out.push(`> If unanswered, the proposal will assume: ${clean(q.assume_if_unanswered) || '—'}`);
      out.push('');
    }
  });

  if (internal && assumptions.length) {
    out.push('---');
    out.push('');
    out.push(`## What the proposal will assume (${assumptions.length})`);
    out.push('');
    out.push('Everything nobody could tell us otherwise. This is where a bid loses money, so it is written down rather than carried in someone’s head.');
    out.push('');
    for (const a of assumptions) {
      out.push(`- **${clean(a.about)}** — ${clean(a.assumed)}${a.impact_if_wrong ? `  \n  _If wrong:_ ${clean(a.impact_if_wrong)}` : ''}${a.source === 'rejected' ? '  \n  _Chosen: we decided not to ask this._' : ''}`);
    }
    out.push('');
  }

  if (!internal) {
    out.push('---');
    out.push('');
    out.push('Where a point is not confirmed in time, our proposal states the assumption we have made so that it stays comparable and can be revisited without reopening the commercial position.');
    out.push('');
  }

  return `${out.join('\n')}\n`;
}
