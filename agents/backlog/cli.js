#!/usr/bin/env node
/**
 * @file cli.js
 * @description Generate the Jira-ready backlog for a GO engagement.
 *
 *   npm run backlog -- --client <slug> [--clients-dir clients]
 *
 * Reads clients/<slug>/engagement.json; writes backlog.json, backlog.csv (Jira
 * CSV import) and backlog.md next to it.
 */

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateEngagement } from '../../schema/index.js';
import { selectStories, summariseByEpic } from './select.js';
import { toJiraCsv, toMarkdown } from './export.js';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SLUG = /^[a-z0-9][a-z0-9-]{0,62}$/;

/**
 * Build and write the backlog for one client directory.
 *
 * @param {{ clientDir: string }} options
 * @returns {{ stories: object[], summary: object[], written: string[] }}
 */
export function buildBacklog({ clientDir }) {
  const file = path.join(clientDir, 'engagement.json');
  if (!fs.existsSync(file)) throw new Error(`engagement.json not found in ${clientDir} — run discovery first.`);
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'));

  const { valid, errors } = validateEngagement(doc);
  if (!valid) throw new Error(`engagement.json is invalid:\n  • ${errors.slice(0, 10).join('\n  • ')}`);
  if (!doc.delivery?.go) throw new Error('Engagement is STOP — resolve the open hard blockers before generating a backlog.');

  const stories = selectStories(doc);
  const summary = summariseByEpic(stories);
  const outputs = {
    'backlog.json': `${JSON.stringify({ generated_for: doc.meta.client.slug, offer: doc.offer.code, summary, stories }, null, 2)}\n`,
    'backlog.csv': toJiraCsv(stories, { clientName: doc.meta.client.name }),
    'backlog.md': toMarkdown(stories, doc, summary),
  };
  const written = Object.entries(outputs).map(([name, content]) => {
    const target = path.join(clientDir, name);
    fs.writeFileSync(target, content, 'utf8');
    return target;
  });
  return { stories, summary, written };
}

function main() {
  const argv = process.argv.slice(2);
  const get = (flag) => {
    const i = argv.indexOf(flag);
    return i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : undefined;
  };
  const client = get('--client');
  if (!client || !SLUG.test(client)) throw new Error('Usage: npm run backlog -- --client <slug> [--clients-dir clients]');
  const clientsDir = path.resolve(process.cwd(), get('--clients-dir') ?? path.join(REPO_ROOT, 'clients'));

  const { stories, summary, written } = buildBacklog({ clientDir: path.join(clientsDir, client) });
  const points = summary.reduce((n, r) => n + r.points, 0);
  console.log(`✓ ${client}: ${stories.length} stories · ${points} points · ${summary.length} epics`);
  for (const row of summary) console.log(`  ${row.name.padEnd(40)} ${String(row.stories).padStart(3)} stories ${String(row.points).padStart(4)} pts`);
  for (const file of written) console.log(`  wrote ${path.relative(process.cwd(), file)}`);
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (err) {
    console.error(`\n✗ ${err.message}\n`);
    process.exit(1);
  }
}
