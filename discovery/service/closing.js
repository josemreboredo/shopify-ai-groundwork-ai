/**
 * @file closing.js
 * @description Discovery Closing Document from an interview session, without
 * files (ADR 0016): the engine decides the engagement from the answers, Claude
 * drafts the implementation approach (validated here), the deck builder turns
 * the finalised engagement into deck data, and Claude writes the document from
 * the deck prompt. Same steps as `/discover` + `/deck` in Claude Code.
 *
 * @module discovery/service/closing
 */

import Ajv2020 from 'ajv/dist/2020.js';

import { flattenAnswers, processExtraction } from '../agents/discovery/extract.js';
import { answerValidator, decide, finalize, needsApproach, stopRoute } from '../agents/discovery/engine.js';
import { APPROACH_SYSTEM, approachInput, approachQualityErrors, fromApproachPayload } from '../agents/discovery/approach.js';
import { buildApproachSchema } from '../agents/discovery/extraction-schema.js';
import { buildDeckXml } from '../agents/discovery-deck/build.js';
import { knowledgeFor } from '../agents/discovery/knowledge.js';
import { ServiceError } from './errors.js';
import { runCostFor } from '../agents/discovery/economics.js';
import { challengesFor, topChallenges } from '../agents/discovery/challenge.js';
import { toApproachPayload } from '../agents/discovery/approach.js';
import { DECK_PROMPT } from '../agents/discovery-deck/prompt.js';
import { selectStories, summariseByEpic } from '../agents/backlog/select.js';
import { openItems } from '../agents/interview/open-items.js';
import { chapterBrief, chapterKnowledge } from './reference.js';
import { buildDeckSchema, layoutGuide } from './deck-template.js';

let approachValidator;

/** @param {object} payload @returns {string[]} */
export function approachErrors(payload) {
  approachValidator ??= new Ajv2020({ strict: false, allErrors: true }).compile(buildApproachSchema());
  return approachValidator(payload) ? [] : approachValidator.errors.map((e) => `${e.instancePath || '/'} ${e.message}`);
}

/**
 * The engagement the engine decides from the interview answers (offer, gates,
 * exit rules, open items) — before the approach is added.
 *
 * @param {import('../agents/interview/session.js').Session} session
 * @param {string} today
 * @returns {{ ok: true, doc: object } | { ok: false, errors: string[] }}
 */
export function decideFromSession(session, today) {
  const options = { today, clientSlug: session.client, source: 'chatbot' };
  const data = {
    answers: flattenAnswers(session.answers),
    provenance: Object.entries(session.provenance).map(([pointer, p]) => ({ pointer, source: p.source, status: p.status, question_id: p.question_id ?? '', note: p.note ?? '' })),
    exit_candidates: [],
    open_items: openItems(session),
  };
  const { errors, ...extraction } = processExtraction(data, answerValidator(options));
  if (errors.length) return { ok: false, errors };
  try {
    const notes = session.notes.map((n) => ({ author_role: 'consultant', at: n.at, text: n.text }));
    return { ok: true, doc: decide({ ...extraction, notes }, options) };
  } catch (err) {
    return { ok: false, errors: err.errors ?? [err.message] };
  }
}

/** Status of the engagement for the closing document. @param {object} doc */
export function closingStatus(doc) {
  const route = stopRoute(doc);
  if (doc.delivery?.go) return { decision: 'GO', offer: `${doc.offer.code} · ${doc.offer.name}`, route: null };
  return { decision: 'STOP', offer: `${doc.offer.code} · ${doc.offer.name}`, route: route?.label ?? null };
}

/**
 * What Claude needs to draft the approach.
 *
 * @param {object} doc
 */
export const approachBrief = (doc) => ({
  instructions: `${APPROACH_SYSTEM}\n\nReturn one JSON object matching approach_schema (capability_map, architecture_decisions, integration_architecture, data_model, non_functional, risk_register, app_shortlist, assumptions, phases). Research every Shopify fact in the official documentation before you cite it (Shopify Dev MCP, help.shopify.com, shopify.dev, apps.shopify.com); save_approach rejects unsourced content and lists what to fix. Use "" for empty text, -1 / "unknown" for unknown app costs, "none" for tasks without a capability.`,
  engagement: approachInput(doc),
  approach_schema: buildApproachSchema(),
});

