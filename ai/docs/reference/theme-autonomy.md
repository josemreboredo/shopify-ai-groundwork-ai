---
title: What the client's team can change without a developer — and where the theme stops
verified: 2026-09-21
topics: storefront
summary: The line between what a merchant edits in the theme editor and what needs a developer, the limits that decide how a template can be composed, and the pages a theme cannot reach at all.
---

## Why this decision matters

"Can we change it ourselves?" is the question a client asks at the end of a
discovery and lives with for three years. It is also the question most likely to be
answered with a reassuring generality and then disproved in week two after launch,
when marketing wants a landing page and finds that the section they need does not
exist and nobody on their side can create one.

The answer is not a matter of opinion. Shopify draws a specific line between what a
merchant can do in the theme editor and what requires somebody to write and deploy
theme code. Knowing exactly where it falls changes three things in a discovery: how
the storefront design gate is scoped, what the training and SOPs at handover have to
cover, and whether the client needs a retainer at all.

## What a merchant can genuinely do alone

Inside the theme editor, and without touching code, a merchant can [1]:

- **add, remove and reorder sections** on a template — but only sections whose file
  includes `presets` in its schema
- **change section settings and configure blocks** within those sections
- **add custom CSS at section level**

That is a real amount of autonomy, and it is why the offers default to configuring a
theme rather than rebuilding one. A well-built template set gives the client's team a
page composer: hero, featured collections, rich text, image with text, testimonials,
rearranged and re-settinged at will.

Content that changes without a theme release goes further still. Metaobjects let
structured content — a size guide, a store locator entry, a campaign — be created and
edited in the admin and rendered by the storefront, which is why the offers put the
product model and metaobjects in the same phase.

## What always needs a developer

The other side of the line is just as specific [1]:

- **the section itself.** Somebody has to write the section file and define its
  schema. A merchant can place a section; they cannot invent one.
- **the `presets` that make it placeable.** A section without presets has to be
  added to the JSON template by hand, and "merchants cannot modify these" [1].
- **which templates a section is allowed on**, controlled by `enabled_on` and
  `disabled_on` [1].

This is the whole of the misunderstanding, and it is worth saying to the client in
these words: **the team can compose pages from the blocks you give them, and cannot
create new kinds of block.** Everything the client expects to build themselves later
has to exist as a section with presets at handover, or it is a developer ticket.

That sentence is the real content of the storefront design gate. A design that only
covers key screens leaves the merchant with the sections those screens happened to
need; a full template set, built as sections and blocks over one token layer, leaves
them with a kit.

## The limits that shape a template

Three numbers decide how far composition can go [1]:

| | Limit |
|---|---|
| Sections per JSON template | 25 |
| Blocks per section | 50 |
| JSON templates per theme | 1,000 — "After the limit is reached, you can't create new JSON templates." |

Twenty-five sections is generous for a page and tight for a long-form landing page
built entirely from small modules — which is a design conversation to have before the
design, not after it. A thousand templates is effectively unlimited except in one
case worth checking: a client who expects a bespoke template per product or per
campaign at scale is describing a metaobject pattern, not a template pattern.

## The pages a theme cannot reach

Sections "can be customized and added to any page of your online store, with the
exception of gift card and checkout pages" [2].

Checkout is the one that matters commercially. It is not a theme surface, and the
merchant's autonomy there is a different mechanism entirely — Checkout Extensibility
and its editor, with anything past the editor's own branding built as an extension
and deployed as an app. A client who says "we'll style the checkout ourselves" is
describing something the theme cannot do, and where a Function is involved, something
their plan may not allow at all. See the custom apps chapter.

## Apps can add to the editor too

Theme app extensions let merchants "easily add dynamic elements to their themes
without having to interact with Liquid templates or code" [3]. An app that ships app
blocks gives the merchant new blocks to place, without a theme release and without a
developer.

This matters when the ladder is being climbed in a discovery. "There is an app for
it" is a stronger answer than it looks when the app also extends what the client's
team can do afterwards — and a weaker one when the app only exposes its own admin and
leaves the storefront unchanged. Ask which it is.

## What to record in discovery

- **Which sections the client expects to compose with after launch**, by name. The
  ones that do not exist at handover are either in scope or in a retainer.
- **Whether the design covers key screens or the full template set.** That is the
  storefront design gate, and it is also the answer to the autonomy question.
- **Who on the client side will actually use the theme editor**, and whether they
  have used one before. This sizes the training, and training is priced.
- **Anything expected of the checkout**, which is not a theme surface and may not be
  a plan the client is on.
- **Whether a bespoke-page-per-product expectation is really a metaobject**, before
  it becomes a thousand templates.

## Sources

1. JSON templates — https://shopify.dev/docs/storefronts/themes/architecture/templates/json-templates — JSON templates render "up to 25 sections, and each section can have up to 50 blocks"; a theme can contain "up to 1,000 JSON templates. After the limit is reached, you can't create new JSON templates."; merchants can add, remove and reorder sections whose schema includes presets, change section and block settings and add section-level custom CSS, while sections without presets must be added to the JSON file by hand and "merchants cannot modify these"; `enabled_on` and `disabled_on` control which templates a section may be added to — checked 2026-09-21
2. Extending your theme — https://help.shopify.com/en/manual/online-store/themes/theme-structure/extend — "Sections can be customized and added to any page of your online store, with the exception of gift card and checkout pages." — checked 2026-09-21
3. Theme app extensions — https://shopify.dev/docs/apps/build/online-store/theme-app-extensions — "Theme app extensions allow merchants to easily add dynamic elements to their themes without having to interact with Liquid templates or code." — checked 2026-09-21
