import { Form, Link, Links, Meta, NavLink, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse, useRouteLoaderData } from 'react-router';

import { getUser } from './auth.server.js';
import { PRODUCT } from './brand.js';
import stylesheet from './app.css?url';

export const links = () => [
  { rel: 'icon', href: '/favicon.ico', sizes: '128x128' },
  { rel: 'icon', href: '/brand/icon.svg', type: 'image/svg+xml' },
  { rel: 'apple-touch-icon', href: '/brand/icon.svg' },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  { rel: 'stylesheet', href: stylesheet },
];

/** The site's pages, once: the header and the footer both render from this. */
const PAGES = [
  { to: '/', label: 'Bids and engagements', end: true, signedIn: true },
  { to: '/offering', label: 'Offering', signedIn: true },
  { to: '/about', label: 'What this is' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/manual', label: 'Manual' },
  { to: '/claude', label: 'Claude Project', signedIn: true },
];
const pagesFor = (user) => PAGES.filter((p) => !p.signedIn || user);

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
          <Link to="/" className="brand" aria-label={`${PRODUCT} — home`}><img src="/brand/merkle-wordmark.svg" alt="Merkle" width="142" height="18" /></Link>
          <nav className="topnav">
            {pagesFor(root?.user).map((p) => <NavLink key={p.to} to={p.to} end={p.end}>{p.label}</NavLink>)}
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
        <SiteFooter pages={pagesFor(root?.user)} />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

const SOCIAL = [
  ['Instagram', 'https://www.instagram.com/merkle', <><rect x="4" y="4" width="16" height="16" rx="4.5" /><circle cx="12" cy="12" r="4" /><circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none" /></>],
  ['YouTube', 'https://www.youtube.com/@MerkleOfficial', <><rect x="2.5" y="6" width="19" height="12" rx="3.5" fill="currentColor" stroke="none" /><path d="M10.2 9.4v5.2l4.6-2.6z" fill="#000" stroke="none" /></>],
  ['LinkedIn', 'https://www.linkedin.com/company/merkle/posts/?feedView=all', <><path d="M6.6 10.2v7.2M6.6 6.9v.1M11 17.4v-4.3a2.6 2.6 0 0 1 5.2 0v4.3" /></>],
];

/**
 * The footer as merkle.com builds it: the mark and the links on the left, the
 * outlined M watermark on the right, dentsu and the copyright on the base line.
 */
function SiteFooter({ pages = [] }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-main">
          <a className="footer-mark" href="https://www.merkle.com" target="_blank" rel="noreferrer" aria-label="Merkle">
            <img src="/brand/merkle-mark.svg" alt="" width="32" height="18" />
          </a>

          <div className="footer-columns">
            <nav className="footer-links" aria-label="Pages">
              {pages.map((p) => <Link key={p.to} to={p.to}>{p.label}</Link>)}
            </nav>
            <nav className="footer-links" aria-label="Legal">
              <a href="https://www.merkle.com/en/legal-terms.html" target="_blank" rel="noreferrer">Legal Terms</a>
              <a href="https://www.merkle.com/en/privacy-policy.html" target="_blank" rel="noreferrer">Privacy Policy</a>
              <a href="https://www.merkle.com/en/privacy-policy/data-product-privacy-notice/control-your-personal-information.html" target="_blank" rel="noreferrer">Your Privacy Choices</a>
            </nav>
          </div>

          <nav className="footer-social" aria-label="Merkle on social media">
            {SOCIAL.map(([name, href, paths]) => (
              <a key={name} href={href} target="_blank" rel="noreferrer" aria-label={name} title={name}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">{paths}</svg>
              </a>
            ))}
          </nav>

          <p className="footer-note">{PRODUCT} — internal pilot tool. Demo or anonymised engagements only.</p>
        </div>

        <svg className="footer-watermark" viewBox="0 0 32 18" aria-hidden="true" focusable="false">
          <path d="M30.0227 0L22.6909 7.52548L15.3636 0H13.3818V18H17.105V7.30368L22.6896 13.0377L28.2756 7.30368V18H32V0H30.0227Z" fill="none" stroke="#2440D8" strokeWidth="0.18" />
        </svg>
      </div>

      <div className="footer-base">
        <a className="footer-dentsu" href="https://www.dentsu.com/" target="_blank" rel="noreferrer">
          <img src="/brand/dentsu-company.svg" alt="a dentsu company" width="104" height="10" />
        </a>
        <p className="footer-copy">© {new Date().getFullYear()} Merkle</p>
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
