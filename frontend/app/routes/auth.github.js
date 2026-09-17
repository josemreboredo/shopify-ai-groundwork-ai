import { startGitHubLogin } from '../auth.server.js';

export const action = ({ request }) => startGitHubLogin(request);
