#!/usr/bin/env node
/**
 * @file cli.js
 * @description Discovery engine CLI.
 *
 * Usage:
 *   npm run discover -- --questionnaire path/to/questionnaire.md [--client slug] [--out-dir clients] [--dry-run]
 *
 * Writes clients/<slug>/engagement.json plus Markdown renderings (GO) or
 * stop-report.md (STOP). Requires ANTHROPIC_API_KEY (or an `ant auth login`
 * profile). The model can be overridden with DISCOVERY_MODEL.
 */

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { runDiscovery } from './engine.js';
import { createLlm, explainError } from './llm.js';
import { renderArtefacts } from './render.js';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SLUG = /^[a-z0-9][a-z0-9-]{0,62}$/;

/**
 * @param {string[]} argv
 * @param {string} [cwd]
 */
export function parseArgs(argv, cwd = process.cwd()) {
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const next = argv[i + 1];
    flags[token.slice(2)] = next && !next.startsWith('--') ? argv[++i] : true;
  }
  if (typeof flags.questionnaire !== 'string') {
    throw new Error('Missing --questionnaire <path>\nUsage: npm run discover -- --questionnaire <file.md> [--client <slug>] [--out-dir clients] [--dry-run]');
  }
  if (flags.client !== undefined && (typeof flags.client !== 'string' || !SLUG.test(flags.client))) {
    throw new Error('Invalid --client — use a kebab-case slug, e.g. acme-watches');
  }
  return {
    questionnaire: path.resolve(cwd, flags.questionnaire),
    client: flags.client,
    outDir: path.resolve(cwd, typeof flags['out-dir'] === 'string' ? flags['out-dir'] : path.join(REPO_ROOT, 'clients')),
    dryRun: flags['dry-run'] === true,
  };
}

/**
 * Write engagement.json and artefacts under outDir/<slug>/.
 *
 * @param {string} outDir
 * @param {object} engagement
 * @returns {string[]} written paths
 */
export function writeOutputs(outDir, engagement) {
  const slug = engagement.meta.client.slug;
  const dir = path.resolve(outDir, slug);
  if (!SLUG.test(slug) || path.dirname(dir) !== path.resolve(outDir)) {
    throw new Error(`Refusing to write outside ${outDir}: ${slug}`);
  }
  fs.mkdirSync(dir, { recursive: true });

  // Drop artefacts from a previous run whose GO/STOP status differs.
  for (const stale of ['delivery-plan.md', 'capability-map.md', 'app-shortlist.md', 'risks.md', 'stop-report.md']) {
    fs.rmSync(path.join(dir, stale), { force: true });
  }

  const files = { 'engagement.json': `${JSON.stringify(engagement, null, 2)}\n`, ...renderArtefacts(engagement) };
  return Object.entries(files).map(([name, content]) => {
    const file = path.join(dir, name);
    fs.writeFileSync(file, content, 'utf8');
    return file;
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const questionnaire = fs.readFileSync(args.questionnaire, 'utf8');
  const llm = createLlm();

  console.log(`→ Discovery: ${path.relative(process.cwd(), args.questionnaire)} (model ${llm.model})`);
  const result = await runDiscovery({
    questionnaire,
    llm,
    today: new Date().toISOString().slice(0, 10),
    clientSlug: args.client,
  });

  const { engagement } = result;
  const r = result.redactions;
  console.log(`✓ ${engagement.meta.client.name} · offer ${engagement.offer.code} (${engagement.offer.name}) · ${result.go ? 'GO' : 'STOP'}`);
  console.log(`  redacted: ${r.emails} e-mail(s), ${r.phones} phone number(s), ${r.names} stakeholder name(s)`);
  for (const item of engagement.exits.items) console.log(`  ${item.result.padEnd(4)} ${item.rule_id} ${item.evidence}`);
  console.log(`  open items: ${engagement.approach.risks.open_items.length}`);

  if (args.dryRun) {
    console.log('  --dry-run: nothing written');
    return;
  }
  for (const file of writeOutputs(args.outDir, engagement)) console.log(`  wrote ${path.relative(process.cwd(), file)}`);
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`\n✗ ${explainError(err)}\n`);
    process.exit(1);
  });
}
