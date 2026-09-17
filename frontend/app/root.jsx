import { Form, Link, Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse, useRouteLoaderData } from 'react-router';

import { getUser } from './auth.server.js';
import stylesheet from './app.css?url';

export const links = () => [{ rel: 'stylesheet', href: stylesheet }];

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
          <Link to="/" className="brand">Merkle Discovery</Link>
          <span className="notice">Demo or anonymised engagements only</span>
          {root?.user ? (
            <Form method="post" action="/logout" className="user">
              <span>{root.user.login} · {root.user.role}</span>
              <button type="submit" className="link">Sign out</button>
            </Form>
          ) : null}
        </header>
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
