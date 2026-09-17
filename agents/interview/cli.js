#!/usr/bin/env node
/**
 * @file cli.js
 * @description Interview CLI used by the /interview Claude Code skill. Every
 * command prints JSON so the conversation can read results reliably.
 *
 *   npm run interview -- start   --client <slug> [--language de] [--mode quick|standard|full] [--restart]
 *   npm run interview -- next    --client <slug> [--limit 3]
 *   npm run interview -- answer  --client <slug> --pointer </path> --value '<json>' [--question Q1.1.1]
 *                                [--source client|consultant|inferred] [--status confirmed|tbc] [--note "..."]
 *   npm run interview -- tbc     --client <slug> --question <id> [--note "..."]
 *   npm run interview -- skip    --client <slug> --question <id> [--note "..."]
 *   npm run interview -- note    --client <slug> --text "..."
 *   npm run interview -- preview --client <slug>
 *   npm run interview -- finish  --client <slug>
 */

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createSession, loadSession, saveSession, sessionFile, DEFAULT_WORK_ROOT } from './session.js';
import { nextQuestions } from './next.js';
import { recordAnswer, markQuestion, addNote } from './answer.js';
import { preview } from './preview.js';
import { finishInterview } from './finish.js';

const today = () => new Date().toISOString().slice(0, 10);

/** @param {string[]} argv */
export function parseFlags(argv) {
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    const next = argv[i + 1];
    flags[argv[i].slice(2)] = next !== undefined && !next.startsWith('--') ? argv[++i] : true;
  }
  return flags;
}

/**
 * Run one command. Returns the JSON result; throws on usage errors.
 *
 * @param {string} command
 * @param {Record<string, string|boolean>} flags
 * @param {{ workRoot?: string, date?: string }} [env]
 */
export function run(command, flags, { workRoot = DEFAULT_WORK_ROOT, date = today() } = {}) {
  const client = typeof flags.client === 'string' ? flags.client : undefined;
  const file = sessionFile(workRoot, client);
  const str = (name) => (typeof flags[name] === 'string' ? flags[name] : undefined);

  if (command === 'start') {
    if (fs.existsSync(file) && flags.restart !== true) {
      const session = loadSession(file);
      return { resumed: true, language: session.language, mode: session.mode, ...nextQuestions(session) };
    }
    const session = createSession({ client, language: str('language') ?? 'en', mode: str('mode') ?? 'standard', today: date });
    saveSession(file, session);
    return { started: true, language: session.language, mode: session.mode, ...nextQuestions(session) };
  }

  const session = loadSession(file);
  const save = () => saveSession(file, session);

  switch (command) {
    case 'next':
      return nextQuestions(session, { limit: Number(str('limit') ?? 3) });

    case 'answer': {
      let value;
      try {
        value = JSON.parse(str('value') ?? '');
      } catch {
        return { ok: false, errors: ['--value must be JSON, e.g. \'"CH"\', 800, true, ["de","fr"]'] };
      }
      const result = recordAnswer(session, {
        pointer: str('pointer'), value, question_id: str('question'),
        source: str('source') ?? 'client', status: str('status') ?? 'confirmed', note: str('note'), today: date,
      });
      if (!result.ok) return result;
      save();
      const p = preview(session, date);
      return { ok: true, offer: p.offer, go: p.go, exit_rules: p.exit_rules, next: nextQuestions(session) };
    }

    case 'tbc':
    case 'skip': {
      const result = markQuestion(session, { question_id: str('question'), as: command === 'tbc' ? 'tbc' : 'skipped', note: str('note'), today: date });
      if (result.ok) save();
      return result.ok ? { ok: true, next: nextQuestions(session) } : result;
    }

    case 'note': {
      const result = addNote(session, { text: str('text'), today: date });
      if (result.ok) save();
      return result;
    }

    case 'preview':
      return preview(session, date);

    case 'finish': {
      const result = finishInterview(session, { workDir: path.dirname(file), today: date });
      if (!result.ok) return result;
      const doc = result.doc;
      return {
        ok: true,
        client: doc.meta.client.slug,
        offer: { code: doc.offer.code, name: doc.offer.name },
        go: doc.delivery.go,
        exit_rules: doc.exits.items.map((i) => ({ rule: i.rule_id, result: i.result, evidence: i.evidence })),
        open_items: result.open_items,
        next_step: doc.delivery.go
          ? `Follow ${path.relative(process.cwd(), path.join(path.dirname(file), 'approach-instructions.md'))}, write approach.json, then npm run discover:finish -- --work ${path.relative(process.cwd(), path.dirname(file))}`
          : `npm run discover:finish -- --work ${path.relative(process.cwd(), path.dirname(file))}`,
      };
    }

    default:
      throw new Error('Unknown command — use start, next, answer, tbc, skip, note, preview or finish');
  }
}

function main() {
  const [command, ...rest] = process.argv.slice(2);
  try {
    const result = run(command, parseFlags(rest));
    console.log(JSON.stringify(result, null, 2));
    if (result && result.ok === false) process.exitCode = 2;
  } catch (err) {
    console.log(JSON.stringify({ ok: false, errors: [err.message] }, null, 2));
    process.exitCode = 1;
  }
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
