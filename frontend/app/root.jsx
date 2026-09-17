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
        <SiteFooter />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

const SOCIAL = [
  ['Instagram', 'https://www.instagram.com/merkle', <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none" /></>],
  ['YouTube', 'https://www.youtube.com/@MerkleOfficial', <><rect x="2" y="5" width="20" height="14" rx="4" /><path d="M10 9.2v5.6l5-2.8z" fill="currentColor" stroke="none" /></>],
  ['LinkedIn', 'https://www.linkedin.com/company/merkle/posts/?feedView=all', <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M7.5 10v7M7.5 7.2v.1M12 17v-4a2 2 0 0 1 4 0v4" /></>],
];

/** Merkle's own footer: legal links, social and the dentsu line, on every page. */
function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <img src="/brand/merkle-wordmark.svg" alt="Merkle" width="142" height="18" />
          <img src="/brand/dentsu-company.svg" alt="a dentsu company" width="104" height="10" />
        </div>
        <nav className="footer-social" aria-label="Merkle on social media">
          {SOCIAL.map(([name, href, paths]) => (
            <a key={name} href={href} target="_blank" rel="noreferrer" aria-label={name} title={name}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">{paths}</svg>
            </a>
          ))}
        </nav>
      </div>
      <div className="footer-bottom">
        <nav className="footer-links" aria-label="Legal">
          <a href="https://www.merkle.com/en/legal-terms.html" target="_blank" rel="noreferrer">Legal Terms</a>
          <a href="https://www.merkle.com/en/privacy-policy.html" target="_blank" rel="noreferrer">Privacy Policy</a>
          <a href="https://www.merkle.com/en/privacy-policy/data-product-privacy-notice/control-your-personal-information.html" target="_blank" rel="noreferrer">Your Privacy Choices</a>
        </nav>
        <p>© {new Date().getFullYear()} Merkle · Merkle Discovery is an internal pilot tool — demo or anonymised engagements only.</p>
      </div>
    </footer>
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
