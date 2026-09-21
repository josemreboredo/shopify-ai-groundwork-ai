/**
 * Backlog (Phase 4): story definitions are well-formed, selection follows the
 * engagement, and the Jira CSV is importable.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs   from 'node:fs';
import os   from 'node:os';
import path from 'node:path';

import { offering, schemaNodeAt } from '../../schema/index.js';
import { EPICS, EPIC_IDS, POINTS, GAIA_TIERS, OWNERS, SECURITY_FLAGS, PRIORITIES } from '../../agents/backlog/model.js';
import { STORY_DEFINITIONS } from '../../agents/backlog/stories/index.js';
import { selectStories, summariseByEpic } from '../../agents/backlog/select.js';
import { toJiraCsv, toMarkdown } from '../../agents/backlog/export.js';
import { buildBacklog } from '../../agents/backlog/cli.js';
import { classifyOffer } from '../../agents/discovery/classify.js';
import { evaluateExits } from '../../agents/discovery/exits.js';

const FIXTURES = path.join(import.meta.dirname, '..', 'fixtures', 'engagements');
const load = (name) => JSON.parse(fs.readFileSync(path.join(FIXTURES, name), 'utf8'));
const GO_FIXTURES = ['acme-watches.json', 'foundation-minimal.json'].map(load);

/**
 * Synthetic engagement with every feature switched on, so each story guard can
 * be proven to fire at least once. Extend it when a new guard needs a field.
 */
