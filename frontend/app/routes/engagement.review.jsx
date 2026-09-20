import { useState } from 'react';
import { Form, Link, redirect, useNavigation, useSearchParams } from 'react-router';

import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { EngagementHeader } from '../components/question.jsx';
import { PROCESSES, processMeta } from '../../../discovery/service/process.js';

export const meta = ({ params }) => [{ title: `Review answers · ${params.client} · Merkle Discovery` }];

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
  const intent = String(form.get('intent'));
  if (intent === 'mode') {
    try {
      const result = await discovery().setInterviewMode(user, params.client, { mode: String(form.get('mode') ?? '') });
      return { ok: true, mode: result.mode, was: result.was, remaining: result.remaining };
    } catch (err) {
      return serviceFailure(err);
    }
  }
  if (intent === 'process') {
    try {
      const result = await discovery().setProcess(user, params.client, { process: String(form.get('process') ?? '') });
      return { ok: true, process: result.process, wasProcess: result.was };
    } catch (err) {
      return serviceFailure(err);
    }
  }
  if (intent !== 'delete') return { error: 'Unknown action' };
  try {
    await discovery().deleteEngagement(user, params.client, { confirm: String(form.get('confirm') ?? '') });
  } catch (err) {
    return serviceFailure(err);
  }
  return redirect('/');
}

/** Filters on the review table: four of 157 rows are usually the ones that matter. */
const FILTERS = [['all', 'All'], ['open', 'Open'], ['to_confirm', 'To confirm'], ['answered', 'Answered']];
const MATCH = {
  all: () => true,
  open: (q) => q.state === 'open',
  to_confirm: (q) => q.to_confirm || q.state === 'tbc',
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
  const [filter, setFilter] = useState('all');
  const shown = (questions) => questions.filter((q) => MATCH[filter](q));
  return (
    <main>
      <EngagementHeader
        language={language}
        client={engagement.client}
        process={engagement.process}
        eyebrow="Review answers"
        meta={`${count('answered')} answered · ${count('commented')} by comment · ${count('tbc')} TBC · ${count('skipped')} not applicable · ${count('open')} open`}
      />
      <p className="muted">
        Click <strong>Edit</strong> on a question to change, clear or reopen it. A question that was
        already answered before the questionnaire changed stays <em>answered</em> — open it to fill
        what is new.
      </p>

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
          <Form method="post" className="mode-form">
            <input type="hidden" name="intent" value="mode" />
            <label htmlFor="mode" className="muted">Mode</label>
            <select id="mode" name="mode" defaultValue={engagement.mode}>
              <option value="quick">Quick — required only</option>
              <option value="standard">Standard — required and recommended</option>
              <option value="full">Full — everything</option>
            </select>
            <button type="submit" className="secondary" disabled={busy}>Change</button>
          </Form>
          <Form method="post" className="mode-form">
            <input type="hidden" name="intent" value="process" />
            <label htmlFor="process" className="muted">This is</label>
            <select id="process" name="process" defaultValue={engagement.process}>
              {Object.values(PROCESSES).map((p) => <option key={p.id} value={p.id}>{p.start}</option>)}
            </select>
            <button type="submit" className="secondary" disabled={busy}>Change</button>
          </Form>
        </div>
        {actionData?.mode ? <p className="muted">Mode changed from {actionData.was} to {actionData.mode} — {actionData.remaining} questions open.</p> : null}
        {actionData?.process ? <p className="muted">Now a {processMeta(actionData.process).record.toLowerCase()}, was a {processMeta(actionData.wasProcess).record.toLowerCase()} — the steps and the words follow; nothing recorded has changed.</p> : null}
        <p className="muted">
          The mode decides which questions are ever asked: a quick interview never reaches a
          <em> recommended</em> question, however relevant it has become. The process decides the
          order of the work and what the documents are called — an RFP is answered, a discovery is run.
        </p>
      </section>
      {sections.filter((section) => shown(section.questions).length).map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          <table>
            <thead><tr><th>#</th><th>Question</th><th>Answer</th><th>Status</th><th /></tr></thead>
            <tbody>
              {shown(section.questions).map((q) => (
                <tr key={q.id} id={q.id}>
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
                  <td><Link to={`/engagements/${engagement.client}/questions/${q.id}`}>Edit</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      <details className="danger">
        <summary>Delete this engagement</summary>
        <p className="muted">
          Deletes every answer, document, note, the approach and every version of the closing document for{' '}
          <strong>{engagement.client}</strong>. It cannot be undone, and downloaded files are not affected.
        </p>
        {actionData?.error ? <p className="error">{actionData.error}</p> : null}
        <Form method="post" className="danger-form">
          <input type="hidden" name="intent" value="delete" />
          <div className="field">
            <label htmlFor="confirm">Type <code>{engagement.client}</code> to confirm</label>
            <input id="confirm" name="confirm" autoComplete="off" placeholder={engagement.client} required />
          </div>
          <button type="submit" className="destructive" disabled={busy}>Delete engagement</button>
        </Form>
      </details>
    </main>
  );
}
