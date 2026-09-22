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

  // 1 — chosen: a question the Lead Consultant decided not to ask.
  for (const q of clarifications?.questions ?? []) {
    if (q.status !== 'rejected') continue;
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