/**
 * Finalise the engagement with an approach (null when none is needed).
 *
 * @param {object} doc @param {object|null} approachPayload
 * @returns {{ ok: true, engagement: object } | { ok: false, errors: string[] }}
 */
export function finaliseEngagement(doc, approachPayload) {
  if (needsApproach(doc)) {
    if (!approachPayload) return { ok: false, errors: ['The implementation approach is not drafted yet'] };
    const shape = approachErrors(approachPayload);
    if (shape.length) return { ok: false, errors: shape };
    const quality = approachQualityErrors(approachPayload, doc);
    if (quality.length) return { ok: false, errors: quality };
  }
  try {
    return { ok: true, engagement: finalize(doc, needsApproach(doc) ? fromApproachPayload(approachPayload) : null) };
  } catch (err) {
    return { ok: false, errors: err.errors ?? [err.message] };
  }
}

/**
 * Deck data and the prompt Claude follows to write the document.
 *
 * @param {object} engagement  Finalised engagement
 */
/** The writing guide: the deck prompt plus the layout catalogue. Same for every engagement. */
/**
 * A bid is not a discovery, and the instruction the model follows opens by
 * saying it is "closing a discovery engagement". Rather than fork eight thousand
 * words that are right either way, this says what changes and lets the rest
 * stand — the spine, the evidence rules and the consulting standard are the same
 * work whoever is reading.
 */
const BID_PREAMBLE = `**This is a bid, not a discovery.** Merkle is answering an RFP and has not been engaged. Wherever the instruction below says "closing a discovery engagement" or "Discovery Closing Document", the document you are writing is **the Proposal**, read by people deciding whether to appoint Merkle at all.

Three things change because of that, and nothing else does.

- **Answer their document, not ours.** The client wrote their requirements in their own words and their own order. Where the deck data gives you the document, section or quote a requirement came from, name it, so a reader scoring the response against their own list can find each answer. Merkle's questionnaire structure is ours and never appears.
- **An assumption is a commitment, not a caveat.** Every entry in \`<assumptions>\` carries what it costs if it turns out wrong and, where somebody chose it, who. Write them together as decisions Merkle has taken on the evidence available. An assumption with a consequence attached reads as a decision; the same assumption without one reads as a gap, and a client prices gaps down.
- **Nothing has been agreed with them.** In a discovery the client sat in the room. Here the answers were read out of a document and confirmed by a consultant, so never write as though anything was settled together.

---

`;

/** @param {{ process?: string }} [options] */
export const deckGuide = ({ process } = {}) => `${process === 'rfp' ? BID_PREAMBLE : ''}${DECK_PROMPT}\n\nThe deck data (deck_xml) is the content of discovery-deck.xml.\n\nFill the slide templates in deck_schema — the deck is not prose on slides. Layouts available:\n\n${layoutGuide()}\n\nThen save the deck and the annex document with save_closing_document (deck = the filled templates, annex = Markdown).`;

/**
 * @param {object} engagement
 * @param {{ assumptions?: object[] }} [extra]  assumptions: the ones the Lead
 *   Consultant created by deciding not to ask a question. They were computed for
 *   the screen and never travelled any further, so a proposal stated none of
 *   them while the app promised it would.
 */
export function deckBrief(engagement, { assumptions = [], process } = {}) {
  const stories = engagement.delivery?.go ? selectStories(engagement) : null;
  const backlog = stories ? { stories, summary: summariseByEpic(stories) } : null;
  const { xml, warnings } = buildDeckXml(engagement, backlog, { stated: assumptions });
  const chapters = chapterKnowledge(engagement);
  // The decisions are made by now and travel argued in deck_xml, so the option
  // sets that informed them do not need to be sent a second time.
  const knowledge = knowledgeFor(engagement, { options: false });
  return {
    instructions: deckGuide({ process }),
    deck_xml: xml,
    deck_schema: buildDeckSchema(),
    reference_chapters: chapters.chapters,
    verified_knowledge: knowledge,
    run_cost: runCostFor(engagement),
    // What a second expert would say about the draft, computed rather than opined.
    challenges: topChallenges(challengesFor(engagement)),
    warnings: [
      ...warnings,
      ...(chapters.summaries_only ? [`Payload budget: ${chapters.summaries_only.join(', ')} sent as a summary only — read the chapter in the annex before writing about it`] : []),
    ],
  };
}

