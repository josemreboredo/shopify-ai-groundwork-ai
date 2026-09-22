/**
 * @file brand.js
 * @description What the tool is called, in one place.
 *
 * The name used to be written into every page title, the footer and the sign-in
 * hero, so renaming it meant a search-and-replace across twenty files and a page
 * that still said the old thing. It is one constant now: change `PRODUCT` and
 * every title, the footer and the hero follow.
 *
 * The connector's name is deliberately separate. Consultants typed it into
 * Claude's connector settings when they added it (ADR 0015), and Claude looks it
 * up by that name in every chat — so it does not move when the tool is renamed.
 *
 * @module frontend/app/brand
 */

/** The tool, as it is written wherever a reader meets it. */
export const PRODUCT = 'Merkle Groundwork AI';

/**
 * The connector's name in Claude. Fixed by what is already configured, not by the
 * product name: consultants typed it into their connector settings and Claude
 * looks it up by that name in every chat, so renaming the tool would cost every
 * one of them a manual edit for nothing. It stays "Merkle Discovery" on purpose.
 */
export const CONNECTOR = 'Merkle Discovery';

/**
 * A page title: the page first, the tool last.
 *
 * @param {...(string|null|undefined|false)} parts  most specific first
 * @returns {string}
 */
export const pageTitle = (...parts) => [...parts.filter(Boolean), PRODUCT].join(' · ');
