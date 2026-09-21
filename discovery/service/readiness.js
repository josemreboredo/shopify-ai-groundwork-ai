/**
 * @file readiness.js
 * @description Whether this bid can be priced yet, and what each gap costs.
 *
 * Step 3 asks a question for a room, once: can Merkle put a number on this and
 * stand behind it. This asks a work-state question, re-answered on every
 * document read in and every answer confirmed: what is left, and what happens if
 * we never learn it.
 *
 * The denominator is the engine's own decisions — 7 scope gates, 3 L-triggers
 * and 23 exit rules, 33 in all, every one of which declares the pointers it
 * reads. That is a constant of the offering rather than of the client, so two
 * bids are comparable; no ratio of questions is, because `only_if` moves the
 * question count per client and one question can drive six rules while three
 * drive one.
 *
 * It is deliberately not called completeness, and the number is not the gate. A
 * bid with thirty-two of thirty-three settled and the store topology open is not
 * ninety-seven per cent ready — it is not ready, and a percentage averages away
 * the one thing blocking it. That was the fault in the "28% of what sets the
 * price" line deleted from the go/no-go. The gate is a list of blockers, each
 * carrying its evidence; the ratio is the trend beside it.
 *
 * @module discovery/service/readiness
 */

import { offering, questionBank } from '../schema/index.js';
import { answeredAt } from '../agents/discovery/knowledge.js';
import { requiredPlan, planRequirements, PLAN_LABEL } from '../agents/discovery/plan.js';

/** The one STOP that fires on the total rather than on any single answer. */
const EFFORT_RULE = '11.3';

/** Every decision the engine makes, with the answers it reads. */
function decisions() {
  return [
    ...offering.scope_gates.map((g) => ({ kind: 'gate', id: g.id, label: g.label, inputs: g.inputs ?? [] })),
    ...offering.l_triggers.map((t) => ({ kind: 'trigger', id: t.id, label: t.label, inputs: t.inputs ?? [] })),
    ...offering.exit_rules.map((r) => ({ kind: 'rule', id: r.id, label: r.condition, inputs: r.inputs ?? [] })),
  ];
}

/** `/markets/list/*\/currency` as a test over the concrete pointers in provenance. */
// Anchored at both ends, allowing only a deeper path. Unanchored, /business/budget
// matched the unrelated pointer /business/budget_note, so one stray unconfirmed
// answer could mark a decision "not yet confirmed" on evidence that was not its own.
const matcher = (input) => new RegExp(`^${input.split('*').map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[^/]+')}(/|$)`);

/**
 * Settled means the engine has what it needs and a person has stood behind it.
 *
 * A decision that fired is settled by definition — it read enough to fire. One
 * that did not may simply have had nothing to read, which is the distinction the
 * complexity chart was getting wrong until recently. And an answer still waiting
 * on a human does not count: it is the same precondition step 3 already enforces,
 * because a bid cannot rest on an extraction nobody has checked.
 */
/**
 * An input the answers have already ruled out.
 *
 * Exit rule 11.26 reads where the editorial content lives and which front end
 * the storefront is — questions the bank skips outright when the storefront is
 * not headless. On every engagement that is not headless those pointers can
 * never be answered, so the rule counted as open for ever and dragged the
 * denominator down on every bid in the system. A decision nobody can ever
 * settle is not an open decision; it is one the answers have closed.
 *
 * @param {string} pointer  a decision input, e.g. "/design/headless/framework"
 * @param {object} doc
 */
function ruledOut(pointer, doc) {
  const owner = questionBank.questions.find((q) => q.maps_to.some((m) => m === pointer || pointer.startsWith(`${m}/`) || m.startsWith(`${pointer}/`)));
  const rule = owner?.skip_if;
  if (!rule) return false;
  const target = questionBank.questions.find((q) => q.id === rule.question);
  const value = target && answeredAt(doc, target.maps_to[0]) ? valueAt(doc, target.maps_to[0]) : undefined;
  if (value === undefined) return false;
  if ('equals' in rule) return value === rule.equals;
  if ('excludes' in rule) return Array.isArray(value) && !value.includes(rule.excludes);
  return false;
}

