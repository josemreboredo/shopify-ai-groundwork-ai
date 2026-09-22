/**
 * "Technically yes, organisationally no": the recommendation tested against the
 * team, the support model and the money the client said they had.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { feasibilityFindings, organisationalProfile } from '../../engine/feasibility.js';
import { challengeApproach } from '../../engine/challenge.js';
import { toApproachPayload } from '../../engine/approach.js';

const fixture = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'fixtures', 'engagements', 'acme-watches.json'), 'utf8'));

/** A client that expects to run the store themselves, with a small team. */
const lean = (over = {}) => ({
  shopify: { staff_users: 2 },
  delivery: { support_model: 'self_sufficient', grow_retainer: { signed: false }, training: [], sops_required: false },
  business: {},
  markets: { list: [{ code: 'CH' }] },
  ...over,
});
const withCustom = { capability_map: [{ requirement: 'Configurator', resolution: 'custom', gaia_tier: 'T3' }, { requirement: 'ERP sync', resolution: 'custom', gaia_tier: 'T3' }] };

describe('organisational feasibility', () => {
  test('the profile reads the answers the client already gave, and says which', () => {
    const p = organisationalProfile(fixture);
    assert.equal(p.support_model, 'retainer');
    assert.equal(p.retainer_signed, true);
    assert.equal(p.training_requested, true);
    assert.deepEqual(p.app_budget_monthly, { amount: 500, currency: 'EUR' });
    assert.ok(p.from.some((f) => f.startsWith('Q10.3.3')));
  });

  test('a well-resourced client is not lectured: no findings on the reference engagement', () => {
    assert.deepEqual(feasibilityFindings(toApproachPayload(fixture.approach), fixture), []);
  });

  test('custom work handed to a team with nobody contracted to change it', () => {
    const found = feasibilityFindings(withCustom, lean());
    const hit = found.find((f) => f.id === 'custom-without-support');
    assert.ok(hit, found.map((f) => f.id).join(','));
    assert.equal(hit.severity, 'high');
    assert.match(hit.why_it_matters, /freezes at go-live/);
    assert.match(hit.evidence, /Q10\.3\.3/);
  });

  test('a two-store estate against a two-person team', () => {
    const doc = lean({ markets: { list: [{ code: 'CH' }, { code: 'DE' }], topology: { recommendation: 'expansion_stores', confidence: 'high' } } });
    const hit = feasibilityFindings({ capability_map: [] }, doc).find((f) => f.id === 'multi-store-vs-team');
    assert.ok(hit);
    assert.match(hit.finding, /2 admin users/);
    assert.match(hit.why_it_matters, /Nothing is synced between Shopify stores/);
  });

  test('an app shortlist above the ceiling the client named — in the same currency only', () => {
    const doc = lean({
      business: { app_cost_ceiling_monthly: { amount: 100, currency: 'EUR' } },
      approach: { app_shortlist: [{ name: 'Loop', recommended: true, cost: { amount: 155, currency: 'EUR', period: 'month' } }] },
    });
    const hit = feasibilityFindings({ capability_map: [] }, doc).find((f) => f.id.startsWith('app-budget'));
    assert.ok(hit);
    assert.match(hit.finding, /155 EUR a month against a stated ceiling of 100/);

    const mixed = lean({
      business: { app_cost_ceiling_monthly: { amount: 100, currency: 'EUR' } },
      approach: { app_shortlist: [{ name: 'Loop', recommended: true, cost: { amount: 155, currency: 'USD', period: 'month' } }] },
    });
    assert.deepEqual(feasibilityFindings({ capability_map: [] }, mixed).filter((f) => f.id.startsWith('app-budget')), [],
      'no comparison across currencies without a sourced rate');
  });

  test('work that lands on the client’s team with no training asked for', () => {
    const doc = lean();
    const payload = { capability_map: [1, 2, 3].map((n) => ({ requirement: `Thing ${n}`, resolution: 'app', gaia_tier: 'T2' })) };
    assert.ok(feasibilityFindings(payload, doc).some((f) => f.id === 'no-training-for-new-work'));
    const trained = lean({ delivery: { ...lean().delivery, training: ['orders'] } });
    assert.ok(!feasibilityFindings(payload, trained).some((f) => f.id === 'no-training-for-new-work'));
  });

  test('nobody watching the platform, on a solution that depends on it moving', () => {
    const doc = lean({ delivery: { ...lean().delivery, platform_watch: false } });
    assert.ok(feasibilityFindings(withCustom, doc).some((f) => f.id === 'no-platform-watch'));
  });

  test('it rides with the adversarial pass rather than as a separate report', () => {
    const doc = lean({ exits: { items: [] } });
    const found = challengeApproach(withCustom, doc);
    assert.ok(found.some((f) => f.id === 'custom-without-support'), 'the sixth attack');
  });
});
