import { Form, Link, Links, Meta, NavLink, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse, useRouteLoaderData } from 'react-router';

import { getUser } from './auth.server.js';
import stylesheet from './app.css?url';

export const links = () => [
  { rel: 'icon', href: '/favicon.ico', sizes: '128x128' },
  { rel: 'icon', href: '/brand/icon.svg', type: 'image/svg+xml' },
  { rel: 'apple-touch-icon', href: '/brand/icon.svg' },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  { rel: 'stylesheet', href: stylesheet },
];

export async function loader({ request }) {
  return { user: await getUser(request) };
}

export function Layout({ children }) {
  const root = useRouteLoaderData('root');
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <header className="topbar">
          <Link to="/" className="brand" aria-label="Merkle Discovery — home"><img src="/brand/merkle-wordmark.svg" alt="Merkle" width="142" height="18" /></Link>
          <nav className="topnav">
            {root?.user ? <NavLink to="/" end>Engagements</NavLink> : null}
            <NavLink to="/manual">Manual</NavLink>
            {root?.user ? <NavLink to="/claude">Claude Project</NavLink> : null}
          </nav>
          {root?.user ? (
            <Form method="post" action="/logout" className="user">
              <span className="who">{root.user.login} · {root.user.role}</span>
              <button type="submit" className="cta">Sign out</button>
            </Form>
          ) : <Link to="/login" className="cta">Sign in</Link>}
        </header>
        <p className="pilot">Pilot — demo or anonymised engagements only</p>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }) {
  const STATUS = { 400: 'Cannot do that yet', 401: 'Sign in again', 403: 'No access to this engagement', 404: 'Not found', 409: 'Something is missing first' };
  const title = isRouteErrorResponse(error) ? STATUS[error.status] ?? `Something went wrong (${error.status})` : 'Something went wrong';
  const details = isRouteErrorResponse(error) ? (typeof error.data === 'string' ? error.data : error.data?.error) : error instanceof Error ? error.message : '';
  return (
    <main className="narrow">
      <h1>{title}</h1>
      {details ? <p>{details}</p> : null}
      <p><Link to="/">Back to engagements</Link></p>
    </main>
  );
}
