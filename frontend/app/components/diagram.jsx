/**
 * @file diagram.jsx
 * @description The three drawings on "What this is".
 *
 * Prose was carrying work that a picture does in one look: that the engine is
 * one thing with two ways into it, that a bid runs three stages a discovery
 * never does, and that nothing reaches a client without crossing three hands in
 * a fixed order. Measured, the page ran 2,000 words over seven screens with
 * eighteen sentences past thirty words — and every section was the same grid of
 * cards, so nothing stood out and nothing was remembered.
 *
 * Rules these follow, so they stay honest:
 *
 *   The text is HTML wherever a person has to read it. SVG carries the lines,
 *   the spine and the arrows — the connective tissue — and never a sentence,
 *   because text in SVG cannot be selected, cannot reflow and cannot be
 *   translated by the rest of this app.
 *
 *   Every drawing is built from the same constant the prose beside it is built
 *   from, so a diagram cannot drift from the page it illustrates.
 *
 *   Each is labelled and has a text equivalent. A drawing nobody using a screen
 *   reader can follow is decoration, and this page has no room for decoration.
 *
 * @module components/diagram
 */

/**
 * Two ways in, one engine.
 *
 * Drawn rather than described because the sentence "the engine is blind to
 * which one you are running" asks a reader to hold two paths and one shared
 * thing in their head at once. The picture just shows it.
 */
export function WaysIn() {
  return (
    <svg className="dgm ways-in" viewBox="0 0 640 210" role="img"
      aria-label="An RFP response and a discovery both enter the same engine, which produces a sourced client document.">
      <defs>
        <marker id="wi-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
        </marker>
      </defs>
      {/* the two entries */}
      <g className="dgm-box">
        <rect x="8" y="14" width="196" height="52" />
        <rect x="8" y="126" width="196" height="52" />
      </g>
      <g className="dgm-label">
        <text x="28" y="39">AN RFP ARRIVES</text>
        <text x="28" y="57" className="dgm-sub">information is scarce</text>
        <text x="28" y="151">A CLIENT IS ENGAGED</text>
        <text x="28" y="169" className="dgm-sub">everything must be exact</text>
      </g>
      {/* both bend into the same block */}
      <g className="dgm-line" markerEnd="url(#wi-head)">
        <path d="M204 40 H262 Q278 40 278 56 V92" />
        <path d="M204 152 H262 Q278 152 278 136 V100" />
      </g>
      {/* the engine */}
      <rect className="dgm-solid" x="290" y="72" width="182" height="48" />
      <text className="dgm-on-solid" x="381" y="101" textAnchor="middle">ONE ENGINE</text>
      <path className="dgm-wedge" d="M472 72 L472 120 L448 72 Z" />
      {/* out */}
      <path className="dgm-line" d="M472 96 H556" markerEnd="url(#wi-head)" />
      <g className="dgm-label">
        <text x="566" y="92">ONE</text>
        <text x="566" y="108">DOCUMENT</text>
      </g>
    </svg>
  );
}

/**
 * The hand-off: code, then AI, then the consultant.
 *
 * The order is the point, and it is the whole safety argument of the tool — so
 * it is drawn as one line moving in one direction, with what crosses each
 * boundary written on the boundary.
 */
export function HandOff({ hands }) {
  const x = (i) => 24 + i * 204;
  return (
    <svg className="dgm hand-off" viewBox="0 0 640 132" role="img"
      aria-label={`Work passes in one direction through three hands: ${hands.map((h) => h.who).join(', then ')}. Nothing skips a hand.`}>
      <defs>
        <marker id="ho-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
        </marker>
      </defs>
      <path className="dgm-line" d="M24 108 H616" markerEnd="url(#ho-head)" />
      {hands.map((hand, i) => (
        <g key={hand.who}>
          <rect className={i === 0 ? 'dgm-solid' : 'dgm-box'} x={x(i)} y="20" width="172" height="56" />
          <text className={i === 0 ? 'dgm-on-solid' : 'dgm-label'} x={x(i) + 86} y="44" textAnchor="middle">
            {hand.who.toUpperCase()}
          </text>
          <text className={i === 0 ? 'dgm-on-solid dgm-sub' : 'dgm-sub'} x={x(i) + 86} y="62" textAnchor="middle">
            {hand.crosses}
          </text>
          <path className="dgm-tick" d={`M${x(i) + 86} 76 V108`} />
          <circle className="dgm-dot" cx={x(i) + 86} cy="108" r="5" />
        </g>
      ))}
    </svg>
  );
}

/**
 * The ladder: the two paths rung by rung.
 *
 * This is the centrepiece and it is deliberately not an SVG. Seven stages of
 * real sentences belong in HTML, where they can be read aloud, selected and
 * reflowed on a phone. What the drawing contributes is the spine down the
 * middle and the gap on the right where a bid runs three stages a discovery
 * never does — and you see that gap without reading a word.
 */
export function Ladder({ paths }) {
  return (
    <ol className="paths-rungs" aria-label="The two paths, stage by stage">
      {paths.map(([stage, bidTitle, bidBody, discTitle, discBody]) => (
        <li key={stage} className={discTitle ? 'both' : 'bid-only'}>
          <p className="rung-stage">{stage}</p>
          <div className="rung side bid">
            <h3>{bidTitle}</h3>
            <p>{bidBody}</p>
          </div>
          {discTitle ? (
            <div className="rung side discovery">
              <h3>{discTitle}</h3>
              <p>{discBody}</p>
            </div>
          ) : (
            <div className="rung side empty" aria-hidden="true"><p>—</p></div>
          )}
        </li>
      ))}
    </ol>
  );
}

/**
 * The sourcing rule: two gates, and a claim that fails either does not ship.
 *
 * This is the whole subject of "How it works" and it existed only as prose. A
 * claim needs an official Shopify page under it and a client answer behind it;
 * missing either, the engine rejects the draft rather than softening it. Drawn,
 * because "or it does not ship" is a shape — a path with a way out of it.
 */
