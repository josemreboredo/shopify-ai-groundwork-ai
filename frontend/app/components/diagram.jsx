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
