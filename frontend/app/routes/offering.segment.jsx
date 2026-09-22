import { Link } from 'react-router';

import { requireUser } from '../auth.server.js';
import { offeringView } from '../../../ai/shared/offering-view.js';
import { scopeCatalogue, scopeTotals } from '../../../ai/shared/scope-view.js';
import { pageTitle } from '../brand.js';
import { SEGMENTS, TRACK, band, segmentOf, weeks } from '../offering.js';
import { Boundaries, Channels, Lands, OfferScale, PhasePlan, ScopeTable, Storefront, Tracks } from '../components/diagram.jsx';

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
  scope: ['01', 'What it covers', 'The claim, and where it stops'],
  phases: ['02', 'What it builds', 'The weeks, the storefront and the backlog behind the price'],
  lands: ['03', 'What moves it', 'What puts an engagement here, and what takes it somewhere else'],
};

/** The ribbon under the page head. Five screens of page, opened before a call. */
const JUMP = [
  ['scope', 'In scope'],
  ['boundaries', 'Not in it'],
  ['phases', 'Phase by phase'],
  ['storefront', 'Storefront'],
  ['stories', 'Every story'],
  ['lands', 'Puts it here'],
  ['gates', 'Moves it up'],
  ['channels', 'Who it sells to'],
  ['scale', 'Where it sits'],
];

