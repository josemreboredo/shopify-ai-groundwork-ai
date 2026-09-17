import { Form, Link, Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse, useRouteLoaderData } from 'react-router';

import { getUser } from './auth.server.js';
import stylesheet from './app.css?url';

export const links = () => [
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
          <Link to="/" className="brand" aria-label="Merkle Discovery — home"><span className="mark" aria-hidden="true" />Merkle</Link>
          <nav className="topnav">
            {root?.user ? <Link to="/">Engagements</Link> : null}
            <Link to="/manual">Manual</Link>
            {root?.user ? <Link to="/claude">Claude Project</Link> : null}
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
  const title = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : 'Something went wrong';
  const details = isRouteErrorResponse(error) ? (typeof error.data === 'string' ? error.data : error.data?.error) : error instanceof Error ? error.message : '';
  return (
    <main className="narrow">
      <h1>{title}</h1>
      {details ? <p>{details}</p> : null}
      <p><Link to="/">Back to engagements</Link></p>
    </main>
  );
}
