/**
 * The app has one engine, and every page has to be reading it.
 *
 * Reported from a live engagement: the summary said "Within the standard
 * offers" and, two lines below, "the requirements are outside the standard
 * offers". Both lines were honest. One was built from the interview preview and
 * the other from the decided engagement, and the two disagreed about whether
 * the same answers were a GO.
 *
 * The cause was four steps in `decide` against two in `preview`. The preview
 * skipped the topology, which the engine derives and the questionnaire never
 * asks — so exit rule 11.23, which reads the derived topology's confidence,
 * fired for one and not the other. 11.23 is one of the five delivery risks rule
 * 11.3 counts before it routes an engagement to a Discovery Phase, so on a
 * multi-market engagement with unresolved topology the two paths reached
 * opposite verdicts.
 *
 * Both now call `weigh`. This is the test that keeps it that way: it does not
 * check that the functions look alike, it runs both on the same answers and
 * requires the same verdict, the same offer and the same fired rules.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { assemble, weigh } from '../../agents/discovery/engine.js';
import { preview } from '../../agents/interview/preview.js';

const TODAY = '2026-09-21';

/** The shape that broke it: several markets, several legal entities, nothing settled. */
const answers_ = {
  '/meta/client/name': 'Multi Market',
  '/meta/client/legal_entities': ['A GmbH', 'B AG'],
  '/markets/list': ['DE', 'AT', 'CH', 'NL', 'FR'].map((code) => ({ code, currency: 'EUR', price_strategy: 'base_currency', languages: ['de'] })),
  '/migration/source_platform': 'magento',
  '/migration/seo_equity': 'significant',
  '/migration/historical_orders_required': true,
  '/catalogue/sku_count': 60000,
  '/catalogue/variant_options_max': 3,
  '/design/figma/completeness': 'all_templates',
};

/** The session shape the interview actually keeps: answers nested, not a pointer map. */
function session() {
  const answers = { meta: { client: { slug: 'multi-market' } } };
  for (const [pointer, value] of Object.entries(answers_)) {
    const keys = pointer.replace(/^\//, '').split('/');
    let node = answers;
    for (const key of keys.slice(0, -1)) node = (node[key] ??= {});
    node[keys.at(-1)] = value;
  }
  return {
    client: 'multi-market', language: 'en', mode: 'standard', process: 'rfp',
    answers, provenance: {}, tbc: {}, skipped: {}, commented: {}, notes: [],
    started_at: TODAY, updated_at: TODAY,
  };
}

/** What the engine itself says, from the very same answers. */
const engineSays = () => weigh(assemble(session().answers, { today: TODAY, clientSlug: 'multi-market', source: 'chatbot' }));

describe('the preview and the engine are the same engine', () => {
  test('they agree on GO or STOP', () => {
    const engine = engineSays();
    const p = preview(session(), TODAY);
    assert.equal(p.go, engine.delivery.go,
      'the interview preview and the decided engagement disagree about the same answers');
  });

  test('they agree on the offer', () => {
    assert.equal(preview(session(), TODAY).offer.code, engineSays().offer.code);
  });

  test('and on every rule that fired, which is where they came apart', () => {
    const engine = engineSays().exits.items.map((i) => i.rule_id).sort();
    const shown = preview(session(), TODAY).exit_rules.map((r) => r.rule).sort();
    assert.deepEqual(shown, engine, 'a rule the engine fires and the preview does not is a page telling a consultant the wrong thing');
  });

  test('the derived topology reaches the preview, because a rule reads it', () => {
    // The specific omission. It is derived, never answered, so a path that does
    // not derive it cannot see the rule that reads it.
    const engine = engineSays();
    assert.ok(engine.markets.topology, 'the fixture has to produce a topology at all');
    assert.ok(preview(session(), TODAY).exit_rules.some((r) => r.rule === '11.23'),
      'the preview does not see the rule that reads the derived topology');
  });
});
