/**
 * @file rubric.js
 * @description The axes every architecture option is measured on.
 *
 * Experts do not improvise pros and cons: they run the same checklist every time,
 * which is why their comparisons feel complete and why two options can actually be
 * compared. A model left to write free-form pros and cons produces the opposite —
 * whichever option it thought about longest looks strongest, and the axis nobody
 * mentioned is the one that kills the project in month four.
 *
 * So each option carries an assessment on a fixed set of axes. Eight always apply.
 * The rest are switched on by the engagement itself: there is no point asking what
 * an option does for B2B buyers on a pure D2C store, and no point leaving it out
 * when the client sells wholesale.
 *
 * "Not applicable" is a valid assessment. Silence is not: an empty axis is the
 * failure this module exists to catch.
 *
 * @module discovery/rubric
 */

/**
 * @typedef {Object} Axis
 * @property {string} id
 * @property {string} label     As it reads on a client slide
 * @property {string} asks      What the assessment has to answer
 * @property {(doc: object) => boolean} [applies]  Absent means always
 */

/** @type {Axis[]} */
export const AXES = [
  { id: 'plan', label: 'Shopify plan', asks: 'Does this option need a plan above the one the engagement is targeting, and which documented feature forces it?' },
  { id: 'run_cost', label: 'Cost to run', asks: 'What it adds to the monthly bill — plan step, app subscriptions, per-order fees — at this client’s volume.' },
  { id: 'build_effort', label: 'Build effort', asks: 'How much work it is to deliver, and which parts are configuration rather than development.' },
  { id: 'time_to_launch', label: 'Time to launch', asks: 'Whether it brings the launch date closer or pushes it out, and what it blocks.' },
  { id: 'who_can_change_it', label: 'Who can change it later', asks: 'Can the client’s team change it in the admin, or does every change need a developer?' },
  { id: 'operational_load', label: 'Day-to-day effort', asks: 'What it adds to the merchant’s daily work — data to maintain, steps to repeat, things to watch.' },
  { id: 'reversibility', label: 'How hard to undo', asks: 'What it costs to reverse in a year, and what it locks the client into.' },
  { id: 'limits', label: 'Limits and platform risk', asks: 'The documented limits that remain, and anything deprecated or announced for retirement.' },

  { id: 'multi_market', label: 'Across markets', asks: 'How it behaves per country — currency, language, domain, catalogue, tax.',
    applies: (doc) => (doc.markets?.list ?? []).length > 1, raisedBy: /market|countr|currenc|languag|domain|cross-border|international|topology|expansion store/i },
  { id: 'b2b', label: 'For B2B buyers', asks: 'How it behaves for company accounts, catalogs and B2B checkout.',
    applies: (doc) => doc.b2b?.enabled === true, raisedBy: /b2b|wholesale|company|trade buyer|catalog/i },
  { id: 'retail', label: 'In store', asks: 'How it behaves on Shopify POS and for staff in the shop.',
    applies: (doc) => (doc.retail?.store_count ?? 0) > 0, raisedBy: /pos|retail|in store|shop floor|store staff/i },
  { id: 'checkout', label: 'At checkout', asks: 'What it changes in the checkout, and which extension point it depends on.',
    applies: (doc) => (doc.checkout?.customisation ?? []).some((c) => c !== 'none'), raisedBy: /checkout|payment|thank you|order status/i },
  { id: 'data_privacy', label: 'Data and privacy', asks: 'Where the data lives, who processes it, and what that means for consent and personal data.',
    applies: (doc) => (doc.integrations ?? []).length > 0 || doc.compliance?.consent_approach !== undefined, raisedBy: /data|integrat|erp|crm|pim|consent|personal|gdpr|sync/i },
  { id: 'performance_seo', label: 'Performance and SEO', asks: 'What it does to page speed, Core Web Vitals, URLs and search ranking.',
    applies: (doc) => doc.offer?.delivery_track === 'hydrogen' || (doc.migration?.source_platform ?? 'none') !== 'none', raisedBy: /performance|speed|seo|url|redirect|migrat|headless|hydrogen|theme/i },
];

