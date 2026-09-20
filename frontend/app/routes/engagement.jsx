import { useEffect, useState } from 'react';
import { Form, Link, useNavigation, useRevalidator } from 'react-router';

import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { questionAction } from '../question-actions.server.js';
import { vocabulariesFor } from '../vocabularies.server.js';
import { EngagementHeader, PreviewPanel, QuestionCard, Vocabularies } from '../components/question.jsx';
import { processMeta } from '../../../discovery/service/process.js';

export const meta = ({ params }) => [{ title: `${params.client} · Merkle Discovery` }];

export async function loader({ request, params }) {
  const user = await requireUser(request);
  try {
    const [view, answers] = await Promise.all([
      discovery().getInterview(user, params.client, { limit: 3 }),
      discovery().listAnswers(user, params.client),
    ]);
    return { ...view, answers, vocabularies: vocabulariesFor(view.next.questions) };
  } catch (err) {
    throw serviceFailure(err);
  }
}

export async function action({ request, params }) {
  const user = await requireUser(request);
  return questionAction(user, params.client, await request.formData());
}

const VIA_LABEL = { web: 'web app', claude: 'Claude', cli: 'CLI / Claude Code' };
const show = (value) => (typeof value === 'string' ? value : JSON.stringify(value));

function AnswerRow({ a, busy }) {
  return (
    <tr>
      <td>{a.question_id ?? '—'}<div className="muted">{a.pointer}</div></td>
      <td>{show(a.value)}{a.note ? <div className="muted">{a.note}</div> : null}</td>
      <td><span className="badge">{VIA_LABEL[a.via] ?? a.via}</span>{a.by ? <div className="muted">{a.by} · {a.at}</div> : null}</td>
      <td>
        {a.status === 'tbc' ? (
          <Form method="post">
            <input type="hidden" name="pointer" value={a.pointer} />
            <span className="badge flag">to confirm</span>{' '}
            <button type="submit" name="intent" value="confirm" className="secondary" disabled={busy}>Confirm</button>
          </Form>
        ) : <span className="badge go">confirmed</span>}
      </td>
    </tr>
  );
}

/**
 * Pre-filling from the client's documents has to start in Claude: the documents
 * live in the Claude Project, and the connector can only answer when Claude calls
 * it — it cannot go and read them. This card says so, gives the exact instruction
 * to paste, and watches for the answers to arrive.
 */
function PrefillCard({ client, documents, toConfirm, process }) {
  const [copied, setCopied] = useState(false);
  const rfp = process === 'rfp';
  const instruction = `Read the documents in this project and pre-fill the Merkle Discovery ${rfp ? 'bid' : 'engagement'} ${client}.

Register each document with register_document, map what it says to the questionnaire with find_questions, and record answers with record_answers, each with its evidence (document, section, short quote). Where a document is unclear, mark the question TBC with a note instead of guessing. Then tell me what you recorded and what is still open.

If you cannot see any documents in this chat, stop and tell me: either I attach the RFP here, or I run this inside the Claude Project for ${client}, where the documents are.`;
  const started = documents.length > 0;
  // On a bid this is the first thing that happens and there is nothing to do
  // until it has: it opens. In a discovery the consultant is interviewing, and
  // not every discovery has a document at all, so it stays a closed accordion.
  return (
    <details className={`card prefill${started ? ' done' : ''}`} open={rfp && !started}>
      <summary>
        <span className="prefill-title">
          {started
            ? 'Read in more documents'
            : rfp ? 'Start here — read the RFP in' : 'Pre-fill the answers from the client’s documents'}
        </span>
        <span className="muted prefill-status">
          {started
            ? `${documents.length} document${documents.length > 1 ? 's' : ''} read · ${toConfirm} to confirm`
            : rfp ? 'Nothing can be decided until the RFP is read' : 'Optional — if you have an RFP or brief'}
        </span>
      </summary>
      {started ? (
        <p className="muted">
          {documents.length} document{documents.length > 1 ? 's' : ''} read so far, {toConfirm} answer{toConfirm === 1 ? '' : 's'} waiting for your confirmation below.
          If you add more documents to the Claude Project, run it again.
        </p>
      ) : (
        <>
          <p>
            Claude reads the RFP and the other documents in your Claude Project, finds which questions they
            already answer, and records them here with the page and quote they came from. It has to start in
            Claude, because that is where the documents are — this tool cannot reach into your project.
          </p>
          <ol className="prefill-steps">
            <li><strong>Pre-fill in Claude</strong> opens a chat with the instruction written — you only press Enter. Attach the RFP in that chat.</li>
            <li>If the RFP is already in your <strong>Claude Project</strong> for this client, start the chat <em>inside the project</em> instead: copy the instruction and paste it there, or pick <strong>Pre-fill the engagement from the documents</strong> from the Merkle Discovery connector’s prompts.</li>
            <li>Come back here. The answers arrive marked <strong>to confirm</strong>, each with its citation; check them and confirm.</li>
          </ol>
        </>
      )}
      <div className="actions">
        <a className="button" href={`https://claude.ai/new?q=${encodeURIComponent(instruction)}`} target="_blank" rel="noreferrer">Pre-fill in Claude</a>
        <button type="button" className="secondary" onClick={() => { navigator.clipboard?.writeText(instruction); setCopied(true); }}>
          {copied ? 'Copied — paste it inside your Claude Project' : 'Copy the instruction'}
        </button>
      </div>
      <details>
        <summary>The instruction</summary>
        <textarea readOnly rows={6} value={instruction} />
      </details>
      <p className="muted small">
        Claude can only read the documents it can see: the ones attached to that chat, or the ones in the project the chat is in.
        If it cannot see any, the instruction tells it to stop and ask rather than guess. This page picks up the answers by itself while Claude records them.
      </p>
    </details>
  );
}

