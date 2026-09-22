import { Link } from 'react-router';

import { CONNECTOR, pageTitle } from '../brand.js';

export const meta = () => [
  { title: pageTitle('Run a discovery', 'Manual') },
  { name: 'description', content: 'The discovery path step by step: interview the client, review and confirm, agree the scope with the closing document, and hand over the backlog and the workbook to delivery.' },
];

const CONTENTS = [
  ['start', '1. Start the discovery'],
  ['interview', '2. Interview the client'],
  ['documents', '3. Pre-fill from documents (optional)'],
  ['review', '4. Review and confirm'],
  ['summary', '5. Check the summary'],
  ['closing', '6. Agree the scope — the closing document'],
  ['share', '7. Review and share it'],
  ['changes', '8. When answers change afterwards'],
  ['handover', '9. Hand over to delivery'],
];

export default function ManualDiscovery() {
  return (
    <main id="main" className="manual">
      <header className="page-head">
        <p className="eyebrow"><Link to="/manual">Manual</Link> · the discovery path</p>
        <h1>Run a discovery</h1>
        <p>The work is won and paid. Nothing has to be persuaded and everything has to be exact, because what comes out of this is what the build team executes. Read <Link to="/manual">the rules and the set-up</Link> first — they apply here too.</p>
      </header>

      <div className="card">
        <p className="question">The path in one line</p>
        <p>Start the discovery → consent → interview the client → confirm every answer → write the closing document → review and share → hand over the backlog and the workbook.</p>
        <p className="muted">A discovery does not end at the client document. It ends at the handover.</p>
      </div>

      <nav aria-label="Contents">
        <h2>Contents</h2>
        <ul className="toc">{CONTENTS.map(([id, label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ul>
      </nav>

      <h2 id="start">1. Start the discovery</h2>
      <ol>
        <li>On <Link to="/">Bids and engagements</Link>, use <strong>Run a discovery</strong>.</li>
        <li>Enter the <strong>client slug</strong> (lower case with hyphens; anonymised during the pilot), the conversation language and the depth:
          <ul>
            <li><strong>Quick</strong> — required questions only (a first call);</li>
            <li><strong>Standard</strong> — required and recommended (the default);</li>
            <li><strong>Full</strong> — every question.</li>
          </ul>
        </li>
        <li><strong>Start a discovery.</strong> The record opens on <strong>Interview the client</strong>.</li>
      </ol>
      <p className="muted">Won a bid instead of starting fresh? Do not create a new record: open the bid and use <strong>Change</strong>. Everything already confirmed carries over.</p>
      <p><strong>Consent first:</strong> question <strong>Q10.5.2</strong> is the client’s agreement to AI processing. Nothing else can be recorded until it is <em>Yes</em>.</p>

      <h2 id="interview">2. Interview the client</h2>
      <p>The step shows the next open questions, up to three at a time, with the Shopify knowledge you need under each one — what the platform does natively, which plan it needs, the documented limits and the source. The offer, the scope gates, the exit rules that have fired and the Shopify plan the answers force are on <strong>Where it stands</strong>, recomputed on every visit — the questions keep the whole page.</p>
      <ul>
        <li><strong>Record answer</strong> — the client answered. Tick <em>to confirm with client</em> if it still needs checking.</li>
        <li><strong>TBC</strong> — they don’t know yet; add a comment on what is missing and who owes it.</li>
        <li><strong>Not applicable</strong> — the question doesn’t apply to this client.</li>
        <li><strong>Comment only</strong> — no option fits: write the answer in the comment field and record it (“We only ship inside the EU”). The question counts as clarified and stays an open point for the offer.</li>
      </ul>
      <p className="muted">Typing tips: countries, currencies and languages can be typed as names in English, German, French, Italian or Spanish (“Switzerland”, “Schweiz”, “euros”, “German”) or as codes; dates are day first (<code>01/05/27</code> is 1 May 2027); table questions are filled row by row with <strong>Add row</strong>.</p>
      <ul>
        <li><strong>A STOP appears</strong> — tell the client what it means. Before the closing document, answer the wrap-up question <strong>Q10.5.5</strong>: Larger Engagement (a Merkle Enterprise Engagement with a dedicated Discovery Phase) or no bid.</li>
        <li><strong>Provisional offer</strong> — a question that decides a scope gate or the Shopify plan is still open. Prioritise those.</li>
        <li><strong>The questionnaire adapts.</strong> An answer opens the questions it makes relevant and closes the ones it rules out — sell only to consumers, and the B2B questions are never asked.</li>
      </ul>

      <h2 id="documents">3. Pre-fill from documents (optional)</h2>
      <p>Not every discovery has a document, so this is a closed accordion on the interview step rather than a step of its own. When there is a brief, a requirements list or meeting notes:</p>
      <ol>
        <li>Upload them to the client’s private Claude Project.</li>
        <li>In a chat there, enable <strong>{CONNECTOR}</strong> under <strong>+ → Connectors</strong> and paste the prepared instruction from the accordion.</li>
        <li>Claude records what they answer, each with its citation, as answers <strong>to confirm</strong>. Answered questions leave the interview, so you only ask what is still open.</li>
      </ol>

      <h2 id="review">4. Review and confirm</h2>
      <p>The <strong>Review and confirm</strong> step is every question by section with its state: edit an answer, clear one, or reopen a TBC, not-applicable or commented question. Anything Claude read out of a document sits here with its citation until you confirm it — one row at a time, or all at once when you have checked the batch.</p>
      <p className="muted">Answers you don’t confirm stay “to confirm” and show up as open points in the summary and in the closing document.</p>

      <h2 id="summary">5. Check the summary</h2>
      <p>The <strong>Summary</strong> shows the offer, GO or STOP, scope gates, exit rules with their evidence, the Shopify plan, app signals, open items and all answers by section, and downloads as Markdown. It is an <strong>internal working view</strong> — it carries the offer, so it is never a client document. Use it to decide whether the discovery is complete enough to write the closing document.</p>

      <h2 id="closing">6. Agree the scope — the closing document</h2>
      <ol>
        <li>Open <strong>Agree the scope</strong>. It says <strong>Ready</strong> (with GO or STOP and the offer) or what must be fixed first.</li>
        <li>Press <strong>Open Claude and generate</strong>. The instruction is already written; you only press Enter.
          <p className="callout"><strong>Ask for the draft in Claude Cowork rather than a regular chat.</strong> It can take up to 45 minutes, and Cowork suits long-running work that produces a file.</p>
        </li>
        <li>Claude works as a Shopify Solution Architect: reads the whole engagement, researches every Shopify fact on help.shopify.com, shopify.dev, the App Store and the changelog, drafts the approach, and saves it. The engine <strong>rejects</strong> anything unsourced, untraceable to a question, or incomplete; Claude fixes the gaps and saves again.</li>
        <li>Download the deck and the annex as PowerPoint or Markdown, plus the version that keeps the consultant notes for your own preparation. Every file is versioned and previous versions are kept.</li>
      </ol>
      <div className="card">
        <p className="question">What the document contains</p>
        <p><strong>Deck:</strong> title and agenda · the recommendation as a statement · business context and KPIs · where the client is today · a slide per architecture decision with the options weighed and the chosen one marked · markets, integrations and capabilities as tables · configuration versus customisation · the risk register · the roadmap · apps and costs · investment · next steps.</p>
        <p><strong>Annex:</strong> the analysis behind each decision (criteria, every option with pros and cons, why the rejected ones were rejected, what would change the decision) · the capability analysis · appendices and user stories · the bibliography · Merkle’s verified Shopify reference chapters, added automatically.</p>
        <p className="muted">Standard: each section opens with its conclusion; client facts cite their question (e.g. [Q3.1.1]) and are quoted in the annex; Shopify facts cite numbered official sources with a quote and the date they were checked. Consultant notes stay out of the client deck.</p>
      </div>

      <h2 id="share">7. Review and share it</h2>
      <ol>
        <li><strong>Check the decisions marked “to validate”</strong> and the assumptions — they are the agenda for the next client conversation.</li>
        <li><strong>Spot-check the sources</strong> behind the plan decision, the architecture decisions and anything the client will challenge. The engine proves a source is official and present, not that the page says what the document claims.</li>
        <li><strong>Check the investment section</strong> shows only the price band and the recurring third-party costs.</li>
        <li><strong>Use the client version</strong> of the PowerPoint for anything that reaches the client, and remove a “Before presenting” list if there is one.</li>
      </ol>

      <h2 id="changes">8. When answers change afterwards</h2>
      <p>A discovery rarely stops when the document is written: the client confirms a figure, a TBC gets answered, a decision moves.</p>
      <ol>
        <li>The step marks the saved document <strong>up to date</strong> or <strong>N answers changed since</strong>.</li>
        <li>When it is out of date, it lists exactly which questions moved, with the old and the new answer.</li>
        <li>Copy the prepared line under <strong>Ask Claude</strong> — it names the changes — and paste it into your Claude Project or Cowork chat.</li>
        <li>Claude redoes the approach and the document, not only the slides, and says what the changes moved. The previous version is kept.</li>
      </ol>
      <p className="muted">Small corrections that change nothing in the argument still show as changes. Redraft when the change could affect a decision, a risk, the plan or the scope; ignore it otherwise.</p>

      <h2 id="handover">9. Hand over to delivery</h2>
      <p>The last step, and the one that makes the discovery worth running. <strong>Hand over to delivery</strong> gives you, from the answers already decided:</p>
      <ul>
        <li><strong>The build backlog</strong> — stories across epics, each with its acceptance criteria, the fields it was built from and an agent prompt. The CSV imports straight into Jira; the Markdown is for reading.</li>
        <li><strong>The configuration workbook</strong> — tax, shipping and store set-up for the client to complete once the scope is agreed.</li>
      </ul>
      <p className="muted">No backlog on a Larger Engagement: the scope of that work is defined during the Discovery Phase, and issuing a backlog now would imply a scope nobody has agreed. The page says so rather than failing silently.</p>
      <div className="actions">
        <Link className="button" to="/manual">Back to the manual</Link>
        <Link className="button secondary" to="/manual/bid">The bid path</Link>
      </div>
      <p><Link to="/">← Bids and engagements</Link></p>
    </main>
  );
}