export function SourcingRule() {
  return (
    <svg className="dgm sourcing" viewBox="0 0 640 196" role="img"
      aria-label="A claim must pass two checks: an official Shopify source, and a client answer it rests on. Failing either, it is rejected and never saved.">
      <defs>
        <marker id="sr-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
        </marker>
      </defs>
      {/* the claim enters */}
      <rect className="dgm-box" x="4" y="42" width="128" height="44" />
      <text className="dgm-label" x="68" y="62" textAnchor="middle">A CLAIM</text>
      <text className="dgm-sub" x="68" y="78" textAnchor="middle">the model wrote it</text>

      {/* gate one */}
      <path className="dgm-line" d="M132 64 H176" markerEnd="url(#sr-head)" />
      <rect className="dgm-box" x="180" y="38" width="130" height="52" />
      <text className="dgm-label" x="245" y="60" textAnchor="middle">OFFICIAL</text>
      <text className="dgm-label" x="245" y="76" textAnchor="middle">SOURCE?</text>

      {/* gate two */}
      <path className="dgm-line" d="M310 64 H354" markerEnd="url(#sr-head)" />
      <rect className="dgm-box" x="358" y="38" width="130" height="52" />
      <text className="dgm-label" x="423" y="60" textAnchor="middle">CLIENT</text>
      <text className="dgm-label" x="423" y="76" textAnchor="middle">ANSWER?</text>

      {/* both yes: it ships */}
      <path className="dgm-line" d="M488 64 H540" markerEnd="url(#sr-head)" />
      <rect className="dgm-solid" x="544" y="42" width="92" height="44" />
      <text className="dgm-on-solid" x="590" y="69" textAnchor="middle">IT SHIPS</text>

      {/* either no: it never gets saved */}
      <path className="dgm-fail" d="M245 90 V148 H400" markerEnd="url(#sr-head)" />
      <path className="dgm-fail" d="M423 90 V148" />
      <rect className="dgm-fail-box" x="404" y="126" width="180" height="44" />
      <text className="dgm-fail-label" x="494" y="146" textAnchor="middle">REJECTED</text>
      <text className="dgm-sub" x="494" y="162" textAnchor="middle">sent back with the gap named</text>
    </svg>
  );
}

/**
 * The three offers on one scale.
 *
 * S, M and L were three paragraphs with their durations written inside them, so
 * comparing them meant reading three sentences and holding six numbers. They
 * are ranges on a shared axis: the difference between 4–5 weeks and 10–14 is a
 * length you see, and where one offer stops and the next begins stops being
 * something to work out.
 *
 * Bars in CSS rather than SVG, so the numbers stay selectable text and the
 * whole thing reflows on a phone instead of scrolling sideways.
 *
 * @param {{ offers: object[], pricing: boolean, currency?: string, here?: string }} props
 *   here: the offer code this page is about, marked "you are here".
 */
export function OfferScale({ offers, pricing, currency, here }) {
  const max = Math.max(...offers.map((o) => o.duration_weeks?.max ?? 0));
  const money = pricing && offers.every((o) => o.price_band);
  const topPrice = money ? Math.max(...offers.map((o) => o.price_band.max)) : 0;
  const pct = (n, of) => `${Math.max((n / of) * 100, 2)}%`;

  return (
    <div className="scale" role="table" aria-label="The three offers compared by duration and price band">
      <div className="scale-head" role="row">
        <span role="columnheader">Offer</span>
        <span role="columnheader">Weeks, end to end</span>
        {money ? <span role="columnheader">Internal price band</span> : null}
      </div>
      {offers.map((o) => {
        const w = o.duration_weeks ?? { min: 0, max: 0 };
        const p = o.price_band;
        return (
          <div className={`scale-row${here === o.code ? ' here' : ''}`} role="row" key={o.code}>
            <span className="scale-code" role="cell">
              {o.code}
              {here === o.code ? <span className="scale-here">you are here</span> : null}
            </span>
            <span className="scale-bar" role="cell">
              <span className="bar" style={{ marginInlineStart: pct(w.min - (w.min ? 1 : 0), max), inlineSize: pct(w.max - w.min + 1, max) }}>
                <b>{w.min === w.max ? w.min : `${w.min}–${w.max}`}</b>
              </span>
            </span>
            {money ? (
              <span className="scale-bar money" role="cell">
                <span className="bar" style={{ marginInlineStart: pct(p.min, topPrice), inlineSize: pct(p.max - p.min, topPrice) }}>
                  <b>{Math.round(p.min / 1000)}k–{Math.round(p.max / 1000)}k{p.open_ended ? '+' : ''}</b>
                </span>
              </span>
            ) : null}
          </div>
        );
      })}
      <p className="scale-axis" aria-hidden="true"><span><i>0</i><i>{max} weeks</i></span></p>
      {money ? <p className="muted small">Price bands are Merkle’s internal commercial position, in {currency}. They never reach a client document.</p> : null}
    </div>
  );
}

/**
 * Where the weeks go.
 *
 * "Four to five weeks" is a number a consultant has to defend in a room, and
 * the only defence is the phases. They were not in the offering at all: the
 * offer said what it covered and how long it took, and nothing joined the two —
 * so "what does set-up actually include" had no answer, and the largest phase
 * of an L was invisible.
 *
 * Bars rather than a table, because the shape is the argument. On Growth the
 * storefront build is four to six of the thirteen to twenty weeks and you see
 * that before reading a word, which is exactly why that offer exists. Widths are
 * a percentage of the longest phase, in CSS, so the numbers stay selectable and
 * the whole thing reflows on a phone.
 *
 * @param {{ phases: object[], weeks: {min: number, max: number} }} props
 */
