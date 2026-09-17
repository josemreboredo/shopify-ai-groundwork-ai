/**
 * @file pptx.js
 * @description The saved Discovery Closing Document (Markdown) as a PowerPoint
 * deck: `slidesFromMarkdown` turns the document into a slide model (pure, tested),
 * `closingDocumentPptx` renders that model with pptxgenjs. The client version
 * stops before "Consultant notes" (ADR 0010: internal content is section 18).
 *
 * @module discovery/service/pptx
 */


const BULLETS_PER_SLIDE = 7;
const ROWS_PER_SLIDE = 9;
const CONSULTANT_SECTION = /^consultant notes/i;
/** Long reference material belongs in the annex document, not in the deck. */
const ANNEX_SECTION = /^(appendix|annex|references|bibliography|sources)\b/i;

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

/** Chunk an array into slices of at most `size`. */
const chunk = (items, size) => items.reduce((out, item, i) => (i % size ? out[out.length - 1].push(item) : out.push([item]), out), []);

/**
 * Slide model for the closing document.
 *
 * @param {string} markdown  The saved document
 * @param {{ internal?: boolean, annex?: boolean }} [options]  internal: keep the Consultant
 *   notes section · annex: keep appendices, references and bibliography
 * @returns {{ title: string, subtitle: string[], slides: Array<object> }}
 */
