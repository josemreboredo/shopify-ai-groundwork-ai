/**
 * @file deck-template.js
 * @description The Discovery Closing Deck as fixed slide templates that Claude
 * fills (owner decision 2026-09-17). Claude writes the argument — the headline of
 * every slide is the message, not a label — and code lays it out identically for
 * every engagement, so the deck reads like consulting work rather than prose on
 * slides.
 *
 * Each slide is `{ layout, ...fields }`. Unknown layouts and missing fields are
 * rejected before anything is saved.
 *
 * @module discovery/service/deck-template
 */

const str = (description, max) => ({ type: 'string', description, ...(max ? { maxLength: max } : {}) });
const list = (items, description, max) => ({ type: 'array', description, items, ...(max ? { maxItems: max } : {}) });

/** Layout catalogue: what each slide type is for and which fields it takes. */
export const LAYOUTS = {
  title: {
    purpose: 'Opening slide. Once, first.',
    fields: { client: str('Client name'), project: str('Project name'), subtitle: str('One line: the recommendation in a sentence', 160), date: str('YYYY-MM-DD'), consultant: str('Lead Consultant') },
    required: ['client', 'project', 'subtitle', 'date'],
  },
  agenda: {
    purpose: 'What the deck covers. Once, after the title.',
    fields: { headline: str('Slide message', 120), items: list(str('Section name', 60), 'Sections in order', 12) },
    required: ['headline', 'items'],
  },
  section: {
    purpose: 'Divider before a part of the story.',
    fields: { number: str('Section number, e.g. "03"', 4), title: str('Section title', 60), kicker: str('One line on what this section answers', 140) },
    required: ['number', 'title'],
  },
  statement: {
    purpose: 'One decision, recommendation or finding that deserves a slide of its own.',
    fields: { headline: str('The statement, as a full sentence', 200), support: list(str('Supporting line', 160), 'Two or three lines of evidence', 4), evidence: str('Question ids or exit rules behind it, e.g. "Q3.1.1 · 11.14"', 80) },
    required: ['headline'],
  },
  bullets: {
    purpose: 'A short argued list. Never more than six lines.',
    fields: { headline: str('Slide message, not a label', 200), bullets: list(str('One line each', 180), 'At most six', 6), footnote: str('Sources or evidence', 160) },
    required: ['headline', 'bullets'],
  },
  two_column: {
    purpose: 'Two sides of one point: today and proposed, keep and change, client and Merkle.',
    fields: {
      headline: str('Slide message', 200),
      left: { type: 'object', properties: { title: str('Left title', 60), bullets: list(str('One line', 160), 'At most five', 5) }, required: ['title', 'bullets'], additionalProperties: false },
      right: { type: 'object', properties: { title: str('Right title', 60), bullets: list(str('One line', 160), 'At most five', 5) }, required: ['title', 'bullets'], additionalProperties: false },
      footnote: str('Sources or evidence', 160),
    },
    required: ['headline', 'left', 'right'],
  },
  kpis: {
    purpose: 'The numbers the client will be measured on.',
    fields: {
      headline: str('Slide message', 200),
      cards: list({ type: 'object', properties: { metric: str('KPI', 60), baseline: str('Today', 30), target: str('Target', 30), horizon: str('By when', 30) }, required: ['metric', 'baseline', 'target'], additionalProperties: false }, 'Three or four KPIs', 4),
      footnote: str('Evidence', 160),
    },
    required: ['headline', 'cards'],
  },
  decision: {
    purpose: 'One architecture decision: the options weighed and the call taken.',
    fields: {
      topic: str('Decision topic', 80),
      question: str('The question that had to be decided', 200),
      options: list({ type: 'object', properties: { option: str('Option', 80), pros: str('Pros, one line', 200), cons: str('Cons, one line', 200), chosen: { type: 'boolean' } }, required: ['option', 'pros', 'cons', 'chosen'], additionalProperties: false }, 'Two or three options', 3),
      decision: str('The decision taken', 200),
      rationale: str('Why, tied to the client answers', 300),
      plan_impact: str('Plan impact, e.g. "Shopify Plus" or "none"', 40),
      status: str('"Recommended" or "To validate in the Discovery Phase"', 48),
      evidence: str('Question ids behind it', 80),
      sources: list(str('Official Shopify URL'), 'Sources for the Shopify facts', 4),
    },
    required: ['topic', 'question', 'options', 'decision', 'rationale', 'status'],
  },
  problem_solution: {
    purpose: "A business problem the client described and how Shopify solves it. This is the spine of the first half of the deck: their problem, what it costs today, the Shopify answer, what changes, and how it will be measured.",
    fields: {
      problem: str("The problem in the client's own words", 200),
      cost_today: str('What it costs them today — money, hours, conversion, risk', 220),
      shopify_answer: str('How Shopify solves it, naming the features or capabilities', 300),
      what_changes: list(str('What changes for the business or the team', 160), 'Two to four lines', 4),
      measure: str('How we will know it worked (the KPI and its target)', 160),
      evidence: str('Question ids behind it', 80),
      sources: list(str('Official Shopify URL'), 'Sources for the Shopify facts', 3),
    },
    required: ['problem', 'cost_today', 'shopify_answer', 'what_changes'],
  },
  requirement: {
    purpose: 'The consulting unit: one client requirement, what Shopify does as standard, what we decide, and what it does not cover. Use it for every requirement area that carries cost, risk or a licence.',
    fields: {
      requirement: str("The requirement in the client's own words", 200),
      evidence: str('Question ids behind it, e.g. "Q5.2.7 · Q5.2.10"', 80),
      shopify_standard: str('What Shopify does natively for this, and where it stops', 300),
      decision: str('What we will do: native setting, configuration, app, theme work or custom build — name the feature or app', 200),
      level: str('native | configuration | app | theme | custom', 16),
      why: str('Why this level and not a cheaper one, in one or two sentences', 300),
      covers: list(str('What this covers', 160), 'What the client gets', 4),
      not_covered: list(str('What it does not cover, or the limit that remains', 160), 'Be explicit — this is what protects the proposal', 4),
      sources: list(str('Official Shopify URL'), 'Sources for the Shopify facts', 4),
    },
    required: ['requirement', 'shopify_standard', 'decision', 'level', 'why', 'covers', 'not_covered'],
  },
  app_case: {
    purpose: 'One app, argued: which requirement forces it, what native cannot do, what it covers, what it does not, and what it costs.',
    fields: {
      app: str('App name', 80),
      requirement: str('The requirement it serves', 200),
      native_gap: str('What Shopify cannot do natively, so the app is needed', 300),
      covers: list(str('What the app covers', 160), 'Concrete capabilities', 4),
      not_covered: list(str('What it still does not cover, or its limits', 160), 'Limits, languages, countries, plan', 3),
      cost: str('List price as published, with the period', 60),
      alternatives: list({ type: 'object', properties: { option: str('Alternative considered', 80), why_not: str('Why it was not chosen', 200) }, required: ['option', 'why_not'], additionalProperties: false }, 'Alternatives weighed, including doing it natively', 3),
      sources: list(str('App Store listing or Shopify documentation URL'), 'Sources', 3),
    },
    required: ['app', 'requirement', 'native_gap', 'covers', 'not_covered'],
  },
  gaps: {
    purpose: 'The requirements Shopify cannot meet, meets only partly, or that need a decision. Every deck needs this slide — it is what keeps the proposal honest.',
    fields: {
      headline: str('Slide message', 200),
      items: list({
        type: 'object',
        properties: {
          requirement: str('Requirement', 160),
          status: str('not covered | partly covered | needs custom build | needs a client decision', 32),
          consequence: str('What it means for the client', 200),
          option: str('What we propose to do about it', 200),
        },
        required: ['requirement', 'status', 'consequence', 'option'],
        additionalProperties: false,
      }, 'At most six per slide', 6),
      footnote: str('Evidence', 160),
    },
    required: ['headline', 'items'],
  },
  architecture: {
    purpose: 'The solution architecture as layers: storefront, Shopify core, integrations, external systems.',
    fields: {
      headline: str('Slide message — what the architecture achieves', 200),
      layers: list({ type: 'object', properties: { name: str('Layer', 60), items: list(str('Component', 60), 'Components in this layer', 6) }, required: ['name', 'items'], additionalProperties: false }, 'Three to five layers', 5),
      footnote: str('The principle behind it, or the evidence', 200),
    },
    required: ['headline', 'layers'],
  },
  table: {
    purpose: 'Structured detail: markets, integrations, apps, capabilities, data model.',
    fields: {
      headline: str('Slide message', 200),
      columns: list(str('Column header', 40), 'Three to six columns', 6),
      rows: list(list(str('Cell', 180), 'One value per column', 6), 'At most eight rows per slide; split across slides if needed', 8),
      footnote: str('Sources or evidence', 160),
    },
    required: ['headline', 'columns', 'rows'],
  },
  risks: {
    purpose: 'The risk register, ordered by what matters most.',
    fields: {
      headline: str('Slide message', 200),
      risks: list({ type: 'object', properties: { risk: str('Risk', 200), likelihood: str('low | medium | high', 10), impact: str('low | medium | high', 10), mitigation: str('Mitigation', 200), owner: str('Merkle | client | shared', 12), evidence: str('Question ids or exit rules', 60) }, required: ['risk', 'likelihood', 'impact', 'mitigation', 'owner'], additionalProperties: false }, 'At most six per slide', 6),
      footnote: str('Evidence', 160),
    },
    required: ['headline', 'risks'],
  },
  roadmap: {
    purpose: 'Phases and sprints as a timeline.',
    fields: {
      headline: str('Slide message', 200),
      phases: list({ type: 'object', properties: { name: str('Phase', 60), timing: str('When, e.g. "Sprint 0 — 2 weeks"', 40), items: list(str('What happens', 120), 'At most four', 4) }, required: ['name', 'items'], additionalProperties: false }, 'At most five phases', 5),
      footnote: str('Evidence', 160),
    },
    required: ['headline', 'phases'],
  },
  split: {
    purpose: 'A share-of-total picture: configuration versus customisation, effort by epic.',
    fields: {
      headline: str('Slide message', 200),
      segments: list({ type: 'object', properties: { label: str('Segment', 60), value: str('Count or value', 20), percent: { type: 'number', description: '0–100' } }, required: ['label', 'value', 'percent'], additionalProperties: false }, 'Two to four segments', 4),
      footnote: str('What it means for risk or speed', 200),
    },
    required: ['headline', 'segments'],
  },
  next_steps: {
    purpose: 'Who does what next. Always near the end.',
    fields: {
      headline: str('Slide message', 200),
      merkle: list(str('Action', 160), 'Merkle actions', 5),
      client: list(str('Action', 160), 'Client actions', 6),
      dates: str('Key dates, e.g. "Kick-off 2026-10-05 · Go-live 2027-02-01"', 120),
    },
    required: ['headline', 'client'],
  },
  investment: {
    purpose: 'The commercial slide. Price band only, never a breakdown.',
    fields: {
      headline: str('Slide message', 200),
      offer: str('Offer name and code', 80),
      band: str('Price band exactly as given', 60),
      note: str('The fixed-price note', 200),
      recurring: list(str('Recurring third-party cost', 160), 'Subscriptions billed by third parties', 5),
    },
    required: ['headline', 'offer', 'band'],
  },
};

