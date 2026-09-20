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
 * @param {{ axes: Array<{ label: string, level: number, standing: string }>, max?: number, size?: number }} props
 */
export function Radar({ axes, max = 2, size = 320 }) {
  if (!axes?.length) return null;
  const pad = 74;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 12;
  const n = axes.length;

  const shape = axes.map((a, i) => point(cx, cy, radius, i, n, a.level, max));
  const covered = axes.map((_, i) => point(cx, cy, radius, i, n, 1, max));

  return (
    <figure className="radar">
      <svg viewBox={`${-pad} ${-pad} ${size + pad * 2} ${size + pad * 2}`} role="img" aria-label="Where the complexity sits, by dimension">
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

        {/* What a standard offer covers, and what this engagement actually is. */}
        <path className="radar-envelope" d={path(covered)} />
        <path className="radar-shape" d={path(shape)} />

        {axes.map((a, i) => {
          const [x, y] = point(cx, cy, radius + 26, i, n, max, max);
          const anchor = Math.abs(x - cx) < 6 ? 'middle' : x > cx ? 'start' : 'end';
          return (
            <text key={a.label} className={`radar-label ${a.level === 2 ? 'beyond' : a.level === 0 ? 'idle' : ''}`} x={x} y={y} textAnchor={anchor} dominantBaseline="middle">
              {a.label}
            </text>
          );
        })}
      </svg>
      <figcaption>
        <span className="radar-key covered" /> What our offers cover
        <span className="radar-key shape" /> This bid
      </figcaption>
    </figure>
  );
}
