/**
 * Sign-in for the interim hosting (ADR 0014): GitHub login with an allowlist.
 * Replaced by dentsu SSO at migration. The GitHub access token is used once to
 * read the login and never stored.
 *
 * Env: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, SESSION_SECRET, OWNER_GITHUB_LOGINS,
 * CONSULTANT_GITHUB_LOGINS; locally DEV_LOGIN signs in without GitHub.
 */
import { createCookieSessionStorage, redirect } from 'react-router';

import { isOpenSignIn, userFor } from '../../discovery/service/index.js';

const production = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

if (production && !process.env.SESSION_SECRET) throw new Error('SESSION_SECRET is required');

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__lc_session',
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: production,
    maxAge: 60 * 60 * 8,
    secrets: [process.env.SESSION_SECRET ?? 'local-development-only'],
  },
});

const allowlist = () => ({ owners: process.env.OWNER_GITHUB_LOGINS ?? '', consultants: process.env.CONSULTANT_GITHUB_LOGINS ?? '' });

/** True when every GitHub account may sign in as consultant. */
export const openSignIn = () => isOpenSignIn(allowlist());

/** Local development sign-in without GitHub (never in production). */
const devLogin = () => (!production && process.env.DEV_LOGIN ? process.env.DEV_LOGIN.toLowerCase() : null);

/**
 * The allowlisted user for a login, re-checked on every request (also for connector tokens).
 *
 * @param {string} login
 */
export function userForLogin(login) {
  if (devLogin() && login === devLogin()) return { login, role: 'owner' };
  return userFor(login, allowlist());
}

/** @param {Request} request */
export async function getUser(request) {
  if (devLogin()) return { login: devLogin(), role: 'owner' };
  const session = await sessionStorage.getSession(request.headers.get('Cookie'));
  const login = session.get('login');
  return login ? userForLogin(login) : null;
}

/** Only same-site paths are accepted as a place to return to after sign-in. @param {unknown} next */
export const safeNext = (next) => (typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\') ? next : '/');

/** @param {Request} request */
export async function requireUser(request) {
  const user = await getUser(request);
  if (!user) {
    const url = new URL(request.url);
    throw redirect(`/login?next=${encodeURIComponent(url.pathname + url.search)}`);
  }
  return user;
}

/** @param {Request} request */
export const callbackUrl = (request) => new URL('/auth/github/callback', request.url).toString();

/** @param {Request} request @param {string} [next] */
export async function startGitHubLogin(request, next) {
  if (!process.env.GITHUB_CLIENT_ID) throw new Error('GITHUB_CLIENT_ID is not configured');
  const session = await sessionStorage.getSession(request.headers.get('Cookie'));
  const state = crypto.randomUUID();
  session.set('oauth_state', state);
  session.set('next', safeNext(next));
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID);
  url.searchParams.set('redirect_uri', callbackUrl(request));
  url.searchParams.set('scope', 'read:user');
  url.searchParams.set('state', state);
  return redirect(url.toString(), { headers: { 'Set-Cookie': await sessionStorage.commitSession(session) } });
}

/** @param {Request} request */
export async function finishGitHubLogin(request) {
  const url = new URL(request.url);
  const session = await sessionStorage.getSession(request.headers.get('Cookie'));
  const expected = session.get('oauth_state');
  session.unset('oauth_state');
  const fail = async (message) => {
    session.flash('error', message);
    return redirect('/login', { headers: { 'Set-Cookie': await sessionStorage.commitSession(session) } });
  };
  if (!expected || url.searchParams.get('state') !== expected) return fail('Sign-in expired — try again');

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code: url.searchParams.get('code'),
      redirect_uri: callbackUrl(request),
    }),
  });
  const token = (await tokenResponse.json()).access_token;
  if (!token) return fail('GitHub sign-in failed');

  const profile = await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'merkle-discovery' } });
  const login = profile.ok ? (await profile.json()).login : null;
  if (!login || !userFor(login, allowlist())) return fail('This GitHub account is not on the allowlist');

  const next = safeNext(session.get('next'));
  session.unset('next');
  session.set('login', login);
  return redirect(next, { headers: { 'Set-Cookie': await sessionStorage.commitSession(session) } });
}

/** @param {Request} request */
export async function logout(request) {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'));
  return redirect('/login', { headers: { 'Set-Cookie': await sessionStorage.destroySession(session) } });
}
