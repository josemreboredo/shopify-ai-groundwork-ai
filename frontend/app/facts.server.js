/**
 * @file facts.server.js
 * @description The numbers the public pages quote, counted from the repository.
 *
 * They were typed into the page and drifted: it claimed 297 questions and 22
 * exit rules when the bank held 298 and the offering 23. A page that says "these
 * numbers come from the repository, not from marketing" cannot be maintained by
 * hand, so they are counted where they live.
 *
 * Server-only (`.server.js`): the schemas are large and have no business in the
 * browser bundle.
 *
 * @module frontend/app/facts.server
 */

import questionBank from '../../discovery/schema/question-bank.json' with { type: 'json' };
import offering from '../../discovery/schema/offering.json' with { type: 'json' };
import { REFERENCE_CHAPTERS } from '../../discovery/service/reference-chapters.js';
import { SLIDE_LAYOUTS } from '../../discovery/service/deck-html.js';

/**
 * @returns {Array<[string, string]>} count and what it counts, for the stats strip
 */
export const stats = () => [
  [String(questionBank.questions.length), 'questions, each one explaining what it decides for Shopify'],
  [String(offering.exit_rules.length), 'exit rules the engine applies — the same on every bid and every discovery'],
  [String(REFERENCE_CHAPTERS.length), 'verified Shopify reference chapters behind the recommendations'],
  [String(SLIDE_LAYOUTS.length), 'slide layouts the client document is built from'],
];
