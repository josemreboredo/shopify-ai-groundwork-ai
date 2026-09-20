/**
 * @file assumptions.js
 * @description What the proposal states because nobody could tell us otherwise.
 *
 * On a bid this is not a footnote. The information is scarce by definition —
 * there is one document and one window to ask questions — so most of what a
 * proposal rests on is either something the client wrote or something Merkle
 * decided to assume. The second list has to be as visible as the first, because
 * it is where the money is lost: an assumption nobody wrote down is a scope
 * argument three months into the build.
 *
 * Assumptions reach the list two ways. The engine makes some on its own, where
 * it had to recommend something without the answer that would settle it. And the
 * Lead Consultant makes the rest by rejecting a proposed question: choosing not
 * to ask is choosing to assume, and this module refuses to let that choice be
 * silent.
 *
 * @module discovery/service/assumptions
 */

import { answeredQuestions } from '../agents/discovery/knowledge.js';

/** Where an assumption came from, in the order a reader should meet them. */
const RANK = { rejected: 0, topology: 1 };

/**
 * Everything the proposal will state as an assumption.
 *
 * @param {object} doc  decided engagement
 * @param {{ questions?: object[] }|null} clarifications  the saved questions, with their decisions
 * @returns {Array<{ about: string, assumed: string, impact_if_wrong: string|null, source: string, question_id: string|null, covers: string[] }>}
 */
export function statedAssumptions(doc, clarifications) {
  const out = [];
  const answered = new Set(answeredQuestions(doc ?? {}).map((q) => q.id));

  // 1 — chosen: a question the Lead Consultant decided not to ask.
  for (const q of clarifications?.questions ?? []) {
    if (q.status !== 'rejected') continue;
    // Unless the client answered it anyway. Clients volunteer things, and an
    // assumption nobody needs to make any more should not be stated to them as
    // though we still did.
    if ((q.covers ?? []).length && (q.covers ?? []).every((c) => answered.has(c))) continue;
    out.push({
      about: q.question,
      assumed: q.assume_if_unanswered,
      // The one class of assumption a person chose to make was the only one with
      // no consequence stated, which is backwards: the engine's assumptions are
      // forced, this one was a decision. The model writes the consequence when it
      // writes the question — it already knows the trade-off, it wrote "why we
      // ask" — and the owner is whoever decided not to ask.
      impact_if_wrong: q.impact_if_wrong ?? null,
      owner: q.decided_by ?? null,
      source: 'rejected',
      // An assumption about the shape of the solution is not the same object as
      // an assumption about a detail inside it, and the proposal has to say so.
      shape_changing: Boolean(q.shape_changing),
      question_id: null,
      covers: q.covers ?? [],
      decided_by: q.decided_by ?? null,
      decided_at: q.decided_at ?? null,
    });
  }

  // 2 — derived: the engine had to recommend without the answer that settles it.
  for (const a of doc?.markets?.topology?.assumptions ?? []) {
    out.push({
      about: a.about,
      assumed: a.assumed,
      impact_if_wrong: a.impact_if_wrong ?? null,
      owner: null,
      source: 'topology',
      question_id: a.question_id ?? null,
      covers: a.question_id ? [a.question_id] : [],
    });
  }

  // The same question gets assumed about twice — once by the engine, once by a
  // rejection that covers it — and the two are worded differently, so matching on
  // text alone leaves a near-duplicate in a list the client's lawyer may read.
  // They are the same assumption when they rest on the same question, and where
  // they do, the consultant's decision is the one that stands.
  const claimed = new Set();
  const seen = new Set();
  return out
    .sort((a, b) => RANK[a.source] - RANK[b.source])
    .filter((a) => {
      const key = `${a.assumed}`.trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      const ids = a.covers.length ? a.covers : a.question_id ? [a.question_id] : [];
      if (ids.length && ids.every((id) => claimed.has(id))) return false;
      seen.add(key);
      for (const id of ids) claimed.add(id);
      return true;
    });
}

/**
 * How the questions stand: what is still to decide, what goes to the client, and
 * what became an assumption instead.
 *
 * @param {{ questions?: object[] }|null} clarifications
 */
export function triage(clarifications) {
  const questions = clarifications?.questions ?? [];
  const of = (status) => questions.filter((q) => (q.status ?? 'proposed') === status);
  return {
    total: questions.length,
    proposed: of('proposed'),
    accepted: of('accepted'),
    rejected: of('rejected'),
    // Nothing goes out while a question is still undecided: a half-triaged list
    // sent to a client is the worst of both, and it is an easy mistake to make.
    ready_to_send: questions.length > 0 && of('proposed').length === 0 && of('accepted').length > 0,
  };
}