function AnswersReview({ answers, documents, busy }) {
  const toConfirm = answers.filter((a) => a.status === 'tbc');
  const confirmed = answers.filter((a) => a.status !== 'tbc');
  const head = <thead><tr><th>Question</th><th>Answer</th><th>Recorded</th><th>Status</th></tr></thead>;
  return (
    <>
      <h2>Answers to confirm ({toConfirm.length})</h2>
      {toConfirm.length ? (
        <>
          <p className="muted">Recorded from documents (e.g. by Claude) or marked to confirm. Check the citation, then confirm — or record a corrected answer to the question.</p>
          <table>{head}<tbody>{toConfirm.map((a) => <AnswerRow key={a.pointer} a={a} busy={busy} />)}</tbody></table>
        </>
      ) : <p className="muted">Nothing to confirm.</p>}

      <h2>Documents used ({documents.length})</h2>
      {documents.length ? (
        <ul>{documents.map((d) => <li key={d.name}><strong>{d.name}</strong> · {d.type}{d.date ? ` · ${d.date}` : ''}{d.summary ? ` — ${d.summary}` : ''} <span className="muted">({VIA_LABEL[d.via] ?? d.via}, {d.added_by})</span></li>)}</ul>
      ) : <p className="muted">No documents registered. Documents stay in your Claude Project; Claude registers the ones it uses.</p>}

      <details>
        <summary>All confirmed answers ({confirmed.length})</summary>
        <table>{head}<tbody>{confirmed.map((a) => <AnswerRow key={a.pointer} a={a} busy={busy} />)}</tbody></table>
      </details>
    </>
  );
}

export default function Engagement({ loaderData, actionData }) {
  const { engagement, next, preview, notes, tbc, commented, answers, documents, vocabularies, language } = loaderData;
  const busy = useNavigation().state !== 'idle';
  const toConfirm = answers.filter((a) => a.status === 'tbc').length;
  // While Claude is reading the documents, the answers appear without a reload.
  const revalidator = useRevalidator();
  useEffect(() => {
    if (next.consent_required) return undefined;
    const id = setInterval(() => {
      if (revalidator.state === 'idle' && globalThis.document?.visibilityState === 'visible') revalidator.revalidate();
    }, 20000);
    return () => clearInterval(id);
  }, [revalidator, next.consent_required]);
  return (
    <main>
      <Vocabularies vocabularies={vocabularies} />
      <EngagementHeader
        language={language}
        client={engagement.client}
        process={engagement.process}
        meta={`${engagement.mode} interview · ${engagement.language} · owner ${engagement.owner ?? '—'} · updated ${engagement.updated_at} · ${next.remaining} questions open${typeof next.remaining_client === 'number' ? ` (${next.remaining_client} for the client)` : ''}`}
      />
      <div className="layout">
        <div>
          {next.consent_required ? <p className="error">Record the client's consent for AI processing before any other answer.</p> : null}
          {!next.consent_required ? <PrefillCard client={engagement.client} documents={documents} toConfirm={toConfirm} process={engagement.process} /> : null}
          {next.questions.length ? next.questions.map((q) => <QuestionCard key={q.id} question={q} actionData={actionData} busy={busy} />) : (
            <section className="card">
              <p className="question">All questions for this {engagement.mode} interview are answered.</p>
              <div className="actions">
                <Link className="button" to={`/engagements/${engagement.client}/summary`}>See the summary</Link>
                <Link className="button secondary" to={`/engagements/${engagement.client}/review`}>Review or change answers</Link>
                <Link className="button secondary" to={`/engagements/${engagement.client}/closing-document`}>{processMeta(engagement.process).document}</Link>
              </div>
            </section>
          )}

          <AnswersReview answers={answers} documents={documents} busy={busy} />

          <h2>Consultant notes</h2>
          {notes.length ? <ul>{notes.map((n, i) => <li key={i}>{n.at}: {n.text}</li>)}</ul> : <p className="muted">No notes.</p>}
          <Form method="post" className="actions">
            <input type="text" name="text" placeholder="Context that is not an answer (no personal data)" />
            <button type="submit" name="intent" value="note" className="secondary" disabled={busy}>Add note</button>
          </Form>
          {actionData?.intent === 'note' && actionData.error ? <ul className="errors">{(actionData.errors?.length ? actionData.errors : [actionData.error]).map((e) => <li key={e}>{e}</li>)}</ul> : null}

          {actionData?.ok && actionData.commented ? <p className="muted">Saved as a comment: the question counts as clarified and the comment stays an open point for the offer.</p> : null}

          {Object.keys(commented).length ? (
            <>
              <h2>Clarified by comment ({Object.keys(commented).length})</h2>
              <ul>{Object.entries(commented).map(([id, text]) => <li key={id}><strong>{id}</strong>: {text}</li>)}</ul>
            </>
          ) : null}

          {Object.keys(tbc).length ? (
            <>
              <h2>To confirm with the client</h2>
              <ul>{Object.entries(tbc).map(([id, note]) => <li key={id}>{id}{note ? `: ${note}` : ''}</li>)}</ul>
            </>
          ) : null}
        </div>
        <PreviewPanel preview={preview} />
      </div>
    </main>
  );
}
