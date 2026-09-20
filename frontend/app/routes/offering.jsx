import { Link } from 'react-router';

import { requireUser } from '../auth.server.js';
import { offeringView } from '../../../discovery/service/offering-view.js';
import { pageTitle } from '../brand.js';
import { band, TRACK, weeks } from '../offering.js';
import { OfferScale } from '../components/diagram.jsx';

export const meta = () => [{ title: pageTitle('The offering') }];

/**
 * Signed-in only. Price bands travel only to owners: while sign-in is open to any
 * GitHub account, "signed in" does not mean "Merkle", and the offering view strips
 * Merkle pricing on the server for everyone else.
 */
export async function loader({ request }) {
  const user = await requireUser(request);
  return { view: offeringView({ pricing: user.role === 'owner' }) };
}

/** The resolution ladder every requirement climbs, cheapest first. */
const LADDER = [
  ['Native Shopify', 'A feature the platform already has, configured'],
  ['App Store app', 'Only where native stops — and the reason is written down'],
  ['Theme work', 'Sections and blocks, still editable by the merchant'],
  ['Custom', 'Functions, metaobjects, a custom app — when nothing cheaper works'],
];

export default function Offering({ loaderData }) {
  const { view } = loaderData;
  const currency = view.offers[0]?.currency;
  const plans = ['Grow', 'Advanced', 'Shopify Plus'].map((plan) => ({ plan, features: view.plan_gates.filter((g) => g.plan === plan) }));

  return (
    <main id="main" className="story offering">
      <header className="page-head">
        <p className="eyebrow">Internal · signed-in consultants</p>
        <h1>Three offers, one engine</h1>
        <p className="answer-line">The client&rsquo;s answers decide which offer applies. Nobody picks it by hand.</p>
        <p className="lede">
          This page is the map. Each offer has its own page: what it covers, how it meets Shopify, and what moves
          an engagement out of it.
        </p>
        <ul className="stats">
          {view.offers.map((o) => (
            <li key={o.code}>
              <strong>{o.code}</strong>
              <span>{o.name} · {weeks(o.duration_weeks)} weeks{view.pricing && o.price_band ? ` · ${band(o.price_band, currency)}` : ''}</span>
            </li>
          ))}
        </ul>
      </header>

      {/* 1 — the way in. Each offer is a door, not a column of text. */}
      <section>
        <h2>The three offers, on one scale</h2>
        <OfferScale offers={view.offers} pricing={view.pricing} currency={currency} />
      </section>

      <section>
        <h2>The four segments</h2>
        <ol className="segments">
          {view.offers.map((o) => (
            <li key={o.code}>
              <Link to={`/offering/${o.code.toLowerCase()}`}>
                <span className="seg-code">{o.code}</span>
                <span className="seg-name">{o.name}</span>
                <span className="seg-when">{o.triggered_by}</span>
                <span className="seg-meta">
                  {weeks(o.duration_weeks)} weeks · {TRACK[o.delivery_track] ?? o.delivery_track}
                  {view.pricing && o.price_band ? ` · ${band(o.price_band, currency)}` : ''}
                </span>
              </Link>
            </li>
          ))}
          <li className="beyond">
            <Link to="/offering/larger-engagement">
              <span className="seg-code">—</span>
              <span className="seg-name">Beyond the offers</span>
              <span className="seg-when">The requirements go past S, M and L</span>
              <span className="seg-meta">{view.exits.beyond_offers.length} rules · 2 routes</span>
            </Link>
          </li>
        </ol>
        {view.pricing ? (
          <p className="callout"><strong>Internal pricing.</strong> Price bands are Merkle&rsquo;s commercial position and never appear in a client document — the engine keeps them out of everything it generates.</p>
        ) : (
          <p className="muted">Price bands are shown to engagement leads. The durations above are the high-level estimate.</p>
        )}
      </section>

      {/* 2 — the rule, drawn. "Stops at the first yes" is the whole of it. */}
      <section className="band dark">
        <div className="band-inner">
          <p className="eyebrow">How the offer is decided</p>
          <h2 className="plain">Four questions, in order. It stops at the first yes.</h2>
          <ol className="decide">
            {view.classification.map((c) => (
              <li key={c.order}>
                <span className="decide-q">{c.plain}</span>
                <span className="decide-arrow" aria-hidden="true">&rarr;</span>
                <span className="decide-a">{c.offer}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 3 — the one rule that is the same in every offer */}
      <section className="band">
        <div className="band-inner">
          <p className="eyebrow">How each offer meets Shopify</p>
          <h2 className="plain">Every requirement climbs the same ladder — the offers differ in how far up it goes</h2>
          <ol className="ladder">
            {LADDER.map(([title, line]) => (
              <li key={title}><strong>{title}</strong><span>{line}</span></li>
            ))}
          </ol>
          <div className="table-scroll" role="region" tabIndex={0} aria-label="Offer comparison, scrollable table">
            <table className="compare">
              <thead><tr><th scope="col"><span className="sr-only">Offer</span></th><th scope="col">Storefront</th><th scope="col">Shopify plan</th><th scope="col">How it is built</th><th scope="col">Stores</th></tr></thead>
              <tbody>
                {view.offers.map((o) => (
                  <tr key={o.code}>
                    <th scope="row"><Link to={`/offering/${o.code.toLowerCase()}`} className="offer-code small">{o.code}</Link></th>
                    <td data-label="Storefront">{o.approach.storefront}</td>
                    <td data-label="Shopify plan">{o.approach.plan}</td>
                    <td data-label="How it is built">{o.approach.build}</td>
                    <td data-label="Stores">{o.approach.topology}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4 — the plan is never assumed, so what earns it is stated */}
      <section>
        <h2>What earns a higher Shopify plan</h2>
        <p className="lede">The offers never assume Plus. These are the requirements that earn it, each with the Shopify page that sets the limit.</p>
        <div className="plan-cols">
          {plans.map(({ plan, features }) => (
            <div key={plan}>
              <p className="plan-name">{plan}</p>
              <ul>
                {features.map((f) => <li key={f.feature}><a href={f.docs} target="_blank" rel="noreferrer">{f.feature}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <p className="muted small">
          Offering version {view.version}. For a specific engagement, its <Link to="/">summary</Link> shows which
          of these fired and why.
        </p>
      </section>
    </main>
  );
}
