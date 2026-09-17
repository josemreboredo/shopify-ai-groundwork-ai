import { Form, data, redirect } from 'react-router';

import { getUser, sessionStorage } from '../auth.server.js';

export const meta = () => [{ title: 'Sign in · Merkle Discovery' }];

export async function loader({ request }) {
  if (await getUser(request)) throw redirect('/');
  const session = await sessionStorage.getSession(request.headers.get('Cookie'));
  return data({ error: session.get('error') ?? null }, { headers: { 'Set-Cookie': await sessionStorage.commitSession(session) } });
}

export default function Login({ loaderData }) {
  return (
    <main className="narrow">
      <h1>Merkle Discovery</h1>
      <p>Lead Consultant workspace for Shopify discovery.</p>
      {loaderData.error ? <p className="error">{loaderData.error}</p> : null}
      <Form method="post" action="/auth/github">
        <button type="submit">Sign in with GitHub</button>
      </Form>
      <p className="muted">Access is limited to allowlisted accounts.</p>
    </main>
  );
}
