/**
 * @file deck-render.js
 * @description Renders the filled deck templates as a PowerPoint in Merkle's
 * styling: black statement slides, white working slides, red accents, one message
 * per slide. Code owns every layout, so two engagements produce decks of the same
 * standard (owner decision 2026-09-17).
 *
 * @module discovery/service/deck-render
 */

import PptxGenJS from 'pptxgenjs';

const BLACK = '000000';
const INK = '0A1540';
const NAVY = '040E4B';
const RED = 'DD3039';
const MUTED = '60607D';
const LINE = 'D6D6DF';
const PANEL = 'F2F2F4';
const FONT = 'Arial';

const W = 13.333;
const H = 7.5;
const MARGIN = 0.75;
const BODY_W = W - MARGIN * 2;

const text = (s) => String(s ?? '').trim();
const RATING = { low: 1, medium: 2, high: 3 };

/** Headline block shared by every working slide. */
function headline(slide, message, kicker) {
  slide.addShape('rect', { x: MARGIN, y: 0.62, w: 0.55, h: 0.055, fill: { color: RED } });
  slide.addText(text(message), {
    x: MARGIN, y: 0.82, w: BODY_W, h: 0.9, fontFace: FONT, fontSize: 22, bold: true, color: INK, valign: 'top', lineSpacingMultiple: 1.05,
  });
  if (kicker) slide.addText(text(kicker), { x: MARGIN, y: 1.72, w: BODY_W, h: 0.35, fontFace: FONT, fontSize: 12, color: MUTED });
}

function footnote(slide, note) {
  if (!text(note)) return;
  slide.addText(text(note), { x: MARGIN, y: H - 0.85, w: BODY_W, h: 0.35, fontFace: FONT, fontSize: 9, color: MUTED });
}

/** A table with Merkle's header band and readable rows. */
function table(slide, columns, rows, { y = 2.1, colW, fontSize = 11 } = {}) {
  const header = columns.map((c) => ({ text: text(c), options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, fontSize: fontSize - 1 } }));
  const body = rows.map((row, i) => row.map((cell) => ({
    text: text(cell),
    options: { fontSize, color: INK, fill: { color: i % 2 ? PANEL : 'FFFFFF' }, valign: 'top' },
  })));
  slide.addTable([header, ...body], {
    x: MARGIN, y, w: BODY_W, colW, fontFace: FONT, border: { type: 'solid', pt: 0.5, color: LINE },
    autoPage: false, valign: 'top', margin: 6,
  });
}