export function PhasePlan({ phases, weeks }) {
  if (!phases?.length) return null;
  const longest = Math.max(...phases.map((p) => p.weeks.max));
  const span = (w) => (w.min === w.max ? `${w.min}` : `${w.min}–${w.max}`);

  return (
    <ol className="phases" aria-label={`The ${phases.length} phases of this offer, ${span(weeks)} weeks end to end`}>
      {phases.map((p) => (
        <li key={p.id}>
          <div className="phase-head">
            <h3>{p.name}</h3>
            {/* The number is its own column, not the text after the bar: as a
                flex item it was pushed out of the cell by the longest bar, so
                the longest phase was the one phase whose duration could not be
                read on a phone. */}
            <p className="phase-weeks">
              <span className="phase-bar" style={{ inlineSize: `${Math.max((p.weeks.max / longest) * 100, 6)}%` }} aria-hidden="true" />
              <span className="phase-n"><b>{span(p.weeks)}</b> <span className="muted small">week{p.weeks.max === 1 ? '' : 's'}</span></span>
            </p>
          </div>
          <p className="phase-covers">{p.covers}</p>
          {/* The things handed over, not the activity. "What do I actually get"
              had no answer on this page: the offer said what it covered in four
              lines and how long it took, and a consultant had to invent the
              middle in the room. */}
          {p.deliverables?.length ? (
            <ul className="phase-gets">{p.deliverables.map((d) => <li key={d}>{d}</li>)}</ul>
          ) : null}
        </li>
      ))}
      <li className="phases-total">
        <div className="phase-head">
          <h3>End to end</h3>
          <p className="phase-weeks"><span className="phase-n"><b>{span(weeks)}</b> <span className="muted small">weeks</span></span></p>
        </div>
        <p className="phase-covers">The phases add up to the offer. They are held to it by a test, so a phase cannot quietly grow.</p>
      </li>
    </ol>
  );
}

/**
 * Who is being sold to.
 *
 * B2B was a modifier on a consumer base, which charged a wholesale-only client
 * for promotion and checkout work they never received and then charged them
 * again for the company accounts that replaced it. Each offer now says what it
 * covers per channel, and the wholesale-only row is the one that changed.
 *
 * @param {{ channels: {b2c: string, b2b: string, both: string} }} props
 */
export function Channels({ channels }) {
  if (!channels) return null;
  const rows = [
    ['Consumer only', channels.b2c],
    ['Wholesale only', channels.b2b],
    ['Both channels', channels.both],
  ];
  return (
    <dl className="channels">
      {rows.map(([label, body]) => (
        <div key={label}><dt>{label}</dt><dd>{body}</dd></div>
      ))}
    </dl>
  );
}

/**
 * How the storefront is built.
 *
 * The track used to be a property of the offer, which told a headless
 * engagement it was getting a theme. It is an answer: Ecommerce Growth builds
 * either way and spends the same weeks differently, exactly as it does per
 * channel.
 *
 * Where an offer builds only one way it still answers the question, with `only`.
 * The section used to disappear on S and M, and a section that is absent is
 * indistinguishable from a page that ended early — a consultant moving between
 * the three offers lost their place in a page that was meant to be one template
 * with different values in it.
 *
 * @param {{ tracks?: {liquid: string, hydrogen: string}, only?: {label: string, body: string} }} props
 */
export function Tracks({ tracks, only }) {
  const rows = tracks
    ? [['Shopify theme', tracks.liquid], ['Headless · Hydrogen', tracks.hydrogen]]
    : (only ? [[only.label, only.body]] : []);
  if (!rows.length) return null;
  return (
    <dl className="channels">
      {rows.map(([label, body]) => (
        <div key={label}><dt>{label}</dt><dd>{body}</dd></div>
      ))}
    </dl>
  );
}

/**
 * The templates an offer builds, and how many sections are built rather than
 * configured.
 *
 * The phases said "brand tokens and the standard sections" against "the
 * sections the gated requirements need" against "the design system" — true,
 * and none of it countable. On a fixed price the count is the argument.
 *
 * @param {{ storefront: { templates: string[], sections: string, bespoke_sections: number|null, note: string } }} props
 */
export function Storefront({ storefront }) {
  if (!storefront) return null;
  const { templates = [], sections, bespoke_sections: bespoke, note } = storefront;
  return (
    <div className="storefront-scope">
      <ul className="stats kpis">
        <li><strong>{templates.length}</strong><span>template{templates.length === 1 ? '' : 's'} built</span></li>
        <li>
          <strong>{bespoke === null || bespoke === undefined ? 'The set' : bespoke}</strong>
          <span>{bespoke === null || bespoke === undefined ? 'every template against the design system' : `bespoke section${bespoke === 1 ? '' : 's'}, built rather than configured`}</span>
        </li>
      </ul>
      <ol className="templates">
        {templates.map((t) => <li key={t}>{t}</li>)}
      </ol>
      <p className="muted small">{sections}</p>
      {note ? <p className="callout"><strong>Past that.</strong> {note}</p> : null}
    </div>
  );
}

/**
 * The two lists an offer is argued about in week six for not having.
 *
 * An offer that only says what it includes leaves every boundary to be
 * discovered, and "we assumed you had a sandbox" is not an argument anybody
 * wins. Side by side, because they are the same conversation: where this offer
 * stops, and where the client starts.
 *
 * @param {{ notIncluded: string[], clientProvides: string[] }} props
 */
export function Boundaries({ notIncluded, clientProvides, assumes }) {
  if (!notIncluded?.length && !clientProvides?.length && !assumes?.length) return null;
  return (
    <>
      <div className="boundaries">
        <section className="boundary out">
          <h3>Not in this offer</h3>
          <ul>{notIncluded.map((line) => <li key={line}>{line}</li>)}</ul>
        </section>
        <section className="boundary theirs">
          <h3>What we need from the client</h3>
          <ul>{clientProvides.map((line) => <li key={line}>{line}</li>)}</ul>
        </section>
      </div>
      {/* The third column of the same conversation, and the one that was
          missing: what it includes and what it excludes both assume a quantity,
          and an unwritten quantity is where a fixed price becomes time and
          materials without anybody deciding to change it. */}
      {assumes?.length ? (
        <section className="boundary assumes">
          <h3>What this price assumes</h3>
          <ul>{assumes.map((line) => <li key={line}>{line}</li>)}</ul>
        </section>
      ) : null}
    </>
  );
}

/** The questions that switch a story on, as their ids with the question behind them. */
function Decided({ questions }) {
  if (!questions?.length) return null;
  const shown = questions.slice(0, 3);
  const rest = questions.length - shown.length;
  return (
    <span className="decided">
      {shown.map((q) => <abbr key={q.id} title={q.text}>{q.id}</abbr>)}
      {rest > 0 ? <span className="muted"> +{rest}</span> : null}
    </span>
  );
}

