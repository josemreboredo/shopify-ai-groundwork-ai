---
title: Shopify's APIs — which one, what it costs to call, and what versioning commits you to
verified: 2026-09-21
topics: integrations
summary: Sets out the Admin, Storefront and Customer Account APIs, the quarterly version cycle and the maintenance it commits a client to, and the rate limits that decide how an integration has to be designed.
---

## Why this decision matters

Every integration in a Shopify engagement rests on three choices that are rarely
discussed with the client: which API the connection uses, how often somebody has to
come back and keep it working, and how much the store is allowed to ask for per
second. The first is usually obvious. The second and third are where estimates go
wrong, because both are commitments that outlive the build.

An integration is not delivered once. Shopify releases a new API version every three
months, and each stable version is supported for a minimum of twelve months [1]. That
is the real shape of the commitment: whatever is built has to be revisited roughly
once a year, for ever, or it stops working. A discovery that prices the build and
says nothing about that has priced half the thing.

## The three APIs, and which one a requirement belongs to

**The Admin API** is the back office: products, inventory, orders, customers,
fulfilment, discounts, metafields. Anything an ERP, PIM, OMS or 3PL connects to is
here. It comes in two shapes, and only one of them is a live option — see the next
section.

**The Storefront API** is what a headless front end reads and writes: the catalogue as
a shopper sees it, the cart, and the `checkoutUrl` that hands the buyer to Shopify's
own checkout. It is also what a mobile app or an in-store screen would use. It is
public by design and scoped read-mostly.

**The Customer Account API** is the logged-in shopper: order history, profile,
addresses, and — this matters on any B2B engagement — the company accounts a
wholesale buyer signs in to.

The practical rule for scoping: if the data moves between Shopify and a system the
client already runs, it is the Admin API and it is an integration with a cost. If the
data is being rendered to a shopper on something that is not a Shopify theme, it is
the Storefront API and it belongs to the storefront decision, not to the integration
register.

## REST is finished, and this changes estimates

The REST Admin API "is a legacy API as of October 1, 2024" [2]. From April 1, 2025,
newly created public apps must be built with the GraphQL Admin API [2]. Newer platform
features appear in GraphQL only.

Two consequences for a discovery:

- **An existing client integration written against REST is technical debt with a
  date on it.** It still runs, but it is on a path Shopify has closed. If a migration
  is in scope and the client has REST-based connections, rewriting them is work, and
  it belongs in the estimate rather than in a surprise.
- **Any middleware or iPaaS connector the client already licenses should be checked
  for what it actually speaks.** A connector built for REST is not a reason to keep
  REST; it is a question to ask the vendor before the architecture is baselined.

## Versioning: a recurring cost, not a one-off

Shopify "releases a new API version every three months at 5pm UTC on the first day of
the quarter" [1]. Versions are named by date — `2026-01`, `2026-04` — and each stable
version is "supported for a minimum of 12 months, with at least nine months of overlap
between consecutive versions" [1]. A release candidate ships alongside each stable
version for testing only; it "may include backwards-incompatible changes" [1].

If an app targets a version that is no longer accessible, Shopify "falls forward and
responds using the oldest accessible stable version" [1]. That is worse than an error,
because nothing announces itself: the integration keeps returning data, from a
different contract than the one it was written against. Apps that go on using
unsupported resources risk being delisted from the App Store and blocked from new
installs [1].

**What to do with this in a discovery.** Name it in the delivery plan and in the
support model. A client with three integrations has committed to an annual
maintenance window on each of them; that is either in a retainer, in the client's own
team's backlog with an owner, or it is nobody's — and the third case is the one that
shows up eighteen months later as an outage. The post-launch support gate exists for
exactly this conversation.

## Rate limits: the number that shapes the integration design

The GraphQL Admin API is not limited by requests per minute. It is limited by
**calculated query cost**, measured in points, drained from a bucket that refills
continuously — a leaky bucket [3]. Bursts above the restore rate succeed as long as
the average stays under it [3].

The restore rate is set by the store's plan [4]:

| Plan | Restore rate |
|---|---|
| Standard | 100 points/second |
| Advanced Shopify | 200 points/second |
| Shopify Plus | 1,000 points/second |
| Shopify for enterprise (Commerce Components) | 2,000 points/second |

Cost is calculated per field, not per call [4]:

- scalars and enums: 0 points
- objects: 1 point
- interfaces and unions: the maximum of the possible selections
- mutations: 10 points
- connections: sized by the `first` and `last` arguments

Every response carries its own accounting in `extensions.cost`:
`requestedQueryCost`, `actualQueryCost`, and a `throttleStatus` with
`maximumAvailable`, `currentlyAvailable` and `restoreRate` [5]. An integration that
does not read those fields is flying blind; one that does can pace itself.

