/**
 * @file clarifications.js
 * @description The questions Merkle sends back after reading an RFP.
 *
 * An RFP arrives, there is a window to send questions, and then the proposal is
 * written. Those questions are not a form: they are the first thing the client
 * reads from us, and a list of sixty says we have not read their document. A
 * handful, each one showing that we already know the trade-off it turns on, says
 * the opposite.
 *
 * So the split is the usual one. The engine decides *what is worth asking* —
 * which unknowns actually move the offer, the plan, the store topology, the cost
 * or the risk, grouped by subject so one question can cover several, and with
 * everything it could safely assume removed from the list. The model then writes
 * the few questions, in the client's own context, with the trade-off visible.
 *
 * What is not asked is not lost: each topic carries what the engine would assume
 * instead, and that assumption goes into the proposal.
 *
 * @module discovery/clarifications
 */

import { questionBank } from '../../schema/index.js';
import { answeredQuestions } from './knowledge.js';
import { questionApplies } from '../interview/next.js';
import { runCostFor } from './economics.js';

const BY_ID = new Map(questionBank.questions.map((q) => [q.id, q]));
const SECTION_TITLE = new Map(questionBank.sections.map((s) => [String(s.id), s.title]));

/**
 * Subjects that are not their parent section.
 *
 * Grouping by section puts one question in front of the client per subject, and
 * mainland China is not the same subject as "which markets do you sell in". It
 * is excluded from the offer and routed to a separate discovery, so folding it
 * into a general markets question loses the one question worth asking about it —
 * which route they intend — inside a question about something else.
 */
const OWN_SUBJECT = new Set(['3.5']);
const SUBJECT_TITLE = new Map([['3.5', 'Mainland China']]);

const subjectOf = (question) => {
  const sub = String(question.subsection ?? '');
  return OWN_SUBJECT.has(sub) ? sub : sub.split('.')[0];
};

/** Which part of the proposal an unknown moves. Nothing else earns a question. */
const MOVES = {
  offer: 'the size of the engagement',
  plan: 'the Shopify plan',
  topology: 'how many stores the markets run on',
  cost: 'what the solution costs to run',
  risk: 'a risk we would otherwise have to price for',
};

/** An unknown worth money: it feeds a gate, a rule, a plan requirement or the topology. */
function movesWhat(question, doc) {
  const feeds = question?.feeds ?? [];
  const out = new Set();
  if (feeds.some((f) => f.startsWith('gate:'))) out.add('offer');
  if (feeds.some((f) => f.startsWith('exit:'))) out.add('risk');
  if (feeds.includes('exit:11.1')) out.add('plan');
  if (feeds.some((f) => f.startsWith('l_trigger:'))) out.add('offer');
  if ((doc.markets?.topology?.open_inputs ?? []).some((o) => o.question_id === question?.id)) out.add('topology');
  if (feeds.some((f) => f.startsWith('app:'))) out.add('cost');
  return [...out];
}

/**
 * Every unknown the engine is carrying, from wherever it recorded it.
 *
 * @param {object} doc  Decided engagement
 */
