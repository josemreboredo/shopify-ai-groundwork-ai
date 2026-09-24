/**
 * The add-on services page: every add-on in time and cost, pack by pack, each
 * figure the engine's own difference between a pack's promise with the add-on
 * and without it.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { offering } from '../../schema/index.js';
import { classifyOffer } from '../../engine/classify.js';
import { engagementAt } from '../../engine/promise.js';
import { evaluateExits } from '../../engine/exits.js';
import { addonsView, ASKS, build } from '../../shared/addons-view.js';

const CODES = ['S', 'M', 'L'];
const view = addonsView();
const priced = addonsView({ pricing: true });
const all = (v) => v.groups.flatMap((g) => g.addons);
const find = (v, id) => all(v).find((a) => a.id === id);
const cell = (v, id, code, tier = null) => find(v, id).rows.find((r) => r.tier === tier).cells[code];
/** Every ask the offering's add-ons can make, with the packs that sell it. */
const asks = () => offering.closed_scope.addons.flatMap((a) => {
  const ask = ASKS[a.gate];
  const steps = ask.tiers ? Object.entries(ask.tiers) : [[null, ask]];
  return steps.map(([tier, step]) => ({ addon: a, tier, step }));
});

describe('the add-on services, pack by pack', () => {
  test('every add-on the offering sells is on the page, with hypercare and apps', () => {
    const ids = all(view).map((a) => a.id);
    for (const a of offering.closed_scope.addons) assert.ok(ids.includes(a.id), `${a.id} is sold and not on the page`);
    for (const id of ['hypercare', 'apps', 'apps_per_store']) assert.ok(ids.includes(id), `${id} is missing`);
    assert.equal(new Set(ids).size, ids.length, 'an add-on listed twice');
  });

  test('a tiered add-on has a row per tier the engine prices, in its order', () => {
    for (const a of all(view).filter((x) => x.gate)) {
      const tiers = offering.modifiers.filter((m) => m.gate === a.gate).map((m) => m.tier ?? null);
      assert.deepEqual(a.rows.map((r) => r.tier), tiers.length > 1 ? tiers : [null], a.id);
      for (const r of a.rows.filter((x) => x.tier)) assert.ok(r.label?.trim() && r.description?.trim(), `${r.id}: no label or no description`);
      assert.ok(a.description?.trim(), `${a.id}: an add-on service with no scope description`);
    }
  });

  test('every ask opens the gate and the tier its label claims', () => {
    // The label beside an ask is a claim about the engine, so the engine checks it.
    for (const { addon, tier, step } of asks()) {
      for (const code of addon.available_in) {
        const gate = classifyOffer(build(step, offering.closed_scope.limits[code])).scope_gates[addon.gate];
        assert.ok(gate.active, `${addon.gate}${tier ? `/${tier}` : ''} on ${code}: the ask does not open the gate`);
        if (tier) assert.equal(gate.tier, tier, `${addon.gate}/${tier} on ${code}: the ask opens ${gate.tier}`);
      }
    }
  });

  test('no priced cell takes an engagement out of the offers', () => {
    // A figure in a pack's column says the pack can carry it. A STOP rule firing
    // on the same engagement would be the page selling what the engine refuses.
    for (const { addon, tier, step } of asks()) {
      for (const code of addon.available_in) {
        const doc = build(step, offering.closed_scope.limits[code]);
        const stops = evaluateExits({ ...doc, offer: classifyOffer(doc) }).items.filter((i) => i.result === 'STOP');
        assert.deepEqual(stops.map((i) => i.rule_id), [], `${addon.gate}${tier ? `/${tier}` : ''} on ${code}`);
      }
    }
  });

  test('a pack that does not sell an add-on says so, and one that does never leaves it blank', () => {
    for (const a of all(view)) {
      const sold = offering.closed_scope.addons.find((x) => x.id === a.id)?.available_in;
      for (const r of a.rows) {
        for (const code of CODES) {
          const c = r.cells[code];
          assert.ok(['priced', 'included', 'carried', 'not_sold'].includes(c.state), `${r.id} on ${code}: ${c.state}`);
          if (sold) assert.equal(c.state === 'not_sold', !sold.includes(code), `${r.id} on ${code}`);
        }
      }
    }
    assert.equal(cell(view, 'languages', 'L').state, 'not_sold', 'a seventh language is a separate discovery');
    assert.equal(cell(view, 'store_estate', 'S').state, 'not_sold', 'a second store makes S an M');
    assert.equal(cell(view, 'apps_per_store', 'S').state, 'not_sold', 'S has one store');
  });

  test('what a pack already holds is included, not sold again', () => {
    assert.equal(cell(view, 'migration', 'M', 'light').state, 'included', 'M carries a WooCommerce migration');
    assert.equal(cell(view, 'storefront_design', 'L', 'extended').state, 'included', 'the full set holds the sections');
    assert.equal(cell(view, 'storefront_design', 'L', 'bespoke').state, 'included');
    assert.equal(cell(view, 'checkout_extensibility', 'L', 'in_checkout').state, 'included');
    assert.equal(cell(view, 'sku_complexity', 'M', 'standard').state, 'included');
    assert.equal(cell(view, 'multi_currency', 'M').state, 'included');
    // A second currency never costs anything of its own: it comes with the market.
    assert.deepEqual(cell(view, 'multi_currency', 'S'), { state: 'carried', by: 'a further market' });
  });

  test('the same add-on costs what it does in each pack, not one figure for all three', () => {
    const w = (id, code, tier) => cell(priced, id, code, tier).weeks.max;
    // A market re-tests whatever the pack builds: a configured theme in S, a full template set in L.
    assert.ok(w('markets', 'S') < w('markets', 'M') && w('markets', 'M') < w('markets', 'L'), 'markets');
    // An integration in L is wired again in each of its stores.
    assert.ok(w('integration', 'L') > w('integration', 'S'), 'integrations');
    // A Shopware migration in M replaces the WooCommerce one it already carries.
    assert.ok(w('migration', 'M', 'medium') < w('migration', 'S', 'medium'), 'migration');
    // And one market in S is exactly what the modifier sells one for.
    const mod = offering.modifiers.find((m) => m.gate === 'markets');
    assert.equal(w('markets', 'S'), mod.per_market_weeks);
    assert.equal(cell(priced, 'markets', 'S').price.max, mod.per_market_price);
  });

  test('in S, which holds no gate, a tier costs exactly what its modifier sells it for, design included', () => {
    const day = offering.pricing.design.day_price;
    for (const a of all(priced).filter((x) => x.gate && x.rows[0].tier)) {
      for (const r of a.rows) {
        const m = offering.modifiers.find((x) => x.gate === a.gate && x.tier === r.tier);
        assert.deepEqual(r.cells.S.weeks, m.effort_weeks, r.id);
        assert.deepEqual(r.cells.S.design_days, m.design_days, `${r.id}: design days`);
        const design = m.design_days ?? { min: 0, max: 0 };
        assert.deepEqual(r.cells.S.price, { min: m.price_add.min + design.min * day, max: m.price_add.max + design.max * day }, r.id);
      }
    }
  });

  test('every price is its weeks at the one weekly rate, and its design days at the design day', () => {
    const rate = offering.pricing.weekly_rate;
    const day = offering.pricing.design.day_price;
    const systemDay = offering.pricing.design.system_architect.day_price;
    for (const a of all(priced)) {
      for (const r of a.rows) {
        for (const code of CODES) {
          const c = r.cells[code];
          if (c.state !== 'priced' || !c.weeks) continue;
          const d = c.design_days ?? { min: 0, max: 0 };
          const sd = c.system_days ?? { min: 0, max: 0 };
          assert.equal(c.price.min, Math.round(c.weeks.min * rate + d.min * day + sd.min * systemDay), `${r.id} on ${code}`);
          assert.equal(c.price.max, Math.round(c.weeks.max * rate + d.max * day + sd.max * systemDay), `${r.id} on ${code}`);
        }
      }
    }
  });

  test('Hydrogen costs what each pack does not already build: most in S, least in L', () => {
    /* S goes from a configured theme to a React front end designed in full; M
       builds on the template design days it has; L swaps its custom Liquid
       theme, and its designer designs either way. */
    const m = offering.modifiers.find((x) => x.gate === 'hydrogen');
    const [s, mm, l] = CODES.map((code) => cell(priced, 'hydrogen', code));
    assert.ok(s.price.min > mm.price.min && mm.price.min > l.price.min, 'S > M > L');
    assert.deepEqual(l.weeks, m.effort_weeks, 'in L it is the React front end and the back end alone');
    assert.equal(l.design_days, undefined, 'L designs every template already');
    for (const c of [s, mm, l]) assert.deepEqual(c.system_days, m.system_days, 'the design system is tokenised in every pack');
    assert.ok(mm.design_days.max < s.design_days.max, 'M has design days for its templates already');
    assert.equal(s.with, 'the full template set, designed');
    assert.equal(mm.with, 'the full template set, designed');
    assert.equal(l.with, undefined);
  });

  test('hypercare and apps: what each pack includes, and what one more costs', () => {
    for (const code of CODES) {
      const care = cell(priced, 'hypercare', code);
      assert.equal(care.included.count, offering.offers[code].hypercare_days);
      assert.equal(care.price.min, offering.pricing.weekly_rate * offering.pricing.hypercare_rate_share, 'a week of hypercare is half a build week');
      assert.equal(care.weeks, undefined, 'hypercare runs after go-live and adds no build weeks');
      const app = cell(priced, 'apps', code);
      assert.equal(app.included.count, offering.offers[code].apps_included);
      assert.equal(app.weeks.max, offering.pricing.app_weeks);
    }
    assert.equal(cell(view, 'apps_per_store', 'M').on_top_of, 'a further store', 'M has one store, so it comes with one');
    assert.equal(cell(view, 'apps_per_store', 'L').on_top_of, undefined, 'L has three');
    assert.equal(cell(view, 'theme_design', 'M').on_top_of, 'a further store', 'a design needs a store to live on');
    assert.equal(cell(view, 'theme_design', 'L').on_top_of, undefined);
  });

  test('with pricing off, no franc leaves the server', () => {
    const text = JSON.stringify(view);
    assert.doesNotMatch(text, /"(price|price_band|weekly_cost)":/, 'no price field');
    assert.doesNotMatch(text, new RegExp(`${offering.currency}\\s?[\\d.,]`, 'i'), 'no price written into prose either');
    assert.ok(all(priced).some((a) => a.rows.some((r) => Object.values(r.cells).some((c) => c.price))), 'and an owner sees them');
  });

  test('L shows the replatform figure the engine itself quotes', () => {
    const quoted = classifyOffer(engagementAt({ ...offering.closed_scope.limits.L, migration: 'sfcc' }));
    assert.deepEqual(priced.replatform.weeks, quoted.duration_weeks);
    assert.equal(priced.replatform.price_band.max, quoted.price_band.max);
    assert.equal(view.replatform.price_band, undefined, 'and no price without pricing');
  });

  test('the groups read in the pack table’s order, and the channels no pack includes sit together', () => {
    const titles = view.groups.map((g) => g.title);
    const table = offering.closed_scope.groups.filter((g) => titles.includes(g));
    assert.deepEqual(titles.filter((t) => table.includes(t)), table);
    const channels = view.groups.find((g) => /no pack includes/.test(g.title));
    assert.deepEqual(channels.addons.map((a) => a.gate).sort(), ['b2b', 'retail_pos', 'subscriptions']);
  });
});
