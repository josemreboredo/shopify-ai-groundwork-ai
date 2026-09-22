import { Link } from 'react-router';

import { requireUser } from '../auth.server.js';
import { offeringView } from '../../../ai/shared/offering-view.js';
import { pageTitle } from '../brand.js';
import { band, TRACK, weeks } from '../offering.js';
import { AddonList, PackTable } from '../components/diagram.jsx';

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

      {/* 1 — the definition, before any comparison.
          The page opened on a chart of durations: a reader arriving to find out
          what an M is had to infer it from a bar. The doors carry the
          definition — who each offer is for, in the client's own situation —
          so they come first and the comparison follows them. */}
      <section>
        <h2>What the three offers are</h2>
        <p className="lede">Who each one is for, in one line. Then the comparison.</p>
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

      {/* 2 — one comparison table, and nothing else shaped like one.
          The page carried three: a scale of durations, an approach table and
          this. A reader in front of a client could not tell them apart —
          "I don't understand any of them, keep only one" — so the scale went
          back to the offer pages, where there is one thing to find on it, and
          the approach moved into this table's column heads. What is left is
          the only question the section has to answer: what does this pack
          include, and up to what limit. */}
      <section>
        <h2>What each pack includes, and up to what limit</h2>
        <p className="lede">
          One row per subject the discovery asks about, one column per pack, and the number in the cell is
          the most that pack holds. A dash means the pack includes none of it — what can be bought on top
          is the section after this one, with its own scope and its own cost.
        </p>
        <PackTable
          offers={view.offers}
          closedScope={view.closed_scope}
          pricing={view.pricing}
          currency={currency}
          track={(t) => TRACK[t] ?? t}
        />
        <p className="callout">
          <strong>Closed.</strong> A pack holds exactly this — anything past a ceiling is quoted on top,
          never assumed in, and a test builds an engagement that takes exactly these limits and checks the
          engine still calls it that pack. A row states <em>how much</em> fits, not <em>which</em>: which tax
          registrations, which shipping rates, which payment methods and which apps are named per requirement
          and then set up in the configuration workbook once the pack is agreed. Where a row carries
          Shopify&rsquo;s limit, that is the platform&rsquo;s own documented ceiling, not Merkle&rsquo;s — and
          an app subscription is the client&rsquo;s cost, never a line in the pack.
        </p>
      </section>

      {/* 3 — the price list, drawn as a price list.
          B2B, Subscriptions and Retail/POS were rows in the comparison, which
          put three columns of "not in the base pack" in front of a reader and
          asked them to work out that it was for sale. Nothing that a pack does
          not include is in the table any more; it is all here, with what it
          covers and what it costs. */}
      {view.addons?.length ? (
        <section>
          <h2>Add-on services</h2>
          <p className="lede">
            Everything that can be bought on top of a pack: more of what a pack already holds once its
            ceiling is reached, and the capabilities no pack contains at all. Each is scoped and quoted on
            its own — the pack is never quietly upgraded to carry it.
          </p>
          <AddonList addons={view.addons} pricing={view.pricing} currency={currency} weeks={weeks} band={band} />
          {view.pricing ? null : (
            <p className="muted small">Weeks are the high-level estimate. Costs are shown to engagement leads.</p>
          )}
        </section>
      ) : null}

      {/* The one rule that is the same in every offer */}
      <section className="band">
        <div className="band-inner">
          <p className="eyebrow">How each offer meets Shopify</p>
          <h2 className="plain">Every requirement climbs the same ladder — the offers differ in how far up it goes</h2>
          <ol className="ladder">
            {LADDER.map(([title, line]) => (
              <li key={title}><strong>{title}</strong><span>{line}</span></li>
            ))}
          </ol>
          {/* The approach was a second comparison table here — five columns of
              full sentences per offer, which is a document, not a comparison,
              and it was the table the reader could least tell from the one
              above. Each offer's storefront, plan stance, build and topology
              are on its own page, in full, one click from the door at the top. */}
          <p className="ladder-note">
            How far up the ladder each pack goes — its storefront, its plan stance, what it is built from and
            how many stores it implies — is on that pack&rsquo;s own page:{' '}
            {view.offers.map((o, i) => (
              <span key={o.code}>
                {i > 0 ? ', ' : ''}
                <Link to={`/offering/${o.code.toLowerCase()}`}>{o.code} · {o.name}</Link>
              </span>
            ))}.
          </p>
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
