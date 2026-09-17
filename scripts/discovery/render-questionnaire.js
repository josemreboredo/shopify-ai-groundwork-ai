#!/usr/bin/env node
/**
 * @file render-questionnaire.js
 * @description Generates docs/discovery/client-questionnaire.md from
 * schema/question-bank.json (questions) and schema/offering.json (§ 11 exit rules).
 * The Markdown file is an output — edit the question bank, then re-render.
 *
 * Usage:
 *   npm run questionnaire:render            # write the file
 *   npm run questionnaire:render -- --check # exit 1 if the file is out of date
 */

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  questionBank,
  offering,
  schemaNodeAt,
  enumValues,
  questionsFeeding,
} from '../../schema/index.js';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const OUTPUT = path.join(REPO_ROOT, 'docs/discovery/client-questionnaire.md');

const PRIORITY_LABEL = { required: 'required', recommended: 'recommended', optional: 'optional' };

/** @param {string} value */
const humanise = (value) => String(value).replace(/_/g, ' ');

/** @param {object} q */
function answerBlock(q) {
  const node = q.maps_to.length === 1 ? schemaNodeAt(q.maps_to[0]) : null;

  switch (q.answer_type) {
    case 'boolean':
      return ['- [ ] Yes', '- [ ] No'];
    case 'enum':
    case 'multi_enum': {
      const values = enumValues(node) ?? [];
      const hint = q.answer_type === 'multi_enum' ? 'tick all that apply' : 'tick one';
      return [`*(${hint})*`, ...values.map((v) => `- [ ] ${humanise(v)}`)];
    }
    case 'table': {
      const item = schemaNodeAt(`${q.maps_to[0]}/*`);
      const columns = Object.keys(item.properties).map(humanise);
      return [
        `| ${columns.join(' | ')} |`,
        `|${columns.map(() => '---').join('|')}|`,
        `|${columns.map(() => ' ').join('|')}|`,
      ];
    }
    case 'money_range':
      if (node) return Object.keys(node.properties).map((k) => `- ${k}:`);
      return q.maps_to.map((p) => `- ${humanise(p.split('/').pop())}:`);
    case 'group':
      return q.maps_to.map((p) => `- ${humanise(p.split('/').pop())}:`);
    default:
      return ['> Answer:'];
  }
}

/** @param {object} q */
function renderQuestion(q) {
  const tags = [PRIORITY_LABEL[q.priority]];
  if (q.audience === 'consultant') tags.push('consultant');
  const lines = [`**${q.id}** — ${q.text} *(${tags.join(' · ')})*`];

  if (q.skip_if) {
    const target = q.skip_if.question;
    const condition = 'equals' in q.skip_if
      ? `${target} = ${q.skip_if.equals === false ? 'no' : humanise(q.skip_if.equals)}`
      : `${target} does not include ${humanise(q.skip_if.excludes)}`;
    lines.push(`*Skip if ${condition}.*`);
  }
  if (q.ask_when === 'stop') lines.push('*Only if a § 11 rule is STOP.*');
  if (q.help) lines.push(`*${q.help}*`);
  lines.push('', ...answerBlock(q));
  return lines.join('\n');
}

function renderExitScreening() {
  const rows = offering.exit_rules.map((r) => {
    const askedIn = questionsFeeding(`exit:${r.id}`).join(', ');
    const status  = r.status === 'proposed' ? ' *(proposed)*' : '';
    return `| ${r.id} | ${r.condition}${status} | ${r.result} | ${r.destination} | ${askedIn} | |`;
  });

  return [
    '## § 11 — Exit-trigger screening',
    '',
    '> Complete immediately after the discovery call, before any work is scoped.',
    '> Each rule is answered by the questions listed — confirm the outcome here.',
    '> **STOP** blocks GO · **FLAG** needs a named owner before build · **WARN** is a commercial adjustment.',
    '',
    '| Rule | Condition | Result | If triggered | Answered by | Outcome (triggered / clear) |',
    '|---|---|---|---|---|---|',
    ...rows,
  ].join('\n');
}

/**
 * Render the full questionnaire Markdown.
 *
 * @returns {string}
 */
export function renderQuestionnaire() {
  const out = [
    '<!-- GENERATED FILE — do not edit. Source: schema/question-bank.json + schema/offering.json. Re-render: npm run questionnaire:render -->',
    '',
    '# Shopify Discovery Questionnaire',
    '',
    `> **Version:** question bank ${questionBank.version} · offering ${offering.version}`,
    '>',
    '> **How to use:** work through §§ 0–10 with the client in the discovery call (60–90 min),',
    '> then complete § 11 straight after. Answer every *required* question — "TBC" is acceptable,',
    '> a blank is not. Questions marked *consultant* are answered by the lead consultant, not the client.',
    '>',
    '> **Output:** the completed questionnaire is the input to the discovery engine, which produces',
    '> the engagement spec, offer classification, capability map, closing deck and backlog.',
    '>',
    '> **Personal data:** do not record customer personal data. Stakeholder names are optional.',
    '',
    '---',
  ];

  const bySubsection = new Map();
  for (const q of questionBank.questions) {
    if (!bySubsection.has(q.subsection)) bySubsection.set(q.subsection, []);
    bySubsection.get(q.subsection).push(q);
  }

  for (const section of questionBank.sections) {
    out.push('', `## § ${section.id} — ${section.title}`, '', `> ${section.intro}`);
    for (const sub of section.subsections) {
      out.push('', `### ${sub.id} ${sub.title}`);
      for (const q of bySubsection.get(sub.id) ?? []) out.push('', renderQuestion(q));
    }
    out.push('', '---');
  }

  out.push(
    '',
    renderExitScreening(),
    '',
    '---',
    '',
    '## Completion checklist',
    '',
    '- [ ] Every *required* question in §§ 0–10 has an answer or "TBC"',
    '- [ ] At least one KPI has a baseline and a target (Q0.4.2)',
    '- [ ] Every connected system is listed in Q8.1.1 with direction and connector',
    '- [ ] § 11 outcome recorded for every rule; every STOP has a named resolution owner',
    '- [ ] Consent for AI processing recorded (Q10.5.2)',
    '',
  );

  return out.join('\n');
}

function main() {
  const rendered = renderQuestionnaire();
  if (process.argv.includes('--check')) {
    const current = fs.existsSync(OUTPUT) ? fs.readFileSync(OUTPUT, 'utf8') : '';
    if (current !== rendered) {
      console.error(`✗ ${path.relative(process.cwd(), OUTPUT)} is out of date — run: npm run questionnaire:render`);
      process.exit(1);
    }
    console.log('✓ questionnaire is up to date');
    return;
  }
  fs.writeFileSync(OUTPUT, rendered, 'utf8');
  console.log(`✓ Written → ${path.relative(process.cwd(), OUTPUT)} (${questionBank.questions.length} questions)`);
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