/** The eight that apply to any architecture choice, whatever the engagement. */
export const CORE_AXES = AXES.filter((a) => !a.applies).map((a) => a.id);

/** Topics held to the full rubric: they touch every dimension by definition. */
const FULL_RUBRIC_TOPIC = /market\s*topology|store\s*topology/i;

const BY_ID = new Map(AXES.map((a) => [a.id, a]));

/**
 * The axes this engagement requires: the eight that always apply, plus the ones
 * its own answers switch on.
 *
 * @param {object} doc  Decided engagement
 * @returns {Axis[]}
 */
export const axesFor = (doc) => AXES.filter((axis) => !axis.applies || axis.applies(doc ?? {}));

/** The rubric as the model is told to fill it. @param {object} doc */
export const rubricBrief = (doc) => axesFor(doc).map(({ id, label, asks }) => ({ axis: id, label, asks }));

/**
 * Gaps in a decision's comparison: an option that skips an axis cannot be
 * compared with one that covers it, and the axis nobody filled in is the one that
 * surfaces after the contract is signed.
 *
 * @param {object} decision  One architecture_decisions entry
 * @param {object} doc       Decided engagement
 * @param {string} where     Where to report it
 * @returns {string[]}
 */
export function axesForDecision(decision, doc) {
  const available = axesFor(doc);
  if (FULL_RUBRIC_TOPIC.test(String(decision.topic ?? ''))) return available;
  // The decision's framing only: scanning the assessments too would make the
  // requirement grow as it is answered — write the word "data" and earn an axis.
  const text = JSON.stringify([
    decision.topic, decision.question, decision.decision, decision.rationale,
    ...(decision.options ?? []).map((o) => [o.option, o.pros, o.cons]),
  ]);
  const declared = new Set(decision.dimensions ?? []);
  // Core always. A conditional axis is required when this decision raises it
  // itself — by its own words, or because the model declared it — so a decision
  // about theme blocks is not made to write "not applicable" about POS.
  return available.filter((axis) => !axis.applies || declared.has(axis.id) || axis.raisedBy?.test(text));
}

export function rubricErrors(decision, doc, where) {
  const errors = [];
  const axes = axesForDecision(decision, doc);
  const options = decision.options ?? [];
  for (const [i, option] of options.entries()) {
    const name = option.option?.trim() || `option ${i + 1}`;
    const assessment = option.assessment ?? {};
    const missing = axes.filter((axis) => !String(assessment[axis.id] ?? '').trim());
    if (missing.length === axes.length) {
      errors.push(`${where}, "${name}": assess it on every axis of the comparison (${axes.map((a) => a.label).join(', ')}) — "not applicable" is an answer, leaving it out is not`);
    } else {
      for (const axis of missing) {
        errors.push(`${where}, "${name}": ${axis.label} is missing — ${axis.asks}`);
      }
    }
    for (const id of Object.keys(assessment)) {
      if (!BY_ID.has(id)) errors.push(`${where}, "${name}": "${id}" is not one of the comparison axes (${axes.map((a) => a.id).join(', ')})`);
    }
  }
  return errors;
}

/**
 * The comparison as a table: options across the top, axes down the side. This is
 * the shape the deck renders, and the reason the rubric is worth the writing.
 *
 * @param {object} decision @param {object} doc
 * @returns {{ columns: string[], rows: string[][] }}
 */
export function comparisonTable(decision, doc) {
  const axes = axesForDecision(decision, doc);
  const options = decision.options ?? [];
  return {
    columns: ['', ...options.map((o) => o.option)],
    rows: axes.map((axis) => [axis.label, ...options.map((o) => o.assessment?.[axis.id] ?? '—')]),
  };
}
