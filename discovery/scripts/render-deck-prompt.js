/**
 * @file render-deck-prompt.js
 * @description Copy the Discovery Closing Deck prompt (discovery/docs/deck-prompt.md,
 * the text below the first `---`) into a JS module, so the web app and the Claude
 * connector carry it in bundled server code. Run after editing the prompt:
 * `npm run deck:prompt` (a test fails when they differ).
 *
 * @module scripts/render-deck-prompt
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { DISCOVERY_ROOT } from '../paths.js';

export const SOURCE = path.join(DISCOVERY_ROOT, 'docs', 'deck-prompt.md');
export const OUTPUT = path.join(DISCOVERY_ROOT, 'agents', 'discovery-deck', 'prompt.js');

/** The prompt body (below the first horizontal rule). @param {string} markdown */
export const promptBody = (markdown) => markdown.slice(markdown.indexOf('\n---\n') + 5).trim();

export function renderPromptModule(markdown) {
  return `/**
 * @file prompt.js
 * @description GENERATED from discovery/docs/deck-prompt.md — do not edit. Run \`npm run deck:prompt\`.
 *
 * @module discovery-deck/prompt
 */

export const DECK_PROMPT = ${JSON.stringify(promptBody(markdown))};
`;
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  fs.writeFileSync(OUTPUT, renderPromptModule(fs.readFileSync(SOURCE, 'utf8')), 'utf8');
  console.log(`✓ Written → ${path.relative(process.cwd(), OUTPUT)}`);
}
