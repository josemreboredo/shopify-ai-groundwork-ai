#!/usr/bin/env node
/**
 * @file claude-code.js
 * @description Claude Code mode for the discovery engine: the two LLM steps
 * (extraction, approach) are done by the Claude Code session instead of the
 * Anthropic API. Everything else — consent, redaction, validation, offer, exit
 * rules, rendering — stays in code. Orchestrated by the `/discover` skill
 * (.claude/skills/discover/SKILL.md).
 *
 *   npm run discover:prepare  -- --questionnaire <file.md> [--client <slug>]
 *   (Claude Code writes extraction.json)
 *   npm run discover:assemble -- --work <dir>
 *   (Claude Code writes approach.json — GO, or STOP routed to a Larger Engagement)
 *   npm run discover:finish   -- --work <dir> [--out-dir clients] [--dry-run]
 */

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

import { prepareQuestionnaire, answerValidator, decide, finalize, needsApproach, stopRoute } from './engine.js';
import { EXTRACTION_SYSTEM, processExtraction } from './extract.js';
import { APPROACH_SYSTEM, approachInput, fromApproachPayload } from './approach.js';
import { buildExtractionSchema, buildApproachSchema } from './extraction-schema.js';
import { writeOutputs } from './cli.js';
import { explainError } from './llm.js';
import { CLIENTS_DIR, WORK_ROOT } from '../../paths.js';

const require = createRequire(import.meta.url);
const Ajv2020 = require('ajv/dist/2020');

const SLUG = /^[a-z0-9][a-z0-9-]{0,62}$/;

export const ACCOUNT_NOTICE = [
  '⚠  Claude Code mode runs on a personal Claude Pro account (interim decision, ADR 0007).',
  '   Before dentsu / Merkle adoption or processing real client data at scale, migrate to',
  "   dentsu's Claude Enterprise. Until then, keep \"use my chats to improve models\" switched off",
  '   in claude.ai → Settings → Privacy.',
].join('\n');

/** Paths inside a work directory. */
export const WORK_FILES = {
  state: 'state.json',
  questionnaire: 'questionnaire.redacted.md',
  extractionInstructions: 'extraction-instructions.md',
  extractionSchema: 'extraction.schema.json',
  extraction: 'extraction.json',
  decision: 'decision.json',
  approachInstructions: 'approach-instructions.md',
  approachSchema: 'approach.schema.json',
  approach: 'approach.json',
};

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');

/**
 * Work-directory name from --client or the questionnaire file name.
 *
 * @param {string} questionnairePath
 * @param {string} [client]
 */
