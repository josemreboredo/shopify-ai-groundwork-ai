import { Link } from 'react-router';

import { requireUser } from '../auth.server.js';
import { estimationView } from '../../../ai/shared/estimation-view.js';
import { pageTitle } from '../brand.js';
import { band, weeks } from '../offering.js';

export const meta = () => [{ title: pageTitle('How we estimate') }];

/**
 * How an estimate is built: the team behind a build week, what that week costs,
 * and the packs worked through by the engine itself. Signed-in only, and every
 * signed-in consultant reads the francs — the same decision as the offering
 * pages (see offering.jsx), with the same caveat while sign-in stays open.
 */
export async function loader({ request }) {
  const user = await requireUser(request);
  return { view: estimationView({ pricing: Boolean(user) }) };
}

/** "CHF 6.3k", one figure. */
const chf = (n, currency) => `${currency} ${(Math.round(n / 100) / 10).toString()}k`;
/** A span of francs, or one figure when it is fixed. */
const span = (r, currency) => (r.min === r.max ? chf(r.min, currency) : `${chf(r.min, currency)}–${(Math.round(r.max / 100) / 10).toString()}k`);
const pct = (n) => `${Math.round(n * 100)}%`;
/* Gate weeks carry per-unit surcharges ("1.755"); a tenth of a week is as
   precise as a consultant can say out loud. */
const tenth = (n) => Math.round(n * 10) / 10;
const wk = (w) => (w ? weeks({ min: tenth(w.min), max: tenth(w.max) }) : '—');

export default function Estimation({ loaderData }) {
  const { view } = loaderData;
  const { currency } = view;
  return (
    <main id="main" className="story offering estimation">
      <header className="page-head">
        <Link to="/offering" className="crumb">← The offering</Link>
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
                <td>{view.people} FTE</td>
                <td>{view.person_days}</td>
                <td>100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <ul className="ticks">
          <li>Developers build and configure: front end for templates, sections and the checkout, back end for integrations, data and apps.</li>
          <li>QA is part of the team, not a service added on top: test cases, regression and the release checks every pack carries.</li>
          <li>The project manager, business analyst and solution architect give a share of each week — enough to run it, specify it and decide its design, not a second team.</li>
        </ul>
      </section>

      <section id="week">
        <h2>What a week costs</h2>
        {view.pricing ? (
          <p className="answer-line">
            One build week of the team costs <strong>{chf(view.weekly_cost, currency)}</strong>: the team above at the
            offshore rate card, converted to Swiss francs. It is internal and never reaches a client document.
          </p>
        ) : (
          <p className="answer-line">One build week of the team costs the same for every piece of work. The figure is shown to signed-in consultants.</p>
        )}
        <ul className="ticks">
          <li>Every add-on is priced as its weeks at that cost, so no piece of work is cheaper or dearer per week than another.</li>
          <li>Hypercare after go-live is {pct(view.hypercare_share)} of a build week per week{view.pricing ? ` (${chf(view.hypercare_week, currency)})` : ''}: a named channel and a response within a working day, not the team building.</li>
          <li>Each third-party app past what a pack includes is {view.app_weeks === 0.125 ? 'an eighth' : view.app_weeks} of a week{view.pricing ? ` (${chf(view.app_cost, currency)})` : ''}, and every app is set up again in each further store.</li>
        </ul>
        <p className="muted small">
          Not in the week, and added in the proposal: design creation (UX and UI in Figma), contingency, the Shopify
          plan and every app&rsquo;s own monthly licence.
        </p>
      </section>

      <section id="build">
        <h2>From the answers to an estimate</h2>
        <ol className="steps">
          <li><strong>The Foundation build.</strong> Every engagement starts with it: the store, the theme configured, apps, catalogue, quality and launch — {weeks(view.packs[0].weeks)} weeks.</li>
          <li><strong>Each scope gate the answers open adds its weeks.</strong> A second market, an integration, a migration, bespoke sections — each measured in weeks of the team and priced at the weekly cost.</li>
          <li><strong>The pack&rsquo;s hypercare and apps.</strong> {view.packs.map((p) => `${p.code} carries ${p.hypercare_days} working days of hypercare and ${p.apps_included} apps`).join('; ')}. More of either is priced on top.</li>
          <li><strong>The name.</strong> The estimate is named after the largest pack whose budget it reaches, and whatever goes past that pack&rsquo;s scope is listed as add-ons — &ldquo;Ecommerce Scale plus a further store&rdquo;.</li>
          <li><strong>The final figure.</strong> The delivery team estimates the approach from the closed scope, and the commercial team adds contingency and design.</li>
        </ol>
        <div className="table-scroll" role="region" tabIndex={0} aria-label="What each pack holds, in weeks and team days">
          <table className="compare">
            <thead>
              <tr>
                <th scope="col">Pack</th>
                <th scope="col">Weeks</th>
                <th scope="col">Person-days</th>
                <th scope="col">Hypercare</th>
                <th scope="col">Apps included</th>
                {view.pricing ? <th scope="col">Band</th> : null}
              </tr>
            </thead>
            <tbody>
              {view.packs.map((p) => (
                <tr key={p.code}>
                  <th scope="row">{p.code} · {p.name}</th>
                  <td>{weeks(p.weeks)}</td>
                  <td>{Math.round(p.weeks.min * view.person_days)}–{Math.round(p.weeks.max * view.person_days)}</td>
                  <td>{p.hypercare_days} days</td>
                  <td>{p.apps_included}</td>
                  {view.pricing ? <td>{band(p.price_band, currency)}</td> : null}
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
        <div className="examples">
          {view.examples.map((x) => (
            <article key={x.title} className="example">
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
                      <td>{l.after_go_live ? 'after go-live' : wk(l.weeks)}</td>
                      {view.pricing ? <td>{span(l.price, currency)}</td> : null}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th scope="row">{x.code} · {x.name}{x.addons.length ? ` + ${x.addons.join(', ').toLowerCase()}` : ''}</th>
                    <td>{weeks(x.weeks)}</td>
                    {view.pricing ? <td>{band(x.price_band, currency)}</td> : null}
                  </tr>
                </tfoot>
              </table>
            </article>
          ))}
        </div>
      </section>

      <section id="calibration">
        <h2>Checked against a real estimation</h2>
        <p className="answer-line">{view.calibration.note}</p>
        <ul className="stats kpis">
          <li><strong>{view.calibration.estimate_developer_days}</strong><span>developer days in the estimation</span></li>
          <li><strong>{pct(view.calibration.estimate_qa_share)}</strong><span>QA on top of development</span></li>
          <li><strong>{weeks(view.calibration.engine_weeks)}</strong><span>weeks the engine quotes for the same answers</span></li>
        </ul>
      </section>

      <section>
        <p className="muted small">
          The team, the weekly cost, the hypercare share and the app allowance live in the offering data, and every band
          is derived from them: change the team or the week and every pack and every add-on moves with it. The decision
          and its history are in ADR 0019. See <Link to="/offering">the offering</Link> for what each pack holds.
        </p>
      </section>
    </main>
  );
}
