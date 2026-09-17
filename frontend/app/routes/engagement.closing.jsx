import { useEffect } from 'react';
import { Link, useRevalidator } from 'react-router';

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
  const { engagement, approach, document, history, readiness, preview, origin, freshness, version } = loaderData;
  const client = engagement.client;
  const startPrompt = document
    ? freshness.redraft_prompt
    : `Draft the Discovery Closing Document for ${client}.\n\nWork as a Shopify Solution Architect: call prepare_closing_document, read the whole engagement, research every Shopify fact in the official documentation before you state it, draft and save the approach, then fill the deck templates and write the annex and save both with save_closing_document. Tell me the version you saved, the decisions taken and what is still to validate.`;
  // While Claude is working, the page picks up the new version by itself.
  const revalidator = useRevalidator();
  const waiting = !document || !freshness.up_to_date;
  useEffect(() => {
    if (!waiting) return undefined;
    const id = setInterval(() => {
      if (revalidator.state === 'idle' && globalThis.document?.visibilityState === 'visible') revalidator.revalidate();
    }, 20000);
    return () => clearInterval(id);
  }, [revalidator, waiting]);
  return (
    <main>
      <p><Link to="/">← Engagements</Link></p>
      <h1>{client}</h1>
      <EngagementNav client={client} />

      <h2>Discovery Closing Document</h2>
      <p className="muted">The Shopify consulting deliverable for this engagement: executive summary, business context, solution design with sourced architecture decisions, capability map, roadmap, apps, configuration vs customisation, risk register, next steps, timeline, investment and consultant notes. Claude drafts it as Solution Architect from the answers here and Shopify's official documentation; the engine checks it.</p>

      {document ? (
        <section className="card">
          <p className="question">
            Version {version} · saved {document.saved_at} by {document.by} ({VIA[document.via] ?? document.via}){' '}
            {freshness.known ? <span className={`badge ${freshness.up_to_date ? 'go' : 'flag'}`}>{freshness.up_to_date ? 'up to date' : `${freshness.changes.length} answer${freshness.changes.length > 1 ? 's' : ''} changed since`}</span> : null}
          </p>
          {freshness.changes.length ? (
            <>
              <p className="muted">These answers moved after the document was written. Redraft it so the decisions, risks and plan match.</p>
              <table>
                <thead><tr><th>Question</th><th>Was</th><th>Now</th></tr></thead>
                <tbody>{freshness.changes.map((c) => (
                  <tr key={c.pointer || c.question_id}>
                    <td>{c.question_id ?? c.pointer}{c.question ? <div className="muted">{c.question}</div> : null}</td>
                    <td className="muted">{c.before || '—'}</td>
                    <td>{c.after || '—'}</td>
                  </tr>
                ))}</tbody>
              </table>
              <p><strong>Ask Claude:</strong></p>
              <textarea readOnly rows={4} value={freshness.redraft_prompt} />
            </>
          ) : null}
          <div className="actions">
            <a className="button" href={`/engagements/${client}/closing-preview`} target="_blank" rel="noreferrer">Preview the deck</a>
            <a className="button" href={`/engagements/${client}/closing-document.pptx`} download>Deck (PowerPoint)</a>
            {document.annex ? <a className="button" href={`/engagements/${client}/closing-document.pptx?part=annex`} download>Annex (PowerPoint)</a> : null}
            <a className="button secondary" href={`/engagements/${client}/closing-document.pptx?internal=1`} download>Deck with consultant notes</a>
            <a className="button secondary" href={`/engagements/${client}/closing-document.md`} download>Deck (Markdown)</a>
            {document.annex ? <a className="button secondary" href={`/engagements/${client}/closing-annex.md`} download>Annex (Markdown)</a> : null}
            {history.length ? <span className="muted">previous: {history.map((h) => `v${h.version}`).join(', ')}</span> : null}
          </div>
          <p className="muted">The client version of the deck stops before the Consultant notes; check the slides before presenting, and remove any “Before presenting” block.</p>
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
      <div className="card start">
        <p className="question">Start the generation</p>
        <p className="muted">The tool cannot start Claude by itself — Claude has to be asked from a chat. These two buttons do it for you: the instruction is already written.</p>
        <div className="actions">
          <a className="button" href={`https://claude.ai/new?q=${encodeURIComponent(startPrompt)}`} target="_blank" rel="noreferrer">Open Claude and generate</a>
          <button type="button" className="secondary" onClick={() => navigator.clipboard?.writeText(startPrompt)}>Copy the instruction</button>
        </div>
        <p className="muted">
          In the chat, make sure the <strong>Merkle Discovery</strong> connector is on and pick the strongest model. To use the RFPs you uploaded, start it inside your Claude Project instead — or pick
          <strong> Draft the Discovery Closing Document</strong> from the connector's prompts, which carries the same instruction.
        </p>
        <details>
          <summary>The instruction it sends</summary>
          <textarea readOnly rows={5} value={startPrompt} />
        </details>
      </div>

      <h3>What happens next</h3>
      <ol>
        <li>Claude reads the engagement, researches every Shopify fact, then saves the approach and the deck. It can take up to 45 minutes; <strong>Cowork</strong> suits it better than a normal chat.</li>
        <li>This page refreshes itself while you wait — the version appears here as soon as Claude saves it.</li>
        <li>Download the deck and the annex, or open the preview. Uploading them back into your Claude Project is optional: Claude can always read the saved document through the connector.</li>
      </ol>
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
