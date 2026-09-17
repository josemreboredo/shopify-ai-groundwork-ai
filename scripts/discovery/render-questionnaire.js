#!/usr/bin/env node
/**
 * @file render-questionnaire.js
 * @description Generates, from schema/question-bank.json, schema/offering.json
 * and schema/apps.json:
 *   - docs/discovery/client-questionnaire.md  the questionnaire used with the client
 *     (no Shopify plan requirements — owner decision 2026-09-17)
 *   - docs/discovery/consultant-guide.md      Shopify knowledge per question for the
 *     consultant: native features, minimum plan, docs, App Store apps, rules fed
 * Both files are outputs — edit the sources, then re-render.
 *
 * Usage:
 *   npm run questionnaire:render            # write both files
 *   npm run questionnaire:render -- --check # exit 1 if either file is out of date
 */

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  questionBank,
  offering,
  apps,
  schemaNodeAt,
  enumValues,
  questionsFeeding,
} from '../../schema/index.js';
import { PLAN_RULES, PLAN_LABEL } from '../../agents/discovery/plan.js';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const OUTPUT = path.join(REPO_ROOT, 'docs/discovery/client-questionnaire.md');
export const GUIDE_OUTPUT = path.join(REPO_ROOT, 'docs/discovery/consultant-guide.md');

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
  if (q.only_if) lines.push(`*Only if ${q.only_if.map(describeCondition).join(' or ')}.*`);
  if (q.help) lines.push(`*${q.help}*`);
  lines.push('', ...answerBlock(q));
  return lines.join('\n');
}

