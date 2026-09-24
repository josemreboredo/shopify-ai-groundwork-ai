import { Link } from 'react-router';

import { requireUser } from '../auth.server.js';
import { addonsView } from '../../../ai/shared/addons-view.js';
import { pageTitle } from '../brand.js';
import { band, chf, chfSpan, weeks, weeksNear } from '../offering.js';
import { OfferingNav } from '../components/offering-nav.jsx';

export const meta = () => [{ title: pageTitle('Add-on services') }];

/**
 * Every add-on service in time and cost, in each pack. Signed-in only, and
 * every signed-in consultant reads the francs — the same decision as the
 * offering pages (see offering.jsx), with the same caveat while sign-in stays
 * open.
 *
 * The add-ons used to sit on every offer page as a list with one figure each,
 * which was right for one pack and wrong for the other two: a market, a store
 * or an integration is more work in L than in S. One table, one column per
 * pack, answers the question the lists could not — what does this add to the
 * pack we are talking about.
 */
export async function loader({ request }) {
  const user = await requireUser(request);
  return { view: addonsView({ pricing: Boolean(user) }) };
}

/** "2–3 design days", "1 design day". */
const dayCount = (r, noun) => `+ ${r.min === r.max ? r.min : `${r.min}–${r.max}`} ${noun}${r.max === 1 ? '' : 's'}`;

/** What sits under a figure: what the pack already includes, or what it needs first. */
function asides(c) {
  return [
    c.after_go_live ? 'after go-live' : null,
    c.included ? `past the ${c.included.count} ${c.included.noun} included` : null,
    c.on_top_of ? `on top of ${c.on_top_of}` : null,
    c.instead_of ? `instead of ${c.instead_of}` : null,
    c.system_days ? dayCount(c.system_days, 'design system day') : null,
    c.design_days ? dayCount(c.design_days, 'design day') : null,
  ].filter(Boolean);
}

/**
 * One pack's cells in one row: the time and the cost, or one cell saying why
 * there is neither. A pack that does not sell the add-on, or already holds it,
 * is a statement across both columns rather than two dashes.
 */
function Cells({ cell, pack, pricing, currency }) {
  const span = pricing ? 2 : 1;
  // Read only when the table stacks on a phone, where the column heads are gone.
  const label = `${pack.code} · ${pack.name.replace(/^Ecommerce\s+/, '')}`;
  if (cell.state === 'not_sold') {
    return <td colSpan={span} data-label={label} className="addon-state addon-no">Not sold</td>;
  }
  if (cell.state === 'included' || cell.state === 'carried') {
    return (
      <td colSpan={span} data-label={label} className="addon-state addon-in">
        {cell.state === 'included' ? 'Included' : `With ${cell.by}`}
      </td>
    );
  }
  const time = cell.after_go_live ? `+${cell.after_go_live.days} days` : `+${weeksNear(cell.weeks)} wk`;
  return (
    <>
      <td data-label={label} className="addon-time">
        <span className="addon-figure">{time}</span>
        {asides(cell).map((a) => <span key={a} className="addon-aside">{a}</span>)}
      </td>
      {pricing ? <td className="addon-cost">{chfSpan(cell.price, currency)}</td> : null}
    </>
  );
}