/** "+1–5 weeks", or nothing when a gate carries no modifier. */
const gateWeeks = (w) => (w ? `+${w.min === w.max ? w.min : `${w.min}–${w.max}`} weeks` : null);

/**
 * What an offer builds, epic by epic, as one table.
 *
 * These are sold at a fixed price, and the offer pages were describing a
 * hundred and eighteen stories in three lines of base scope. A client signing a
 * fixed price is entitled to the list; a consultant defending one needs it in
 * the room, in an order they can read down rather than sixteen accordions they
 * have to open one at a time.
 *
 * One row per story, grouped by epic, and one column carrying the only thing
 * that decides the price: whether the story is in it whatever the client
 * answers, in it once their answers call for it — with the question named — or
 * behind a scope gate that has its own weeks. The gates' conditions are not
 * repeated here: they are on this page in full, once, under the gates.
 *
 * Nothing is written by hand. It is the backlog the engine generates, read as a
 * scope statement.
 *
 * @param {{ catalogue: object[], totals: object, capacity: {min:number,max:number}|null, offerCode: string }} props
 */
export function ScopeTable({ catalogue, totals, capacity }) {
  if (!catalogue?.length) return null;
  return (
    <div className="scope-epics">
      <ul className="stats kpis">
        <li><strong>{totals.epics}</strong><span>epics, every one delivered by named stories</span></li>
        <li><strong>{totals.always}</strong><span>stories in every engagement, whatever the answers</span></li>
        <li><strong>{totals.conditional}</strong><span>more when the answers call for them — inside this band</span></li>
        <li><strong>{totals.gated}</strong><span>behind a scope gate{capacity ? `, priced past ${capacity.min}–${capacity.max} weeks` : ''}</span></li>
      </ul>

      <div className="table-scroll" role="region" tabIndex={0} aria-label="What this offer builds, story by story">
        {/* No column header out here. Every row of the outer table is one cell
            spanning four, so "Story · What it delivers · In the price when ·
            Adds" announced four columns that do not appear until an epic is
            opened — and the opened epic brings its own header. */}
        <table className="compare scope-table">
          {catalogue.map((epic) => {
            /* The weeks are printed on the first story of a gate and on no other:
               a gate adds its cost once however many stories it carries, and a
               column repeating "+0.5–5 weeks" five times reads as five times the
               price. */
            const gated = epic.gated.flatMap((g) => g.stories.map((s, i) => ({ ...s, gate: g, firstOfGate: i === 0 })));
            const rows = [
              ...epic.always.map((s) => ({ ...s, when: 'always' })),
              ...epic.conditional.map((s) => ({ ...s, when: 'answers' })),
              ...gated.map((s) => ({ ...s, when: 'gate' })),
            ];
            return (
              <tbody key={epic.id}>
                <tr className="epic-row">
                  {/* Each epic opens on demand. Inline, the sixteen of them came
                      to six thousand pixels — forty-four per cent of the page —
                      which buries the four sections a consultant actually
                      arrived for. The counts are the summary: a reader who wants
                      the stories opens the epic, and one who wants to know how
                      many there are never has to. */}
                  <th scope="rowgroup" colSpan={4}>
                    <details>
                      <summary>
                        <span className="epic-name">{epic.name}</span>
                        <span className="epic-meta">
                          {epic.summary} · {epic.always.length} always · {epic.conditional.length} on the answers · {gated.length} gated
                        </span>
                      </summary>
                      <table className="compare epic-stories">
                        <thead>
                          <tr>
                            <th scope="col">Story</th>
                            <th scope="col">What it delivers</th>
                            <th scope="col">In the price when</th>
                            <th scope="col">Adds</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((st) => (
                            <tr key={st.key} className={`scope-row scope-${st.when}`}>
                              <td data-label="Story"><span className="scope-key">{st.key}</span></td>
                              <td data-label="What it delivers">{st.label}</td>
                              <td data-label="In the price when">
                                {st.when === 'always' ? <span className="scope-when is-always">Always</span> : null}
                                {st.when === 'answers' ? <><span className="scope-when is-answers">The answers say so</span> <Decided questions={st.decided_by} /></> : null}
                                {st.when === 'gate' ? <span className="scope-when is-gated">{st.gate.label} gate</span> : null}
                              </td>
                              <td data-label="Adds">
                                {st.when === 'gate' && st.firstOfGate && gateWeeks(st.gate.effort_weeks)
                                  ? <span className="scope-cost">{gateWeeks(st.gate.effort_weeks)}</span>
                                  : <span className="muted">{st.when === 'gate' ? '\u21b3 same gate' : '\u2014'}</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </details>
                  </th>
                </tr>
              </tbody>
            );
          })}
        </table>
      </div>

      {/* Whether a gate's weeks land on top of the offer or inside it is stated
          above the table now, per offer, because it is the question a reader
          arrives with. What is left here is the one thing the table itself can
          mislead about: the same number repeated down a column. */}
      <p className="muted small">
        A gate adds its weeks once, however many stories it carries — the column repeats the gate, not the cost.
        Each gate&rsquo;s exact condition is further down the page.
      </p>
    </div>
  );
}

/**
 * What puts an engagement in this offer.
 *
 * The engine decides the offer from five rules in order and stops at the first
 * yes, and the index page draws all five. From an offer's own page the reader
 * has one question — is this engagement an M — and only the L page answered it,
 * in two paragraphs of prose under a heading S and M did not have.
 *
 * So it is the same five rules, read from one offer's side: the rungs that land
 * here are marked, the rest stay grey, and the answer is the shape of the list
 * rather than a sentence to find inside it. Nothing is written by hand — drift
 * between this list and the engine is the one failure it exists to prevent.
 *
 * @param {{ classification: object[], here: string }} props
 */
export function Lands({ classification, here }) {
  if (!classification?.length) return null;
  return (
    <ol className="lands" aria-label={`The rules that decide the offer, with the ones that land on ${here} marked`}>
      {classification.map((c) => {
        const mine = c.offer === here;
        return (
          <li key={c.order} className={mine ? 'here' : undefined}>
            {/* `plain` already carries ", priced with its modifier" where the
                rule applies one — appending it from `with_modifier` as well
                printed the clause twice. */}
            <span className="land-rule">{c.plain}</span>
            <span className="land-offer" aria-label={mine ? `lands on ${c.offer} — this offer` : `lands on ${c.offer}`}>{c.offer}</span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * A duration as a ceiling: "Up to 9 weeks".
 *
 * Every other figure in the comparison is the most that fits in a pack — up to
 * 3 markets, up to 1 store, up to the band's own ceiling — and weeks were the
 * one figure printed as a range. Two ways of reading a number in one table is one too
 * many, and "2–9 weeks" gets heard in a room as "at least two". Where min and
 * max agree there is no ceiling to state and the figure is printed plainly, so
 * the word "up to" always means something.
 *
 * Tolerates a bare number as well as a {min, max}, because the add-on catalogue
 * is allowed to carry either.
 *
 * @param {{min: number, max: number}|number|null|undefined} w
 * @returns {string|null}
 */
function upToWeeks(w) {
  if (w === null || w === undefined) return null;
  const n = typeof w === 'number' ? { min: w, max: w } : w;
  if (typeof n.max !== 'number') return null;
  const unit = n.max === 1 ? 'week' : 'weeks';
  return n.min === n.max ? `${n.max} ${unit}` : `Up to ${n.max} ${unit}`;
}

/**
 * A cell is a quantity or it is a dash.
 *
 * The table's whole job is the maximum that fits in each pack. It does not
 * explain what does not fit and it never says "add-on" in a cell — a reader
 * comparing three columns of prose cannot find the number they came for, and a
 * cell that sells something is a cell that stops comparing. Everything about
 * buying more lives in the add-on services below.
 *
 * The regexp is a bridge for rows still carrying the older prose values ("No —
 * one checkout currency", "Not in the base pack — its own scope gate"). Once
 * every value in the offering is a quantity it matches nothing and this is a
 * pass-through.
 */
const NOT_COVERED = /^(no|none|not\s|n\/a|add[- ]?on)\b/i;
function quantity(value) {
  const s = typeof value === 'string' ? value.trim() : '';
  if (!s || s === '—' || s === '-' || NOT_COVERED.test(s)) return null;
  return s;
}

/** A dash a screen reader can read, since the glyph alone announces as nothing. */
/**
 * The Arc column. Arc is not a fourth pack — it has no band, no weeks and no
 * gate capacity — so it is a column of where the offers stop rather than one
 * more thing to buy. Three of the twenty-two rows carry it, each derived from
 * the STOP rule that routes to Arc, and the rule is printed so the cell cannot
 * claim something the engine would not.
 */
function ArcCell({ arc }) {
  /* Not `NotCovered`: that announces "Not included in this pack", and Arc is
     not a pack. An empty cell here means the row is not where the offers stop,
     which is the opposite of a gap in what Arc does. */
  if (!arc) {
    return (
      <>
        <span className="sr-only">Not where the offers stop</span>
        <span aria-hidden="true">&mdash;</span>
      </>
    );
  }
  return (
    <>
      <span className="pack-arc-what">{arc.what}</span>
      {arc.rules?.length ? (
        <span className="pack-arc-rule">
          {arc.rules.length === 1 ? 'Rule' : 'Rules'} {arc.rules.join(', ')}
        </span>
      ) : null}
    </>
  );
}

function NotCovered() {
  return (
    <>
      <span className="sr-only">Not included in this pack</span>
      <span aria-hidden="true">—</span>
    </>
  );
}

/**
 * What each pack includes, and up to what limit. One table.
 *
 * It was three: a scale of durations, an approach table and this one, none of
 * which a reader could tell apart, and the verdict was "I don't understand any
 * of them, keep only one". The other two are gone from the index — the scale
 * still serves an offer's own page, where there is one thing to locate on it.
 *
 * What is left has to carry the whole comparison, so it is built to be read
 * rather than scanned end to end:
 *
 *   Sections, not a wall. `group` breaks forty rows into blocks a consultant can
 *   point at — markets and stores, catalogue, storefront, checkout — so finding
 *   the answer to the question the client actually asked is a jump, not a read.
 *
 *   A cell is a quantity. Where a pack covers none of a row the cell is a dash.
 *   Included-up-to-a-limit and quoted-on-top are no longer two states of one
 *   cell competing for the same glance: the second state left the table.
 *
 *   A row that is the same in every pack is said once, spanning the three
 *   columns, instead of three times. More than half of them are, and three
 *   identical cells read as a comparison that came back empty — they spend
 *   three columns of attention on one fact and dilute the rows where the packs
 *   actually differ. Spanning costs nothing: the subject keeps its place in the
 *   group a reader went looking for it in, and the shape of the row becomes the
 *   answer to "does the pack matter here".
 *
 *   The explanation is attached to its row and folded away. Every note used to
 *   be dumped into a single cell at the bottom — sixteen paragraphs under the
 *   word "Notes", so the rationale for the SKU ceiling sat four paragraphs from
 *   the SKU row and nobody read any of it. Each note is now a disclosure on the
 *   row it belongs to, shut by default.
 *
 *   The platform ceiling sits with its subject. `shopify_limit` is Shopify's
 *   own documented limit, not Merkle's, and a reader needs it beside the row it
 *   bounds rather than in a fifth column squeezing the three that compare.
 *
 * Every figure is read from the offering. Nothing in here is typed twice, and
 * the fields that have not landed yet — `group`, `shopify_limit` — are absent
 * rather than fatal.
 *
 * @param {{ offers: object[], closedScope?: object[], pricing: boolean,
 *   currency?: string, track?: Function }} props
 */
/** Whether a row says something different for any two adjacent packs. */
const differs = (row, offers) => offers.some((o, i) => i > 0 && String(row.values?.[o.code]) !== String(row.values?.[offers[i - 1].code]));

export function PackTable({ offers, closedScope = [], pricing, currency, track }) {
  if (!offers?.length) return null;
  const cols = offers.length + 2; // the row label, the packs, and Arc

  /* How the pack is built, in the column head, because the table that used to
     say it was the second one a reader could not tell from this. An offer that
     builds either way has a `tracks` pair and says so — `delivery_track` is
     `liquid` on all three, so printing it alone put "Online Store · Horizon"
     under Ecommerce Growth, which is the one offer that is often headless. */
  const buildsAs = (o) => (o.tracks ? 'Theme or headless' : (track ? track(o.delivery_track) ?? o.delivery_track : null));

  /* A row whose value is the same in every pack is not a comparison; it is one
     fact about the offering, and three identical cells invite a reader to hunt
     for a difference that is not there. Compared after `quantity`, so two cells
     that differ only in prose the table does not print still count as the same.
     A row where nothing is covered anywhere never reaches this — it has already
     been filtered out. */
  const sameEverywhere = (row) => {
    const first = quantity(row.values?.[offers[0].code]);
    return Boolean(first) && offers.every((o) => quantity(row.values?.[o.code]) === first);
  };

  /* Only rows a pack includes something of. A row that is a dash in all three
     columns tells a reader nothing except that they should stop reading — its
     subject is an add-on service and it is sold below, rather than un-sold
     here. This is the contract's own rule, enforced at the last moment in case
     a row arrives that does not honour it. */
  const rows = closedScope.filter((r) => offers.some((o) => quantity(r.values?.[o.code])));

  /* Grouped by name in first-appearance order, so the data decides the sections
     and their order. No `group` yet means one unnamed block, which reads exactly
     as the table did before the field existed. */
  const groups = new Map();
  for (const row of rows) {
    const name = row.group ?? null;
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(row);
  }

  return (
    <div className="table-scroll" role="region" tabIndex={0} aria-label="What each pack includes, and up to what limit">
      <table className="compare packs">
        <caption className="sr-only">
          What each pack includes, and up to what limit. A dash means the pack includes none of that row.
          A cell marked &ldquo;Every pack&rdquo; spans the three pack columns and holds the same value in
          all of them. What can be bought on top is listed under Add-on services, after this table.
          The last column is Merkle Arc, which is not a pack and is not quoted here: it carries a value
          only on the rows where a STOP rule takes the requirement out of the offers altogether.
        </caption>
        <thead>
          <tr>
            <th scope="col">What the pack includes</th>
            {offers.map((o) => (
              <th scope="col" key={o.code} className={o.most_common ? 'pack-common' : undefined}>
                <span className="pack-code">{o.code}</span>
                <span className="pack-name">{o.name}</span>
                {/* "end to end", because the row below this one also says
                    "Up to N weeks" about the same pack and the two sat one
                    under the other with nothing saying that the second is part
                    of the first. A reader comparing "Up to 14 weeks" with "Up
                    to 9 weeks" has been handed a contradiction. */}
                <span className="pack-meta">
                  {upToWeeks(o.duration_weeks)} end to end
                  {buildsAs(o) ? ` · ${buildsAs(o)}` : ''}
                </span>
                {/* The price ceiling belongs with the week ceiling: they are the
                    two numbers a consultant carries into the room, and it used
                    to be a separate row three lines below, where nobody read it
                    next to the weeks it goes with. */}
                {pricing && o.price_band ? (
                  <span className="pack-ceiling">
                    Up to {currency ?? ''} {Math.round(o.price_band.max / 1000)}k{o.price_band.open_ended ? '+' : ''}
                  </span>
                ) : null}
              </th>
            ))}
            <th scope="col" className="pack-arc">
              <span className="pack-code">&mdash;</span>
              <span className="pack-name">Merkle Arc</span>
              <span className="pack-meta">Not quoted here</span>
            </th>
          </tr>
        </thead>
        {/* The commercial frame, above the capabilities: how much gated work the
            price already holds, and — for an owner only — the band itself. Both
            are ceilings and both are printed as one. */}
        <tbody className="pack-differs">
          <tr>
            <th scope="row">Of those, scope-gate work the band already holds</th>
            {offers.map((o) => {
              const cap = o.gate_capacity_weeks;
              return (
                <td key={o.code} data-label={o.code} className={o.most_common ? 'pack-common' : undefined}>
                  <span className="pack-budget">{!cap || cap.max === 0 ? 'None' : upToWeeks(cap)}</span>
                </td>
              );
            })}
            <td data-label="Merkle Arc" className="pack-arc"><span className="pack-arc-what">Scoped by the Arc practice</span></td>
          </tr>
          {/* The internal band was a row here and is now in the column head,
              next to the weeks ceiling it belongs with. Printed in both places
              it was the same number twice, and two "Up to" figures per pack is
              exactly what made this header hard to read. */}
        </tbody>
        {[...groups].map(([name, groupRows]) => (
          <tbody key={name ?? 'all'}>
            {name ? (
              <tr className="pack-group">
                <th scope="rowgroup" colSpan={cols}>{name}</th>
              </tr>
            ) : null}
            {groupRows.map((row) => (
              /* Marked where the packs do not agree. Eighteen of the twenty-two
                 rows say the same thing for M and L, so the four that separate
                 them are what a consultant is looking for and were the hardest
                 thing on the page to find. */
              <tr key={row.id} className={`pack-gets${differs(row, offers) ? ' pack-differs' : ''}`}>
                <th scope="row">
                  <span className="pack-what">{row.what}</span>
                  {row.shopify_limit ? (
                    <span className="pack-limit">
                      <span className="pack-limit-tag">Shopify&rsquo;s limit</span> {row.shopify_limit}
                    </span>
                  ) : null}
                  {row.note ? (
                    <details className="pack-why">
                      <summary>What this covers</summary>
                      <p>{row.note}</p>
                    </details>
                  ) : null}
                </th>
                {sameEverywhere(row) ? (
                  /* More than half these rows hold the same value in all three
                     packs, and printed three times they read as a comparison
                     that found no difference — three columns of attention spent
                     on one fact, diluting the rows where the packs genuinely
                     differ. Stated once, across the three columns, the table
                     gets a rhythm a reader can use: three values means choose,
                     one band means it does not matter which pack you are in.
                     Nothing moves and nothing hides — the subject stays in the
                     group the reader looked for it in, which is why several of
                     these rows exist at all.
                     The tag is text and carries a trailing space, because an
                     inline element boundary is not a word boundary in the
                     accessibility tree: without it this announces as
                     "Every packUp to 1 store". */
                  <td colSpan={offers.length} data-label="Every pack" className="pack-yes pack-every">
                    <span className="pack-every-tag">Every pack</span>{' '}
                    {quantity(row.values?.[offers[0].code])}
                  </td>
                ) : offers.map((o) => {
                  const value = quantity(row.values?.[o.code]);
                  return (
                    <td key={o.code} data-label={o.code} className={[value ? 'pack-yes' : 'pack-no', o.most_common && 'pack-common'].filter(Boolean).join(' ') || undefined}>
                      {value ?? <NotCovered />}
                    </td>
                  );
                })}
                <td data-label="Merkle Arc" className={`pack-arc${row.arc ? '' : ' pack-no'}`}>
                  <ArcCell arc={row.arc} />
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}

/**
 * Add-on services: everything buyable on top of a pack — more of what a pack
 * already holds once its ceiling is reached, and the capabilities no pack
 * contains at all — with what each covers and what it costs.
 *
 * B2B, Subscriptions and Retail/POS were rows in the comparison, which put a
 * reader in front of three columns of "not in the base pack — its own scope
 * gate" and then asked them to work out that this meant it was for sale. They
 * are not pack scope and they are not a comparison; they are a price list, so
 * they are drawn as one and placed after the table rather than inside it.
 *
 * Deliberately not a table. The page's failure was three tables a reader could
 * not tell apart — a fourth grid under the one that survived would rebuild the
 * problem. A card carries a heading, a sentence of scope and a cost, which is
 * what buying one of these actually needs, and it cannot be mistaken for the
 * comparison above it.
 *
 * Costs here are ranges, not ceilings, and that is a deliberate break from the
 * table above it. A ceiling is the right figure for a pack, which is a closed
 * thing the client is buying whole. An add-on's floor is a real price a client
 * pays — "CHF 8k per further market" — and printing it as "up to CHF 86k"
 * quotes a client the eleventh market for their second one. The price band was
 * always going to render min–max; weeks read the same way beside it.
 *
 * Price is gated twice: the view strips it on the server for anyone who is not
 * an owner, and nothing here prints it without `pricing`. Weeks are not
 * commercial and travel to everyone.
 *
 * @param {{ addons?: object[], pricing: boolean, currency?: string,
 *   weeks: Function, band: Function }} props
 */
/**
 * One pack's closed scope, quantified, on that pack's own page.
 *
 * Shopify's own documented ceiling is deliberately NOT a column here. It is a
 * fact about the platform rather than about this offer, it lives on the index's
 * comparison table already, and it is long prose — on a phone it was 325px of
 * every row and it took this page from 16,000 to 27,500px on its own.
 *
 * The comparison table on the index answers "how do the three differ". A
 * consultant on one offer's page has already chosen, and needs the other
 * question: what exactly does THIS one hold, and up to what. That was a prose
 * list of claims, so "up to how many markets" had no answer anywhere on the
 * page that sells markets.
 *
 * On M and L it carries a second column: what the pack below holds. The rows
 * where the two differ are what the client is paying the step-up for, and they
 * are marked — on M, four of twenty-two rows.
 */
export function ScopeLimits({ rows = [], code, previous, gainsOnly = false }) {
  const mine = (r) => quantity(r.values?.[code]);
  const theirs = (r) => (previous ? quantity(r.values?.[previous.code]) : null);
  const held = rows.filter((r) => mine(r));
  /* Two readings of one dataset. The scope section wants every subject and one
     column; the step-up section wants only the subjects that grew, and both
     values, because "up to 1 market → up to 3 markets" is the answer and the
     new figure alone is not. */
  const kept = gainsOnly ? held.filter((r) => mine(r) !== theirs(r)) : held;
  if (!kept.length) return null;

  const groups = new Map();
  for (const row of kept) {
    const name = row.group ?? null;
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(row);
  }
  const cols = 3;

  /* Measured at 1440: the subject cell was 988px wide to hold 43px of text, so
     "Markets" and "Up to 1 market" sat 957px apart and the eye could not join
     them. A subject and its ceiling are a term and its definition, not a row of
     a table — as pairs they sit together and two columns of them use the width
     the table was spending on a gap. The step-up view stays a table: three
     values across is genuinely tabular. */
  if (!gainsOnly) {
    return (
      <dl className="limits-pairs">
        {[...groups].map(([name, groupRows]) => (
          <div key={name ?? 'all'} className="limits-group">
            {name ? <h4>{name}</h4> : null}
            <div className="limits-pair-grid">
              {groupRows.map((row) => (
                <div key={row.id} className="limits-pair">
                  <dt>
                    {row.what}
                    {row.addon?.includes(code) ? (
                      <span className="limits-addon">{row.addon_label ?? 'More can be bought on top'}</span>
                    ) : null}
                  </dt>
                  <dd>{mine(row)}</dd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <>
      <div className="table-scroll" role="region" tabIndex={0} aria-label="What this offer adds over the one below it">
        <table className={`compare limits${gainsOnly ? ' limits-gain' : ''}`}>
          <caption className="sr-only">
            {gainsOnly
              ? `Only the subjects where this offer holds more than ${previous.name}. The middle column is what ${previous.name} holds and the last is what this offer holds.`
              : 'One row per subject the discovery asks about, and the most this offer holds of it.'}
          </caption>
          <thead>
            <tr>
              <th scope="col">Subject</th>
              {gainsOnly ? <th scope="col" className="limits-from">{previous.name}</th> : null}
              <th scope="col">This offer holds</th>
            </tr>
          </thead>
          {[...groups].map(([name, groupRows]) => (
            <tbody key={name ?? 'all'}>
              {name ? (
                <tr className="pack-group">
                  <th scope="rowgroup" colSpan={cols}>{name}</th>
                </tr>
              ) : null}
              {groupRows.map((row) => (
                <tr key={row.id} className="limits-row">
                  <th scope="row">
                    <span className="pack-what">{row.what}</span>
                    {!gainsOnly && row.addon?.includes(code) ? (
                      <span className="limits-addon">{row.addon_label ?? 'More can be bought on top'}</span>
                    ) : null}
                  </th>
                  {gainsOnly ? (
                    <td data-label={previous.name} className="limits-from">
                      {theirs(row) ?? <span className="muted">Not in it</span>}
                    </td>
                  ) : null}
                  <td data-label="This offer holds"><span className="limits-value">{mine(row)}</span></td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </>
  );
}

/**
 * What can be bought on top of this pack, and what it adds to the weeks.
 *
 * The same catalogue the index draws as cards, which is right there and wrong
 * here: fifteen cards is a section nobody reaches the end of, and the question
 * on an offer page is narrower — what can I add, and how much longer does it
 * make the project. So: a table, ordered by what it adds, filtered to what
 * this pack can actually buy.
 */
export function AddonTable({ addons = [], code, pricing, currency, weeks, band }) {
  const mine = addons.filter((a) => (a.available_in ?? ['S', 'M', 'L']).includes(code));
  if (!mine.length) return null;

  /** "1–8 weeks · CHF 8k–86k", or just the weeks where price is not shown. */
  const cost = (w, pr) => {
    const parts = [];
    const span = w?.max ? weeks(w) : null;
    if (span) parts.push(`${span} week${w.max === 1 ? '' : 's'}`);
    if (pricing && pr) parts.push(band(pr, currency));
    return parts.length ? parts.join(' · ') : null;
  };

  /* Longest first. A consultant scanning for what moves a deadline is looking
     for the big ones, and alphabetical order hides them among the half-weeks. */
  const ordered = [...mine].sort((a, b) => (b.weeks?.max ?? 0) - (a.weeks?.max ?? 0));

  return (
    <div className="table-scroll" role="region" tabIndex={0} aria-label="What can be bought on top of this offer">
      <table className="compare addon-table">
        <caption className="sr-only">
          Every add-on this offer can buy, longest first. The weeks are added to the offer&rsquo;s own,
          once the scope-gate work the band already holds is used up.
        </caption>
        <thead>
          <tr>
            <th scope="col">Add-on</th>
            <th scope="col">Adds</th>
            {pricing ? <th scope="col">Internal</th> : null}
          </tr>
        </thead>
        <tbody>
          {ordered.map((a) => (
            <tr key={a.id}>
              <th scope="row">
                <span className="pack-what">{a.what}</span>
                {/* Nine of these are priced by which case the client is in, and
                    the headline span covers all of them — "+1–5.5 weeks" is
                    right for a third of engagements and wrong by a factor of
                    five for the rest. The breakdown used to live in the gates
                    section; that section is gone, so it lives here. */}
                {a.description || a.tiers?.length ? (
                  <details className="pack-why">
                    <summary>
                      {a.tiers?.length ? `What this covers — priced by case, ${a.tiers.length} tiers` : 'What this covers'}
                    </summary>
                    {a.description ? <p>{a.description}</p> : null}
                    {a.tiers?.length ? (
                      <dl className="addon-tiers-flat">
                        {a.tiers.map((t, i) => (
                          <div key={t.label ?? `tier-${i}`}>
                            <dt>
                              {t.label ? <span className="addon-tier-name">{t.label}</span> : null}
                              {t.description ? <span className="addon-tier-what">{t.description}</span> : null}
                            </dt>
                            <dd>{cost(t.weeks, t.price) ?? <span className="muted">Quoted per engagement</span>}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}
                  </details>
                ) : null}
              </th>
              <td data-label="Adds">
                {a.weeks?.max
                  ? <span className="addon-weeks">+{weeks(a.weeks)} week{a.weeks.max === 1 ? '' : 's'}</span>
                  : <span className="muted">Scoped per engagement</span>}
              </td>
              {pricing ? (
                <td data-label="Internal">
                  {a.price ? <span className="addon-band">{band(a.price, currency)}</span> : <span className="muted">&mdash;</span>}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AddonList({ addons, pricing, currency, weeks, band }) {
  if (!addons?.length) return null;

  /** "S, M and L" — where this one can be bought. */
  const packs = (codes) => {
    const list = codes ?? [];
    if (list.length < 2) return list.join('');
    return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
  };
  /** "1–8 weeks · CHF 8k–86k", or just the weeks for a reader who may not see price. */
  const cost = (w, p) => {
    const parts = [];
    const span = weeks ? weeks(w) : upToWeeks(w);
    if (span && span !== '—') parts.push(`${span} week${w?.max === 1 ? '' : 's'}`);
    if (pricing && p) parts.push(band(p, currency));
    return parts.length ? parts.join(' · ') : null;
  };

  return (
    <ul className="addons">
      {addons.map((a) => {
        const headline = cost(a.weeks, a.price);
        return (
          <li key={a.id} className="addon">
            <h3>{a.what}</h3>
            {a.available_in?.length ? (
              <p className="addon-where">Bought on top of {packs(a.available_in)}</p>
            ) : null}
            {a.description ? <p className="addon-what">{a.description}</p> : null}
            {a.note ? <p className="addon-note">{a.note}</p> : null}
            {headline ? (
              <p className="addon-cost">
                <span className="addon-cost-label">Adds</span>
                <span className="addon-cost-figure">{headline}</span>
              </p>
            ) : (
              <p className="addon-cost"><span className="addon-cost-label">Adds</span> <span className="muted">Scoped per engagement</span></p>
            )}
            {/* Nine of these are priced by which case the client is in, and
                every case carries its own paragraph of scope. Printed flat that
                is three paragraphs a card and the section becomes the wall the
                table just stopped being — so the breakdown is a disclosure and
                the headline span above it is what the card shows at rest. */}
            {a.tiers?.length ? (
              <details className="addon-tiers">
                <summary>Priced by case — {a.tiers.length} tiers</summary>
                <dl>
                  {a.tiers.map((t, i) => (
                    <div key={t.label ?? `tier-${i}`}>
                      <dt>
                        {t.label ? <span className="addon-tier-name">{t.label}</span> : null}
                        {t.description ? <span className="addon-tier-what">{t.description}</span> : null}
                      </dt>
                      <dd>{cost(t.weeks, t.price) ?? <span className="muted">Quoted per engagement</span>}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