function unknowns(doc) {
  const out = new Map();
  const add = (question_id, why, extra = {}) => {
    if (!question_id || !BY_ID.has(question_id)) return;
    const found = out.get(question_id) ?? { question_id, whys: [], swing: undefined };
    if (why && !found.whys.includes(why)) found.whys.push(why);
    out.set(question_id, { ...found, ...extra, whys: found.whys });
  };

  for (const item of doc.approach?.risks?.open_items ?? []) add(item.question_id, item.why);
  for (const input of doc.markets?.topology?.open_inputs ?? []) add(input.question_id, input.why_it_matters, { swing: input.swing });
  for (const a of doc.markets?.topology?.assumptions ?? []) {
    if (a.question_id) add(a.question_id, a.impact_if_wrong, { assumed: a.assumed });
  }

  // Everything the document simply never covered.
  //
  // The three sources above are the engine's own notes, and on a bid two of them
  // are empty: open_items is written into the approach, and the approach is
  // drafted *after* this step. So the questions Merkle sent on an RFP came almost
  // entirely from the market-topology engine, and a required question the RFP
  // never touched — B2B, the migration, an integration — was neither asked nor
  // assumed. It just disappeared, which is the one outcome this whole step exists
  // to prevent.
  //
  // An unanswered question earns its place here on the same terms as everything
  // else: movesWhat drops it below if it moves nothing.
  //
  // Only once something has been read, though: "what the document did not cover"
  // means nothing until there is a document. On an empty engagement every
  // question is unanswered, and without this guard the step would happily draft
  // questions for a client whose RFP nobody has opened.
  const answered = new Set(answeredQuestions(doc).map((q) => q.id));
  if (answered.size) {
    for (const q of questionBank.questions) {
      if (answered.has(q.id) || out.has(q.id)) continue;
      // And only where the subject exists for this client. `only_if` is how the
      // bank says a whole subject does not apply — the mainland China questions
      // exist only when CN is a launch market — and asking around it puts a
      // question to a client about something they never mentioned having.
      if (!questionApplies(q, doc)) continue;
      add(q.id, q.why_it_matters ?? q.teach?.why ?? 'Not covered by the documents');
    }
  }

  return [...out.values()];
}

/**
 * The unknowns worth a question, grouped by subject so one question covers
 * several, ranked by what they move, and trimmed to what a client will read.
 *
 * @param {object} doc  Decided engagement
 * @param {{ max?: number }} [options]
 * @returns {object[]}
 */
export function clarificationTopics(doc, { max = Infinity } = {}) {
  // Straight from the question bank, not from the verified knowledge for this
  // engagement: that only covers questions the client has already answered, and
  // every question here is unanswered by definition.
  const teachOf = (id) => BY_ID.get(id)?.teach ?? {};
  const evidenceFor = (id) => Object.values(doc.provenance ?? {}).find((p) => p.question_id === id && p.note)?.note;

  const groups = new Map();
  for (const unknown of unknowns(doc)) {
    const question = BY_ID.get(unknown.question_id);
    const moves = movesWhat(question, doc);
    // If it moves nothing in the proposal it is never worth asking a client in a
    // bid — whose Jira the backlog lives on is a kick-off question, and asking it
    // here says we have not understood what we were sent. It becomes an
    // assumption, or it waits for kick-off.
    if (!moves.length && unknown.swing !== 'high') continue;
    const section = subjectOf(question);
    const group = groups.get(section) ?? {
      topic: section,
      title: SUBJECT_TITLE.get(section) ?? SECTION_TITLE.get(section) ?? `Section ${section}`,
      covers: [],
      moves: new Set(),
      assume_if_unanswered: [],
      show_the_tradeoff: [],
      evidence: [],
    };
    group.covers.push({
      question_id: question.id,
      asks: question.text,
      why_it_matters: question.why_it_matters ?? unknown.whys[0] ?? question.teach?.why,
      ...(unknown.swing ? { swing: unknown.swing } : {}),
    });
    for (const m of moves) group.moves.add(m);
    const assumed = unknown.assumed ?? question.unknown_path?.assumption;
    if (assumed && !group.assume_if_unanswered.includes(assumed)) group.assume_if_unanswered.push(assumed);
    const teach = teachOf(question.id);
    if ((teach.limits || (teach.options ?? []).length) && !group.show_the_tradeoff.some((t) => t.question_id === question.id)) {
      group.show_the_tradeoff.push({
        question_id: question.id,
        ...(teach.limits ? { limits: teach.limits } : {}),
        ...((teach.options ?? []).length ? { options: teach.options } : {}),
        sources: teach.sources ?? [],
      });
    }
    const cite = evidenceFor(question.id);
    if (cite && !group.evidence.includes(cite)) group.evidence.push(cite);
    groups.set(section, group);
  }

  const rank = { high: 0, medium: 1, low: 2 };
  const scored = [...groups.values()].map((g) => {
    const moves = [...g.moves];
    const swing = g.covers.map((c) => c.swing).filter(Boolean).sort((a, b) => rank[a] - rank[b])[0];
    // High is for what changes the *shape* of the solution: how many stores the
    // markets run on, or how big the engagement is. The Shopify plan, the run
    // cost and the risks move a number inside a shape that is already settled.
    // Grading those high as well was the first rule here, and on a real
    // engagement it made six of seven topics high — a ranking that does not rank.
    const shape = moves.includes('topology') || moves.includes('offer');
    return {
      ...g,
      moves,
      changes: moves.map((m) => MOVES[m]),
      impact: shape || swing === 'high' ? 'high' : 'medium',
    };
  });

  // One question that settles six unknowns is worth more than one that settles
  // one, whatever else it happens to touch.
  const ordered = [...scored].sort((a, b) => (a.impact === b.impact
    ? (b.covers.length - a.covers.length) || (b.moves.length - a.moves.length)
    : a.impact === 'high' ? -1 : 1));

  // Everything that moves the proposal, ranked — and no constant deciding how
  // many that is. A floor of three and a ceiling of six were numbers this file
  // chose: asking three because the constant says three is the form the whole
  // step was written to avoid, and cutting at six dropped topics that move the
  // price into assumptions nobody decided to make. The Lead Consultant is the
  // ceiling now. They cut, and every cut is recorded as an assumption with what
  // it costs to be wrong — which is a decision, where a silent truncation was not.
  return ordered.slice(0, max).map(({ moves, ...topic }) => topic);
}

