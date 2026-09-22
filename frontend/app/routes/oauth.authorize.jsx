import { Form, data, redirect } from 'react-router';

import { requireUser } from '../auth.server.js';
import { oauth } from '../discovery.server.js';
import { originOf } from '../origin.server.js';
import { CONNECTOR, pageTitle } from '../brand.js';

export const meta = () => [{ title: pageTitle('Connect Claude') }];

const PARAMS = ['client_id', 'redirect_uri', 'response_type', 'code_challenge', 'code_challenge_method', 'scope', 'state', 'resource'];
const pick = (source) => Object.fromEntries(PARAMS.map((k) => [k, source.get(k)]));

/** Validate; errors the client can't be trusted with are shown here, the rest go back to the client. */
async function validated(request, params) {
  const result = await oauth().validateAuthorize(params, originOf(request));
  if (result.ok) return result;
  if (result.redirect) throw redirect(oauth().deny({ redirect_uri: result.redirect_uri, state: result.state }, result.error));
  throw data({ error: `${result.error}: ${result.description}` }, { status: 400 });
}

export async function loader({ request }) {
  const params = pick(new URL(request.url).searchParams);
  const { client, request: grant } = await validated(request, params);
  const user = await requireUser(request);
  return { user, params, client: { name: client.client_name, id: client.client_id }, redirectHost: new URL(grant.redirect_uri).host, scope: grant.scope };
}

export async function action({ request }) {
  const form = await request.formData();
  const { request: grant } = await validated(request, pick(form));
  const user = await requireUser(request);
  if (form.get('decision') !== 'approve') throw redirect(oauth().deny(grant));
  throw redirect(await oauth().approve(grant, user.login));
}

export default function Authorize({ loaderData }) {
  const { user, params, client, redirectHost } = loaderData;
  return (
    <main id="main" className="narrow">
      <h1>Connect {client.name}</h1>
      <p><strong>{client.name}</strong> wants to use {CONNECTOR} as <strong>{user.login}</strong> ({user.role}).</p>
      <ul>
        <li>Read your engagements, questions, answers and the offer preview</li>
        <li>Record answers, notes and documents used — answers from documents stay “to confirm” until you confirm them</li>
      </ul>
      <p className="muted">After you allow access you return to <strong>{redirectHost}</strong>. Demo or anonymised engagements only.</p>
      <Form method="post" className="actions">
        {Object.entries(params).map(([k, v]) => (v === null ? null : <input key={k} type="hidden" name={k} value={v} />))}
        <button type="submit" name="decision" value="approve">Allow</button>
        <button type="submit" name="decision" value="deny" className="secondary">Cancel</button>
      </Form>
    </main>
  );
}
