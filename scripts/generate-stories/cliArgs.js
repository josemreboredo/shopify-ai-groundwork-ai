/**
 * @fileoverview CLI argument parser for generate-stories.
 *
 * Supported flags:
 *   --spec   <path>      Path to the store-spec.yaml (required)
 *   --output <path>      Destination file (default: ./stories.md)
 *   --format md|json     Output format (default: md)
 *
 * @module cliArgs
 */

import path from 'node:path';

/** @typedef {'md'|'json'} OutputFormat */

/**
 * @typedef {object} CliArgs
 * @property {string}       spec    Resolved path to store-spec.yaml
 * @property {string}       output  Resolved path for output file
 * @property {OutputFormat} format  Output format
 */

/** @type {Set<string>} */
const VALID_FORMATS = new Set(['md', 'json']);

const DEFAULT_OUTPUT   = 'stories.md';
const DEFAULT_FORMAT   = 'md';

/**
 * Parse raw argv tokens into a validated {@link CliArgs} object.
 *
 * @param {string[]} argv  Slice of process.argv (typically process.argv.slice(2))
 * @param {string}   [cwd] Working directory for resolving relative paths
 * @returns {CliArgs}
 * @throws {Error} If --spec is missing or --format is invalid
 */
export function parseCliArgs(argv, cwd = process.cwd()) {
  /** @type {Record<string, string>} */
  const flags = {};

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const key   = token.slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : '';
      flags[key] = value;
    }
  }

  if (!flags.spec) {
    throw new Error(
      'Missing required argument: --spec <path-to-store-spec.yaml>\n' +
      'Usage: node scripts/generate-stories.js --spec store-spec.yaml ' +
      '[--output stories.md] [--format md|json]'
    );
  }

  const format = /** @type {OutputFormat} */ (flags.format || DEFAULT_FORMAT);
  if (!VALID_FORMATS.has(format)) {
    throw new Error(
      `Invalid --format "${format}". Must be one of: ${[...VALID_FORMATS].join(', ')}`
    );
  }

  return {
    spec:   path.resolve(cwd, flags.spec),
    output: path.resolve(cwd, flags.output || DEFAULT_OUTPUT),
    format,
  };
}
