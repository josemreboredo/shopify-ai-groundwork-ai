import { Link } from 'react-router';

import { originOf } from '../origin.server.js';
import { connectorUrl } from '../../../discovery/service/project-kit.js';
import { CONNECTOR, PRODUCT, pageTitle } from '../brand.js';

export const meta = () => [
  { title: pageTitle('Manual') },
  { name: 'description', content: 'How to answer an RFP or run a Shopify discovery with the tool and your Claude Project: the rules, the set-up, and the two paths step by step.' },
];

export async function loader({ request }) {
  return { connector: connectorUrl(originOf(request)) };
}

const CONTENTS = [
  ['rules', 'Rules that apply to everything'],
  ['setup', 'One-time set-up'],
  ['paths', 'Which path are you on?'],
  ['words', 'The words the tool uses'],
  ['help', 'Troubleshooting'],
];

export default function Manual({ loaderData }) {
  const { connector } = loaderData;
  return (
    <main id="main" className="manual">
      <header className="page-head">
        <p className="eyebrow">How we work</p>
        <h1>Manual</h1>
        <p>{PRODUCT} runs two processes on one engine. Answering an RFP and running a discovery are different jobs, so they have a page each — this one holds what is true for both.</p>
      </header>

      <div className="card">
        <p className="question">The tool in one line</p>
        <p>You say what you are doing → the documents or the client fill the questions → you confirm what was recorded → the engine decides the offer, the gates and the rules → Claude drafts the client document, sourced → you review, download and share.</p>
        <p className="muted">The web app and your Claude Project share the same record through the <strong>{CONNECTOR}</strong> connector: what Claude records appears here, and what you record here is visible to Claude.</p>
      </div>

      <nav aria-label="Contents">
        <h2>Contents</h2>
        <ul className="toc">{CONTENTS.map(([id, label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}</ul>
      </nav>

      <h2 id="rules">Rules that apply to everything</h2>
      <ul>
        <li><strong>Pilot: demo or anonymised records and documents only.</strong> Real client data moves to dentsu’s systems and Claude Enterprise first.</li>
        <li><strong>Consent first.</strong> Upload client documents to Claude only after the client has agreed that their information may be processed by AI. It is question <strong>Q10.5.2</strong> and nothing else can be recorded until it is answered <em>Yes</em>.</li>
        <li><strong>No personal data.</strong> Record roles (“Head of Wholesale”), never names, e-mail addresses or phone numbers. The tool refuses e-mail addresses, phone numbers and card numbers.</li>
        <li><strong>Internal pricing stays internal.</strong> The Summary page and the Consultant notes section of the client document carry the offer and internal information — never send them to the client as they are.</li>
        <li><strong>The engine decides.</strong> The offer, scope gates, exit rules (STOP, FLAG, WARN), the Shopify plan and which questions are worth sending back come from rules in the tool, not from Claude and not from you. Claude drafts; the engine checks.</li>
        <li><strong>Confirm before you commit.</strong> Anything Claude read out of a document is recorded “to confirm”. Until you accept it, the tool treats it as unverified — and says so where it matters.</li>
      </ul>

      <h2 id="setup">One-time set-up</h2>
      <ol>
        <li><strong>Sign in</strong> to this web app with your GitHub account.</li>
        <li><strong>Add the connector in Claude</strong>: Customize → Connectors → Add custom connector, name <code>{CONNECTOR}</code>, URL <code>{connector}</code>. Claude opens this app: sign in and click <strong>Allow</strong>. Full details and the Project instructions: <Link to="/claude">Claude Project</Link>.</li>
        <li><strong>In Claude, use the strongest model</strong> available to you, and keep <strong>web search</strong> turned on — Claude needs it to check Shopify’s documentation when it writes the client document.</li>
        <li><strong>One private Claude Project per client.</strong> Paste the Project instructions from the <Link to="/claude">Claude Project</Link> page and upload that client’s documents there.</li>
      </ol>

      <h2 id="paths">Which path are you on?</h2>
      <div className="doors">
        <section className="door rfp">
          <p className="door-n" aria-hidden="true">01</p>
          <h2>Answer an RFP</h2>
          <p>A document arrived with a deadline. Information is scarce, the clock is running, and the job is to be chosen. Five steps: read it in, confirm what it says, take a Go/No-Go position, send the questions that change the answer, write the proposal.</p>
          <p><Link className="button" to="/manual/bid">The bid manual →</Link></p>
        </section>
        <section className="door discovery">
          <p className="door-n" aria-hidden="true">02</p>
          <h2>Run a discovery</h2>
          <p>The work is won and paid. Nothing has to be persuaded and everything has to be exact, because what comes out is what the build team executes. Four steps: interview, review, agree the scope, hand over to delivery.</p>
          <p><Link className="button" to="/manual/discovery">The discovery manual →</Link></p>
        </section>
      </div>
      <p className="muted">Started the wrong one? Nothing is lost: <strong>Change</strong> on the record switches it between a bid and an engagement without touching an answer. A bid you win becomes the engagement in the same record.</p>

      <h2 id="words">The words the tool uses</h2>
      <table>
        <thead><tr><th scope="col">Word</th><th scope="col">What it means here</th></tr></thead>
        <tbody>
          <tr><td><strong>Bid</strong></td><td>One record while Merkle is trying to win the work. Its client document is the <strong>proposal</strong>.</td></tr>
          <tr><td><strong>Engagement</strong></td><td>The same record once the work is Merkle’s. Its client document is the <strong>Discovery Closing Document</strong>.</td></tr>
          <tr><td><strong>The spine</strong></td><td>The numbered steps across the top of a record. Exactly one is current: the first that is not done. That is the page you should be on.</td></tr>
          <tr><td><strong>To confirm</strong></td><td>An answer Claude read out of a document that no human has accepted yet.</td></tr>
          <tr><td><strong>Offer S / M / L</strong></td><td>The engine’s classification of the work, with a price band. Internal — never in a client document.</td></tr>
          <tr><td><strong>Provisional</strong></td><td>A question that decides a scope gate or the Shopify plan is still open, so the offer can still move. Prioritise those questions.</td></tr>
          <tr><td><strong>Beyond the offers</strong></td><td>Not a refusal. The requirements go past S/M/L, so Merkle proposes a <strong>Larger Engagement</strong> — an Enterprise Engagement opening with a consultant-led Discovery Phase — or does not bid.</td></tr>
          <tr><td><strong>Exit rule</strong></td><td>A numbered rule (for example 11.20, mainland China) that the engine applies to the answers: STOP, FLAG or WARN, always with the answer that triggered it.</td></tr>
        </tbody>
      </table>

      <h2 id="help">Troubleshooting</h2>
      <table>
        <thead><tr><th scope="col">What you see</th><th scope="col">What to do</th></tr></thead>
        <tbody>
          <tr><td>Claude doesn’t see the record or its tools</td><td>Enable <strong>{CONNECTOR}</strong> under + → Connectors in that chat; check the slug; reconnect the connector if Claude asks you to sign in again.</td></tr>
          <tr><td>“Record the client’s consent…”</td><td>Answer Q10.5.2 first. Nothing can be recorded before it.</td></tr>
          <tr><td>Claude’s answer was rejected</td><td>The value doesn’t match the question’s options or format. Claude fixes and retries; if not, record it yourself in the web app.</td></tr>
          <tr><td>A document read in but produced nothing</td><td>That is what the intake screen is telling you — it is not a display bug. Check it is the right document, that it is text and not a scan, and that Claude was asked in the Project where the file lives.</td></tr>
          <tr><td>The client document tab says “Not ready”</td><td>Read the listed reasons and fix them. Each one links to what is blocking it.</td></tr>
          <tr><td>“This engagement is beyond the standard offers”</td><td>Nothing has stopped. Decide with your lead how Merkle proceeds and answer Q10.5.5 — the page links straight to it. <strong>Larger Engagement</strong>: the client deck is still produced and shared, the Jira backlog is not, because it is defined during that phase. <strong>No bid</strong>: Merkle does not propose.</td></tr>
          <tr><td>“Approach not saved” with a list of gaps</td><td>Normal: the engine found missing sources, question ids, integrations or risks. Ask Claude to research the gaps and save again — not to remove content.</td></tr>
          <tr><td>The draft keeps failing or the research is thin</td><td>Ask the tool owner to run the Solution Architect step in Claude Code (<code>/architect</code>), which adds deeper Shopify documentation research.</td></tr>
          <tr><td>The document says “answers changed since”</td><td>Normal after any edit. Check the listed changes; redraft with the prepared line if they could affect a decision, a risk or the plan.</td></tr>
          <tr><td>Anything else</td><td>Ask the tool owner; include the client slug and what you clicked.</td></tr>
        </tbody>
      </table>

      <div className="actions">
        <Link className="button" to="/manual/bid">Answer an RFP</Link>
        <Link className="button secondary" to="/manual/discovery">Run a discovery</Link>
      </div>
      <p><Link to="/">← Bids and engagements</Link></p>
    </main>
  );
}
