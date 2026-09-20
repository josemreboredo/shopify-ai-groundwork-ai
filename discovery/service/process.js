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
 * The steps, in the order the consultant does them. Same routes either way; the
 * first tab is where the answers come from, and the last is what goes out.
 *
 * On a bid the questions to the client come straight after the review, because
 * there is a window to send them and it closes. In a discovery they sit behind
 * the summary: the consultant is already talking to the client.
 */
const TABS = {
  rfp: [
    ['', 'The RFP'],
    ['review', 'Review answers'],
    ['clarifications', 'Questions to the client'],
    ['summary', 'Summary'],
    ['closing-document', 'Proposal'],
  ],
  discovery: [
    ['', 'Interview'],
    ['review', 'Review answers'],
    ['summary', 'Summary'],
    ['clarifications', 'Questions to the client'],
    ['closing-document', 'Closing document'],
  ],
};

/**
 * @param {string|null|undefined} value
 * @returns {Array<{ path: string, label: string }>}
 */
export const tabsFor = (value) => TABS[processOf(value)].map(([path, label]) => ({ path, label }));
