import { Link } from 'react-router';

import { requireUser } from '../auth.server.js';
import { estimationView } from '../../../ai/shared/estimation-view.js';
import { pageTitle } from '../brand.js';
import { band, chf, chfSpan, weeks, weeksNear } from '../offering.js';
import { OfferingNav } from '../components/offering-nav.jsx';

export const meta = () => [{ title: pageTitle('How we estimate') }];

/**
 * How an estimate is built: the team behind a build week, what that week costs,
 * and the packs worked through by the engine itself. Signed-in only, and every
 * signed-in consultant reads the francs — the same decision as the offering
 * pages (see offering.jsx), with the same caveat while sign-in stays open.
 *
 * Built from the site's own components and nothing else. The first version
 * borrowed three class names that already meant something — the headline
 * statement, a two-column numbered list and a quotation — and rendered two
 * sentences at headline size and five steps in a 76px column.
 */
export async function loader({ request }) {
  const user = await requireUser(request);
  return { view: estimationView({ pricing: Boolean(user) }) };
}

const pct = (n) => `${Math.round(n * 100)}%`;

export default function Estimation({ loaderData }) {
  const { view } = loaderData;
  const { currency } = view;
  const [S] = view.packs;
  const app = weeksNear({ min: view.app_weeks, max: view.app_weeks });

  /* The five moves from the answers to a figure, in the order they happen. */
  const STEPS = [
    ['The Foundation build', `Every estimate starts here: the store, the theme configured, apps, catalogue, quality and launch — ${weeks(S.weeks)} weeks.`],
    ['Each gate the answers open', 'A further market, an integration, a migration, bespoke sections: each is weeks of the team at the weekly cost, and the design it needs by the design day.'],
    ['The pack’s hypercare and apps', `${view.packs.map((p, i) => (i === 0 ? `${p.code} carries ${p.hypercare_days} days of hypercare and ${p.apps_included} apps` : `${p.code} ${p.hypercare_days} and ${p.apps_included}`)).join(', ')}. More of either is priced on top.`],
    ['The name', 'The largest pack whose budget the estimate reaches, plus what goes past its scope as add-ons: “Ecommerce Scale plus a further store”.'],
    ['The final figure', 'The delivery team estimates the approach from the closed scope; the commercial team adds contingency and design.'],
  ];

  return (
    <main id="main" className="story offering estimation">
      <header className="page-head">
        <OfferingNav packs={view.packs} />
        <p className="eyebrow">Internal · signed-in consultants</p>
        <h1>How we estimate</h1>
        <p className="answer-line">Every estimate is weeks of one delivery team, at one weekly cost.</p>
        <p className="lede">
          The discovery answers decide which pieces of work a build needs. Each piece is measured in weeks of the same
          team, so an estimate is the Foundation build plus the weeks each piece adds, at what a week of that team costs.
        </p>
        <ul className="stats">
          <li><strong>≈{view.people} people</strong><span>full time in every build week, offshore</span></li>
          <li><strong>{view.person_days}</strong><span>person-days in a build week</span></li>
          {view.pricing
            ? <li><strong>{chf(view.weekly_cost, currency)}</strong><span>one build week — internal, never in a client document</span></li>
            : <li><strong>One rate</strong><span>every week of work costs the same</span></li>}
        </ul>
        <p className="callout estimate-note">{view.estimate}</p>
      </header>

      <section id="team">
        <h2>The team behind a build week</h2>
        <p className="lede">
          One calendar week of the delivery team. Every pack, every add-on and every re-estimate is counted in these
          weeks, so the team is what a client is buying: people and their time, not a package.
        </p>
        <div className="table-scroll" role="region" tabIndex={0} aria-label="The team in one build week">
          <table className="compare team-table">
            <thead>
              <tr>
                <th scope="col">Role</th>
                <th scope="col">Allocation</th>
                <th scope="col">Days in a week</th>
                <th scope="col">Share of the week</th>
              </tr>
            </thead>
            <tbody>
              {view.team.map((t) => (
                <tr key={t.role}>
                  <th scope="row">{t.role}</th>
                  <td data-label="Allocation">{t.fte} FTE</td>
                  <td data-label="Days in a week">{t.days_per_week}</td>
                  <td data-label="Share of the week">
                    <span className="alloc" aria-hidden="true"><span style={{ width: pct(t.share) }} /></span>
                    {pct(t.share)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">The team</th>
                <td data-label="Allocation">{view.people} FTE</td>
                <td data-label="Days in a week">{view.person_days}</td>
                <td data-label="Share of the week">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <ul className="ticks estimation-notes">
          <li>Developers build and configure: front end for templates, sections and the checkout, back end for integrations, data and apps.</li>
          <li>QA is part of the team, not a service added on top: test cases, regression and the release checks every pack carries.</li>
          <li>The project manager, business analyst and solution architect give a share of each week — enough to run it, specify it and decide its design, not a second team.</li>
          <li>Design is not in the week. A {view.designer.sourcing} {view.designer.role.toLowerCase()} designs the storefront, priced by the design day, because most pieces of work need no design at all. On a Hydrogen storefront a {view.system_architect.role.toLowerCase()} works alongside: {view.system_architect.does.charAt(0).toLowerCase() + view.system_architect.does.slice(1)}.</li>
        </ul>
      </section>

      <section id="week">
        <h2>What a week costs</h2>
        <p className="lede">
          One rate prices everything, so no piece of work is cheaper or dearer per week than another. Every add-on is
          its weeks at this cost.
        </p>
        <ul className="stats kpis kpis-4">
          <li>
            <strong>{view.pricing ? chf(view.weekly_cost, currency) : '1 week'}</strong>
            <span>One build week of the whole team{view.pricing ? ' — internal, never in a client document' : ''}</span>
          </li>
          <li>
            <strong>{view.pricing ? `${currency} ${view.design_day}` : '1 day'}</strong>
            <span>One design day, of the {view.designer.sourcing} {view.designer.role.toLowerCase()} or the {view.system_architect.role.toLowerCase()}: S {view.packs[0].design_days.min}–{view.packs[0].design_days.max} days, M {view.packs[1].design_days.min}–{view.packs[1].design_days.max}, L {view.packs[2].design_days.min}–{view.packs[2].design_days.max}, and the days each design add-on carries</span>
          </li>
          <li>
            <strong>{view.pricing ? chf(view.hypercare_week, currency) : pct(view.hypercare_share)}</strong>
            <span>A week of hypercare after go-live, at {pct(view.hypercare_share)} of a build week: a named channel and a response within a working day, not the team building</span>
          </li>
          <li>
            <strong>{view.pricing ? chf(view.app_cost, currency) : `${app} week`}</strong>
            <span>Each third-party app past a pack&rsquo;s allowance, {app} of a week — and every app is set up again in each further store</span>
          </li>
        </ul>
        <p className="muted small">
          Added in the proposal, and in no estimate here: contingency, the Shopify plan and every app&rsquo;s own
          monthly licence.
        </p>
      </section>

      <section id="build">
        <h2>From the answers to an estimate</h2>
        <div className="flow flow-5">
          {STEPS.map(([title, line], i) => (
            <article key={title}>
              <p className="flow-n">{String(i + 1).padStart(2, '0')}</p>
              <h3>{title}</h3>
              <p>{line}</p>
            </article>
          ))}
        </div>
        <h3 className="sub">What each pack holds, in weeks and team days</h3>
        <div className="table-scroll" role="region" tabIndex={0} aria-label="What each pack holds, in weeks and team days">
          <table className="compare packs-table">
            <thead>
              <tr>
                <th scope="col">Pack</th>
                <th scope="col">Weeks</th>
                <th scope="col">Person-days</th>
                <th scope="col">Design days</th>
                <th scope="col">Hypercare</th>
                <th scope="col">Apps included</th>
                {view.pricing ? <th scope="col">Band</th> : null}
              </tr>
            </thead>
            <tbody>
              {view.packs.map((p) => (
                <tr key={p.code}>
                  <th scope="row">{p.code} · {p.name}</th>
                  <td data-label="Weeks">{weeks(p.weeks)}</td>
                  <td data-label="Person-days">{Math.round(p.weeks.min * view.person_days)}–{Math.round(p.weeks.max * view.person_days)}</td>
                  <td data-label="Design days">{weeks(p.design_days)}</td>
                  <td data-label="Hypercare">{p.hypercare_days} days</td>
                  <td data-label="Apps included">{p.apps_included}</td>
                  {view.pricing ? <td data-label="Band">{band(p.price_band, currency)}</td> : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="examples">
        <h2>Worked examples</h2>
        <p className="lede">
          Each is the engine&rsquo;s own quote on the scope a pack promises, line by line. The lines add up to the
          estimate before it is rounded to the nearest thousand.
        </p>
        <div className="worked">
          {view.examples.map((x) => (
            <article key={x.title} className="worked-example">
              <h3>{x.title}</h3>
              <p className="muted small">{x.lead}</p>
              <table className="compare example-table">
                <thead>
                  <tr>
                    <th scope="col">Work</th>
                    <th scope="col">Weeks</th>
                    {view.pricing ? <th scope="col">{currency}</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {x.lines.map((l) => (
                    <tr key={l.what}>
                      <th scope="row">{l.what}</th>
                      <td data-label="Weeks">{l.after_go_live ? 'after go-live' : l.design ? 'alongside' : weeksNear(l.weeks)}</td>
                      {view.pricing ? <td data-label={currency}>{chfSpan(l.price, currency)}</td> : null}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th scope="row">{x.code} · {x.name}{x.addons.length ? ` + ${x.addons.map((a) => a.charAt(0).toLowerCase() + a.slice(1)).join(', ')}` : ''}</th>
                    <td data-label="Weeks">{weeks(x.weeks)}</td>
                    {view.pricing ? <td data-label={currency}>{band(x.price_band, currency)}</td> : null}
                  </tr>
                </tfoot>
              </table>
            </article>
          ))}
        </div>
      </section>

      <section id="calibration">
        <h2>Checked against a real estimation</h2>
        <p className="lede">{view.calibration.note}</p>
        <ul className="stats kpis kpis-3">
          <li><strong>{view.calibration.estimate_developer_days}</strong><span>developer days in the estimation</span></li>
          <li><strong>{pct(view.calibration.estimate_qa_share)}</strong><span>QA on top of development</span></li>
          <li><strong>{weeks(view.calibration.engine_weeks)}</strong><span>weeks the engine quotes for the same answers</span></li>
        </ul>
      </section>

      <section>
        <p className="muted small">
          The team, the weekly cost, the hypercare share and the app allowance live in the offering data, and every band
          is derived from them: change the team or the week and every pack and every add-on moves with it. The decision
          and its history are in ADR 0019. See <Link to="/offering">the offering</Link> for what each pack holds, and{' '}
          <Link to="/offering/add-ons">the add-on services</Link> for what each add-on adds to it.
        </p>
      </section>
    </main>
  );
}
