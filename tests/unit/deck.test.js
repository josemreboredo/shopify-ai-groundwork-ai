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
import { buildDeckXml, buildInternalNotes, findLeaks, percentages, monthlyAppCosts, writeDeck } from '../../agents/discovery-deck/build.js';
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
      'capability-map', 'scope', 'apps', 'work-split', 'scope-by-epic', 'risks', 'out-of-scope', 'next-steps', 'timeline', 'investment', 'appendix-stories']);
    assert.deepEqual(warnings, []);
  });

  test('STOP deck only explains the blockers', () => {
    const doc = load('stop-custom-checkout.json');
    const { xml } = buildDeckXml(doc);
    assertWellFormed(xml);
    assert.deepEqual(sectionIds(xml), ['cover', 'executive-summary', 'risks', 'next-steps']);
    assert.match(xml, /mode="STOP"/);
    assert.match(xml, /11\.6/);
    assert.doesNotMatch(xml, /price-band/);
  });

  test('investment shows the offer band only; L is open-ended', () => {
    const doc = load('acme-watches.json');
    const { xml } = buildDeckXml(doc, backlogFor(doc));
    assert.match(xml, /<price-band currency="EUR" from="65000" to="100000"\/>/);

    const luxury = recompute({ ...load('acme-watches.json'), brand: { positioning: 'luxury' } });
    assert.match(buildDeckXml(luxury).xml, /<price-band currency="EUR" from="100000" open-ended="true"\/>/);
  });

  test('never contains modifiers, price adds, effort, story points or commercial warnings', () => {
    // S with one gate → modifier applied; M without retainer → WARN 11.11
    const single = recompute({ ...load('foundation-minimal.json'), migration: { source_platform: 'magento' } });
    const noRetainer = recompute(load('acme-watches.json'));
    noRetainer.delivery.grow_retainer = { signed: false };
    recompute(noRetainer);

    for (const doc of [single, noRetainer, load('acme-watches.json')]) {
      const backlog = backlogFor(doc);
      const { xml } = buildDeckXml(doc, backlog);
      assert.deepEqual(findLeaks(xml, doc, backlog), [], doc.meta.client.slug);
      assert.doesNotMatch(xml, /points="|price[-_]add|effort[-_]weeks|\+25%|11\.11/i);
      for (const mod of offering.modifiers) assert.ok(!xml.includes(mod.id), mod.id);
    }
    assert.deepEqual(single.offer.modifiers, ['+Migration']);
    assert.ok(noRetainer.exits.items.some((i) => i.rule_id === '11.11'));
  });

  test('internal notes carry what the client deck omits', () => {
    const single = recompute({ ...load('foundation-minimal.json'), migration: { source_platform: 'magento' } });
    const notes = buildInternalNotes(single, backlogFor(single));
    assert.match(notes, /INTERNAL/);
    assert.match(notes, /\+Migration/);
    assert.match(notes, /\*\*Total\*\*/);

    const noRetainer = load('acme-watches.json');
    noRetainer.delivery.grow_retainer = { signed: false };
    assert.match(buildInternalNotes(recompute(noRetainer)), /\+25%/);
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

  test('writeDeck writes XML and internal notes; check catches a leaked modifier in the final deck', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'deck-'));
    const doc = load('acme-watches.json');
    fs.writeFileSync(path.join(dir, 'engagement.json'), JSON.stringify(doc));
    const { written } = writeDeck({ clientDir: dir });
    assert.deepEqual(written.map((f) => path.basename(f)).sort(), ['deck-internal-notes.md', 'discovery-deck.xml']);
    assert.deepEqual(findLeaks('## Investment\nEUR 65,000–100,000', doc), []);
    assert.deepEqual(findLeaks('Pricing includes the +Markets modifier', doc), ['modifier', '+Markets']);
  });
});
