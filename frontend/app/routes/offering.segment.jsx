import { Link } from 'react-router';

import { requireUser } from '../auth.server.js';
import { offeringView } from '../../../discovery/service/offering-view.js';
import { pageTitle } from '../brand.js';
import { SEGMENTS, TRACK, band, segmentOf, weeks } from '../offering.js';
import { Boundaries, Channels, OfferScale, PhasePlan } from '../components/diagram.jsx';

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
  return { view, segment };
}

/** The offer this one grows into, and the one it grew from. */
function Neighbours({ segment }) {
  const i = SEGMENTS.indexOf(segment.slug);
  const prev = SEGMENTS[i - 1];
  const next = SEGMENTS[i + 1];
  return (
    <nav className="seg-next" aria-label="The other offers">
      {prev ? <Link to={`/offering/${prev}`} className="seg-prev">← {prev === 'larger-engagement' ? 'Beyond the offers' : prev.toUpperCase()}</Link> : <span />}
      {next ? <Link to={`/offering/${next}`}>{next === 'larger-engagement' ? 'What lies beyond the offers' : `${next.toUpperCase()} — the next offer up`} →</Link> : <span />}
    </nav>
  );
}

export default function OfferingSegment({ loaderData }) {
  const { view, segment } = loaderData;
  const currency = view.offers[0]?.currency;

  // Beyond the offers is not an offer, so it does not pretend to be one.
  if (segment.slug === 'larger-engagement') return <Beyond view={view} segment={segment} currency={currency} />;

  const { offer } = segment;
  /* Every offer's gates, L included.
     L used to show none of them, which was defensible while its band absorbed
     whatever they came to: the gates changed nothing about what was quoted. They
     do now — past the weeks the band already holds, each one is added to it — so
     an L page listing only its triggers says the opposite of what the engine
     does. */
  const moves = view.gates;
  const envelope = view.gate_capacity_weeks;

  return (
    <main id="main" className="story offering">
      <header className="page-head">
        <Link to="/offering" className="crumb">← The offering</Link>
        <p className="eyebrow">Offer {offer.code} · {TRACK[offer.delivery_track] ?? offer.delivery_track}</p>
        <h1>{offer.name}</h1>
        <p className="answer-line">{offer.triggered_by}.</p>
        {/* Three numbers that each answer something. The middle one used to be
            the length of the scope list, which reads "1 things" on the two
            offers whose scope is written as one line. */}
        <ul className="stats">
          <li><strong>{weeks(offer.duration_weeks)}</strong><span>weeks, end to end</span></li>
          <li>
            <strong>{segment.slug === 'l' ? view.l_triggers.length : view.gates.length}</strong>
            <span>{segment.slug === 'l' ? 'triggers land an engagement here' : 'scope gates can move it from here'}</span>
          </li>
          {view.pricing && offer.price_band
            ? <li><strong>{band(offer.price_band, currency)}</strong><span>internal price band — never in a client document</span></li>
            : <li><strong>{TRACK[offer.delivery_track] ?? offer.delivery_track}</strong><span>how the storefront is built</span></li>}
        </ul>
      </header>

      <section>
        <h2>Where it sits</h2>
        <OfferScale offers={view.offers} pricing={view.pricing} currency={currency} here={offer.code} />
      </section>

      <section>
        <h2>What it covers</h2>
        {/* The first line is the offer's claim — what makes "Foundation" a
            foundation and "Growth" growth — and it is not a scope item. Ticked
            alongside the rest it read as one, which is how an offer ends up with
            a name nobody can connect to what it delivers. */}
        <p className="answer-line">{offer.base_scope[0]}.</p>
        <ul className="ticks big">{offer.base_scope.slice(1).map((line) => <li key={line}>{line}</li>)}</ul>
      </section>

      <section>
        <h2>What you get, phase by phase</h2>
        <p className="lede">
          The phases in the order they run, each with the weeks it takes and the things that are
          handed over at the end of it. Set-up, template selection, app selection and template
          customisation are the four a client asks about by name, so they are named.
        </p>
        <PhasePlan phases={offer.phases} weeks={offer.duration_weeks} />
      </section>

      <section>
        <h2>Where this offer stops</h2>
        <p className="lede">
          Everything below is deliberate. An offer that only lists what it includes is the one
          argued about in week six.
        </p>
        <Boundaries notIncluded={offer.not_included} clientProvides={offer.client_provides} />
      </section>

      <section>
        <h2>Who it sells to</h2>
        <p className="lede">
          Wholesale is not this offer plus an extra. Selling both ways is — that is the one case the
          B2B gate is for.
        </p>
        <Channels channels={offer.channels} />
      </section>

      <section className="band">
        <div className="band-inner">
          <p className="eyebrow">How it meets Shopify</p>
          <h2 className="plain">Four decisions, taken the same way every time</h2>
          <dl className="rails">
            <div><dt>Storefront</dt><dd>{offer.approach.storefront}</dd></div>
            <div><dt>Shopify plan</dt><dd>{offer.approach.plan}</dd></div>
            <div><dt>How it is built</dt><dd>{offer.approach.build}</dd></div>
            <div><dt>Stores</dt><dd>{offer.approach.topology}</dd></div>
          </dl>
        </div>
      </section>

      {segment.slug === 'l' ? (
        <section>
          <h2>What lands an engagement here</h2>
          <p className="lede">
            One way in: any one of the triggers below, whatever the scope gates say. Scope alone never lands an
            engagement here — a Liquid build that runs long is still a Liquid build, and this offer is the
            headless one.
          </p>
          <p className="muted">
            Which is why the triggers are the whole entry: each is a statement about what is being built, not
            about how much of it there is. Scope that outgrows every offer is not an L either — that is{' '}
            <Link to="/offering/larger-engagement">beyond the offers</Link>, and a programme rather than a bigger
            one.
          </p>
          <h3>The triggers</h3>
          <ol className="claims">
            {view.l_triggers.map((t) => (
              <li key={t.id}>
                <details>
                  <summary>
                    <span className="claim">{t.label}</span>
                    <span className="claim-line">On its own, enough to make this an L.</span>
                  </summary>
                  <p>{t.condition}</p>
                </details>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* The gates, on every offer — and what the band already holds before any
          of them is added to it. A page that lists what a gate costs without
          saying what the offer already covers leaves the consultant to guess
          whether the number is inside the band or on top of it. */}
      <section>
        <h2>{segment.slug === 'l' ? 'What the gates add to it' : 'What moves an engagement out of here'}</h2>
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

      <section>
        <Neighbours segment={segment} />
      </section>
    </main>
  );
}

/** Not an offer: the decision about how Merkle proceeds when the offers stop. */
function Beyond({ view, segment, currency }) {
  return (
    <main id="main" className="story offering">
      <header className="page-head">
        <Link to="/offering" className="crumb">← The offering</Link>
        <p className="eyebrow">Beyond S, M and L</p>
        <h1>When the offers stop</h1>
        <p className="answer-line">This is not a refusal. It is a decision about how Merkle proceeds.</p>
        <p className="lede">
          Recorded in question 10.5.5, before the closing document is written. Two routes, and the engine produces
          a different thing for each.
        </p>
      </header>

      <section>
        <h2>The two routes</h2>
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
