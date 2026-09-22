/**
 * The offering pages sell a fixed price, and this is the list they sell it
 * from. Everything here guards one thing: that the list is the backlog the
 * engine actually generates, and that it reads as a scope statement with no
 * engagement in front of it.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { scopeCatalogue, scopeTotals, storyLabel } from '../../shared/scope-view.js';
import { EPICS } from '../../backlog/model.js';
import { STORY_DEFINITIONS } from '../../backlog/stories/index.js';
import { offering } from '../../schema/index.js';

describe('what an offer builds, epic by epic', () => {
  const catalogue = scopeCatalogue();

  test('every epic is there, in the backlog’s own order', () => {
    assert.deepEqual(catalogue.map((e) => e.id), EPICS.map((e) => e.id));
    for (const e of catalogue) assert.ok(e.name && e.summary, `${e.id}: named and summarised`);
  });

  test('every story lands in exactly one place, and nothing is lost on the way', () => {
    const seen = new Set();
    for (const epic of catalogue) {
      for (const s of [...epic.always, ...epic.conditional, ...epic.gated.flatMap((g) => g.stories)]) {
        assert.ok(!seen.has(s.key), `${s.key} appears twice`);
        seen.add(s.key);
      }
    }
    assert.equal(seen.size, STORY_DEFINITIONS.length);
    const totals = scopeTotals(catalogue);
    assert.equal(totals.always + totals.conditional + totals.gated, STORY_DEFINITIONS.length);
    assert.equal(totals.epics, EPICS.length);
  });

  /*
   * The catalogue is read with no answers at all, so a title written for an
   * engagement ("Configure Shopify Markets for DE, AT and CH") comes out as
   * "Configure Shopify Markets for ". Those stories carry a `scope` label, and
   * this is what says which ones need one.
   */
  test('every label reads as scope with no engagement in front of it', () => {
    for (const story of STORY_DEFINITIONS) {
      const label = storyLabel(story);
      assert.ok(label?.trim(), `${story.key}: empty label`);
      assert.doesNotMatch(label, /\s$|\s{2}|,\s*$|:\s*$/, `${story.key}: unfinished label — "${label}"`);
      assert.doesNotMatch(label, /undefined|\bNaN\b|to confirm|\b0 /, `${story.key}: needs a scope label — "${label}"`);
    }
  });

  /*
   * The offers do not assume Shopify Plus — the plan gate exists to earn it —
   * and the first story in the backlog opened "Set up the Shopify Plus
   * development store" on every engagement, including the ones quoted on Basic.
   */
  test('no label sells a plan the engagement has not earned', () => {
    for (const story of STORY_DEFINITIONS) {
      assert.doesNotMatch(storyLabel(story), /\bPlus\b/, `${story.key}: assumes a plan`);
    }
  });

  test('a gated story names a gate the offering prices, with its condition', () => {
    const priced = new Set(offering.scope_gates.map((g) => g.id));
    for (const epic of catalogue) {
      for (const g of epic.gated) {
        assert.ok(priced.has(g.id), `${epic.id}: ${g.id} is not a scope gate`);
        assert.ok(g.label && g.condition, `${g.id}: a consultant needs the condition, not the id`);
        assert.ok(g.stories.length, `${g.id}: listed with no stories`);
      }
    }
  });

  /*
   * "Included when your answers call for it" is only honest if the page can say
   * which answer. A conditional story with no question behind it is scope
   * nobody can ask the client about.
   */
  test('a conditional story names the questions that switch it on', () => {
    const orphans = catalogue
      .flatMap((e) => e.conditional.map((s) => ({ epic: e.id, ...s })))
      .filter((s) => s.decided_by.length === 0)
      .map((s) => s.key);
    assert.deepEqual(orphans, []);
  });
});
