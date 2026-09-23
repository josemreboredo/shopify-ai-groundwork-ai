/**
 * @file offering-view.js
 * @description The S/M/L offering as a consultant reads it: what each offer
 * covers, what decides which one applies, what moves an engagement beyond them,
 * the high-level estimate, and how each maps onto Shopify.
 *
 * Built from discovery/schema/offering.json and the Shopify plan rules the engine
 * itself runs, so the page can never say something the engine does not do.
 *
 * Pricing is Merkle's internal commercial position and never reaches a client
 * (CLAUDE.md). While sign-in is open to any GitHub account, "signed in" does not
 * mean "Merkle", so price bands, per-gate price additions and internal notes are
 * removed here — on the server — unless the caller may see them. Hiding them in
 * the browser would still have sent them.
 *
 * @module ai/shared/offering-view
 */

import { offering } from '../schema/index.js';
import { gateCapacity } from '../engine/classify.js';
import { PLAN_RULES, PLAN_LABEL } from '../engine/plan.js';

const money = (band) => (band ? { min: band.min, max: band.max, ...(band.open_ended ? { open_ended: true } : {}) } : undefined);

/** How each offer meets Shopify: storefront, plan stance, and what it is built from. */
const APPROACH = {
  S: {
    storefront: 'Shopify’s Online Store with the Horizon theme, configured rather than built',
    plan: 'The lowest plan the requirements need — the offer does not assume Shopify Plus',
    build: 'Native features and configuration first; an app only where native stops, and why is written down',
    topology: 'One store',
  },
  M: {
    storefront: 'Horizon theme, extended with sections and blocks for the gated requirements',
    plan: 'Set by the gates in play: several markets, B2B catalogs or checkout needs can move it to Advanced or Plus — the engine names the feature that forces it',
    build: 'Native first, then App Store apps, then theme work, then custom — Markets, B2B, integrations and migration as their own workstreams',
    topology: 'Derived from the business facts: one store with Shopify Markets by default, a hybrid or expansion stores only where the markets genuinely diverge',
  },
  L: {
    storefront: 'Headless Hydrogen storefront on the Storefront API, hosted on Oxygen',
    plan: 'Usually Shopify Plus, for the extensibility and the scale a headless build is chosen for',
    build: 'A full Figma design system, custom motion and interaction, advanced personalisation — front end owned, commerce engine on Shopify',
    topology: 'Derived the same way; a headless front end can serve several stores, which changes the cost of a second one',
  },
};

/** The engine's classification condition as a sentence, built from the data it reads. */
function plainRule(c) {
  const when = String(c.when);
  if (/l_trigger/.test(when)) return `Any of: ${offering.l_triggers.map((t) => t.label.toLowerCase()).join(', ')}`;
  // The rule that decides the offer by what the work adds up to. Left to the
  // fallback it printed its own expression, which is the engine talking to
  // itself in front of a consultant.
  if (/duration_weeks/.test(when)) {
    return `The scope adds up to more than ${offering.offers.M.duration_weeks.max} weeks — more than an M can hold`;
  }
  const n = /(>=|==)\s*(\d+)/.exec(when);
  if (n) {
    const count = Number(n[2]);
    if (n[1] === '>=') return `${count} or more scope gates`;
    if (count === 0) return 'No scope gate at all';
    return `Exactly ${count} scope gate${count > 1 ? 's' : ''}${c.apply_modifier ? ', priced with its modifier' : ''}`;
  }
  return when.replace(/_/g, ' ');
}

/** Every modifier that prices a gate, in the order the schema lists them. */
const modifiersFor = (gateId) => offering.modifiers.filter((m) => m.gate === gateId);

/** The span a gate's modifiers cover, cheapest tier to dearest. */
const span = (mods, key) => ({
  min: Math.min(...mods.map((m) => m[key].min)),
  max: Math.max(...mods.map((m) => m[key].max)),
});

/**
 * What a gate costs, for a row that sells it as an add-on.
 *
 * @param {string} gateId
 * @param {boolean} pricing  whether this caller may see Merkle's price
 */
function addonCost(gateId, pricing) {
  const mods = modifiersFor(gateId);
  if (!mods.length) return null;
  return {
    effort_weeks: span(mods, 'effort_weeks'),
    ...(pricing ? { price_add: money(span(mods, 'price_add')) } : {}),
  };
}