function renderExitScreening() {
  const rows = offering.exit_rules.map((r) => {
    const askedIn = questionsFeeding(`exit:${r.id}`).join(', ');
    const status  = r.status === 'proposed' ? ' *(proposed)*' : '';
    return `| ${r.id} | ${r.client_condition ?? r.condition}${status} | ${r.result} | ${r.destination} | ${askedIn} | |`;
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

// ─── Consultant guide ─────────────────────────────────────────────────────────

const PLAN_NAME = { ...PLAN_LABEL, starter: 'Starter', retail: 'Retail', enterprise: 'Enterprise' };
const APP_BY_HANDLE = new Map(apps.apps.map((a) => [a.handle, a]));
const REF_LABEL = new Map([
  ...offering.scope_gates.map((g) => [`gate:${g.id}`, `gate ${g.label}`]),
  ...offering.l_triggers.map((t) => [`l_trigger:${t.id}`, `L trigger ${t.label}`]),
  ...offering.exit_rules.map((r) => [`exit:${r.id}`, `rule ${r.id} (${r.result})`]),
  ...offering.app_signals.map((a) => [`app:${a.id}`, `app signal ${a.label}`]),
]);

/** Markdown table cell. @param {unknown} v */
const cell = (v) => String(v ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');

/** "orders per month ≥ 1000". @param {object} c */
function describeCondition(c) {
  if (c.pointer === '/markets/list/*/code' && 'includes_any' in c) return `the launch markets include ${c.includes_any.map((code) => (code === 'CN' ? 'mainland China (CN)' : code)).join(' / ')}`;
  const field = c.pointer.replace(/^\//, '').replace(/\/\*/g, '').replace(/\//g, ' › ').replace(/_/g, ' ');
  if ('equals' in c) return `${field} = ${c.equals === true ? 'yes' : c.equals === false ? 'no' : humanise(c.equals)}`;
  if ('not_equals' in c) return `${field} ≠ ${humanise(c.not_equals)}`;
  if ('in' in c) return `${field} is ${c.in.map(humanise).join(' / ')}`;
  if ('includes_any' in c) return `${field} includes ${c.includes_any.map(humanise).join(' / ')}`;
  if ('min' in c) return `${field} ≥ ${c.min}`;
  if ('count_min' in c) return `${c.count_min}+ distinct ${field}`;
  if ('matches' in c) return `${field} mentions ${c.matches.split('|').join(' / ')}`;
  return field;
}

/** @param {object} q */
function renderGuideQuestion(q) {
  const tags = [q.priority, q.audience];
  if (q.ask_when === 'stop') tags.push('only on STOP');
  const lines = [`**${q.id}** — ${q.text} *(${tags.join(' · ')})*`];
  if (q.feeds?.length) lines.push(`Feeds: ${q.feeds.map((f) => REF_LABEL.get(f) ?? f).join(' · ')}`);
  if (q.only_if) lines.push(`Asked only if ${q.only_if.map(describeCondition).join(' or ')}`);
  if (q.ask_if) lines.push(`Quick interview: asked when ${q.ask_if.map(describeCondition).join(' or ')}`);
  const s = q.shopify;
  if (!s) return lines.join('\n');
  if (s.native?.length) {
    lines.push('', '| Shopify feature | Minimum plan | Note | Docs |', '|---|---|---|---|',
      ...s.native.map((n) => `| ${cell(n.feature)} | ${PLAN_NAME[n.plan] ?? n.plan} | ${cell(n.plan_note)} | ${n.docs} |`));
  }
  if (s.app_category || s.apps?.length) {
    const appList = (s.apps ?? []).map((h) => {
      const a = APP_BY_HANDLE.get(h);
      return a ? `[${a.name}](${a.url})${a.status === 'approved' ? ' ✓' : ''}` : h;
    });
    lines.push('', `If native is not enough: ${s.app_category ? `[${s.app_category.name}](${s.app_category.url ?? 'https://apps.shopify.com'})` : 'App Store'}${appList.length ? ` — ${appList.join(', ')}` : ''}`);
  }
  if (s.extension_points?.length) lines.push(`Build with: ${s.extension_points.join(' · ')}`);
  lines.push(`*Verified ${s.verified.on} against ${s.verified.source} (${s.verified.edition}).*`);
  return lines.join('\n');
}

/**
 * Render the consultant guide Markdown.
 *
 * @returns {string}
 */
export function renderConsultantGuide() {
  const withBlock = questionBank.questions.filter((q) => q.shopify).length;
  const out = [
    '<!-- GENERATED FILE — do not edit. Source: schema/question-bank.json + schema/offering.json + schema/apps.json. Re-render: npm run questionnaire:render -->',
    '',
    '# Consultant guide — Shopify knowledge per question',
    '',
    `> **Version:** question bank ${questionBank.version} · offering ${offering.version} · app registry checked ${apps.checked_on}`,
    '>',
    '> **Consultant only.** Shopify plan requirements, docs links and app candidates behind each discovery question.',
    '> Use them to steer the conversation to what Shopify does natively; do not hand this guide to the client.',
    `> ${withBlock} of ${questionBank.questions.length} questions carry Shopify knowledge; facts are checked against Shopify documentation at each Edition.`,
    '>',
    '> Apps marked ✓ are approved by a lead consultant after engagement work; all others are proposed candidates.',
    '',
    '---',
    '',
    '## Shopify plan benchmark (exit rule 11.1)',
    '',
    'The offers do not assume Shopify Plus. The minimum plan is the highest plan any of these requirements needs; recommend the plan that best fits the client\'s market on top of it.',
    '',
    '| Requirement | Minimum plan | Answers read | Docs |',
    '|---|---|---|---|',
    ...PLAN_RULES.map((r) => `| ${cell(r.feature)} | ${PLAN_NAME[r.plan]} | ${r.inputs.map((i) => `\`${i}\``).join(', ')} | ${r.docs} |`),
    '',
    '---',
  ];
  const bySubsection = new Map();
  for (const q of questionBank.questions) {
    if (!bySubsection.has(q.subsection)) bySubsection.set(q.subsection, []);
    bySubsection.get(q.subsection).push(q);
  }
  for (const section of questionBank.sections) {
    out.push('', `## § ${section.id} — ${section.title}`);
    for (const sub of section.subsections) {
      out.push('', `### ${sub.id} ${sub.title}`);
      for (const q of bySubsection.get(sub.id) ?? []) out.push('', renderGuideQuestion(q));
    }
    out.push('', '---');
  }
  out.push('', '## § 11 — Exit rules (full conditions)', '', '| Rule | Result | Condition | If triggered | Asked in |', '|---|---|---|---|---|',
    ...offering.exit_rules.map((r) => `| ${r.id} | ${r.result} | ${cell(r.condition)} | ${cell(r.destination)} | ${questionsFeeding(`exit:${r.id}`).join(', ')} |`), '');
  return out.join('\n');
}

function main() {
  const outputs = [[OUTPUT, renderQuestionnaire()], [GUIDE_OUTPUT, renderConsultantGuide()]];
  if (process.argv.includes('--check')) {
    const stale = outputs.filter(([file, text]) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '') !== text);
    for (const [file] of stale) console.error(`✗ ${path.relative(process.cwd(), file)} is out of date — run: npm run questionnaire:render`);
    if (stale.length) process.exit(1);
    console.log('✓ questionnaire and consultant guide are up to date');
    return;
  }
  for (const [file, text] of outputs) fs.writeFileSync(file, text, 'utf8');
  console.log(`✓ Written → ${path.relative(process.cwd(), OUTPUT)} (${questionBank.questions.length} questions) and ${path.relative(process.cwd(), GUIDE_OUTPUT)}`);
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
