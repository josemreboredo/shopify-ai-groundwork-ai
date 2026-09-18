/**
 * @file challenge.js
 * @description The adversarial pass: what a second expert would say about the draft.
 *
 * The approach validator checks that the work is *present* — sources cited, options
 * weighed, axes filled. It cannot tell whether the work is *right*. This module
 * does the other job: it reads the draft against everything the engine knows and
 * looks for the four ways a well-formed document is still wrong.
 *
 *   1. An option we had already documented was never considered.
 *   2. A limit we had already written down does not appear anywhere in the draft.
 *   3. An assumption is carrying the recommendation, and no risk covers it.
 *   4. A number was available and the argument stayed vague.
 *   5. An open flag from the engine that the draft never answers.
 *   6. A recommendation that asks more of the client's organisation than they have.
 *
 * It is deterministic on purpose. A second model asked to "be critical" produces
 * plausible criticism; this produces criticism that can be traced to a question id
 * or a documented limit, which is the only kind worth acting on.
 *
 * Findings are not blockers. A draft can be right and still trip one of these —
 * the point is that the writer has to answer them, in the draft or in the risks,
 * rather than never meeting them.
 *
 * @module discovery/challenge
 */

import { knowledgeFor } from './knowledge.js';
import { toApproachPayload } from './approach.js';
import { runCostFor } from './economics.js';
import { feasibilityFindings } from './feasibility.js';

/** Words that mean the draft engaged with a subject, not just mentioned it. */
const mentions = (haystack, needle) => haystack.toLowerCase().includes(needle.toLowerCase());

/** The distinctive words of a sentence, for matching a limit against a draft. */
function keyTerms(text, max = 6) {
  const stop = new Set(['the', 'and', 'for', 'are', 'not', 'with', 'that', 'this', 'from', 'can', 'cannot', 'must', 'only', 'your', 'you', 'they', 'their', 'have', 'has', 'been', 'will', 'when', 'where', 'which', 'into', 'per', 'all', 'any', 'each', 'more', 'than', 'but', 'its',
    // Too common in this domain to prove anything on their own.
    'shopify', 'store', 'stores', 'build', 'built', 'new', 'existing', 'client', 'clients', 'customer', 'customers', 'order', 'orders', 'app', 'apps', 'native', 'theme', 'data', 'market', 'markets', 'plan', 'checkout', 'product', 'products', 'price', 'prices', 'pricing', 'one', 'own', 'use', 'used', 'using', 'without', 'need', 'needs', 'work', 'works']);
  return [...new Set(String(text).toLowerCase().match(/[a-z][a-z-]{3,}/g) ?? [])]
    .filter((w) => !stop.has(w))
    .slice(0, max);
}

/**
 * Challenge a drafted approach.
 *
 * @param {object} payload  Approach in the drafting shape
 * @param {object} doc      Decided engagement
 * @returns {{ id: string, severity: 'high'|'medium', finding: string, why_it_matters: string, evidence: string }[]}
 */
