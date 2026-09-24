import { Link } from 'react-router';

import { requireUser } from '../auth.server.js';
import { offeringView } from '../../../ai/shared/offering-view.js';
import { scopeCatalogue, scopeTotals } from '../../../ai/shared/scope-view.js';
import { lowerFirst } from '../../../ai/engine/text.js';
import { pageTitle } from '../brand.js';
import { SEGMENTS, TRACK, band, segmentOf, weeks } from '../offering.js';
import { Boundaries, Channels, OfferScale, ScopeLimits, ScopeTable } from '../components/diagram.jsx';
import { OfferingNav } from '../components/offering-nav.jsx';

/**
 * The three questions a consultant arrives with, over the sections that answer
 * them.
 *
 * Measured before they existed: ten `h2` on an L page, every one at 16px, 700,
 * uppercase, separated by nine identical 130px gaps. Ten headings of equal
 * weight are a list, not a hierarchy — nowhere for the eye to land, and no way
 * to skip three sections at once.
 */
const PARTS = {
  'for-whom': ['01', 'Who it is for', 'The brand across the table, and how they sell'],
  scope: ['02', 'What it covers', 'What it holds, and what it adds over the pack below'],
  stories: ['03', 'What it builds', 'Every story behind the price'],
};

/* Arc gets the same furniture and two parts rather than three. There is no
   "What it builds" here, and that gap is the honest one: this engine does not
   know what Arc builds and must not appear to. */
const ARC_PARTS = {
  what: ['01', 'What it covers', 'What Arc is, and what is not Arc'],
  stops: ['02', 'What moves it', 'What takes an engagement out of the offers, and what carries across'],
};

/** The ribbon under the page head. Five screens of page, opened before a call. */
/* Built per page rather than held as one list: only M and L have a pack below
   them, so only they carry the step-up section the ribbon would otherwise link
   to an anchor that is not there. */
const jumpFor = (previous) => [
  ['for-whom', 'Who it is for'],
  ['scope', 'In scope'],
  ...(previous ? [['extra', `Over ${previous.code}`]] : []),
  ['boundaries', 'Not in it'],
  ['after-launch', 'After launch'],
  ['stories', 'Every story'],
  ['scale', 'Where it sits'],
];

const ARC_JUMP = [
  ['what', 'What Arc is'],
  ['not', 'What is not Arc'],
  ['stops', 'What takes it here'],
  ['route', 'After a stop'],
  ['handover', 'What carries across'],
];

/** The part marker, where a section opens one. */
function Part({ id, parts = PARTS }) {
  const part = parts[id];
  if (!part) return null;
  const [n, name, what] = part;
  return (
    <p className="part">
      <span className="part-n">Part {n}</span>
      <span>{name}</span>
      <span className="part-what">{what}</span>
    </p>
  );
}

/**
 * One offer, on its own page.
 *
 * Everything about all four sat on a single page: three offers, seven gates,
 * three L triggers, twenty-three exit rules and two routes, 1,200 words over six
 * screens. A consultant opens this page with one question — is this engagement
 * an M, and what would move it — and had to assemble the answer from five
 * sections that each described all of them at once.
 *
 * So each segment answers its own four questions, in the order they are asked:
 * what is it, what puts an engagement here, how it meets Shopify, and what
 * moves it somewhere else. The page after it is the next offer up, because that
 * is the direction an engagement travels.
 */
export const meta = ({ data }) => [{
  title: pageTitle(data ? `${data.segment.code} · ${data.segment.name}` : 'The offering'),
}];

export async function loader({ request, params }) {
  const user = await requireUser(request);
  const view = offeringView({ pricing: Boolean(user) });   // see offering.jsx: bands are for every consultant
  const segment = segmentOf(view, params.segment);
  if (!segment) throw new Response('Not found', { status: 404, statusText: 'No such offer' });
  // The scope catalogue is the same backlog for every offer — what differs is
  // which gates are inside the band. Arc has no backlog, because nothing here
  // builds it.
  const catalogue = segment.slug === 'arc' ? null : scopeCatalogue();
  return { view, segment, catalogue, totals: catalogue ? scopeTotals(catalogue) : null };
}

/** The offer this one grows into, and the one it grew from. */
function Neighbours({ segment }) {
  const i = SEGMENTS.indexOf(segment.slug);
  const prev = SEGMENTS[i - 1];
  const next = SEGMENTS[i + 1];
  return (
    <nav className="seg-next" aria-label="The other offers">
      {prev ? <Link to={`/offering/${prev}`} className="seg-prev">← {prev === 'arc' ? 'Merkle Arc' : prev.toUpperCase()}</Link> : <span />}
      {next ? <Link to={`/offering/${next}`}>{next === 'arc' ? 'Merkle Arc — where the storefront stops being a theme' : `${next.toUpperCase()} — the next offer up`} →</Link> : <span />}
    </nav>
  );
}

