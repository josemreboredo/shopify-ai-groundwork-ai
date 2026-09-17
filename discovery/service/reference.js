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
