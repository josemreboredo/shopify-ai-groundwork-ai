/**
 * Where the complexity sits, as a shape.
 *
 * Inline SVG rather than a charting library: the app has no dependency beyond
 * what it needs to run, and a radar is trigonometry and a polygon. It also keeps
 * the chart inside the design system — square surfaces, one red accent — instead
 * of inheriting a library's palette.
 *
 * Three rings and no more, because the scale behind it has three levels and a
 * chart that draws ten gradations off three real ones is inventing nine.
 */

const RINGS = [
  { at: 1, label: 'What our offers cover' },
  { at: 2, label: 'Beyond them' },
];

const point = (cx, cy, radius, i, n, value, max) => {
  // Twelve o'clock, then clockwise, so the first axis reads where the eye starts.
  const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
  const r = (value / max) * radius;
  return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
};

const path = (pts) => `${pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')}Z`;

/**
 * Labels onto at most two lines.
 *
 * The axes at three and nine o'clock carry the longest names and run straight
 * out of the viewBox — "B2B / Wholesale" and "Multi-currency" were arriving as
 * "B2B / WHO" and "MULTI-CURRENC". Padding alone would push the chart into a
 * stamp, so the long ones break instead, on a space where there is one and on
 * the hyphen where there is not.
 */
function wrap(label) {
  if (label.length <= 12) return [label];
  const bySpace = label.split(' ');
  if (bySpace.length > 1) {
    const half = Math.ceil(bySpace.length / 2);
    return [bySpace.slice(0, half).join(' '), bySpace.slice(half).join(' ')];
  }
  const cut = label.lastIndexOf('-');
  return cut > 2 ? [label.slice(0, cut + 1), label.slice(cut + 1)] : [label];
}

/**
 * @param {{ axes: Array<{ label: string, level: number, standing: string }>, max?: number, size?: number }} props
 */
export function Radar({ axes, max = 2, size = 320 }) {
  if (!axes?.length) return null;
  // Room for the labels, not for the chart: the widest sit left and right.
  const padX = 132;
  const padY = 58;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 12;
  const n = axes.length;

  const shape = axes.map((a, i) => point(cx, cy, radius, i, n, a.level, max));
  const covered = axes.map((_, i) => point(cx, cy, radius, i, n, 1, max));

  return (
    <figure className="radar">
      <svg viewBox={`${-padX} ${-padY} ${size + padX * 2} ${size + padY * 2}`} role="img" aria-label="Where the complexity sits, by dimension">
        {RINGS.map((ring) => (
          <polygon
            key={ring.at}
            className={ring.at === 1 ? 'radar-covered' : 'radar-ring'}
            points={axes.map((_, i) => point(cx, cy, radius, i, n, ring.at, max).join(',')).join(' ')}
          />
        ))}
        {axes.map((a, i) => {
          const [x, y] = point(cx, cy, radius, i, n, max, max);
          return <line key={a.label} className="radar-spoke" x1={cx} y1={cy} x2={x} y2={y} />;
        })}

        {/* An axis with nothing behind it is not a zero. Drawing it as one told a
            reader the document had settled something it never mentioned. */}
        {axes.map((a, i) => {
          if (a.known !== false) return null;
          const [x, y] = point(cx, cy, radius, i, n, 1, max);
          return <circle key={`unknown-${a.label}`} className="radar-unknown" cx={x} cy={y} r={5} />;
        })}

        {/* What a standard offer covers, and what this engagement actually is. */}
        <path className="radar-envelope" d={path(covered)} />
        <path className="radar-shape" d={path(shape)} />

        {axes.map((a, i) => {
          const [x, y] = point(cx, cy, radius + 22, i, n, max, max);
          const anchor = Math.abs(x - cx) < 6 ? 'middle' : x > cx ? 'start' : 'end';
          const lines = wrap(a.label);
          const top = y - ((lines.length - 1) * 13) / 2;
          return (
            <text
              key={a.label}
              className={`radar-label ${a.level === 2 ? 'beyond' : a.known === false ? 'unknown' : a.level === 0 ? 'idle' : ''}`}
              x={x}
              y={top}
              textAnchor={anchor}
              dominantBaseline="middle"
            >
              {lines.map((line, k) => (
                <tspan key={line} x={x} dy={k ? 13 : 0}>
                  {line}{k === lines.length - 1 && a.known === false ? ' ?' : ''}
                </tspan>
              ))}
            </text>
          );
        })}
      </svg>
      <figcaption>
        <span className="radar-key covered" /> What our offers cover
        <span className="radar-key shape" /> This bid
        {axes.some((a) => a.known === false) ? <><span className="radar-key unknown" /> Nothing said either way</> : null}
      </figcaption>
    </figure>
  );
}
