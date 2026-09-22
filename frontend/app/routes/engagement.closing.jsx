import { useEffect, useState } from 'react';
import { Link, useFetcher, useRevalidator } from 'react-router';

import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { originOf } from '../origin.server.js';
import { EngagementErrorBoundary, Blockers, EngagementHeader } from '../components/question.jsx';
import { ServiceError } from '../../../discovery/service/index.js';
import { processMeta } from '../../../discovery/service/process.js';
import { CONNECTOR, pageTitle } from '../brand.js';

export const meta = ({ data, params }) => [{ title: pageTitle(`${processMeta(data?.engagement?.process).document}`, params.client) }];

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
      readiness = { ok: false, error: err.message, errors: err.errors, blockers: err.blockers ?? [] };
    }
    return { ...saved, readiness, origin: originOf(request), preview: saved.document ? saved.document.markdown.split('\n').filter((l) => l.startsWith('## ')).map((l) => l.slice(3)) : [] };
  } catch (err) {
    throw serviceFailure(err);
  }
}

const VIA = { claude: 'Claude', web: 'web app', cli: 'CLI' };

export async function action({ request, params }) {
  const user = await requireUser(request);
  try {
    return await discovery().noteDraftRequested(user, params.client);
  } catch (err) {
    return serviceFailure(err);
  }
}

/** How long ago, in the words a person uses for a wait. */
function ago(iso, now) {
  const mins = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hours = Math.round(mins / 60);
  return `${hours} hour${hours === 1 ? '' : 's'} ago`;
}

/**
 * The wait, said out loud. Drafting runs in another application for up to
 * three quarters of an hour, and this page showed the same words throughout —
 * so "Claude is working", "I never pressed Enter" and "it failed" all looked
 * identical.
 */
function Waiting({ requested, checkedAt, onCheck, busy }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);
  if (!requested) return null;
  const mins = Math.round((now - new Date(requested.at).getTime()) / 60000);
  return (
    <div className={mins > 60 ? 'card blocked' : 'card'}>
      <p className="question">
        {mins > 60 ? 'Nothing has arrived in over an hour' : 'Waiting for Claude'}
      </p>
      <p className="muted">
        Instruction sent {ago(requested.at, now)} by {requested.by} · this page last checked {ago(checkedAt, now)}.
        {mins > 60 ? ' Drafting can take 45 minutes, so this is longer than it should be: check the chat is still running, that the connector is on in it, and that the model did not stop and ask you something.' : ' It can take up to 45 minutes. You can close this tab — the document is saved to the record, not to the chat.'}
      </p>
      <div className="actions">
        <button type="button" className="secondary" onClick={onCheck} disabled={busy}>{busy ? 'Checking…' : 'Check now'}</button>
      </div>
    </div>
  );
}

