/**
 * @file export.js
 * @description Backlog renderings: Jira CSV import file (Jira Cloud CSV
 * importer, epics linked through Issue ID / Parent), readable Markdown and JSON.
 * Internal: story points are included (the backlog is a delivery artefact,
 * not a client document).
 *
 * @module backlog/export
 */

import { EPICS, DEFINITION_OF_DONE } from './model.js';

/** RFC 4180 field. @param {unknown} value */
const csvField = (value) => {
  const s = String(value ?? '');
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/**
 * Jira wiki-markup description for a story.
 *
 * @param {import('./model.js').Story} s
 */
function jiraDescription(s) {
  const parts = [
    `*User story:* ${s.user_story}`,
    s.description ? `\n${s.description}` : '',
    '\nh3. Acceptance criteria',
    ...s.acceptance_criteria.map((c) => `* ${c}`),
    '\nh3. Definition of done',
    ...DEFINITION_OF_DONE.map((d) => `* ${d}`),
    '\nh3. Delivery',
    `* Gaia tier: ${s.gaia_tier} · Owner: ${s.owner}${s.deferred ? ' · Deferred to phase 2' : ''}`,
    s.depends_on.length ? `* Depends on: ${s.depends_on.join(', ')}` : '',
    s.security_flags.length ? `* Security review: ${s.security_flags.join(', ')}` : '',
    `* Engagement fields: ${s.spec_refs.map((r) => `{{${r}}}`).join(', ')}`,
    `* Stable key: ${s.key}`,
    '\nh3. Agent prompt',
    `{noformat}${s.agent_prompt}{noformat}`,
  ];
  return parts.filter((p) => p !== '').join('\n');
}

/**
 * Jira CSV: one Epic row per epic in use, then its stories with Parent = epic Issue ID.
 *
 * @param {import('./model.js').Story[]} stories
 * @param {{ clientName: string }} options
 * @returns {string}
 */
export function toJiraCsv(stories, { clientName }) {
  const maxLabels = Math.max(1, ...stories.map((s) => s.labels.length));
  const header = ['Issue ID', 'Parent', 'Issue Type', 'Summary', 'Description', 'Priority', 'Story Points', 'Component',
    ...Array.from({ length: maxLabels }, () => 'Labels')];

  const rows = [];
  let nextId = 1;
  for (const epic of EPICS) {
    const inEpic = stories.filter((s) => s.epic === epic.id);
    if (inEpic.length === 0) continue;
    const epicId = nextId++;
    rows.push([epicId, '', 'Epic', `${epic.name} — ${clientName}`, epic.summary, 'Medium', '', epic.name,
      'lwc', `lwc-epic-${epic.id}`, ...Array(maxLabels - 2).fill('')]);
    for (const s of inEpic) {
      rows.push([nextId++, epicId, 'Story', s.title, jiraDescription(s), s.priority, s.points, epic.name,
        ...s.labels, ...Array(maxLabels - s.labels.length).fill('')]);
    }
  }
  return `${[header, ...rows].map((r) => r.map(csvField).join(',')).join('\r\n')}\r\n`;
}

/**
 * Readable Markdown backlog.
 *
 * @param {import('./model.js').Story[]} stories
 * @param {object} doc  Engagement
 * @param {ReturnType<import('./select.js').summariseByEpic>} summary
 */
export function toMarkdown(stories, doc, summary) {
  const total = summary.reduce((n, r) => n + r.points, 0);
  const lines = [
    `# Backlog — ${doc.meta.client.name}`,
    '',
    `> Generated from \`engagement.json\` · offer ${doc.offer.code} (${doc.offer.name}) · ${stories.length} stories · ${total} points`,
    '> Internal delivery artefact. Import `backlog.csv` into Jira (Settings → System → External system import → CSV).',
    '',
    '| Epic | Stories | Points | Deferred |',
    '|---|---|---|---|',
    ...summary.map((r) => `| ${r.name} | ${r.stories} | ${r.points} | ${r.deferred} |`),
    `| **Total** | **${stories.length}** | **${total}** | **${summary.reduce((n, r) => n + r.deferred, 0)}** |`,
  ];

  for (const epic of EPICS) {
    const inEpic = stories.filter((s) => s.epic === epic.id);
    if (inEpic.length === 0) continue;
    lines.push('', `## ${epic.name}`);
    for (const s of inEpic) {
      lines.push(
        '',
        `### ${s.key} — ${s.title}`,
        '',
        `*${s.user_story}*`,
        '',
        `**${s.points} pts** · ${s.gaia_tier} · ${s.owner} · ${s.priority}${s.deferred ? ' · phase 2' : ''}${s.depends_on.length ? ` · depends on ${s.depends_on.join(', ')}` : ''}`,
      );
      if (s.description) lines.push('', s.description);
      lines.push('', ...s.acceptance_criteria.map((c) => `- [ ] ${c}`));
    }
  }
  return `${lines.join('\n')}\n`;
}
