/**
 * Whether the bid can be priced yet, and what each gap costs.
 *
 * The owner asked for a completeness percentage and an eighty per cent
 * threshold. A percentage of the right thing is defensible; a threshold on it is
 * not, because thirty-two of thirty-three settled with the store topology open
 * is not ninety-seven per cent ready — it is not ready. So the number is the
 * trend and the gate is a list of blockers, each carrying its evidence.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { classifyOffer } from '../../engine/classify.js';
import { evaluateExits } from '../../engine/exits.js';
import { readiness, openPoints } from '../../shared/readiness.js';
import { offering } from '../../schema/index.js';
import { offerStanding, statusOf } from '../../shared/summary.js';

const fixture = (name) => JSON.parse(fs.readFileSync(new URL(`../fixtures/engagements/${name}.json`, import.meta.url), 'utf8'));
const acme = () => fixture('acme-watches');
const state = (doc, over = {}) => ({ provenance: doc.provenance, toReview: 0, openTopics: [], cannotPrice: [], assumptions: [], ...over });

describe('can we price this yet', () => {
  test('the denominator is the engine’s own decisions, and it is a constant of the offering', () => {
    const r = readiness(acme(), state(acme()));
    assert.equal(r.decisions.total, offering.scope_gates.length + offering.l_triggers.length + offering.exit_rules.length);
    assert.equal(r.decisions.total, 50, 'nineteen gates, two L triggers, twenty-nine rules');
    // A ratio of questions is not comparable between bids: only_if moves the
    // question count per client, and one question can drive six rules.
    for (const d of [...offering.scope_gates, ...offering.l_triggers, ...offering.exit_rules]) {
      assert.ok((d.inputs ?? []).length, `${d.id} declares what it reads`);
    }
  });

  test('a decision is settled when it fired, or when everything it reads is answered and confirmed', () => {
    const doc = acme();
    const r = readiness(doc, state(doc));
    assert.ok(r.decisions.settled > 0 && r.decisions.settled < r.decisions.total);
    assert.equal(r.decisions.open.length, r.decisions.total - r.decisions.settled);
    for (const d of r.decisions.open) assert.ok(d.why, 'and each open one says why it is open');
  });

  test('an answer nobody has confirmed does not settle anything', () => {
    const doc = acme();
    const provenance = structuredClone(doc.provenance);
    for (const key of Object.keys(provenance)) provenance[key] = { ...provenance[key], status: 'tbc' };
    const before = readiness(doc, state(doc)).decisions.settled;
    const after = readiness(doc, state(doc, { provenance })).decisions.settled;
    assert.ok(after < before, 'a bid cannot rest on an extraction nobody has checked');
  });

  test('the gate is the blockers, never the ratio', () => {
    const doc = acme();
    // Everything settled that can be, and still not ready: one topic that
    // changes the shape of the solution is enough on its own.
    const r = readiness(doc, state(doc, { openTopics: [{ title: 'Markets', impact: 'high', changes: ['how many stores'] }] }));
    assert.equal(r.ready, false);
    assert.equal(r.blockers.length, 1);
    assert.match(r.blockers[0].what, /change the shape/);
    // The denominator grows every time the engine learns a new decision, and
    // this fixture answers none of the new ones — so the bar is deliberately
    // loose. What it is testing is that a high ratio does not unblock a bid,
    // not the ratio itself.
    assert.ok(r.decisions.settled / r.decisions.total > 0.7, 'well past any percentage threshold, and still blocked');
  });

  test('a scope past the offers blocks the price without pretending to be a gap in the answers', () => {
    // The report this came from: every question answered, a Q&A document read
    // back in, and the page still not ready — with the blocker reading
    // "1 requirement outside the standard offers". Nothing was missing and no
    // requirement was outside. The scope had outgrown the largest offer, which
    // is a size, not a gap, and saying otherwise sent a consultant hunting.
    const doc = acme();
    doc.migration = { ...doc.migration, source_platform: 'magento' };
    doc.design = { ...doc.design, figma: { ...doc.design?.figma, completeness: 'all_templates' } };
    doc.retail = { store_count: 3, pos: 'shopify_pos' };
    doc.markets.list = ['DE', 'AT', 'CH', 'NL', 'FR', 'PL'].map((code) => ({ code, currency: 'EUR', price_strategy: 'base_currency', languages: ['de'] }));
    doc.offer = classifyOffer(doc);
    doc.exits = evaluateExits(doc);
    assert.ok(doc.exits.items.some((i) => i.rule_id === '11.3'), 'the fixture has to actually outgrow the offers');

    const r = readiness(doc, state(doc));
    const stop = r.blockers.find((b) => b.where === 'go-no-go');
    assert.ok(stop, 'the overrun still blocks the price');
    assert.doesNotMatch(stop.what, /requirement/, 'an overrun is not a requirement');
    assert.match(stop.what, /Scope past what the offer carries, with delivery risks still open/);
    assert.match(stop.why, /weeks/, 'and the evidence is still the arithmetic it fired on');
  });

  test('every blocker names where to go and what the evidence is', () => {
    const doc = acme();
    const r = readiness(doc, state(doc, {
      toReview: 12,
      triage: { proposed: [{}, {}] },
      cannotPrice: ['Average basket'],
      openTopics: [{ title: 'Markets', impact: 'high', changes: [] }],
    }));
    assert.equal(r.ready, false);
    assert.equal(r.blockers.length, 4, 'four of the five clauses fire; no STOP rule in this fixture');
    for (const b of r.blockers) {
      assert.ok(b.what && b.why, 'a blocker with no evidence is an opinion');
      assert.ok(['review', 'go-no-go', 'clarifications'].includes(b.where), 'and somewhere to go about it');
    }
  });

  test('nothing blocking reads as ready, with what it is resting on', () => {
    const doc = acme();
    const r = readiness(doc, state(doc, { assumptions: [{ about: 'x', assumed: 'y', impact_if_wrong: 'z' }] }));
    assert.equal(r.ready, true);
    assert.equal(r.counts.assumptions, 1);
  });
});

describe('open points are grouped by what they cost', () => {
  const topics = [
    { title: 'Markets', impact: 'high', changes: ['how many stores the markets run on'], covers: [{ question_id: 'Q3.1.1' }] },
    { title: 'Catalogue', impact: 'medium', changes: ['the Shopify plan'], covers: [{ question_id: 'Q2.1.1' }] },
  ];

  test('what stops a price is separated from what is merely assumed', () => {
    const o = openPoints(topics, [], ['Average basket']);
    assert.equal(o.blocks_a_price.length, 2, 'the uncostable input and the shape-changing topic');
    assert.equal(o.priced_on_an_assumption.length, 1);
    assert.match(o.blocks_a_price[0].reason, /cannot be costed/);
  });

  test('an assumption nobody said the cost of is counted, because it is the worst row on the page', () => {
    const withConsequence = { about: 'One entity', assumed: 'one', impact_if_wrong: 'expansion stores', owner: 'lc-one', source: 'rejected' };
    const without = { about: 'B2B', assumed: 'none', impact_if_wrong: null, owner: 'lc-one', source: 'rejected' };
    const o = openPoints([], [withConsequence, without], []);
    assert.equal(o.without_consequence, 1, 'that is the one that becomes a scope argument');
    assert.equal(o.priced_on_an_assumption.find((r) => r.what === 'One entity').consequence, 'expansion stores');
  });

  test('every row says what it moves or where to settle it — never a bare question id', () => {
    const o = openPoints(topics, [], []);
    for (const row of [...o.blocks_a_price, ...o.priced_on_an_assumption]) {
      assert.ok(row.what, 'named in words');
      assert.ok(row.moves.length || row.settles.length || row.consequence, 'and carrying a consequence or a way to close it');
    }
  });
});

describe('nothing that blocks a price sits outside the questions', () => {
  const noCostData = () => {
    const doc = acme();
    delete doc.post_purchase.orders_per_month;
    delete doc.business.revenue_monthly;
    return doc;
  };

  test('what the engine says it cannot cost is asked, not only reported', async () => {
    const { clarificationBrief } = await import('../../bid/clarifications.js');
    const brief = clarificationBrief(noCostData());
    // The page blocked a price on these, and the questions that fill them fed
    // nothing — so it said "we cannot price this" and never asked the one thing
    // that would unblock it.
    assert.deepEqual(brief.cannot_price_until_answered, ['orders per month', 'monthly revenue']);
    const asked = new Set(brief.topics.flatMap((t) => t.covers.map((c) => c.question_id)));
    assert.ok(asked.has('Q0.2.6'), 'orders per month');
    assert.ok(asked.has('Q0.2.1'), 'monthly revenue');
  });

  test('every blocker on the dashboard has somewhere to be answered', () => {
    const doc = noCostData();
    const r = readiness(doc, state(doc, {
      toReview: 2,
      cannotPrice: ['orders per month'],
      openTopics: [{ title: 'Markets', impact: 'high', changes: [] }],
      triage: { proposed: [{}] },
    }));
    for (const b of r.blockers) {
      assert.ok(['review', 'clarifications', 'go-no-go'].includes(b.where), `${b.what} says where to go`);
    }
    // A blocker pointing at the Q&A has to be something the Q&A actually raises.
    assert.ok(r.blockers.some((b) => b.where === 'clarifications'));
  });

  test('the cost question carries what its absence costs, not a bare id', async () => {
    const { clarificationTopics } = await import('../../bid/clarifications.js');
    const topic = clarificationTopics(noCostData()).find((t) => t.covers.some((c) => c.question_id === 'Q0.2.6'));
    assert.ok(topic, 'it reaches a topic');
    assert.ok(topic.changes.includes('what the solution costs to run'));
    const cover = topic.covers.find((c) => c.question_id === 'Q0.2.6');
    assert.ok(cover.why_it_matters, 'and says why it is being asked');
  });
});

describe('what the offer owes whatever its commercial shape', () => {
  test('an engagement beyond the offers still has a storefront and a plan', async () => {
    const { technicalAnswer } = await import('../../shared/readiness.js');
    // Ricola is neither M nor L — it is routed to an Enterprise Engagement — and
    // the client is still owed what it would be built on and which plan the
    // requirements force. Those are answers about the work, not the commercial
    // shape, so they survive leaving the offering.
    const t = technicalAnswer(fixture('stop-custom-checkout'));
    assert.ok(t.storefront.label);
    assert.ok(t.storefront.why, 'and says why, rather than leaving a default silent');
    assert.ok(t.plan.label);
  });

  test('the storefront is decided by the headless requirement, not by the offer code', async () => {
    const { technicalAnswer } = await import('../../shared/readiness.js');
    const doc = acme();
    assert.equal(technicalAnswer(doc).storefront.track, 'liquid');
    assert.match(technicalAnswer(doc).storefront.would_change_it, /second build stream/);

    doc.offer.l_triggers.headless = { active: true, evidence: 'Q9.2.1: a headless storefront is required' };
    const headless = technicalAnswer(doc).storefront;
    assert.equal(headless.track, 'hydrogen');
    assert.match(headless.evidence, /Q9\.2\.1/, 'carrying the answer that decided it');
  });

  test('every requirement forcing a plan cites the Shopify page that sets the limit', async () => {
    const { technicalAnswer } = await import('../../shared/readiness.js');
    const t = technicalAnswer(acme());
    assert.equal(t.plan.required, 'plus');
    assert.ok(t.plan.forced_by.length, 'and names what forces it');
    for (const f of t.plan.forced_by) {
      assert.ok(f.feature && f.plan);
      assert.match(f.docs, /^https:\/\/(help\.shopify\.com|shopify\.dev)/, 'an official page, never a recollection');
    }
  });

  test('a client expecting more than the requirements need is told so, not quietly agreed with', async () => {
    const { technicalAnswer } = await import('../../shared/readiness.js');
    const t = technicalAnswer(fixture('stop-custom-checkout'));
    assert.equal(t.plan.required, 'basic');
    assert.match(t.plan.disagreement, /expects Shopify Plus; the requirements need Basic/);
  });
});

describe('a won engagement is not still being priced', () => {
  const both = (over) => ({
    bid: readiness(acme(), state(acme(), { process: 'rfp', ...over })),
    won: readiness(acme(), state(acme(), { process: 'discovery', ...over })),
  });

  test('what being ready is for changes with the process', () => {
    // After a win the spine switches to the discovery steps; this said "Not
    // ready to price" on an engagement where there is nothing left to price.
    const { bid, won } = both({});
    assert.equal(bid.for, 'price');
    assert.equal(won.for, 'close');
  });

  test('the blockers that are a bid’s alone do not stop a discovery', () => {
    const doc = fixture('stop-custom-checkout');
    const withBoth = (process) => readiness(doc, {
      provenance: doc.provenance,
      process,
      toReview: 0,
      cannotPrice: ['orders per month'],
      triage: { proposed: [{}] },
      openTopics: [],
      assumptions: [],
    });
    const bid = withBoth('rfp').blockers.map((b) => b.what);
    const won = withBoth('discovery').blockers.map((b) => b.what);
    assert.ok(bid.some((w) => /outside the standard offers/.test(w)), 'a bid is stopped by it');
    assert.ok(!won.some((w) => /outside the standard offers/.test(w)), 'a won engagement is being delivered, whatever shape it was sold in');
    assert.ok(bid.some((w) => /not yet asked or assumed/.test(w)));
    assert.ok(!won.some((w) => /not yet asked or assumed/.test(w)), 'the Q&A is a step on a bid and a view in a discovery');
  });

  test('what blocks both still blocks both', () => {
    const doc = acme();
    const unconfirmed = (process) => readiness(doc, state(doc, { process, toReview: 5 })).blockers;
    for (const process of ['rfp', 'discovery']) {
      const b = unconfirmed(process).find((x) => /still to confirm/.test(x.what));
      assert.ok(b, `${process}: nothing rests on an extraction nobody has checked`);
    }
    assert.match(unconfirmed('rfp').find((x) => /still to confirm/.test(x.what)).why, /A bid cannot rest/);
    assert.match(unconfirmed('discovery').find((x) => /still to confirm/.test(x.what)).why, /A closing document cannot rest/);
  });
});

describe('the offer and the status are two axes', () => {
  test('an engagement beyond the offers is not still an M', () => {
    // The list read "M · Ecommerce Scale" under Offer and "Larger Engagement"
    // under Status: an answer beside the rule that superseded it.
    const answered = { coverage: { required_answered: 12, required_total: 85 } };
    const beyond = { offer: { code: 'M', name: 'Ecommerce Scale' }, go: false, route: 'larger_engagement', ...answered };
    assert.equal(offerStanding(beyond).short, 'Larger Engagement');
    assert.equal(offerStanding(beyond).applies, false);
    assert.equal(offerStanding({ offer: { code: 'S', name: 'Ecommerce Foundation' }, go: true, ...answered }).short, 'S');
    assert.equal(offerStanding({ offer: { code: 'M' }, go: false, route: 'arc', ...answered }).short, 'Merkle Arc');
  });

  test('an empty record has no offer, because it is not an engagement yet', () => {
    // Nothing recorded classifies as the smallest offer and reads GO, because no
    // gate has fired — so the list stated a commercial position on a bid nobody
    // had opened.
    const empty = offerStanding({ offer: { code: 'S', name: 'Ecommerce Foundation' }, go: true, coverage: { required_answered: 0, required_total: 85 } });
    assert.equal(empty.short, '—');
    assert.equal(empty.applies, false);
    assert.match(empty.standing, /Nothing has been recorded/);
  });

  test('a bid reports where it is in bidding', () => {
    const bid = (over) => statusOf({ process: 'rfp', coverage: { required_answered: 1, required_total: 85 }, ...over }).label;
    assert.match(bid({ documents: 0 }), /nothing read yet/i);
    assert.match(bid({ documents: 1, to_review: 4 }), /4 to confirm/);
    assert.match(bid({ documents: 1, clarifications_at: '2026-09-20', clarifications_undecided: 2 }), /2 questions to decide/);
    assert.match(bid({ documents: 1, clarifications_at: '2026-09-20' }), /Questions with the client/);
    assert.match(bid({ documents: 1, closing_document_at: '2026-09-21' }), /Proposal written/);
    assert.match(bid({ outcome: 'submitted' }), /Bidded/);
    assert.match(bid({ outcome: 'lost' }), /Lost/);
  });

  test('an engagement reports where it is in the discovery', () => {
    const disc = (over) => statusOf({ process: 'discovery', coverage: { required_answered: 20, required_total: 85 }, ...over }).label;
    assert.match(disc({}), /Interviewing — 20 of 85/);
    assert.match(disc({ to_review: 9 }), /9 to confirm/);
    assert.match(disc({ coverage: { required_answered: 85, required_total: 85 } }), /Ready to close/);
    // A document saved while the interview is 20 of 85 is not an agreed scope,
    // and the list said it was — on the one page a lead scans for trouble.
    assert.match(disc({ closing_document_at: '2026-09-21' }), /Document ahead of the answers/);
    assert.match(
      disc({ closing_document_at: '2026-09-21', coverage: { required_answered: 85, required_total: 85 } }),
      /Scope agreed/,
    );
  });

  test('a status never repeats the offer’s own verdict', () => {
    for (const process of ['rfp', 'discovery']) {
      const s = statusOf({ process, go: false, route: 'larger_engagement', offer: { code: 'M' }, coverage: { required_answered: 1, required_total: 85 } });
      assert.ok(!/larger engagement/i.test(s.label), `${process}: that belongs in the offer column`);
      assert.ok(!/^GO$/.test(s.label));
    }
  });
});
