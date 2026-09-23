/**
 * The questions are all the build needs.
 *
 * The backlog, the engine and the workbook read answer fields the question bank
 * never asked: a story waited on `/promotions/campaigns/market_specific` that no
 * question filled, so the market-specific acceptance criterion could never
 * appear, and three more read free-text fields beside the ones a question did
 * fill. A field read and never asked is a branch that cannot run; this finds
 * them by reading the code the way the engine reads a document.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { questionBank } from '../../schema/index.js';

const ROOT = path.join(import.meta.dirname, '..', '..');
const SOURCES = ['engine', 'backlog', 'workbook'].flatMap((dir) => {
  const out = [];
  const walk = (p) => {
    for (const e of fs.readdirSync(p, { withFileTypes: true })) {
      const full = path.join(p, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith('.js')) out.push(full);
    }
  };
  walk(path.join(ROOT, dir));
  return out;
});

/* Fields the engine derives or writes itself, and the document's own metadata:
   no question should ever fill them. Each root is named so a new one has to be
   argued for here rather than slipping through. */
const DERIVED = [
  'approach',                   // drafted from the answers (approach.json)
  'offer', 'exits', 'open_items', 'notes', 'provenance',
  'markets.topology',           // derived by engine/topology.js from the market answers
  'delivery.go', 'delivery.route',
  'b2b.enabled',                // derived by engine.js from the business model (Q1.1.4) when not set
  'meta.created_at', 'meta.updated_at', 'meta.language', 'meta.source', 'meta.client.slug',
  'schema_version',
];

/** Every `doc.a.b.c` path a source file reads, with helper words stripped. */
function readsIn(text) {
  const out = new Set();
  const NOT_FIELDS = new Set(['length', 'list', 'some', 'map', 'filter', 'find', 'includes', 'every', 'forEach', 'reduce', 'flatMap', 'join', 'trim']);
  for (const m of text.matchAll(/\bdoc\??\.((?:[a-z0-9_]+\??\.?)+)/g)) {
    const parts = m[1].replace(/\?/g, '').replace(/\.$/, '').split('.').filter((s) => s && !NOT_FIELDS.has(s));
    if (parts.length) out.add(parts.join('.'));
  }
  return out;
}

describe('the questions are all the build needs', () => {
  const asked = new Set(questionBank.questions.flatMap((q) => q.maps_to).map((p) => p.replace(/^\//, '').split('/').filter((s) => s !== '*' && !/^\d+$/.test(s)).join('.')));
  const covered = (p) => [...asked].some((a) => a === p || a.startsWith(`${p}.`) || p.startsWith(`${a}.`));
  const derived = (p) => DERIVED.some((d) => p === d || p.startsWith(`${d}.`));

  test('every answer field the engine, the backlog or the workbook reads is asked by a question', () => {
    const orphans = [];
    for (const file of SOURCES) {
      for (const p of readsIn(fs.readFileSync(file, 'utf8'))) {
        if (!covered(p) && !derived(p)) orphans.push(`${p} ← ${path.relative(ROOT, file)}`);
      }
    }
    assert.deepEqual([...new Set(orphans)].sort(), [], 'read by the build and asked by no question — ask it, or stop reading it');
  });

  test('the fields that were read and never asked are asked now', () => {
    for (const p of ['/promotions/campaigns/market_specific', '/marketing/esp/segments_master', '/markets/cross_border_model', '/delivery/admin_roles']) {
      assert.ok(questionBank.questions.some((q) => q.maps_to.includes(p)), `${p} has a question`);
    }
  });
});
