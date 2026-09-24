# ADR 0019 — The quote follows the scope; packs are packaging

- **Status:** Accepted (2026-09-23, Lead Consultant decision)
- **Date:** 2026-09-23
- **Amends:** ADR 0001 (offer model)

## Context

The engine classified an engagement into S, M or L and quoted the pack's price band, adding only the gate weeks that
overflowed the pack's capacity. The floor followed the scope; the ceiling snapped to the pack. An offering audit on
2026-09-23 (six dimensions, every finding checked by an adversarial skeptic, every competitor price re-fetched) measured
the consequence:

- half a week of extra scope moved a quote by CHF 75–105k and nine weeks (S→M +80–90k, M→L +105k);
- an M that discovery found needed a second store was re-quoted as an L at CHF 140–260k, for two weeks of work;
- add-ons listed at one price changed the quote by anything from CHF 0 to 105k depending on the pack;
- modifier rates had drifted to CHF 7–13k a week, with migrations, B2B and design the cheapest work.

The Lead Consultant's framing: the packs on the offering pages open a commercial conversation; an RFP and its answers
give an estimate of the scope identified; a discovery closes the scope. Human developers then estimate the approach and
give the final figure, and the commercial team adds contingency and services such as Design and QA testing.

## Decision

1. **The quote is the Foundation base plus every active scope gate at its own weeks and price**, floor and ceiling alike —
   the rule S already used for its one gate, generalised. A headless storefront is quoted at no less than the L band
   until Hydrogen has a modifier of its own (a floor of its own since L holds nine markets — see Consequences).
2. **One weekly rate prices every modifier** (`offering.pricing.weekly_rate`, CHF 10.5k at first, CHF 10k from the same day), so a gate's price is its weeks. One client decision is one price: a further market carries its currency, and a catalogue of 5,000 SKUs or more carries Shopify's own search.
3. **The name is the largest pack whose price floor the quote reaches, among the packs that sell as add-ons everything
   past their promise**; what goes past is listed as `offer.addons`. A pack's promise is `closed_scope.limits` built into
   an engagement (`ai/engine/promise.js`) and run through the same gates. A second store is an add-on on M; L includes
   three.
4. **A pack's band is what an engagement at its promise costs**, and a test keeps the promise inside the published band.
5. **Estimates carry their stage** (RFP estimate, discovery in progress, discovery closed), and a won bid keeps the
   estimate it was won on, so a re-estimate reads gate by gate against it.

## Consequences

- Quotes are continuous and monotone (property-tested on all four numbers over every dimension). Most fall: the ceiling of
  a typical M by about CHF 10k, of an L by about CHF 20k; they rise only where the scope exceeds a pack's promise.
- M's band tops out at CHF 170k, where M's own promise lands at the one rate.
- The capacity arithmetic (`gate_capacity_weeks`) no longer prices anything; it is kept for the pack pages and for
  rule 11.3, which reads the largest pack's envelope.
- Offering 3.0.0.
- L is renamed **Ecommerce Flagship** (was Ecommerce Growth): "Growth" read as the small option next to the Grow retainer
  and Shopify's Grow plan (audit CB-17), and "Enterprise" is the Merkle Enterprise Engagement route.
- **Inclusions by pack** (2026-09-23): hypercare of 5, 10 and 15 working days (a week of hypercare at half a build week) and
  3, 6 and 10 third-party apps (each further app an eighth of a week). A bigger pack's included apps never outweigh the
  hypercare it adds, so crossing into it never makes a quote cheaper. Bands: S CHF 30–55k, M 65–153k, L 140–245k+.
- **The build week is an offshore team** (2026-09-23): front-end and back-end developers, QA, a project manager, a business
  analyst and a solution architect — 2.5 people — at the offshore rate card: CHF 6.3k a week. The shape comes from a real
  estimation the engine quotes at 20–29.5 weeks; QA is inside the team, so the commercial team no longer adds it on top.
  The Foundation band and each pack's floor are its weeks at the rate with its hypercare: S 28–35k, M 44–96k, L 91–155k+.
- **Apps in every further store** (2026-09-23): a pack's app allowance is its first store's; every app is installed and
  configured again in each store past the first, an eighth of a week per app and store, in every pack.