/**
 * One add-on service, as a catalogue entry rather than as a table cell.
 *
 * A capability no pack includes has no business in a comparison table — three
 * columns saying "not in the base pack" is a table explaining what it does not
 * sell. It is an add-on service, and what a reader needs beside it is what it
 * covers and what it costs, which is the gate's own price so it cannot drift
 * from what the engine quotes.
 *
 * Weeks stay as `{ min, max }` rather than a rendered string: the page decides
 * whether to print the maximum or the span, and a number formatted in the model
 * is a decision the page can no longer take.
 *
 * @param {object} addon    entry from offering.closed_scope.addons
 * @param {boolean} pricing whether this caller may see Merkle's price
 */
function addonService({ id, gate, what, description, available_in: availableIn, note }, pricing) {
  const mods = modifiersFor(gate);
  const [first] = mods;
  return {
    id,
    what,
    gate,
    /* A gate priced by one modifier describes itself; a gate priced by tiers
       needs a line above them, because three tier descriptions with nothing
       over them is a price list rather than a service. */
    description: description ?? first?.description ?? null,
    available_in: availableIn ?? ['S', 'M', 'L'],
    ...(note ? { note } : {}),
    ...(mods.length ? { weeks: span(mods, 'effort_weeks') } : {}),
    ...(mods.length && pricing ? { price: money(span(mods, 'price_add')) } : {}),
    ...(mods.length > 1 ? {
      tiers: mods.map((m) => ({
        label: (m.tier ?? m.id).replace(/_/g, ' '),
        description: m.description,
        weeks: m.effort_weeks,
        ...(pricing ? { price: money(m.price_add) } : {}),
      })),
    } : {}),
  };
}

/**
 * @param {{ pricing?: boolean }} [options]  pricing: include price bands, price
 *   additions and internal notes. Only for callers allowed to see Merkle pricing.
 */