Over the limit, the API returns a throttle error and the recommended backoff is one
second [3].

**Three things follow for scoping.**

1. **The plan is an integration decision, not only a feature decision.** A Standard
   store restores 100 points a second; a Plus store restores ten times that. An
   hourly full-catalogue sync that is comfortable on Plus can be undeliverable on
   Standard. Where an engagement has a heavy integration and no Plus requirement from
   any other direction, this is the question to ask before the architecture is fixed.
2. **Bulk operations are the answer for volume, not a bigger plan.** Bulk operations
   "don't have the max cost limits or rate limits that single queries have" [4] and
   exist to "query and fetch large amounts of data" [4]. A nightly catalogue or order
   export belongs there. An integration designed as thousands of single queries is a
   design problem that a plan upgrade only postpones.
3. **Reconciliation is not optional.** Throttling, retries and webhook delivery all
   mean an integration will, sometimes, not have heard something. Every connection
   needs a job that checks Shopify against the other system and reports the
   difference. This is why the integration modifier prices a reconciliation job on
   every connection rather than on the complicated ones.

## The Storefront API is limited differently, and it matters less

Buyer traffic on the Storefront API "isn't rate-limited at all" [3]. Public access
capacity "scales with the number of buyers, based on their IP address", and requests
from real buyers "aren't subject to a fixed request-per-minute limit" [6]. Tokenless
access carries a query complexity limit of 1,000 [6]. Checkout creation is throttled
per minute and returns a `200 Throttled` error when exceeded [6].

For a consultant the useful version is short: a headless storefront will not be
throttled by shoppers. What can be throttled is automated traffic and checkout
creation under a flash-sale load, and that is a launch-readiness question rather than
an architecture one.

## What to record in discovery

- **Which API each integration uses**, and whether anything existing is on REST.
- **Who owns the annual version upgrade** for each connection, by name. If the answer
  is nobody, that is a risk with a date on it, not a detail.
- **The plan, checked against the heaviest integration**, not only against the feature
  list.
- **Whether volume work is designed as bulk operations** or as loops of single
  queries.
- **The reconciliation job per connection**, and where its output goes when it finds
  a difference.

## Sources

1. API versioning — https://shopify.dev/docs/api/usage/versioning — "Shopify releases a new API version every three months at 5pm UTC on the first day of the quarter."; "Each stable version is supported for a minimum of 12 months, with at least nine months of overlap between consecutive versions."; a release candidate "may include backwards-incompatible changes, so not recommended for production."; "If your app targets an inaccessible version, Shopify falls forward and responds using the oldest accessible stable version." — checked 2026-09-21
2. REST Admin API — https://shopify.dev/docs/api/admin-rest — "The REST Admin API is a legacy API as of October 1, 2024."; from April 1, 2025 newly created public apps must be built with the GraphQL Admin API — checked 2026-09-21
3. API rate limits — https://shopify.dev/docs/api/usage/limits — "Each app has access to a bucket. Its size is set by the API and by your plan."; the bucket "leaks continuously at that API's restore rate"; "as long as your average stays under the restore rate, a short burst above it still succeeds."; "Buyer traffic isn't rate-limited at all"; on a throttle error "the recommended backoff time is one second." — checked 2026-09-21
4. GraphQL Admin API rate limits — https://shopify.dev/docs/apps/build/apis/graphql-admin/rate-limits — restore rates of 100 points/second (Standard), 200 (Advanced Shopify), 1000 (Shopify Plus), 2000 (Shopify for enterprise / Commerce Components); scalars and enums cost 0, objects 1, interfaces and unions "Maximum of possible selections", mutations 10, connections "Sized by `first` and `last` arguments"; bulk operations "don't have the max cost limits or rate limits that single queries have" and are used to "query and fetch large amounts of data" — checked 2026-09-21
5. GraphQL Admin API reference — https://shopify.dev/docs/api/admin-graphql — "The GraphQL Admin API is rate-limited using calculated query costs, measured in cost points"; "Each field returned by a query costs a set number of points. The total cost of a query is the maximum of possible fields selected, so more complex queries cost more to run."; responses return `extensions.cost` with `requestedQueryCost`, `actualQueryCost` and a `throttleStatus` of `maximumAvailable`, `currentlyAvailable` and `restoreRate` — checked 2026-09-21
6. Storefront API — https://shopify.dev/docs/api/storefront — "Public access capacity scales with the number of buyers, based on their IP address."; requests from real buyers "aren't subject to a fixed request-per-minute limit"; "Tokenless access has a query complexity limit of 1,000."; checkout creation is throttled per minute and returns a "200 Throttled" error — checked 2026-09-21
