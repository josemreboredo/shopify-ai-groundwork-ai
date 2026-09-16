/**
 * @file parseMarkdown.js
 * @description Extracts structured data from the Frame Agent's Markdown output files.
 *
 * Each parser is purpose-built for the template format defined in
 * agents/frame-agent/output-template/. If a file is absent or a section
 * cannot be found, the parser returns { found: false, ... } so that
 * build_xml.js can emit a <missing> element with a useful reason.
 *
 * No external dependencies — pure Node.js built-ins only.
 *
 * @module parseMarkdown
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';

/** Blank questionnaire — lines copied verbatim from it are prompts, not answers. */
const QUESTIONNAIRE_TEMPLATE = fileURLToPath(
  new URL('../../docs/discovery/client-questionnaire.md', import.meta.url),
);

// ─── Low-level helpers ────────────────────────────────────────────────────────

/**
 * Read a file and return its text, or null if absent.
 *
 * @param {string} filePath
 * @returns {string|null}
 */
function readOrNull(filePath) {
  if (!existsSync(filePath)) return null;
  return readFileSync(filePath, 'utf8');
}

/**
 * Extract the text content of a Markdown section (## heading to next ## heading).
 *
 * @param {string}  markdown     Full markdown text
 * @param {string}  headingText  Exact heading text (case-insensitive partial match)
 * @returns {string|null}
 */
function extractSection(markdown, headingText) {
  const lower     = headingText.toLowerCase();
  const lines     = markdown.split('\n');
  let   capturing = false;
  let   depth     = 0;
  const result    = [];

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,4})\s+(.*)/);
    if (headingMatch) {
      const currentDepth = headingMatch[1].length;
      const currentText  = headingMatch[2].toLowerCase();

      if (!capturing && currentText.includes(lower)) {
        capturing = true;
        depth     = currentDepth;
        continue; // skip the heading line itself
      }

      if (capturing && currentDepth <= depth) {
        break; // reached the next sibling/parent heading
      }
    }

    if (capturing) result.push(line);
  }

  return result.length > 0 ? result.join('\n').trim() : null;
}

/**
 * Group consecutive Markdown table lines into separate tables.
 *
 * @param {string} text
 * @returns {string[][]}  One array of trimmed lines per table
 */
function tableBlocks(text) {
  const blocks = [];
  let current  = [];
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      current.push(line);
    } else if (current.length > 0) {
      blocks.push(current);
      current = [];
    }
  }
  if (current.length > 0) blocks.push(current);
  return blocks;
}

/** @param {string} line */
const splitRow = (line) => line.split('|').slice(1, -1).map((c) => c.trim());

/**
 * True for template placeholder rows such as "*(populated if any …)*".
 *
 * @param {string[]} cells
 */
const isPlaceholderRow = (cells) =>
  cells.every((c) => c === '') || cells.some((c) => /^\*\(.*\)\*$/.test(c));

/**
 * Parse every Markdown table in `text` into row objects keyed by lower-cased
 * header. Each table uses its own header row, so a section holding several
 * tables (e.g. one per sprint) does not leak header rows into the data.
 * Separator and template-placeholder rows are dropped; `**bold**` is unwrapped.
 *
 * @param {string} text  Markdown containing one or more tables
 * @returns {Record<string, string>[]}
 */
function parseTable(text) {
  const rows = [];

  for (const lines of tableBlocks(text)) {
    if (lines.length < 3) continue; // need header + separator + at least one row

    const headers = splitRow(lines[0]).map((h) => h.replace(/\*\*/g, '').toLowerCase());

    for (const line of lines.slice(1)) {
      if (/^\|[\s:|-]+\|$/.test(line)) continue; // separator row
      const cells = splitRow(line).map((c) => c.replace(/\*\*/g, ''));
      if (cells.length < headers.length || isPlaceholderRow(cells)) continue;

      const row = {};
      headers.forEach((h, idx) => {
        row[h] = cells[idx] ?? '';
      });
      rows.push(row);
    }
  }

  return rows;
}

/**
 * Parse the first number in a cost string ("~€1,249/mo", "$15–$50") — the
 * low end of a range. Returns 0 when nothing numeric is present.
 *
 * @param {string} text
 * @returns {number}
 */
function firstAmount(text) {
  const match = String(text).replace(/(\d),(\d{3})/g, '$1$2').match(/\d+(?:\.\d+)?/);
  return match ? parseFloat(match[0]) : 0;
}

// ─── Capability map parser ────────────────────────────────────────────────────