- **L holds nine markets** (2026-09-23): three stores are how a brand sells across regions, and three markets — one per
  store, no more than M — did not describe that brand. L's promise is nine markets across its stores (S 1, M 3, L 9), so
  its band is CHF 91–192k+ and 13–29 weeks, and rule 11.3's line moves from 19 to 24 gate-weeks. A headless build does
  not get those markets, so its floor stays where it was (CHF 91–155k, 13–24 weeks) as a value of its own
  (`offers.L.headless_floor`). No engagement's quote changes: the quote follows the scope, and only the promise moved.
- **Design by the design day** (2026-09-24): Merkle designs the storefront, and it is no longer quoted on top. A near-shore
  experience designer is not part of the build week — most add-ons need no design, and a designer in the team would be
  charged on every migration and integration — so design is priced by the design day (`pricing.design`): S adapts the UI to
  the brand identity (3–5 days), M adds the custom templates (8–12), L designs the custom theme (20–30). Each design add-on
  carries its own days on its modifier: the storefront tiers, a further storefront design, checkout blocks, B2B, subscriptions
  and a search app. Design runs alongside set-up, so it adds to the price and not to the weeks. Bands: S CHF 31–38k, M 50–105k,
  L 106–214k+; the headless floor carries L's design too (CHF 106–178k).
- **Custom templates on a Shopify theme** (2026-09-24): a large, global set-up can keep a Shopify theme instead of the custom
  one, with each page template it needs designed and built new — half a build week and 2–3 design days each (gate
  `custom_templates`, question Q9.1.7). A full template set designs every template, so it carries them.
- **Hydrogen is an add-on on L** (2026-09-24): it had no weeks of its own, so a headless quote was floored at L's band and
  every L band carried a "+". It is a gate now (`hydrogen`, sold in L only): 4–6 build weeks for the owned front end on
  Oxygen, and 10–15 days of a design system architect, who creates the design system in Figma and tokenises it alongside
  the experience designer (`pricing.design.system_architect`, same design day). A headless storefront brings the full
  template set with it, since there is no theme to configure. The headless floor is gone: every quote is the scope's sum,
  none open-ended, and L's band is CHF 106–214k. L on Hydrogen comes to CHF 212–263k and 28.5–35 weeks.
- **Hydrogen in every pack** (2026-09-24): the add-on is sold in S, M and L, and a headless storefront no longer names the
  engagement L — the headless L trigger and the classification rule it drove are gone, and the name follows the budget like
  any other add-on. It brings the full template set with it, bought alongside it in S and M. L's build label is "Custom
  Liquid"; the track is still an answer (`offer.delivery_track`), read off the hydrogen gate.
- **Hydrogen, challenged per pack** (2026-09-24): 5–7 build weeks in two parts — the React front end over a Liquid build
  of the same templates (3–4) and the back end a theme never needs, API queries, hooks, content, cache revalidation and
  events (2–3) — plus 10–15 design system days. Priced against each pack's own promise: in S it brings the full template
  set designed (CHF 69–103k), in M it builds on M's template design days (61–88k), in L it only swaps the custom Liquid
  theme (39–55k).
- **Agentic commerce** (2026-09-24): the discovery asked a whole section about selling through AI assistants and the
  backlog delivered it, unpriced. The pack table has an AI channels row — Shopify’s agentic storefronts on their defaults,
  in every pack — and the `agentic_commerce` add-on prices taking the channel on deliberately (standard, 1–1.5 weeks: terms,
  customer data, settings, catalogue mapping, Knowledge Base answers, a crawler policy) or the store’s own assistant on its
  Storefront MCP endpoint (advanced, 4–6 weeks and 3–5 design days). Every fact was checked on help.shopify.com and
  shopify.dev that day; the check found questions 7.7.1 and 7.7.4 stale — the requirements page no longer states a
  country or plan requirement — and they were corrected in English, German and French.
- **Promotions** (2026-09-24): the pack table has a Promotions row — Shopify’s own discounts (codes and automatic, amount
  or percentage off, buy X get Y, free shipping, scheduled sales, native combinations), the same in every pack. What they
  cannot express is the `custom_promotions` add-on, a discount Function: tiered or volume discounts for consumers (standard,
  1–1.5 weeks and 1 design day) or stacking rules of the business’s own (advanced, 2–3 weeks and 1–2 design days). The
  backlog built that Function unpriced until now. A custom app containing a Function needs Shopify Plus; below Plus it comes
  in a public App Store app (shopify.dev and help.shopify.com, checked 2026-09-24).
