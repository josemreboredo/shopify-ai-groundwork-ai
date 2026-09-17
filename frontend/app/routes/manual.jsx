import { Link } from 'react-router';

import { originOf } from '../origin.server.js';
import { connectorUrl } from '../../../discovery/service/project-kit.js';

export const meta = () => [{ title: 'Lead Consultant manual · Merkle Discovery' }];

export async function loader({ request }) {
  return { connector: connectorUrl(originOf(request)) };
}

const STEPS = [
  ['rules', 'Before you start'],
  ['setup', 'One-time set-up'],
  ['create', '1. Create the engagement'],
  ['consent', '2. Record the client’s consent'],
  ['project', '3. Pre-fill from documents in your Claude Project'],
  ['review', '4. Review what Claude recorded'],
  ['interview', '5. Run the questionnaire with the client'],
  ['summary', '6. Check the summary'],
  ['closing', '7. Generate the Discovery Closing Document'],
  ['share', '8. Review and share the document'],
  ['changes', '9. When answers change afterwards'],
  ['help', 'Troubleshooting'],
  ['next', 'After the closing document'],
];

export default function Manual({ loaderData }) {
  const { connector } = loaderData;
  return (
    <main className="manual">
      <h1>Lead Consultant manual</h1>
      <p>How to run a Shopify discovery with this tool and your Claude Project, from the client’s RFP to the Discovery Closing Document.</p>

      <div className="card">
        <p className="question">The flow in one line</p>
        <p>Create the engagement → client consent → Claude pre-fills answers from the RFP → you confirm them → interview the client on what is still open → ask Claude for the Discovery Closing Document → review, download and share.</p>
        <p className="muted">The web app and your Claude Project share the same engagement through the <strong>Merkle Discovery</strong> connector: what Claude records appears here, and what you record here is visible to Claude.</p>
      </div>

      <nav aria-label="Contents">
        <h2>Contents</h2>
        <ol className="toc">{STEPS.map(([id, label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ol>
      </nav>

      <h2 id="rules">Before you start</h2>
      <ul>
        <li><strong>Pilot: demo or anonymised engagements and documents only.</strong> Real client data moves to dentsu’s systems and Claude Enterprise first.</li>
        <li><strong>Consent first.</strong> Upload client documents to Claude only after the client has agreed that their information may be processed by AI (step 2).</li>
        <li><strong>No personal data.</strong> Record roles (“Head of Wholesale”), never names, e-mail addresses or phone numbers. The tool refuses e-mail addresses, phone numbers and card numbers.</li>
        <li><strong>Internal pricing stays internal.</strong> The Summary page and the Consultant notes section of the closing document contain the offer and internal information — never send them to the client as they are.</li>
        <li><strong>The engine decides.</strong> The offer, scope gates, exit rules (STOP, FLAG, WARN) and the Shopify plan come from rules in the tool, not from Claude or from you. Claude drafts; the engine checks.</li>
      </ul>

      <h2 id="setup">One-time set-up</h2>
      <ol>
        <li><strong>Sign in</strong> to this web app with your GitHub account.</li>
        <li><strong>Add the connector in Claude</strong>: Customize → Connectors → Add custom connector, name <code>Merkle Discovery</code>, URL <code>{connector}</code>. Claude opens this app: sign in and click <strong>Allow</strong>. Full details and the Project instructions: <Link to="/claude">Claude Project</Link>.</li>
        <li><strong>In Claude, use the strongest model</strong> available to you for discovery work, and keep <strong>web search</strong> turned on — Claude needs it to check Shopify’s documentation when it writes the closing document.</li>
      </ol>

      <h2 id="create">1. Create the engagement</h2>
      <ol>
        <li>On <Link to="/">Engagements</Link>, under <strong>Start an interview</strong>, enter a <strong>client slug</strong> (lower case with hyphens, e.g. <code>acme-watches</code>; use an anonymised name during the pilot), the conversation language and the mode:
          <ul>
            <li><strong>Quick</strong> — required questions only (a first call, a short RFP response);</li>
            <li><strong>Standard</strong> — required and recommended questions (the default for a discovery);</li>
            <li><strong>Full</strong> — every question.</li>
          </ul>
        </li>
        <li>Click <strong>Start</strong>. The engagement opens on the <strong>Interview</strong> tab. Every signed-in consultant can see and work on it during the pilot.</li>
      </ol>

      <h2 id="consent">2. Record the client’s consent</h2>
      <p>The first question is always <strong>Q10.5.2 — consent for AI processing</strong>. Nothing else can be recorded until it is answered <em>Yes</em>. Answer it only when the client has actually agreed.</p>

      <h2 id="project">3. Pre-fill from documents in your Claude Project</h2>
      <ol>
        <li>In Claude, create a <strong>private Project</strong> for the engagement and paste the Project instructions from the <Link to="/claude">Claude Project</Link> page, replacing <code>&lt;client slug&gt;</code>.</li>
        <li>Upload the RFP, briefs, requirement lists, architecture diagrams or meeting notes to the Project.</li>
        <li>In a chat in the Project, enable <strong>Merkle Discovery</strong> under <strong>+ → Connectors</strong> and ask: <code>Read the documents and pre-fill the engagement &lt;client slug&gt;.</code></li>
        <li>Claude registers each document, maps what it says to the questions and records answers <strong>to confirm</strong>, each with a citation (document, section, quote). Where a document is unclear or contradicts itself, Claude marks the question TBC or adds a note instead of guessing.</li>
      </ol>
      <div className="card">
        <p className="question">Do the questions change because of the documents?</p>
        <p>The questions themselves don’t — every question feeds the offer, the rules and the backlog, so all engagements use the same question bank. What changes is <strong>which questions you still need to ask</strong>: answered questions leave the interview, and the skip rules use the answers (for example, if the RFP says the client sells only to consumers, the B2B questions are not asked).</p>
        <p className="muted">Anything important in the RFP that no question covers: add it as a <strong>consultant note</strong> on the Interview tab. If you see the same gap in several RFPs, ask for a new question in the question bank.</p>
      </div>

      <h2 id="review">4. Review what Claude recorded</h2>
      <ol>
        <li>Open the <strong>Interview</strong> tab: <strong>Answers to confirm</strong> lists everything recorded from documents with its citation, and <strong>Documents used</strong> lists the documents Claude read.</li>
        <li>Check each answer against the citation. Click <strong>Confirm</strong> when it is right; otherwise correct it on the <strong>Review answers</strong> tab (edit the question and record the corrected answer).</li>
        <li>Answers you don’t confirm yet stay “to confirm” and show up as open points in the summary and the closing document.</li>
      </ol>

      <h2 id="interview">5. Run the questionnaire with the client</h2>
      <p>The <strong>Interview</strong> tab shows the next open questions, up to three at a time, with Shopify knowledge for you (native features, plans, documentation) under each question. The panel on the right updates the offer, GO/STOP, exit rules and Shopify plan after every answer.</p>
      <ul>
        <li><strong>Record answer</strong> — the client answered. Tick <em>to confirm with client</em> if it still needs checking.</li>
        <li><strong>TBC</strong> — the client doesn’t know yet; add a comment on what is missing.</li>
        <li><strong>Not applicable</strong> — the question doesn’t apply to this client.</li>
        <li><strong>Comment only</strong> — when no option fits, write the answer in the comment field and record it (e.g. “We only ship inside the EU”). The question counts as clarified and stays an open point for the offer.</li>
      </ul>
      <p className="muted">Typing tips: countries, currencies and languages can be typed as names in English, German, French, Italian or Spanish (“Switzerland”, “Schweiz”, “euros”, “German”) or as codes; dates are day first (<code>01/05/27</code> is 1 May 2027); table questions are filled row by row with <strong>Add row</strong>.</p>
      <ul>
        <li><strong>A STOP appears</strong> — tell the client what it means. Before the closing document, answer the wrap-up question <strong>Q10.5.5</strong>: Larger Engagement (a Merkle Enterprise Engagement with a dedicated Discovery Phase) or no bid.</li>
        <li><strong>Provisional offer</strong> — a question that decides a scope gate or the Shopify plan is still open; prioritise those.</li>
        <li><strong>Changing an answer later</strong> — use <strong>Review answers</strong>: every question by section with its state; edit, clear an answer or reopen a TBC, not-applicable or commented question.</li>
      </ul>

      <h2 id="summary">6. Check the summary</h2>
      <p>The <strong>Summary</strong> tab shows the offer, GO or STOP, scope gates, exit rules, Shopify plan, app signals, open items and all answers by section, and downloads as Markdown. It is an <strong>internal working summary</strong> (it contains the offer) — not a client document. Use it to decide whether discovery is complete enough to write the closing document.</p>

      <h2 id="closing">7. Generate the Discovery Closing Document</h2>
      <ol>
        <li>Open the engagement’s <strong>Closing document</strong> tab. It says <strong>Ready</strong> (with GO or STOP and the offer) or what must be fixed first.</li>
        <li>Ask Claude for the draft — strongest model, web search on, Merkle Discovery enabled: <code>Draft the Discovery Closing Document for &lt;client slug&gt;.</code>
          <p className="callout"><strong>Tip: ask for the draft in Claude Cowork rather than a regular chat.</strong> Generating the document can take up to 45 minutes, and Cowork is better suited to long-running work that produces a file.</p>
        </li>
        <li>Claude works as a Shopify Solution Architect:
          <ul>
            <li>reads the whole engagement;</li>
            <li>researches every Shopify fact on help.shopify.com, shopify.dev, the Shopify App Store and the Shopify changelog;</li>
            <li>drafts the approach — architecture decisions with options, integration architecture, data model, non-functional requirements, capability map, apps, risk register, phases;</li>
            <li>saves it; the engine <strong>rejects</strong> anything without an official source, without the question it comes from, or incomplete, and Claude fixes it and saves again;</li>
            <li>writes and saves two documents: the deck narrative and the annex.</li>
          </ul>
        </li>
        <li>This can take up to 45 minutes and can need a few rounds. Let Claude finish; if it stops, ask it to continue.</li>
        <li>Reload the <strong>Closing document</strong> tab and download what you need: <strong>PowerPoint (client version)</strong> for the meeting, <strong>PowerPoint (with consultant notes)</strong> for your own preparation, the <strong>Markdown</strong> of the narrative, and the <strong>annex document</strong> with the detailed analysis, the Shopify reference chapters and the bibliography. Each new version keeps the previous ones.</li>
      </ol>
      <div className="card">
        <p className="question">What the document contains</p>
        <p><strong>Deck:</strong> cover · executive summary · business context · how discovery was run · where the client is today · solution design with architecture decisions, integration architecture, data model and non-functional requirements · capability map · scope and phases · apps · configuration vs customisation · scope by epic · risks · out of scope · next steps · timeline · investment · <strong>Consultant notes</strong> (internal, left out of the client PowerPoint).</p>
        <p><strong>Annex:</strong> the analysis behind each decision (criteria, every option with pros and cons, why the rejected options were rejected, what would change the decision) · the capability analysis · appendices and user stories · the bibliography · Merkle's verified Shopify reference chapters (plans, Markets, Managed Markets, payments and multi-currency, Liquid vs Hydrogen, B2B, migration, AI and agentic commerce), added automatically.</p>
        <p className="muted">Standard: each section starts with its conclusion; client facts cite their question (e.g. [Q3.1.1]) and are quoted in the annex; Shopify facts cite numbered official sources with a quote and the date they were checked.</p>
      </div>

      <h2 id="share">8. Review and share the document</h2>
      <ol>
        <li><strong>Check the decisions marked “to validate”</strong> and the assumptions — they are the agenda for the next client conversation.</li>
        <li><strong>Spot-check the sources</strong>: open the references behind the plan decision, the architecture decisions and anything the client will challenge. The engine checks that a source is official, not that the page says what the document claims.</li>
        <li><strong>Check the investment section</strong> shows only the price band, and the recurring third-party costs.</li>
        <li><strong>Use the client version of the PowerPoint</strong> for anything that reaches the client — it stops before the Consultant notes. Remove a “Before presenting” list if there is one.</li>
        <li>Share the client version in the format your team uses (paste into your document template or slides).</li>
      </ol>
      <p className="muted">Answers changed after the document was written? Ask Claude to draft it again — the previous version is kept.</p>

      <h2 id="changes">9. When answers change afterwards</h2>
      <p>Discovery rarely stops when the document is written: the client confirms a figure, a TBC gets answered, a decision moves. The tool tracks it for you.</p>
      <ol>
        <li>The <strong>Closing document</strong> tab marks the saved document <strong>up to date</strong> or <strong>N answers changed since</strong>.</li>
        <li>When it is out of date, the tab lists exactly which questions moved, with the old and the new answer.</li>
        <li>Copy the prepared line under <strong>Ask Claude</strong> — it names the changes — and paste it into your Claude Project or Cowork chat.</li>
        <li>Claude redrafts the whole document and annex and tells you what the changes moved. The previous version is kept.</li>
        <li>Download the PowerPoint again; the tab goes back to <strong>up to date</strong>.</li>
      </ol>
      <p className="muted">Small corrections that change nothing in the argument (a spelling, a contact role) still show as changes — redraft when the change could affect a decision, a risk, the plan or the scope, and ignore it otherwise.</p>

      <h2 id="help">Troubleshooting</h2>
      <table>
        <thead><tr><th>What you see</th><th>What to do</th></tr></thead>
        <tbody>
          <tr><td>Claude doesn’t see the engagement or its tools</td><td>Enable <strong>Merkle Discovery</strong> under + → Connectors in that chat; check the slug; reconnect the connector if Claude asks you to sign in again.</td></tr>
          <tr><td>“Record the client’s consent…”</td><td>Answer Q10.5.2 first (step 2).</td></tr>
          <tr><td>Claude’s answer was rejected</td><td>The value doesn’t match the question’s options or format. Claude fixes and retries; if not, record it yourself in the web app.</td></tr>
          <tr><td>Closing document tab: “Not ready”</td><td>Read the listed reasons and fix them in <strong>Review answers</strong>.</td></tr>
          <tr><td>“Discovery hit a STOP: record how Merkle proceeds”</td><td>Answer Q10.5.5 (Larger Engagement or no bid) with your lead, then ask Claude again.</td></tr>
          <tr><td>“Approach not saved” with a list of gaps</td><td>Normal: the engine found missing sources, question ids, integrations or risks. Ask Claude to research the gaps and save again — not to remove content.</td></tr>
          <tr><td>The draft keeps failing or the research is thin</td><td>Ask the tool owner to run the Solution Architect step in Claude Code (<code>/architect</code>), which adds deeper Shopify documentation research.</td></tr>
          <tr><td>The document says “answers changed since”</td><td>Normal after any edit. Check the listed changes; redraft with the prepared line if they could affect a decision, a risk or the plan.</td></tr>
          <tr><td>Anything else</td><td>Ask the tool owner; include the client slug and what you clicked.</td></tr>
        </tbody>
      </table>

      <h2 id="next">After the closing document</h2>
      <ul>
        <li>Merkle issues the fixed-price proposal after the client signs off scope, exclusions and the risk register.</li>
        <li>The Jira backlog, the app approvals and the store configuration workbook are generated by the tool owner for now; they are not in the web app yet.</li>
      </ul>
      <p><Link to="/">← Engagements</Link></p>
    </main>
  );
}
