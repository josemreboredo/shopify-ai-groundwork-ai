import { Form, data, redirect } from 'react-router';

import { getUser, openSignIn, safeNext, sessionStorage } from '../auth.server.js';
import { engagementVisibility } from '../discovery.server.js';

export const meta = () => [{ title: 'Sign in · Merkle Discovery' }];

export async function loader({ request }) {
  const next = safeNext(new URL(request.url).searchParams.get('next'));
  if (await getUser(request)) throw redirect(next);
  const session = await sessionStorage.getSession(request.headers.get('Cookie'));
  return data({ error: session.get('error') ?? null, next, open: openSignIn(), shared: engagementVisibility() === 'all' }, { headers: { 'Set-Cookie': await sessionStorage.commitSession(session) } });
}

export default function Login({ loaderData }) {
  return (
    <main className="signin">
      <section className="signin-hero">
        <p className="eyebrow">AI-assisted discovery</p>
        <h1>Discovery</h1>
        <p>The Lead Consultant workspace for Shopify discovery: AI reads the client’s documents and drafts the solution, the engine decides the scope, and you run the conversation.</p>
        <ul>
          <li>AI pre-fills answers from the RFP, with the evidence for each one</li>
          <li>Questions that teach Shopify while you ask them</li>
          <li>Offer, scope gates and risks computed by code — never by the model</li>
          <li>An AI-drafted deck and annex, every Shopify fact sourced</li>
        </ul>
        <p className="signin-more"><a href="/about">What this is and how the AI is governed →</a></p>
      </section>
      <section className="signin-panel">
        <h2>Sign in</h2>
        {loaderData.error ? <p className="error">{loaderData.error}</p> : null}
        <Form method="post" action="/auth/github">
          <input type="hidden" name="next" value={loaderData.next} />
          <button type="submit">Sign in with GitHub</button>
        </Form>
        <p className="muted">{loaderData.open ? 'Any GitHub account can sign in as consultant.' : 'Access is limited to allowlisted accounts.'} {loaderData.shared ? 'Everyone signed in sees all engagements.' : 'Consultants see only their own engagements.'}</p>
        <p className="signin-pilot">Pilot — demo or anonymised engagements and documents only.</p>
      </section>
    </main>
  );
}