const LAYOUT_RENDERERS = {
  title(slide, s) {
    slide.background = { color: BLACK };
    slide.addShape('rect', { x: MARGIN, y: 2.55, w: 0.7, h: 0.07, fill: { color: RED } });
    slide.addText(text(s.project), { x: MARGIN, y: 2.75, w: BODY_W, h: 0.9, fontFace: FONT, fontSize: 40, bold: true, color: 'FFFFFF' });
    slide.addText(text(s.client), { x: MARGIN, y: 3.7, w: BODY_W, h: 0.5, fontFace: FONT, fontSize: 20, color: 'FFFFFF' });
    slide.addText(text(s.subtitle), { x: MARGIN, y: 4.3, w: BODY_W * 0.72, h: 0.8, fontFace: FONT, fontSize: 14, color: 'C9C9D6' });
    slide.addText([s.consultant, s.date].filter(Boolean).map(text).join(' · '), { x: MARGIN, y: H - 1.2, w: BODY_W, h: 0.3, fontFace: FONT, fontSize: 11, color: '8888A1' });
    slide.addText('Confidential — prepared for the client', { x: MARGIN, y: H - 0.9, w: BODY_W, h: 0.3, fontFace: FONT, fontSize: 9, color: '60607D' });
  },

  agenda(slide, s) {
    headline(slide, s.headline);
    const items = s.items ?? [];
    const half = Math.ceil(items.length / 2);
    [items.slice(0, half), items.slice(half)].forEach((column, c) => {
      column.forEach((item, i) => {
        const y = 2.2 + i * 0.52;
        const x = MARGIN + c * (BODY_W / 2);
        slide.addText(String(half * c + i + 1).padStart(2, '0'), { x, y, w: 0.5, h: 0.4, fontFace: FONT, fontSize: 13, bold: true, color: RED });
        slide.addText(text(item), { x: x + 0.5, y, w: BODY_W / 2 - 0.7, h: 0.4, fontFace: FONT, fontSize: 13, color: INK });
      });
    });
  },

  section(slide, s) {
    slide.background = { color: BLACK };
    slide.addText(text(s.number), { x: MARGIN, y: 2.7, w: 2, h: 0.6, fontFace: FONT, fontSize: 16, bold: true, color: RED });
    slide.addText(text(s.title), { x: MARGIN, y: 3.2, w: BODY_W, h: 1, fontFace: FONT, fontSize: 34, bold: true, color: 'FFFFFF' });
    if (s.kicker) slide.addText(text(s.kicker), { x: MARGIN, y: 4.25, w: BODY_W * 0.7, h: 0.6, fontFace: FONT, fontSize: 14, color: 'C9C9D6' });
  },

  statement(slide, s) {
    slide.background = { color: BLACK };
    slide.addShape('rect', { x: MARGIN, y: 1.9, w: 0.7, h: 0.07, fill: { color: RED } });
    slide.addText(text(s.headline), { x: MARGIN, y: 2.15, w: BODY_W * 0.86, h: 1.8, fontFace: FONT, fontSize: 28, bold: true, color: 'FFFFFF', valign: 'top', lineSpacingMultiple: 1.1 });
    (s.support ?? []).forEach((line, i) => {
      slide.addText(text(line), { x: MARGIN, y: 4.15 + i * 0.45, w: BODY_W * 0.8, h: 0.4, fontFace: FONT, fontSize: 13, color: 'C9C9D6', bullet: { code: '25AA' } });
    });
    if (s.evidence) slide.addText(text(s.evidence), { x: MARGIN, y: H - 0.9, w: BODY_W, h: 0.3, fontFace: FONT, fontSize: 9, color: '8888A1' });
  },

  bullets(slide, s) {
    headline(slide, s.headline);
    slide.addText((s.bullets ?? []).map((b) => ({ text: text(b), options: { bullet: { code: '25AA' }, breakLine: true } })), {
      x: MARGIN, y: 2.15, w: BODY_W, h: H - 3.2, fontFace: FONT, fontSize: 14, color: INK, lineSpacingMultiple: 1.35, valign: 'top',
    });
    footnote(slide, s.footnote);
  },

  two_column(slide, s) {
    headline(slide, s.headline);
    const colW = (BODY_W - 0.4) / 2;
    [[s.left, MARGIN], [s.right, MARGIN + colW + 0.4]].forEach(([col, x], i) => {
      slide.addShape('rect', { x, y: 2.15, w: colW, h: H - 3.3, fill: { color: i ? PANEL : 'FFFFFF' }, line: { color: LINE, pt: 1 } });
      slide.addText(text(col?.title), { x: x + 0.25, y: 2.35, w: colW - 0.5, h: 0.4, fontFace: FONT, fontSize: 14, bold: true, color: i ? INK : NAVY });
      slide.addText((col?.bullets ?? []).map((b) => ({ text: text(b), options: { bullet: { code: '25AA' }, breakLine: true } })), {
        x: x + 0.25, y: 2.85, w: colW - 0.5, h: H - 4.1, fontFace: FONT, fontSize: 12, color: INK, lineSpacingMultiple: 1.3, valign: 'top',
      });
    });
    footnote(slide, s.footnote);
  },

  kpis(slide, s) {
    headline(slide, s.headline);
    const cards = s.cards ?? [];
    const gap = 0.3;
    const cardW = (BODY_W - gap * (cards.length - 1)) / Math.max(cards.length, 1);
    cards.forEach((card, i) => {
      const x = MARGIN + i * (cardW + gap);
      slide.addShape('rect', { x, y: 2.3, w: cardW, h: 2.2, fill: { color: PANEL } });
      slide.addShape('rect', { x, y: 2.3, w: cardW, h: 0.06, fill: { color: RED } });
      slide.addText(text(card.metric), { x: x + 0.2, y: 2.5, w: cardW - 0.4, h: 0.6, fontFace: FONT, fontSize: 12, color: MUTED, valign: 'top' });
      slide.addText(`${text(card.baseline)} → ${text(card.target)}`, { x: x + 0.2, y: 3.15, w: cardW - 0.4, h: 0.6, fontFace: FONT, fontSize: 19, bold: true, color: INK });
      if (card.horizon) slide.addText(text(card.horizon), { x: x + 0.2, y: 3.85, w: cardW - 0.4, h: 0.4, fontFace: FONT, fontSize: 11, color: MUTED });
    });
    footnote(slide, s.footnote);
  },

  decision(slide, s) {
    headline(slide, s.decision, `${text(s.topic)} — ${text(s.question)}`);
    const options = s.options ?? [];
    table(slide, ['Option', 'Pros', 'Cons'], options.map((o) => [
      `${o.chosen ? '✓ ' : ''}${text(o.option)}`, text(o.pros), text(o.cons),
    ]), { y: 2.25, colW: [3.2, 4.3, 4.3], fontSize: 10.5 });
    const y = Math.min(2.25 + 0.9 + options.length * 0.75, H - 2.1);
    slide.addShape('rect', { x: MARGIN, y, w: BODY_W, h: 1.15, fill: { color: PANEL } });
    slide.addShape('rect', { x: MARGIN, y, w: 0.06, h: 1.15, fill: { color: RED } });
    slide.addText(text(s.rationale), { x: MARGIN + 0.25, y: y + 0.12, w: BODY_W - 0.5, h: 0.6, fontFace: FONT, fontSize: 11.5, color: INK, valign: 'top' });
    slide.addText([s.status && `Status: ${text(s.status)}`, s.plan_impact && `Plan impact: ${text(s.plan_impact)}`, s.evidence && `Evidence: ${text(s.evidence)}`].filter(Boolean).join('   ·   '), {
      x: MARGIN + 0.25, y: y + 0.75, w: BODY_W - 0.5, h: 0.3, fontFace: FONT, fontSize: 10, bold: true, color: NAVY,
    });
    footnote(slide, (s.sources ?? []).join('  ·  '));
  },

  table(slide, s) {
    headline(slide, s.headline);
    table(slide, s.columns ?? [], s.rows ?? []);
    footnote(slide, s.footnote);
  },

  risks(slide, s) {
    headline(slide, s.headline);
    const risks = s.risks ?? [];
    table(slide, ['Risk', 'Likelihood', 'Impact', 'Mitigation', 'Owner'], risks.map((r) => [
      text(r.risk), text(r.likelihood), text(r.impact), text(r.mitigation), text(r.owner),
    ]), { y: 2.15, colW: [4.2, 1.15, 1.05, 4.3, 1.13], fontSize: 10 });
    const top = risks.filter((r) => RATING[String(r.impact).toLowerCase()] === 3 && RATING[String(r.likelihood).toLowerCase()] >= 2).length;
    if (top) {
      slide.addText(`${top} risk${top > 1 ? 's' : ''} rated high impact and at least medium likelihood`, {
        x: MARGIN, y: H - 1.2, w: BODY_W, h: 0.3, fontFace: FONT, fontSize: 11, bold: true, color: RED,
      });
    }
    footnote(slide, s.footnote);
  },

  roadmap(slide, s) {
    headline(slide, s.headline);
    const phases = s.phases ?? [];
    const gap = 0.25;
    const colW = (BODY_W - gap * (phases.length - 1)) / Math.max(phases.length, 1);
    phases.forEach((phase, i) => {
      const x = MARGIN + i * (colW + gap);
      slide.addShape('rect', { x, y: 2.25, w: colW, h: 0.62, fill: { color: i === 0 ? NAVY : PANEL } });
      slide.addText(text(phase.name), { x: x + 0.15, y: 2.32, w: colW - 0.3, h: 0.3, fontFace: FONT, fontSize: 12, bold: true, color: i === 0 ? 'FFFFFF' : INK });
      if (phase.timing) slide.addText(text(phase.timing), { x: x + 0.15, y: 2.6, w: colW - 0.3, h: 0.25, fontFace: FONT, fontSize: 9.5, color: i === 0 ? 'C9C9D6' : MUTED });
      slide.addText((phase.items ?? []).map((item) => ({ text: text(item), options: { bullet: { code: '25AA' }, breakLine: true } })), {
        x: x + 0.1, y: 3.0, w: colW - 0.2, h: 2.6, fontFace: FONT, fontSize: 10.5, color: INK, valign: 'top', lineSpacingMultiple: 1.25,
      });
    });
    slide.addShape('line', { x: MARGIN, y: 2.18, w: BODY_W, h: 0, line: { color: LINE, pt: 1 } });
    footnote(slide, s.footnote);
  },

  split(slide, s) {
    headline(slide, s.headline);
    const segments = s.segments ?? [];
    let x = MARGIN;
    const colours = [NAVY, '41547D', RED, MUTED];
    segments.forEach((seg, i) => {
      const w = (BODY_W * Math.max(Number(seg.percent) || 0, 2)) / 100;
      slide.addShape('rect', { x, y: 2.3, w, h: 0.85, fill: { color: colours[i % colours.length] } });
      slide.addText(`${Math.round(Number(seg.percent) || 0)}%`, { x, y: 2.45, w, h: 0.5, fontFace: FONT, fontSize: 16, bold: true, color: 'FFFFFF', align: 'center' });
      x += w;
    });
    segments.forEach((seg, i) => {
      const y = 3.55 + i * 0.5;
      slide.addShape('rect', { x: MARGIN, y: y + 0.07, w: 0.22, h: 0.22, fill: { color: colours[i % colours.length] } });
      slide.addText(`${text(seg.label)} — ${text(seg.value)}`, { x: MARGIN + 0.35, y, w: BODY_W - 0.5, h: 0.35, fontFace: FONT, fontSize: 12.5, color: INK });
    });
    footnote(slide, s.footnote);
  },

  next_steps(slide, s) {
    headline(slide, s.headline);
    const colW = (BODY_W - 0.4) / 2;
    [['Merkle', s.merkle ?? [], MARGIN, NAVY], ['Client', s.client ?? [], MARGIN + colW + 0.4, RED]].forEach(([title, items, x, colour]) => {
      slide.addShape('rect', { x, y: 2.15, w: colW, h: 0.5, fill: { color: colour } });
      slide.addText(String(title), { x: x + 0.2, y: 2.22, w: colW - 0.4, h: 0.35, fontFace: FONT, fontSize: 13, bold: true, color: 'FFFFFF' });
      slide.addText(items.map((b) => ({ text: text(b), options: { bullet: { code: '25AA' }, breakLine: true } })), {
        x: x + 0.2, y: 2.8, w: colW - 0.4, h: 2.9, fontFace: FONT, fontSize: 12, color: INK, valign: 'top', lineSpacingMultiple: 1.3,
      });
    });
    if (s.dates) {
      slide.addShape('rect', { x: MARGIN, y: H - 1.45, w: BODY_W, h: 0.5, fill: { color: PANEL } });
      slide.addText(text(s.dates), { x: MARGIN + 0.2, y: H - 1.37, w: BODY_W - 0.4, h: 0.35, fontFace: FONT, fontSize: 12, bold: true, color: INK });
    }
  },

  investment(slide, s) {
    headline(slide, s.headline);
    slide.addShape('rect', { x: MARGIN, y: 2.3, w: BODY_W * 0.52, h: 1.7, fill: { color: BLACK } });
    slide.addText(text(s.offer), { x: MARGIN + 0.3, y: 2.5, w: BODY_W * 0.46, h: 0.4, fontFace: FONT, fontSize: 13, color: 'C9C9D6' });
    slide.addText(text(s.band), { x: MARGIN + 0.3, y: 2.95, w: BODY_W * 0.46, h: 0.8, fontFace: FONT, fontSize: 28, bold: true, color: 'FFFFFF' });
    if (s.note) slide.addText(text(s.note), { x: MARGIN, y: 4.15, w: BODY_W * 0.52, h: 0.7, fontFace: FONT, fontSize: 11, color: MUTED, valign: 'top' });
    const x = MARGIN + BODY_W * 0.56;
    slide.addText('Recurring, billed by third parties', { x, y: 2.3, w: BODY_W * 0.44, h: 0.35, fontFace: FONT, fontSize: 12, bold: true, color: NAVY });
    slide.addText((s.recurring ?? []).map((r) => ({ text: text(r), options: { bullet: { code: '25AA' }, breakLine: true } })), {
      x, y: 2.75, w: BODY_W * 0.44, h: 2.2, fontFace: FONT, fontSize: 11.5, color: INK, valign: 'top', lineSpacingMultiple: 1.3,
    });
  },
};

