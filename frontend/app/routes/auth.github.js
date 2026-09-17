import { startGitHubLogin } from '../auth.server.js';

export async function action({ request }) {
  const form = await request.formData();
  return startGitHubLogin(request, String(form.get('next') ?? '/'));
}
