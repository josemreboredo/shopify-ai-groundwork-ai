import { useEffect, useState } from 'react';
import { Form, Link, Links, Meta, NavLink, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse, useLocation, useRouteLoaderData } from 'react-router';

import { getUser } from './auth.server.js';
import { PRODUCT } from './brand.js';
import stylesheet from './app.css?url';
import { getSecurityHeaders } from './utils/security-headers.js';

export function headers() {
  return getSecurityHeaders();
}

export const links = () => [
  { rel: 'icon', href: '/favicon.ico', sizes: '128x128' },
  { rel: 'icon', href: '/brand/icon.svg', type: 'image/svg+xml' },
  { rel: 'apple-touch-icon', href: '/brand/icon.svg' },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  { rel: 'stylesheet', href: stylesheet },
];

/**
 * The site's pages, once. The header carries the top of each group, because a
 * top bar that lists every page is a menu nobody reads; the footer carries all
 * of them, grouped — it is where you look when you know the thing exists and
 * cannot remember where it lives.
 */
/*
 * Ordered the way a consultant meets the tool, not the way the pages were
 * written: the work first, then where the work is done, then what we are
 * selling, then how to use it, and last what it is. The old order put the
 * offering between the two places you actually work, and left the two
 * explanatory pages sitting in the middle of the bar.
 */
const SECTIONS = [
  {
    title: 'Work',
    pages: [
      { to: '/', label: 'Bids and engagements', end: true, signedIn: true, header: true },
      { to: '/claude', label: 'Claude Project', signedIn: true, header: true },
    ],
  },
  {
    title: 'The offer',
    pages: [
      { to: '/offering', label: 'Offering', signedIn: true, header: true },
      /* The product names, not the letters. "Offer S" is a filing code; nobody
         in a client conversation says it, and a consultant looking for what an
         engagement was sold as is looking for the name. They are the names in
         ai/schema/offering.json verbatim, pinned there by a test, so the
         menu cannot drift from the offering the engine runs.

         Two words each, which wraps to two lines at footer column width — the
         same as "Your Privacy Choices" already does in the Legal column. What
         did not fit was the earlier "S · Ecommerce Foundation", at three. */
      { to: '/offering/s', label: 'Ecommerce Foundation', signedIn: true },
      { to: '/offering/m', label: 'Ecommerce Scale', signedIn: true },
      { to: '/offering/l', label: 'Ecommerce Growth', signedIn: true },
      { to: '/offering/arc', label: 'Merkle Arc', signedIn: true },
    ],
  },
  {
    title: 'Manual',
    pages: [
      { to: '/manual', label: 'Manual', header: true },
      { to: '/manual/bid', label: 'Answer an RFP' },
      { to: '/manual/discovery', label: 'Run a discovery' },
    ],
  },
  {
    title: 'The tool',
    pages: [
      { to: '/about', label: 'What this is', header: true },
      { to: '/how-it-works', label: 'How it works', header: true },
    ],
  },
];

const visible = (pages, user) => pages.filter((p) => !p.signedIn || user);
/** The header: one link per group top, in the order the sections are declared. */
const headerPages = (user) => SECTIONS.flatMap((s) => visible(s.pages, user).filter((p) => p.header));
/** The footer: everything, grouped, minus any group that signing out empties. */
const footerSections = (user) => SECTIONS
  .map((s) => ({ ...s, pages: visible(s.pages, user) }))
  .filter((s) => s.pages.length);

export async function loader({ request }) {
  return { user: await getUser(request) };
}

/**
 * Six uppercase links wrapped onto three lines, so every page on a phone opened
 * with navigation. Below 760px they live behind one button — to the left of the
 * wordmark, where a phone expects it — and the footer keeps the full index for
 * anyone whose JavaScript never arrives.
 */
function MenuToggle({ open, onToggle }) {
  return (
    <button
      type="button"
      className="menu-toggle"
      aria-expanded={open}
      aria-controls="topnav"
      aria-label={open ? 'Close menu' : 'Menu'}
      onClick={onToggle}
    >
      {/* The word is gone from the screen, not from the accessibility tree. */}
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
        {open
          ? <><path d="M6.5 6.5l11 11" /><path d="M17.5 6.5l-11 11" /></>
          : <><path d="M3.5 7h17" /><path d="M3.5 12h17" /><path d="M3.5 17h17" /></>}
      </svg>
    </button>
  );
}

export function Layout({ children }) {
  const root = useRouteLoaderData('root');
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setMenuOpen(false), [pathname]);
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <header className="topbar">
          <MenuToggle open={menuOpen} onToggle={() => setMenuOpen((v) => !v)} />
          <Link to="/" className="brand" aria-label={`${PRODUCT} — home`}><img src="/brand/merkle-wordmark.svg" alt="Merkle" width="142" height="18" /></Link>
          <nav id="topnav" className={menuOpen ? 'topnav open' : 'topnav'} aria-label="Main">
            {headerPages(root?.user).map((p) => <NavLink key={p.to} to={p.to} end={p.end}>{p.label}</NavLink>)}
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
        <SiteFooter sections={footerSections(root?.user)} />
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
function SiteFooter({ sections = [] }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-main">
          <a className="footer-mark" href="https://www.merkle.com" target="_blank" rel="noreferrer" aria-label="Merkle">
            <img src="/brand/merkle-mark.svg" alt="" width="32" height="18" />
          </a>

          <div className="footer-columns">
            {sections.map((s) => (
              <nav className="footer-col" key={s.title} aria-label={s.title}>
                <p className="footer-col-title">{s.title}</p>
                <div className="footer-links">
                  {s.pages.map((p) => <Link key={p.to} to={p.to}>{p.label}</Link>)}
                </div>
              </nav>
            ))}
            <nav className="footer-col" aria-label="Legal">
              <p className="footer-col-title">Legal</p>
              <div className="footer-links">
                <a href="https://www.merkle.com/en/legal-terms.html" target="_blank" rel="noreferrer">Legal Terms</a>
                <a href="https://www.merkle.com/en/privacy-policy.html" target="_blank" rel="noreferrer">Privacy Policy</a>
                <a href="https://www.merkle.com/en/privacy-policy/data-product-privacy-notice/control-your-personal-information.html" target="_blank" rel="noreferrer">Your Privacy Choices</a>
              </div>
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
  const STATUS = { 400: 'Cannot do that yet', 401: 'Sign in again', 403: 'No access to this record', 404: 'This page does not exist', 409: 'Something is missing first' };
  const is404 = isRouteErrorResponse(error) && error.status === 404;
  const title = isRouteErrorResponse(error) ? STATUS[error.status] ?? `Something went wrong (${error.status})` : 'Something went wrong';
  // A wrong URL printed the framework's own sentence — "Error: No route matches
  // URL /nope" — which tells a consultant nothing and reads like a breakage.
  const details = is404
    ? 'The address is wrong, or the page moved. Everything the tool has is in the menu and the footer.'
    : isRouteErrorResponse(error)
      ? (typeof error.data === 'string' ? error.data : error.data?.error)
      : error instanceof Error ? error.message : '';
  return (
    <main id="main" className="narrow">
      <h1>{title}</h1>
      {details ? <p>{details}</p> : null}
      <p><Link to="/">Back to bids and engagements</Link> · <Link to="/manual">the manual</Link></p>
    </main>
  );
}