/**
 * Render the filled deck as a PowerPoint file.
 *
 * @param {{ slides: Array<object> }} deck
 * @param {{ client: string, version?: string, internal?: boolean }} options
 * @returns {Promise<Buffer>}
 */
export async function renderDeckPptx(deck, { client, version = '', internal = false }) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Merkle';
  pptx.company = 'Merkle';
  pptx.title = `Discovery Closing Document — ${client}`;

  const footer = [client, version && `v${version}`, internal ? 'Lead Consultant draft — internal notes included' : 'Confidential'].filter(Boolean).join('  ·  ');
  pptx.defineSlideMaster({
    title: 'MERKLE',
    background: { color: 'FFFFFF' },
    objects: [
      { text: { text: footer, options: { x: MARGIN, y: H - 0.5, w: BODY_W - 1, h: 0.3, fontFace: FONT, fontSize: 8.5, color: MUTED } } },
    ],
    slideNumber: { x: W - 1.0, y: H - 0.5, fontFace: FONT, fontSize: 8.5, color: MUTED },
  });

  for (const spec of deck.slides ?? []) {
    const render = LAYOUT_RENDERERS[spec.layout];
    if (!render) continue;
    const dark = spec.layout === 'title' || spec.layout === 'section' || spec.layout === 'statement';
    const slide = pptx.addSlide(dark ? undefined : { masterName: 'MERKLE' });
    render(slide, spec);
  }
  const out = await pptx.write({ outputType: 'nodebuffer' });
  return Buffer.isBuffer(out) ? out : Buffer.from(out);
}

export { LAYOUT_RENDERERS };
