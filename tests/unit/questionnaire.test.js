/**
 * Regression tests for questionnaire CLI argument handling.
 */
import { test } from 'node:test';
import assert   from 'node:assert/strict';
import path     from 'node:path';

import { resolveOutputPath } from '../../scripts/questionnaire/questionnaire.js';

const DEFAULT = path.join(process.cwd(), 'store-spec.yaml');

test('defaults when --output is absent (never argv[0])', () => {
  assert.equal(resolveOutputPath([]), DEFAULT);
});

test('defaults when --output has no value', () => {
  assert.equal(resolveOutputPath(['--output']), DEFAULT);
  assert.equal(resolveOutputPath(['--output', '--other']), DEFAULT);
});

test('accepts "--output path" and "--output=path" (keeps "=" in the path)', () => {
  assert.equal(resolveOutputPath(['--output', 'out/spec.yaml']), 'out/spec.yaml');
  assert.equal(resolveOutputPath(['--output=a=b.yaml']), 'a=b.yaml');
});