/**
 * @typedef {Object} CapabilityRow
 * @property {string} requirement
 * @property {string} resolution   'Native' | 'App' | 'Theme' | 'Custom'
 * @property {string} tool
 * @property {string} tier
 * @property {string} notes
 */

/**
 * @typedef {Object} CapabilityMapResult
 * @property {boolean}         found
 * @property {string}          [reason]   Present when found=false
 * @property {CapabilityRow[]} rows
 */

/**
 * Parse a capability-map.md file into structured rows.
 *
 * @param {string} filePath
 * @returns {CapabilityMapResult}
 */
export function parseCapabilityMap(filePath) {
  const text = readOrNull(filePath);
  if (!text) {
    return { found: false, reason: `File not found: ${filePath}`, rows: [] };
  }

  // The file also holds a legend and an app summary table — only read the
  // requirements table, located by section heading or by its header row.
  const section = extractSection(text, 'requirements → capabilities') ??
                  extractSection(text, 'requirements');
  const source  = section ??
    tableBlocks(text).find((b) => /requirement/i.test(b[0]))?.join('\n') ?? '';

  /** @param {Record<string, string>} r @param {string} prefix */
  const col = (r, prefix) => Object.entries(r).find(([k]) => k.startsWith(prefix))?.[1] ?? '';

  const rows = parseTable(source)
    .map((r) => ({
      requirement: col(r, 'requirement') || col(r, 'capability') || col(r, 'feature'),
      resolution:  col(r, 'resolution') || col(r, 'approach'),
      tool:        col(r, 'tool'),
      tier:        col(r, 'gaia tier') || col(r, 'tier'),
      notes:       col(r, 'notes'),
    }))
    .filter((r) => r.requirement.length > 0);

  if (rows.length === 0) {
    return {
      found:  false,
      reason: `No requirements table found in capability-map at ${filePath}`,
      rows:   [],
    };
  }

  return { found: true, rows };
}

// ─── Delivery plan parser ─────────────────────────────────────────────────────

/**
 * @typedef {Object} DeliveryTask
 * @property {string} task
 * @property {string} sprint      '### Sprint N' heading the task sits under ('' if none)
 * @property {string} capability
 * @property {string} owner
 * @property {string} tier
 * @property {string} notes
 */

/**
 * @typedef {Object} DeliveryPlanResult
 * @property {boolean}        found
 * @property {string}         [reason]
 * @property {DeliveryTask[]} phase1
 * @property {DeliveryTask[]} phase2
 */

/**
 * Convert the tables in a phase section into tasks, tagging each with the
 * `### Sprint N` sub-heading it appears under.
 *
 * @param {string|null} sectionText
 * @returns {DeliveryTask[]}
 */