/** JSON Schema for the deck Claude returns (structured output: every field required, no extras). */
export function buildDeckSchema() {
  const slide = (name, spec) => ({
    type: 'object',
    additionalProperties: false,
    description: spec.purpose,
    properties: { layout: { const: name }, ...spec.fields },
    required: ['layout', ...spec.required],
  });
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      slides: {
        type: 'array',
        description: 'The deck in order. Start with title and agenda, use section dividers between parts, and keep one message per slide.',
        items: { anyOf: Object.entries(LAYOUTS).map(([name, spec]) => slide(name, spec)) },
      },
    },
    required: ['slides'],
  };
}

/** Human-readable catalogue for the prompt. */
export const layoutGuide = () => Object.entries(LAYOUTS)
  .map(([name, spec]) => `- **${name}** — ${spec.purpose} Fields: ${Object.keys(spec.fields).join(', ')} (required: ${spec.required.join(', ')}).`)
  .join('\n');

/**
 * Validate a deck Claude returned. Returns the problems, empty when it is usable.
 *
 * @param {{ slides?: Array<object> }} deck
 * @returns {string[]}
 */
export function deckErrors(deck) {
  const slides = deck?.slides;
  if (!Array.isArray(slides) || !slides.length) return ['deck.slides is empty — the deck needs slides'];
  const errors = [];
  slides.forEach((slide, i) => {
    const where = `slide ${i + 1} (${slide?.layout ?? 'no layout'})`;
    const spec = LAYOUTS[slide?.layout];
    if (!spec) {
      errors.push(`${where}: unknown layout — use one of ${Object.keys(LAYOUTS).join(', ')}`);
      return;
    }
    for (const field of spec.required) {
      const value = slide[field];
      const empty = value === undefined || value === null || value === ''
        || (Array.isArray(value) && value.length === 0);
      if (empty) errors.push(`${where}: ${field} is required`);
    }
    for (const key of Object.keys(slide)) {
      if (key !== 'layout' && !(key in spec.fields)) errors.push(`${where}: ${key} is not a field of the ${slide.layout} layout`);
    }
    if (slide.layout === 'table' && Array.isArray(slide.rows)) {
      const width = slide.columns?.length ?? 0;
      slide.rows.forEach((row, r) => {
        if (!Array.isArray(row) || row.length !== width) errors.push(`${where}: row ${r + 1} has ${row?.length ?? 0} cells, the table has ${width} columns`);
      });
    }
    if (slide.layout === 'decision' && Array.isArray(slide.options) && !slide.options.some((o) => o.chosen)) {
      errors.push(`${where}: mark the chosen option`);
    }
  });
  if (slides[0]?.layout !== 'title') errors.push('the first slide must be the title slide');
  const count = (layout) => slides.filter((s) => s.layout === layout).length;
  if (count('decision') < 3) errors.push(`the deck needs a slide per architecture decision (found ${count('decision')}, at least three)`);
  if (count('requirement') < 5) errors.push(`the deck needs requirement slides — what the client asked for, what Shopify does as standard, what we decide and what it does not cover (found ${count('requirement')}, at least five)`);
  if (!count('gaps')) errors.push('the deck needs the gaps slide: what Shopify cannot cover, only partly covers, or what needs a client decision');
  if (!count('architecture')) errors.push('the deck needs the solution architecture slide');
  if (count('problem_solution') < 2) errors.push(`the deck needs problem slides — the client's problem, what it costs today and how Shopify solves it (found ${count('problem_solution')}, at least two)`);
  if (!count('risks')) errors.push('the deck needs the risk register');
  for (const s of slides.filter((x) => x.layout === 'requirement')) {
    if (!/^(native|configuration|app|theme|custom)$/i.test(String(s.level ?? ''))) errors.push(`requirement "${s.requirement}": level must be native, configuration, app, theme or custom`);
  }
  return errors;
}
