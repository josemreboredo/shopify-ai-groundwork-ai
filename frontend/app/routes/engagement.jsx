import { useEffect, useState } from 'react';
import { Form, Link, NavLink, useNavigation, useRevalidator } from 'react-router';

import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { questionAction } from '../question-actions.server.js';
import { vocabulariesFor } from '../vocabularies.server.js';
import { EngagementErrorBoundary, EngagementHeader, QuestionCard, Vocabularies } from '../components/question.jsx';
import { processMeta } from '../../../discovery/service/process.js';
import { CONNECTOR, pageTitle } from '../brand.js';

export const meta = ({ params }) => [{ title: pageTitle(params.client) }];

export async function loader({ request, params }) {
  const user = await requireUser(request);
  const section = new URL(request.url).searchParams.get('section');
  try {
    const [view, answers] = await Promise.all([
      discovery().getInterview(user, params.client, { limit: 3, section }),
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
 * What reading the documents produced.
 *
 * On a bid this screen is the intake and nothing else: the RFP goes in, and what
 * came out of it is stated so the consultant can see whether reading it was worth
 * anything. It used to carry the interview questions and a second answers table
 * with its own Confirm buttons — the questions because this route was built for a
 * discovery, where the conversation *is* the intake, and the table because it
 * grew here before Review existed. Two places to confirm the same answer is how
 * answers get confirmed twice and reviewed never.
 */
function DocumentsRead({ client, documents, toConfirm }) {
  const answers = documents.reduce((n, d) => n + d.answers, 0);
  return (
    <>
      <h2>What has been read ({documents.length})</h2>
      {documents.length ? (
        <>
          <ul className="read-docs">
            {documents.map((d) => (
              <li key={d.name}>
                <p className="doc-name">{d.name} <span className="badge">{d.type}</span></p>
                <p className="muted">
                  {d.answers ? `${d.answers} answer${d.answers === 1 ? '' : 's'} across ${d.sections} section${d.sections === 1 ? '' : 's'}` : 'Nothing recorded from it yet'}
                  {d.date ? ` · ${d.date}` : ''}
                  {d.summary ? ` — ${d.summary}` : ''}
                </p>
              </li>
            ))}
          </ul>
          <p className="muted">
            {toConfirm
              ? <>Everything read out of a document waits on you. <Link to={`/engagements/${client}/review`}><strong>{toConfirm} answer{toConfirm === 1 ? '' : 's'} to confirm</strong></Link> — each one carries the section and sentence it came from.</>
              : answers ? <>All {answers} answers have been confirmed. <Link to={`/engagements/${client}/review`}>Review or change them</Link>.</> : null}
          </p>
        </>
      ) : (
        <p className="muted">
          No document registered yet. They stay in your Claude Project — Claude registers the ones it reads.
        </p>
      )}
    </>
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
  const instruction = `Read the documents in this project and pre-fill the ${CONNECTOR} ${rfp ? 'bid' : 'engagement'} ${client}.

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
          {/* The button opened a fresh chat — outside the Project, with the
              connector off — carrying an instruction that begins "read the
              documents in this project". The order is reversed: the path that
              works is first, and the one-click path says what it costs. */}
          <ol className="prefill-steps">
            <li><strong>Copy the instruction</strong>, open your <strong>Claude Project</strong> for this client, and paste it into a chat <em>inside the project</em> — that is where the documents are. Check the {CONNECTOR} connector is on in that chat (<strong>+ → Connectors</strong>); <a href="/claude">how to add it</a>.</li>
            <li>Or pick <strong>Pre-fill the engagement from the documents</strong> from the connector’s own prompts, which carries the same instruction.</li>
            <li><strong>Pre-fill in Claude</strong> opens a new chat instead — quicker, but outside your Project, so you have to attach the documents to that chat yourself and turn the connector on in it.</li>
            <li>Come back here. The answers arrive marked <strong>to confirm</strong>, each with its citation; check them and confirm.</li>
          </ol>
        </>
      )}
      <div className="actions">
        <button type="button" onClick={() => { navigator.clipboard?.writeText(instruction); setCopied(true); }}>
          {copied ? 'Copied — paste it inside your Claude Project' : 'Copy the instruction'}
        </button>
        <a className="button secondary" href={`https://claude.ai/new?q=${encodeURIComponent(instruction)}`} target="_blank" rel="noreferrer">Open a new chat instead</a>
      </div>
      <details>
        <summary>The instruction</summary>
        <textarea readOnly rows={6} value={instruction} aria-label="The instruction to paste into Claude" />
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
  const head = <thead><tr><th scope="col">Question</th><th scope="col">Answer</th><th scope="col">Recorded</th><th scope="col">Status</th></tr></thead>;
  return (
    <>
      <h2>Answers to confirm ({toConfirm.length})</h2>
      {toConfirm.length ? (
        <>
          <p className="muted">Recorded from documents (e.g. by Claude) or marked to confirm. Check the citation, then confirm — or record a corrected answer to the question.</p>
          <div className="table-scroll" role="region" tabIndex={0} aria-label="Answers from documents, scrollable table"><table>{head}<tbody>{toConfirm.map((a) => <AnswerRow key={a.pointer} a={a} busy={busy} />)}</tbody></table></div>
        </>
      ) : <p className="muted">Nothing to confirm.</p>}

      <h2>Documents used ({documents.length})</h2>
      {documents.length ? (
        <ul>{documents.map((d) => <li key={d.name}><strong>{d.name}</strong> · {d.type}{d.date ? ` · ${d.date}` : ''}{d.summary ? ` — ${d.summary}` : ''} <span className="muted">({VIA_LABEL[d.via] ?? d.via}, {d.added_by})</span></li>)}</ul>
      ) : <p className="muted">No documents registered. Documents stay in your Claude Project; Claude registers the ones it uses.</p>}

      <details>
        <summary>All confirmed answers ({confirmed.length})</summary>
        <div className="table-scroll" role="region" tabIndex={0} aria-label="Answers from documents, scrollable table"><table>{head}<tbody>{confirmed.map((a) => <AnswerRow key={a.pointer} a={a} busy={busy} />)}</tbody></table></div>
      </details>
    </>
  );
}

export default function Engagement({ loaderData, actionData }) {
  const { engagement, next, preview, notes, tbc, commented, answers, documents, document_yield: documentYield, vocabularies, language } = loaderData;
  // On a bid this screen is the intake: a document arrives. In a discovery the
  // intake is the conversation, so the interview stays exactly as it was.
  const bid = engagement.process === 'rfp';
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
    <main id="main">
      <Vocabularies vocabularies={vocabularies} />
      <EngagementHeader
        language={language}
        engagement={engagement}
        meta={bid
          ? `${documents.length} document${documents.length === 1 ? '' : 's'} read · ${toConfirm} answer${toConfirm === 1 ? '' : 's'} to confirm · owner ${engagement.owner ?? '—'} · updated ${engagement.updated_at}`
          : `${engagement.mode} interview · ${engagement.language} · owner ${engagement.owner ?? '—'} · updated ${engagement.updated_at} · ${engagement.coverage?.required_answered ?? 0} of ${engagement.coverage?.required_total ?? 0} required answered${next.remaining ? ` · ${next.remaining} questions left in this depth` : ''}`}
      />
      <div className="layout alone">
        <div>
          {next.consent_required ? (
            <p className="error">Record the client’s consent for AI processing before any other answer.</p>
          ) : null}
          {!next.consent_required ? <PrefillCard client={engagement.client} documents={documents} toConfirm={toConfirm} process={engagement.process} /> : null}
          {/* A bid shows documents where a discovery shows questions — but until
              consent is recorded there are no documents to show and nothing on the
              page could record it, so a new bid opened on an error with no control
              anywhere. Consent is a question, and the question card already works:
              it is the one card a bid renders too. */}
          {next.consent_required && next.questions.length ? (
            next.questions.map((q) => <QuestionCard key={q.id} question={q} actionData={actionData} busy={busy} language={engagement.language} />)
          ) : bid ? (
            <DocumentsRead client={engagement.client} documents={documentYield} toConfirm={toConfirm} />
          ) : (
            <>
              {/* Three cards at a time with no map: a consultant could not say how
                  much was left, in what, or go back to a part of it. */}
              {next.sections?.length ? (
                <nav className="sections" aria-label="Sections with questions open">
                  <Link
                    to={`/engagements/${engagement.client}`}
                    aria-current={next.section ? undefined : 'true'}
                    className={next.section ? 'secondary' : 'active'}
                  >
                    All · {next.remaining} to ask
                  </Link>
                  {next.sections.map((sec) => (
                    <Link
                      key={sec.id}
                      to={`/engagements/${engagement.client}?section=${encodeURIComponent(sec.id)}`}
                      aria-current={next.section === sec.id ? 'true' : undefined}
                      className={next.section === sec.id ? 'active' : 'secondary'}
                    >
                      {sec.id} {sec.title} · {sec.open}
                    </Link>
                  ))}
                </nav>
              ) : null}
              {/* A chip with a border was the only sign a filter was on, and the
                  line under it named a section number rather than the section. */}
              {next.section ? (
                <p className="filtered-by">
                  <strong>Showing only §{next.section} {next.sections.find((x) => x.id === next.section)?.title ?? ''}</strong>
                  {' — '}{next.questions.length} of {next.in_section} still to ask here, {next.remaining} in this depth in all.{' '}
                  <Link to={`/engagements/${engagement.client}`}>Show all sections</Link>
                </p>
              ) : (
                <p className="muted small">
                  Showing {next.questions.length} of {next.remaining} still to ask in this {engagement.mode} depth · {engagement.coverage?.required_answered ?? 0} of {engagement.coverage?.required_total ?? 0} required answered
                </p>
              )}
              {next.questions.length ? next.questions.map((q) => <QuestionCard key={q.id} question={q} actionData={actionData} busy={busy} language={engagement.language} />) : (
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
            </>
          )}

          <h2>Consultant notes</h2>
          {notes.length ? <ul>{notes.map((n, i) => <li key={i}>{n.at}: {n.text}</li>)}</ul> : <p className="muted">No notes.</p>}
          <Form method="post" className="actions">
            <input type="text" name="text" aria-label="Consultant note" placeholder="Context that is not an answer (no personal data)" />
            <button type="submit" name="intent" value="note" className="secondary" disabled={busy}>Add note</button>
          </Form>
          {actionData?.intent === 'note' && actionData.error ? <ul className="errors">{(actionData.errors?.length ? actionData.errors : [actionData.error]).map((e) => <li key={e}>{e}</li>)}</ul> : null}

          {actionData?.ok && actionData.commented ? <p className="muted">Saved as a comment: the question counts as clarified and the comment stays an open point for the offer.</p> : null}
          {/* Every mode says what it did. Three of the four used to say nothing
              at all — the card simply vanished. */}
          {actionData?.ok && actionData.recorded && !actionData.commented ? (
            <p className="muted" role="status"><strong>{actionData.recorded.id}</strong> recorded as “{actionData.recorded.value}”.</p>
          ) : null}
          {/* Only when something actually moved. A line that speaks when nothing
              happened is the line people stop reading. */}
          {actionData?.ok && actionData.moved?.length ? (
            <p className="moved" role="status">
              That answer {actionData.moved.map((m, i) => (
                <span key={m}>{i > 0 ? (i === actionData.moved.length - 1 ? ', and ' : ', ') : ''}<strong>{m}</strong></span>
              ))}.{' '}
              <Link to={`/engagements/${engagement.client}/summary`}>Where it stands</Link>
            </p>
          ) : null}
          {actionData?.ok && actionData.intent === 'tbc' ? (
            <p className="muted" role="status"><strong>{actionData.question_id}</strong> marked to check with the client{actionData.note ? `: ${actionData.note}` : ''}.</p>
          ) : null}
          {actionData?.ok && actionData.intent === 'skipped' ? (
            <p className="muted" role="status"><strong>{actionData.question_id}</strong> marked not applicable.</p>
          ) : null}

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
      </div>
    </main>
  );
}

// The record survives a page that does not.
export const ErrorBoundary = EngagementErrorBoundary;
