/**
 * Regression tests for the story-generation pipeline (Phase 0 crash fixes).
 */
import { test } from 'node:test';
import assert   from 'node:assert/strict';
import fs       from 'node:fs';
import os       from 'node:os';
import path     from 'node:path';
import { execFileSync } from 'node:child_process';

import { parseSpec, parseYaml }       from '../../scripts/generate-stories/parseSpec.js';
import { selectStories, ALL_STORIES } from '../../scripts/generate-stories/storyRegistry.js';

const ROOT    = path.resolve(import.meta.dirname, '..', '..');
const fixture = (name) => fs.readFileSync(path.join(ROOT, 'tests/fixtures', name), 'utf8');

test('full fixture selects every story in the registry', () => {
  const { spec, errors } = parseSpec(fixture('store-spec-full.yaml'));
  assert.deepEqual(errors, []);
  const selected = selectStories(spec).map((s) => s.slug);
  const missing  = ALL_STORIES.map((s) => s.slug).filter((slug) => !selected.includes(slug));
  assert.deepEqual(missing, []);
});

test('minimal fixture selects the 11 baseline stories', () => {
  const { spec } = parseSpec(fixture('store-spec-minimal.yaml'));
  assert.equal(selectStories(spec).length, 11);
});

test('market_list objects survive normalisation', () => {
  const { spec, warnings } = parseSpec(fixture('store-spec-full.yaml'));
  assert.equal(spec.markets.marketList.length, 3);
  assert.equal(spec.markets.marketList[0].code, 'DE');
  assert.ok(!warnings.some((w) => w.includes('no market_list entries')));
});

test('parses PyYAML-style unindented lists and quoted items containing ":"', () => {
  const yaml = [
    'exits:',
    '  triggered: true',
    '  reasons:',
    "  - 'EXIT: More than 5 markets'",
    '  - "EXIT: Custom checkout"',
    'markets:',
    '  market_list:',
    '  - code: CH',
    '    currency: CHF',
    '  count: 1',
  ].join('\n');
  const { data } = parseYaml(yaml);
  assert.deepEqual(data.exits.reasons, ['EXIT: More than 5 markets', 'EXIT: Custom checkout']);
  assert.deepEqual(data.markets.market_list, [{ code: 'CH', currency: 'CHF' }]);
  assert.equal(data.markets.count, 1);
});

test('generate-stories CLI runs end to end', () => {
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'stories-')), 'stories.json');
  execFileSync(process.execPath, [
    path.join(ROOT, 'scripts/generate-stories.js'),
    '--spec', path.join(ROOT, 'tests/fixtures/store-spec-minimal.yaml'),
    '--output', out, '--format', 'json',
  ], { stdio: 'pipe' });
  assert.ok(fs.statSync(out).size > 0);
});
