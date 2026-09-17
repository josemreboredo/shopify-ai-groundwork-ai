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
const arr = (value) => (Array.isArray(value) ? value : value === undefined || value === null || value === '' ? [] : [value]);
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
    const items = arr(s.items);
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
    arr(s.support).forEach((line, i) => {
      slide.addText(text(line), { x: MARGIN, y: 4.15 + i * 0.45, w: BODY_W * 0.8, h: 0.4, fontFace: FONT, fontSize: 13, color: 'C9C9D6', bullet: { code: '25AA' } });
    });
    if (s.evidence) slide.addText(text(s.evidence), { x: MARGIN, y: H - 0.9, w: BODY_W, h: 0.3, fontFace: FONT, fontSize: 9, color: '8888A1' });
  },

  bullets(slide, s) {
    headline(slide, s.headline);
    slide.addText(arr(s.bullets).map((b) => ({ text: text(b), options: { bullet: { code: '25AA' }, breakLine: true } })), {
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
      slide.addText(arr(col?.bullets).map((b) => ({ text: text(b), options: { bullet: { code: '25AA' }, breakLine: true } })), {
        x: x + 0.25, y: 2.85, w: colW - 0.5, h: H - 4.1, fontFace: FONT, fontSize: 12, color: INK, lineSpacingMultiple: 1.3, valign: 'top',
      });
    });
    footnote(slide, s.footnote);
  },

  kpis(slide, s) {
    headline(slide, s.headline);
    const cards = arr(s.cards);
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
    const options = arr(s.options);
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
    footnote(slide, arr(s.sources).join('  ·  '));
  },

  problem_solution(slide, s) {
    headline(slide, s.shopify_answer, `${text(s.problem)}${s.evidence ? `   ·   ${text(s.evidence)}` : ''}`);
    slide.addShape('rect', { x: MARGIN, y: 2.15, w: BODY_W, h: 0.8, fill: { color: BLACK } });
    slide.addText('WHAT IT COSTS TODAY', { x: MARGIN + 0.25, y: 2.24, w: 3, h: 0.24, fontFace: FONT, fontSize: 9, bold: true, color: 'C9C9D6' });
    slide.addText(text(s.cost_today), { x: MARGIN + 0.25, y: 2.48, w: BODY_W - 0.5, h: 0.42, fontFace: FONT, fontSize: 13, color: 'FFFFFF', valign: 'top' });
    slide.addShape('rect', { x: MARGIN, y: 3.25, w: BODY_W, h: 1.75, fill: { color: PANEL } });
    slide.addText('WHAT CHANGES', { x: MARGIN + 0.25, y: 3.38, w: 3, h: 0.24, fontFace: FONT, fontSize: 9, bold: true, color: MUTED });
    slide.addText(arr(s.what_changes).map((b) => ({ text: text(b), options: { bullet: { code: '25AA' }, breakLine: true } })), {
      x: MARGIN + 0.25, y: 3.66, w: BODY_W - 0.5, h: 1.2, fontFace: FONT, fontSize: 12.5, color: INK, valign: 'top', lineSpacingMultiple: 1.25,
    });
    if (s.measure) {
      slide.addShape('rect', { x: MARGIN, y: 5.2, w: BODY_W, h: 0.55, fill: { color: 'FFFFFF' }, line: { color: RED, pt: 1.2 } });
      slide.addText(`Measured by: ${text(s.measure)}`, { x: MARGIN + 0.25, y: 5.3, w: BODY_W - 0.5, h: 0.35, fontFace: FONT, fontSize: 12, bold: true, color: RED });
    }
    footnote(slide, arr(s.sources).join('  ·  '));
  },

  requirement(slide, s) {
    const level = String(s.level ?? '').toLowerCase();
    headline(slide, s.decision, `${text(s.requirement)}${s.evidence ? `   ·   ${text(s.evidence)}` : ''}`);
    const colW = (BODY_W - 0.35) / 2;
    const boxes = [
      ['What Shopify does as standard', [text(s.shopify_standard)], MARGIN, 2.2, PANEL, INK],
      ['Why this and not less', [text(s.why)], MARGIN + colW + 0.35, 2.2, PANEL, INK],
      ['What this covers', arr(s.covers), MARGIN, 3.85, 'FFFFFF', INK],
      ['What it does not cover', arr(s.not_covered), MARGIN + colW + 0.35, 3.85, 'FFF3F3', INK],
    ];
    boxes.forEach(([title, lines, x, y, fill, colour], i) => {
      const h = i < 2 ? 1.5 : 1.75;
      slide.addShape('rect', { x, y, w: colW, h, fill: { color: fill }, line: { color: i === 3 ? RED : LINE, pt: i === 3 ? 1.2 : 1 } });
      slide.addText(String(title), { x: x + 0.2, y: y + 0.12, w: colW - 0.4, h: 0.3, fontFace: FONT, fontSize: 10.5, bold: true, color: i === 3 ? RED : MUTED });
      slide.addText(lines.map((l) => ({ text: text(l), options: { bullet: lines.length > 1 ? { code: '25AA' } : false, breakLine: true } })), {
        x: x + 0.2, y: y + 0.45, w: colW - 0.4, h: h - 0.6, fontFace: FONT, fontSize: 11, color: colour, valign: 'top', lineSpacingMultiple: 1.2, shrinkText: true,
      });
    });
    slide.addShape('rect', { x: MARGIN, y: 1.95, w: 1.5, h: 0.22, fill: { color: level === 'custom' ? RED : level === 'app' ? '41547D' : NAVY } });
    slide.addText(level.toUpperCase(), { x: MARGIN, y: 1.96, w: 1.5, h: 0.2, fontFace: FONT, fontSize: 9, bold: true, color: 'FFFFFF', align: 'center' });
    footnote(slide, arr(s.sources).join('  ·  '));
  },

  app_case(slide, s) {
    headline(slide, `${text(s.app)} — ${text(s.requirement)}`, s.cost ? `List price: ${text(s.cost)}` : '');
    slide.addShape('rect', { x: MARGIN, y: 2.15, w: BODY_W, h: 0.85, fill: { color: PANEL } });
    slide.addShape('rect', { x: MARGIN, y: 2.15, w: 0.06, h: 0.85, fill: { color: RED } });
    slide.addText('Why an app at all', { x: MARGIN + 0.25, y: 2.24, w: BODY_W - 0.5, h: 0.25, fontFace: FONT, fontSize: 10, bold: true, color: MUTED });
    slide.addText(text(s.native_gap), { x: MARGIN + 0.25, y: 2.5, w: BODY_W - 0.5, h: 0.45, fontFace: FONT, fontSize: 11.5, color: INK, valign: 'top' });
    const colW = (BODY_W - 0.35) / 2;
    [['What it covers', arr(s.covers), MARGIN, 'FFFFFF', LINE], ['What it does not cover', arr(s.not_covered), MARGIN + colW + 0.35, 'FFF3F3', RED]].forEach(([title, lines, x, fill, border]) => {
      slide.addShape('rect', { x, y: 3.2, w: colW, h: 1.5, fill: { color: fill }, line: { color: border, pt: 1 } });
      slide.addText(String(title), { x: x + 0.2, y: 3.32, w: colW - 0.4, h: 0.3, fontFace: FONT, fontSize: 10.5, bold: true, color: border === RED ? RED : MUTED });
      slide.addText(lines.map((l) => ({ text: text(l), options: { bullet: { code: '25AA' }, breakLine: true } })), {
        x: x + 0.2, y: 3.65, w: colW - 0.4, h: 1.0, fontFace: FONT, fontSize: 11, color: INK, valign: 'top', lineSpacingMultiple: 1.2, shrinkText: true,
      });
    });
    if (arr(s.alternatives).length) {
      slide.addText('Also considered', { x: MARGIN, y: 4.85, w: BODY_W, h: 0.25, fontFace: FONT, fontSize: 10, bold: true, color: MUTED });
      slide.addText(arr(s.alternatives).map((a) => ({ text: `${text(a.option)} — ${text(a.why_not)}`, options: { bullet: { code: '25AA' }, breakLine: true } })), {
        x: MARGIN, y: 5.1, w: BODY_W, h: 0.9, fontFace: FONT, fontSize: 10.5, color: INK, valign: 'top', lineSpacingMultiple: 1.15,
      });
    }
    footnote(slide, arr(s.sources).join('  ·  '));
  },

  gaps(slide, s) {
    headline(slide, s.headline);
    table(slide, ['Requirement', 'Status', 'What it means', 'What we propose'], arr(s.items).map((i) => [
      text(i.requirement), text(i.status), text(i.consequence), text(i.option),
    ]), { y: 2.15, colW: [3.1, 1.9, 3.4, 3.43], fontSize: 10.5 });
    footnote(slide, s.footnote);
  },

  integration(slide, s) {
    headline(slide, `${text(s.system)} — ${text(s.role)}`, [text(s.pattern), text(s.direction), text(s.frequency)].filter(Boolean).join('   ·   '));
    const colW = (BODY_W - 0.35) / 2;
    slide.addShape('rect', { x: MARGIN, y: 2.25, w: colW, h: 1.6, fill: { color: PANEL } });
    slide.addText('SHOPIFY SIDE', { x: MARGIN + 0.2, y: 2.37, w: colW - 0.4, h: 0.25, fontFace: FONT, fontSize: 9, bold: true, color: MUTED });
    slide.addText(arr(s.apis).map((a) => ({ text: text(a), options: { bullet: { code: '25AA' }, breakLine: true } })), {
      x: MARGIN + 0.2, y: 2.65, w: colW - 0.4, h: 1.1, fontFace: FONT, fontSize: 11.5, color: INK, valign: 'top', lineSpacingMultiple: 1.2,
    });
    slide.addShape('rect', { x: MARGIN + colW + 0.35, y: 2.25, w: colW, h: 1.6, fill: { color: 'FFFFFF' }, line: { color: RED, pt: 1.2 } });
    slide.addText('WHEN IT FAILS', { x: MARGIN + colW + 0.55, y: 2.37, w: colW - 0.4, h: 0.25, fontFace: FONT, fontSize: 9, bold: true, color: RED });
    slide.addText(text(s.failure), { x: MARGIN + colW + 0.55, y: 2.65, w: colW - 0.4, h: 1.1, fontFace: FONT, fontSize: 11.5, color: INK, valign: 'top' });
    if (s.evidence) slide.addText(`Evidence: ${text(s.evidence)}`, { x: MARGIN, y: 4.05, w: BODY_W, h: 0.3, fontFace: FONT, fontSize: 10, bold: true, color: NAVY });
    footnote(slide, arr(s.sources).join('  ·  '));
  },

  data_model(slide, s) {
    headline(slide, s.headline);
    table(slide, ['Object', 'Kind', 'Name', 'Purpose', 'Written by'], arr(s.entries).map((e) => [
      text(e.object), text(e.kind), text(e.name), text(e.purpose), text(e.source),
    ]), { y: 2.15, colW: [1.5, 1.6, 2.6, 4.0, 2.13], fontSize: 10 });
    if (arr(s.not_modelled).length) {
      const y = Math.min(2.6 + arr(s.entries).length * 0.42, H - 1.9);
      slide.addShape('rect', { x: MARGIN, y, w: BODY_W, h: 0.95, fill: { color: 'FFF3F3' }, line: { color: RED, pt: 1 } });
      slide.addText('WHAT SHOPIFY CANNOT MODEL', { x: MARGIN + 0.2, y: y + 0.1, w: BODY_W - 0.4, h: 0.22, fontFace: FONT, fontSize: 9, bold: true, color: RED });
      slide.addText(arr(s.not_modelled).map((n) => ({ text: text(n), options: { bullet: { code: '25AA' }, breakLine: true } })), {
        x: MARGIN + 0.2, y: y + 0.35, w: BODY_W - 0.4, h: 0.55, fontFace: FONT, fontSize: 10.5, color: INK, valign: 'top',
      });
    }
    footnote(slide, s.footnote);
  },

  migration(slide, s) {
    headline(slide, s.headline);
    table(slide, ['Data', 'Volume', 'How it moves'], arr(s.moves).map((m) => [text(m.data), text(m.volume), text(m.how)]),
      { y: 2.15, colW: [2.6, 1.8, 7.43], fontSize: 10.5 });
    const y = Math.min(2.6 + arr(s.moves).length * 0.42, H - 2.5);
    const colW = (BODY_W - 0.35) / 2;
    slide.addShape('rect', { x: MARGIN, y, w: colW, h: 1.5, fill: { color: 'FFF3F3' }, line: { color: RED, pt: 1 } });
    slide.addText('WHAT DOES NOT MOVE', { x: MARGIN + 0.2, y: y + 0.1, w: colW - 0.4, h: 0.22, fontFace: FONT, fontSize: 9, bold: true, color: RED });
    slide.addText(arr(s.does_not_move).map((n) => ({ text: text(n), options: { bullet: { code: '25AA' }, breakLine: true } })), {
      x: MARGIN + 0.2, y: y + 0.36, w: colW - 0.4, h: 1.05, fontFace: FONT, fontSize: 10.5, color: INK, valign: 'top', shrinkText: true,
    });
    slide.addShape('rect', { x: MARGIN + colW + 0.35, y, w: colW, h: 1.5, fill: { color: PANEL } });
    slide.addText('CUT-OVER', { x: MARGIN + colW + 0.55, y: y + 0.1, w: colW - 0.4, h: 0.22, fontFace: FONT, fontSize: 9, bold: true, color: MUTED });
    slide.addText(arr(s.cutover).map((c, i) => ({ text: `${i + 1}. ${text(c)}`, options: { breakLine: true } })), {
      x: MARGIN + colW + 0.55, y: y + 0.36, w: colW - 0.4, h: 1.05, fontFace: FONT, fontSize: 10.5, color: INK, valign: 'top', shrinkText: true,
    });
    footnote(slide, arr(s.sources).join('  ·  '));
  },

  nfr(slide, s) {
    headline(slide, s.headline);
    table(slide, ['Area', 'Target', 'How we meet it', 'How it is verified'], arr(s.items).map((i) => [
      text(i.area), text(i.target), text(i.approach), text(i.verified),
    ]), { y: 2.15, colW: [1.7, 3.2, 4.2, 2.73], fontSize: 10.5 });
    footnote(slide, s.footnote);
  },

  open_decisions(slide, s) {
    headline(slide, s.headline);
    table(slide, ['Decision', 'Owner', 'Needed by', 'If it slips'], arr(s.decisions).map((d) => [
      text(d.decision), text(d.owner), text(d.needed_by), text(d.if_late),
    ]), { y: 2.15, colW: [4.2, 1.7, 1.7, 4.23], fontSize: 10.5 });
    footnote(slide, s.footnote);
  },

  out_of_scope(slide, s) {
    headline(slide, s.headline);
    const colW = (BODY_W - 0.4) / 2;
    [['Later phases', arr(s.later_phases), MARGIN, PANEL, MUTED], ['Not included', arr(s.exclusions), MARGIN + colW + 0.4, 'FFFFFF', RED]].forEach(([title, items, x, fill, colour]) => {
      slide.addShape('rect', { x, y: 2.15, w: colW, h: H - 3.3, fill: { color: fill }, line: { color: colour === RED ? RED : LINE, pt: 1 } });
      slide.addText(String(title).toUpperCase(), { x: x + 0.22, y: 2.3, w: colW - 0.44, h: 0.25, fontFace: FONT, fontSize: 9.5, bold: true, color: colour });
      slide.addText(items.map((b) => ({ text: text(b), options: { bullet: { code: '25AA' }, breakLine: true } })), {
        x: x + 0.22, y: 2.65, w: colW - 0.44, h: H - 4, fontFace: FONT, fontSize: 11.5, color: INK, valign: 'top', lineSpacingMultiple: 1.25,
      });
    });
    footnote(slide, s.footnote);
  },

  operating_model(slide, s) {
    headline(slide, s.headline, s.support ? `Support model: ${text(s.support)}` : '');
    table(slide, ['Area', 'Client', 'Merkle'], arr(s.responsibilities).map((r) => [text(r.area), text(r.client), text(r.merkle)]),
      { y: 2.25, colW: [3.4, 4.2, 4.23], fontSize: 10.5 });
    if (arr(s.enablement).length) {
      const y = Math.min(2.7 + arr(s.responsibilities).length * 0.42, H - 1.7);
      slide.addText('HANDOVER AND ENABLEMENT', { x: MARGIN, y, w: BODY_W, h: 0.25, fontFace: FONT, fontSize: 9, bold: true, color: MUTED });
      slide.addText(arr(s.enablement).map((e) => ({ text: text(e), options: { bullet: { code: '25AA' }, breakLine: true } })), {
        x: MARGIN, y: y + 0.28, w: BODY_W, h: 0.8, fontFace: FONT, fontSize: 10.5, color: INK, valign: 'top',
      });
    }
    footnote(slide, s.footnote);
  },

  run_cost(slide, s) {
    headline(slide, s.headline);
    table(slide, ['Item', 'Cost', 'Period', 'Note'], arr(s.items).map((i) => [text(i.item), text(i.cost), text(i.period), text(i.note)]),
      { y: 2.15, colW: [3.4, 1.9, 1.6, 4.93], fontSize: 10.5 });
    if (s.total) {
      const y = Math.min(2.6 + arr(s.items).length * 0.42, H - 1.6);
      slide.addShape('rect', { x: MARGIN, y, w: BODY_W, h: 0.6, fill: { color: BLACK } });
      slide.addText(`Known monthly total: ${text(s.total)}`, { x: MARGIN + 0.25, y: y + 0.12, w: BODY_W - 0.5, h: 0.36, fontFace: FONT, fontSize: 13, bold: true, color: 'FFFFFF' });
    }
    footnote(slide, s.footnote);
  },

  ai_commerce(slide, s) {
    headline(slide, s.headline);
    slide.addShape('rect', { x: MARGIN, y: 2.15, w: BODY_W, h: 0.9, fill: { color: BLACK } });
    slide.addText('WHERE YOU STAND TODAY', { x: MARGIN + 0.25, y: 2.25, w: BODY_W - 0.5, h: 0.24, fontFace: FONT, fontSize: 9, bold: true, color: 'C9C9D6' });
    slide.addText(text(s.today), { x: MARGIN + 0.25, y: 2.5, w: BODY_W - 0.5, h: 0.5, fontFace: FONT, fontSize: 12.5, color: 'FFFFFF', valign: 'top' });
    const colW = (BODY_W - 0.35) / 2;
    [['What you must decide', arr(s.decisions), MARGIN, RED], ['What has to be ready', arr(s.readiness), MARGIN + colW + 0.35, NAVY]].forEach(([title, items, x, colour]) => {
      slide.addShape('rect', { x, y: 3.3, w: colW, h: 1.7, fill: { color: 'FFFFFF' }, line: { color: colour, pt: 1.2 } });
      slide.addText(String(title).toUpperCase(), { x: x + 0.2, y: 3.42, w: colW - 0.4, h: 0.24, fontFace: FONT, fontSize: 9, bold: true, color: colour });
      slide.addText(items.map((b) => ({ text: text(b), options: { bullet: { code: '25AA' }, breakLine: true } })), {
        x: x + 0.2, y: 3.7, w: colW - 0.4, h: 1.2, fontFace: FONT, fontSize: 11, color: INK, valign: 'top', lineSpacingMultiple: 1.2, shrinkText: true,
      });
    });
    footnote(slide, s.footnote);
  },

  conclusion(slide, s) {
    slide.background = { color: BLACK };
    slide.addShape('rect', { x: MARGIN, y: 1.1, w: 0.7, h: 0.07, fill: { color: RED } });
    slide.addText(text(s.headline), { x: MARGIN, y: 1.35, w: BODY_W * 0.9, h: 1.3, fontFace: FONT, fontSize: 26, bold: true, color: 'FFFFFF', valign: 'top', lineSpacingMultiple: 1.1 });
    const colW = (BODY_W - 0.6) / 3;
    [['What it delivers', arr(s.delivers), 'FFFFFF'], ['What it does not solve', arr(s.limits), 'FF8A8A'], ['What we need from you', arr(s.ask), 'FFFFFF']].forEach(([title, items, colour], i) => {
      const x = MARGIN + i * (colW + 0.3);
      slide.addText(String(title).toUpperCase(), { x, y: 3.1, w: colW, h: 0.3, fontFace: FONT, fontSize: 9.5, bold: true, color: i === 1 ? 'FF8A8A' : 'C9C9D6' });
      slide.addText(items.map((b) => ({ text: text(b), options: { bullet: { code: '25AA' }, breakLine: true } })), {
        x, y: 3.45, w: colW, h: 2.2, fontFace: FONT, fontSize: 12, color: colour, valign: 'top', lineSpacingMultiple: 1.3,
      });
    });
    if (s.evidence) slide.addText(text(s.evidence), { x: MARGIN, y: H - 0.85, w: BODY_W, h: 0.3, fontFace: FONT, fontSize: 9, color: '8888A1' });
  },

  architecture(slide, s) {
    headline(slide, s.headline);
    const layers = arr(s.layers);
    const h = Math.min(0.95, (H - 3.4) / Math.max(layers.length, 1));
    layers.forEach((layer, i) => {
      const y = 2.2 + i * (h + 0.18);
      slide.addShape('rect', { x: MARGIN, y, w: 2.5, h, fill: { color: i === 0 ? NAVY : PANEL } });
      slide.addText(text(layer.name), { x: MARGIN + 0.18, y: y + h / 2 - 0.16, w: 2.2, h: 0.32, fontFace: FONT, fontSize: 11.5, bold: true, color: i === 0 ? 'FFFFFF' : INK });
      const items = arr(layer.items);
      const boxW = (BODY_W - 2.75 - 0.15 * (items.length - 1)) / Math.max(items.length, 1);
      items.forEach((item, j) => {
        const x = MARGIN + 2.75 + j * (boxW + 0.15);
        slide.addShape('rect', { x, y, w: boxW, h, fill: { color: 'FFFFFF' }, line: { color: LINE, pt: 1 } });
        slide.addText(text(item), { x: x + 0.1, y: y + 0.08, w: boxW - 0.2, h: h - 0.16, fontFace: FONT, fontSize: 10, color: INK, align: 'center', valign: 'middle', shrinkText: true });
      });
    });
    footnote(slide, s.footnote);
  },

  table(slide, s) {
    headline(slide, s.headline);
    table(slide, arr(s.columns), arr(s.rows));
    footnote(slide, s.footnote);
  },

  risks(slide, s) {
    headline(slide, s.headline);
    const risks = arr(s.risks);
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
    const phases = arr(s.phases);
    const gap = 0.25;
    const colW = (BODY_W - gap * (phases.length - 1)) / Math.max(phases.length, 1);
    phases.forEach((phase, i) => {
      const x = MARGIN + i * (colW + gap);
      slide.addShape('rect', { x, y: 2.25, w: colW, h: 0.62, fill: { color: i === 0 ? NAVY : PANEL } });
      slide.addText(text(phase.name), { x: x + 0.15, y: 2.32, w: colW - 0.3, h: 0.3, fontFace: FONT, fontSize: 12, bold: true, color: i === 0 ? 'FFFFFF' : INK });
      if (phase.timing) slide.addText(text(phase.timing), { x: x + 0.15, y: 2.6, w: colW - 0.3, h: 0.25, fontFace: FONT, fontSize: 9.5, color: i === 0 ? 'C9C9D6' : MUTED });
      slide.addText(arr(phase.items).map((item) => ({ text: text(item), options: { bullet: { code: '25AA' }, breakLine: true } })), {
        x: x + 0.1, y: 3.0, w: colW - 0.2, h: 2.6, fontFace: FONT, fontSize: 10.5, color: INK, valign: 'top', lineSpacingMultiple: 1.25,
      });
    });
    slide.addShape('line', { x: MARGIN, y: 2.18, w: BODY_W, h: 0, line: { color: LINE, pt: 1 } });
    footnote(slide, s.footnote);
  },

  split(slide, s) {
    headline(slide, s.headline);
    const segments = arr(s.segments);
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
    [['Merkle', arr(s.merkle), MARGIN, NAVY], ['Client', arr(s.client), MARGIN + colW + 0.4, RED]].forEach(([title, items, x, colour]) => {
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
    slide.addText(arr(s.recurring).map((r) => ({ text: text(r), options: { bullet: { code: '25AA' }, breakLine: true } })), {
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

  for (const spec of arr(deck?.slides)) {
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
