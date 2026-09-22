---
title: Custom apps and Shopify Functions — when a client needs one, and what owning it costs
verified: 2026-09-21
topics: integrations, checkout
summary: When a requirement genuinely needs an app rather than a setting or an App Store listing, what custom distribution does and does not allow, why Functions on a custom app are Plus-only, and the webhook guarantees that make reconciliation mandatory rather than optional.
---

## Why this decision matters

"We'll need a custom app" is one of the most expensive sentences in a discovery,
and it is usually said too early. It is also sometimes true, and said too late.
The difference is worth getting right, because a custom app is not a deliverable
that finishes — it is a piece of software the client now owns, on a platform that
ships a new API version every three months.

This chapter is about the three questions that decide it: does the requirement
actually need an app, what shape of app is it, and what does the client sign up to
by having one.

## The ladder, and where an app sits on it

A requirement climbs the same ladder in every offer, cheapest first: a native
Shopify feature, then an App Store app, then theme work, then custom. A custom app
belongs at the bottom rung, and the discipline is to write down why the three above
it do not work before reaching for it.

In practice a custom app is the honest answer when:

- **A system has to talk to Shopify and no connector exists.** This is the common
  case: an ERP, PIM, OMS or 3PL with no App Store listing and no iPaaS connector the
  client already licenses.
- **Backend commerce logic has to change** — a discount Shopify does not have, a
  delivery option hidden under a condition, a validation that blocks checkout. That
  is Shopify Functions, and Functions ship inside an app.
- **Something has to happen when Shopify says so** — an order paid, a product
  updated, a customer created — and it has to happen reliably. That is webhooks, and
  a webhook needs somewhere to arrive.

It is *not* the answer to a storefront problem. A storefront need is theme work, a
theme app extension, or the headless decision — none of which is this.

## Custom distribution, and what it rules out

Shopify has two live distribution models [1].

**Public distribution** apps "can be installed on multiple Shopify stores", require
App Store review, and must comply with data syncing requirements [1].

**Custom distribution** apps are installed on a single store, on multiple stores
within the same Plus organisation, or on transfer-disabled development stores [1].
No App Store review [1]. But they "can't charge merchants through Shopify's app
billing system" [1].

Two things follow for scoping.

- **A multi-store client on Plus can share one custom app across its organisation.**
  That is a genuine saving and worth asking about early, because the alternative —
  one app per store — is the same build maintained several times.
- **A multi-store client that is *not* one Plus organisation cannot.** If the
  engagement covers separate legal entities on separate plans, a custom app does not
  travel between them, and either the architecture or the topology has to change.

## Functions on a custom app are Plus-only

This is the fact that most often moves a plan, and it is easy to miss.

Public app functions work on all plans. But "only stores on a Shopify Plus plan can
use custom apps that contain Shopify Function APIs" [2].

So a client on Grow or Advanced who needs a discount Shopify does not offer, or a
checkout validation rule, has exactly three routes: find a public App Store app that
does it, change the requirement, or move to Plus. A discovery that records "custom
discount logic" and quotes a non-Plus plan has an unpriced contradiction in it, and
the plan gate exists to catch precisely this.

Functions themselves are written in "any language that can compile a WebAssembly
module" meeting Shopify's requirements, with Rust "strongly recommend[ed] as the most
performant language choice to avoid your function failing with large carts" [2].
JavaScript is supported [2]. They cover discounts, payment and delivery
customisation, cart and checkout validation, order routing and fulfilment
constraints, and merchandising [2].

## Scripts are ending, and the date is close

Any Plus client running Shopify Scripts today has a migration with a deadline on it:

- **April 15, 2026** — "Editing and publishing new Shopify Scripts will no longer be
  possible." [3]
- **June 30, 2026** — "All Shopify Scripts will cease to execute entirely." [3]

Shopify's advice is to "begin your migration as soon as possible", using the Shopify
Scripts customizations report in the admin to see what is running and what it maps to
[3].

For a discovery this is not background: a Plus client with live Scripts has
undiscovered scope. The Scripts have to be found, read, and rebuilt as Functions —
and some of them will turn out to be checkout UI work rather than logic, which is
Checkout Extensibility and a different piece. Ask for the customizations report
before the architecture is baselined, not after.

## Webhooks: the guarantee is weaker than people assume

