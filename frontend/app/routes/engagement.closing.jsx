import { useEffect } from 'react';
import { Link, useRevalidator } from 'react-router';

import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { originOf } from '../origin.server.js';
import { EngagementHeader, WithQuestionLinks } from '../components/question.jsx';
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

export default function Closing({ loaderData }) {
  const { engagement, approach, document, history, readiness, preview, origin, freshness, version } = loaderData;
  const client = engagement.client;
  const words = processMeta(engagement.process);
  const startPrompt = document
    ? freshness.redraft_prompt
    : `Draft the ${words.document} for ${client}.\n\nWork as a Shopify Solution Architect: call prepare_closing_document, read the whole engagement, research every Shopify fact in the official documentation before you state it, draft and save the approach, then fill the deck templates and write the annex and save both with save_closing_document. Tell me the version you saved, the decisions taken and what is still to validate.`;
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
  const status = !document ? 'none' : freshness.up_to_date ? 'current' : 'stale';
  const action = status === 'none' ? 'Generate the document' : `Update the document${freshness.changes.length ? ` · ${freshness.changes.length} answer${freshness.changes.length > 1 ? 's' : ''} changed` : ''}`;

  return (
    <main>
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
              <a className="button" href={`https://claude.ai/new?q=${encodeURIComponent(startPrompt)}`} target="_blank" rel="noreferrer">{action}</a>
              <button type="button" className="secondary" onClick={() => navigator.clipboard?.writeText(startPrompt)}>Copy the instruction</button>
              {waiting ? <span className="muted">This page updates itself when Claude saves.</span> : null}
            </div>
            <p className="muted">
              Opens a Claude chat with the instruction written — you only press Enter. Check that the <strong>{CONNECTOR}</strong> connector is on and the strongest model is selected. To use the RFPs you uploaded, start it inside your Claude Project and pick <strong>Draft the client document</strong> from the connector’s prompts. It can take up to 45 minutes, so <strong>Cowork</strong> suits it better than a normal chat.
            </p>
            <details>
              <summary>The instruction it sends</summary>
              <textarea readOnly rows={5} value={startPrompt} />
            </details>
          </>
        ) : (
          <>
            <p className="question">{readiness.error}</p>
            {readiness.blockers?.length ? (
              <ol className="blockers">
                {readiness.blockers.map((b, i) => (
                  <li key={b.question_id ?? i}>
                    <p className="blocker-what">{b.what}</p>
                    {b.why ? <p className="muted"><WithQuestionLinks text={b.why} client={client} /></p> : null}
                    {b.question_id ? (
                      <Link className={`button${i === 0 ? '' : ' secondary'}`} to={`/engagements/${client}/questions/${b.question_id}`}>
                        Answer {b.question_id}
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : (
              <ul className="errors">{(readiness.errors ?? []).map((e) => <li key={e}><WithQuestionLinks text={e} client={client} /></li>)}</ul>
            )}
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