function maximalEngagement() {
  const doc = load('acme-watches.json');
  Object.assign(doc.catalogue, {
    product_types: ['simple', 'variant', 'bundle', 'product_set', 'gift_card', 'digital', 'subscription', 'pre_order', 'made_to_order', 'virtual'],
    subscription_app: 'Shopify Subscriptions',
  });
  doc.markets.strategy = 'hybrid';
  doc.markets.geo_redirect = 'automatic_redirect';
  doc.markets.us_sales_tax = true;
  doc.markets.rtl_required = true;
  Object.assign(doc.checkout, { gift_cards: true, store_credit: true, post_purchase_upsell: true, order_restrictions: ['quantity_limits'] });
  doc.post_purchase = {
    orders_per_month: 3000,
    cancellations: { self_service: true, window: 'until_fulfilled', partial: true, order_editing: true },
    refunds: { methods: ['original_payment', 'store_credit'], trigger: 'on_carrier_scan', shipping_refunded: 'on_fault_only', restocking_fee: true, partial: true, approval_required: true, finance_sync: true },
    tracking: { branded_tracking_page: true, proactive_channels: ['email', 'whatsapp'], delivery_estimates: true },
    warranty_claims: true,
    platform_preference: 'parcelLab',
  };
  doc.catalogue.inventory = { ...doc.catalogue.inventory, out_of_stock_behaviour: ['back_in_stock_alert', 'pre_order'], low_stock_alerts: true };
  doc.shipping = { ...doc.shipping, model: 'hybrid', provider_3pl: 'ShipBob', fulfilment_locations: 3, routing_rules: ['closest_location', 'custom_rule_function'], rates: ['flat', 'free_above_threshold', 'carrier_calculated'], special_rules: ['Hazardous goods'], returns: { ...doc.shipping.returns, window_days: 30, return_rate_pct: 12, label: 'qr_drop_off', shipping_paid_by: 'merchant', exchange_types: ['any_product', 'store_credit_first'], international_returns: true, inspection_required: true, reason_tracking: true, b2b_returns_online: true } };
  doc.b2b = { ...doc.b2b, volume_discounts: true, payment_terms: ['net_terms'] };
  doc.loyalty = { components: ['points_purchase', 'vip_tiers', 'referral', 'vip_early_access', 'store_credit'], phase: 'launch', app: 'Smile.io', esp_sync: true };
  doc.promotions = { ...doc.promotions, discount_types: ['percentage', 'fixed_amount', 'bogo', 'free_shipping', 'volume_tiered', 'automatic', 'code_based', 'scheduled_sale', 'stackable', 'pos_only'], stacking: 'custom_logic_function', gift_cards: { as_product: true, as_reward: true, format: 'both', expiry: false }, campaigns: { esp_triggered: true, landing_pages: true, countdown_timer: true, market_specific: true } };
  doc.marketing.analytics = { ...doc.marketing.analytics, server_side: true, custom_events: ['size_guide_open'] };
  doc.marketing.affiliate = { platform: 'UpPromote', shopify_collabs: true, tracking: 'both' };
  doc.marketing.reviews = { app: 'Judge.me', ugc: true };
  doc.integrations = [
    ...doc.integrations,
    { system: 'Akeneo', category: 'pim', direction: 'inbound', objects: ['products', 'content'], frequency: 'batch', connector: 'custom', status: 'to_build' },
    { system: 'Salesforce', category: 'crm', direction: 'outbound', objects: ['customers', 'orders'], frequency: 'realtime', connector: 'ipaas', status: 'to_build' },
    { system: 'ShipBob', category: '3pl_wms', direction: 'bidirectional', objects: ['orders', 'inventory'], frequency: 'webhook', connector: 'native_app', status: 'to_build' },
  ];
  doc.migration.data = ['products', 'customers', 'orders', 'content', 'redirects', 'reviews', 'gift_cards'];
  // Not headless: that is exit rule 11.26 now, and a STOP has no backlog to
  // build. Every offer is the same Liquid build, one size apart.
  // Retail and a fourth language: both gates priced work the backlog delivered
  // nothing for, and the coverage test could not see it because no fixture ever
  // switched them on.
  doc.retail = { store_count: 4, pos: 'shopify_pos', countries: ['CH', 'DE'],
    omnichannel: ['buy_online_pickup_in_store', 'ship_to_customer_from_store', 'in_store_returns_exchanges_of_online_orders', 'endless_aisle_order_in_store', 'store_credit_gift_cards_in_store', 'stock_transfers_counts', 'retail_prices_or_catalogs', 'staff_roles_permissions'] };
  doc.markets.list = doc.markets.list.map((m, i) => (i === 0 ? { ...m, languages: [...new Set([...(m.languages ?? []), 'en'])] } : m));
  // Agentic commerce: thirteen questions in the bank and, until the AI epic,
  // nothing delivering any of them.
  doc.ai = { sell_through_agents: true, agentic_enrolment: 'per_channel', direct_checkout: 'selected_channels',
    us_buyers: true, customer_data_sharing: 'approved', catalog_readiness: 'partial', catalog_mapping_needed: true,
    crawler_policy: 'selective', knowledge_base: true, own_agent_surface: 'later',
    merchant_ai_tools: ['sidekick', 'shopify_magic', 'semantic_search'], terms_owner: 'Head of Ecommerce' };
  doc.design = { ...doc.design, motion: true, custom_design: true };
  doc.compliance = { ...doc.compliance, legal_pages_status: 'needs_drafting', sensitive_data: false, industry_requirements: ['EU General Product Safety Regulation product safety information'] };
  doc.delivery = { ...doc.delivery, support_model: 'hypercare_only', sops_required: true, phased_launch: true };
  doc.offer = classifyOffer(doc);
  doc.exits = evaluateExits(doc);
  return doc;
}

/**
 * The same design ambition on the Liquid track.
 *
 * maximalEngagement() switches everything on, which since the effort ceiling
 * landed makes it an L on Hydrogen — so the theme stories, which all guard on
 * isLiquidTrack(), could no longer fire from it. A bespoke design, motion and a
 * right-to-left language are not the preserve of large engagements: a small
 * store with one market buys exactly that. So they are proven on a small Liquid
 * engagement, which is where they are actually built.
 */
