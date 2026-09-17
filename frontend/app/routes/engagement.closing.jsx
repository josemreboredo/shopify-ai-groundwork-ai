import { Link } from 'react-router';

import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
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
    return { ...saved, readiness, preview: saved.document ? saved.document.markdown.split('\n').filter((l) => l.startsWith('## ')).map((l) => l.slice(3)) : [] };
  } catch (err) {
    throw serviceFailure(err);
  }
}

const VIA = { claude: 'Claude', web: 'web app', cli: 'CLI' };

export default function Closing({ loaderData }) {
  const { engagement, approach, document, history, readiness, preview } = loaderData;
  const client = engagement.client;
  return (
    <main>
      <p><Link to="/">← Engagements</Link></p>
      <h1>{client}</h1>
      <EngagementNav client={client} />

      <h2>Discovery Closing Document</h2>
      <p className="muted">The Shopify consulting deliverable for this engagement: executive summary, business context, solution design, capability map, roadmap, apps, configuration vs customisation, risks, next steps, timeline, investment and consultant notes. Claude drafts it in your Claude Project from the answers here; the engine checks it.</p>

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
      <ol>
        <li>Open your Claude Project for this engagement with the <strong>Merkle Discovery</strong> connector enabled (set-up: <Link to="/claude">Claude Project</Link>).</li>
        <li>Ask Claude: <code>Draft the Discovery Closing Document for {client}.</code></li>
        <li>Claude starts it (<code>prepare_closing_document</code>), drafts and saves the implementation approach (<code>save_approach</code>), writes the document and saves it (<code>save_closing_document</code>). If the engine rejects something, Claude fixes it and saves again.</li>
        <li>Reload this page and download the Markdown.</li>
      </ol>
      <p className="muted">After changing answers, ask Claude to draft it again: each save keeps the previous version.</p>
    </main>
  );
}