/** What the add-on covers, its tiers and its conditions, shut until asked for. */
function Covers({ addon }) {
  const tiers = addon.rows.filter((r) => r.tier);
  if (!addon.description && !addon.note && !tiers.length) return null;
  return (
    <details className="pack-why">
      <summary>What this covers</summary>
      {addon.description ? <p>{addon.description}</p> : null}
      {tiers.length ? (
        <dl className="addon-tier-notes">
          {tiers.map((r) => (
            <div key={r.id}>
              <dt>{r.label}</dt>
              <dd>{r.description}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {addon.note ? <p>{addon.note}</p> : null}
    </details>
  );
}

function AddonMatrix({ view }) {
  const { packs, pricing, currency } = view;
  const cols = 1 + packs.length * (pricing ? 2 : 1);
  const cells = (row) => packs.map((p) => <Cells key={p.code} cell={row.cells[p.code]} pack={p} pricing={pricing} currency={currency} />);
  return (
    <div className="table-scroll" role="region" tabIndex={0} aria-label="Every add-on service in time and cost, per pack">
      <table className="compare addon-matrix">
        <caption className="sr-only">
          Every add-on service, with the build weeks it adds and{pricing ? ' what it costs' : ''} in each pack. A pack that
          already holds the add-on says so; a pack that does not sell it says so.
        </caption>
        <colgroup>
          <col className="addon-col-what" />
          {packs.map((p) => (pricing
            ? [<col key={`${p.code}-t`} className="addon-col-time" />, <col key={`${p.code}-c`} className="addon-col-cost" />]
            : <col key={p.code} className="addon-col-time" />))}
        </colgroup>
        <thead>
          <tr>
            <th scope="col" rowSpan={pricing ? 2 : 1}>Add-on service</th>
            {packs.map((p) => (
              <th key={p.code} scope="colgroup" colSpan={pricing ? 2 : 1} className="addon-pack">
                <span className="pack-code">{p.code}</span>
                <span className="pack-name">{p.name}</span>
              </th>
            ))}
          </tr>
          {pricing ? (
            <tr className="addon-units">
              {packs.map((p) => [
                <th key={`${p.code}-t`} scope="col">Time</th>,
                <th key={`${p.code}-c`} scope="col">Cost</th>,
              ])}
            </tr>
          ) : null}
        </thead>
        {view.groups.map((g) => (
          <tbody key={g.title}>
            <tr className="pack-group"><th colSpan={cols} scope="rowgroup">{g.title}</th></tr>
            {g.addons.map((a) => (a.rows.length > 1 ? [
              <tr key={a.id} className="addon-head">
                <th colSpan={cols} scope="rowgroup">
                  <span className="pack-what">{a.what}</span>
                  <Covers addon={a} />
                </th>
              </tr>,
              ...a.rows.map((r) => (
                <tr key={r.id} className="addon-row addon-tier">
                  <th scope="row"><span className="sr-only">{a.what}: </span>{r.label}</th>
                  {cells(r)}
                </tr>
              )),
            ] : (
              <tr key={a.id} className="addon-row">
                <th scope="row">
                  <span className="pack-what">{a.what}</span>
                  <Covers addon={a} />
                </th>
                {cells(a.rows[0])}
              </tr>
            )))}
          </tbody>
        ))}
      </table>
    </div>
  );
}

export default function Addons({ loaderData }) {
  const { view } = loaderData;
  const { currency } = view;
  const count = view.groups.reduce((n, g) => n + g.addons.length, 0);
  return (
    <main id="main" className="story offering addons-page">
      <header className="page-head">
        <OfferingNav packs={view.packs} />
        <p className="eyebrow">Internal · signed-in consultants</p>
        <h1>Add-on services</h1>
        <p className="answer-line">What each add-on adds to each pack, in weeks{view.pricing ? ' and in francs' : ''}.</p>
        <p className="lede">
          The same add-on is not the same work in every pack. A further market meets a configured theme in S and a full
          template set to re-test in L; an integration in L is wired again in each of its stores. So every cell is the
          engine&rsquo;s own figure: the pack&rsquo;s promise with the add-on, less the promise without it.
        </p>
        <ul className="stats">
          <li><strong>{count}</strong><span>add-on services, from a further market to a further week of hypercare</span></li>
          <li><strong>{view.packs.length} packs</strong><span>each add-on priced against each pack&rsquo;s own promise</span></li>
          {view.pricing
            ? <li><strong>{chf(view.weekly_cost, currency)}</strong><span>one build week — the price of every week below, internal</span></li>
            : <li><strong>One rate</strong><span>every week below costs the same</span></li>}
        </ul>
        <p className="callout estimate-note">{view.estimate} <Link to="/offering/estimation">How we estimate →</Link></p>
      </header>

      <section id="table">
        <h2>Every add-on, pack by pack</h2>
        <p className="lede">
          Time is build weeks of the team, added to the pack&rsquo;s own; hypercare runs after go-live and adds none.
          {view.pricing ? ' Cost is those weeks at the one weekly rate, plus the design days an add-on carries at the design day.' : ' An add-on that needs design says how many design days it carries.'}
          {' '}Per-unit add-ons are priced for one more unit; tiered ones for the case the client is in.
        </p>
        <AddonMatrix view={view} />
        {view.pricing ? (
          <p className="callout"><strong>Internal pricing.</strong> These prices are Merkle&rsquo;s commercial position and never appear in a client document.</p>
        ) : (
          <p className="muted small">Weeks are the high-level estimate. Costs are shown to engagement leads.</p>
        )}
      </section>

      <section id="reading">
        <h2>How to read a cell</h2>
        <ul className="ticks">
          <li><strong>Included</strong> — the pack&rsquo;s promise already holds it, so buying it adds nothing.</li>
          <li><strong>Not sold</strong> — the pack does not carry it: a second store makes S an M, and a seventh language is a separate discovery. The reason is under &ldquo;What this covers&rdquo;.</li>
          <li><strong>With a further market</strong> — another add-on brings it at no price of its own.</li>
          <li>
            An estimate is named after the largest pack its total reaches, so enough bought on top of S is quoted as an M,
            with M&rsquo;s hypercare and app allowance. The add-ons do not change; the name does.
          </li>
        </ul>
        <p className="callout">
          {view.replatform.name} with a replatform from {view.replatform.from}: <strong>{weeks(view.replatform.weeks)} weeks</strong>
          {view.pricing && view.replatform.price_band ? <> · <strong>{band(view.replatform.price_band, currency)}</strong></> : null}
          {' '}— the pack&rsquo;s own promise with a heavy migration beside it, the figure a client compares with a
          competitor&rsquo;s replatform quote.
        </p>
      </section>
    </main>
  );
}