export function workName(questionnairePath, client) {
  if (client) return client;
  const base = path.basename(questionnairePath, path.extname(questionnairePath))
    .toLowerCase().replace(/[-_]?questionnaire$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return SLUG.test(base) ? base : 'engagement';
}

/**
 * Validate data against a structured-output schema (the same one the API uses).
 *
 * @param {object} schema
 * @param {unknown} data
 * @returns {string[]}
 */
function shapeErrors(schema, data) {
  const validate = new Ajv2020({ strict: false, allErrors: true }).compile(schema);
  return validate(data) ? [] : validate.errors.map((e) => `${e.instancePath || '/'} ${e.message}`);
}

// ─── prepare ──────────────────────────────────────────────────────────────────

/**
 * Consent + redaction; write the files Claude Code needs for extraction.
 *
 * @param {{ questionnaire: string, client?: string, workRoot?: string, today: string }} options
 * @returns {{ workDir: string, redactions: object }}
 */
export function prepare({ questionnaire, client, workRoot = WORK_ROOT, today }) {
  if (client && !SLUG.test(client)) throw new Error('Invalid --client — use a kebab-case slug, e.g. acme-watches');
  const { text, redactions } = prepareQuestionnaire(fs.readFileSync(questionnaire, 'utf8'));

  const workDir = path.join(workRoot, workName(questionnaire, client));
  fs.rmSync(workDir, { recursive: true, force: true });
  fs.mkdirSync(workDir, { recursive: true });

  writeJson(path.join(workDir, WORK_FILES.state), { client: client ?? null, today, redactions });
  fs.writeFileSync(path.join(workDir, WORK_FILES.questionnaire), text, 'utf8');
  writeJson(path.join(workDir, WORK_FILES.extractionSchema), buildExtractionSchema());
  fs.writeFileSync(path.join(workDir, WORK_FILES.extractionInstructions), `${EXTRACTION_SYSTEM}

---

## Your task

Read \`${WORK_FILES.questionnaire}\` in this directory and write \`${WORK_FILES.extraction}\` here.
It must be a single JSON object that matches \`${WORK_FILES.extractionSchema}\`:
\`{ "answers": [{ "pointer", "value_json" }], "provenance": [{ "pointer", "source", "status", "question_id", "note" }], "exit_candidates": [{ "rule_id", "evidence" }], "open_items": [{ "pointer", "question_id", "why" }] }\`.
value_json is a string containing JSON (e.g. "\\"CH\\"", "800", "true").
`, 'utf8');

  return { workDir, redactions };
}

// ─── assemble ─────────────────────────────────────────────────────────────────

/**
 * Validate extraction.json, compute offer and exit rules, and (when an approach
 * is needed) write the approach instructions. Consultant notes come from
 * state.json (interview) and are kept in the engagement.
 *
 * @param {{ workDir: string }} options
 * @returns {{ ok: false, errors: string[] } | { ok: true, doc: object }}
 */
export function assembleWork({ workDir }) {
  const file = path.join(workDir, WORK_FILES.extraction);
  if (!fs.existsSync(file)) return { ok: false, errors: [`${WORK_FILES.extraction} not found in ${workDir}`] };

  let data;
  try {
    data = readJson(file);
  } catch {
    return { ok: false, errors: [`${WORK_FILES.extraction} is not valid JSON`] };
  }
  const shape = shapeErrors(buildExtractionSchema(), data);
  if (shape.length) return { ok: false, errors: shape };

  const state = readJson(path.join(workDir, WORK_FILES.state));
  const options = { today: state.today, clientSlug: state.client ?? undefined, source: state.source ?? 'questionnaire' };
  const { errors, ...extraction } = processExtraction(data, answerValidator(options));
  if (errors.length) return { ok: false, errors };

  const doc = decide({ ...extraction, notes: state.notes ?? [] }, options);
  writeJson(path.join(workDir, WORK_FILES.decision), doc);
  fs.rmSync(path.join(workDir, WORK_FILES.approach), { force: true });
  fs.rmSync(path.join(workDir, WORK_FILES.approachInstructions), { force: true });

  if (needsApproach(doc)) {
    writeJson(path.join(workDir, WORK_FILES.approachSchema), buildApproachSchema());
    fs.writeFileSync(path.join(workDir, WORK_FILES.approachInstructions), `${APPROACH_SYSTEM}

---

## Your task

Write \`${WORK_FILES.approach}\` in this directory: a single JSON object matching \`${WORK_FILES.approachSchema}\`
(capability_map, app_shortlist, assumptions, phases). Use "" for empty text, -1 / "unknown" for unknown app costs,
"none" for tasks without a capability.

## Engagement

\`\`\`json
${JSON.stringify(approachInput(doc), null, 2)}
\`\`\`
`, 'utf8');
  }
  return { ok: true, doc };
}

// ─── finish ───────────────────────────────────────────────────────────────────

/**
 * Merge approach.json (GO), validate the full engagement and write outputs.
 *
 * @param {{ workDir: string, outDir?: string, dryRun?: boolean }} options
 * @returns {{ ok: false, errors: string[] } | { ok: true, engagement: object, written: string[] }}
 */
export function finishWork({ workDir, outDir = CLIENTS_DIR, dryRun = false }) {
  const decisionFile = path.join(workDir, WORK_FILES.decision);
  if (!fs.existsSync(decisionFile)) return { ok: false, errors: ['Run discover:assemble first — decision.json not found'] };
  const doc = readJson(decisionFile);

  let approach = null;
  if (needsApproach(doc)) {
    const file = path.join(workDir, WORK_FILES.approach);
    if (!fs.existsSync(file)) {
      const who = doc.delivery.go ? 'GO engagements' : `STOP engagements routed to ${stopRoute(doc).label}`;
      return { ok: false, errors: [`${WORK_FILES.approach} not found — ${who} need a drafted approach`] };
    }
    let payload;
    try {
      payload = readJson(file);
    } catch {
      return { ok: false, errors: [`${WORK_FILES.approach} is not valid JSON`] };
    }
    const shape = shapeErrors(buildApproachSchema(), payload);
    if (shape.length) return { ok: false, errors: shape };
    approach = fromApproachPayload(payload);
  }

  let engagement;
  try {
    engagement = finalize(doc, approach);
  } catch (err) {
    return { ok: false, errors: err.errors ?? [err.message] };
  }
  const written = dryRun ? [] : writeOutputs(outDir, engagement);
  return { ok: true, engagement, written };
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

/** @param {string[]} argv */
function flags(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    const next = argv[i + 1];
    out[argv[i].slice(2)] = next && !next.startsWith('--') ? argv[++i] : true;
  }
  return out;
}

/** @param {object} doc */
function printDecision(doc) {
  const route = stopRoute(doc);
  const status = doc.delivery.go ? `offer ${doc.offer.code} (${doc.offer.name}) · GO` : route?.brief ? `${route.label} (nearest offer ${doc.offer.code})` : `offer ${doc.offer.code} (${doc.offer.name}) · STOP${route ? ` → ${route.label}` : ''}`;
  console.log(`✓ ${doc.meta.client.name} · ${status}`);
  for (const item of doc.exits.items) console.log(`  ${item.result.padEnd(4)} ${item.rule_id} ${item.evidence}`);
  console.log(`  open items: ${doc.approach.risks.open_items.length}`);
}

/** @param {string[]} errors */
function printErrors(errors) {
  console.error(`✗ ${errors.length} problem(s) — fix the file and run the same command again:`);
  for (const e of errors.slice(0, 40)) console.error(`  • ${e}`);
  process.exitCode = 2;
}

function main() {
  const [command, ...rest] = process.argv.slice(2);
  const f = flags(rest);
  const cwd = process.cwd();

  if (command === 'prepare') {
    if (typeof f.questionnaire !== 'string') throw new Error('Usage: npm run discover:prepare -- --questionnaire <file.md> [--client <slug>]');
    console.log(ACCOUNT_NOTICE);
    const { workDir, redactions } = prepare({
      questionnaire: path.resolve(cwd, f.questionnaire),
      client: typeof f.client === 'string' ? f.client : undefined,
      today: new Date().toISOString().slice(0, 10),
    });
    const rel = path.relative(cwd, workDir);
    console.log(`✓ Consent recorded · redacted ${redactions.emails} e-mail(s), ${redactions.phones} phone number(s), ${redactions.names} name(s)`);
    console.log(`  work directory: ${rel}`);
    console.log(`  next: follow ${rel}/${WORK_FILES.extractionInstructions} → write ${rel}/${WORK_FILES.extraction}`);
    console.log(`        then npm run discover:assemble -- --work ${rel}`);
    return;
  }

  if (typeof f.work !== 'string') throw new Error(`Usage: npm run discover:${command ?? '<prepare|assemble|finish>'} -- --work <dir>`);
  const workDir = path.resolve(cwd, f.work);
  const rel = path.relative(cwd, workDir);

  if (command === 'assemble') {
    const result = assembleWork({ workDir });
    if (!result.ok) return printErrors(result.errors);
    printDecision(result.doc);
    if (!result.doc.delivery.go && !stopRoute(result.doc)) {
      console.log('  route: not decided — record delivery.route (Q10.5.5): larger_engagement or no_bid');
    }
    console.log(needsApproach(result.doc)
      ? `  next: follow ${rel}/${WORK_FILES.approachInstructions} → write ${rel}/${WORK_FILES.approach}\n        then npm run discover:finish -- --work ${rel}`
      : `  next: npm run discover:finish -- --work ${rel}`);
    return;
  }

  if (command === 'finish') {
    const result = finishWork({
      workDir,
      outDir: typeof f['out-dir'] === 'string' ? path.resolve(cwd, f['out-dir']) : undefined,
      dryRun: f['dry-run'] === true,
    });
    if (!result.ok) return printErrors(result.errors);
    printDecision(result.engagement);
    if (result.written.length === 0) console.log('  --dry-run: nothing written');
    for (const file of result.written) console.log(`  wrote ${path.relative(cwd, file)}`);
    return;
  }

  throw new Error('Unknown command — use prepare, assemble or finish');
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (err) {
    console.error(`\n✗ ${explainError(err)}\n`);
    process.exit(1);
  }
}