export function challengeApproach(payload, doc) {
  const out = [];
  const decisions = payload.architecture_decisions ?? [];
  const capabilities = payload.capability_map ?? [];
  const risks = payload.risk_register ?? [];
  const assumptions = payload.assumptions ?? [];
  const draft = JSON.stringify([decisions, capabilities, risks, assumptions, payload.non_functional, payload.app_shortlist]);
  const knowledge = knowledgeFor(doc);

  // The questions the draft itself leans on. Everything below is scoped to these:
  // a review that complains about answers the document never used is noise, and
  // noise is how a reviewer learns to skip the review.
  const cited = new Set([
    ...capabilities.flatMap((c) => c.question_ids ?? []),
    ...decisions.flatMap((d) => d.question_ids ?? []),
    ...(payload.integration_architecture ?? []).flatMap((i) => i.question_ids ?? []),
  ]);
  const covered = (text, min = 2) => {
    const terms = keyTerms(text, 5);
    return terms.length === 0 || terms.filter((t) => mentions(draft, t)).length >= Math.min(min, terms.length);
  };

  // 1 — a documented alternative dropped from a decision that rests on that very
  // answer. Option against option, not option against the whole document: the
  // question is whether this decision weighed it, not whether the word appears.
  const byQuestion = new Map(knowledge.options.map((entry) => [entry.question_id, entry]));
  for (const decision of decisions) {
    const weighed = JSON.stringify(decision.options ?? []).toLowerCase();
    for (const id of decision.question_ids ?? []) {
      const entry = byQuestion.get(id);
      if (!entry) continue;
      const dropped = entry.options.filter((o) => {
        const terms = keyTerms(o.option, 4);
        return terms.length > 0 && !terms.some((t) => weighed.includes(t));
      });
      if (!dropped.length || dropped.length === entry.options.length) continue;
      out.push({
        id: `dropped-alternative:${decision.topic}:${id}`,
        severity: 'high',
        finding: `"${decision.topic}" rests on ${id}, where the question bank weighs ${entry.options.length} options — and ${dropped.map((o) => `"${o.option}"`).join(', ')} ${dropped.length > 1 ? 'are' : 'is'} not among the options the decision considered`,
        why_it_matters: 'An option the client can find in ten minutes, and we did not weigh, is the question that ends a presentation badly',
        evidence: `${id} — ${entry.about}`,
      });
    }
  }

  // 2 — a limit attached to an answer the draft used to justify something. If the
  // answer was good enough to cite, its documented limit was good enough to meet.
  for (const entry of knowledge.limits) {
    if (!cited.has(entry.question_id)) continue;
    if (covered(entry.limits, 2)) continue;
    out.push({
      id: `unaddressed-limit:${entry.question_id}`,
      severity: 'high',
      finding: `${entry.question_id} is cited in the draft, but its documented limit is not addressed: "${String(entry.limits).slice(0, 180)}${entry.limits.length > 180 ? '…' : ''}"`,
      why_it_matters: 'A limit we had already written down, attached to an answer we leaned on, and left out of the document',
      evidence: `${entry.question_id} — ${entry.about}`,
    });
  }

  // 3 — an assumption carrying the recommendation, with no risk behind it
  const topologyAssumptions = doc.markets?.topology?.assumptions ?? [];
  for (const a of [...assumptions.map((x) => ({ about: x.statement, impact_if_wrong: x.impact_if_wrong })), ...topologyAssumptions]) {
    const terms = keyTerms(a.about ?? '', 4);
    const covered = terms.length > 0 && terms.some((t) => risks.some((r) => mentions(JSON.stringify(r), t)));
    if (!covered && (a.impact_if_wrong ?? '').trim()) {
      out.push({
        id: `uncovered-assumption:${(a.about ?? '').slice(0, 40)}`,
        severity: 'medium',
        finding: `The assumption "${a.about}" has an impact if wrong ("${String(a.impact_if_wrong).slice(0, 120)}…") and no risk in the register covers it`,
        why_it_matters: 'An assumption with consequences and no owner is a risk nobody is watching',
        evidence: a.question_id ?? 'approach assumptions',
      });
    }
  }

  // 4 — an argument that stayed vague when the arithmetic was available
  const cost = runCostFor(doc);
  const figures = [...cost.per_order.map((f) => f.per_month), cost.basis.average_order_value].filter((n) => n !== undefined);
  if (figures.length) {
    const quoted = figures.some((n) => draft.includes(String(Math.round(n))));
    if (!quoted) {
      out.push({
        id: 'unused-arithmetic',
        severity: 'medium',
        finding: `The engagement's own numbers were available (${cost.basis.orders_per_month} orders a month, average basket ${cost.basis.average_order_value} ${cost.basis.currency ?? ''}) and no part of the draft uses them`,
        why_it_matters: '"More expensive" is an opinion; the same sentence with the client\'s own figures is an argument',
        evidence: cost.basis.from.join(', '),
      });
    }
  }

  // 5 — a flag the engine raised that the draft never answers
  for (const item of doc.exits?.items ?? []) {
    if (item.resolution?.status !== 'open') continue;
    if (!mentions(draft, item.rule_id)) {
      out.push({
        id: `unanswered-flag:${item.rule_id}`,
        severity: item.result === 'STOP' ? 'high' : 'medium',
        finding: `Exit rule ${item.rule_id} (${item.result}) is open and the draft never refers to it`,
        why_it_matters: 'The engine raised it from the answers; a document that ignores it is arguing against its own evidence',
        evidence: `${item.rule_id} — ${item.detail}`,
      });
    }
  }

  // 6 — the recommendation against the organisation that has to run it. The engine
  // decides what can be built; this asks whether this client can operate it.
  out.push(...feasibilityFindings(payload, doc));

  return out;
}

const challengeCache = new WeakMap();

/**
 * The challenge for a saved engagement, computed once. The deck path asks three
 * times — for the deck data, for deck_xml and for the deck gate — and each run
 * reads the whole question bank. It takes the document, not a payload, so the
 * three callers cannot each build their own and miss the cache.
 *
 * @param {object} doc  Decided engagement with an approach
 */
export function challengesFor(doc) {
  if (!challengeCache.has(doc)) challengeCache.set(doc, challengeApproach(toApproachPayload(doc.approach ?? {}), doc));
  return challengeCache.get(doc);
}

/** The highest-severity findings first, capped so the writer acts instead of skimming. */
export const topChallenges = (findings, limit = 12) =>
  [...findings].sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'high' ? -1 : 1)).slice(0, limit);
