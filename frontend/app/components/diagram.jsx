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
            <p className="phase-weeks">
              <span className="phase-bar" style={{ inlineSize: `${Math.max((p.weeks.max / longest) * 100, 6)}%` }} aria-hidden="true" />
              <b>{span(p.weeks)}</b> <span className="muted small">week{p.weeks.max === 1 ? '' : 's'}</span>
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
          <p className="phase-weeks"><b>{span(weeks)}</b> <span className="muted small">weeks</span></p>
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
 * How the storefront is built, where the offer builds it more than one way.
 *
 * The track used to be a property of the offer, which told a headless
 * engagement it was getting a theme. It is an answer: Ecommerce Growth builds
 * either way and spends the same weeks differently, exactly as it does per
 * channel.
 *
 * @param {{ tracks: {liquid: string, hydrogen: string} }} props
 */
export function Tracks({ tracks }) {
  if (!tracks) return null;
  const rows = [
    ['Shopify theme', tracks.liquid],
    ['Headless · Hydrogen', tracks.hydrogen],
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
export function ScopeTable({ catalogue, totals, capacity, offerCode }) {
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
        <table className="compare scope-table">
          <thead>
            <tr>
              <th scope="col">Story</th>
              <th scope="col">What it delivers</th>
              <th scope="col">In the price when</th>
              <th scope="col">Adds</th>
            </tr>
          </thead>
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
                  {/* A group header, not a data row: the epic, what it covers and
                      how its stories divide, before the stories themselves. */}
                  <th scope="rowgroup" colSpan={4}>
                    <span className="epic-name">{epic.name}</span>
                    <span className="epic-meta">
                      {epic.summary} · {epic.always.length} always · {epic.conditional.length} on the answers · {gated.length} gated
                    </span>
                  </th>
                </tr>
                {rows.map((s) => (
                  <tr key={s.key} className={`scope-row scope-${s.when}`}>
                    <td data-label="Story"><span className="scope-key">{s.key}</span></td>
                    <td data-label="What it delivers">{s.label}</td>
                    <td data-label="In the price when">
                      {s.when === 'always' ? <span className="scope-when is-always">Always</span> : null}
                      {s.when === 'answers' ? <><span className="scope-when is-answers">The answers say so</span> <Decided questions={s.decided_by} /></> : null}
                      {s.when === 'gate' ? <span className="scope-when is-gated">{s.gate.label} gate</span> : null}
                    </td>
                    <td data-label="Adds">
                      {s.when === 'gate' && s.firstOfGate && gateWeeks(s.gate.effort_weeks)
                        ? <span className="scope-cost">{gateWeeks(s.gate.effort_weeks)}</span>
                        : <span className="muted">{s.when === 'gate' ? '↳ same gate' : '—'}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            );
          })}
        </table>
      </div>

      <p className="muted small">
        A gate adds its weeks once, however many stories it carries — the column repeats the gate, not the cost.
        {offerCode === 'S'
          ? ' One gate stays in this offer, priced with its modifier; two or more make it an M, and the epics come with it.'
          : ' Inside the capacity above a gate costs nothing more; past it, it is added to the weeks and to the band.'}
        {' '}Each gate&rsquo;s exact condition is below, under the gates.
      </p>
    </div>
  );
}