/** The value a pointer holds in the document, or undefined. */
function valueAt(doc, pointer) {
  return pointer.replace(/^\//, '').split('/').reduce((node, key) => (node == null ? undefined : node[key]), doc);
}

function settle(decision, doc, provenance, fired) {
  if (fired.has(decision.id)) return { settled: true, why: 'fired on the answers' };
  const declared = decision.inputs;
  if (!declared.length) return { settled: false, why: 'reads nothing this tool records' };
  const inputs = declared.filter((p) => !ruledOut(p, doc));
  if (!inputs.length) return { settled: true, why: 'the answers ruled out everything it reads' };
  const missing = inputs.filter((p) => !answeredAt(doc, p));
  if (missing.length) return { settled: false, why: 'nothing recorded for it', missing };
  const unconfirmed = Object.entries(provenance ?? {})
    .filter(([pointer, p]) => p?.status === 'tbc' && inputs.some((input) => matcher(input).test(pointer)))
    .map(([pointer]) => pointer);
  if (unconfirmed.length) return { settled: false, why: 'read from a document and not yet confirmed', unconfirmed };
  return { settled: true, why: 'answered and confirmed, and it did not fire' };
}

/**
 * What the bid stands on now.
 *
 * @param {object} doc  decided engagement
 * @param {{ provenance?: object, toReview?: number, triage?: object, openTopics?: object[],
 *           cannotPrice?: string[], assumptions?: object[], documents?: object[] }} state
 */
export function readiness(doc, state = {}) {
  // A discovery is already won. "Ready to price" is the bid's question, and it
  // read as that on a won engagement where there is nothing left to price —
  // the spine had already changed to the discovery steps and this had not.
  const bid = (state.process ?? 'rfp') === 'rfp';
  const fired = new Set([
    ...Object.entries(doc.offer?.scope_gates ?? {}).filter(([, g]) => g.active).map(([id]) => id),
    ...Object.entries(doc.offer?.l_triggers ?? {}).filter(([, t]) => t.active).map(([id]) => id),
    ...(doc.exits?.items ?? []).map((i) => i.rule_id),
  ]);

  const all = decisions().map((d) => ({ ...d, ...settle(d, doc, state.provenance, fired) }));
  const settled = all.filter((d) => d.settled);
  const open = all.filter((d) => !d.settled);

  const stops = (doc.exits?.items ?? []).filter((i) => i.result === 'STOP');
  const shaping = (state.openTopics ?? []).filter((t) => t.impact === 'high');
  const undecided = state.triage?.proposed?.length ?? 0;

  // Five things stop a price, and each one carries its own evidence. None of
  // them is a threshold on a ratio, because the ratio cannot see which of the
  // thirty-three is the one you actually need.
  const blockers = [
    state.toReview ? { what: `${state.toReview} answer${state.toReview === 1 ? '' : 's'} still to confirm`, where: 'review', why: `${bid ? 'A bid' : 'A closing document'} cannot rest on an extraction nobody has checked.` } : null,
    // Only a bid is stopped by being outside the offers: an engagement that has
    // been won is being delivered, whatever shape it was sold in.
    // Same distinction the go/no-go makes, and for the same reason: the effort
    // ceiling fires on the sum, so counting it as a requirement sends a reader
    // looking for one. It is also the blocker most often misread as missing
    // information — every question answered, and the page still not ready,
    // because what stops the price is the size of the scope and not a gap in it.
    bid && stops.length ? (() => {
      const named = stops.filter((x) => x.rule_id !== EFFORT_RULE);
      const overrun = stops.find((x) => x.rule_id === EFFORT_RULE);
      const what = named.length
        ? `${named.length} requirement${named.length === 1 ? '' : 's'} outside the standard offers${overrun ? ', and a scope past the largest offer' : ''}`
        : 'The scope, as a whole, is past what the largest offer holds';
      return { what, where: 'go-no-go', why: stops.map((x) => x.evidence).join('; ') };
    })() : null,
    bid && (state.cannotPrice ?? []).length ? { what: `${state.cannotPrice.length} input${state.cannotPrice.length === 1 ? '' : 's'} that cannot be costed at all`, where: 'clarifications', why: state.cannotPrice.join('; ') } : null,
    shaping.length ? { what: `${shaping.length} open topic${shaping.length === 1 ? '' : 's'} that change the shape of the solution`, where: 'clarifications', why: shaping.map((t) => t.title).join(', ') } : null,
    // The Q&A is a step on a bid and a view in a discovery, so an untriaged
    // question stops one and not the other.
    bid && undecided ? { what: `${undecided} question${undecided === 1 ? '' : 's'} not yet asked or assumed`, where: 'clarifications', why: 'Undecided, a question reaches the client as neither.' } : null,
  ].filter(Boolean);

  const assumptions = state.assumptions ?? [];
  return {
    ready: blockers.length === 0,
    // What being ready is for. A bid is priced; a discovery is closed.
    for: bid ? 'price' : 'close',
    blockers,
    decisions: {
      settled: settled.length,
      total: all.length,
      open: open.map(({ kind, id, label, why, missing }) => ({ kind, id, label, why, missing: missing ?? [] })),
    },
    counts: {
      to_confirm: state.toReview ?? 0,
      undecided,
      assumptions: assumptions.length,
      assumptions_without_consequence: assumptions.filter((a) => !a.impact_if_wrong).length,
      stops: stops.length,
      flags: (doc.exits?.items ?? []).filter((i) => i.result === 'FLAG').length,
      warns: (doc.exits?.items ?? []).filter((i) => i.result === 'WARN').length,
    },
    // What each document actually settled, so the page answers an upload.
    documents: state.documents ?? [],
  };
}

/**
 * What is still open, grouped by what it costs rather than by where it came from.
 *
 * A list of question ids tells a reader nothing. Two groups do: the ones that
 * stop a price being put on the work at all, and the ones that will simply be
 * priced on an assumption — with what that assumption is, what it costs to be
 * wrong and who chose it.
 *
 * A row with an assumption but no consequence is the worst row on the page. That
 * is the one that becomes a scope argument three months into a build, so it is
 * marked rather than listed quietly among the rest.
 *
 * @param {object[]} topics  open topics from the engine
 * @param {object[]} assumptions  what the proposal will state
 * @param {string[]} cannotPrice  inputs with no assumption that covers them
 */
export function openPoints(topics, assumptions, cannotPrice) {
  const blocks = [
    ...cannotPrice.map((item) => ({
      what: item,
      moves: ['what the solution costs to run'],
      consequence: null,
      owner: null,
      settles: [],
      reason: 'cannot be costed at all until it is answered',
    })),
    ...topics.filter((t) => t.impact === 'high').map((t) => ({
      what: t.title,
      moves: t.changes ?? [],
      consequence: null,
      owner: null,
      settles: (t.covers ?? []).map((c) => c.question_id),
      reason: 'changes the shape of the solution',
    })),
  ];

  const assumed = [
    ...assumptions.map((a) => ({
      what: a.about,
      moves: [],
      consequence: a.impact_if_wrong,
      owner: a.owner ?? null,
      settles: a.covers ?? [],
      reason: a.source === 'rejected' ? 'we decided not to ask' : 'the engine had to assume it',
    })),
    ...topics.filter((t) => t.impact !== 'high').map((t) => ({
      what: t.title,
      moves: t.changes ?? [],
      consequence: null,
      owner: null,
      settles: (t.covers ?? []).map((c) => c.question_id),
      reason: 'still open, and assumable',
    })),
  ];

  return {
    blocks_a_price: blocks,
    priced_on_an_assumption: assumed,
    // Stated, but nobody said what being wrong costs.
    without_consequence: assumed.filter((r) => r.reason !== 'still open, and assumable' && !r.consequence).length,
  };
}

/**
 * The two technical answers an offer has to carry however it is sold.
 *
 * A bid can be beyond S, M and L — priced on its own, routed to an Enterprise
 * Engagement — and still owes the client the same two things: what it would be
 * built on, and which Shopify plan the requirements force. Those are
 * determinations about the work, not about the commercial shape, so they survive
 * an engagement leaving the offering. They were only ever visible inside the
 * closing document, which is written last.
 *
 * Both carry their reasons. The plan cites the Shopify page that sets each
 * limit; the storefront cites the answer that decided it.
 *
 * @param {object} doc  decided engagement
 */
export function technicalAnswer(doc) {
  const required = requiredPlan(doc) ?? 'basic';
  const stated = doc.shopify?.target_plan;
  const known = stated && stated !== 'not_sure' ? stated : null;

  // The storefront is decided by the headless trigger, not by the offer code.
  // An engagement outside the offers has no offer code, and still has an answer.
  const headless = doc.offer?.l_triggers?.headless;
  const track = headless?.active ? 'hydrogen' : 'liquid';

  return {
    storefront: {
      track,
      label: track === 'hydrogen' ? 'Headless — Hydrogen on the Storefront API' : 'Shopify’s Online Store, themed',
      why: track === 'hydrogen'
        ? 'A headless storefront was asked for, so the front end is built and hosted by Merkle and Shopify runs the commerce behind it.'
        : 'Nothing in the requirements asks for a front end outside Shopify, so the storefront stays on the Online Store — cheaper to build, and the client’s own team can change it.',
      evidence: headless?.evidence ?? null,
      // What would move it, said plainly rather than left as a silent default.
      would_change_it: track === 'hydrogen'
        ? null
        : 'A separate content platform or a custom front end would move it, and add a second build stream.',
    },
    plan: {
      required,
      label: required === 'basic' ? 'Basic is enough' : PLAN_LABEL[required],
      client_stated: known,
      // Every rule that forces a plan, each with the page that sets the limit.
      forced_by: planRequirements(doc).map((r) => ({ feature: r.feature, plan: PLAN_LABEL[r.plan], docs: r.docs })),
      disagreement: known && known !== required
        ? `The client expects ${PLAN_LABEL[known]}; the requirements need ${required === 'basic' ? 'Basic' : PLAN_LABEL[required]}`
        : null,
    },
  };
}
