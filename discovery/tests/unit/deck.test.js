/**
 * Discovery Closing Deck (Phase 3): client XML is well-formed, complete for GO,
 * reduced for STOP, and never contains internal pricing or effort.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs   from 'node:fs';
import os   from 'node:os';
import path from 'node:path';

import { offering } from '../../schema/index.js';
import { buildDeckXml, clientPart, findLeaks, percentages, monthlyAppCosts, writeDeck } from '../../agents/discovery-deck/build.js';
import { esc } from '../../agents/discovery-deck/xml.js';
import { selectStories, summariseByEpic } from '../../agents/backlog/select.js';
import { classifyOffer } from '../../agents/discovery/classify.js';
import { evaluateExits } from '../../agents/discovery/exits.js';

const FIXTURES = path.join(import.meta.dirname, '..', 'fixtures', 'engagements');
const load = (name) => JSON.parse(fs.readFileSync(path.join(FIXTURES, name), 'utf8'));
const backlogFor = (doc) => {
  const stories = selectStories(doc);
  return { summary: summariseByEpic(stories), stories };
};

/** Recompute offer and exits after editing answers. */
function recompute(doc) {
  doc.offer = classifyOffer(doc);
  doc.exits = evaluateExits(doc);
  doc.delivery.go = !doc.exits.triggered;
  return doc;
}

/** Tag-balance check (no XML parser dependency). @param {string} xml */
function assertWellFormed(xml) {
  const stack = [];
  const body = xml.replace(/^<\?xml[^>]*\?>/, '');
  for (const [, closing, name, selfClosing] of body.matchAll(/<(\/?)([a-zA-Z][\w-]*)[^>]*?(\/?)>/g)) {
    if (selfClosing) continue;
    if (closing) assert.equal(stack.pop(), name, `unbalanced </${name}>`);
    else stack.push(name);
  }
  assert.deepEqual(stack, [], 'unclosed tags');
  assert.doesNotMatch(body.replace(/<[^>]*>/g, ''), /[<>]|&(?!amp;|lt;|gt;|quot;|apos;)/, 'unescaped text');
}

const sectionIds = (xml) => [...xml.matchAll(/<section id="([^"]+)"/g)].map((m) => m[1]);

