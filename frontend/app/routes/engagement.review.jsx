import { Form, Link, redirect, useNavigation } from 'react-router';

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

export async function action({ request, params }) {
  const user = await requireUser(request);
  const form = await request.formData();
  if (String(form.get('intent')) !== 'delete') return { error: 'Unknown action' };
  try {
    await discovery().deleteEngagement(user, params.client, { confirm: String(form.get('confirm') ?? '') });
  } catch (err) {
    return serviceFailure(err);
  }
  return redirect('/');
}

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
  return (
    <main>
      <EngagementHeader
        language={language}
        client={engagement.client}
        eyebrow="Review answers"
        meta={`${count('answered')} answered · ${count('commented')} by comment · ${count('tbc')} TBC · ${count('skipped')} not applicable · ${count('open')} open`}
      />
      <p className="muted">Click <strong>Edit</strong> on a question to change, clear or reopen it.</p>
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