/** One page of reference, sized to travel as a single tool result (~12k tokens). */
const PAGE_BYTES = 48_000;

function paginate(items) {
  const pages = [];
  let current = [];
  let size = 0;
  for (const item of items) {
    const bytes = Buffer.byteLength(JSON.stringify(item));
    if (current.length && size + bytes > PAGE_BYTES) { pages.push(current); current = []; size = 0; }
    current.push(item);
    size += bytes;
  }
  if (current.length) pages.push(current);
  return pages;
}

/**
 * deck_xml cut at section boundaries into pages of about 10k tokens, so the deck
 * data never has to travel as one result however large the engagement grows.
 *
 * @param {string} xml
 * @returns {string[]}
 */
export function deckDataPages(xml, budget = 40_000) {
  const starts = [...xml.matchAll(/<section id="/g)].map((m) => m.index);
  if (!starts.length) return [xml];
  const header = xml.slice(0, starts[0]);
  const sections = starts.map((start, i) => xml.slice(start, starts[i + 1] ?? xml.length));
  const pages = [];
  let current = header;
  for (const section of sections) {
    if (current.length > header.length && current.length + section.length > budget) {
      pages.push(current);
      current = '';
    }
    current += section;
  }
  pages.push(current);
  return pages;
}

/**
 * The reference for one engagement, as an index or as one piece of it.
 *
 * Sections: (none) → the index · "limits:N" · "options:N" · "plan_gates" ·
 * "chapter:<slug>".
 *
 * @param {object} doc  Decided engagement
 * @param {string} [section]
 */
export function referencePiece(doc, section) {
  const knowledge = knowledgeFor(doc);
  const limits = paginate(knowledge.limits);
  const options = paginate(knowledge.options ?? []);
  const chapters = chapterKnowledge(doc, { budget: Infinity }).chapters;

  if (!section) {
    return {
      note: 'Read this before you draft. Everything here was checked against official Shopify documentation, scoped to the questions this client answered. Fetch each section with get_reference.',
      sections: [
        ...limits.map((page, i) => ({ section: `limits:${i + 1}`, what: `Documented limits — what breaks a naive answer (${page.length} entries)` })),
        ...options.map((page, i) => ({ section: `options:${i + 1}`, what: `Options already weighed, with pros and cons (${page.length} entries) — for the approach step` })),
        { section: 'plan_gates', what: `Features that need a plan above Basic (${knowledge.plan_gates.length} entries)` },
        ...chapters.map((c) => ({ section: `chapter:${c.slug}`, what: `${c.title} — ${c.summary} (verified ${c.verified})` })),
        { section: 'deck:guide', what: 'How to write the deck and the annex — read it before writing' },
        { section: 'deck:schema', what: 'The slide templates the deck is filled with (deck_schema)' },
      ],
    };
  }

  const [kind, arg] = String(section).split(':');
  const page = (list) => {
    const n = Number(arg);
    if (!Number.isInteger(n) || n < 1 || n > list.length) throw new ServiceError(404, `${section}: there are ${list.length} pages`);
    return { section, page: n, of: list.length, entries: list[n - 1] };
  };
  if (kind === 'deck') {
    // The same for every engagement: the writing guide and the slide templates.
    if (arg === 'guide') return { section, instructions: deckGuide() };
    if (arg === 'schema') return { section, deck_schema: buildDeckSchema() };
    throw new ServiceError(404, `${section}: use deck:guide or deck:schema`);
  }
  if (kind === 'limits') return { note: knowledge.note, ...page(limits) };
  if (kind === 'options') return { note: knowledge.note, ...page(options) };
  if (kind === 'plan_gates') return { section, entries: knowledge.plan_gates };
  if (kind === 'chapter') {
    const chapter = chapters.find((c) => c.slug === arg);
    if (!chapter) throw new ServiceError(404, `${section}: not a chapter for this engagement (${chapters.map((c) => c.slug).join(', ')})`);
    return { section, title: chapter.title, verified: chapter.verified, markdown: chapter.markdown };
  }
  throw new ServiceError(400, `${section}: unknown section — call get_reference without a section for the index`);
}

export { needsApproach };
