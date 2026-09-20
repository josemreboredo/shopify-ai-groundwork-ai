/**
 * @file process.js
 * @description The two processes one engine serves, and the words each one uses.
 *
 * Merkle reaches this tool from two directions. An RFP arrives and has to be
 * answered, or a client is engaged and a discovery is run. The engine underneath
 * is the same — the same question bank, the same scope gates, the same verified
 * Shopify knowledge, the same offer — but the consultant is doing two different
 * jobs, and showing them the union of both is what makes the tool feel like one
 * process done badly instead of two done on purpose.
 *
 * "Engagement" is also simply wrong on a bid: an engagement is work you have
 * already been given, and a bid is work you are trying to win. It is the same
 * record at two stages, though — a bid that wins becomes an engagement — so the
 * record is not renamed and the URLs do not move. Only the words change, and the
 * order of the steps.
 *
 * @module discovery/service/process
 */

/** @typedef {'rfp'|'discovery'} Process */

export const PROCESSES = {
  rfp: {
    id: 'rfp',
    label: 'RFP response',
    /** What one record is called while it is this process. */
    record: 'Bid',
    /** What starting one is called. */
    start: 'Respond to an RFP',
    /** The client-facing document this process produces. */
    document: 'Proposal',
    lede: 'An RFP has arrived. Read it in, confirm what it says, ask the few questions that change the answer, and write the proposal.',
  },
  discovery: {
    id: 'discovery',
    label: 'Discovery',
    record: 'Engagement',
    start: 'Run a discovery',
    document: 'Discovery Closing Document',
    lede: 'A consultant-led discovery: work through the questions with the client, then write the closing document and the backlog.',
  },
};

export const PROCESS_IDS = Object.keys(PROCESSES);

/**
 * Records written before the tool knew about processes are discoveries — that is
 * what they were. Anything unrecognised falls the same way rather than throwing:
 * a bad value in one row must not take the whole engagement list down.
 *
 * @param {string|null|undefined} value
 * @returns {Process}
 */
export const processOf = (value) => (value === 'rfp' ? 'rfp' : 'discovery');

/** @param {string|null|undefined} value */
export const processMeta = (value) => PROCESSES[processOf(value)];

/**
 * The work, as the consultant actually does it.
 *
 * Five equal tabs told nobody where they were: the consultant had to rebuild the
 * process in their head on every visit, which is what made the tool feel
 * confusing — not where the controls lived. So the job is a numbered spine with
 * state, and the things that are not steps (the summary, the settings) sit to
 * one side. The tool says what to do next; that is what makes it easy.
 *
 * Steps are derived from the engagement's own counts, never stored, so they can
 * never disagree with it.
 */
const STEPS = {
  rfp: (e) => [
    {
      path: '',
      label: 'Read the RFP',
      done: e.documents > 0,
      hint: e.documents ? `${e.documents} document${e.documents > 1 ? 's' : ''} read` : 'Nothing read in yet',
    },
    {
      path: 'review',
      label: 'Confirm what it says',
      done: e.documents > 0 && e.to_review === 0,
      hint: e.to_review ? `${e.to_review} to confirm` : e.documents ? 'All confirmed' : null,
    },
    {
      path: 'clarifications',
      label: 'Send the questions',
      done: Boolean(e.clarifications_at),
      hint: e.clarifications_at ? `Prepared ${e.clarifications_at}` : 'The few that change the answer',
    },
    {
      path: 'closing-document',
      label: 'Write the proposal',
      done: Boolean(e.closing_document_at),
      hint: e.closing_document_at ? `Saved ${e.closing_document_at}` : null,
    },
    // Winning happens weeks later. It has no business on the first screen of an
    // empty bid, so it appears once there is a proposal to have won with.
    ...(e.closing_document_at ? [{ path: 'settings', label: 'Did we win it?', done: false, hint: 'Turn it into an engagement' }] : []),
  ],
  discovery: (e) => [
    {
      path: '',
      label: 'Ask the questions',
      done: (e.coverage?.required_total ?? 0) > 0 && e.coverage.required_answered >= e.coverage.required_total,
      hint: e.coverage ? `${e.coverage.required_answered} of ${e.coverage.required_total} required` : null,
    },
    {
      path: 'review',
      label: 'Review the answers',
      done: e.to_review === 0 && (e.coverage?.required_answered ?? 0) > 0,
      hint: e.to_review ? `${e.to_review} to confirm` : null,
    },
    {
      path: 'closing-document',
      label: 'Write the closing document',
      done: Boolean(e.closing_document_at),
      hint: e.closing_document_at ? `Saved ${e.closing_document_at}` : null,
    },
  ],
};

/**
 * The steps with their state. Exactly one is "current": the first that is not
 * done, so the page the consultant should be on is the one the spine points at.
 *
 * @param {object} engagement  an engagement summary
 * @returns {Array<{ path: string, label: string, hint: string|null, state: 'done'|'current'|'todo', n: number }>}
 */
export function stepsFor(engagement) {
  const e = engagement ?? {};
  const steps = STEPS[processOf(e.process)](e);
  // Progress does not skip. A step can satisfy its own condition while an earlier
  // one does not — nothing is left to confirm because nothing has been collected
  // yet — and showing that as "done" ahead of the current step reads as a bug and
  // is a lie about the work: you have not finished reviewing answers you have not
  // got. So the first unmet step ends the run, and everything after it is still
  // to do.
  const current = steps.findIndex((s) => !s.done);
  return steps.map((s, i) => ({
    path: s.path,
    label: s.label,
    hint: s.hint ?? null,
    n: i + 1,
    state: current === -1 || i < current ? 'done' : i === current ? 'current' : 'todo',
  }));
}

/**
 * Everything that is worth reaching but is not a step: reference views, and the
 * one place the settings live. On a bid the questions to the client are the
 * step; in a discovery the consultant is already talking to them, so they are a
 * view like any other.
 *
 * @param {object} engagement
 */
export function viewsFor(engagement) {
  const e = engagement ?? {};
  return [
    { path: 'summary', label: 'Summary' },
    ...(processOf(e.process) === 'rfp' ? [] : [{ path: 'clarifications', label: 'Questions to the client' }]),
    { path: 'settings', label: 'Change' },
  ];
}
