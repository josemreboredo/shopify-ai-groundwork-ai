/**
 * @file knowledge.js
 * @description What Merkle has already verified about Shopify, handed to the
 * model at the moment it reasons.
 *
 * The question bank carries, per question, the limits that break a naive answer
 * ("native return labels are documented for US fulfilment locations"), the
 * options already weighed with their pros and cons, the plan gate a feature sits
 * behind, and the official pages all of it was checked against. Until now that
 * work was shown to the consultant during the interview and then dropped: the
 * model drafting the approach and the deck received the answers and nothing else,
 * and had to rediscover — or miss — limits we had already written down.
 *
 * This module hands that knowledge over, scoped to the engagement: only the
 * questions this client actually answered, so the payload stays proportionate and
 * the model is not invited to argue about capabilities nobody asked for.
 *
 * It is verified knowledge, not a hint. The drafting instructions tell the model
 * it may not contradict it, and the approach validator already rejects any
 * Shopify claim without an official source.
 *
 * @module discovery/knowledge
 */

import { questionBank } from '../../schema/index.js';

const BY_ID = new Map(questionBank.questions.map((q) => [q.id, q]));

/** A value exists at this pointer in the engagement document. */
/**
 * Whether an answer actually sits at a pointer. Exported because "no answer
 * here" and "the answer is no" are different things, and a reader who cannot
 * tell them apart is being told something the data does not support.
 *
 * @param {object} doc @param {string} pointer
 */
export function answeredAt(doc, pointer) {
  let node = doc;
  for (const key of pointer.split('/').slice(1)) {
    if (key === '*') return Array.isArray(node) && node.length > 0;
    if (node === null || node === undefined || typeof node !== 'object') return false;
    node = node[key];
  }
  return node !== undefined && node !== null && !(Array.isArray(node) && node.length === 0);
}

/**
 * The questions this engagement actually answered — by provenance where the
 * interview recorded it, and by the presence of a value where it did not (the
 * Claude Code path does not always write provenance).
 *
 * @param {object} doc
 * @returns {object[]} questions from the bank
 */
export function answeredQuestions(doc) {
  const ids = new Set(Object.values(doc.provenance ?? {}).map((p) => p?.question_id).filter(Boolean));
  const out = new Map();
  for (const id of ids) if (BY_ID.has(id)) out.set(id, BY_ID.get(id));
  for (const q of questionBank.questions) {
    if (!out.has(q.id) && q.maps_to.some((pointer) => answeredAt(doc, pointer))) out.set(q.id, q);
  }
  return [...out.values()].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
}

/**
 * Verified Shopify knowledge for this engagement: what breaks, what was already
 * weighed, and which features sit behind a plan.
 *
 * @param {object} doc  Decided engagement document
 * @param {{ options?: boolean }} [scope]  Set options:false once the decisions are
 *   made — the deck step already carries them, argued, in deck_xml.
 * @returns {{ limits: object[], options: object[], plan_gates: object[], note: string }}
 */
export function verifiedKnowledge(doc, scope = {}) {
  const questions = answeredQuestions(doc);
  const limits = [];
  const options = [];
  const gates = [];

  for (const q of questions) {
    const t = q.teach ?? {};
    if (t.limits) {
      limits.push({ question_id: q.id, about: q.text, limits: t.limits, ...(t.sources?.length ? { sources: t.sources } : {}) });
    }
    if ((t.options ?? []).length) {
      options.push({
        question_id: q.id,
        about: q.text,
        options: t.options.map((o) => ({ option: o.option, ...(o.pros ? { pros: o.pros } : {}), ...(o.cons ? { cons: o.cons } : {}) })),
        ...(t.sources?.length ? { sources: t.sources } : {}),
      });
    }
    for (const n of q.shopify?.native ?? []) {
      if (n.plan && n.plan !== 'basic') {
        gates.push({ question_id: q.id, feature: n.feature, plan: n.plan, ...(n.plan_note ? { note: n.plan_note } : {}), docs: n.docs });
      }
    }
  }

  return {
    note: 'Checked against official Shopify documentation by Merkle, with the source next to each entry. Use it, cite it, and do not contradict it: where your own reading differs, say so explicitly and cite the page.',
    limits,
    ...(scope.options === false ? {} : { options }),
    plan_gates: gates,
  };
}

/**
 * The same knowledge, computed once per document. Every caller in a save path
 * asks for it — the approach input, the deck data, the challenge pass, the deck
 * validator — and rebuilding it each time walks the whole question bank again.
 */
const cache = new WeakMap();
export function knowledgeFor(doc, scope = {}) {
  const key = scope.options === false ? 'no-options' : 'full';
  const entry = cache.get(doc) ?? {};
  if (!entry[key]) {
    entry[key] = verifiedKnowledge(doc, scope);
    cache.set(doc, entry);
  }
  return entry[key];
}

/** Rough size of the knowledge block, so callers can see what they are sending. */
export const knowledgeBytes = (knowledge) => Buffer.byteLength(JSON.stringify(knowledge));
