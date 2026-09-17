/**
 * @file pptx.js
 * @description Bridges Markdown and the deck templates: the annex document
 * becomes deck slides, and a filled deck becomes Markdown for the text download.
 * The deck itself is written by Claude as filled templates (`deck-template.js`)
 * and rendered by `deck-render.js`.
 *
 * @module discovery/service/pptx
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
        out.push(`## ${s.headline}`, '', ...(s.items ?? []).map((i, n) => `${n + 1}. ${i}`), '');
        break;
      case 'section':
        out.push(`## ${s.number} ${s.title}`, '', ...(s.kicker ? [s.kicker, ''] : []));
        break;
      case 'statement':
        out.push(`### ${s.headline}`, '', ...(s.support ?? []).map((b) => `- ${b}`), ...(s.evidence ? ['', `_Evidence: ${s.evidence}_`] : []), '');
        break;
      case 'bullets':
        out.push(`### ${s.headline}`, '', ...(s.bullets ?? []).map((b) => `- ${b}`), ...(s.footnote ? ['', `_${s.footnote}_`] : []), '');
        break;
      case 'two_column':
        out.push(`### ${s.headline}`, '', `**${s.left?.title}**`, ...(s.left?.bullets ?? []).map((b) => `- ${b}`), '', `**${s.right?.title}**`, ...(s.right?.bullets ?? []).map((b) => `- ${b}`), '');
        break;
      case 'kpis':
        out.push(`### ${s.headline}`, '', mdTable(['KPI', 'Today', 'Target', 'By when'], (s.cards ?? []).map((c) => [c.metric, c.baseline, c.target, c.horizon ?? ''])), '');
        break;
      case 'decision':
        out.push(`### ${s.topic} — ${s.decision}`, '', `**Question:** ${s.question}`, '',
          mdTable(['Option', 'Pros', 'Cons'], (s.options ?? []).map((o) => [`${o.chosen ? '**' : ''}${o.option}${o.chosen ? '** (chosen)' : ''}`, o.pros, o.cons])), '',
          `**Rationale:** ${s.rationale}`, '',
          [s.status && `Status: ${s.status}`, s.plan_impact && `Plan impact: ${s.plan_impact}`, s.evidence && `Evidence: ${s.evidence}`].filter(Boolean).join(' · '),
          ...(s.sources?.length ? ['', `Sources: ${s.sources.join(' · ')}`] : []), '');
        break;
      case 'table':
        out.push(`### ${s.headline}`, '', mdTable(s.columns ?? [], s.rows ?? []), ...(s.footnote ? ['', `_${s.footnote}_`] : []), '');
        break;
      case 'risks':
        out.push(`### ${s.headline}`, '', mdTable(['Risk', 'Likelihood', 'Impact', 'Mitigation', 'Owner', 'Evidence'],
          (s.risks ?? []).map((r) => [r.risk, r.likelihood, r.impact, r.mitigation, r.owner, r.evidence ?? ''])), '');
        break;
      case 'roadmap':
        out.push(`### ${s.headline}`, '', ...(s.phases ?? []).flatMap((p) => [`**${p.name}**${p.timing ? ` — ${p.timing}` : ''}`, ...(p.items ?? []).map((i) => `- ${i}`), '']));
        break;
      case 'split':
        out.push(`### ${s.headline}`, '', mdTable(['Share', 'Value', 'Percent'], (s.segments ?? []).map((g) => [g.label, g.value, `${g.percent}%`])), ...(s.footnote ? ['', s.footnote] : []), '');
        break;
      case 'next_steps':
        out.push(`### ${s.headline}`, '', '**Merkle**', ...(s.merkle ?? []).map((b) => `- ${b}`), '', '**Client**', ...(s.client ?? []).map((b) => `- ${b}`), ...(s.dates ? ['', s.dates] : []), '');
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
