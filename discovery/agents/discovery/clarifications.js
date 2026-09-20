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
import { runCostFor } from './economics.js';

const BY_ID = new Map(questionBank.questions.map((q) => [q.id, q]));
const SECTION_TITLE = new Map(questionBank.sections.map((s) => [String(s.id), s.title]));

/** Which part of the proposal an unknown moves. Nothing else earns a question. */
const MOVES = {
  offer: 'the size of the engagement',
  plan: 'the Shopify plan',
  topology: 'how many stores the markets run on',
  cost: 'what the solution costs to run',
  risk: 'a risk we would otherwise have to price for',
};

/** Below this many shape-changing topics, the next best ones are worth asking anyway. */
const FLOOR = 3;

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
export function clarificationTopics(doc, { max = 6 } = {}) {
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
    const section = String(question.subsection).split('.')[0];
    const group = groups.get(section) ?? {
      topic: section,
      title: SECTION_TITLE.get(section) ?? `Section ${section}`,
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

  // A bid asks about what changes the shape of the solution, and only reaches for
  // a number when nothing bigger is open. Send a client seven questions and the
  // three that mattered are read with the same weight as the four that did not —
  // which is the opposite of what a short, considered list is for.
  const high = ordered.filter((t) => t.impact === 'high');
  const chosen = high.length >= FLOOR ? high : ordered.slice(0, Math.max(FLOOR, high.length));
  return chosen.slice(0, max).map(({ moves, ...topic }) => topic);
}

/**
 * Everything the writer needs to compose the clarification questions: the topics,
 * what the RFP already told us, and what cannot be priced at all until it is
 * answered.
 *
 * @param {object} doc @param {{ max?: number }} [options]
 */
export function clarificationBrief(doc, { max = 6 } = {}) {
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

For each question also record, for the consultant only: which discovery questions it covers, and what we will assume in the proposal if the client does not answer it. Anything unanswered becomes a stated assumption, so nothing here is wasted.`;
