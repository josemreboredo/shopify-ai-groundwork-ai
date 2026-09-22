#!/usr/bin/env node
/**
 * @file merge-translations.mjs
 * @description Merges translation batches (one file per section, written by hand
 * or by Claude) into ai/schema/translations/<language>.json.
 *
 * Usage: node ai/scripts/merge-translations.mjs <batch-dir> <language> [...languages]
 *   Batch files: <language>-head.json (document, sections, subsections, intros,
 *   options) and <language>-s<section>.json (questions, keyed by question id).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TARGET = path.join(HERE, '..', 'schema', 'translations');
const [dir, ...languages] = process.argv.slice(2);
if (!dir || !languages.length) {
  console.error('usage: merge-translations.mjs <batch-dir> <language> [...languages]');
  process.exit(1);
}

for (const language of languages) {
  const file = path.join(TARGET, `${language}.json`);
  const current = JSON.parse(fs.readFileSync(file, 'utf8'));
  const head = path.join(dir, `${language}-head.json`);
  if (fs.existsSync(head)) {
    const h = JSON.parse(fs.readFileSync(head, 'utf8'));
    for (const key of ['document', 'sections', 'subsections', 'intros', 'options']) {
      if (h[key]) current[key] = { ...(current[key] ?? {}), ...h[key] };
    }
  }
  let added = 0;
  for (const batch of fs.readdirSync(dir).filter((f) => new RegExp(`^${language}-s\\d+\\.json$`).test(f)).sort()) {
    const questions = JSON.parse(fs.readFileSync(path.join(dir, batch), 'utf8'));
    Object.assign(current.questions, questions);
    added += Object.keys(questions).length;
  }
  current.updated = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(file, `${JSON.stringify(current, null, 1)}\n`, 'utf8');
  console.log(`✓ ${language}: ${Object.keys(current.questions).length} questions (${added} from batches) → ${path.relative(process.cwd(), file)}`);
}
