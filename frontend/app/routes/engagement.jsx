import { Form, Link, useNavigation } from 'react-router';

import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { questionAction } from '../question-actions.server.js';
import { vocabulariesFor } from '../vocabularies.server.js';
import { EngagementNav, PreviewPanel, QuestionCard, Vocabularies } from '../components/question.jsx';

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
  const { engagement, next, preview, notes, tbc, commented, answers, documents, vocabularies } = loaderData;
  const busy = useNavigation().state !== 'idle';
  return (
    <main>
      <Vocabularies vocabularies={vocabularies} />
      <p><Link to="/">← Engagements</Link></p>
      <h1>{engagement.client}</h1>
      <EngagementNav client={engagement.client} />
      <p className="muted">
        {engagement.mode} interview · {engagement.language} · owner {engagement.owner ?? '—'} · updated {engagement.updated_at} · {next.remaining} questions open
        {typeof next.remaining_client === 'number' ? ` (${next.remaining_client} for the client)` : ''}
      </p>
      <div className="layout">
        <div>
          {next.consent_required ? <p className="error">Record the client's consent for AI processing before any other answer.</p> : null}
          {next.questions.length ? next.questions.map((q) => <QuestionCard key={q.id} question={q} actionData={actionData} busy={busy} />) : (
            <section className="card">
              <p className="question">All questions for this {engagement.mode} interview are answered.</p>
              <div className="actions">
                <Link className="button" to={`/engagements/${engagement.client}/summary`}>See the summary</Link>
                <Link className="button secondary" to={`/engagements/${engagement.client}/review`}>Review or change answers</Link>
                <Link className="button secondary" to={`/engagements/${engagement.client}/closing-document`}>Discovery Closing Document</Link>
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