Shopify's own documentation is direct about it: "Webhook delivery isn't always
guaranteed", and a receiver should "ignore duplicate deliveries using
`X-Shopify-Webhook-Id`" [4]. Deliveries can go to an HTTPS endpoint, a Google
Pub/Sub URI or an Amazon EventBridge ARN [4]. Every delivery carries metadata
headers including an HMAC signature in `X-Shopify-Hmac-Sha256`, which the receiver
must verify before it trusts the payload [4].

And a shop-specific subscription that keeps failing does not fail loudly — "Failing
subscriptions will be deleted by Shopify" [5]. App-specific subscriptions are not
deleted automatically [5]. A subscription that has been removed looks exactly like a
quiet week.

**Three consequences, and they are the same three every time.**

1. **Every connection needs a reconciliation job**, not just the complicated ones.
   Something has to compare Shopify against the other system on a schedule and report
   the difference. This is why the integration modifier prices one per connection.
2. **Every receiver must be idempotent.** Duplicates are expected, not exceptional.
   Dedupe on the webhook id.
3. **HMAC verification is not optional** and is a security gate on this project, not
   a nicety: verify `X-Shopify-Hmac-Sha256` before processing any payload.

## What owning an app actually costs the client

A custom app is a system the client owns. Price the ownership, not only the build:

- **The quarterly API cycle.** A new version every three months, each supported for a
  minimum of twelve — so the app is revisited roughly once a year, for ever, or it
  falls forward onto an older contract silently. See the APIs chapter.
- **A place for it to run**, unless it is Functions-only. Hosting, monitoring, alerts
  and somebody who is called when it stops.
- **Secrets and access.** Tokens and API keys that live somewhere managed, are
  rotated, and are never in a theme or a repository.
- **A named owner after go-live.** If the client cannot name one, that is a finding
  for the risk register, not a detail to settle later.

If none of that is in the support model, the app is a liability with a launch date.

## What to record in discovery

- **Whether the requirement really needs an app**, with the native and App Store
  options weighed and the reason written down.
- **Which distribution**, and — if custom and multi-store — whether every store is in
  the same Plus organisation.
- **Whether any Function is required on a non-Plus plan.** That is a plan decision
  disguised as a feature.
- **Whether the client runs Shopify Scripts today**, and the customizations report.
- **The reconciliation job per connection**, and who reads its output.
- **Who owns the app after handover**, by name.

## Sources

1. App distribution — https://shopify.dev/docs/apps/launch/distribution — public distribution apps "Can be installed on multiple Shopify stores" and require App Store review; custom distribution apps are installed on a single store, on multiple stores within the same Plus organization, or on transfer-disabled development stores, need no App Store review, and "Can't charge merchants through Shopify's app billing system" — checked 2026-09-21
2. Shopify Functions — https://shopify.dev/docs/apps/build/functions — functions customise "the backend logic of Shopify" across discounts, payments, delivery, cart and checkout validation, order routing, fulfilment constraints and merchandising; written in "any language that can compile a WebAssembly module", with Shopify "strongly recommend[ing] Rust as the most performant language choice to avoid your function failing with large carts"; "only stores on a Shopify Plus plan can use custom apps that contain Shopify Function APIs" — checked 2026-09-21
3. Shopify Scripts will be deprecated on June 30, 2026 — https://shopify.dev/changelog/shopify-scripts-will-be-deprecated-on-june-30-2026 — "April 15, 2026—Editing and publishing new Shopify Scripts will no longer be possible."; "June 30, 2026—All Shopify Scripts will cease to execute entirely."; merchants are advised to "begin your migration as soon as possible" using the Shopify Scripts customizations report — checked 2026-09-21
4. Webhooks — https://shopify.dev/docs/apps/build/webhooks — "Webhook delivery isn't always guaranteed"; receivers should "ignore duplicate deliveries using `X-Shopify-Webhook-Id`"; deliveries go to HTTPS endpoints, Google Pub/Sub URIs or Amazon EventBridge ARNs; "Each delivery includes metadata headers" including an HMAC signature in `X-Shopify-Hmac-Sha256` — checked 2026-09-21
5. Subscribe to webhooks — https://shopify.dev/docs/apps/build/webhooks/subscribe — for shop-specific subscriptions, "Failing subscriptions will be deleted by Shopify"; app-specific subscriptions are not deleted automatically — checked 2026-09-21
