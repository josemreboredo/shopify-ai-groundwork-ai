import { finishGitHubLogin } from '../auth.server.js';

export const loader = ({ request }) => finishGitHubLogin(request);
