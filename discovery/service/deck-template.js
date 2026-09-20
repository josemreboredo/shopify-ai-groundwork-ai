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

import { challengesFor, topChallenges } from '../agents/discovery/challenge.js';

const str = (description, max) => ({ type: 'string', description, ...(max ? { maxLength: max } : {}) });
const list = (items, description, max) => ({ type: 'array', description, items, ...(max ? { maxItems: max } : {}) });

/** High-severity findings from the adversarial pass, for the deck gate below. */
const highChallenges = (doc) => {
  if (!doc?.approach) return [];
  try {
    return topChallenges(challengesFor(doc)).filter((f) => f.severity === 'high');
  } catch {
    return [];
  }
};

/** The decision topic that carries market topology, and the audiences its impact slide covers. */
const TOPOLOGY_TOPIC = /market\s*topology|store\s*topology/i;
const LENSES = ['technical', 'project', 'merchant', 'customer'];

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
  integration: {
    purpose: 'One connected system: who owns which data, how it moves, and what happens when it fails.',
    fields: {
      system: str('System name', 80),
      role: str('What this system is the source of truth for', 200),
      direction: str('into Shopify | out of Shopify | both ways', 24),
      frequency: str('real time | near real time | scheduled | manual', 24),
      pattern: str('How it connects: native app, iPaaS, custom app, file transfer', 120),
      apis: list(str('Shopify API or event used', 80), 'The Shopify side of the integration', 5),
      failure: str('What happens when it fails: retries, reconciliation, who is alerted', 300),
      evidence: str('Question ids', 80),
      sources: list(str('Official Shopify URL'), 'Sources', 3),
    },
    required: ['system', 'role', 'direction', 'pattern', 'failure'],
  },
  data_model: {
    purpose: 'The custom data the solution needs: what lives in Shopify, in which form, written by whom.',
    fields: {
      headline: str('Slide message', 200),
      entries: list({
        type: 'object',
        properties: {
          object: str('Product, variant, customer, company, order, market…', 40),
          kind: str('native field | metafield | metaobject | app data', 24),
          name: str('Field or record name', 80),
          purpose: str('What it is for', 160),
          source: str('Which system writes it', 60),
        },
        required: ['object', 'kind', 'name', 'purpose', 'source'],
        additionalProperties: false,
      }, 'At most seven rows', 7),
      not_modelled: list(str('What cannot be modelled in Shopify, and what we do instead', 160), 'The limits', 3),
      footnote: str('Sources or evidence', 160),
    },
    required: ['headline', 'entries'],
  },
  migration: {
    purpose: 'What moves from the old platform, what does not, and how the cut-over runs.',
    fields: {
      headline: str('Slide message', 200),
      moves: list({ type: 'object', properties: { data: str('Data', 60), volume: str('Volume', 40), how: str('How it moves', 120) }, required: ['data', 'how'], additionalProperties: false }, 'What migrates', 6),
      does_not_move: list(str('What does not migrate, and the consequence', 160), 'Be explicit — this is what surprises clients', 4),
      cutover: list(str('Step in the cut-over, including rehearsals and the rollback', 160), 'How go-live runs', 5),
      evidence: str('Question ids or exit rules', 80),
      sources: list(str('Official Shopify URL'), 'Sources', 3),
    },
    required: ['headline', 'moves', 'does_not_move', 'cutover'],
  },
  nfr: {
    purpose: 'Non-functional requirements: performance, accessibility, privacy and security, each with a target and how it is verified.',
    fields: {
      headline: str('Slide message', 200),
      items: list({
        type: 'object',
        properties: {
          area: str('performance | accessibility | privacy | security | SEO | availability', 24),
          target: str('The measurable target', 160),
          approach: str('How we meet it', 200),
          verified: str('How and when it is verified', 120),
        },
        required: ['area', 'target', 'approach', 'verified'],
        additionalProperties: false,
      }, 'Three to five areas', 5),
      footnote: str('Sources or evidence', 160),
    },
    required: ['headline', 'items'],
  },
  open_decisions: {
    purpose: 'Decisions the client still has to make, with an owner and a date, and what happens if they slip.',
    fields: {
      headline: str('Slide message', 200),
      decisions: list({
        type: 'object',
        properties: {
          decision: str('What must be decided', 160),
          owner: str('Who decides', 60),
          needed_by: str('By when', 60),
          if_late: str('What happens if it slips', 160),
        },
        required: ['decision', 'owner', 'needed_by', 'if_late'],
        additionalProperties: false,
      }, 'At most six', 6),
      footnote: str('Evidence', 160),
    },
    required: ['headline', 'decisions'],
  },
  out_of_scope: {
    purpose: 'What this engagement does not include, so the proposal is unambiguous.',
    fields: {
      headline: str('Slide message', 200),
      later_phases: list(str('Deferred to a later phase', 160), 'Planned, but not now', 5),
      exclusions: list(str('Not included at all', 160), 'Standard and engagement-specific exclusions', 6),
      footnote: str('Evidence', 160),
    },
    required: ['headline', 'exclusions'],
  },
  operating_model: {
    purpose: 'Who runs what after go-live: the client team, Merkle, and third parties.',
    fields: {
      headline: str('Slide message', 200),
      responsibilities: list({ type: 'object', properties: { area: str('Area', 80), client: str('Client', 100), merkle: str('Merkle', 100) }, required: ['area', 'client', 'merkle'], additionalProperties: false }, 'At most six areas', 6),
      enablement: list(str('Training, SOPs or handover item', 160), 'How the team is made ready', 4),
      support: str('The support model after launch', 160),
      footnote: str('Evidence', 160),
    },
    required: ['headline', 'responsibilities'],
  },
  run_cost: {
    purpose: 'What the solution costs to run, separate from the project price.',
    fields: {
      headline: str('Slide message', 200),
      items: list({ type: 'object', properties: { item: str('Subscription or licence', 80), cost: str('Cost as published', 60), period: str('per month | per year', 20), note: str('Who pays, or what it depends on', 120) }, required: ['item', 'cost', 'period'], additionalProperties: false }, 'At most six', 6),
      total: str('Monthly total of what is known, with the currency', 80),
      footnote: str('List prices and the date they were checked', 160),
    },
    required: ['headline', 'items'],
  },
  ai_commerce: {
    purpose: 'How the store appears in AI shopping channels, and what the client must decide about it.',
    fields: {
      headline: str('Slide message', 200),
      today: str('What is true today, including what Shopify enables by default', 250),
      decisions: list(str('What the client must decide', 160), 'Enrolment, checkout in the assistant, data sharing, crawlers', 4),
      readiness: list(str('What has to be true for it to work, e.g. product data', 160), 'Preparation', 3),
      footnote: str('Sources', 160),
    },
    required: ['headline', 'today', 'decisions'],
  },
  conclusion: {
    purpose: 'The closing slide: what we recommend, what it delivers, what it does not, and what we need from the client.',
    fields: {
      headline: str('The recommendation in one sentence', 200),
      delivers: list(str('What the client gets', 160), 'The three or four outcomes that matter', 4),
      limits: list(str('What it does not solve, stated plainly', 160), 'Honest limits', 3),
      ask: list(str('What we need from the client to proceed', 160), 'The ask', 3),
      evidence: str('Question ids or exit rules', 80),
    },
    required: ['headline', 'delivers', 'ask'],
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
 * Validate a deck Claude returned: the fields of each slide, and the shape of the
 * whole deck. `doc` (the decided engagement) decides which slides this engagement
 * must carry — integrations per system, migration when replatforming, AI channels
 * when the client sells through them.
 *
 * @param {{ slides?: Array<object> }} deck
 * @param {object} [doc]  Decided engagement
 * @returns {string[]}
 */
export function deckErrors(deck, doc = {}) {
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
      if (key === 'layout') continue;
      const def = spec.fields[key];
      if (!def) {
        errors.push(`${where}: ${key} is not a field of the ${slide.layout} layout`);
        continue;
      }
      const value = slide[key];
      if (def.type === 'array' && value !== undefined && !Array.isArray(value)) {
        errors.push(`${where}: ${key} must be a list, not ${typeof value}`);
      }
      if (def.type === 'string' && value !== undefined && typeof value !== 'string') {
        errors.push(`${where}: ${key} must be text, not ${Array.isArray(value) ? 'a list' : typeof value}`);
      }
      if (def.type === 'object' && value !== undefined && (typeof value !== 'object' || Array.isArray(value))) {
        errors.push(`${where}: ${key} must be an object`);
      }
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
  const need = (layout, why) => { if (!count(layout)) errors.push(`the deck needs a ${layout} slide: ${why}`); };

  // Always: the consulting argument.
  if (count('problem_solution') < 2) errors.push(`the deck needs problem slides — the client's problem, what it costs today and how Shopify solves it (found ${count('problem_solution')}, at least two)`);
  if (count('requirement') < 5) errors.push(`the deck needs requirement slides — what the client asked for, what Shopify does as standard, the decision, why not a cheaper level, what it covers and what it does not (found ${count('requirement')}, at least five)`);
  if (count('decision') < 3) errors.push(`the deck needs a slide per architecture decision (found ${count('decision')}, at least three)`);
  need('gaps', 'what Shopify cannot cover, only partly covers, or what needs a client decision');
  need('architecture', 'the solution in layers');
  need('nfr', 'performance, accessibility, privacy and security with targets and how they are verified');
  need('open_decisions', 'the decisions the client still owes, with an owner and a date');
  need('risks', 'the risk register');
  need('out_of_scope', 'what the engagement does not include');
  need('conclusion', 'what we recommend, what it delivers, what it does not, and the ask');

  // Market topology: on more than one market it is the first architecture
  // decision, because it constrains the storefront decision that follows it.
  // The impact lenses ride on `table` rather than `two_column`: four labelled
  // audiences are four rows, and the renderer already lays a table out cleanly.
  if ((doc?.markets?.list ?? []).length > 1) {
    const decisions = slides.map((s, i) => ({ ...s, i })).filter((s) => s.layout === 'decision');
    const topology = decisions.find((s) => TOPOLOGY_TOPIC.test(String(s.topic ?? '')));
    if (!topology) {
      errors.push('the deck needs a "Market topology" decision slide — how many Shopify stores the markets run on, why, and what it rules out');
    } else {
      const earlier = decisions.find((s) => s.i < topology.i);
      if (earlier) errors.push(`the "Market topology" decision comes first among the decisions — it constrains the storefront, but "${earlier.topic}" is argued before it`);
      if ((topology.options ?? []).length < 3) errors.push('the "Market topology" decision weighs at least three options — one store with Shopify Markets, expansion stores and a hybrid');
      const teaches = slides.slice(0, topology.i).some((s) => s.layout === 'two_column' && /store|market/i.test(JSON.stringify(s)));
      if (!teaches) errors.push('the deck teaches the topology trade-off before it recommends: add a two-column slide before the decision comparing one store with Shopify Markets against separate stores per market');
      const lenses = slides.some((s) => s.layout === 'table' && LENSES.every((lens) => new RegExp(lens, 'i').test(JSON.stringify(s.rows ?? []))));
      if (!lenses) errors.push('the deck needs a table slide with the four impact lenses of the topology decision — technical, project, merchant and customer');
      if (doc?.markets?.topology?.confidence === 'to_validate' && !/assum|to validate|not yet confirmed/i.test(JSON.stringify(topology))) {
        errors.push('the topology recommendation rests on assumptions, so its slide says so — the client must see which parts would move once the open questions are answered');
      }
    }
  }

  // The adversarial pass: a high finding has to be answered somewhere in the deck
  // — in the decision, in the gaps, in the risks — not met for the first time by
  // the client. Answered means the evidence it rests on is on a slide.
  for (const finding of highChallenges(doc)) {
    const id = /(Q\d+\.\d+\.\d+|11\.\d+)/.exec(finding.evidence ?? '')?.[1];
    if (id && !JSON.stringify(slides).includes(id)) {
      errors.push(`the deck does not answer a challenge the engine raised on ${id}: ${finding.finding} — argue it in the decision, or carry it into the gaps or the risks`);
    }
  }

  // What this engagement makes necessary.
  const systems = (doc?.integrations ?? []).map((i) => String(i.system ?? '').trim()).filter(Boolean);
  if (systems.length) {
    const covered = new Set(slides.filter((s) => s.layout === 'integration').map((s) => String(s.system ?? '').trim().toLowerCase()));
    for (const system of systems) {
      if (!covered.has(system.toLowerCase())) errors.push(`the deck needs an integration slide for "${system}" — who owns the data, how it moves and what happens when it fails`);
    }
  }
  const source = doc?.migration?.source_platform;
  if (source && source !== 'none') need('migration', `what moves from ${source}, what does not, and how the cut-over runs`);
  if ((doc?.catalogue?.custom_attributes ?? []).length || (doc?.approach?.architecture?.data_model ?? []).length) {
    need('data_model', 'the custom data the solution needs and who writes it');
  }
  if ((doc?.approach?.app_shortlist ?? []).some((a) => a.recommended)) {
    need('run_cost', 'what the solution costs to run: Shopify plan, apps and third-party licences');
    const apps = (doc.approach.app_shortlist ?? []).filter((a) => a.recommended).map((a) => String(a.name).toLowerCase());
    const argued = new Set(slides.filter((s) => s.layout === 'app_case').map((s) => String(s.app ?? '').toLowerCase()));
    for (const app of apps) {
      if (![...argued].some((a) => a.includes(app.split(' ')[0]) || app.includes(a.split(' ')[0]))) {
        errors.push(`the deck needs an app case for "${app}" — which requirement forces it, what native cannot do, what it covers and what it does not`);
      }
    }
  }
  if (doc?.delivery?.support_model) need('operating_model', 'who runs what after go-live, and the support model');
  if (doc?.ai?.sell_through_agents === true) need('ai_commerce', 'how the store appears in AI shopping channels and what the client must decide');

  for (const s of slides.filter((x) => x.layout === 'requirement')) {
    if (!/^(native|configuration|app|theme|custom)$/i.test(String(s.level ?? ''))) errors.push(`requirement "${s.requirement}": level must be native, configuration, app, theme or custom`);
  }
  return errors;
}