export default function OfferingSegment({ loaderData }) {
  const { view, segment, catalogue, totals } = loaderData;
  const currency = view.offers[0]?.currency;

  // Arc is not an offer, so this page does not pretend it is one.
  if (segment.slug === 'arc') return <Arc view={view} segment={segment} />;

  const { offer } = segment;
  /* Every offer's gates, L included.
     L used to show none of them, which was defensible while its band absorbed
     whatever they came to: the gates changed nothing about what was quoted. They
     do now — past the weeks the band already holds, each one is added to it — so
     an L page listing only its triggers says the opposite of what the engine
     does. */
  /* The offer one rung down, where there is one. M and L are steps up from
     something, and the rows where they hold more than the pack below are what
     the client is paying the step for — a question the page could not answer
     except by opening two tabs. */
  const i = view.offers.findIndex((o) => o.code === offer.code);
  const previous = i > 0 ? view.offers[i - 1] : null;

  return (
    <main id="main" className="story offering">
      <header className="page-head">
        <OfferingNav packs={view.offers} />
        <p className="eyebrow">Offer {offer.code} · {TRACK[offer.delivery_track] ?? offer.delivery_track}</p>
        <h1>{offer.name}</h1>
        <p className="answer-line">{offer.for_whom ?? `${offer.triggered_by}.`}</p>
        <p className="lede">{offer.triggered_by}.</p>
        {/* Three numbers that each answer something. The middle one used to be
            the length of the scope list, which reads "1 things" on the two
            offers whose scope is written as one line. */}
        <ul className="stats">
          <li><strong>{weeks(offer.duration_weeks)}</strong><span>weeks, end to end</span></li>
          {/* The team a build week pays for, so the band reads as people and
              weeks rather than as a package price. Acronyms keep their case. */}
          <li><strong>≈{offer.team.people} people</strong><span>full time for those weeks, offshore: {offer.team.roles.map(lowerFirst).join(', ')}</span></li>
          {view.pricing && offer.price_band
            ? <li><strong>{band(offer.price_band, currency)}</strong><span>internal price band — never in a client document</span></li>
            : <li><strong>{TRACK[offer.delivery_track] ?? offer.delivery_track}</strong><span>how the storefront is built</span></li>}
        </ul>
        <p className="callout estimate-note">{view.estimate} <Link to="/offering/estimation">How we estimate →</Link></p>
        <nav className="jump" aria-label="On this page">
          {jumpFor(previous).map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
        </nav>
      </header>

      {/* Who is across the table, before a word about what gets built. It was
          two things in two places — a line in the page head that scrolls away,
          and a "Who it sells to" section nine screens down — and they answer the
          same question. One section, first. */}
      <section id="for-whom" className="part-start">
        <Part id="for-whom" />
        <h2>Who this offer is for</h2>
        {offer.for_whom ? <p className="answer-line">{offer.for_whom}</p> : null}
        <p className="lede">
          Wholesale is not this offer plus an extra. Selling both ways is — that is the one case the
          B2B gate is for.
        </p>
        <Channels channels={offer.channels} />
      </section>

      <section id="scope" className="part-start">
        <Part id="scope" />
        <h2>What is in scope</h2>
        {/* The first line is the offer's claim — what makes "Foundation" a
            foundation and "Flagship" a flagship — and it is not a scope item. Ticked
            alongside the rest it read as one, which is how an offer ends up with
            a name nobody can connect to what it delivers. */}
        <p className="answer-line">{offer.base_scope[0]}.</p>
        <ul className="ticks big">{offer.base_scope.slice(1).map((line) => <li key={line}>{line}</li>)}</ul>

        {/* And then the same scope with numbers on it. The list above is the
            claim; this is the ceiling. "Up to how many markets" had no answer
            anywhere on the page that sells markets — a consultant had to go back
            to the index, read across three columns and pick the one they were
            already on. */}
        <h3 className="sub">What that holds, and up to what limit</h3>
        <p className="muted small">
          Shopify&rsquo;s own documented ceiling for each of these subjects is on{' '}
          <Link to="/offering">the comparison table</Link> — it is a fact about the platform, not about
          this offer.
        </p>
        <ScopeLimits rows={view.closed_scope} code={offer.code} />
        <p className="addons-pointer">
          Past these limits everything is an add-on, never assumed in: what each one adds to {offer.name}, in
          weeks{view.pricing ? ' and francs' : ''}, is on <Link to="/offering/add-ons">the add-on services page</Link>.
        </p>
      </section>

      {/* The step up, as its own answer rather than as marked rows inside a
          table of twenty-two. "What do I get over the one below" is the
          question a client asks when they see two prices, and it deserves a
          heading of its own — nothing else on the page answers it. */}
      {previous ? (
        <section id="extra">
          <h2>What you get over {previous.name}</h2>
          <p className="lede">
            Only the subjects where the two differ: what this offer holds more of, and — marked — what it
            leaves to an add-on that {previous.name} carries. Everything else is the same in both, so it is
            not what the step up is buying.
          </p>
          <ScopeLimits rows={view.closed_scope} code={offer.code} previous={previous} gainsOnly />
        </section>
      ) : null}

      <section id="boundaries">
        <h2>Not in this offer, and what we assume</h2>
        <p className="lede">
          Everything below is deliberate. An offer that only lists what it includes is the one
          argued about in week six.
        </p>
        <Boundaries notIncluded={offer.not_included} clientProvides={offer.client_provides} assumes={offer.assumes} />
      </section>

      {/* The next step, named. The retainer was "mentioned but kept open" and
          so mentioned nowhere a consultant could point at; its price stays
          open, its existence does not. */}
      <section id="after-launch">
        <h2>{view.after_launch.title}</h2>
        <p className="lede">{view.after_launch.line}</p>
      </section>

      <section id="stories">
        <h2>The backlog, story by story</h2>
        <p className="lede">
          {totals.epics} epics and all {totals.stories} stories in them, read off the backlog this engine generates rather than
          described again here. Each story sits in one of three places, and the difference is what the client
          is buying: in the price whatever they answer, in the price once their answers call for it, or behind
          a scope gate with its own weeks. Nothing is implied, because a fixed price cannot be argued from an
          implication.
        </p>
        {/* The question this page kept failing to answer: when a story says a
            gate adds weeks, is that on top of the offer or already inside it?
            The answer differs per offer and it used to be a grey line under the
            table, which is where a reader looks last. */}
        <p className="gate-rule on-top">
          Every scope gate adds its own weeks and price: the estimate is the Foundation build plus each gate the
          answers open. What this offer includes is inside its {weeks(offer.duration_weeks)} weeks; anything past it
          is an add-on, with its weeks and its price on top.
        </p>
        <ScopeTable catalogue={catalogue} totals={totals} />
      </section>

      <section id="scale">
        <h2>Where it sits</h2>
        <OfferScale offers={view.offers} pricing={view.pricing} currency={currency} here={offer.code} />
      </section>

      <section>
        <Neighbours segment={segment} />
      </section>
    </main>
  );
}

/**
 * Not an offer, and deliberately not priced.
 *
 * Arc is Merkle's enterprise platform for unifying brand design, content and
 * commerce in one architecture. Headless is not the line — Hydrogen with content
 * in Shopify metaobjects is a Shopify build, and Ecommerce Flagship prices it. The
 * line is a second system: content in an external CMS or PIM, or a front end
 * Shopify does not build. The honest thing for this page to do is name it and
 * stop — no band, no weeks, no estimate.
 */
function Arc({ view, segment }) {
  /* How many of the rules that leave the offers hand the engagement to Arc
     rather than to a Larger Engagement or a review. Counted from the rules
     themselves, because a number written down here is a number that goes
     stale the first time a rule is added. */
  const toArc = view.exits.beyond_offers.filter((r) => /Merkle Arc/.test(r.destination ?? ''));

  return (
    <main id="main" className="story offering">
      <header className="page-head">
        <OfferingNav packs={view.offers} />
        <p className="eyebrow">Beyond S, M and L</p>
        <h1>Merkle Arc</h1>
        <p className="answer-line">Unify brand design, content and commerce in one architecture.</p>
        <p className="lede">
          The offers stop where a second system arrives — editorial content in an external CMS or PIM, or a
          front end Shopify does not build. Arc is the enterprise platform Merkle unifies those on, and a
          separate engagement scoped by the Arc practice.
        </p>
        {/* The same three-stat head the offers carry, holding the three facts
            Arc actually has. The middle one is a word rather than a number
            because there is no band and no duration to print, and a dash where
            a figure belongs reads as a figure someone forgot. */}
        <ul className="stats">
          <li><strong>{view.exits.beyond_offers.length}</strong><span>rules take an engagement out of the offers</span></li>
          <li><strong>{toArc.length}</strong><span>of them hand it to Arc rather than to a Larger Engagement</span></li>
          <li><strong className="stat-words">Not quoted</strong><span>no band, no weeks, no estimate — the Arc practice scopes it</span></li>
        </ul>
        <nav className="jump" aria-label="On this page">
          {ARC_JUMP.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
        </nav>
      </header>

      <section id="what" className="part-start">
        <Part id="what" parts={ARC_PARTS} />
        <h2>What Arc is</h2>
        <p className="answer-line">Merkle&rsquo;s enterprise platform for unifying brand design, content and commerce in one architecture.</p>
        <ul className="ticks big">
          <li>A tokenised design system</li>
          <li>A multi-channel component library</li>
          <li>GraphQL middleware</li>
          <li>Its own console</li>
          <li>Composable and headless, without the vendor lock-in</li>
        </ul>
        <p className="callout">
          <strong>Nothing here quotes it, and nothing here estimates it.</strong> This engine prices Shopify
          builds. What goes across to Arc is the discovery — every answer, every requirement, and the rule
          that named the reason.
        </p>
      </section>

      {/* The boundary section the offers carry, pointing the other way. On an
          offer page it lists what the offer does not include; here the useful
          boundary is what people mistake for Arc and is in fact an offer, which
          is the confusion that costs a deal. */}
      <section id="not">
        <h2>What is not Arc</h2>
        <p className="lede">
          Headless is not the line. Each of these looks like it leaves Shopify and does not, so each one is
          priced by this engine like any other build.
        </p>
        <ul className="ticks big ticks-no">
          <li>Hydrogen with editorial content in Shopify metaobjects — that is the <Link to="/offering/add-ons">Hydrogen add-on</Link>, in any pack</li>
          <li>Two brands that share one design system — a store per brand, an add-on on <Link to="/offering/m">Ecommerce Scale</Link> and up to three in Ecommerce Flagship, and a further storefront design where a brand’s layout differs</li>
          <li>Blocks and fields inside the checkout steps — Shopify Plus permits them, and Ecommerce Flagship builds them</li>
          <li>Several markets, languages or stores, up to the offers’ limits — each one priced inside the offers</li>
        </ul>
      </section>

      <section id="stops" className="part-start">
        <Part id="stops" parts={ARC_PARTS} />
        <h2>What takes an engagement beyond the offers <span className="chip">{view.exits.beyond_offers.length}</span></h2>
        <p className="lede">
          Each of these is a rule in the engine. It fires on the answers, not on an opinion, and only{' '}
          {toArc.length} of them end at Arc — the rest go to a Larger Engagement or to a review.
        </p>
        <ol className="claims">
          {view.exits.beyond_offers.map((r) => (
            <li key={r.id}>
              <details>
                <summary>
                  <span className="claim">{r.label ?? r.condition}</span>
                  <span className="claim-line">Rule {r.id} → {r.destination}</span>
                </summary>
                {r.label ? <p><strong>The exact rule.</strong> {r.condition}</p> : null}
                {view.pricing && r.internal_note ? <p className="rule-note">{r.internal_note}</p> : null}
              </details>
            </li>
          ))}
        </ol>
      </section>

      <section id="route">
        <h2>What the consultant records after a stop</h2>
        <p className="lede">
          Recorded in question 10.5.5, before the closing document is written. Two routes, and the engine produces
          a different thing for each.
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
      </section>

      {/* These two lists used to sit in a section with no heading, under the
          page's last rule, which left them reading as a footer rather than as
          the two things a consultant still owes someone after a stop. */}
      <section id="handover">
        <h2>What carries across</h2>
        <p className="lede">
          Neither list changes the route. Both travel with the discovery to whoever picks the engagement up.
        </p>
        <details className="rules-more">
          <summary>What needs a named owner before the build starts <span className="chip">{view.exits.flags.length}</span></summary>
          <p className="muted">Flags do not change the route. Each needs an owner and a resolution before build.</p>
          <ul className="rules">
            {view.exits.flags.map((r) => (
              <li key={r.id}>
                <span className="rule-id">{r.id}</span>
                <div>
                  <p className="rule-when">{r.label ?? r.condition}</p>
                  <p className="muted">→ {r.destination}</p>
                </div>
              </li>
            ))}
          </ul>
        </details>
        {view.exits.commercial.length ? (
          <details className="rules-more">
            <summary>Commercial adjustments <span className="chip">{view.exits.commercial.length}</span></summary>
            <p className="muted">Recorded in the proposal; they do not change the route.</p>
            <ul className="rules">
              {view.exits.commercial.map((r) => (
                <li key={r.id}>
                  <span className="rule-id">{r.id}</span>
                  <div>
                    <p className="rule-when">{r.label ?? r.condition}</p>
                    <p className="muted">→ {r.destination}</p>
                    {view.pricing && r.internal_note ? <p className="rule-note">{r.internal_note}</p> : null}
                  </div>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
        <Neighbours segment={segment} />
      </section>
    </main>
  );
}
