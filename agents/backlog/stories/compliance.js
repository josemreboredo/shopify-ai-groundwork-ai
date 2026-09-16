/**
 * @file compliance.js — epic "Privacy & compliance" (LWC-CMP-*)
 *
 * Not legal advice: stories deliver configuration and content that the
 * client's legal counsel approves.
 */

import { markets, listOr, list, exitFired, hasEuMarket, languages } from './helpers.js';

const regimeNames = { gdpr: 'EU GDPR', uk_gdpr: 'UK GDPR', ccpa: 'CCPA/CPRA', nfadp: 'Swiss nFADP', other: 'other regimes listed by legal' };
const regimes = (doc) => {
  const listed = doc.compliance?.privacy_regimes ?? [];
  const inferred = [];
  if (hasEuMarket(doc)) inferred.push('gdpr');
  if (markets(doc).some((m) => m.code === 'CH')) inferred.push('nfadp');
  if (markets(doc).some((m) => m.code === 'GB')) inferred.push('uk_gdpr');
  if (markets(doc).some((m) => m.code === 'US')) inferred.push('ccpa');
  return [...new Set([...listed, ...inferred])];
};
const regimeText = (doc) => listOr(regimes(doc).map((r) => regimeNames[r] ?? r), 'the applicable privacy laws');
const imprintCountries = (doc) => markets(doc).map((m) => m.code).filter((c) => ['DE', 'AT', 'CH'].includes(c));

