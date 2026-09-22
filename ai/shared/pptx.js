/**
 * @file pptx.js
 * @description Bridges Markdown and the deck templates: the annex document
 * becomes deck slides, and a filled deck becomes Markdown for the text download.
 * The deck itself is written by Claude as filled templates (`deck-template.js`)
 * and rendered by `deck-render.js`.
 *
 * @module ai/shared/pptx
 */

const BULLETS_PER_SLIDE = 6;
const ROWS_PER_SLIDE = 8;
const CONSULTANT_SECTION = /^consultant notes/i;

/** Markdown emphasis, links and code spans as plain text. @param {string} text */
export function plainText(text) {
  return String(text ?? '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|[\s(])\*([^*]+)\*/g, '$1$2')
    .replace(/<br\s*\/?>/gi, ' · ')
    .replace(/\\\|/g, '|')
    .trim();
}

const arr = (value) => (Array.isArray(value) ? value : value === undefined || value === null || value === '' ? [] : [value]);
const isTableRow = (line) => /^\s*\|.*\|\s*$/.test(line);
const isSeparator = (line) => /^\s*\|[\s:|-]+\|\s*$/.test(line);
const cells = (line) => line.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((c) => plainText(c));
const chunk = (items, size) => items.reduce((out, item, i) => (i % size ? out[out.length - 1].push(item) : out.push([item]), out), []);

/**
 * The annex document as deck slides: `##` becomes a section divider, `###` a
 * slide, bullets and tables the slide body. Long lists and tables are split.
 *
 * @param {string} markdown
 * @param {{ internal?: boolean, title?: string, client?: string, date?: string }} [options]
 * @returns {{ slides: Array<object> }}
 */
export function annexDeckFromMarkdown(markdown, { internal = false, title = 'Annex', client = '', date = '' } = {}) {
  const lines = String(markdown ?? '').split('\n');
  const slides = [];
  let docTitle = title;
  let section = '';
  let heading = '';
  let sectionNumber = 0;
  let bullets = [];
  let table = [];
  let skipping = false;
  let inCode = false;

  const flush = () => {
    if (bullets.length) {
      for (const part of chunk(bullets, BULLETS_PER_SLIDE)) slides.push({ layout: 'bullets', headline: heading || section, bullets: part });
      bullets = [];
    }
    if (table.length > 1) {
      const [header, ...rows] = table;
      const parts = chunk(rows, ROWS_PER_SLIDE);
      parts.forEach((part, i) => slides.push({
        layout: 'table',
        headline: parts.length > 1 ? `${heading || section} (${i + 1}/${parts.length})` : heading || section,
        columns: header.slice(0, 6),
        rows: part.map((row) => row.slice(0, 6)),
      }));
    }
    table = [];
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (/^```/.test(line)) { inCode = !inCode; continue; }
    if (inCode) continue;
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      flush();
      const level = h[1].length;
      const value = plainText(h[2]);
      if (level === 1) { docTitle = value; continue; }
      if (level === 2) {
        skipping = !internal && CONSULTANT_SECTION.test(value.replace(/^[A-Z]\.\s*|^\d+\.\s*/, ''));
        section = value;
        heading = value;
        if (!skipping) slides.push({ layout: 'section', number: String(++sectionNumber).padStart(2, '0'), title: value.slice(0, 60) });
        continue;
      }
      heading = value;
      continue;
    }
    if (skipping || !line.trim() || /^(---|\*\*\*)\s*$/.test(line)) { flush(); continue; }
    if (isTableRow(line)) {
      if (bullets.length) flush();
      if (!isSeparator(line)) table.push(cells(line));
      continue;
    }
    if (table.length) flush();
    const bullet = /^\s*([-*+]|\d+\.)\s+(.*)$/.exec(line);
    const quote = /^>\s?(.*)$/.exec(line);
    const value = plainText(bullet ? bullet[2] : quote ? quote[1] : line);
    if (value) bullets.push(value);
  }
  flush();

  return {
    slides: [
      { layout: 'title', client, project: docTitle, subtitle: 'The analysis, the sources and the reference chapters behind the closing deck', date },
      ...slides,
    ],
  };
}

const mdTable = (columns, rows) => [
  `| ${columns.join(' | ')} |`,
  `|${columns.map(() => '---').join('|')}|`,
  ...rows.map((r) => `| ${r.map((c) => String(c ?? '').replace(/\|/g, '/')).join(' | ')} |`),
].join('\n');

/**
 * The filled deck as Markdown, for the text download and for reading in a chat.
 *
 * @param {{ slides: Array<object> }} deck
 * @returns {string}
 */
export function deckToMarkdown(deck) {
  const out = [];
  for (const s of deck?.slides ?? []) {
    switch (s.layout) {
      case 'title':
        out.push(`# ${s.project} — ${s.client}`, '', [s.subtitle, s.consultant, s.date].filter(Boolean).join(' · '), '');
        break;
      case 'agenda':
        out.push(`## ${s.headline}`, '', ...arr(s.items).map((i, n) => `${n + 1}. ${i}`), '');
        break;
      case 'section':
        out.push(`## ${s.number} ${s.title}`, '', ...(s.kicker ? [s.kicker, ''] : []));
        break;
      case 'statement':
        out.push(`### ${s.headline}`, '', ...arr(s.support).map((b) => `- ${b}`), ...(s.evidence ? ['', `_Evidence: ${s.evidence}_`] : []), '');
        break;
      case 'bullets':
        out.push(`### ${s.headline}`, '', ...arr(s.bullets).map((b) => `- ${b}`), ...(s.footnote ? ['', `_${s.footnote}_`] : []), '');
        break;
      case 'two_column':
        out.push(`### ${s.headline}`, '', `**${s.left?.title}**`, ...arr(s.left?.bullets).map((b) => `- ${b}`), '', `**${s.right?.title}**`, ...arr(s.right?.bullets).map((b) => `- ${b}`), '');
        break;
      case 'kpis':
        out.push(`### ${s.headline}`, '', mdTable(['KPI', 'Today', 'Target', 'By when'], arr(s.cards).map((c) => [c.metric, c.baseline, c.target, c.horizon ?? ''])), '');
        break;
      case 'decision':
        out.push(`### ${s.topic} — ${s.decision}`, '', `**Question:** ${s.question}`, '',
          mdTable(['Option', 'Pros', 'Cons'], arr(s.options).map((o) => [`${o.chosen ? '**' : ''}${o.option}${o.chosen ? '** (chosen)' : ''}`, o.pros, o.cons])), '',
          `**Rationale:** ${s.rationale}`, '',
          [s.status && `Status: ${s.status}`, s.plan_impact && `Plan impact: ${s.plan_impact}`, s.evidence && `Evidence: ${s.evidence}`].filter(Boolean).join(' · '),
          ...(s.sources?.length ? ['', `Sources: ${s.sources.join(' · ')}`] : []), '');
        break;
      case 'problem_solution':
        out.push(`### ${s.shopify_answer}`, '', `**The problem:** ${s.problem}${s.evidence ? ` [${s.evidence}]` : ''}`, '',
          `**What it costs today:** ${s.cost_today}`, '', '**What changes**', ...arr(s.what_changes).map((b) => `- ${b}`),
          ...(s.measure ? ['', `**Measured by:** ${s.measure}`] : []),
          ...(s.sources?.length ? ['', `Sources: ${s.sources.join(' · ')}`] : []), '');
        break;
      case 'requirement':
        out.push(`### ${s.decision}`, '', `**Requirement:** ${s.requirement}${s.evidence ? ` [${s.evidence}]` : ''} · **Level:** ${s.level}`, '',
          `**What Shopify does as standard:** ${s.shopify_standard}`, '', `**Why this and not less:** ${s.why}`, '',
          '**What this covers**', ...arr(s.covers).map((b) => `- ${b}`), '',
          '**What it does not cover**', ...arr(s.not_covered).map((b) => `- ${b}`),
          ...(s.sources?.length ? ['', `Sources: ${s.sources.join(' · ')}`] : []), '');
        break;
      case 'app_case':
        out.push(`### ${s.app} — ${s.requirement}`, '', `**Why an app at all:** ${s.native_gap}`, '',
          '**What it covers**', ...arr(s.covers).map((b) => `- ${b}`), '',
          '**What it does not cover**', ...arr(s.not_covered).map((b) => `- ${b}`),
          ...(s.cost ? ['', `**Cost:** ${s.cost}`] : []),
          ...(arr(s.alternatives).length ? ['', '**Also considered**', ...arr(s.alternatives).map((a) => `- ${a.option} — ${a.why_not}`)] : []),
          ...(s.sources?.length ? ['', `Sources: ${s.sources.join(' · ')}`] : []), '');
        break;
      case 'gaps':
        out.push(`### ${s.headline}`, '', mdTable(['Requirement', 'Status', 'What it means', 'What we propose'],
          arr(s.items).map((i) => [i.requirement, i.status, i.consequence, i.option])), ...(s.footnote ? ['', `_${s.footnote}_`] : []), '');
        break;
      case 'architecture':
        out.push(`### ${s.headline}`, '', ...arr(s.layers).map((l) => `- **${l.name}:** ${arr(l.items).join(' · ')}`), ...(s.footnote ? ['', s.footnote] : []), '');
        break;
      case 'integration':
        out.push(`### ${s.system} — ${s.role}`, '', [s.pattern, s.direction, s.frequency].filter(Boolean).join(' · '), '',
          ...(s.apis?.length ? ['**Shopify side**', ...s.apis.map((a) => `- ${a}`), ''] : []),
          `**When it fails:** ${s.failure}`, ...(s.sources?.length ? ['', `Sources: ${s.sources.join(' · ')}`] : []), '');
        break;
      case 'data_model':
        out.push(`### ${s.headline}`, '', mdTable(['Object', 'Kind', 'Name', 'Purpose', 'Written by'],
          arr(s.entries).map((e) => [e.object, e.kind, e.name, e.purpose, e.source])),
          ...(arr(s.not_modelled).length ? ['', '**What Shopify cannot model**', ...s.not_modelled.map((n) => `- ${n}`)] : []), '');
        break;
      case 'migration':
        out.push(`### ${s.headline}`, '', mdTable(['Data', 'Volume', 'How it moves'], arr(s.moves).map((m) => [m.data, m.volume ?? '', m.how])), '',
          '**What does not move**', ...arr(s.does_not_move).map((n) => `- ${n}`), '',
          '**Cut-over**', ...arr(s.cutover).map((c, i) => `${i + 1}. ${c}`), '');
        break;
      case 'nfr':
        out.push(`### ${s.headline}`, '', mdTable(['Area', 'Target', 'How we meet it', 'How it is verified'],
          arr(s.items).map((i) => [i.area, i.target, i.approach, i.verified])), '');
        break;
      case 'open_decisions':
        out.push(`### ${s.headline}`, '', mdTable(['Decision', 'Owner', 'Needed by', 'If it slips'],
          arr(s.decisions).map((d) => [d.decision, d.owner, d.needed_by, d.if_late])), '');
        break;
      case 'out_of_scope':
        out.push(`### ${s.headline}`, '', ...(arr(s.later_phases).length ? ['**Later phases**', ...s.later_phases.map((b) => `- ${b}`), ''] : []),
          '**Not included**', ...arr(s.exclusions).map((b) => `- ${b}`), '');
        break;
      case 'operating_model':
        out.push(`### ${s.headline}`, '', mdTable(['Area', 'Client', 'Merkle'], arr(s.responsibilities).map((r) => [r.area, r.client, r.merkle])),
          ...(arr(s.enablement).length ? ['', '**Handover and enablement**', ...s.enablement.map((e) => `- ${e}`)] : []),
          ...(s.support ? ['', `**Support model:** ${s.support}`] : []), '');
        break;
      case 'run_cost':
        out.push(`### ${s.headline}`, '', mdTable(['Item', 'Cost', 'Period', 'Note'], arr(s.items).map((i) => [i.item, i.cost, i.period, i.note ?? ''])),
          ...(s.total ? ['', `**Known monthly total:** ${s.total}`] : []), '');
        break;
      case 'ai_commerce':
        out.push(`### ${s.headline}`, '', `**Where you stand today:** ${s.today}`, '',
          '**What you must decide**', ...arr(s.decisions).map((d) => `- ${d}`),
          ...(arr(s.readiness).length ? ['', '**What has to be ready**', ...s.readiness.map((r) => `- ${r}`)] : []), '');
        break;
      case 'conclusion':
        out.push(`## ${s.headline}`, '', '**What it delivers**', ...arr(s.delivers).map((b) => `- ${b}`), '',
          ...(arr(s.limits).length ? ['**What it does not solve**', ...s.limits.map((b) => `- ${b}`), ''] : []),
          '**What we need from you**', ...arr(s.ask).map((b) => `- ${b}`), '');
        break;
      case 'table':
        out.push(`### ${s.headline}`, '', mdTable(s.columns ?? [], s.rows ?? []), ...(s.footnote ? ['', `_${s.footnote}_`] : []), '');
        break;
      case 'risks':
        out.push(`### ${s.headline}`, '', mdTable(['Risk', 'Likelihood', 'Impact', 'Mitigation', 'Owner', 'Evidence'],
          arr(s.risks).map((r) => [r.risk, r.likelihood, r.impact, r.mitigation, r.owner, r.evidence ?? ''])), '');
        break;
      case 'roadmap':
        out.push(`### ${s.headline}`, '', ...arr(s.phases).flatMap((p) => [`**${p.name}**${p.timing ? ` — ${p.timing}` : ''}`, ...arr(p.items).map((i) => `- ${i}`), '']));
        break;
      case 'split':
        out.push(`### ${s.headline}`, '', mdTable(['Share', 'Value', 'Percent'], arr(s.segments).map((g) => [g.label, g.value, `${g.percent}%`])), ...(s.footnote ? ['', s.footnote] : []), '');
        break;
      case 'next_steps':
        out.push(`### ${s.headline}`, '', '**Merkle**', ...arr(s.merkle).map((b) => `- ${b}`), '', '**Client**', ...arr(s.client).map((b) => `- ${b}`), ...(s.dates ? ['', s.dates] : []), '');
        break;
      case 'investment':
        out.push(`### ${s.headline}`, '', `**${s.offer}** — ${s.band}`, ...(s.note ? ['', s.note] : []), ...(s.recurring?.length ? ['', '**Recurring, billed by third parties**', ...s.recurring.map((r) => `- ${r}`)] : []), '');
        break;
      default:
        break;
    }
  }
  return `${out.join('\n').trim()}\n`;
}