export default function Closing({ loaderData }) {
  const { engagement, approach, document, history, readiness, preview, origin, freshness, version, requested } = loaderData;
  const client = engagement.client;
  const words = processMeta(engagement.process);
  const startPrompt = document
    ? freshness.redraft_prompt
    : `Draft the ${words.document} for ${client}.\n\nWork as a Shopify Solution Architect: call prepare_closing_document, read the whole engagement, research every Shopify fact in the official documentation before you state it, draft and save the approach, then fill the deck templates and write the annex and save both with save_closing_document. Tell me the version you saved, the decisions taken and what is still to validate.`;
  // While Claude is working, the page picks up the new version by itself.
  const revalidator = useRevalidator();
  const note = useFetcher();
  const waiting = !document || !freshness.up_to_date;
  const [checkedAt, setCheckedAt] = useState(() => Date.now());
  useEffect(() => { setCheckedAt(Date.now()); }, [document, freshness.up_to_date]);
  useEffect(() => {
    if (!waiting) return undefined;
    const id = setInterval(() => {
      if (revalidator.state === 'idle' && globalThis.document?.visibilityState === 'visible') {
        revalidator.revalidate();
        setCheckedAt(Date.now());
      }
    }, 20000);
    return () => clearInterval(id);
  }, [revalidator, waiting]);
  // The instruction goes to Claude in another tab; the record keeps the moment
  // it was sent, which is the only thing that makes the wait readable.
  const sent = () => note.submit({}, { method: 'post' });
  const status = !document ? 'none' : freshness.up_to_date ? 'current' : 'stale';
  const action = status === 'none' ? 'Generate the document' : `Update the document${freshness.changes.length ? ` · ${freshness.changes.length} answer${freshness.changes.length > 1 ? 's' : ''} changed` : ''}`;

  return (
    <main id="main">
      <EngagementHeader
        engagement={engagement}
        eyebrow={processMeta(engagement.process).document}
        meta={document ? `Version ${version} · saved ${document.saved_at} by ${document.by}` : null}
      />

      {/* 1 — what to do now */}
      <section className={`card start ${readiness.ok ? status : 'blocked'}`}>
        <div className="start-head">
          <div>
            <p className="question">{status === 'none' ? 'Not generated yet' : status === 'current' ? `Version ${version} · up to date` : `Version ${version} · out of date`}</p>
            <p className="muted">
              {status === 'none'
                ? 'Claude writes the deck and the annex from the answers here and Shopify’s documentation.'
                : `Saved ${document.saved_at} by ${document.by} (${VIA[document.via] ?? document.via}).${status === 'stale' ? ' Answers changed since — update it so the decisions, risks and plan match.' : ''}`}
            </p>
          </div>
          {status !== 'none' ? <span className={`badge ${status === 'current' ? 'go' : 'flag'}`}>{status === 'current' ? 'up to date' : 'out of date'}</span> : null}
        </div>

        {readiness.ok ? (
          <>
            <div className="actions">
              <a className="button" href={`https://claude.ai/new?q=${encodeURIComponent(startPrompt)}`} target="_blank" rel="noreferrer" onClick={sent}>{action} in a new chat</a>
              <button type="button" className="secondary" onClick={() => { navigator.clipboard?.writeText(startPrompt); sent(); }}>Copy the instruction</button>
              {waiting && !requested ? <span className="muted">This page updates itself when Claude saves.</span> : null}
            </div>
            <p className="muted">
              Opens a Claude chat with the instruction written — you only press Enter. Check that the <strong>{CONNECTOR}</strong> connector is on and the strongest model is selected. To use the documents you uploaded, start it inside your Claude Project and pick <strong>Draft the client document</strong> from the connector’s prompts. It can take up to 45 minutes, so <strong>Cowork</strong> suits it better than a normal chat.
            </p>
            {waiting ? (
              <Waiting
                requested={requested}
                checkedAt={checkedAt}
                busy={revalidator.state !== 'idle'}
                onCheck={() => { revalidator.revalidate(); setCheckedAt(Date.now()); }}
              />
            ) : null}
            <details>
              <summary>The instruction it sends</summary>
              <textarea readOnly rows={5} value={startPrompt} />
            </details>
          </>
        ) : (
          <>
            <p className="question">{readiness.error}</p>
            <Blockers from={`/engagements/${client}/closing-document`} items={readiness.blockers} errors={readiness.errors} client={client} />
            <p className="muted">
              {readiness.blockers?.length > 1
                ? 'Answer them in order — the first one is what the rest depend on.'
                : 'Answer it and come back; this page picks the change up by itself.'}{' '}
              You can also work through <Link to={`/engagements/${client}/review`}>Review answers</Link>.
            </p>
          </>
        )}
      </section>

      {/* 2 — what changed, when it is out of date */}
      {freshness.changes.length ? (
        <details className="card">
          <summary>{freshness.changes.length} answer{freshness.changes.length > 1 ? 's' : ''} changed since version {version}</summary>
          <div className="table-scroll" role="region" tabIndex={0} aria-label="Answers changed, scrollable table">
          <table>
            <thead><tr><th scope="col">Question</th><th scope="col">Was</th><th scope="col">Now</th></tr></thead>
            <tbody>{freshness.changes.map((c) => (
              <tr key={c.pointer || c.question_id}>
                <td>{c.question_id ?? c.pointer}{c.question ? <div className="muted">{c.question}</div> : null}</td>
                <td className="muted">{c.before || '—'}</td>
                <td>{c.after || '—'}</td>
              </tr>
            ))}</tbody>
          </table>
          </div>
        </details>
      ) : null}

      {/* 3 — the files */}
      {document ? (
        <section className="card">
          <p className="question">The files</p>
          <div className="actions">
            <a className="button" href={`/engagements/${client}/closing-document.pptx`} download>Deck · PowerPoint</a>
            {document.annex ? <a className="button" href={`/engagements/${client}/closing-document.pptx?part=annex`} download>Annex · PowerPoint</a> : null}
            <a className="button secondary" href={`/engagements/${client}/closing-preview`} target="_blank" rel="noreferrer">Preview in the browser</a>
          </div>
          <details>
            <summary>Other formats and the internal version</summary>
            <div className="actions">
              <a className="button secondary" href={`/engagements/${client}/closing-document.pptx?internal=1`} download>Deck with consultant notes</a>
              <a className="button secondary" href={`/engagements/${client}/closing-document.md`} download>Deck · Markdown</a>
              {document.annex ? <a className="button secondary" href={`/engagements/${client}/closing-annex.md`} download>Annex · Markdown</a> : null}
              <a className="button secondary" href={`/engagements/${client}/closing-preview?part=annex`} target="_blank" rel="noreferrer">Preview the annex</a>
            </div>
            {history.length ? <p className="muted">Previous versions kept: {history.map((h) => `v${h.version}`).join(', ')}</p> : null}
          </details>
          <p className="muted">Every file carries its version. The client deck stops before the consultant notes; check the slides before presenting. {document.annex ? '' : 'No annex saved for this version yet.'}</p>
          {preview.length ? (
            <details>
              <summary>What is in it ({preview.length} sections)</summary>
              <ol>{preview.map((h) => <li key={h}>{h}</li>)}</ol>
            </details>
          ) : null}
        </section>
      ) : null}

      {/* 4 — the rest, out of the way */}
      <details>
        <summary>Advanced: run it from Claude Code</summary>
        <p>For complex integrations or tax questions, or when a draft keeps failing the checks. Claude Code adds the Shopify Dev MCP for deeper documentation research.</p>
        <ol>
          <li>Add the connector once: <code>claude mcp add --transport http merkle-discovery {origin}/mcp</code> and the Shopify Dev MCP: <code>claude mcp add shopify-dev-mcp -- npx -y @shopify/dev-mcp@latest</code>.</li>
          <li>In the repository, run <code>/architect {client}</code>. It saves the approach and the document here.</li>
        </ol>
      </details>
      <p className="muted">
        {approach ? `Approach saved ${approach.saved_at} by ${approach.by}.` : 'No approach saved yet.'}
        {readiness.ok ? ` ${readiness.status.label ?? readiness.status.decision} · offer ${readiness.status.offer}.` : ''}
        {' '}Full guide: <Link to="/manual">Lead Consultant manual</Link>.
      </p>
    </main>
  );
}

// The record survives a page that does not.
export const ErrorBoundary = EngagementErrorBoundary;
