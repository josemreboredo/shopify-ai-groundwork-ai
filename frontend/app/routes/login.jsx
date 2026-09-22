import { Form, data, redirect } from 'react-router';

import { getUser, openSignIn, safeNext, sessionStorage } from '../auth.server.js';
import { engagementVisibility } from '../discovery.server.js';
import { PRODUCT, pageTitle } from '../brand.js';

export const meta = () => [
  { title: pageTitle('Sign in') },
  { name: 'description', content: 'One engine, two ways in: answer an RFP or run a Shopify discovery, with the commercials computed by code and every Shopify claim sourced.' },
];

export async function loader({ request }) {
  const next = safeNext(new URL(request.url).searchParams.get('next'));
  if (await getUser(request)) throw redirect(next);
  const session = await sessionStorage.getSession(request.headers.get('Cookie'));
  return data({ error: session.get('error') ?? null, next, open: openSignIn(), shared: engagementVisibility() === 'all' }, { headers: { 'Set-Cookie': await sessionStorage.commitSession(session) } });
}

export default function Login({ loaderData }) {
  return (
    <main id="main" className="signin">
      <section className="signin-hero">
        <p className="eyebrow">Merkle commerce practice · Shopify</p>
        <h1>{PRODUCT}</h1>
        <p>Shopify bids and discoveries, on one engine. An <strong>RFP</strong> that has to be answered, or a <strong>discovery</strong> to run with a client — the same question bank, the same verified Shopify documentation, the same offer underneath.</p>
        <ul>
          <li>Claude reads the RFP and records what it answers, with the quote behind each one</li>
          <li>A Go/No-Go position on whether the work can be priced and stood behind</li>
          <li>Only the questions worth sending back, as a document the client can answer</li>
          <li>Offer, scope gates and exit rules computed by code — never by the model</li>
          <li>A proposal or a closing document, every Shopify fact sourced, then the delivery handover</li>
        </ul>
        <p className="signin-more"><a href="/about">What this is and how the AI is governed →</a> · <a href="/manual">the manual</a></p>
      </section>
      <section className="signin-panel">
        <h2>Sign in</h2>
        {loaderData.error ? <p className="error">{loaderData.error}</p> : null}
        <Form method="post" action="/auth/github">
          <input type="hidden" name="next" value={loaderData.next} />
          <button type="submit">Sign in with GitHub</button>
        </Form>
        <p className="muted">{loaderData.open ? 'Any GitHub account can sign in as consultant.' : 'Access is limited to allowlisted accounts.'} {loaderData.shared ? 'Everyone signed in sees all bids and engagements.' : 'Consultants see only their own bids and engagements.'}</p>
        <p className="signin-pilot">Pilot — demo or anonymised engagements and documents only.</p>
      </section>
    </main>
  );
}
