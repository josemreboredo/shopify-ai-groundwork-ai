/**
 * Every accordion in the app opens the same way.
 *
 * The marker was written once, on the RFP Q&A page, and the next accordion —
 * the home page's "New" fold — shipped without it: a bold line with a card
 * around it and nothing saying it could be opened. A marker that is a
 * component's own decision is a marker the next component forgets.
 *
 * So it is a base rule on `details summary`, and these tests are what keeps it
 * one: the rule exists, nothing overrides it, and nothing in the app hides the
 * marker locally and forgets to draw its own.
 *
 * A stylesheet test, and it sits here because `npm test` is the only runner the
 * repository has — one under frontend/ would never run.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../../../frontend/app/app.css', import.meta.url), 'utf8');
const routes = new URL('../../../frontend/app/', import.meta.url);

/** Every rule in the stylesheet, as selector plus the declarations inside it. */
const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .map(([, selector, body]) => ({ selector: selector.trim().replace(/\s+/g, ' '), body }));

describe('the accordion marker is the app’s, not each component’s', () => {
  test('the base rule draws + closed and − open', () => {
    const closed = rules.find((r) => r.selector === 'details summary::after');
    assert.ok(closed, 'details summary::after is where the marker is declared');
    assert.match(closed.body, /content:\s*'\+'/, 'closed is a plus');
    assert.match(closed.body, /position:\s*absolute/, 'out of flow, so a flex or grid summary lands it in the same place');

    const open = rules.find((r) => r.selector === 'details[open] > summary::after');
    assert.ok(open, 'details[open] > summary::after turns it over');
    // U+2212, the minus sign — not a hyphen, which reads as a dash in this type.
    assert.match(open.body, /content:\s*'−'/, 'open is a minus sign');
  });

  test('the browser’s own triangle is suppressed where the marker is declared', () => {
    const base = rules.find((r) => r.selector === 'details summary');
    assert.ok(base && /list-style:\s*none/.test(base.body), 'no native marker');
    assert.ok(rules.some((r) => r.selector === 'details summary::-webkit-details-marker'), 'and none in WebKit either');
    assert.match(base.body, /position:\s*relative/, 'the marker is positioned against the summary');
    assert.match(base.body, /padding:[^;]*\d/, 'and the summary reserves the lane it sits in');
  });

  test('no component redeclares the marker', () => {
    const offenders = rules
      .filter((r) => /summary::after/.test(r.selector) && /content:/.test(r.body))
      .filter((r) => r.selector !== 'details summary::after' && r.selector !== 'details[open] > summary::after');
    assert.deepEqual(offenders.map((r) => r.selector), [],
      'one marker for every accordion — a second one is a second answer to the same question');
  });

  test('no component hides the marker and leaves nothing in its place', () => {
    const hiders = rules
      .filter((r) => /summary/.test(r.selector) && /list-style:\s*none|details-marker/.test(r.body))
      .filter((r) => !r.selector.startsWith('details summary'));
    assert.deepEqual(hiders.map((r) => r.selector), [],
      'the base rule already hides the native marker; hiding it again is a component about to draw its own');
  });

  test('every accordion in the app is a <details>, so every accordion is marked', () => {
    // The rule holds because there is one element behind every accordion. A fold
    // built from a button and a hidden div would not inherit it, and would not
    // be caught by any of the tests above.
    const files = fs.readdirSync(new URL('routes/', routes)).filter((f) => f.endsWith('.jsx'))
      .map((f) => new URL(`routes/${f}`, routes))
      .concat(fs.readdirSync(new URL('components/', routes)).filter((f) => f.endsWith('.jsx'))
        .map((f) => new URL(`components/${f}`, routes)));
    const withSummary = files.filter((f) => /<summary[\s>]/.test(fs.readFileSync(f, 'utf8')));
    assert.ok(withSummary.length >= 8, 'the app has accordions and this test found them');
    for (const file of withSummary) {
      const source = fs.readFileSync(file, 'utf8');
      const summaries = (source.match(/<summary[\s>]/g) ?? []).length;
      const details = (source.match(/<details[\s>]/g) ?? []).length;
      assert.equal(summaries, details, `${file.pathname.split('/').pop()}: every summary belongs to a details`);
    }
  });
});