function toTasks(sectionText) {
  if (!sectionText) return [];

  /** @type {{ sprint: string, lines: string[] }[]} */
  const chunks = [{ sprint: '', lines: [] }];
  for (const line of sectionText.split('\n')) {
    const heading = line.match(/^#{3,4}\s+(.*)/);
    if (heading) chunks.push({ sprint: heading[1].trim(), lines: [] });
    else chunks[chunks.length - 1].lines.push(line);
  }

  return chunks.flatMap(({ sprint, lines }) =>
    parseTable(lines.join('\n'))
      .map((r) => ({
        task:       r['task'] ?? r['story'] ?? r['item'] ?? '',
        sprint,
        capability: r['capability'] ?? '',
        owner:      r['owner'] ?? r['who'] ?? '',
        tier:       r['gaia tier'] ?? r['tier'] ?? '',
        notes:      r['notes'] ?? '',
      }))
      .filter((t) => t.task.length > 0),
  );
}

/**
 * Parse a delivery-plan.md file into Phase 1 and Phase 2 task lists.
 *
 * @param {string} filePath
 * @returns {DeliveryPlanResult}
 */
export function parseDeliveryPlan(filePath) {
  const text = readOrNull(filePath);
  if (!text) {
    return {
      found:  false,
      reason: `File not found: ${filePath}`,
      phase1: [],
      phase2: [],
    };
  }

  const phase1 = toTasks(extractSection(text, 'phase 1'));
  const phase2 = toTasks(extractSection(text, 'phase 2'));

  // Fallback: no phase headings — treat every task table as Phase 1
  if (phase1.length === 0 && phase2.length === 0) {
    const tasks = toTasks(text);
    return {
      found:  tasks.length > 0,
      ...(tasks.length === 0 && { reason: `No task tables found in delivery-plan at ${filePath}` }),
      phase1: tasks,
      phase2: [],
    };
  }

  return { found: true, phase1, phase2 };
}

// ─── App shortlist parser ─────────────────────────────────────────────────────

/**
 * @typedef {Object} AppEntry
 * @property {string}  name
 * @property {string}  rationale
 * @property {string}  cost
 * @property {number}  costMonthly   Parsed numeric value (0 if unreadable)
 * @property {string}  integration
 * @property {string}  tier
 * @property {boolean} recommended
 * @property {string}  [rejectionReason]  Present when recommended=false
 */

/**
 * @typedef {Object} AppShortlistResult
 * @property {boolean}   found
 * @property {string}    [reason]
 * @property {AppEntry[]} apps
 * @property {number}    totalMonthly
 * @property {number}    totalAnnual
 */

/**
 * Parse an app-shortlist.md file into structured app entries + cost totals.
 *
 * @param {string} filePath
 * @returns {AppShortlistResult}
 */
export function parseAppShortlist(filePath) {
  const text = readOrNull(filePath);
  if (!text) {
    return {
      found:        false,
      reason:       `File not found: ${filePath}`,
      apps:         [],
      totalMonthly: 0,
      totalAnnual:  0,
    };
  }

  const apps = [];

  // ── Recommended apps (### N. AppName blocks) ──────────────────────────────
  // Each app is described in a table under a ### heading
  const appBlockRegex = /###\s+\d+\.\s+(.+?)\n([\s\S]*?)(?=###|\n##|$)/g;
  let match;

  while ((match = appBlockRegex.exec(text)) !== null) {
    const appName  = match[1].trim();
    const appBlock = match[2];
    if (appName.startsWith('*')) continue; // template placeholder block
    const rows     = parseTable(appBlock);

    const get = (keys) => {
      for (const k of keys) {
        const row = rows.find((r) => {
          const firstVal = Object.values(r)[0]?.toLowerCase() ?? '';
          return firstVal.includes(k.toLowerCase());
        });
        if (row) {
          const vals = Object.values(row);
          return vals[vals.length - 1] ?? '';
        }
      }
      return '';
    };

    const costRaw    = get(['cost', 'price', 'monthly']);
    const costMonthly = firstAmount(costRaw);

    // Skip apps in the "not recommended" section
    const posInText = text.indexOf(match[0]);
    const beforeApp = text.slice(0, posInText);
    const isRejected = /not recommended|evaluated but/i.test(
      beforeApp.slice(Math.max(0, beforeApp.length - 300)),
    );

    apps.push({
      name:        appName,
      rationale:   get(['why this app', 'why', 'rationale']),
      cost:        costRaw,
      costMonthly,
      integration: get(['integration complexity', 'integration']),
      tier:        get(['gaia tier', 'tier']),
      recommended: !isRejected,
    });
  }

  // ── Not recommended table ─────────────────────────────────────────────────
  const notRecSection = extractSection(text, 'not recommended') ??
                        extractSection(text, 'evaluated but');
  if (notRecSection) {
    const notRecRows = parseTable(notRecSection);
    for (const row of notRecRows) {
      const name = row['app'] ?? row['app name'] ?? '';
      if (!name || name.startsWith('*')) continue;
      apps.push({
        name,
        rationale:        '',
        cost:             '',
        costMonthly:      0,
        integration:      '',
        tier:             '',
        recommended:      false,
        rejectionReason:  row['reason not recommended'] ?? row['reason'] ?? '',
      });
    }
  }

  // ── Total cost (look for the summary table) ───────────────────────────────
  let totalMonthly = 0;
  const totalSection = extractSection(text, 'total estimated') ??
                       extractSection(text, 'total app cost');
  if (totalSection) {
    const totalRows = parseTable(totalSection);
    for (const row of totalRows) {
      const freq = Object.values(row)[0]?.toLowerCase() ?? '';
      const amt  = firstAmount(Object.values(row)[1] ?? '');
      if (freq.includes('month')) totalMonthly = amt;
    }
  }

  // Fallback: sum recommended app costs if no summary table
  if (totalMonthly === 0) {
    totalMonthly = apps
      .filter((a) => a.recommended)
      .reduce((s, a) => s + a.costMonthly, 0);
  }

  return {
    found:        apps.length > 0,
    apps,
    totalMonthly: Math.round(totalMonthly * 100) / 100,
    totalAnnual:  Math.round(totalMonthly * 12 * 100) / 100,
  };
}

// ─── Risks parser ─────────────────────────────────────────────────────────────

/**
 * @typedef {Object} RiskItem
 * @property {string} id
 * @property {string} severity   'red' | 'yellow' | 'orange' | 'blue'
 * @property {string} title
 * @property {string} mitigation
 * @property {string} owner
 * @property {string} source
 */

/**
 * @typedef {Object} RisksResult
 * @property {boolean}    found
 * @property {string}     [reason]
 * @property {RiskItem[]} hardBlockers
 * @property {RiskItem[]} flags
 * @property {RiskItem[]} openItems
 * @property {RiskItem[]} assumptions
 */

/**
 * Parse a risks.md file into the four severity buckets.
 *
 * @param {string} filePath
 * @returns {RisksResult}
 */
export function parseRisks(filePath) {
  const text = readOrNull(filePath);
  if (!text) {
    return {
      found:        false,
      reason:       `File not found: ${filePath}`,
      hardBlockers: [],
      flags:        [],
      openItems:    [],
      assumptions:  [],
    };
  }

  /**
   * @param {string} sectionText
   * @param {string} severity
   * @returns {RiskItem[]}
   */
  const toRisks = (sectionText, severity) => {
    if (!sectionText) return [];
    const rows = parseTable(sectionText);
    return rows
      .filter((r) => {
        const vals = Object.values(r).join('');
        // Skip placeholder rows from the template
        return !vals.includes('populated if any') && vals.trim().length > 3;
      })
      .map((r, idx) => ({
        id:         r['#'] ?? String(idx + 1),
        severity,
        title:      r['risk'] ?? r['flag'] ?? r['field'] ?? r['assumption'] ?? '',
        mitigation: r['resolution path'] ?? r['action required'] ?? r['why it matters'] ?? r['impact if wrong'] ?? '',
        owner:      r['owner'] ?? '',
        source:     r['§ section'] ?? r['source'] ?? r['§ 11 row'] ?? '',
      }))
      .filter((r) => r.title.length > 0 && !r.title.startsWith('*'));
  };

  const blockerText    = extractSection(text, 'hard blockers');
  const flagText       = extractSection(text, 'flags requiring');
  const openText       = extractSection(text, 'open items');
  const assumptionText = extractSection(text, 'assumptions');

  return {
    found:        true,
    hardBlockers: toRisks(blockerText,    'red'),
    flags:        toRisks(flagText,       'yellow'),
    openItems:    toRisks(openText,       'orange'),
    assumptions:  toRisks(assumptionText, 'blue'),
  };
}

// ─── Questionnaire parser ─────────────────────────────────────────────────────

/**
 * @typedef {Object} QuestionnaireData
 * @property {boolean}  found
 * @property {string}   [reason]
 * @property {string}   consultant         From the header "**Consultant:**" line
 * @property {number[]} sectionsCompleted  § numbers with at least one answer
 * @property {string}   coreProblem        § 0.1
 * @property {string}   revenueGaps        § 0.2 — one answer per line
 * @property {string}   painPoints         § 0.3 — one answer per line
 * @property {string}   growthGoals        § 0.4 — one answer per line
 * @property {string}   deadline
 * @property {string}   budget             § 0.6
 * @property {string}   budgetPriority     § 0.6
 * @property {string}   currentPlatform    § 0.5
 * @property {string}   migrationType
 * @property {string}   mustPreserve       § 0.5
 * @property {string}   topPainPoints      § 0.5 "most unhappy with"
 * @property {string}   successMetric      § 0.4 12-month target
 */

/** @type {Omit<QuestionnaireData, 'found' | 'reason'>} */
const EMPTY_QUESTIONNAIRE = {
  consultant:        '',
  sectionsCompleted: [],
  coreProblem:       '',
  revenueGaps:       '',
  painPoints:        '',
  growthGoals:       '',
  deadline:          '',
  budget:            '',
  budgetPriority:    '',
  currentPlatform:   '',
  migrationType:     '',
  mustPreserve:      '',
  topPainPoints:     '',
  successMetric:     '',
};

/** @param {string} s */
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Extract key answers from a questionnaire Markdown file that follows
 * docs/discovery/client-questionnaire.md (§ N headings, N.M sub-headings,
 * "- Label: answer" bullets). Missing fields are returned as empty strings.
 *
 * @param {string} filePath
 * @param {string} [templatePath]  Blank questionnaire used to ignore unanswered prompts
 * @returns {QuestionnaireData}
 */
export function parseQuestionnaire(filePath, templatePath = QUESTIONNAIRE_TEMPLATE) {
  const source = readOrNull(filePath);
  if (!source) {
    return { found: false, reason: `File not found: ${filePath}`, ...EMPTY_QUESTIONNAIRE };
  }

  // Drop content lines that are identical to the blank template (keep headings
  // and table separators so structure survives).
  const templateLines = new Set(
    (filePath === templatePath ? '' : readOrNull(templatePath) ?? '')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => /\w/.test(l) && !l.startsWith('#')),
  );
  const text = filePath === templatePath
    ? source.split('\n').filter((l) => /^#/.test(l.trim())).join('\n')
    : source.split('\n').filter((l) => !templateLines.has(l.trim())).join('\n');

  /**
   * Body of the "### N.M …" sub-section, e.g. subsection('0.4').
   * @param {string} id
   * @returns {string}
   */
  const subsection = (id) => {
    const lines = text.split('\n');
    const start = lines.findIndex((l) => new RegExp(`^#{3,4}\\s+${escapeRegex(id)}\\b`).test(l));
    if (start === -1) return '';
    const end = lines.findIndex((l, i) => i > start && /^#{1,3}\s/.test(l));
    return lines.slice(start + 1, end === -1 ? undefined : end).join('\n');
  };

  /**
   * Answered bullets in a block, one per line. Unfilled template bullets
   * ("- Label:" with nothing after the colon, or a bare "…?" prompt) are skipped.
   * @param {string} block
   * @returns {string}
   */
  const bullets = (block) =>
    block
      .split('\n')
      .map((l) => l.match(/^\s*[-*]\s+(.*)$/)?.[1].trim() ?? '')
      .filter((b) => b && !/:\s*$/.test(b) && !/^\[[ x]?\]\s*$/.test(b) &&
                     !/\?(\s*\([^)]*\))?\s*$/.test(b))
      .join('\n');

  /**
   * Value of a "- Label…: value" bullet, searched in `block` (default: whole file).
   * @param {string} label  Case-insensitive label prefix
   * @param {string} [block]
   * @returns {string}
   */
  const labelled = (label, block = text) => {
    const re = new RegExp(`^\\s*[-*]\\s+${escapeRegex(label)}[^:\\n]*:[ \\t]*(\\S.*)$`, 'im');
    return block.match(re)?.[1].trim() ?? '';
  };

  // A § counts as completed if it holds an answered bullet or a table data row
  // that is not a verbatim copy of the template.
  const sectionsCompleted = [];
  const sectionRe = /^##\s+§\s*(\d+)[^\n]*\n([\s\S]*?)(?=^##\s|(?![\s\S]))/gm;
  for (const [, num, body] of text.matchAll(sectionRe)) {
    const tableRows = tableBlocks(body).flatMap((b) => b.slice(2))
      .filter((l) => !/^\|[\s:|-]+\|$/.test(l) && !isPlaceholderRow(splitRow(l)));
    if (bullets(body) || tableRows.length > 0) sectionsCompleted.push(Number(num));
  }

  const s01 = subsection('0.1');
  const s02 = subsection('0.2');
  const s03 = subsection('0.3');
  const s04 = subsection('0.4');
  const s05 = subsection('0.5');
  const s06 = subsection('0.6');

  const platformBullet = bullets(s05)
    .split('\n')
    .find((b) => /moving from|migrating from|current platform|replatform/i.test(b)) ?? '';

  return {
    found:             true,
    consultant:        text.match(/\*\*Consultant:\*\*\s*([^·\n]+)/)?.[1].trim() ?? '',
    sectionsCompleted,
    coreProblem:       labelled('Single biggest problem', s01) || bullets(s01).split('\n')[0],
    revenueGaps:       bullets(s02),
    painPoints:        bullets(s03),
    growthGoals:       bullets(s04),
    deadline:          labelled('Deadline', s04) || labelled('Launch date') || labelled('Go-live'),
    budget:            labelled('Budget', s06) || bullets(s06).split('\n')[0],
    budgetPriority:    labelled('Priority', s06),
    currentPlatform:   platformBullet,
    migrationType:     labelled('Migration type') || labelled('Project type'),
    mustPreserve:      labelled('Must not be lost', s05) || labelled('Must be preserved', s05),
    topPainPoints:     labelled('Most unhappy with', s05),
    successMetric:     labelled('12-month target', s04) || labelled('Success metric'),
  };
}
