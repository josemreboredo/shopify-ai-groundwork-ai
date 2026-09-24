/**
 * @file ai/scripts/render-strategy.js
 * @description Regenerates the parts of docs/strategy.md that restate the
 * offering: the classification rule and the modifier table. They are written
 * from offering.json between markers, so the strategy document can no longer
 * say "these are the values the engine runs" about values it does not run.
 *
 * Usage: npm run strategy:render
 */

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { offering } from '../schema/index.js';
import { lowerFirst } from '../engine/text.js';

const PATH = fileURLToPath(new URL('../../docs/strategy.md', import.meta.url));
const k = (n) => `${Math.round(n / 100) / 10}k`.replace('.0k', 'k');
const span = (r, unit = '') => (r.min === r.max ? `${r.min}${unit}` : `${r.min}–${r.max}${unit}`);

/** The generated blocks, keyed by marker name. */
export function strategyBlocks(o = offering) {
  const rate = o.pricing.weekly_rate;
  const classification = [
    `**Classification rule** — the quote first, then the name. The quote is the Foundation base (${span(o.offers.S.duration_weeks, ' weeks')}, CHF ${k(o.offers.S.price_band.min)}–${k(o.offers.S.price_band.max)}) plus every active scope gate at its own weeks, each week at one rate of CHF ${k(rate)}, and the design each gate needs at CHF ${o.pricing.design.day_price} a design day. The pack it is named after, in order:`,
    ...o.classification.map((c) => `${c.order}. ${c.plain} → **${c.offer}**`),
    '',
    'Whatever goes past the named pack’s promise is listed as add-ons, so a re-estimate that finds a second store reads as the same pack with a store more. The packs are what a conversation opens with; the quote is what the answers add up to.',
  ].join('\n');
  const rows = o.modifiers.map((m) => `| \`${m.id}\` — ${lowerFirst(m.description)} | +${span(m.effort_weeks, ' wk')} | +CHF ${k(m.price_add.min)}${m.price_add.max === m.price_add.min ? '' : `–${k(m.price_add.max)}`} |`);
  const modifiers = ['| Modifier | Effort add | Price add |', '|---|---|---|', ...rows].join('\n');
  return { classification, modifiers };
}

/** docs/strategy.md with every generated block replaced by a fresh render. */
export function renderStrategy(text, o = offering) {
  let out = text;
  for (const [name, body] of Object.entries(strategyBlocks(o))) {
    const re = new RegExp(`(<!-- generated:${name} -->\\n)[\\s\\S]*?(\\n<!-- /generated:${name} -->)`);
    if (!re.test(out)) throw new Error(`docs/strategy.md has no generated:${name} block`);
    out = out.replace(re, `$1${body}$2`);
  }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  fs.writeFileSync(PATH, renderStrategy(fs.readFileSync(PATH, 'utf8')));
  console.log('✓ Written → docs/strategy.md (classification rule, modifier table)');
}
