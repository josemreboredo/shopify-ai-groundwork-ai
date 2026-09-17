import { Form, Link, redirect } from 'react-router';

import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';

export const meta = () => [{ title: 'Engagements · Merkle Discovery' }];

export async function loader({ request }) {
  const user = await requireUser(request);
  return { engagements: await discovery().listEngagements(user) };
}

export async function action({ request }) {
  const user = await requireUser(request);
  const form = await request.formData();
  const client = String(form.get('client') ?? '').trim();
  try {
    await discovery().startInterview(user, { client, language: String(form.get('language') ?? 'en'), mode: String(form.get('mode') ?? 'standard') });
  } catch (err) {
    return serviceFailure(err);
  }
  return redirect(`/engagements/${client}`);
}

function Status({ e }) {
  if (e.go) return <span className="badge go">GO</span>;
  return <span className="badge stop">{e.route === 'larger_engagement' ? 'Larger Engagement' : e.route === 'no_bid' ? 'No bid' : 'STOP'}</span>;
}

export default function Home({ loaderData, actionData }) {
  const { engagements } = loaderData;
  return (
    <main>
      <h1>Engagements</h1>
      <h2>Start an interview</h2>
      <Form method="post" className="inline-form">
        <div className="field">
          <label htmlFor="client">Client slug</label>
          <input id="client" name="client" placeholder="acme-watches" pattern="[a-z0-9][a-z0-9-]*" required />
        </div>
        <div className="field">
          <label htmlFor="language">Conversation language</label>
          <select id="language" name="language" defaultValue="en">
            {['en', 'de', 'fr', 'it', 'es'].map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="mode">Mode</label>
          <select id="mode" name="mode" defaultValue="standard">
            <option value="quick">Quick (required)</option>
            <option value="standard">Standard</option>
            <option value="full">Full</option>
          </select>
        </div>
        <button type="submit">Start</button>
      </Form>
      {actionData?.error ? <p className="error">{actionData.error}</p> : null}

      <h2>Your engagements</h2>
      {engagements.length === 0 ? <p className="muted">No engagements yet.</p> : (
        <table>
          <thead>
            <tr><th>Client</th><th>Offer</th><th>Status</th><th>Required answered</th><th>Mode</th><th>Owner</th><th>Updated</th></tr>
          </thead>
          <tbody>
            {engagements.map((e) => (
              <tr key={e.client}>
                <td><Link to={`/engagements/${e.client}`}>{e.client}</Link></td>
                <td>{e.offer.code} · {e.offer.name}{e.offer.provisional ? <> <span className="badge provisional">provisional</span></> : null}</td>
                <td><Status e={e} /></td>
                <td>{e.coverage.required_answered} / {e.coverage.required_total}{e.coverage.required_tbc ? ` (${e.coverage.required_tbc} TBC)` : ''}</td>
                <td>{e.mode}</td>
                <td>{e.owner ?? '—'}</td>
                <td>{e.updated_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
