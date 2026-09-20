import { Form, Link, redirect } from 'react-router';

import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { processMeta } from '../../../discovery/service/process.js';
import { offerStanding, statusOf } from '../../../discovery/service/summary.js';
import { PRODUCT, pageTitle } from '../brand.js';
import { LANGUAGES as SUPPORTED_LANGUAGES, LANGUAGE_NAMES } from '../../../discovery/agents/language.js';

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

// The languages the tool can actually run an engagement in. The list used to be
// written here by hand and carried two the questionnaire has no words for, so a
// consultant could start an Italian engagement and be asked everything in English.
const LANGUAGES = SUPPORTED_LANGUAGES.map((code) => [code, LANGUAGE_NAMES[code]]);

/**
 * Where a record is in its own process — a different axis from the offer.
 *
 * This used to repeat the offer's own verdict, so the row read "M · Ecommerce
 * Scale" under Offer and "Larger Engagement" under Status: an answer beside the
 * rule that superseded it, in two columns pretending to say different things.
 * The offer says what commercial shape this is; this says how far along it is,
 * and a bid and an engagement are not far along the same thing.
 */
function Status({ e }) {
  const s = statusOf(e);
  return <span className={`badge ${s.tone}`}>{s.label}</span>;
}

/**
 * What is left to say once the status badge has spoken. The badge already
 * carries the count it is about — the answers to confirm, or how far the
 * interview has got — so repeating it under the badge is noise, not detail.
 */
function progressUnder(e) {
  const { id } = statusOf(e);
  if (id === 'to_confirm' || id === 'reviewing' || id === 'questions_to_decide') return null;
  const c = e.coverage ?? {};
  if (!c.required_total) return null;
  if (id === 'interviewing') return c.required_tbc ? `${c.required_tbc} TBC` : null;
  return `${c.required_answered} of ${c.required_total} required${c.required_tbc ? ` · ${c.required_tbc} TBC` : ''}`;
}

export default function Home({ loaderData, actionData }) {
  const { engagements } = loaderData;
  return (
    <main id="main">
      <header className="page-head">
        <p className="eyebrow">{PRODUCT} · Shopify</p>
        <h1>What are you working on?</h1>
        <p className="lede">
          Shopify bids and discoveries, on one engine. An RFP that has to be answered, or a discovery to
          run with a client — the same question bank, the same verified Shopify documentation, the same
          offer and the same scope gates underneath.
        </p>
      </header>

      {/* Creating one is the occasional act; opening one is the daily one. The
          forms took the whole top of the page for the thing you do least, so
          they fold away and the list comes first. */}
      <details className="card prefill new-record">
        <summary>
          <span className="prefill-title">New — start a bid or a discovery</span>
          <span className="muted prefill-status">{engagements.length} open · start another</span>
        </summary>
      <div className="doors">
        <section className="door rfp">
          <p className="door-n" aria-hidden="true">01</p>
          <h2>Answer a new RFP</h2>
          <p>A Shopify RFP arrived with a deadline. Read it in, confirm what it says, send the few questions that change the answer, and write the proposal.</p>
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
                {LANGUAGES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
              </select>
            </div>
            <button type="submit">Start a bid</button>
          </Form>
        </section>

        <section className="door discovery">
          <p className="door-n" aria-hidden="true">02</p>
          <h2>Run a new discovery</h2>
          <p>A client is engaged and the Shopify build needs scoping. Work through the questions with them, then write the closing document and the delivery backlog.</p>
          <Form method="post" className="door-form">
            <input type="hidden" name="process" value="discovery" />
            <div className="field">
              <label htmlFor="d-client">Client</label>
              <input id="d-client" name="client" placeholder="acme-watches" pattern="[a-z0-9][a-z0-9-]*" required />
            </div>
            <div className="field">
              <label htmlFor="d-language">Language</label>
              <select id="d-language" name="language" defaultValue="en">
                {LANGUAGES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
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
      </details>
      {actionData?.error ? <p className="error">{actionData.error}</p> : null}

      <h2>Open now</h2>
      {engagements.length === 0 ? <p className="muted">Nothing open yet.</p> : (
        <>
        {/* A phone is not scanning a portfolio, it is finding one record and
            opening it: who, where it stands, what is waiting on me. Nine columns
            are a desk instrument, so below 760px this list replaces them. */}
        <ul className="record-cards">
          {engagements.map((e) => (
            <li key={e.client} className={`tone-${statusOf(e).tone || 'none'}`}>
              <p className="record-top">
                <Link to={`/engagements/${e.client}`}>{e.client}</Link>
                <Status e={e} />
              </p>
              <p className="record-what">
                <span className={`badge process-${e.process}`}>{processMeta(e.process).record}</span>
                {' '}{offerStanding(e).short}
                {offerStanding(e).applies && e.offer.provisional ? <span className="muted small"> · provisional</span> : null}
              </p>
              {/* The badge above now states the headline — "91 to confirm",
                  "Interviewing — 61 of 85" — so the card said it twice. This line
                  carries only what the badge did not. */}
              {progressUnder(e) ? <p className="record-progress">{progressUnder(e)}</p> : null}
              <p className="record-meta">{e.mode} · {e.owner ?? '—'} · {e.updated_at}</p>
            </li>
          ))}
        </ul>
        <div className="table-scroll record-table" role="region" tabIndex={0} aria-label="Bids and engagements, scrollable table">
        <table>
          <thead>
            <tr><th scope="col">Client</th><th scope="col">What</th><th scope="col">Offer</th><th scope="col">Status</th><th scope="col">Required answered</th><th scope="col">To confirm</th><th scope="col">Mode</th><th scope="col">Owner</th><th scope="col">Updated</th></tr>
          </thead>
          <tbody>
            {engagements.map((e) => (
              <tr key={e.client}>
                <td><Link to={`/engagements/${e.client}`}>{e.client}</Link></td>
                <td><span className={`badge process-${e.process}`}>{processMeta(e.process).record}</span></td>
                <td>
                  {offerStanding(e).short}
                  {offerStanding(e).applies && e.offer.provisional ? <div className="muted small">provisional</div> : null}
                </td>
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
        </div>
        </>
      )}
    </main>
  );
}
