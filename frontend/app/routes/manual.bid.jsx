import { Link } from 'react-router';

import { CONNECTOR, pageTitle } from '../brand.js';

export const meta = () => [
  { title: pageTitle('Answer an RFP', 'Manual') },
  { name: 'description', content: 'The bid path step by step: read the RFP in, confirm what it says, take a Go/No-Go position, send the questions that change the answer, write the proposal.' },
];

const CONTENTS = [
  ['start', '1. Start the bid'],
  ['read', '2. Read the RFP in'],
  ['confirm', '3. Confirm what it says'],
  ['go-no-go', '4. Go/No-Go support'],
  ['qa', '5. RFP Q&A — the questions we send'],
  ['proposal', '6. Write the proposal'],
  ['send', '7. Review and send it'],
  ['won', '8. Did we win it?'],
];

export default function ManualBid() {
  return (
    <main className="manual">
      <header className="page-head">
        <p className="eyebrow"><Link to="/manual">Manual</Link> · the bid path</p>
        <h1>Answer an RFP</h1>
        <p>A document arrived with a deadline. Information is scarce, the clock is running, and the job is to be chosen. Read <Link to="/manual">the rules and the set-up</Link> first — they apply here too.</p>
      </header>

      <div className="card">
        <p className="question">The path in one line</p>
        <p>Start the bid → consent → Claude reads the RFP → you confirm what it says → Go/No-Go position → send the questions that change the answer → write the proposal → review and send.</p>
        <p className="muted">The steps run across the top of the record. Exactly one is current: the first that is not done.</p>
      </div>

      <nav aria-label="Contents">
        <h2>Contents</h2>
        <ul className="toc">{CONTENTS.map(([id, label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ul>
      </nav>

      <h2 id="start">1. Start the bid</h2>
      <ol>
        <li>On <Link to="/">Bids and engagements</Link>, use <strong>Answer an RFP</strong>.</li>
        <li>Enter a <strong>client slug</strong> (lower case with hyphens, e.g. <code>acme-watches</code>; use an anonymised name during the pilot) and the language of the documents.</li>
        <li><strong>Start a bid.</strong> The record opens on its first step, <strong>Read the RFP</strong>.</li>
      </ol>
      <p className="muted">A bid always runs the standard depth — required and recommended questions. Depth is a discovery’s choice, not a bid’s: on a bid you are not asking the questions, the document is answering them.</p>

      <h2 id="consent">Consent, before any document is uploaded</h2>
      <p>Question <strong>Q10.5.2</strong> is the client’s agreement that their information may be processed by AI. Nothing else can be recorded until it is <em>Yes</em>, and it has to be true: an RFP arriving in your inbox is not consent to put it through an AI tool. If the RFP process has no such clause, ask, or stop.</p>

      <h2 id="read">2. Read the RFP in</h2>
      <ol>
        <li>In Claude, open the <strong>private Project</strong> for this client and upload the RFP, the requirement lists, annexes and anything else that came with it.</li>
        <li>In a chat in that Project, enable <strong>{CONNECTOR}</strong> under <strong>+ → Connectors</strong>. The record’s first step has the instruction written out — copy it, or press <strong>Pre-fill in Claude</strong> and paste.</li>
        <li>Claude registers each document, maps what it says to the questions and records answers <strong>to confirm</strong>, each with a citation: document, section, quote. Where a document is unclear or contradicts itself, Claude marks the question TBC or leaves a note instead of guessing.</li>
      </ol>
      <div className="card">
        <p className="question">What the intake screen tells you</p>
        <p>Each document shows <strong>how many answers came out of it, across how many sections</strong>. A document that produced nothing says so rather than looking successful — that is the signal to check whether it is the right file, whether it is text rather than a scan, and whether Claude was pointed at it.</p>
        <p className="muted">On a bid this screen is the intake and nothing else: no question cards (nobody is interviewing — the document already arrived) and no engine panel (on a bid that is Go/No-Go material).</p>
      </div>

      <h2 id="confirm">3. Confirm what it says</h2>
      <p>Everything Claude recorded is waiting on a human. The <strong>Confirm what it says</strong> step is one table with every answer, its citation and two actions per row.</p>
      <ul>
        <li><strong>Confirm</strong> — the answer stands as recorded.</li>
        <li><strong>Edit</strong> — the reading is wrong or incomplete; correct it and record the corrected answer.</li>
        <li><strong>Confirm all</strong> — when you have read the extraction as a batch and it is right. Forty-six confirmations one at a time is not a review, it is a reason to skip reviewing.</li>
      </ul>
      <p className="muted">Anything important in the RFP that no question covers: add it as a <strong>consultant note</strong>. If you see the same gap in several RFPs, ask for a new question in the question bank.</p>

      <h2 id="go-no-go">4. Go/No-Go support</h2>
      <p>This is not the bid decision. That is taken in a room by people who know the relationship, the competition and the pipeline. This page is what the Solution Architect brings to that room: <strong>whether Merkle can put a number on this work and stand behind it</strong>, and what that rests on.</p>
      <table>
        <thead><tr><th>It reads</th><th>Because</th></tr></thead>
        <tbody>
          <tr><td>Nothing to go on</td><td>Nothing has been read in yet.</td></tr>
          <tr><td>Not yet</td><td>Answers are still unconfirmed. An architect cannot stand behind extractions nobody has checked — confirming them moves the position on the same bid.</td></tr>
          <tr><td>Not a standard bid</td><td>The requirements sit outside the offers. A different conversation, not a worse price.</td></tr>
          <tr><td>Ask first</td><td>Something cannot be costed and no assumption covers it. It belongs in the RFP Q&amp;A.</td></tr>
          <tr><td>Go, but ask</td><td>We can price it, on more assumptions than it should carry.</td></tr>
          <tr><td>Go</td><td>We can price it and stand behind it.</td></tr>
        </tbody>
      </table>
      <p>Underneath: what the RFP asks for, what it would take to build, what could move the margin, and what we would be betting on — each line carrying the answer it came from. The commercial questions this desk does not answer are folded away with their owners, because “that one is the Client lead’s” is a useful answer in the meeting where a guess would be a liability.</p>
      <p className="muted">You will not find a percentage on this page, by design. A coverage ratio gets argued with; counts of real things get acted on.</p>

      <h2 id="qa">5. RFP Q&amp;A — the questions we send</h2>
      <p>Every RFP has a window for questions, and it is the first thing the client reads from us. The engine chooses the topics — only unknowns that would change the offer, the Shopify plan, the store topology, the cost or the risk — and drops everything it can safely assume. Claude writes them; you decide what is sent.</p>
      <ol>
        <li>Open <strong>RFP Q&amp;A</strong>. If the engine cannot prepare them yet, the page says what is blocking it.</li>
        <li>Ask Claude to write the questions from the prepared topics. Each one shows the trade-off it turns on.</li>
        <li><strong>Ask this</strong> or <strong>Drop it</strong> per question, or accept them all.</li>
        <li>Download the client-facing version and send it in your own format.</li>
      </ol>
      <p className="muted">A handful of questions says we have read their document. Sixty says we have not. Whatever comes back unanswered is stated in the proposal as the assumption it is.</p>

      <h2 id="proposal">6. Write the proposal</h2>
      <ol>
        <li>Open the <strong>Proposal</strong> step. It says <strong>Ready</strong>, or what must be fixed first.</li>
        <li>Press <strong>Open Claude and generate</strong>. The instruction is already written; you only press Enter.
          <p className="callout"><strong>Ask for the draft in Claude Cowork rather than a regular chat.</strong> It can take up to 45 minutes, and Cowork suits long-running work that produces a file.</p>
        </li>
        <li>Claude works as a Shopify Solution Architect: reads the whole record, researches every Shopify fact on help.shopify.com, shopify.dev, the App Store and the changelog, drafts the approach — architecture decisions with their options weighed, integrations, data model, non-functional requirements, capability map, apps, risks, phases — and saves it.</li>
        <li>The engine <strong>rejects</strong> anything without an official source, without the question it comes from, or incomplete. Claude fixes the gaps and saves again. That loop is normal; let it finish.</li>
        <li>Reload the step and download the deck and the annex as PowerPoint or Markdown, plus a version that keeps the consultant notes for your own preparation. Every file carries its version (v1.0, v1.1 …) and previous versions are kept.</li>
      </ol>

      <h2 id="send">7. Review and send it</h2>
      <ol>
        <li><strong>Check what is marked “to validate”</strong> and the assumptions — on a bid those are what you are betting on.</li>
        <li><strong>Spot-check the sources</strong>: open the references behind the plan decision, the architecture decisions and anything the client will challenge. The engine proves a source is official and present, not that the page says what the document claims.</li>
        <li><strong>Check the investment section</strong> shows only the price band and the recurring third-party costs.</li>
        <li><strong>Use the client version</strong> of the PowerPoint — it stops before the consultant notes. Remove a “Before presenting” list if there is one.</li>
      </ol>
      <p className="muted">Answers changed after the draft? The step says <strong>N answers changed since</strong> and lists exactly which ones, old answer and new. Copy the prepared line into Claude: it redrafts the approach and the document, not just the slides, and keeps the previous version.</p>

      <h2 id="won">8. Did we win it?</h2>
      <p>Weeks later, the answer arrives. Once there is a proposal, the record gains a last step: <strong>Did we win it?</strong> — and <strong>Change</strong> turns the bid into the engagement in the same record. Nothing is re-entered, no answer moves, and the steps become the discovery path.</p>
      <div className="actions">
        <Link className="button" to="/manual/discovery">Continue on the discovery path</Link>
        <Link className="button secondary" to="/manual">Back to the manual</Link>
      </div>
      <p><Link to="/">← Bids and engagements</Link></p>
    </main>
  );
}
