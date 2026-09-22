import { Form, Link, redirect } from 'react-router';

import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { PROCESSES, processMeta } from '../../../discovery/service/process.js';
import { PRODUCT, pageTitle } from '../brand.js';

export const meta = () => [{ title: pageTitle('Bids and engagements') }];

export async function loader({ request }) {
  const user = await requireUser(request);
  return { engagements: await discovery().listEngagements(user) };
}

export async function action({ request }) {
  const user = await requireUser(request);
  const form = await request.formData();
  const client = String(form.get('client') ?? '').trim();
  try {
    await discovery().startInterview(user, {
      client,
      language: String(form.get('language') ?? 'en'),
      mode: String(form.get('mode') ?? 'standard'),
      process: String(form.get('process') ?? 'discovery'),
    });
  } catch (err) {
    return serviceFailure(err);
  }
  return redirect(`/engagements/${client}`);
}

const LANGUAGES = ['en', 'de', 'fr', 'it', 'es'];

function Status({ e }) {
  if (e.go) return <span className="badge go">GO</span>;
  // Beyond the offers is not a refusal: only "No bid" reads as one.
  if (e.route === 'larger_engagement') return <span className="badge flag">Larger Engagement</span>;
  if (e.route === 'no_bid') return <span className="badge stop">No bid</span>;
  return <span className="badge flag">Beyond offers · route needed</span>;
}

export default function Home({ loaderData, actionData }) {
  const { engagements } = loaderData;
  return (
    <main>
      <header className="page-head">
        <p className="eyebrow">{PRODUCT}</p>
        <h1>What are you working on?</h1>
        <p className="lede">
          One engine, two ways in. An RFP that has to be answered, or a discovery to run with a client —
          the same question bank, the same Shopify documentation, the same offer underneath.
        </p>
      </header>

      {/* Two doors. You say what you are doing; nothing asks you to classify a record. */}
      <div className="doors">
        <section className="door rfp">
          <p className="door-n" aria-hidden="true">01</p>
          <h2>Answer an RFP</h2>
          <p>A document arrived with a deadline. Read it in, confirm what it says, send the few questions that change the answer, and write the proposal.</p>
          <Form method="post" className="door-form">
            <input type="hidden" name="process" value="rfp" />
            <input type="hidden" name="mode" value="standard" />
            <div className="field">
              <label htmlFor="rfp-client">Client</label>
              <input id="rfp-client" name="client" placeholder="la-prairie" pattern="[a-z0-9][a-z0-9-]*" required />
            </div>
            <div className="field">
              <label htmlFor="rfp-language">Language</label>
              <select id="rfp-language" name="language" defaultValue="en">
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <button type="submit">Start a bid</button>
          </Form>
        </section>

        <section className="door discovery">
          <p className="door-n" aria-hidden="true">02</p>
          <h2>Run a discovery</h2>
          <p>A client is engaged and the work needs scoping. Work through the questions with them, then write the closing document and the delivery backlog.</p>
          <Form method="post" className="door-form">
            <input type="hidden" name="process" value="discovery" />
            <div className="field">
              <label htmlFor="d-client">Client</label>
              <input id="d-client" name="client" placeholder="acme-watches" pattern="[a-z0-9][a-z0-9-]*" required />
            </div>
            <div className="field">
              <label htmlFor="d-language">Language</label>
              <select id="d-language" name="language" defaultValue="en">
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="d-mode">Depth</label>
              <select id="d-mode" name="mode" defaultValue="standard">
                <option value="quick">Quick</option>
                <option value="standard">Standard</option>
                <option value="full">Full</option>
              </select>
            </div>
            <button type="submit">Start a discovery</button>
          </Form>
        </section>
      </div>
      {actionData?.error ? <p className="error">{actionData.error}</p> : null}

      <h2>Open now</h2>
      {engagements.length === 0 ? <p className="muted">Nothing open yet.</p> : (
        <table>
          <thead>
            <tr><th>Client</th><th>What</th><th>Offer</th><th>Status</th><th>Required answered</th><th>To confirm</th><th>Mode</th><th>Owner</th><th>Updated</th></tr>
          </thead>
          <tbody>
            {engagements.map((e) => (
              <tr key={e.client}>
                <td><Link to={`/engagements/${e.client}`}>{e.client}</Link></td>
                <td><span className={`badge process-${e.process}`}>{processMeta(e.process).record}</span></td>
                <td>{e.offer.code} · {e.offer.name}{e.offer.provisional ? <> <span className="badge provisional">provisional</span></> : null}</td>
                <td><Status e={e} /></td>
                <td>{e.coverage.required_answered} / {e.coverage.required_total}{e.coverage.required_tbc ? ` (${e.coverage.required_tbc} TBC)` : ''}</td>
                <td>{e.to_review ? <span className="badge flag">{e.to_review}</span> : '—'}</td>
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
