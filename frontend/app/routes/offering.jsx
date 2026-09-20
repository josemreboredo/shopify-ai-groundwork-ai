import { Link } from 'react-router';

import { requireUser } from '../auth.server.js';
import { offeringView } from '../../../discovery/service/offering-view.js';
import { pageTitle } from '../brand.js';

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

const weeks = (w) => (w ? (w.min === w.max ? `${w.min}` : `${w.min}–${w.max}`) : '—');
const k = (n) => `${Math.round(n / 1000)}k`;
const band = (b, currency) => (b ? `${currency ?? ''} ${k(b.min)}–${k(b.max)}${b.open_ended ? '+' : ''}`.trim() : null);
const TRACK = { liquid: 'Online Store · Horizon', hydrogen: 'Headless · Hydrogen' };

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
        <p className="lede">
          The client’s answers decide which offer applies — nobody picks it by hand. This page shows what each
          offer covers, what moves an engagement from one to the next, and how each one meets Shopify.
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

      {/* 1 — the three offers as a progression */}
      <section>
        <h2>What each offer covers</h2>
        <div className="offer-ladder">
          {view.offers.map((o, i) => (
            <article key={o.code} className="offer">
              <p className="offer-code">{o.code}</p>
              <h3>{o.name}</h3>
              <p className="offer-when">{o.triggered_by}</p>
              <span className="chip">{TRACK[o.delivery_track] ?? o.delivery_track}</span>
              <p className="offer-weeks"><strong>{weeks(o.duration_weeks)}</strong> weeks{view.pricing && o.price_band ? <span> · {band(o.price_band, currency)}</span> : null}</p>
              <ul className="ticks">{o.base_scope.map((line) => <li key={line}>{line}</li>)}</ul>
              {i < view.offers.length - 1 ? <span className="offer-next" aria-hidden="true" /> : null}
            </article>
          ))}
        </div>
        {view.pricing ? (
          <p className="callout"><strong>Internal pricing.</strong> Price bands are Merkle’s commercial position and never appear in a client document — the engine keeps them out of everything it generates.</p>
        ) : (
          <p className="muted">Price bands are shown to engagement leads. The durations above are the high-level estimate.</p>
        )}
      </section>

      {/* 2 — how the offer is decided */}
      <section className="band dark">
        <div className="band-inner">
          <p className="eyebrow">How the offer is decided</p>
          <h2 className="plain">The engine asks four questions, in order, and stops at the first yes</h2>
          <ol className="decide">
            {view.classification.map((c) => (
              <li key={c.order}>
                <span className="decide-q">{c.plain}</span>
                <span className="decide-arrow" aria-hidden="true">→</span>
                <span className="decide-a">{c.offer}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 3 — the gates */}
      <section>
        <h2>The scope gates</h2>
        <p className="lede">Each gate is a requirement that grows the build. One gate keeps an engagement in S with a modifier; two or more make it an M.</p>
        <div className="gate-grid">
          {view.gates.map((g) => (
            <article key={g.id} className="gate">
              <header>
                <h3>{g.label}</h3>
                {g.effort_weeks ? <span className="chip">+{weeks(g.effort_weeks)} wk{view.pricing && g.price_add ? ` · ${band(g.price_add, currency)}` : ''}</span> : null}
              </header>
              <details className="rule-exact">
                <summary>The exact rule</summary>
                <p className="gate-when">{g.condition}</p>
              </details>
              {g.adds ? <p className="muted">{g.adds}</p> : null}
            </article>
          ))}
        </div>
        <div className="l-triggers">
          <p className="eyebrow">What makes it an L, whatever the gates say</p>
          <ul>{view.l_triggers.map((t) => <li key={t.id}><strong>{t.label}</strong><details className="rule-exact"><summary>The exact rule</summary><span>{t.condition}</span></details></li>)}</ul>
        </div>
      </section>

      {/* 4 — Shopify */}
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
              <thead><tr><th scope="col"><span className="sr-only">Actions</span></th><th scope="col">Storefront</th><th scope="col">Shopify plan</th><th scope="col">How it is built</th><th scope="col">Stores</th></tr></thead>
              <tbody>
                {view.offers.map((o) => (
                  <tr key={o.code}>
                    <th scope="row"><span className="offer-code small">{o.code}</span></th>
                    {/* The labels travel with the cells, so the table can stack
                        on a phone instead of scrolling ten columns sideways. */}
                    <td data-label="Storefront">{o.approach.storefront}</td>
                    <td data-label="Shopify plan">{o.approach.plan}</td>
                    <td data-label="How it is built">{o.approach.build}</td>
                    <td data-label="Stores">{o.approach.topology}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="plan-title">What earns a higher Shopify plan</h3>
          <p className="muted">The offers never assume Plus. These are the requirements that earn it, each with the Shopify page that sets the limit.</p>
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
        </div>
      </section>

      {/* 5 — beyond the offers */}
      <section>
        <h2>When an engagement goes beyond the offers</h2>
        <p className="lede">
          Some answers take an engagement past S, M and L. That is not a refusal — it is a decision about how
          Merkle proceeds, recorded in Q10.5.5 before the closing document is written.
        </p>
        <div className="routes">
          {view.routes.map((r) => (
            <article key={r.id} className={`route route-${r.id}`}>
              <h3>{r.label}</h3>
              {r.proposal ? <p className="route-proposal">{r.proposal}</p> : null}
              <p className="muted">{r.description}</p>
            </article>
          ))}
        </div>

        <h3 className="rules-title">What takes it beyond the offers <span className="chip">{view.exits.beyond_offers.length}</span></h3>
        <RuleList rules={view.exits.beyond_offers} pricing={view.pricing} />

        <details className="rules-more">
          <summary>What needs a named owner before the build starts <span className="chip">{view.exits.flags.length}</span></summary>
          <p className="muted">Flags do not change the route. Each needs an owner and a resolution before build.</p>
          <RuleList rules={view.exits.flags} pricing={view.pricing} />
        </details>
        {view.exits.commercial.length ? (
          <details className="rules-more">
            <summary>Commercial adjustments <span className="chip">{view.exits.commercial.length}</span></summary>
            <p className="muted">Recorded in the proposal; they do not change the route.</p>
            <RuleList rules={view.exits.commercial} pricing={view.pricing} />
          </details>
        ) : null}

        <p className="muted small">
          Offering version {view.version}. For a specific engagement, its <Link to="/">summary</Link> shows which of these fired and why.
        </p>
      </section>
    </main>
  );
}

function RuleList({ rules, pricing }) {
  return (
    <ul className="rules">
      {rules.map((r) => (
        <li key={r.id}>
          <span className="rule-id">{r.id}</span>
          <div>
            {/* The condition is the engine's own wording — JSON keys, field
                comparisons and, in places, a path in this repository. It stays,
                because a rule you cannot check is a rule you cannot argue with,
                but it is no longer the sentence the page opens with. */}
            <p className="rule-when">{r.label ?? r.condition}</p>
            <p className="muted">→ {r.destination}</p>
            {r.label ? (
              <details className="rule-exact">
                <summary>The exact rule</summary>
                <p className="muted">{r.condition}</p>
              </details>
            ) : null}
            {pricing && r.internal_note ? <p className="rule-note">{r.internal_note}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