/** The part marker, where a section opens one. */
function Part({ id }) {
  const part = PARTS[id];
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
  const view = offeringView({ pricing: user.role === 'owner' });
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
  const moves = view.gates;
  const envelope = segment.offer.gate_capacity_weeks;

  return (
    <main id="main" className="story offering">
      <header className="page-head">
        <Link to="/offering" className="crumb">← The offering</Link>
        <p className="eyebrow">Offer {offer.code} · {TRACK[offer.delivery_track] ?? offer.delivery_track}</p>
        <h1>{offer.name}</h1>
        <p className="answer-line">{offer.for_whom ?? `${offer.triggered_by}.`}</p>
        <p className="lede">{offer.triggered_by}.</p>
        {/* Three numbers that each answer something. The middle one used to be
            the length of the scope list, which reads "1 things" on the two
            offers whose scope is written as one line. */}
        <ul className="stats">
          <li><strong>{weeks(offer.duration_weeks)}</strong><span>weeks, end to end</span></li>
          {/* A headline "0" reads as a missing number, not as a fact. On the
              offer that carries no gate work the fact is the rule itself: a
              gate here is added on top. */}
          <li>
            {offer.gate_capacity_weeks.max === 0
              ? <><strong className="stat-words">On top</strong><span>this band holds no scope gates — one is added to the weeks and the price</span></>
              : <><strong>{weeks(offer.gate_capacity_weeks)}</strong><span>weeks of scope gates this band already holds</span></>}
          </li>
          {view.pricing && offer.price_band
            ? <li><strong>{band(offer.price_band, currency)}</strong><span>internal price band — never in a client document</span></li>
            : <li><strong>{TRACK[offer.delivery_track] ?? offer.delivery_track}</strong><span>how the storefront is built</span></li>}
        </ul>
        <nav className="jump" aria-label="On this page">
          {JUMP.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
        </nav>
      </header>

      <section id="scope" className="part-start">
        <Part id="scope" />
        <h2>What is in scope</h2>
        {/* The first line is the offer's claim — what makes "Foundation" a
            foundation and "Growth" growth — and it is not a scope item. Ticked
            alongside the rest it read as one, which is how an offer ends up with
            a name nobody can connect to what it delivers. */}
        <p className="answer-line">{offer.base_scope[0]}.</p>
        <ul className="ticks big">{offer.base_scope.slice(1).map((line) => <li key={line}>{line}</li>)}</ul>
      </section>

      <section id="boundaries">
        <h2>Not in this offer, and what we assume</h2>
        <p className="lede">
          Everything below is deliberate. An offer that only lists what it includes is the one
          argued about in week six.
        </p>
        <Boundaries notIncluded={offer.not_included} clientProvides={offer.client_provides} assumes={offer.assumes} />
      </section>

      <section id="phases" className="part-start">
        <Part id="phases" />
        <h2>What you get, phase by phase</h2>
        <p className="lede">
          The phases in the order they run, each with the weeks it takes and the things that are
          handed over at the end of it. Set-up, template selection, app selection and template
          customisation are the four a client asks about by name, so they are named.
        </p>
        <PhasePlan phases={offer.phases} weeks={offer.duration_weeks} />
      </section>

      {/* The heading used to be "What gets built, counted" against "What it
          builds, epic by epic" two sections later — two headings answering the
          same question with different units. They are named by their unit now:
          weeks above, templates here, stories below. */}
      <section id="storefront">
        <h2>The storefront, counted</h2>
        <p className="lede">
          The templates this offer builds, and how many sections are built rather than configured. The phases
          describe the work; this is the number a fixed price is argued about.
        </p>
        <Storefront storefront={offer.storefront} />
        {/* How it is built used to be a section of its own that existed on L
            alone, so the three offers were three different pages. It is the same
            question on all of them — Growth answers it two ways and the other
            two answer it once — and it belongs beside what gets built. */}
        <h3>How it is built</h3>
        {offer.tracks ? (
          <p className="muted">
            Two ways, one band. The track is an answer rather than a property of the offer — a headless build
            spends the same weeks differently, it does not add weeks on top. Content stays in Shopify either way;
            content or a front end outside it is <Link to="/offering/arc">Merkle Arc</Link>.
          </p>
        ) : (
          <p className="muted">
            One way. A headless storefront is not a variant of this offer: it is an{' '}
            <Link to="/offering/l">L trigger</Link>, and it lands the engagement in Ecommerce Growth whatever the
            rest of the scope says.
          </p>
        )}
        <Tracks
          tracks={offer.tracks}
          only={{ label: TRACK[offer.delivery_track] ?? offer.delivery_track, body: offer.approach.storefront }}
        />
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
        <p className={`gate-rule ${envelope.max === 0 ? 'on-top' : 'inside'}`}>
          {envelope.max === 0
            ? `This offer holds no scope-gate work at all. A gate here is an add-on: its weeks and its price are added on top of the ${weeks(offer.duration_weeks)} weeks above. One gate stays in this offer; two or more make it an ${view.offers.find((o) => o.code === 'M')?.name ?? 'M'}.`
            : `This offer already holds ${weeks(envelope)} weeks of scope-gate work inside its band. A gate that fits in there costs nothing more. Only what goes past it is added on top of the ${weeks(offer.duration_weeks)} weeks above.`}
        </p>
        <ScopeTable catalogue={catalogue} totals={totals} capacity={offer.gate_capacity_weeks} />
      </section>

      {/* On every offer, not only on L.
          "Is this engagement an M" is the question these pages are opened with,
          and it was answered on one page out of three — in prose, under a
          heading S and M did not have, which is also why a consultant moving
          between the offers lost their place. */}
      <section id="lands" className="part-start">
        <Part id="lands" />
        <h2>What puts an engagement here</h2>
        <p className="lede">
          The engine asks these in order and stops at the first yes. Nobody picks the offer by hand, and nothing
          qualitative puts an engagement in one: a luxury brand with one market and a small catalogue is a small
          engagement.
        </p>
        <Lands classification={view.classification} here={offer.code} />
        <p className="lands-note">
          {segment.slug === 'l'
            ? <>A headless storefront lands here whatever the rest of the scope says — four weeks of Foundation cannot produce one at any catalogue size. What leaves the offers altogether is content or a front end outside Shopify: <Link to="/offering/arc">Merkle Arc</Link>, which these offers do not quote.</>
            : <>These are the whole decision — there is no sixth rule and no judgement call after them. What leaves the offers altogether is content or a front end outside Shopify: <Link to="/offering/arc">Merkle Arc</Link>, a separate engagement that nothing here quotes or estimates.</>}
        </p>
      </section>

      {/* The gates, on every offer — and what the band already holds before any
          of them is added to it. A page that lists what a gate costs without
          saying what the offer already covers leaves the consultant to guess
          whether the number is inside the band or on top of it. */}
      <section id="gates">
        <h2>{segment.slug === 'l' ? 'What the gates add to it' : 'What would make this a bigger offer'}</h2>
        <p className="lede">
          {segment.slug === 's'
            ? 'One gate keeps it in S with a modifier, and the modifier is added to the weeks and the band — an S with a heavy migration quotes what a heavy migration costs. Two gates or more make it an M.'
            : `This band already holds ${envelope.min}\u2013${envelope.max} weeks of scope gates: inside that they cost nothing more. Past it, each one is added to the weeks and to the band.${segment.slug === 'm' ? ' Only an L trigger takes an engagement out of this offer.' : ''}`}
        </p>
        <ol className="claims">
          {moves.map((g) => (
            <li key={g.id}>
              <details>
                <summary>
                  <span className="claim">{g.label}</span>
                  <span className="claim-line">
                    {g.effort_weeks ? `+${weeks(g.effort_weeks)} week${g.effort_weeks.max === 1 ? '' : 's'}` : 'No fixed effort'}
                    {view.pricing && g.price_add ? ` · ${band(g.price_add, currency)}` : ''}
                  </span>
                </summary>
                <p><strong>The exact rule.</strong> {g.condition}</p>
                {g.adds ? <p>{g.adds}</p> : null}
                {/* A gate priced by tier shows every tier. One headline number
                    is right for a third of engagements and wrong by a factor of
                    five for the rest. */}
                {g.tiers ? (
                  <ul className="tiers">
                    {g.tiers.map((t) => (
                      <li key={t.tier}>
                        <strong>{t.tier}</strong>
                        <span className="muted small">{t.adds}</span>
                        <span className="tier-cost">
                          +{weeks(t.effort_weeks)} week{t.effort_weeks.max === 1 ? '' : 's'}
                          {view.pricing && t.price_add ? ` · ${band(t.price_add, currency)}` : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </details>
            </li>
          ))}
        </ol>
      </section>

      <section id="channels">
        <h2>Who it sells to</h2>
        <p className="lede">
          Wholesale is not this offer plus an extra. Selling both ways is — that is the one case the
          B2B gate is for.
        </p>
        <Channels channels={offer.channels} />
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
 * in Shopify metaobjects is a Shopify build, and Ecommerce Growth prices it. The
 * line is a second system: content in an external CMS or PIM, or a front end
 * Shopify does not build. The honest thing for this page to do is name it and
 * stop — no band, no weeks, no estimate.
 */
function Arc({ view, segment }) {
  return (
    <main id="main" className="story offering">
      <header className="page-head">
        <Link to="/offering" className="crumb">← The offering</Link>
        <p className="eyebrow">Beyond S, M and L</p>
        <h1>Merkle Arc</h1>
        <p className="answer-line">Unify brand design, content and commerce in one architecture.</p>
        <p className="lede">
          Headless is not the line: Hydrogen with content in Shopify is <Link to="/offering/l">Ecommerce Growth</Link>,
          priced like any other build. The offers stop where a second system arrives — editorial content in an
          external CMS or PIM, or a front end Shopify does not build. Arc is the enterprise platform Merkle
          unifies those on: a tokenised design system, a multi-channel component library, GraphQL middleware and
          its own console, composable and headless without the vendor lock-in.
        </p>
        <p className="callout">
          <strong>Nothing here quotes it, and nothing here estimates it.</strong> This engine prices Shopify
          builds. Arc is a separate engagement, scoped by the Arc practice. What goes across is the discovery —
          every answer, every requirement, and the rule that named the reason.
        </p>
      </header>

      <section>
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

      <section>
        <h2>What takes an engagement beyond the offers <span className="chip">{view.exits.beyond_offers.length}</span></h2>
        <p className="lede">Each of these is a rule in the engine. It fires on the answers, not on an opinion.</p>
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

      <section>
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
