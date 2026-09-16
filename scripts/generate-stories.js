#!/usr/bin/env node
/**
 * @file generate-stories.js
 * @description CLI entry point for the story-generation pipeline.
 *
 * Usage:
 *   node scripts/generate-stories.js --spec store-spec.yaml
 *   node scripts/generate-stories.js --spec store-spec.yaml --output stories.md --format md
 *   node scripts/generate-stories.js --spec store-spec.yaml --output stories.json --format json
 *
 * Pipeline:
 *   1. parseCliArgs  — resolve and validate CLI flags
 *   2. parseSpec     — read and parse the YAML store-spec file
 *   3. selectStories — filter the story registry by spec applicability
 *   4. render        — convert to the requested output format (md | json)
 *   5. writeFile     — write the result to disk
 *
 * No external dependencies — pure Node.js built-ins only.
 */

import fs   from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseCliArgs }  from './generate-stories/cliArgs.js';
import { parseSpec }     from './generate-stories/parseSpec.js';
import { selectStories } from './generate-stories/storyRegistry.js';
import { render }        from './generate-stories/storyRenderer.js';

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // 1. Parse CLI arguments
  const args = parseCliArgs(process.argv.slice(2));

  // 2. Read and parse the store-spec YAML
  let rawYaml;
  try {
    rawYaml = await fs.readFile(args.spec, 'utf8');
  } catch (err) {
    console.error(`\n✗ Cannot read spec file: ${args.spec}`);
    console.error(`  ${err.message}\n`);
    process.exit(1);
  }

  const { spec, errors, warnings } = parseSpec(rawYaml);

  // Surface warnings first (non-fatal)
  if (warnings.length > 0) {
    console.warn('\n⚠ Spec warnings:');
    for (const w of warnings) console.warn(`  • ${w}`);
  }

  // Fatal validation errors
  if (errors.length > 0 || spec === null) {
    console.error('\n✗ Spec validation failed:');
    for (const e of errors) console.error(`  • ${e}`);
    console.error('');
    process.exit(1);
  }

  // 3. Filter stories by spec
  const stories = selectStories(spec);

  console.log(
    `\n✓ Spec loaded: ${spec.store?.name ?? '(unnamed)'} · ` +
    `tier=${spec.tier?.selected ?? '?'} · ` +
    `${stories.length} stories selected`,
  );

  // 4. Render
  const output = render(stories, spec, args.format);

  // 5. Write to disk
  const outputDir = path.dirname(args.output);
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(args.output, output, 'utf8');

  console.log(`✓ Written → ${args.output}  (format: ${args.format})\n`);
}

main().catch((err) => {
  console.error('\n✗ Unexpected error:', err.message);
  if (process.env.DEBUG) console.error(err.stack);
  process.exit(1);
});
