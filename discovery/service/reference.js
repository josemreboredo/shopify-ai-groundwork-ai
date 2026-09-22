/**
 * @file reference.js
 * @description Merkle's verified Shopify reference chapters and which ones an
 * engagement needs. Code selects — the chapters are written and verified once
 * (ADR 0017 amendment), so every closing document annex says the same thing
 * about plans, Markets, payments, storefront options and agentic commerce.
 *
 * @module discovery/service/reference
 */

import { REFERENCE_CHAPTERS } from './reference-chapters.js';

/** Topics an engagement needs, from what the answers say. @param {object} doc  Decided or finalised engagement */
export function topicsFor(doc) {
  const markets = doc?.markets?.list ?? [];
  const crossBorder = markets.length > 1 || (doc?.markets?.expansion_12m ?? []).length > 0;
  return new Set([
    'plans',
    'storefront',
    'payments',
    'ai',
    ...(crossBorder ? ['markets', 'cross_border'] : []),
    ...(doc?.b2b?.enabled ? ['b2b'] : []),
    ...(doc?.migration?.source_platform && doc.migration.source_platform !== 'none' ? ['migration'] : []),
  ]);
}

/**
 * The chapters appended to this engagement's annex, in file order.
 *
 * @param {object} doc
 * @returns {Array<{ slug: string, title: string, verified: string, topics: string[], summary: string, markdown: string }>}
 */
export function selectChapters(doc) {
  const topics = topicsFor(doc);
  return REFERENCE_CHAPTERS.filter((chapter) => chapter.topics.some((topic) => topics.has(topic)));
}

/** What Claude is told about the chapters (so it cites them instead of rewriting them). @param {object} doc */
export const chapterBrief = (doc) => selectChapters(doc).map(({ slug, title, verified, summary }) => ({ slug, title, verified, summary }));

/**
 * The chapters as the writer needs them: the verified text itself, not a summary
 * of it. A summary cannot stop the model from contradicting the chapter that is
 * about to be stapled to its own annex — the body can.
 *
 * @param {object} doc
 */
/** Chapters almost every decision leans on, kept in full before the peripheral ones. */
const CORE = ['shopify-plans', 'shopify-markets', 'managed-markets', 'liquid-vs-hydrogen'];

export function chapterKnowledge(doc, { budget = 110_000 } = {}) {
  const topics = topicsFor(doc);
  // Most relevant first: a chapter matching two of this engagement's topics is
  // worth more of the budget than one matching a single peripheral topic.
  const ranked = selectChapters(doc)
    .map((c) => ({ chapter: c, hits: c.topics.filter((t) => topics.has(t)).length, core: CORE.includes(c.slug) ? 1 : 0 }))
    .sort((a, b) => b.core - a.core || b.hits - a.hits || a.chapter.slug.localeCompare(b.chapter.slug));

  let spent = 0;
  const out = [];
  const dropped = [];
  for (const [i, { chapter }] of ranked.entries()) {
    const { slug, title, verified, summary, markdown } = chapter;
    const size = Buffer.byteLength(markdown ?? '');
    // The most relevant chapter always travels in full: a budget that silently
    // drops the one chapter every decision leans on is worse than no budget.
    if (i === 0 || spent + size <= budget) {
      spent += size;
      out.push({ slug, title, verified, summary, markdown });
    } else {
      dropped.push(slug);
      out.push({ slug, title, verified, summary, body_omitted: 'over the payload budget — read it in the annex before writing about this topic' });
    }
  }
  return { chapters: out, bytes: spent, ...(dropped.length ? { summaries_only: dropped } : {}) };
}

/**
 * The annex document as downloaded: Claude's tailored analysis plus the verified
 * chapters for this engagement.
 *
 * @param {string} annex  Markdown written by Claude
 * @param {object} doc
 */
export function annexWithChapters(annex, doc) {
  const chapters = selectChapters(doc);
  if (!chapters.length) return annex;
  const body = chapters.map((c) => `## ${c.title}\n\n> Merkle reference chapter · Shopify documentation checked ${c.verified}. Facts here apply to every engagement; client-specific points are in the analysis above.\n\n${c.markdown}`);
  return `${annex.trim()}\n\n---\n\n# Shopify reference chapters\n\n${body.join('\n\n---\n\n')}\n`;
}

export { REFERENCE_CHAPTERS };
