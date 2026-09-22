import { oauth } from '../discovery.server.js';
import { jsonResponse } from '../origin.server.js';

export const loader = () => jsonResponse({ error: 'invalid_request', error_description: 'Use POST' }, 405);

export async function action({ request }) {
  let form;
  try {
    form = Object.fromEntries((await request.formData()).entries());
  } catch {
    return jsonResponse({ error: 'invalid_request', error_description: 'Send application/x-www-form-urlencoded' }, 400);
  }
  const { status, body } = await oauth().token(form);
  return jsonResponse(body, status);
}