/**
 * Whether the saved questions still match what the engine now knows.
 *
 * The questions are a snapshot: Claude writes them once and they sit there. But
 * the engagement keeps moving underneath — answers get confirmed, documents get
 * read in, the engine's view of what is still open changes. A consultant looking
 * at five questions has no way to tell whether five is what the engine would say
 * today or what it said a week ago, and the page gave no hint either way. The
 * closing document has had this check since the beginning; this did not.
 *
 * @param {object[]} topics  what the engine would ask about now
 * @param {{ questions?: object[] }|null} clarifications  what is saved
 */
export function clarificationsFreshness(topics, clarifications) {
  const saved = clarifications?.questions ?? [];
  if (!saved.length) return { known: false, up_to_date: true, uncovered: [] };
  const covered = new Set(saved.flatMap((q) => q.covers ?? []));
  // A topic is missing from the saved set when not one of the questions behind
  // it is covered by anything that was written.
  const uncovered = topics.filter((t) => !(t.covers ?? []).some((c) => covered.has(c.question_id)));
  return {
    known: true,
    up_to_date: uncovered.length === 0,
    uncovered: uncovered.map((t) => ({ title: t.title, impact: t.impact, settles: (t.covers ?? []).length })),
  };
}

/**
 * Which of the questions we sent have come back.
 *
 * The questions leave the building and nothing brought the answers home. A
 * client replies by e-mail or a document, and the Lead Consultant was left to
 * remember which of seven had been covered and to go and type them in one by
 * one. Each accepted question already names the discovery questions it covers,
 * so the tool knows exactly what a reply is supposed to fill.
 *
 * @param {object} doc  decided engagement
 * @param {{ questions?: object[] }|null} clarifications
 */
export function repliesReceived(doc, clarifications) {
  const answered = new Set(answeredQuestions(doc ?? {}).map((q) => q.id));
  const asked = (clarifications?.questions ?? []).filter((q) => q.status === 'accepted');
  const rows = asked.map((q) => {
    const covers = q.covers ?? [];
    const back = covers.filter((c) => answered.has(c));
    return {
      id: q.id,
      question: q.question,
      covers,
      // A question resting on nothing can never be satisfied, so it would sit in
      // "waiting" for ever and print "fills " with nothing after it.
      unanswerable: covers.length === 0,
      answered: covers.length > 0 && back.length === covers.length,
      partial: back.length > 0 && back.length < covers.length,
      outstanding: covers.filter((c) => !answered.has(c)),
    };
  });
  const back = rows.filter((r) => r.answered).length;
  return {
    asked: rows.length,
    back,
    // Nothing asked is not everything answered. With no rows at all, "all back"
    // is true of the empty set and rendered as a green "All 0 answered".
    all_back: rows.length > 0 && back === rows.length,
    waiting: rows.filter((r) => !r.answered),
    rows,
  };
}

/** The instruction that reads a client's reply back into the engagement. */
export function replyPrompt(client, rows) {
  const waiting = rows.filter((r) => !r.answered);
  if (!waiting.length) return `Every question Merkle sent on the ${client} RFP has been answered.`;
  const list = waiting.map((r, i) => `${i + 1}. ${r.question}\n   → fills ${r.outstanding.join(', ')}`).join('\n');
  return `Read the client's reply to Merkle's questions on the ${client} RFP into the engagement.

These are the questions still waiting, and the discovery questions each one fills:

${list}

Register the reply with register_document, then record what it says with record_answers — one call per discovery question above, each with its evidence (the document, where in it, and a short quote). Where the reply is unclear or only half answers, mark the question to confirm with a note rather than deciding for them: it is their answer, and a guess recorded here becomes a number in the proposal.

If the reply does not cover one of them, say so and leave it — it stays a stated assumption, which is what it already was.

Then tell me which questions came back, which are still open, and whether any answer changes what we had assumed.`;
}

/**
 * The discovery questions whose answers decide the shape of the solution.
 *
 * "Should the whole site run on Shopify, or should the shop sit behind a
 * separate content platform" is not a detail — it feeds an L trigger, and an L
 * trigger decides the offer outright. Deciding not to ask it is deciding to
 * guess the size of the engagement, which is a different commercial object from
 * guessing a detail inside one, and the tool took both in the same click.
 *
 * @param {object[]} topics  open topics from the engine
 * @returns {Set<string>}
 */
export function shapeChangingIds(topics) {
  return new Set(
    (topics ?? [])
      .filter((t) => t.impact === 'high')
      .flatMap((t) => (t.covers ?? []).map((c) => c.question_id))
      .filter(Boolean),
  );
}

/** Whether a question rests on any of them. @param {object} question @param {Set<string>} ids */
export const changesShape = (question, ids) => (question.covers ?? []).some((c) => ids.has(c));
