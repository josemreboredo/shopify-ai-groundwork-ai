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
 * @module ai/shared/process
 */

/** @typedef {'rfp'|'discovery'} Process */

/**
 * Answering an RFP comes first wherever the two are listed: it is the step that
 * wins the engagement, so it is the one a consultant reaches for more often.
 */
export const PROCESSES = {
  rfp: {
    id: 'rfp',
    label: 'RFP response',
    /** What one record is called while it is this process. */
    record: 'Bid',
    /** With its article, for sentences: "This is a bid", "make it an engagement". */
    a: 'a bid',
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
    a: 'an engagement',
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
  // A bid is pre-sale. Information is scarce, the clock is running, and the first
  // commercial decision is not how to build it but whether to bid at all — the
  // engine computes that and it was buried in Q10.5.5 halfway down a
  // questionnaire. On a bid it is the step that saves the most money.
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
      // Not the decision — that is taken in a room, by people. This is what a
      // Solution Architect brings to that room: whether the document even lets us
      // price the work, what it would cost us to be wrong, and where it lands.
      path: 'go-no-go',
      label: 'Go/No-Go support',
      // The engine has a position from the moment the record exists — an empty
      // bid is a GO on the smallest offer — so "the engine computed something"
      // was never the same as "there is a position to take into the room", and
      // the step marked itself done on a bid nobody had read. It follows the
      // page's own gates now: nothing read is nothing to assess, and an
      // extraction nobody has checked is not something to stand behind.
      done: ((e.documents ?? 0) > 0 || (e.coverage?.required_answered ?? 0) > 0) && (e.to_review ?? 0) === 0 && Boolean(e.go || e.route),
      // The step used to state the engine's commercial position — "Within the
      // offers · S" — while the page it links to applies its own gates and could
      // read "ASK FIRST — part of this cannot be costed at all". Two verdicts,
      // one step. The page owns the position; the step says whether there is one
      // to read.
      // A route beyond the offers is the engine's own classification and the page
      // says the same thing, so it stays. "Within the offers · S" did not: the
      // page applies its own gates and can read "ASK FIRST — part of this cannot
      // be costed at all" beside it. The page owns the position; the step says
      // whether there is one worth reading.
      hint: !(e.documents ?? 0) && !(e.coverage?.required_answered ?? 0)
        ? 'Nothing to assess yet'
        : e.to_review
          ? `${e.to_review} to confirm first`
          : e.route
            ? ROUTE_LABEL[e.route] ?? e.route
            : 'The position, and what it rests on',
    },
    {
      path: 'clarifications',
      label: 'RFP Q&A',
      // Saved is not decided: the proposal refuses to run while anything is
      // undecided, so marking this done on the save alone had the spine say
      // finished while the next step said blocked.
      done: Boolean(e.clarifications_at) && !e.clarifications_undecided,
      hint: e.clarifications_undecided
        ? `${e.clarifications_undecided} still to decide`
        : e.clarifications_at ? `Prepared ${e.clarifications_at}` : 'What we must ask to price it',
    },
    {
      // The last thing you check before committing to a price. Everything the
      // proposal will rest on is settled by now — what was confirmed, what the
      // engine concluded, what is asked and what is assumed — and this is the one
      // page that shows it together. It was a side view, which is where a
      // consultant never looks at the moment it matters.
      path: 'summary',
      label: 'Check where it stands',
      // Its own condition. It shared one with "Write the proposal", so the two
      // flipped together and the spine pointed at the summary for ever — the
      // step that actually produces the document was never the current one.
      // The check is passed when nothing is left blocking it — and an empty bid
      // blocks nothing, which is not the same as being settled: with no document
      // read there is nothing to confirm, nothing to ask and nothing to check.
      done: (e.documents ?? 0) > 0 && e.to_review === 0 && !e.clarifications_undecided && Boolean(e.go || e.route),
      hint: (e.documents ?? 0) ? 'Everything the proposal will rest on, in one page' : 'Nothing to check yet',
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
  // A discovery is won and paid. Nothing has to be persuaded; everything has to be
  // exact, because what comes out of it is what the build team executes. So it
  // does not end at the client document — it ends at the handover.
  discovery: (e) => [
    {
      path: '',
      label: 'Interview the client',
      done: (e.coverage?.required_total ?? 0) > 0 && e.coverage.required_answered >= e.coverage.required_total,
      hint: e.coverage ? `${e.coverage.required_answered} of ${e.coverage.required_total} required` : null,
    },
    {
      path: 'review',
      label: 'Review and confirm',
      done: e.to_review === 0 && (e.coverage?.required_answered ?? 0) > 0,
      hint: e.to_review ? `${e.to_review} to confirm` : null,
    },
    {
      path: 'closing-document',
      label: 'Agree the scope',
      done: Boolean(e.closing_document_at),
      hint: e.closing_document_at ? `Saved ${e.closing_document_at}` : 'The closing document, for sign-off',
    },
    {
      path: 'handover',
      label: 'Hand over to delivery',
      done: false,
      hint: 'Jira backlog and the configuration workbook',
    },
  ],
};

/** How a route beyond the offers reads in a step hint. */
const ROUTE_LABEL = {
  larger_engagement: 'Larger Engagement — a dedicated Discovery Phase',
  arc: 'Merkle Arc',
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
    // A step can meet its own condition while an earlier one does not — a closing
    // document saved before the interview finished. Progress still stops at the
    // first unmet step, but "met, and waiting on the work before it" is not the
    // same as untouched, and a hint reading "Saved 2026-09-18" under a step
    // styled as never started says two different things at once.
    satisfied: s.done,
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
  const rfp = processOf(e.process) === 'rfp';
  return [
    // On a bid the summary is the check before the price is committed, so it is a
    // step. In a discovery it stays what it always was: reference.
    ...(rfp ? [] : [{ path: 'summary', label: 'Summary' }]),
    // The questions are a step on a bid, where the window closes; in a discovery
    // the consultant is already talking to the client, so they are a view. The
    // handover is the mirror of that: a discovery's last step, a bid's side note.
    ...(rfp ? [{ path: 'handover', label: 'Handover' }] : [{ path: 'clarifications', label: 'Questions to the client' }]),
    { path: 'settings', label: 'Settings' },
  ];
}
