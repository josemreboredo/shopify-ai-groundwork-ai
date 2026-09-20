/**
 * The step spine lives inside the black statement band.
 *
 * This is a stylesheet test and it sits with the rest because `npm test` is the
 * only runner the repository has; a test under frontend/ would never execute.
 *
 * Its first version inherited the app's text tokens — --ink for the current step,
 * --muted for the ones already done — and rendered the two steps that matter most
 * as dark text on black. It compiled, it passed every test, and it was unreadable.
 * So the colours are checked here, against the ground they are actually drawn on.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../../../frontend/app/app.css', import.meta.url), 'utf8');

/**
 * The block of rules the spine and its side links are declared in, bounded by its
 * own marker. It used to end at whatever section happened to come next, so adding
 * an unrelated rule below moved the boundary and failed these tests for the wrong
 * reason — the spine lives on the black band, and the rules that matter are only
 * the ones drawn there.
 */
const spine = (() => {
  const from = css.indexOf('/* Where you are in the work.');
  const to = css.indexOf('/* end wayfinder');
  assert.ok(from !== -1 && to > from, 'the spine block and its end marker are both present');
  return css.slice(from, to);
})();

const lin = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const luminance = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
/** White at an alpha, composited onto black. */
const onBlack = (alpha) => [255 * alpha, 255 * alpha, 255 * alpha];

describe('the step spine follows the Merkle system it is drawn in', () => {
  test('no spine text colour comes from a token meant for white backgrounds', () => {
    const offenders = spine
      .split('\n')
      .filter((line) => /color:\s*var\(--(ink|muted|navy|navy-deep)\)/.test(line) && !/border-color/.test(line));
    assert.deepEqual(offenders, [], 'these render as dark text on the black header band');
  });

  test('every white-alpha text colour clears WCAG AA against black', () => {
    const alphas = [...spine.matchAll(/(?<prop>color):\s*rgba\(255,\s*255,\s*255,\s*(?<a>[\d.]+)\)/g)]
      .filter((m) => !/border-color|background/.test(m[0]))
      .map((m) => Number(m.groups.a));
    assert.ok(alphas.length >= 4, 'the spine states its own colours rather than inheriting them');
    for (const a of alphas) {
      assert.ok(contrast(onBlack(a), [0, 0, 0]) >= 4.5, `white at ${a} on black is ${contrast(onBlack(a), [0, 0, 0]).toFixed(2)}:1 — under AA for body text`);
    }
  });

  test('one accent: the spine is red or it is nothing', () => {
    const others = [...spine.matchAll(/var\(--(ok|warn|accent|navy|stop)\)/g)].map((m) => m[0]);
    assert.deepEqual(others, [], 'merkle.com has a single accent — a green tick is a second one');
    assert.ok(spine.includes('var(--red)'), 'and state is carried by that accent');
  });

  test('square surfaces: nothing in the spine is a disc', () => {
    assert.ok(!/border-radius:\s*(50%|999|9999)/.test(spine), 'the system is square surfaces and pill buttons — a numbered circle is neither');
  });

  test('state is carried by the brand’s own marks, not by invented ones', () => {
    // The red wedge of the Merkle mark, exactly as it is used for every bullet
    // and every section heading in the app.
    assert.match(spine, /\.steps-spine \.done[^{]*\{[^}]*clip-path: polygon\(100% 0, 100% 100%, 0 0\)/, 'finished steps take the red wedge');
    // The red bar of the tab ribbon, which is how this app has always said "here".
    assert.match(spine, /\.steps-spine a::after \{[^}]*background: var\(--red\)/);
    // The bar means "you are here", which is what an underline means in every
    // other navigation in this app. Binding it to the current step instead left
    // it under Confirm what it says while you were reading RFP Q&A.
    assert.match(spine, /\.steps-spine a\.active::after[^{]*\{[^}]*transform: scaleX\(1\)/);
    assert.ok(!/\.steps-spine \.current a::after/.test(spine), 'the step to do next is not the page you are on');
  });

  test('the step you are on is the brightest thing in the ribbon', () => {
    assert.match(spine, /\.steps-spine \.current a[^:]*,[^{]*\{[^}]*color: #fff/);
  });

  test('it speaks the same type as the tabs it replaced', () => {
    for (const rule of ['.step-label', '.views a']) {
      const block = spine.slice(spine.indexOf(rule));
      const decl = block.slice(0, block.indexOf('}'));
      assert.match(decl, /text-transform: uppercase/, `${rule} is uppercase, like every other navigation label`);
      assert.match(decl, /letter-spacing: 0\.08em/, `${rule} carries the same letter-spacing`);
    }
  });

});

describe('a component built for the black band is restated when it is reused on white', () => {
  test('the KPI strip states its own colours', () => {
    // .stats was written for the statement band: .stats span is white text. Reused
    // on the readiness page it rendered white on white, and all a reader saw was a
    // column of numbers over red rules with no labels at all.
    const base = css.slice(css.indexOf('.stats {'), css.indexOf('.stats {') + 600);
    assert.match(base, /\.stats span \{[^}]*color: rgba\(255, 255, 255/, 'the base is for the dark band');

    const kpis = css.slice(css.indexOf('.stats.kpis {'), css.indexOf('.stats.kpis {') + 900);
    assert.match(kpis, /\.stats\.kpis span \{[^}]*color: var\(--muted\)/, 'and the white-surface variant restates it');
    assert.match(kpis, /\.stats\.kpis strong \{[^}]*color: var\(--ink\)/);
  });
});