/** @type {import('../model.js').StoryDefinition[]} */
export default [
  {
    key: 'LWC-CMP-001',
    epic: 'compliance',
    title: (doc) => `Set up cookie consent for ${regimeText(doc)}`,
    user_story: 'As a visitor, I want to choose which cookies and tracking I allow, so that my privacy choices are respected.',
    acceptance_criteria: (doc) => [
      ...regimes(doc).map((r) => `Given a visitor in a region covered by ${regimeNames[r] ?? r}, when they first open the storefront, then the consent banner offers accept, reject and preferences with equal prominence as legal requires and nothing non-essential loads before a choice`),
      `Given the consent tool ${doc.compliance?.cookie_consent_tool ?? 'Shopify privacy banner'}, when a visitor changes their choice, then the Shopify Customer Privacy API reflects it and web pixels and app embeds follow it immediately`,
      'Given the cookie policy, when the consent tool scans the store, then every cookie is categorised and listed in every storefront language',
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'agent',
    depends_on: ['LWC-THM-001'],
    spec_refs: ['/compliance/privacy_regimes', '/compliance/cookie_consent_tool', '/markets/list'],
    security_flags: ['pii'],
    applies: () => true,
    agent_prompt: (doc) => {
      const tool = doc.compliance?.cookie_consent_tool;
      const native = !tool || /shopify/i.test(tool);
      return `Regimes to cover: ${regimeText(doc)} (includes regimes inferred from the markets ${listOr(markets(doc).map((m) => m.code), 'at launch')} — confirm the list with legal; Switzerland is covered by nFADP and must not be skipped). ${native
        ? 'Use Shopify\'s built-in cookie banner (Settings > Customer privacy): enable it for the regions in scope, set banner text and translations and link the privacy policy.'
        : `Install ${tool} from the Shopify App Store as an app embed, configure regions and categories, and confirm it writes consent to the Shopify Customer Privacy API (setTrackingConsent) so Shopify web pixels respect it — do not use a script that bypasses the API.`} ${regimes(doc).includes('ccpa') ? 'Add the "Your privacy choices" / do-not-sell-or-share link for US visitors. ' : ''}Translate banner texts into ${listOr(languages(doc), 'every storefront language')}. Test in a clean browser per region: nothing non-essential loads before consent.`;
    },
  },
  {
    key: 'LWC-CMP-002',
    epic: 'compliance',
    title: (doc) => `${doc.compliance?.legal_pages_status === 'needs_drafting' ? 'Draft and publish' : 'Update and publish'} legal pages for ${listOr(markets(doc).map((m) => m.code), 'every market')}`,
    user_story: 'As the business, I want complete, legally approved policy pages for every market, so that we can trade lawfully and shoppers trust us.',
    acceptance_criteria: (doc) => [
      'Given Settings > Policies, when legal content is published, then refund, privacy, terms of service, shipping and contact information policies are complete and linked in checkout and footer',
      ...(imprintCountries(doc).length ? [`Given the ${list(imprintCountries(doc))} market${imprintCountries(doc).length > 1 ? 's' : ''}, when a visitor looks for the provider details, then a legal notice (Impressum) with company name, address, register and VAT number is one click from every page`] : []),
      ...(hasEuMarket(doc) ? ['Given EU consumers, when they read the refund policy, then the 14-day right of withdrawal and a model withdrawal form are included'] : []),
      `Given every storefront language (${listOr(languages(doc), 'default')}), when a policy is viewed, then it is available in that language and the client's legal counsel has approved the wording in writing`,
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'client',
    depends_on: ['LWC-THM-002'],
    spec_refs: ['/compliance/legal_pages_status', '/markets/list', '/meta/client/legal_name', '/shipping/returns/policy'],
    applies: (doc) => doc.compliance?.legal_pages_status !== 'ready',
    agent_prompt: (doc) => `Legal pages status: ${doc.compliance?.legal_pages_status ?? 'unknown'}. Prepare a checklist and structure (not legal advice) for the client's counsel: refund policy (returns: ${doc.shipping?.returns?.policy ?? 'to confirm'}), privacy policy covering ${regimeText(doc)} and every app and pixel that processes personal data, terms of service, shipping policy, contact information${imprintCountries(doc).length ? `, legal notice/Impressum for ${list(imprintCountries(doc))}` : ''}${hasEuMarket(doc) ? ', EU withdrawal rights and model withdrawal form' : ''}. Use Shopify's policy templates only as a starting point. Publish approved texts in Settings > Policies, translate them, and link them in the footer and checkout.`,
  },
  {
    key: 'LWC-CMP-003',
    epic: 'compliance',
    title: 'Set up the data-subject request process for export and deletion',
    user_story: 'As a customer, I want to get or erase my personal data on request, so that my privacy rights are honoured.',
    acceptance_criteria: (doc) => [
      'Given a verified data access request, when staff process it, then Shopify\'s customer data request is sent and connected apps and systems are included within the legal deadline',
      'Given a verified erasure request, when staff process it, then the customer is erased in Shopify (customers/redact propagates to apps) and in every external system holding their data, with orders retained only as tax law requires',
      ...(exitFired(doc, '11.10') ? ['Given exit rule 11.10, when the process is documented, then legal has signed off data-subject request handling before launch'] : []),
      `Given the request log, when it is audited, then each request shows identity check, systems covered (${listOr((doc.integrations ?? []).map((i) => i.system), 'Shopify and apps')}) and completion date without storing the exported data`,
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'consultant',
    depends_on: ['LWC-CMP-002'],
    spec_refs: ['/compliance/gdpr_deletion_workflow', '/compliance/privacy_regimes', '/integrations/*/system'],
    security_flags: ['pii'],
    applies: (doc) => doc.compliance?.gdpr_deletion_workflow === true,
    agent_prompt: (doc) => `Map where customer personal data lives: Shopify, installed apps and integrations (${listOr((doc.integrations ?? []).map((i) => i.system), 'none listed')}). Write the SOP: request intake, identity verification, Shopify admin "Request customer data" and "Erase personal data" actions, per-system steps for apps and integrations that do not handle the privacy compliance webhooks, deadlines per ${regimeText(doc)}, and the log. Custom apps must implement customers/data_request, customers/redact and shop/redact webhooks. Get legal sign-off (exit 11.10) before launch. Never copy personal data into tickets or prompts.`,
  },
  {
    key: 'LWC-CMP-004',
    epic: 'compliance',
    title: 'Capture marketing consent correctly at every sign-up point',
    user_story: 'As a subscriber, I want to opt in to marketing explicitly and unsubscribe easily, so that I only receive messages I agreed to.',
    acceptance_criteria: (doc) => [
      'Given checkout, account and newsletter sign-up forms, when they render, then marketing consent is an unticked opt-in with clear wording and a privacy policy link',
      `Given a new subscriber, when they opt in, then double opt-in confirmation is ${hasEuMarket(doc) || markets(doc).some((m) => m.code === 'CH') ? 'required' : 'configured as legal decides'} before marketing emails are sent`,
      `Given a consent change in Shopify${doc.marketing?.esp?.platform ? ` or ${doc.marketing.esp.platform}` : ''}, when it syncs, then both systems show the same state and consent date within minutes`,
    ],
    gaia_tier: 'T2',
    points: 2,
    owner: 'agent',
    depends_on: ['LWC-CMP-001'],
    spec_refs: ['/compliance/marketing_opt_in', '/marketing/esp/platform', '/markets/list'],
    security_flags: ['pii'],
    applies: (doc) => doc.compliance?.marketing_opt_in === true,
    agent_prompt: (doc) => `Configure marketing consent: enable double opt-in for email marketing in the Shopify admin${doc.marketing?.esp?.platform ? ` and in ${doc.marketing.esp.platform} lists` : ''}, make checkout and account opt-ins unticked by default, add consent text reviewed by legal to newsletter forms in the theme, and verify consent sync both ways. SMS consent only if SMS marketing is in scope.`,
  },
  {
    key: 'LWC-CMP-005',
    epic: 'compliance',
    title: (doc) => `Meet industry requirements: ${listOr(doc.compliance?.industry_requirements, doc.compliance?.regulated_industry?.category ?? 'regulated industry controls')}`,
    user_story: 'As the business, I want industry-specific legal requirements built into the store, so that we can sell without regulatory risk.',
    acceptance_criteria: (doc) => [
      ...(doc.compliance?.industry_requirements ?? []).map((r) => `Given the requirement "${r}", when legal reviews the storefront, then the required information or control is present on every affected product and page`),
      ...(doc.compliance?.regulated_industry?.active ? [`Given the regulated category ${doc.compliance.regulated_industry.category ?? 'in scope'}, when a shopper buys a restricted product, then the agreed verification (for example age check) runs before checkout completes`] : []),
      'Given the requirement list, when the store launches, then legal counsel has signed off each item in writing',
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'consultant',
    depends_on: ['LWC-CMP-002'],
    spec_refs: ['/compliance/industry_requirements', '/compliance/regulated_industry'],
    applies: (doc) => (doc.compliance?.industry_requirements?.length ?? 0) > 0 || doc.compliance?.regulated_industry?.active === true,
    agent_prompt: (doc) => `Requirements: ${listOr(doc.compliance?.industry_requirements, 'none listed')}${doc.compliance?.regulated_industry?.active ? `; regulated category ${doc.compliance.regulated_industry.category ?? 'to confirm'} (exit rule 11.8 requires a legal/compliance review before any build)` : ''}. For each, identify the Shopify mechanism (product metafields shown via dynamic sources, delivery profile restrictions, checkout validation, an age-verification app) and propose it for legal and consultant approval. Do not implement anything a lawyer has not approved.`,
  },
];