export function slidesFromMarkdown(markdown, { internal = false, annex = false } = {}) {
  const lines = String(markdown ?? '').split('\n');
  let title = '';
  const subtitle = [];
  /** @type {Array<object>} */
  const slides = [];
  let section = '';
  let heading = '';
  /** @type {string[]} */
  let bullets = [];
  /** @type {string[][]} */
  let table = [];
  let skipping = false;
  let inCode = false;
  /** @type {string[]} */
  let code = [];

  const flush = () => {
    if (bullets.length) {
      for (const part of chunk(bullets, BULLETS_PER_SLIDE)) slides.push({ kind: 'bullets', section, heading, bullets: part });
      bullets = [];
    }
    if (table.length > 1) {
      const [header, ...rows] = table;
      const parts = chunk(rows, ROWS_PER_SLIDE);
      parts.forEach((part, i) => slides.push({ kind: 'table', section, heading: parts.length > 1 ? `${heading} (${i + 1}/${parts.length})` : heading, header, rows: part }));
    }
    table = [];
    if (code.length) {
      slides.push({ kind: 'code', section, heading, lines: code });
      code = [];
    }
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (/^```/.test(line)) {
      if (inCode) flush();
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      if (!skipping) code.push(raw);
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      flush();
      const level = h[1].length;
      const text = plainText(h[2]);
      if (level === 1) {
        title = text;
        continue;
      }
      if (level === 2) {
        const name = text.replace(/^\d+\.\s*/, '');
        skipping = (!internal && CONSULTANT_SECTION.test(name)) || (!annex && ANNEX_SECTION.test(name));
        section = text;
        heading = text;
        if (!skipping) slides.push({ kind: 'section', section, heading: text });
        continue;
      }
      heading = text;
      if (!skipping) slides.push({ kind: 'heading', section, heading: text });
      continue;
    }
    if (skipping) continue;
    if (!line.trim()) {
      flush();
      continue;
    }
    if (/^(---|\*\*\*)\s*$/.test(line)) {
      flush();
      continue;
    }
    if (isTableRow(line)) {
      if (bullets.length) flush();
      if (!isSeparator(line)) table.push(cells(line));
      continue;
    }
    if (table.length) flush();
    const bullet = /^\s*([-*+]|\d+\.)\s+(.*)$/.exec(line);
    const quote = /^>\s?(.*)$/.exec(line);
    const text = plainText(bullet ? bullet[2] : quote ? quote[1] : line);
    if (!text) continue;
    if (!section && !bullet && !quote) {
      subtitle.push(text);
      continue;
    }
    bullets.push(text);
  }
  flush();
  // A heading slide is only kept when nothing else carries that heading (content slides repeat it in their header).
  const withContent = new Set(slides.filter((s) => s.kind !== 'heading' && s.kind !== 'section').map((s) => s.heading));
  return { title, subtitle, slides: slides.filter((s) => s.kind !== 'heading' || !withContent.has(s.heading)) };
}

const INK = '1D1D1F';
const MUTED = '6B6B73';
const ACCENT = '0B57D0';
const LINE = 'E3E3E8';

/**
 * Render the closing document as a PowerPoint file.
 *
 * @param {string} markdown
 * @param {{ client: string, internal?: boolean, annex?: boolean, date?: string }} options
 * @returns {Promise<Buffer>}
 */
export async function closingDocumentPptx(markdown, { client, internal = false, annex = false, date = '' }) {
  const { default: PptxGenJS } = await import('pptxgenjs');
  const model = slidesFromMarkdown(markdown, { internal, annex });
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Merkle';
  pptx.company = 'Merkle';
  pptx.title = model.title || `Discovery Closing Document — ${client}`;

  const footer = [client, date, internal ? 'Lead Consultant draft — contains internal notes' : 'Confidential'].filter(Boolean).join(' · ');
  pptx.defineSlideMaster({
    title: 'MERKLE',
    background: { color: 'FFFFFF' },
    objects: [
      { rect: { x: 0, y: 5.05, w: '100%', h: 0.02, fill: { color: LINE } } },
      { text: { text: footer, options: { x: 0.5, y: 5.1, w: 8, h: 0.3, fontSize: 9, color: MUTED } } },
    ],
    slideNumber: { x: 9.2, y: 5.1, fontSize: 9, color: MUTED },
  });

  const title = pptx.addSlide();
  title.addText(model.title || `Discovery Closing Document — ${client}`, { x: 0.6, y: 1.6, w: 8.8, h: 1.0, fontSize: 32, bold: true, color: INK });
  if (model.subtitle.length) {
    title.addText(model.subtitle.slice(0, 3).join('\n'), { x: 0.6, y: 2.7, w: 8.8, h: 1.2, fontSize: 14, color: MUTED });
  }
  title.addShape('rect', { x: 0.6, y: 1.35, w: 1.2, h: 0.08, fill: { color: ACCENT } });

  const head = (slide, s) => {
    slide.addText(s.heading, { x: 0.5, y: 0.35, w: 9, h: 0.6, fontSize: 20, bold: true, color: INK });
    if (s.section && s.section !== s.heading) {
      slide.addText(s.section, { x: 0.5, y: 0.12, w: 9, h: 0.25, fontSize: 10, color: ACCENT });
    }
  };

  for (const s of model.slides) {
    const slide = pptx.addSlide({ masterName: 'MERKLE' });
    if (s.kind === 'section') {
      slide.addShape('rect', { x: 0.5, y: 2.1, w: 1.2, h: 0.08, fill: { color: ACCENT } });
      slide.addText(s.heading, { x: 0.5, y: 2.3, w: 9, h: 0.9, fontSize: 26, bold: true, color: INK });
      continue;
    }
    head(slide, s);
    if (s.kind === 'bullets') {
      slide.addText(s.bullets.map((t) => ({ text: t, options: { bullet: true, breakLine: true } })), {
        x: 0.5, y: 1.1, w: 9, h: 3.7, fontSize: 13, color: INK, lineSpacingMultiple: 1.2, shrinkText: true,
      });
    } else if (s.kind === 'table') {
      const header = s.header.map((t) => ({ text: t, options: { bold: true, color: MUTED, fontSize: 10 } }));
      const rows = s.rows.map((r) => r.map((t) => ({ text: t, options: { fontSize: 10, color: INK } })));
      slide.addTable([header, ...rows], {
        x: 0.4, y: 1.1, w: 9.2, colW: undefined, border: { type: 'solid', color: LINE, pt: 0.5 },
        autoPage: false, fontSize: 10, valign: 'top',
      });
    } else if (s.kind === 'code') {
      slide.addText(s.lines.join('\n'), { x: 0.5, y: 1.1, w: 9, h: 3.7, fontSize: 9, fontFace: 'Courier New', color: INK, shrinkText: true });
    }
  }
  const out = await pptx.write({ outputType: 'nodebuffer' });
  return Buffer.isBuffer(out) ? out : Buffer.from(out);
}
