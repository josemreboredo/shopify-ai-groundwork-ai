import { useState } from 'react';
import { Form, Link, useNavigation, useSearchParams } from 'react-router';

import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { EngagementHeader } from '../components/question.jsx';
import { pageTitle } from '../brand.js';

export const meta = ({ params }) => [{ title: pageTitle('Review answers', params.client) }];

export async function loader({ request, params }) {
  const user = await requireUser(request);
  try {
    return await discovery().reviewQuestions(user, params.client);
  } catch (err) {
    throw serviceFailure(err);
  }
}

export async function action({ request, params }) {
  const user = await requireUser(request);
  const form = await request.formData();
  const question_id = form.get('question_id') ? String(form.get('question_id')) : null;
  try {
    // One row, or the lot. Both end up in the same place; only the record of how
    // it was done differs.
    const result = question_id
      ? await discovery().confirmAnswer(user, params.client, { question_id })
      : await discovery().confirmAllAnswers(user, params.client);
    return { ok: true, question_id, ...result };
  } catch (err) {
    return serviceFailure(err);
  }
}

/** Filters on the review table: a handful of 157 rows are usually the ones that matter. */
const FILTERS = [['all', 'All'], ['open', 'Open'], ['to_confirm', 'To confirm'], ['with_client', 'With the client'], ['answered', 'Answered']];
/* "To confirm" meant two different things — an answer a document produced that
   no human has accepted, and a question the client still owes us — so the filter
   counted 92 where the same page's banner counted 90. They are separate states
   and separate work, so they are separate filters. */
const MATCH = {
  all: () => true,
  open: (q) => q.state === 'open',
  to_confirm: (q) => Boolean(q.to_confirm),
  with_client: (q) => q.state === 'tbc',
  answered: (q) => q.state === 'answered' || q.state === 'commented',
};

const STATE = {
  answered: ['go', 'Answered'],
  commented: ['flag', 'Clarified by comment'],
  tbc: ['flag', 'TBC'],
  skipped: ['', 'Not applicable'],
  open: ['stop', 'Open'],
};

export default function Review({ loaderData, actionData }) {
  const { engagement, sections, language } = loaderData;
  const busy = useNavigation().state !== 'idle';
  const all = sections.flatMap((s) => s.questions);
  const count = (state) => all.filter((q) => q.state === state).length;
  const waiting = all.filter((q) => q.to_confirm).length;
  // Opening the step for confirming three things on a list of 173 unanswered
  // questions is the default doing the opposite of the job.
  const [filter, setFilter] = useState(() => (all.some((q) => q.to_confirm) ? 'to_confirm' : 'all'));
  const [armed, setArmed] = useState(false);
  // Answering a question landed here with nothing said and nothing marked, so
  // the only evidence the save worked was finding the row by eye.
  const [params] = useSearchParams();
  const recorded = params.get('recorded');
  const shown = (questions) => questions.filter((q) => MATCH[filter](q));
  return (
    <main id="main">
      <EngagementHeader
        language={language}
        engagement={engagement}
        eyebrow="Review answers"
        meta={`${count('answered')} answered · ${count('commented')} by comment · ${count('tbc')} TBC · ${count('skipped')} not applicable · ${count('open')} open`}
      />
      {recorded ? (
        <p className="pilot" role="status"><strong>{recorded}</strong> recorded. It is highlighted below.</p>
      ) : null}
      <p className="muted">
        <strong>Confirm</strong> accepts an answer as it stands; <strong>Edit</strong> changes, clears or reopens
        it. A question that was
        already answered before the questionnaire changed stays <em>answered</em> — open it to fill
        what is new.
      </p>

      {/* Read out of the documents and waiting on a human. Forty-six of these one
          at a time is not a review, it is a reason to skip reviewing. */}
      {waiting ? (
        <section className="card start">
          <div className="start-head">
            <div>
              <p className="question">{waiting} answer{waiting === 1 ? '' : 's'} waiting for your confirmation</p>
              <p className="muted">
                Each was read out of the documents and carries the section and sentence it came from. Check the
                ones that decide the price — the filter below brings them up on their own — or confirm the lot
                if you have already read the document.
              </p>
            </div>
            <span className="badge flag">{waiting}</span>
          </div>
          <div className="actions">
            <button type="button" className="secondary" onClick={() => setFilter('to_confirm')}>Show only these</button>
            {/* Accepting ninety extractions as checked by a human is the act the
                whole governance story rests on, and it was one plain click with
                no way back. It asks once. */}
            {armed ? (
              <Form method="post" onSubmit={() => setArmed(false)}>
                <button type="submit" disabled={busy}>Yes — record all {waiting} as checked by me</button>
              </Form>
            ) : (
              <button type="button" className="secondary" onClick={() => setArmed(true)} disabled={busy}>Confirm all {waiting}</button>
            )}
            {armed ? <button type="button" className="link" onClick={() => setArmed(false)}>Cancel</button> : null}
          </div>
          <p className="muted small">
            Confirming in bulk is recorded as such, so the engagement stays honest about how its answers were checked.
          </p>
        </section>
      ) : null}
      {actionData?.ok ? (
        <p className="muted">
          {actionData.question_id ? `${actionData.question_id} confirmed.` : `${actionData.confirmed} answer${actionData.confirmed === 1 ? '' : 's'} confirmed.`}
        </p>
      ) : null}
      {actionData?.error ? <p className="error">{actionData.error}</p> : null}

      <section className="card">
        <div className="actions">
          <div className="filter" role="group" aria-label="Filter questions">
            {FILTERS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={filter === key ? '' : 'secondary'}
                onClick={() => setFilter(key)}
              >
                {label} · {key === 'all' ? all.length : all.filter((q) => MATCH[key](q)).length}
              </button>
            ))}
          </div>
        </div>
        <p className="muted">
          Fewer questions here than you expected? How many are ever asked is set by the depth, in <strong>Change</strong>.
        </p>
      </section>
      {sections.filter((section) => shown(section.questions).length).map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          <div className="table-scroll" role="region" tabIndex={0} aria-label="Answers, scrollable table">
          <table className="answers-table">
            <thead><tr><th scope="col">#</th><th scope="col">Question</th><th scope="col">Answer</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {shown(section.questions).map((q) => (
                <tr key={q.id} id={q.id} className={q.id === recorded ? 'just-recorded' : undefined}>
                  <td>{q.id}</td>
                  <td>{q.text}</td>
                  <td>
                    <span className="pre">{q.value}</span>
                    {q.note ? <div className="muted">{q.note}</div> : null}
                  </td>
                  <td>
                    <span className={`badge ${STATE[q.state][0]}`}>{STATE[q.state][1]}</span>
                    {q.to_confirm ? <span className="badge flag">to confirm</span> : null}
                  </td>
                  <td className="row-actions">
                    {q.to_confirm ? (
                      <Form method="post">
                        <input type="hidden" name="question_id" value={q.id} />
                        <button type="submit" className="link" disabled={busy}>Confirm</button>
                      </Form>
                    ) : null}
                    <Link to={`/engagements/${engagement.client}/questions/${q.id}`}>Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </section>
      ))}

    </main>
  );
}
