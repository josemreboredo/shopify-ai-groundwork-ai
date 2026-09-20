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

/** The block of rules the spine and its side links are declared in. */
const spine = css.slice(css.indexOf('/* Where you are in the work.'), css.indexOf('/* Which of the two processes'));

const lin = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const luminance = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
/** White at an alpha, composited onto black. */
const onBlack = (alpha) => [255 * alpha, 255 * alpha, 255 * alpha];

describe('the step spine is legible on the band it is drawn on', () => {
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

  test('the step you are on is the most prominent thing in the spine', () => {
    assert.match(spine, /\.steps-spine \.current \.step-label \{[^}]*color: #fff/, 'the current step is pure white');
    assert.match(spine, /\.steps-spine \.current \.step-label \{[^}]*font-weight: 600/);
    // A step still to do must not be a filled white disc: it then reads as more
    // important than the one you are on, which is the opposite of the point.
    assert.match(spine, /\.step-n \{[^}]*background: transparent/);
  });
});
