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
    <main className="narrow">
      <h1>Merkle Discovery</h1>
      <p>Lead Consultant workspace for Shopify discovery.</p>
      {loaderData.error ? <p className="error">{loaderData.error}</p> : null}
      <Form method="post" action="/auth/github">
        <input type="hidden" name="next" value={loaderData.next} />
        <button type="submit">Sign in with GitHub</button>
      </Form>
      <p className="muted">{loaderData.open ? 'Any GitHub account can sign in as consultant.' : 'Access is limited to allowlisted accounts.'} {loaderData.shared ? 'Everyone signed in sees all engagements.' : 'Consultants see only their own engagements.'}</p>
      <p className="error">Pilot: demo or anonymised engagements and documents only.</p>
    </main>
  );
}
