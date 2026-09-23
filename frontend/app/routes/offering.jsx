import { Link } from 'react-router';

import { requireUser } from '../auth.server.js';
import { offeringView } from '../../../ai/shared/offering-view.js';
import { pageTitle } from '../brand.js';
import { band, TRACK, weeks } from '../offering.js';
import { AddonList, PackTable } from '../components/diagram.jsx';

export const meta = () => [{ title: pageTitle('The offering') }];

/**
 * Signed-in only, and every signed-in consultant reads the bands (owner decision,
 * 2026-09-23). These are the offering's standard bands for S, M and L — the thing
 * a consultant needs in the room — and they are already public in this repository's
 * `ai/schema/offering.json`.
 *
 * READ THIS BEFORE RELYING ON IT. The gate this replaced existed for a reason that
 * has not gone away: sign-in is open to every GitHub account unless
 * SIGN_IN_MODE=allowlist is set, so "signed in" does not yet mean "Merkle". While
 * it stays open, anyone with a GitHub account who finds the URL reads these bands.
 * Closing that is one environment variable — SIGN_IN_MODE=allowlist with
 * CONSULTANT_GITHUB_LOGINS — and it is what makes this decision safe rather than
 * merely deliberate.
 *
 * A named client's own quote is a separate gate and is still owner-only
 * (`ai/shared/index.js`), as is everything the deck generates.
 */
export async function loader({ request }) {
  const user = await requireUser(request);
  // `requireUser` has already thrown for anyone not signed in.
  return { view: offeringView({ pricing: Boolean(user) }) };
}

/** The resolution ladder every requirement climbs, cheapest first. */
const LADDER = [
  ['Native Shopify', 'A feature the platform already has, configured'],
  ['App Store app', 'Only where native stops — and the reason is written down'],
  ['Theme work', 'Sections and blocks, still editable by the merchant'],
  ['Custom', 'Functions, metaobjects, a custom app — when nothing cheaper works'],
];


/**
 * Where one offer's ceiling meets the next one's floor.
 *
 * The bands are built to overlap and the page never said it, so the most useful
 * sentence a consultant has — "at the top of this one you are paying what the
 * next one starts at" — had to be assembled from two numbers in different rows.
 * Computed, never typed: a claim about a price that quietly stops being true is
 * worse than no claim.
 *
 * @param {{ offers: object[], currency?: string }} props
 */
function Overlaps({ offers, currency }) {
  const k = (n) => `${Math.round(n / 1000)}k`;
  const pairs = [];
  for (let i = 0; i < offers.length - 1; i++) {
    const below = offers[i];
    const above = offers[i + 1];
    if (!below.price_band || !above.price_band) continue;
    const gap = above.price_band.min - below.price_band.max;
    pairs.push({ below, above, gap });
  }
  if (!pairs.length) return null;

  return (
    <ul className="overlaps">
      {pairs.map(({ below, above, gap }) => (
        <li key={below.code}>
          <strong>{below.code} → {above.code}</strong>
          {/* No articles: the offers are named Ecommerce Foundation and
              Ecommerce Scale, so "a"/"an" has to be chosen per name and the
              first version printed "a Ecommerce Foundation". The names carry
              themselves. */}
          {gap <= 0 ? (
            <span>
              {below.name} at its ceiling costs {currency} {k(below.price_band.max)} —{' '}
              {gap === 0
                ? `exactly where ${above.name} starts`
                : `${currency} ${k(-gap)} above where ${above.name} starts`}. The step up is the cheapest it will
              ever be at that point in the conversation.
            </span>
          ) : (
            <span>
              {currency} {k(gap)} separates the ceiling of {below.name} from the floor of {above.name}.
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
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
            <li key={o.code} className={o.most_common ? 'stat-common' : undefined}>
              <strong>{o.code}</strong>
              <span>
                {o.name} · {weeks(o.duration_weeks)} weeks{view.pricing && o.price_band ? ` · ${band(o.price_band, currency)}` : ''}
                {/* Three offers presented as equals leave the reader to pick,
                    and a reader with no signal picks the cheapest. Most
                    engagements land here; saying so is the difference between a
                    list and a recommendation. */}
                {o.most_common ? <b className="stat-flag">Most engagements land here</b> : null}
              </span>
            </li>
          ))}
          {/* Where the three stop. Not a fourth offer, and the strip must not
              read as four: no code, no weeks, no band. The engine reaches Arc
              only through STOP rules and never through a scope gate — a gate is
              the priced mechanism, and this engine does not price Arc. */}
          <li className="stat-beyond">
            <strong>&mdash;</strong>
            <span>
              Merkle Arc · beyond the three
              <b className="stat-note">Not quoted or estimated here</b>
            </span>
          </li>
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
        {/* Where the bands meet, said out loud.
            The ladder overlaps on purpose and nothing on this page said so, so
            the fact that moves a conversation was one a consultant had to spot
            by reading two numbers in different rows and subtracting. It is
            computed from the bands rather than written down, because a
            sentence about a price that stops being true is worse than none. */}
        {view.pricing ? <Overlaps offers={view.offers} currency={currency} /> : null}
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
          the most that pack holds. Three values means the packs differ and the choice matters; one value
          across the three columns means the subject is the same whichever pack you are in. A dash means
          the pack includes none of it — what can be bought on top is the section after this one.
        </p>
        <PackTable
          offers={view.offers}
          closedScope={view.closed_scope}
          pricing={view.pricing}
          currency={currency}
          track={(t) => TRACK[t] ?? t}
        />
        {/* The table's closing statement, and it was a seven-line grey slab
            ending at half the width of the table it belonged to. It is three
            separate promises, not one paragraph: what "closed" means, what a
            row does and does not name, and whose ceiling a limit is. Split,
            they take the width the table already uses and can be scanned;
            run together, they were read by nobody. */}
        <aside className="closed-note">
          <p className="closed-head"><strong>Closed.</strong> A pack holds exactly this.</p>
          <ol className="closed-points">
            <li>
              <h3>Past a ceiling is quoted on top</h3>
              <p>Never assumed in. A test builds an engagement that takes exactly these limits and checks the
              engine still calls it that pack.</p>
            </li>
            <li>
              <h3>A row states <em>how much</em>, not <em>which</em></h3>
              <p>Which tax registrations, shipping rates, payment methods and apps are named per requirement,
              then set up in the configuration workbook once the pack is agreed.</p>
            </li>
            <li>
              <h3>A limit is Shopify&rsquo;s, not Merkle&rsquo;s</h3>
              <p>Where a row carries one, that is the platform&rsquo;s own documented ceiling — and an app
              subscription is the client&rsquo;s cost, never a line in the pack.</p>
            </li>
          </ol>
        </aside>
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
