/**
 * @file marketing.js — epic "Marketing & analytics" (LWC-MKG-*)
 */

import { list, listOr, languages, isMigration, recommendedApps, themeName } from './helpers.js';

const trackers = (doc) => [...(doc.marketing?.analytics?.platforms ?? []), ...(doc.marketing?.analytics?.pixels ?? [])];
const reviewsApp = (doc) => doc.marketing?.reviews?.app ?? recommendedApps(doc).find((a) => /review/i.test(`${a.requirement ?? ''} ${a.name}`))?.name;

/** @type {import('../model.js').StoryDefinition[]} */
export default [
  {
    key: 'LWC-MKG-001',
    epic: 'marketing',
    title: 'Set up SEO foundations: metadata, structured data and indexing',
    user_story: 'As a marketer, I want every page indexable with good titles and structured data, so that organic search brings qualified traffic.',
    acceptance_criteria: (doc) => [
      'Given product, collection, page and blog templates, when titles and meta descriptions are empty, then sensible defaults render and merchants can override them per resource',
      'Given the storefront, when it is crawled, then canonical URLs, sitemap.xml, robots.txt and Product/Organization/BreadcrumbList structured data are valid with no duplicate indexable URLs from filters or tags',
      ...(languages(doc).length > 1 ? [`Given ${list(languages(doc))}, when pages are crawled, then SEO titles and descriptions are translated${doc.markets?.seo_per_language ? ' and translated URL handles are used' : ''}`] : []),
      `Given Google Search Console, when the ${isMigration(doc) ? 'domains are prepared for launch' : 'store launches'}, then the domain property is verified and the sitemap is submitted`,
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'agent',
    depends_on: ['LWC-THM-005'],
    spec_refs: ['/marketing/seo/priority_channel', '/marketing/seo/custom_urls', '/marketing/seo/owner', '/markets/seo_per_language'],
    applies: () => true,
    agent_prompt: (doc) => `SEO owner: ${doc.marketing?.seo?.owner ?? 'to confirm'}; priority channel: ${doc.marketing?.seo?.priority_channel ? 'yes' : 'no'}. In ${themeName(doc)}, check title and meta description fallbacks, canonical tags, Open Graph tags and structured data (fix gaps with theme code, not an SEO app, unless approved). Shopify generates sitemap.xml and hreflang natively — do not add custom hreflang. Only customise robots.txt.liquid to block faceted filter parameters if crawl data shows a problem. ${doc.marketing?.seo?.custom_urls ? 'Custom URL structures were requested: explain Shopify\'s fixed /products/ and /collections/ paths and agree handles instead. ' : ''}${languages(doc).length > 1 ? 'Translate SEO fields and handles per language. ' : ''}Hand over an SEO checklist to the SEO owner.`,
  },
  {
    key: 'LWC-MKG-002',
    epic: 'marketing',
    title: (doc) => `Set up ${listOr(trackers(doc), 'analytics')} tracking with Shopify customer events`,
    user_story: 'As a marketer, I want reliable ecommerce tracking that respects consent, so that I can measure campaigns without legal risk.',
    acceptance_criteria: (doc) => [
      ...trackers(doc).map((t) => `Given ${t}, when a test visitor who has consented views a product, adds to cart, starts checkout and purchases, then the events arrive with value, currency and item data`),
      'Given a visitor who declines analytics or marketing cookies, when they browse and buy, then no pixel fires for the declined purposes',
      ...(doc.marketing?.analytics?.custom_events?.length ? [`Given custom events ${list(doc.marketing.analytics.custom_events)}, when the interaction happens, then the theme publishes them through Shopify.analytics.publish and subscribed pixels receive them`] : []),
      'Given the checkout, when purchase events are inspected, then no tracking code was added to checkout outside customer events',
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'agent',
    depends_on: ['LWC-CMP-001'],
    spec_refs: ['/marketing/analytics/platforms', '/marketing/analytics/pixels', '/marketing/analytics/tag_manager', '/marketing/analytics/custom_events'],
    security_flags: ['pii'],
    applies: (doc) => trackers(doc).length > 0,
    agent_prompt: (doc) => `Implement tracking for ${listOr(trackers(doc), 'the agreed platforms')} through Shopify customer events: use the Google & YouTube app for GA4 and Google Ads, the Facebook & Instagram app for the Meta pixel, and app pixels from other vendors where available; use a custom pixel (Settings > Customer events) only for platforms without an app pixel. ${doc.marketing?.analytics?.tag_manager ? 'Google Tag Manager was requested: load it inside a custom pixel (sandboxed, no DOM access) and document its limitations, or recommend native app pixels instead. ' : ''}Set each pixel's customer privacy purposes so the Customer Privacy API consent decides whether it runs. ${doc.marketing?.analytics?.custom_events?.length ? `Publish custom events (${list(doc.marketing.analytics.custom_events)}) from the theme with Shopify.analytics.publish. ` : ''}Remove any tracking snippets from theme.liquid. Verify with GA4 DebugView and Meta Events Manager test events, with and without consent.`,
  },
  {
    key: 'LWC-MKG-003',
    epic: 'marketing',
    title: 'Enable server-side conversion tracking',
    user_story: 'As a marketer, I want conversions sent server-side as well as in the browser, so that ad platforms get accurate data despite blockers.',
    acceptance_criteria: [
      'Given a consented purchase, when it is completed, then the server-side event (for example Meta Conversions API) is received and deduplicated with the browser event by event ID',
      'Given a visitor who declined marketing consent, when they purchase, then no server-side marketing event is sent',
      'Given the data sent, when it is reviewed, then customer identifiers are hashed by the platform connector and the data-sharing level is documented in the privacy policy',
    ],
    gaia_tier: 'T3',
    points: 5,
    owner: 'developer',
    depends_on: ['LWC-MKG-002'],
    spec_refs: ['/marketing/analytics/server_side', '/marketing/analytics/pixels', '/compliance/privacy_regimes'],
    security_flags: ['pii', 'secrets'],
    applies: (doc) => doc.marketing?.analytics?.server_side === true,
    agent_prompt: (doc) => `Server-side tracking for ${listOr(doc.marketing?.analytics?.pixels, 'the ad platforms')}: prefer native connectors (Facebook & Instagram app with the maximum data-sharing setting for Conversions API; Google & YouTube app enhanced conversions). Only if a platform has no native connector, propose a server-side option (T3) for approval — webhook consumers must verify X-Shopify-Hmac-Sha256 and keep API tokens in environment secrets. Respect consent from the Customer Privacy API. Update the privacy policy data-sharing section with legal.`,
  },
  {
    key: 'LWC-MKG-004',
    epic: 'marketing',
    title: (doc) => `Connect ${doc.marketing?.esp?.platform} and rebuild email flows`,
    user_story: 'As a marketer, I want our email platform connected with the flows that drive revenue, so that automated emails work from day one.',
    acceptance_criteria: (doc) => [
      `Given the ${doc.marketing?.esp?.platform} Shopify integration, when a customer subscribes, browses, adds to cart or orders, then the profile and events sync within minutes with consent status`,
      ...(doc.marketing?.esp?.flows ?? []).map((f) => `Given the "${f}" flow, when a test profile triggers it, then the email sends in the profile's language with correct product data and unsubscribe link`),
      `Given the storefront sign-up forms, when they are published, then they use ${doc.marketing?.esp?.platform}'s onsite form or embed without blocking page load`,
    ],
    gaia_tier: 'T2',
    points: 5,
    owner: 'client',
    depends_on: ['LWC-CMP-004', 'LWC-FND-003'],
    spec_refs: ['/marketing/esp/platform', '/marketing/esp/flows', '/marketing/esp/segments_master', '/integrations/*/category'],
    security_flags: ['pii'],
    applies: (doc) => Boolean(doc.marketing?.esp?.platform),
    agent_prompt: (doc) => `Install ${doc.marketing?.esp?.platform}'s Shopify app, connect it to the development store and enable customer, order and catalogue sync plus onsite tracking via its app embed (respecting consent). Sync email marketing consent both ways. Rebuild flows: ${listOr(doc.marketing?.esp?.flows, 'to confirm')} — the agent sets up triggers and filters; the client team owns copy and design. Segments master: ${doc.marketing?.esp?.segments_master ?? 'to confirm'}. Disable the equivalent Shopify marketing automations to avoid duplicates. Test every flow with an internal test profile.`,
  },
  {
    key: 'LWC-MKG-005',
    epic: 'marketing',
    title: (doc) => `Add product reviews${doc.marketing?.reviews?.ugc ? ' and UGC' : ''} with ${reviewsApp(doc)}`,
    user_story: 'As a shopper, I want to read genuine reviews from other customers, so that I can buy with confidence.',
    acceptance_criteria: (doc) => [
      'Given a product with reviews, when its page loads, then the star rating shows near the title, reviews render below the fold without layout shift and AggregateRating structured data is valid',
      'Given a delivered order, when the review request is due, then the customer receives it in their language and only if review requests are permitted',
      ...(doc.marketing?.reviews?.ugc ? ['Given customer photos or social content, when they are displayed, then usage rights were granted and moderation approved them'] : []),
      'Given review moderation settings, when a review is submitted, then fake-review and profanity rules apply and verified-buyer badges are shown',
    ],
    gaia_tier: 'T2',
    points: 2,
    owner: 'agent',
    depends_on: ['LWC-THM-005'],
    spec_refs: ['/marketing/reviews/app', '/marketing/reviews/ugc', '/approach/app_shortlist'],
    security_flags: ['pii'],
    applies: (doc) => Boolean(reviewsApp(doc)),
    agent_prompt: (doc) => `Install ${reviewsApp(doc)} and add its theme app extension blocks (star rating on product cards and product page, review widget) through the theme editor — no pasted snippets. Configure review request timing after delivery, languages, moderation, verified-buyer badges and structured data (avoid duplicate Product schema with the theme).${doc.marketing?.reviews?.ugc ? ' Configure UGC collection with explicit rights consent.' : ''}${isMigration(doc) && (doc.migration?.data ?? []).includes('reviews') ? ' Historical reviews are imported in the migration epic.' : ''}${doc.marketing?.esp?.platform ? ` Connect review events to ${doc.marketing.esp.platform}.` : ''}`,
  },
];
