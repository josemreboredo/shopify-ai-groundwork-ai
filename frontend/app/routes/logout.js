import { logout } from '../auth.server.js';

export const action = ({ request }) => logout(request);
