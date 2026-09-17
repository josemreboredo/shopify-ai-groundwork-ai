import { Link } from 'react-router';

import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { originOf } from '../origin.server.js';
import { EngagementNav } from '../components/question.jsx';
import { ServiceError } from '../../../discovery/service/index.js';

export const meta = ({ params }) => [{ title: `Discovery Closing Document · ${params.client} · Merkle Discovery` }];

export async function loader({ request, params }) {
  const user = await requireUser(request);
  try {
    const saved = await discovery().getClosingDocument(user, params.client);
    let readiness;
    try {
      const prepared = await discovery().prepareClosingDocument(user, params.client);
      readiness = { ok: true, status: prepared.status, step: prepared.step };
    } catch (err) {
      if (!(err instanceof ServiceError)) throw err;
      readiness = { ok: false, error: err.message, errors: err.errors };
    }
    return { ...saved, readiness, origin: originOf(request), preview: saved.document ? saved.document.markdown.split('\n').filter((l) => l.startsWith('## ')).map((l) => l.slice(3)) : [] };
  } catch (err) {
    throw serviceFailure(err);
  }
}

const VIA = { claude: 'Claude', web: 'web app', cli: 'CLI' };

export default function Closing({ loaderData }) {
  const { engagement, approach, document, history, readiness, preview, origin } = loaderData;
  const client = engagement.client;
  return (
    <main>
      <p><Link to="/">← Engagements</Link></p>
      <h1>{client}</h1>
      <EngagementNav client={client} />

      <h2>Discovery Closing Document</h2>
      <p className="muted">The Shopify consulting deliverable for this engagement: executive summary, business context, solution design with sourced architecture decisions, capability map, roadmap, apps, configuration vs customisation, risk register, next steps, timeline, investment and consultant notes. Claude drafts it as Solution Architect from the answers here and Shopify's official documentation; the engine checks it.</p>

      {document ? (
        <section className="card">
          <p className="question">Saved {document.saved_at} by {document.by} ({VIA[document.via] ?? document.via})</p>
          <div className="actions">
            <a className="button" href={`/engagements/${client}/closing-document.md`} download>Download Markdown</a>
            {history.length ? <span className="muted">{history.length} previous version{history.length > 1 ? 's' : ''} kept</span> : null}
          </div>
          <p className="muted">Lead Consultant draft: remove the “Before presenting” block and the Consultant notes section before sharing with the client.</p>
          {preview.length ? (<><h3>Contents</h3><ol>{preview.map((h) => <li key={h}>{h}</li>)}</ol></>) : null}
        </section>
      ) : <p className="error">No Discovery Closing Document saved yet.</p>}

      <h2>Generate or update it in Claude</h2>
      {readiness.ok ? (
        <p>Ready: <strong>{readiness.status.decision}</strong> · offer {readiness.status.offer}{readiness.status.route ? ` · route ${readiness.status.route}` : ''}. {approach ? `Approach saved ${approach.saved_at} by ${approach.by}.` : 'No approach saved yet.'}</p>
      ) : (
        <div className="card">
          <p className="error">Not ready: {readiness.error}</p>
          {readiness.errors?.length ? <ul className="errors">{readiness.errors.map((e) => <li key={e}>{e}</li>)}</ul> : null}
          <p className="muted">Fix it in <Link to={`/engagements/${client}/review`}>Review answers</Link>.</p>
        </div>
      )}
      <h3>In your Claude Project (standard)</h3>
      <ol>
        <li>Open your Claude Project for this engagement (set-up: <Link to="/claude">Claude Project</Link>). Choose the strongest model, turn on <strong>web search</strong> and enable the <strong>Merkle Discovery</strong> connector in the chat.</li>
        <li>Ask Claude: <code>Draft the Discovery Closing Document for {client}.</code></li>
        <li>Claude researches Shopify's official documentation, saves the approach and writes the document. If the engine rejects unsourced or incomplete content, Claude adds the evidence and saves again — this can take a few rounds.</li>
        <li>Reload this page, download the Markdown and review it: sources, decisions marked “to validate”, assumptions and the Consultant notes section.</li>
      </ol>
      <p className="muted">Every Shopify statement must cite an official Shopify source and every client fact the question it comes from; the engine rejects the approach otherwise. Step-by-step guide: <Link to="/manual">Lead Consultant manual</Link>.</p>
      <details>
        <summary>Advanced: Solution Architect in Claude Code</summary>
        <p>For complex integrations or tax questions, or when a draft keeps failing the checks. Claude Code adds the Shopify Dev MCP for deeper documentation research.</p>
        <ol>
          <li>Add the connector once: <code>claude mcp add --transport http merkle-discovery {origin}/mcp</code> and the Shopify Dev MCP: <code>claude mcp add shopify-dev-mcp -- npx -y @shopify/dev-mcp@latest</code>.</li>
          <li>In the repository, run <code>/architect {client}</code>. It saves the approach and the document here.</li>
        </ol>
      </details>
      <p className="muted">After changing answers, ask Claude to draft it again: each save keeps the previous version.</p>
    </main>
  );
}