export function offeringView({ pricing = false } = {}) {
  const offers = Object.entries(offering.offers).map(([code, o]) => ({
    code,
    name: o.name,
    /* Who the offer is for, in the client's own situation rather than in
       gate counts. "Two or more scope gates" is true and tells a consultant
       nothing about which brand is sitting across the table. */
    for_whom: o.for_whom ?? null,
    delivery_track: o.delivery_track,
    /* The middle offer carries a label, and it is not decoration: most engagements
       land here, and a consultant who cannot say which one is usual ends up
       presenting three equals and letting the client pick the cheapest. */
    ...(o.most_common ? { most_common: true } : {}),
    triggered_by: o.triggered_by,
    base_scope: o.base_scope.split(' · '),
    duration_weeks: o.duration_weeks,
    ...(pricing ? { price_band: money(o.price_band), currency: offering.currency } : {}),
    approach: APPROACH[code],
    /* Where the weeks go. "Four to five weeks" is a number a consultant has to
       defend in a room, and the only defence is the phases — which is also the
       answer to "what does set-up actually include". They sum to the offer's
       duration exactly, and a test holds them to it. */
    phases: o.phases ?? [],
    /* And who is being sold to. B2B used to be a modifier on a consumer base,
       which charged a wholesale-only client for consumer work they never got. */
    channels: o.channels ?? null,
    /* And how it is built. Ecommerce Growth builds as a theme or as Hydrogen
       and spends the same weeks differently, so the track is a decision inside
       the offer rather than a label on it. */
    tracks: o.tracks ?? null,
    /* What gets built, counted. "The templates the catalogue needs" is true and
       unquotable; a client buying a fixed price wants the list and the number of
       bespoke sections, because that is the line they will argue about. */
    storefront: o.storefront ?? null,
    /* What is deliberately not in it, and what the client has to bring. An
       offer that only lists what it includes is the one that gets argued about
       in week six — and "we assumed you had a sandbox" is not an argument
       anybody wins. */
    not_included: o.not_included ?? [],
    /* The quantities a fixed price rests on. Not a boundary and not an
       obligation: the third round of feedback, the second data load and the
       training session nobody counted are where a fixed price quietly becomes
       time and materials, and none of them was written down anywhere. */
    assumes: o.assumes ?? [],
    client_provides: o.client_provides ?? [],
    /* How many weeks of scope gates this band already holds. Each offer is an S
       plus the gate work it was sized for, so the number differs per offer —
       and a page that prints what a gate costs without it leaves the reader to
       guess whether the cost is inside the band or on top of it. */
    gate_capacity_weeks: gateCapacity(code),
  }));

  // A gate can have more than one modifier now: a migration is priced by where
  // the data comes from. Keyed by gate id, a Map kept only the last one, so
  // every page showed a migration as the heavy tier — five to seven weeks for a
  // WooCommerce store the engine prices at one to two.
  const byGate = new Map();
  for (const m of offering.modifiers) byGate.set(m.gate, [...(byGate.get(m.gate) ?? []), m]);

  const gates = offering.scope_gates.map((g) => {
    const all = byGate.get(g.id) ?? [];
    const [first] = all;
    if (!first) return { id: g.id, label: g.label, condition: g.condition };
    // The headline figure spans every tier, so a gate never claims to cost more
    // than its cheapest case or less than its dearest.
    const effort = {
      min: Math.min(...all.map((m) => m.effort_weeks.min)),
      max: Math.max(...all.map((m) => m.effort_weeks.max)),
    };
    const price = {
      min: Math.min(...all.map((m) => m.price_add.min)),
      max: Math.max(...all.map((m) => m.price_add.max)),
    };
    return {
      id: g.id,
      label: g.label,
      condition: g.condition,
      modifier: all.length === 1 ? first.id : null,
      adds: all.length === 1 ? first.description : null,
      effort_weeks: effort,
      ...(pricing ? { price_add: money(price) } : {}),
      // Every tier, named, so a consultant can see which case they are in
      // rather than read one number that is right for a third of engagements.
      ...(all.length > 1 ? {
        tiers: all.map((m) => ({
          tier: m.tier,
          label: m.id,
          adds: m.description,
          effort_weeks: m.effort_weeks,
          ...(pricing ? { price_add: money(m.price_add) } : {}),
        })),
      } : {}),
    };
  });

  const byResult = (result) => offering.exit_rules
    .filter((r) => r.result === result)
    .map((r) => ({
      id: r.id,
      // What a consultant reads. The condition is the engine's own wording and
      // travels with it, behind "the exact rule" — a page linked from the main
      // navigation was publishing repo paths and schema expressions.
      label: r.label ?? null,
      condition: r.condition,
      destination: r.destination,
      ...(pricing && r.internal_note ? { internal_note: r.internal_note } : {}),
    }));

  // Which Shopify features push the plan up, from the rules the engine runs.
  const planGates = PLAN_RULES
    .map(({ feature, plan, docs }) => ({ feature, plan: PLAN_LABEL[plan] ?? plan, docs }))
    .sort((a, b) => ['Grow', 'Advanced', 'Shopify Plus'].indexOf(a.plan) - ['Grow', 'Advanced', 'Shopify Plus'].indexOf(b.plan));

  return {
    version: offering.version,
    pricing,
    offers,
    classification: offering.classification.map((c) => ({ order: c.order, when: c.when, offer: c.offer, plain: plainRule(c), ...(c.apply_modifier ? { with_modifier: true } : {}) })),
    gates,
    /* What each pack sells, closed. The rest of this view answers "how is an
       offer decided"; this answers the question a client asks instead — if I
       buy an M, what exactly do I get. `limits` is the machine-readable twin
       the test builds from and has no business on a page, so it is not here. */
    closed_scope: (offering.closed_scope?.rows ?? []).map(({ id, what, gate, group, shopify_limit: shopifyLimit, S, M, L, note, addon, addon_label: addonLabel }) => ({
      id,
      what,
      gate: gate ?? null,
      /* The section heading the row reads under. Twenty-two rows in one flat
         list is a scroll, not a comparison; grouped, a reader can find the
         four rows they came for. */
      group,
      /* The documented platform ceiling behind the row, or the fact that
         Shopify documents none — which is itself the answer a consultant
         needs in a room, and the one they used to have to guess at. */
      shopify_limit: shopifyLimit ?? null,
      values: { S, M, L },
      ...(note ? { note } : {}),
      /* Which packs can buy more of this, and what it costs there. A ceiling
         the client can buy past is not a refusal, and printing one loses the
         sale in the room — but an add-on with no price beside it is just a
         softer no. The cost is the gate's own, so it cannot drift from what
         the engine quotes. */
      ...(addon?.length ? { addon, ...(addonLabel ? { addon_label: addonLabel } : {}), cost: addonCost(gate, pricing) } : {}),
    })),
    /* The reading order of the row groups, so the page groups the table the
       way the schema does rather than re-deriving an order of its own. */
    closed_scope_groups: offering.closed_scope?.groups ?? [],
    /* The add-on services catalogue: every gate that can be bought on top of a
       pack, including the three no pack includes anything of — B2B, Shopify
       POS and subscriptions — which is why they are no longer rows. */
    addons: (offering.closed_scope?.addons ?? []).map((a) => addonService(a, pricing)),
    l_triggers: offering.l_triggers.map(({ id, label, condition }) => ({ id, label, condition })),
    exits: {
      beyond_offers: byResult('STOP'),
      flags: byResult('FLAG'),
      commercial: byResult('WARN'),
    },
    routes: offering.routes.map(({ id, label, proposal, description }) => ({ id, label, proposal, description })),
    plan_gates: planGates,
  };
}