describe('client deck XML', () => {
  test('GO deck has all 17 sections in order, is well-formed and has no warnings with a backlog', () => {
    const doc = load('acme-watches.json');
    const { xml, warnings } = buildDeckXml(doc, backlogFor(doc));
    assertWellFormed(xml);
    assert.deepEqual(sectionIds(xml), ['cover', 'executive-summary', 'business-context', 'methodology', 'as-is', 'solution-design',
      'capability-map', 'scope', 'apps', 'work-split', 'scope-by-epic', 'risks', 'out-of-scope', 'next-steps', 'timeline', 'investment', 'appendix-stories', 'consultant-notes']);
    assert.match(xml, /audience="lead-consultant"/);
    assert.deepEqual(warnings, []);
  });

  test('STOP deck only explains the blockers', () => {
    const doc = load('stop-custom-checkout.json');
    const { xml } = buildDeckXml(doc);
    assertWellFormed(xml);
    assert.deepEqual(sectionIds(xml), ['cover', 'executive-summary', 'risks', 'next-steps', 'consultant-notes']);
    assert.match(xml, /mode="STOP"/);
    assert.match(xml, /11\.6/);
    assert.doesNotMatch(clientPart(xml), /price-band/);
    assert.match(xml, /reference-only="true"/);
  });

  test('expected outcomes list a goal that restates a KPI only once', () => {
    const doc = load('acme-watches.json');
    doc.business = { ...doc.business, kpis: [{ metric: 'Conversion rate', baseline: '0.3%', target: '1%', horizon_months: 12 }],
      growth_goals: ['Increase conversion rate from 0.3% to 1% within 12 months', 'Open two new markets'] };
    const outcomes = buildDeckXml(doc, backlogFor(doc)).xml.match(/<expected-outcomes>[\s\S]*?<\/expected-outcomes>/)?.[0] ?? '';
    assert.equal((outcomes.match(/0\.3%/g) ?? []).length, 1, outcomes);
    assert.match(outcomes, /Open two new markets/);
  });

  test('a launch market without a pricing approach is a field to complete', () => {
    const doc = load('acme-watches.json');
    doc.markets = { ...doc.markets, list: [...doc.markets.list, { code: 'GB', currency: 'GBP' }] };
    assert.ok(buildDeckXml(doc, backlogFor(doc)).warnings.some((w) => w.includes('pricing not answered for GB')));
  });

  test('investment shows the offer band only; L is open-ended', () => {
    const doc = load('acme-watches.json');
    const { xml } = buildDeckXml(doc, backlogFor(doc));
    assert.match(xml, /<price-band currency="EUR" from="65000" to="100000"\/>/);

    const luxury = recompute({ ...load('acme-watches.json'), brand: { positioning: 'luxury' } });
    assert.match(buildDeckXml(luxury).xml, /<price-band currency="EUR" from="100000" open-ended="true"\/>/);
  });

  test('client sections never contain modifiers, price adds, effort, story points or commercial warnings', () => {
    // S with one gate → modifier applied; M without retainer → WARN 11.11
    const single = recompute({ ...load('foundation-minimal.json'), migration: { source_platform: 'magento' } });
    const noRetainer = recompute(load('acme-watches.json'));
    noRetainer.delivery.grow_retainer = { signed: false };
    recompute(noRetainer);

    for (const doc of [single, noRetainer, load('acme-watches.json')]) {
      const backlog = backlogFor(doc);
      const client = clientPart(buildDeckXml(doc, backlog).xml);
      assert.deepEqual(findLeaks(client, doc, backlog), [], doc.meta.client.slug);
      assert.doesNotMatch(client, /points="|price[-_]add|effort[-_]weeks|\+25%|11\.11/i);
      for (const mod of offering.modifiers) assert.ok(!client.includes(mod.id), mod.id);
    }
    assert.deepEqual(single.offer.modifiers, ['+Migration']);
    assert.ok(noRetainer.exits.items.some((i) => i.rule_id === '11.11'));
  });

  test('the consultant-notes section carries everything the client sections omit', () => {
    const single = recompute({ ...load('foundation-minimal.json'), migration: { source_platform: 'magento' } });
    const { xml } = buildDeckXml(single, backlogFor(single));
    const notes = xml.slice(xml.indexOf('<section id="consultant-notes"'));
    assert.match(notes, /audience="lead-consultant"/);
    assert.match(notes, /<modifier id="\+Migration"/);
    assert.match(notes, /<total-points>\d+<\/total-points>/);
    assertWellFormed(xml);

    const noRetainer = load('acme-watches.json');
    noRetainer.delivery.grow_retainer = { signed: false };
    assert.match(buildDeckXml(recompute(noRetainer)).xml, /\+25%/);
  });

  test('missing backlog is reported as a warning, not an error', () => {
    const { warnings } = buildDeckXml(load('acme-watches.json'), null);
    assert.equal(warnings.length, 2);
    assert.ok(warnings.every((w) => w.includes('npm run backlog')));
  });
});

describe('helpers and CLI flow', () => {
  test('percentages always add up to 100', () => {
    for (const counts of [[1, 1, 1], [2, 1, 0], [7, 3, 1], [0, 0, 0], [5, 0, 0]]) {
      const p = percentages(counts);
      assert.equal(p.reduce((n, x) => n + x, 0), counts.some(Boolean) ? 100 : 0, counts.join(','));
    }
  });

  test('monthly app costs sum recommended monthly list prices per currency', () => {
    assert.deepEqual(monthlyAppCosts([
      { recommended: true, cost: { amount: 15, currency: 'USD', period: 'month' } },
      { recommended: true, cost: { amount: 50, currency: 'USD', period: 'month' } },
      { recommended: true, cost: { amount: 100, currency: 'USD', period: 'year' } },
      { recommended: false, cost: { amount: 99, currency: 'USD', period: 'month' } },
    ]), { USD: 65 });
  });

  test('escaping keeps XML safe', () => {
    assert.equal(esc('A & B <c> "d"'), 'A &amp; B &lt;c&gt; &quot;d&quot;');
    assert.equal(esc(`x${String.fromCharCode(1)}y`), 'xy');
  });

  test('writeDeck writes the full-information XML; check catches internal data in a client version', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'deck-'));
    const doc = load('acme-watches.json');
    fs.writeFileSync(path.join(dir, 'engagement.json'), JSON.stringify(doc));
    const { written } = writeDeck({ clientDir: dir });
    assert.deepEqual(written.map((f) => path.basename(f)).sort(), ['discovery-deck.xml']);
    assert.deepEqual(findLeaks('## Investment\nEUR 65,000–100,000', doc), []);
    assert.deepEqual(findLeaks('Pricing includes the +Markets modifier', doc), ['modifier', '+Markets']);
  });
});
