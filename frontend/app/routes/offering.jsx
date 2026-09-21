import { Link } from 'react-router';

import { requireUser } from '../auth.server.js';
import { offeringView } from '../../../discovery/service/offering-view.js';
import { scopeCatalogue, scopeTotals } from '../../../discovery/service/scope-view.js';
import { pageTitle } from '../brand.js';
import { band, TRACK, weeks } from '../offering.js';
import { OfferScale, PackTable } from '../components/diagram.jsx';

export const meta = () => [{ title: pageTitle('The offering') }];

/**
 * Signed-in only. Price bands travel only to owners: while sign-in is open to any
 * GitHub account, "signed in" does not mean "Merkle", and the offering view strips
 * Merkle pricing on the server for everyone else.
 */
export async function loader({ request }) {
  const user = await requireUser(request);
  const catalogue = scopeCatalogue();
  return { view: offeringView({ pricing: user.role === 'owner' }), catalogue, totals: scopeTotals(catalogue) };
}

const COUNT = { 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven' };

/**
 * The three gates whose ceiling is a rule rather than a budget.
 *
 * Most of what an engagement can hold is limited by the scope-gate weeks the
 * band carries, which is a number per offer. These three are limited by an exit
 * rule instead: above it the engagement leaves S, M and L altogether, whatever
 * the band could have absorbed. The rule's own wording is read from the view, so
 * the ceiling on the page is the ceiling the engine enforces; if a rule is ever
 * retired the cell simply stops claiming one.
 */
const CEILING = { integration: '11.7', languages: '11.4', retail_pos: '11.22' };

/** The resolution ladder every requirement climbs, cheapest first. */
const LADDER = [
  ['Native Shopify', 'A feature the platform already has, configured'],
  ['App Store app', 'Only where native stops — and the reason is written down'],
  ['Theme work', 'Sections and blocks, still editable by the merchant'],
  ['Custom', 'Functions, metaobjects, a custom app — when nothing cheaper works'],
];

export default function Offering({ loaderData }) {
  const { view, catalogue, totals } = loaderData;
  const currency = view.offers[0]?.currency;
  const plans = ['Grow', 'Advanced', 'Shopify Plus'].map((plan) => ({ plan, features: view.plan_gates.filter((g) => g.plan === plan) }));
  // The exit rule behind each ceiling, by its own id, so the table quotes the
  // engine's wording rather than a number retyped here.
  /* Two different ceilings, and the page said "leaves the offers" for both.
     More than three integrations or six languages is a STOP — the engagement is
     not one of these offers any more. More than five retail stores is a WARN:
     it stays in the offer and gets an owner. Printing the harder sentence over
     the softer rule is the kind of thing a consultant repeats in a room. */
  const rules = new Map([
    ...view.exits.beyond_offers.map((r) => [r.id, { ...r, leaves: true }]),
    ...view.exits.flags.map((r) => [r.id, { ...r, leaves: false }]),
    ...view.exits.commercial.map((r) => [r.id, { ...r, leaves: false }]),
  ]);
  const ceilings = Object.fromEntries(
    Object.entries(CEILING).map(([gate, id]) => [gate, rules.get(id)]).filter(([, rule]) => rule?.label),
  );

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

      {/* 1 — the definition, before any comparison.
          The page opened on a chart of durations: a reader arriving to find out
          what an M is had to infer it from a bar. The doors carry the
          definition — who each offer is for, in the client's own situation —
          so they come first and the chart follows them. */}
      <section>
        <h2>What the three offers are</h2>
        <p className="lede">
          One sentence each, and then the page compares them. Each offer has its own page: what it covers,
          how it meets Shopify, and what moves an engagement out of it.
        </p>
        <ol className="segments">
          {view.offers.map((o) => (
            <li key={o.code}>
              <Link to={`/offering/${o.code.toLowerCase()}`}>
                <span className="seg-code">{o.code}</span>
                <span className="seg-name">{o.name}</span>
                {/* Who is sitting across the table, not how many gates fired.
                    "Two or more scope gates" is true and tells a consultant
                    nothing about which brand this is. */}
                <span className="seg-when">{o.for_whom ?? o.triggered_by}</span>
                <span className="seg-meta">
                  {weeks(o.duration_weeks)} weeks · {TRACK[o.delivery_track] ?? o.delivery_track}
                  {view.pricing && o.price_band ? ` · ${band(o.price_band, currency)}` : ''}
                </span>
              </Link>
            </li>
          ))}
          {/* Not a fourth offer. Headless is inside the offers — Hydrogen with
              content in Shopify is a Shopify build. Arc is where a second system
              arrives: content in an external CMS, or a front end Shopify does not
              build. The card names it and gives no number, which is the point. */}
          <li className="beyond">
            <Link to="/offering/arc">
              <span className="seg-code">—</span>
              <span className="seg-name">Merkle Arc</span>
              <span className="seg-when">Content or a front end that lives outside Shopify, or requirements that go past S, M and L</span>
              <span className="seg-meta">A separate engagement · not quoted or estimated here · {view.exits.beyond_offers.length} rules</span>
            </Link>
          </li>
        </ol>
        {view.pricing ? (
          <p className="callout"><strong>Internal pricing.</strong> Price bands are Merkle&rsquo;s commercial position and never appear in a client document — the engine keeps them out of everything it generates.</p>
        ) : (
          <p className="muted">Price bands are shown to engagement leads. The durations above are the high-level estimate.</p>
        )}
      </section>

      {/* 2 — the comparison, and the one honest shape for it.
          The three packs hold the same catalogue of work. They differ in the
          scope-gate weeks the band already carries, and every dimension draws
          from that one budget — there is no per-market or per-integration
          allowance to print. So the rows that differ get three columns and the
          rest span them: three identical columns would invent a difference the
          engine does not make, and a consultant would quote from it. */}
      <section>
        <h2>What each pack gets</h2>
        <p className="lede">
          Every pack builds from the same catalogue. What separates them is one number — the scope-gate
          weeks the band already carries — and everything below draws from it. In {view.offers[0]?.code} a
          gate is added on top of the price; in the larger packs it comes out of the band until the band
          is used up.
        </p>
        <PackTable
          offers={view.offers}
          gates={view.gates}
          ceilings={ceilings}
          pricing={view.pricing}
          currency={currency}
          weeks={weeks}
          band={band}
        />
      </section>

      <section>
        <h2>The three offers, on one scale</h2>
        <OfferScale offers={view.offers} pricing={view.pricing} currency={currency} />
      </section>

      {/* 2 — the rule, drawn. "Stops at the first yes" is the whole of it. */}
      <section className="band dark">
        <div className="band-inner">
          <p className="eyebrow">How the offer is decided</p>
          {/* Counted, not typed. It read "four" while the engine asked five for
              as long as the fifth rule existed, which is the exact failure this
              whole page is meant to prevent. */}
          <h2 className="plain">{COUNT[view.classification.length] ?? view.classification.length} questions, in order. It stops at the first yes.</h2>
          <ol className="decide">
            {view.classification.map((c) => (
              <li key={c.order}>
                <span className="decide-q">{c.plain}</span>
                <span className="decide-arrow" aria-hidden="true">&rarr;</span>
                <span className="decide-a">{c.offer}</span>
              </li>
            ))}
          </ol>
          {/* What the gates do once the offer is decided. The pages quoted each
              gate's cost and never said what the band already covered, so a
              consultant could not tell whether "+5 to 7 weeks" was inside the
              number or on top of it. */}
          <p className="decide-note">
            Then the gates. Each band already holds some of them — {view.offers.filter((o) => o.gate_capacity_weeks?.max).map((o) => `${o.code} holds ${weeks(o.gate_capacity_weeks)} weeks`).join(', ')} —
            and inside that they cost nothing more. Past it, each one is added to the weeks and to the band, which
            is how an Ecommerce Growth with a Magento estate and six markets stops being quoted the same as one
            with a single market and no migration.
          </p>
        </div>
      </section>

      {/* 3 — what is actually built. Sold at a fixed price, argued at story
          level, so the map says what the sixteen epics hold before anyone opens
          an offer. */}
      <section>
        <h2>What the offers build</h2>
        <p className="lede">
          Every offer delivers the same {totals.epics} epics; what changes is how much of each one the answers
          call for. {totals.always} stories are in the price whatever the client answers, {totals.conditional} more
          arrive when their answers call for them, and {totals.gated} sit behind a scope gate that has its own
          weeks. Each offer&rsquo;s page has the list, story by story.
        </p>
        <div className="table-scroll" role="region" tabIndex={0} aria-label="Epics and what each holds, scrollable table">
          <table className="compare epics">
            <thead>
              <tr>
                <th scope="col">Epic</th>
                <th scope="col">Always</th>
                <th scope="col">On the answers</th>
                <th scope="col">Behind a gate</th>
                <th scope="col">Which gates</th>
              </tr>
            </thead>
            <tbody>
              {catalogue.map((e) => (
                <tr key={e.id}>
                  <th scope="row">{e.name}</th>
                  <td data-label="Always">{e.always.length}</td>
                  <td data-label="On the answers">{e.conditional.length}</td>
                  <td data-label="Behind a gate">{e.gated.reduce((n, g) => n + g.stories.length, 0)}</td>
                  <td data-label="Which gates">{e.gated.length ? e.gated.map((g) => g.label).join(', ') : <span className="muted">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
          {/* Measured at 1440 before it was named: 3,440px of table inside a
              1,216px container, so "How it is built" and "Stores" sat off-screen
              behind a scrollbar nobody finds. Four columns of real sentences
              have no natural width; the class is what lets the stylesheet give
              them one. */}
          <div className="table-scroll" role="region" tabIndex={0} aria-label="Offer comparison, scrollable table">
            <table className="compare offer-approach">
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
