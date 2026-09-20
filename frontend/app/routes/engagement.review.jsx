import { useState } from 'react';
import { Link } from 'react-router';

import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { EngagementHeader } from '../components/question.jsx';

export const meta = ({ params }) => [{ title: `Review answers · ${params.client} · Merkle Discovery` }];

export async function loader({ request, params }) {
  const user = await requireUser(request);
  try {
    return await discovery().reviewQuestions(user, params.client);
  } catch (err) {
    throw serviceFailure(err);
  }
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

export default function Review({ loaderData }) {
  const { engagement, sections, language } = loaderData;
  const all = sections.flatMap((s) => s.questions);
  const count = (state) => all.filter((q) => q.state === state).length;
  const [filter, setFilter] = useState('all');
  const shown = (questions) => questions.filter((q) => MATCH[filter](q));
  return (
    <main>
      <EngagementHeader
        language={language}
        engagement={engagement}
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
        </div>
        <p className="muted">
          Fewer questions here than you expected? How many are ever asked is set by the depth, in <strong>Change</strong>.
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

    </main>
  );
}
