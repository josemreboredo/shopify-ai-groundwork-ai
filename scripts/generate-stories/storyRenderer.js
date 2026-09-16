/**
 * @file storyRenderer.js
 * @description Renders a filtered list of {@link Story} objects to either
 * a Markdown sprint-backlog document or a JSON array.
 *
 * No external dependencies — pure Node.js built-ins only.
 *
 * @module storyRenderer
 */

// ─── Complexity legend ────────────────────────────────────────────────────────

/**
 * Effort label shown next to complexity in Markdown output.
 * @type {Record<string, string>}
 */
const COMPLEXITY_LABEL = {
  XS: 'XS  (~0.5 d)',
  S:  'S   (~1 d)',
  M:  'M   (~2–3 d)',
  L:  'L   (~4–5 d)',
  XL: 'XL  (~1+ wk)',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert a domain slug to a human-readable section heading.
 *
 * @param {string} domain
 * @returns {string}
 */
function domainHeading(domain) {
  return domain
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Escape pipe characters inside a Markdown table cell.
 *
 * @param {string} text
 * @returns {string}
 */
function escapeCell(text) {
  return text.replace(/\|/g, '\\|');
}

// ─── Markdown renderer ────────────────────────────────────────────────────────

/**
 * Render a list of stories as a Markdown sprint-backlog document.
 *
 * The document structure:
 * - H1 title with generation timestamp
 * - Summary table (slug | domain | complexity | title)
 * - One H2 section per domain
 *   - One H3 per story with full prompt as a blockquote
 *
 * @param {import('./storyRegistry.js').Story[]} stories
 * @param {import('./parseSpec.js').StoreSpec}   spec
 * @returns {string}  Complete Markdown document
 */
export function renderMarkdown(stories, spec) {
  if (stories.length === 0) {
    return (
      '# Stories\n\n' +
      '_No stories matched the provided spec.  ' +
      'Check that the spec file is complete and re-run._\n'
    );
  }

  const storeName = spec?.store?.name ?? 'Unknown Store';
  const tierName  = spec?.tier?.selected ?? 'unknown';
  const generated = new Date().toISOString();
  const lines     = [];

  // ── Header ────────────────────────────────────────────────────────────────

  lines.push(`# Sprint backlog — ${storeName}`);
  lines.push('');
  lines.push(
    `> **Tier:** ${tierName}  ·  **Stories:** ${stories.length}  ` +
    `·  **Generated:** ${generated}`,
  );
  lines.push('');

  // ── Summary table ─────────────────────────────────────────────────────────

  lines.push('## Summary');
  lines.push('');
  lines.push('| # | Slug | Domain | Size | Title |');
  lines.push('|---|------|--------|------|-------|');

  stories.forEach((s, idx) => {
    const n          = String(idx + 1).padStart(2, ' ');
    const complexity = COMPLEXITY_LABEL[s.complexity] ?? s.complexity;
    lines.push(
      `| ${n} | \`${escapeCell(s.slug)}\` | ${escapeCell(s.domain)} ` +
      `| ${escapeCell(complexity)} | ${escapeCell(s.title)} |`,
    );
  });
  lines.push('');

  // ── Domain sections ───────────────────────────────────────────────────────

  // Group stories by domain, preserving registry order within each domain
  /** @type {Map<string, import('./storyRegistry.js').Story[]>} */
  const byDomain = new Map();
  for (const story of stories) {
    if (!byDomain.has(story.domain)) byDomain.set(story.domain, []);
    byDomain.get(story.domain).push(story);
  }

  for (const [domain, domainStories] of byDomain) {
    lines.push(`## ${domainHeading(domain)}`);
    lines.push('');

    for (const story of domainStories) {
      const complexity = COMPLEXITY_LABEL[story.complexity] ?? story.complexity;

      lines.push(`### ${story.title}`);
      lines.push('');
      lines.push(
        `**Slug:** \`${story.slug}\`  ·  **Domain:** ${story.domain}  ` +
        `·  **Size:** ${complexity}`,
      );
      lines.push('');
      lines.push('**Agent prompt:**');
      lines.push('');
      // Render the prompt as a blockquote — prefix every line
      const promptLines = story.prompt.split('\n');
      for (const pl of promptLines) {
        lines.push(`> ${pl}`);
      }
      lines.push('');
      lines.push('---');
      lines.push('');
    }
  }

  return lines.join('\n');
}

// ─── JSON renderer ────────────────────────────────────────────────────────────

/**
 * Render a list of stories as a JSON string.
 *
 * The output shape is an object with metadata and a `stories` array.
 * Each story entry contains all fields except the `applicability` function
 * (functions are not serialisable).
 *
 * @param {import('./storyRegistry.js').Story[]} stories
 * @param {import('./parseSpec.js').StoreSpec}   spec
 * @returns {string}  Pretty-printed JSON string
 */
export function renderJson(stories, spec) {
  const payload = {
    meta: {
      storeName:  spec?.store?.name    ?? null,
      storeSlug:  spec?.store?.slug    ?? null,
      tier:       spec?.tier?.selected ?? null,
      generated:  new Date().toISOString(),
      totalCount: stories.length,
    },
    stories: stories.map((s, idx) => ({
      index:      idx + 1,
      slug:       s.slug,
      title:      s.title,
      domain:     s.domain,
      complexity: s.complexity,
      prompt:     s.prompt,
    })),
  };

  return JSON.stringify(payload, null, 2);
}

// ─── Unified render dispatch ──────────────────────────────────────────────────

/**
 * Render stories in the requested format.
 *
 * @param {import('./storyRegistry.js').Story[]} stories
 * @param {import('./parseSpec.js').StoreSpec}   spec
 * @param {'md'|'json'}                          format
 * @returns {string}
 * @throws {Error} If `format` is not recognised
 */
export function render(stories, spec, format) {
  switch (format) {
    case 'md':   return renderMarkdown(stories, spec);
    case 'json': return renderJson(stories, spec);
    default:
      throw new Error(`Unknown render format "${format}". Expected "md" or "json".`);
  }
}
