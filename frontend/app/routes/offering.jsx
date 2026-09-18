import { Link } from 'react-router';

import { requireUser } from '../auth.server.js';
import { offeringView } from '../../../discovery/service/offering-view.js';

export const meta = () => [{ title: 'The offering · Merkle Discovery' }];

/**
 * Signed-in only. Price bands travel only to owners: while sign-in is open to any
 * GitHub account, "signed in" does not mean "Merkle", and the offering view strips
 * Merkle pricing on the server for everyone else.
 */
export async function loader({ request }) {
  const user = await requireUser(request);
  return { view: offeringView({ pricing: user.role === 'owner' }), role: user.role };
}

const weeks = (w) => (w ? (w.min === w.max ? `${w.min} weeks` : `${w.min}–${w.max} weeks`) : '—');
const k = (n) => `${Math.round(n / 1000)}k`;
const band = (b, currency) => (b ? `${currency ?? ''} ${k(b.min)}–${k(b.max)}${b.open_ended ? '+' : ''}`.trim() : null);
const TRACK = { liquid: 'Online Store · Horizon theme', hydrogen: 'Headless · Hydrogen' };

export default function Offering({ loaderData }) {
  const { view } = loaderData;
  const currency = view.offers[0]?.currency;

  return (
    <main className="story">
      <header className="page-head">
        <p className="eyebrow">Internal · signed-in consultants</p>
        <h1>The S, M and L offering</h1>
        <p className="lede">
          What each offer covers, what decides which one applies, what takes an engagement beyond them,
          the high-level estimate, and how each one meets Shopify. Built from the rules the engine runs,
          so it says exactly what the engine does.
        </p>
      </header>

      <section>
        <div className="offers">
          {view.offers.map((o) => (
            <article key={o.code} className="offer">
              <p className="offer-code">{o.code}</p>
              <h2 className="plain">{o.name}</h2>
              <p className="muted">{o.triggered_by}</p>
              <dl className="offer-facts">
                <div><dt>Duration</dt><dd>{weeks(o.duration_weeks)}</dd></div>
                <div><dt>Storefront</dt><dd>{TRACK[o.delivery_track] ?? o.delivery_track}</dd></div>
                {view.pricing ? <div><dt>Price band</dt><dd>{band(o.price_band, currency)}</dd></div> : null}
              </dl>
              <h3>In scope</h3>
              <ul>{o.base_scope.map((line) => <li key={line}>{line}</li>)}</ul>
            </article>
          ))}
        </div>
        {view.pricing ? (
          <p className="callout">
            <strong>Internal pricing.</strong> Price bands and additions are Merkle’s commercial position and
            never appear in a client document. The engine keeps them out of everything it generates.
          </p>
        ) : (
          <p className="muted">Price bands are shown to engagement leads only. Durations are the high-level estimate everyone can use.</p>
        )}
      </section>

      <section>
        <h2>What decides the offer</h2>
        <p className="muted">The engine applies these in order and stops at the first that holds. Nobody picks the offer by hand.</p>
        <ol className="steps">
          {view.classification.map((c) => (
            <li key={c.order}>
              <h3>{c.when.replace(/_/g, ' ')} → {c.offer}</h3>
              <p>{c.with_modifier ? 'Offer S, plus the modifier of the one gate that fired.' : `Offer ${c.offer}.`}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2>Scope gates — and what each one adds</h2>
        <p className="muted">Each gate is a requirement that grows the build. One gate keeps an engagement in S with a modifier; two or more make it an M.</p>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Gate</th><th>Fires when</th><th>Adds</th><th>Effort</th>{view.pricing ? <th>Price add</th> : null}</tr></thead>
            <tbody>
              {view.gates.map((g) => (
                <tr key={g.id}>
                  <td><strong>{g.label}</strong>{g.modifier ? <div className="muted">{g.modifier}</div> : null}</td>
                  <td>{g.condition}</td>
                  <td>{g.adds ?? '—'}</td>
                  <td>{weeks(g.effort_weeks)}</td>
                  {view.pricing ? <td>{band(g.price_add, currency) ?? '—'}</td> : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3>What makes it an L</h3>
        <p className="muted">Any one of these, whatever the gates say.</p>
        <ul>{view.l_triggers.map((t) => <li key={t.id}><strong>{t.label}</strong> — {t.condition}</li>)}</ul>
      </section>

      <section className="band">
        <div className="band-inner">
          <p className="eyebrow">How each offer meets Shopify</p>
          <h2 className="plain">The same ladder, a different reach</h2>
          <p>
            Every requirement is resolved at the cheapest level that works — native Shopify, then an App Store
            app, then theme work, then custom — and the level is justified in writing. What changes between the
            offers is how far up that ladder the engagement is expected to go.
          </p>
          <div className="table-scroll">
            <table>
              <thead><tr><th /><th>Storefront</th><th>Shopify plan</th><th>How it is built</th><th>Store topology</th></tr></thead>
              <tbody>
                {view.offers.map((o) => (
                  <tr key={o.code}>
                    <td><strong>{o.code}</strong><div className="muted">{o.name}</div></td>
                    <td>{o.approach.storefront}</td>
                    <td>{o.approach.plan}</td>
                    <td>{o.approach.build}</td>
                    <td>{o.approach.topology}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3>What pushes the Shopify plan up</h3>
          <p className="muted">The rules the engine applies, each with the Shopify page that sets the limit. The offer never assumes Plus; these are what earn it.</p>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Requirement</th><th>Needs at least</th><th>Source</th></tr></thead>
              <tbody>
                {view.plan_gates.map((g) => (
                  <tr key={g.feature}>
                    <td>{g.feature}</td>
                    <td><span className="badge">{g.plan}</span></td>
                    <td><a href={g.docs} target="_blank" rel="noreferrer">Shopify help</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <h2>When an engagement goes beyond the offers</h2>
        <p>
          Some answers take an engagement past S, M and L. That is not a refusal: it is a decision about how
          Merkle proceeds, recorded in Q10.5.5 before the closing document is written.
        </p>
        <div className="grid-2">
          {view.routes.map((r) => (
            <article key={r.id} className="card">
              <h3>{r.label}</h3>
              {r.proposal ? <p><strong>{r.proposal}</strong></p> : null}
              <p className="muted">{r.description}</p>
            </article>
          ))}
        </div>

        <h3>What takes it beyond ({view.exits.beyond_offers.length})</h3>
        <ExitTable rows={view.exits.beyond_offers} pricing={view.pricing} />

        <h3>What needs a named owner before the build starts ({view.exits.flags.length})</h3>
        <p className="muted">Flags do not stop the engagement. Each one needs an owner and a resolution before build.</p>
        <ExitTable rows={view.exits.flags} pricing={view.pricing} />

        {view.exits.commercial.length ? (
          <>
            <h3>Commercial adjustments ({view.exits.commercial.length})</h3>
            <p className="muted">Recorded in the proposal; they do not change the route.</p>
            <ExitTable rows={view.exits.commercial} pricing={view.pricing} />
          </>
        ) : null}

        <p className="muted">
          Offering version {view.version}. Questions about a specific engagement belong in its{' '}
          <Link to="/">summary</Link>, where the engine shows which of these fired and why.
        </p>
      </section>
    </main>
  );
}

function ExitTable({ rows, pricing }) {
  return (
    <div className="table-scroll">
      <table>
        <thead><tr><th>Rule</th><th>When</th><th>What happens</th>{pricing ? <th>Internal note</th> : null}</tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.condition}</td>
              <td>{r.destination}</td>
              {pricing ? <td className="muted">{r.internal_note ?? ''}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
