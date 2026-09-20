/**
 * Where the Solution Architect stands on a bid.
 *
 * The meeting's scorecard is mostly commercial and this desk does not answer it.
 * It answers one thing: can Merkle put a number on this work and stand behind it.
 * The order the reasons are checked in is the design — a position built on
 * extractions nobody has verified is not a position, however much of it there is
 * — so the tests walk that order rather than the numbers.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { goNoGoView, complexityProfile, answeredElsewhere } from '../../service/go-no-go.js';
import { clarificationTopics } from '../../agents/discovery/clarifications.js';

const fixture = (name) => JSON.parse(fs.readFileSync(new URL(`../fixtures/engagements/${name}.json`, import.meta.url), 'utf8'));
const state = (over = {}) => ({ documents: 1, coverage: { required_answered: 62, required_total: 85 }, to_review: 0, ...over });
const view = (over = {}, name = 'acme-watches', opts = {}) => goNoGoView(fixture(name), state(over), null, opts);

describe('go/no-go support', () => {
  test('with nothing read, it says so instead of assessing thin air', () => {
    const r = view({ documents: 0, coverage: { required_answered: 0, required_total: 85 } }).recommendation;
    assert.equal(r.verdict, 'nothing to go on');
    assert.deepEqual(r.before_you_go, ['Read the RFP in on the first step.']);
  });

  test('unconfirmed extractions stop everything else — that is the whole point of Review', () => {
    const r = view({ to_review: 46 }).recommendation;
    assert.equal(r.verdict, 'not yet');
    assert.match(r.headline, /cannot stand behind/i);
    // One sentence answers "why"; the rest is the ground it stands on.
    assert.match(r.why, /46 of those are still unconfirmed/);
    assert.ok(r.before_you_go.some((b) => /Confirm what it says/.test(b)));
    assert.ok(!/topics are still open/.test(r.why), 'it does not argue about topics before the answers are checked');
    assert.ok(r.because.every((b) => !/unconfirmed/.test(b)), 'the deciding fact is not repeated underneath itself');
  });

  test('once confirmed, it says so and moves on to what is still unknown', () => {
    const r = view().recommendation;
    assert.notEqual(r.verdict, 'not yet');
    assert.ok(r.because.some((b) => /confirmed by a person/.test(b)));
  });

  test('a requirement outside the offers is a different conversation, not a worse price', () => {
    const r = goNoGoView(fixture('stop-custom-checkout'), state(), null).recommendation;
    assert.equal(r.verdict, 'not a standard bid');
    assert.match(r.why, /outside Merkle's standard offers/);
    assert.ok(r.before_you_go.some((b) => /bespoke work at a standard price/.test(b)));
  });

  test('the reasons are facts, in the order he reads them, and never a percentage', () => {
    for (const over of [{}, { to_review: 12 }, { documents: 0 }]) {
      const r = view(over).recommendation;
      assert.ok(r.why, 'a position with no why is an opinion');
      for (const line of [r.why, ...r.because]) {
        assert.ok(!/%/.test(line), '"28% of what sets the price" was a coverage ratio wearing a claim it could not support');
      }
    }
  });

  test('the why is one sentence, and never repeats the ground beneath it', () => {
    for (const over of [{}, { to_review: 3 }, { documents: 0 }]) {
      const r = view(over).recommendation;
      assert.equal(r.why.trim().split(/(?<=\.)\s+/).filter(Boolean).length <= 2, true, 'a paragraph is not a reason');
      assert.ok(!r.because.includes(r.why), 'the deciding fact appears once');
    }
    // What it rests on is context, and reads as context.
    const grounded = view().recommendation;
    assert.ok(grounded.because.some((b) => /document/.test(b)));
    assert.ok(grounded.because.some((b) => /confirmed by a person/.test(b)));
  });

  test('every verdict it can reach is one a person would say out loud', () => {
    const seen = new Set([
      view({ documents: 0 }).recommendation.verdict,
      view({ to_review: 4 }).recommendation.verdict,
      view().recommendation.verdict,
      goNoGoView(fixture('stop-custom-checkout'), state(), null).recommendation.verdict,
    ]);
    for (const v of seen) assert.ok(/^(go|go, but ask|ask first|not yet|not a standard bid|nothing to go on)$/.test(v), v);
    assert.ok(seen.size >= 3, 'the chain actually discriminates');
  });

  test('it stands on what the engine derived, not on a second list', () => {
    const v = view();
    const gates = Object.entries(fixture('acme-watches').offer.scope_gates).filter(([, g]) => g.active);
    assert.equal(v.capabilities.length, gates.length);
    for (const c of v.capabilities) assert.ok(c.evidence, 'each capability carries the answer that proves it');
    assert.equal(v.rests_on.unconfirmed, 0);
    assert.equal(v.rests_on.documents, 1);
  });

  test('no price is quoted for an offer that does not apply, even to an owner', () => {
    const v = goNoGoView(fixture('stop-custom-checkout'), state(), null, { pricing: true });
    assert.equal(v.scope.applies, false);
    assert.equal(v.scope.band, null);
    assert.ok(!/(EUR|CHF|GBP|USD)\s*[\d]/.test(JSON.stringify(v)), 'no currency figure survives');
    assert.ok(v.scope.why_not.length, 'and the rule that took it outside is named');
  });

  test('a GO engagement quotes the band to an owner only', () => {
    assert.ok(view({}, 'acme-watches', { pricing: true }).scope.band);
    assert.equal(view({}, 'acme-watches', {}).scope.band, null);
  });

  test('the rest of the scorecard is named with who owns it', () => {
    const v = view();
    assert.equal(v.not_ours.length, 19);
    for (const q of v.not_ours) assert.ok(q.ask && q.owner, `Q${q.n} names an owner`);
  });
});

describe('where the complexity sits', () => {
  const beyond = () => {
    const doc = fixture('acme-watches');
    // 11.3 reads /markets/list, which is the markets gate's own input; 11.7 reads
    // the integration gate's. The link is the pointers both declare, not a guess
    // at which rule belongs to which subject.
    doc.exits.items.push({ rule_id: '11.3', result: 'STOP', evidence: '37 markets at launch' });
    doc.exits.items.push({ rule_id: '11.7', result: 'STOP', evidence: '6 counted integrations' });
    return doc;
  };

  test('three levels and no invented scale', () => {
    const axes = complexityProfile(fixture('acme-watches'));
    assert.equal(axes.length, 7, 'one per scope gate');
    for (const a of axes) {
      assert.ok([0, 1, 2].includes(a.level), 'a chart that draws ten gradations off three real ones invents nine');
      assert.ok(['not known', 'not in play', 'within the offers', 'beyond the offers'].includes(a.standing));
      if (a.level > 0) assert.ok(a.evidence, 'a dimension in play carries the answer that put it there');
    }
  });

  test('"nobody said" is not "does not apply", and says which questions would settle it', () => {
    // A gate that did not fire may have had nothing to read. Drawing both at zero
    // told a reader the document had settled something it never mentioned.
    const retail = complexityProfile(fixture('acme-watches')).find((a) => a.id === 'retail_pos');
    assert.equal(retail.known, false, 'the engagement says nothing about physical stores either way');
    assert.equal(retail.standing, 'not known');
    assert.ok(retail.settled_by.length, 'and the questions that would settle it are named');

    // Those questions are already candidates in the Q&A, so it is asked or assumed.
    const inQa = new Set(clarificationTopics(fixture('acme-watches')).flatMap((t) => t.covers.map((c) => c.question_id)));
    assert.ok(retail.settled_by.every((id) => inQa.has(id)), 'an unknown dimension is not left hanging on a chart');
  });

  test('a dimension with answers behind it that did not fire is genuinely not in play', () => {
    const doc = fixture('acme-watches');
    doc.retail = { store_count: 0, pos: false, omnichannel: false };
    const retail = complexityProfile(doc).find((a) => a.id === 'retail_pos');
    assert.equal(retail.known, true);
    assert.equal(retail.standing, 'not in play');
    assert.deepEqual(retail.settled_by, [], 'nothing left to ask');
  });

  test('a dimension goes beyond the offers only when a rule fired on the answers that gate reads', () => {
    const axes = complexityProfile(beyond());
    const at = (id) => axes.find((a) => a.id === id);
    assert.equal(at('markets').level, 2);
    assert.deepEqual(at('markets').rules.filter((r) => r.result === 'STOP').map((r) => r.rule_id), ['11.3']);
    assert.equal(at('integration').level, 2);
    assert.equal(at('b2b').level, 1, 'a gate nothing fired on stays inside');
    assert.equal(at('retail_pos').level, 0, 'and one that never fired at all is not in play');
  });

  test('a FLAG does not push a dimension outside — it needs an owner, not a different offer', () => {
    const axes = complexityProfile(fixture('acme-watches'));
    const markets = axes.find((a) => a.id === 'markets');
    assert.ok(markets.rules.some((r) => r.result === 'FLAG'), 'the fixture flags the topology on markets');
    assert.equal(markets.level, 1);
  });
});

describe('a requirement the client asked for is answered, never excluded', () => {
  const withChina = () => {
    const doc = fixture('acme-watches');
    doc.markets.list.push({ code: 'CN', name: 'China' });
    doc.exits.items.push({ rule_id: '11.20', result: 'FLAG', evidence: 'Mainland China (CN) is a launch market' });
    return doc;
  };

  test('an engagement without mainland China has nothing to answer elsewhere', () => {
    assert.deepEqual(answeredElsewhere(fixture('acme-watches')), []);
  });

  test('it leads with what Merkle can do, then with what Shopify cannot', () => {
    // Listing a requirement the client asked for as an exclusion reads as
    // non-compliance and scores as a gap. The same requirement with a route
    // reads as the one bidder who understood it.
    const [cn] = answeredElsewhere(withChina());
    assert.equal(cn.what, 'Mainland China');
    assert.match(cn.asked_for, /launch market/, 'it says they asked for it');
    assert.match(cn.answer, /carry the brand|feed the partner/i, 'and what we can do comes first');
    assert.match(cn.what_it_cannot, /no infrastructure in mainland China/);
    assert.ok(!/exclud/i.test(JSON.stringify(cn)), 'nothing they asked for is called an exclusion');
  });

  test('only the onshore shop is scoped apart, and the market is never subtracted', () => {
    const doc = withChina();
    const [cn] = answeredElsewhere(doc);
    assert.match(cn.where_it_goes, /onshore shop/i);
    // Taking China out of the count read as though the requirement had left. It
    // has not: every market is still answered, one of them differently.
    assert.match(cn.leaves, new RegExp(`^${doc.markets.list.length} markets`));
    assert.match(cn.leaves, /brand presence feeding partner channels/);
  });

  test('answering it is work, and the complexity picture says so', () => {
    // It was filed as a carve-out and the chart said nothing about it. A brand
    // site that performs behind the Great Firewall and a feed into the partner
    // channels are build work, on the markets dimension, in this engagement.
    const v = goNoGoView(withChina(), state(), null);
    const markets = v.profile.find((a) => a.id === 'markets');
    assert.ok(markets.also.length, 'the markets axis carries it');
    for (const w of markets.also) {
      assert.equal(w.topic, 'Mainland China');
      assert.ok(w.work.length > 20, 'named as work, not as a label');
    }
    const other = v.profile.filter((a) => a.id !== 'markets');
    assert.ok(other.every((a) => !a.also.length), 'and only on the dimension it belongs to');
  });
});
