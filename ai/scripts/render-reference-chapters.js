/**
 * @file render-reference-chapters.js
 * @description Copy Merkle's Shopify reference chapters (discovery/docs/reference/*.md)
 * into a JS module, so the web app and the Claude connector carry them in bundled
 * server code. Run after editing a chapter: `npm run reference:chapters`
 * (a test fails when they differ).
 *
 * Front matter per chapter (first `---` block): title, verified (YYYY-MM-DD),
 * topics (comma separated), summary.
 *
 * @module scripts/render-reference-chapters
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { DISCOVERY_ROOT } from '../paths.js';

export const SOURCE_DIR = path.join(DISCOVERY_ROOT, 'docs', 'reference');
export const OUTPUT = path.join(DISCOVERY_ROOT, 'service', 'reference-chapters.js');

/** Parse `--- key: value ---` front matter plus the body. @param {string} text */
export function parseChapter(slug, text) {
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text);
  if (!match) throw new Error(`${slug}: missing front matter`);
  const meta = {};
  for (const line of match[1].split('\n')) {
    const kv = /^([a-z_]+):\s*(.*)$/.exec(line.trim());
    if (kv) meta[kv[1]] = kv[2].trim();
  }
  for (const key of ['title', 'verified', 'topics', 'summary']) {
    if (!meta[key]) throw new Error(`${slug}: front matter needs ${key}`);
  }
  return {
    slug,
    title: meta.title,
    verified: meta.verified,
    topics: meta.topics.split(',').map((t) => t.trim()).filter(Boolean),
    summary: meta.summary,
    markdown: match[2].trim(),
  };
}

/** Every chapter in docs/reference, sorted by file name. */
export function readChapters(dir = SOURCE_DIR) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort()
    .map((file) => parseChapter(file.replace(/\.md$/, ''), fs.readFileSync(path.join(dir, file), 'utf8')));
}

export function renderChaptersModule(chapters) {
  return `/**
 * @file reference-chapters.js
 * @description GENERATED from discovery/docs/reference/*.md — do not edit. Run \`npm run reference:chapters\`.
 *
 * @module ai/shared/reference-chapters
 */

export const REFERENCE_CHAPTERS = ${JSON.stringify(chapters, null, 2)};
`;
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const chapters = readChapters();
  fs.writeFileSync(OUTPUT, renderChaptersModule(chapters), 'utf8');
  console.log(`✓ Written → ${path.relative(process.cwd(), OUTPUT)} (${chapters.length} chapters)`);
}
