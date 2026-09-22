#!/usr/bin/env node
/**
 * @file cli.js
 * @description App Store registry (ai/schema/apps.json). Apps enter as `proposed`;
 * the lead consultant approves an app after the engagement work in which it
 * was used (owner decision 2026-09-17). No prices are stored.
 *
 *   npm run apps -- list [--status proposed|approved]
 *   npm run apps -- approve --handle <apps.shopify.com handle> --by "<role>" [--engagement <slug>] [--note "..."]
 */

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { DISCOVERY_ROOT } from '../paths.js';

const REGISTRY = path.join(DISCOVERY_ROOT, 'schema', 'apps.json');
const SLUG = /^[a-z0-9][a-z0-9-]{0,62}$/;

/**
 * Approve an app in a registry object (mutates and returns the entry).
 *
 * @param {{ apps: object[] }} registry
 * @param {{ handle: string, by: string, today: string, engagement?: string, note?: string }} input
 */
function approveApp(registry, { handle, by, today, engagement, note }) {
  const app = registry.apps.find((a) => a.handle === handle);
  if (!app) throw new Error(`Unknown app handle "${handle}" — add it to ai/schema/apps.json first`);
  if (!by?.trim()) throw new Error('--by is required: the role of the lead consultant approving the app');
  if (/@|\d{6,}/.test(by)) throw new Error('--by takes a role, not personal contact data');
  if (engagement !== undefined && !SLUG.test(engagement)) throw new Error('--engagement must be a client slug');
  Object.assign(app, { status: 'approved', approved_by: by.trim(), approved_on: today });
  if (engagement) app.approved_after = engagement;
  if (note) app.approval_note = note;
  return app;
}

function main() {
  const [command, ...argv] = process.argv.slice(2);
  const get = (flag) => {
    const i = argv.indexOf(flag);
    return i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : undefined;
  };
  const registry = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));

  if (command === 'list') {
    const status = get('--status');
    for (const a of registry.apps.filter((x) => !status || x.status === status)) {
      console.log(`${a.status === 'approved' ? '✓' : '·'} ${a.handle.padEnd(48)} ${a.name}${a.approved_by ? ` — approved by ${a.approved_by} on ${a.approved_on}` : ''}`);
    }
    return;
  }
  if (command === 'approve') {
    const app = approveApp(registry, { handle: get('--handle'), by: get('--by'), engagement: get('--engagement'), note: get('--note'), today: new Date().toISOString().slice(0, 10) });
    fs.writeFileSync(REGISTRY, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');
    console.log(`✓ ${app.name} approved by ${app.approved_by} on ${app.approved_on}. Re-render the consultant guide: npm run questionnaire:render`);
    return;
  }
  throw new Error('Usage: npm run apps -- list [--status proposed|approved] | approve --handle <handle> --by "<role>" [--engagement <slug>] [--note "..."]');
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (err) {
    console.error(`\n✗ ${err.message}\n`);
    process.exit(1);
  }
}