function maximalLiquidEngagement() {
  const doc = load('foundation-minimal.json');
  doc.design = { ...doc.design, motion: true, custom_design: true, figma: { ...doc.design?.figma, exists: true, completeness: 'all_templates', mapped_to_sections: true } };
  doc.markets = { ...doc.markets, rtl_required: true };
  doc.offer = classifyOffer(doc);
  doc.exits = evaluateExits(doc);
  assert.notEqual(doc.offer.delivery_track, 'hydrogen', 'the point of this fixture is the Liquid track');
  return doc;
}

describe('story definitions', () => {
  test('keys are unique, stable-format and match their epic prefix', () => {
    const keys = STORY_DEFINITIONS.map((d) => d.key);
    assert.equal(new Set(keys).size, keys.length, 'duplicate story key');
    for (const d of STORY_DEFINITIONS) {
      const epic = EPICS.find((e) => e.id === d.epic);
      assert.ok(epic, `${d.key}: unknown epic ${d.epic}`);
      assert.match(d.key, new RegExp(`^LWC-${epic.prefix}-\\d{3}$`), `${d.key}: key must be LWC-${epic.prefix}-NNN`);
    }
  });

  test('static fields use allowed values and every reference resolves', () => {
    const keys = new Set(STORY_DEFINITIONS.map((d) => d.key));
    for (const d of STORY_DEFINITIONS) {
      assert.ok(POINTS.includes(d.points), `${d.key}: points ${d.points}`);
      assert.ok(GAIA_TIERS.includes(d.gaia_tier), `${d.key}: gaia_tier`);
      assert.ok(OWNERS.includes(d.owner), `${d.key}: owner`);
      assert.equal(typeof d.applies, 'function', `${d.key}: applies must be a function`);
      assert.ok(d.spec_refs?.length > 0, `${d.key}: spec_refs required`);
      for (const ref of d.spec_refs) assert.ok(schemaNodeAt(ref), `${d.key}: spec_ref ${ref} not in schema`);
      for (const dep of d.depends_on ?? []) assert.ok(keys.has(dep), `${d.key}: depends_on unknown ${dep}`);
      for (const f of d.security_flags ?? []) assert.ok(SECURITY_FLAGS.includes(f), `${d.key}: security flag ${f}`);
      for (const g of d.gates ?? []) assert.ok(offering.scope_gates.some((x) => x.id === g), `${d.key}: gate ${g}`);
      assert.ok(!(d.depends_on ?? []).includes(d.key), `${d.key}: depends on itself`);
    }
  });

  test('every story fires for at least one engagement and materialises cleanly', () => {
    const docs = [...GO_FIXTURES, maximalEngagement(), maximalLiquidEngagement()];
    const fired = new Set(docs.flatMap((doc) => selectStories(doc).map((s) => s.key)));
    const never = STORY_DEFINITIONS.map((d) => d.key).filter((k) => !fired.has(k));
    assert.deepEqual(never, [], 'stories whose guard never fires — extend maximalEngagement() or fix the guard');

    for (const doc of docs) {
      for (const s of selectStories(doc)) {
        for (const field of ['title', 'user_story', 'agent_prompt']) {
          assert.equal(typeof s[field], 'string', `${s.key}: ${field}`);
          assert.ok(s[field].trim().length > 0, `${s.key}: empty ${field}`);
          assert.doesNotMatch(s[field], /undefined|null|\[object Object\]|\$\{/, `${s.key}: ${field} has unresolved values`);
        }
        assert.ok(Array.isArray(s.acceptance_criteria) && s.acceptance_criteria.length >= 2, `${s.key}: needs 2+ acceptance criteria`);
        for (const c of s.acceptance_criteria) {
          assert.match(c, /^Given .+ when .+ then .+/i, `${s.key}: criterion not Given/When/Then: ${c}`);
          assert.doesNotMatch(c, /undefined|null|\$\{/, `${s.key}: unresolved criterion`);
        }
        assert.ok(PRIORITIES.includes(s.priority), `${s.key}: priority ${s.priority}`);
        assert.doesNotMatch(s.title, /Bucherer/i);
      }
    }
  });

  test('every active scope gate in the fixtures is delivered by at least one story', () => {
    for (const doc of [...GO_FIXTURES, maximalEngagement()]) {
      const labels = new Set(selectStories(doc).flatMap((s) => s.labels));
      for (const [id, g] of Object.entries(doc.offer.scope_gates)) {
        if (g.active) assert.ok(labels.has(`gate-${id.replace(/_/g, '-')}`), `${doc.meta.client.slug}: gate ${id} has no story`);
      }
    }
  });

  test('every epic has at least one story definition', () => {
    for (const id of EPIC_IDS) assert.ok(STORY_DEFINITIONS.some((d) => d.epic === id), `epic ${id} has no stories`);
  });
});

describe('selection and export', () => {
  test('dependencies only point at selected stories', () => {
    for (const doc of GO_FIXTURES) {
      const stories = selectStories(doc);
      const keys = new Set(stories.map((s) => s.key));
      for (const s of stories) for (const dep of s.depends_on) assert.ok(keys.has(dep));
    }
  });

  test('Jira CSV has one epic row per used epic, stories parented to it, and parses back', () => {
    const doc = load('acme-watches.json');
    const stories = selectStories(doc);
    const csv = toJiraCsv(stories, { clientName: doc.meta.client.name });
    const rows = parseCsv(csv);
    const header = rows[0];
    assert.deepEqual(header.slice(0, 8), ['Issue ID', 'Parent', 'Issue Type', 'Summary', 'Description', 'Priority', 'Story Points', 'Component']);
    const body = rows.slice(1);
    const epics = body.filter((r) => r[2] === 'Epic');
    const storyRows = body.filter((r) => r[2] === 'Story');
    assert.equal(epics.length, summariseByEpic(stories).length);
    assert.equal(storyRows.length, stories.length);
    const epicIds = new Set(epics.map((r) => r[0]));
    for (const r of storyRows) assert.ok(epicIds.has(r[1]), 'story parent must be an epic row');
    assert.ok(body.every((r) => r.length === header.length), 'every row has the header width');
    assert.ok(storyRows.every((r) => r.slice(8).includes('lwc') && r.slice(8).some((l) => l.startsWith('lwc-key-'))));
  });

  test('Markdown lists every story; buildBacklog writes three files and refuses STOP engagements', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'backlog-'));
    fs.writeFileSync(path.join(dir, 'engagement.json'), JSON.stringify(load('acme-watches.json')));
    const { stories, written } = buildBacklog({ clientDir: dir });
    assert.deepEqual(written.map((f) => path.basename(f)).sort(), ['backlog.csv', 'backlog.json', 'backlog.md']);
    const md = fs.readFileSync(path.join(dir, 'backlog.md'), 'utf8');
    for (const s of stories) assert.ok(md.includes(s.key));

    const stopDir = fs.mkdtempSync(path.join(os.tmpdir(), 'backlog-stop-'));
    fs.writeFileSync(path.join(stopDir, 'engagement.json'), JSON.stringify(load('stop-custom-checkout.json')));
    assert.throws(() => buildBacklog({ clientDir: stopDir }), /STOP/);
  });

  test('toMarkdown totals match the epic summary', () => {
    const doc = load('acme-watches.json');
    const stories = selectStories(doc);
    const summary = summariseByEpic(stories);
    assert.match(toMarkdown(stories, doc, summary), new RegExp(`${stories.length} stories · ${summary.reduce((n, r) => n + r.points, 0)} points`));
  });
});

/** Minimal RFC 4180 parser for assertions. @param {string} text */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\r' && text[i + 1] === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; }
    else field += c;
  }
  return rows;
}
