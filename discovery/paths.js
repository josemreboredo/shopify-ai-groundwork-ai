/**
 * @file paths.js
 * @description Repository locations used by the discovery tool (ADR 0013):
 * client data stays at the repository root (gitignored) and is shared with the
 * build tool; the engagement contract lives in contracts/.
 *
 * @module discovery/paths
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** The discovery tool folder (discovery/). */
export const DISCOVERY_ROOT = path.dirname(fileURLToPath(import.meta.url));

/** Repository root. */
const REPO_ROOT = path.resolve(DISCOVERY_ROOT, '..');

/** Client engagements (gitignored): clients/<slug>/engagement.json and outputs. */
export const CLIENTS_DIR = path.join(REPO_ROOT, 'clients');

/** Work directories for Claude Code discovery and interviews (gitignored). */
export const WORK_ROOT = path.join(CLIENTS_DIR, '.work');

/** Discovery documentation, including the generated questionnaire and consultant guide. */
export const DOCS_DIR = path.join(DISCOVERY_ROOT, 'docs');