/**
 * Everything the writer needs to compose the clarification questions: the topics,
 * what the RFP already told us, and what cannot be priced at all until it is
 * answered.
 *
 * @param {object} doc @param {{ max?: number }} [options]
 */
export function clarificationBrief(doc, { max = Infinity } = {}) {
  const topics = clarificationTopics(doc, { max });
  const cost = runCostFor(doc);
  return {
    note: 'The engine chose these: they are the unknowns that move the offer, the plan, the store topology, the cost or the risk. Everything it could safely assume has already been removed — do not add questions back.',
    documents: (doc.documents ?? []).map((d) => ({ name: d.name, type: d.type, ...(d.summary ? { summary: d.summary } : {}) })),
    topics,
    cannot_price_until_answered: cost.unknown.filter((u) => !/plan price/i.test(u.item)).map((u) => u.item),
    markets: (doc.markets?.list ?? []).map((m) => m.code),
  };
}

/** The instruction the model follows to write them. */
export const CLARIFICATIONS_PROMPT = `Write Merkle's clarification questions on this RFP, for the client to answer before we submit the proposal.

These are not discovery questions and this is not a form. They are the first thing this client reads from us: each one has to get the information we need *and* show that we already understand the trade-off it turns on. A long list says we have not read their document.

For each topic you are given:
- Write ONE question that covers the whole topic. Do not split it into the individual discovery questions behind it — those are listed only so you know what the answer has to yield.
- Open in the client's own context, citing their document and section where the evidence gives you one ("Your RFP sets out a launch in CH, DE, AT and FR (§4.2)…").
- Then, in a short paragraph headed "Why we ask", show the trade-off using the documented limits and options you are given: what changes in the solution depending on the answer, and what it does to the plan, the store count or the running cost. Cite the official Shopify page for any platform fact, exactly as everywhere else.
- Keep the client-facing part to a question and that paragraph. No sub-questions, no brackets, no jargon the client has not used themselves.

Order the questions by impact, highest first. Never write more than the topics you are given, and drop any topic where you cannot show a real trade-off — a question that does not demonstrate anything is one the client will resent.

For each question also record, for the consultant only: which discovery questions it covers, what we will assume in the proposal if the client does not answer it, and what that costs us if the assumption turns out to be wrong — in scope, in the Shopify plan, in the number of stores or in what it costs to run.

That last one is not paperwork. Anything the Lead Consultant decides not to ask becomes a stated assumption in the proposal, and an assumption with a consequence attached reads as a decision Merkle took deliberately; the same assumption without one reads as a gap, and a client prices gaps down.`;
