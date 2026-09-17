import { Link } from 'react-router';

import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { EngagementNav } from '../components/question.jsx';

export const meta = ({ params }) => [{ title: `Review answers · ${params.client} · Merkle Discovery` }];

export async function loader({ request, params }) {
  const user = await requireUser(request);
  try {
    return await discovery().reviewQuestions(user, params.client);
  } catch (err) {
    throw serviceFailure(err);
  }
}

const STATE = {
  answered: ['go', 'Answered'],
  commented: ['flag', 'Clarified by comment'],
  tbc: ['flag', 'TBC'],
  skipped: ['', 'Not applicable'],
  open: ['stop', 'Open'],
};

export default function Review({ loaderData }) {
  const { engagement, sections } = loaderData;
  const all = sections.flatMap((s) => s.questions);
  const count = (state) => all.filter((q) => q.state === state).length;
  return (
    <main>
      <p><Link to="/">← Engagements</Link></p>
      <h1>{engagement.client}</h1>
      <EngagementNav client={engagement.client} />
      <p className="muted">
        {count('answered')} answered · {count('commented')} by comment · {count('tbc')} TBC · {count('skipped')} not applicable · {count('open')} open — click <strong>Edit</strong> to change, clear or reopen a question.
      </p>
      {sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          <table>
            <thead><tr><th>#</th><th>Question</th><th>Answer</th><th>Status</th><th /></tr></thead>
            <tbody>
              {section.questions.map((q) => (
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
