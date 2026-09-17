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
        <img src="/brand/merkle-mark.svg" alt="" width="32" height="18" />
        <h1>Discovery</h1>
        <p>The Lead Consultant workspace for Shopify discovery: run the questionnaire with the client, and close it with a sourced consulting document.</p>
        <ul>
          <li>Questions that explain what they decide and why</li>
          <li>Offer, scope gates and risks computed from the answers</li>
          <li>A closing deck and annex, every Shopify fact sourced</li>
        </ul>
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
