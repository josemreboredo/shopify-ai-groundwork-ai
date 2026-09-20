import { Link } from 'react-router';

import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { EngagementHeader, resultClass, words } from '../components/question.jsx';
import { pageTitle } from '../brand.js';
import { offerStanding } from '../../../discovery/service/summary.js';

export const meta = ({ params }) => [{ title: pageTitle('Where it stands', params.client) }];

export async function loader({ request, params }) {
  const user = await requireUser(request);
  try {
    return await discovery().getSummary(user, params.client);
  } catch (err) {
    throw serviceFailure(err);
  }
}

/**
 * Where the bid stands, re-answered on every document read in and every answer
 * confirmed.
 *
 * Step 3 takes a position for a room, once. This is the work state: what is left
 * before a price can go on it, and what each gap costs if it never closes. It was
 * the engine's internal working summary — 298 rows of answers, a second GO/STOP
 * badge, the exit rules again — none of which answers "can we respond yet".
 */
function Bar({ settled, total }) {
  const pct = total ? Math.round((settled / total) * 100) : 0;
  return (
    <div className="decisions-bar" role="img" aria-label={`${settled} of ${total} decisions settled`}>
      <span className="settled" style={{ width: `${pct}%` }} />
      <span className="rest" style={{ width: `${100 - pct}%` }} />
    </div>
  );
}

function Points({ title, lead, rows, client, tone }) {
  if (!rows.length) return null;
  return (
    <>
      <h3 className={`points-head ${tone}`}>{title} <span className="chip">{rows.length}</span></h3>
      <p className="muted">{lead}</p>
      <div className="table-scroll" role="region" tabIndex={0} aria-label="Open points, scrollable table">
        <table className="open-points">
          <thead><tr><th scope="col">What is open</th><th scope="col">What it moves</th><th scope="col">Assumption</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={`${r.what}-${i}`}>
                <td>
                  <strong>{r.what}</strong>
                  <div className="muted small">{r.reason}</div>
                </td>
                <td>{r.moves.length ? r.moves.join(', ') : <span className="muted">—</span>}</td>
                <td>
                  {r.consequence ?? (r.settles.length
                    ? <Link to={`/engagements/${client}/clarifications`}>Ask it — {r.settles.slice(0, 3).join(', ')}</Link>
                    : <span className="muted">—</span>)}
                  {r.owner ? <div className="muted small">Decided by {r.owner}</div> : null}
                  {!r.consequence && r.reason === 'we decided not to ask'
                    ? <div className="no-consequence">No consequence stated — this is the one that becomes a scope argument</div>
                    : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function Summary({ loaderData }) {
  const { engagement, preview: p, readiness: r, technical: t, open_points: open, documents, notes, generated_at: generatedAt } = loaderData;
  const client = engagement.client;
  const standing = offerStanding(p);

  if (!r) {
    return (
      <main id="main">
        <EngagementHeader engagement={engagement} eyebrow="Where it stands" meta={`Computed by the engine on ${generatedAt}`} />
        <section className="card start blocked">
          <p className="question">Not enough recorded yet</p>
          <p className="muted">The engine cannot make an engagement of these answers, so there is nothing to weigh. Read the documents in and confirm what they say.</p>
        </section>
      </main>
    );
  }

  return (
    <main id="main">
      <EngagementHeader engagement={engagement} eyebrow="Where it stands" meta={`Recomputed on every document and every confirmation · ${generatedAt}`} />

      {/* 1 — the slide. One answer, the shape of the gap, and what blocks it. */}
      <section className={`standfirst ${r.ready ? 'go' : 'flag'}`}>
        <p className="eyebrow">{standing.headline}</p>
        <h2 className="plain headline-answer">
          {r.ready
            ? `Ready to price${r.counts.assumptions ? `, on ${r.counts.assumptions} stated assumption${r.counts.assumptions === 1 ? '' : 's'}` : ''}`
            : `Not ready to price — ${r.blockers.length} thing${r.blockers.length === 1 ? '' : 's'} block${r.blockers.length === 1 ? 's' : ''} it`}
        </h2>

        <div className="standfirst-body">
          <div className="dial">
            <Bar settled={r.decisions.settled} total={r.decisions.total} />
            <p className="dial-n">
              <strong>{r.decisions.settled}</strong><span>of {r.decisions.total}</span>
            </p>
            <p className="dial-what">
              decisions the engine makes — which offer this is, which Shopify plan the requirements force,
              which risks get priced — with a confirmed answer behind them
            </p>
          </div>

          {r.blockers.length ? (
            <ol className="blocks">
              {r.blockers.map((b) => (
                <li key={b.what}>
                  <Link to={`/engagements/${client}/${b.where}`}>{b.what}</Link>
                  <span className="muted">{b.why}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="muted">
              Nothing is waiting on a person, nothing is outside the offers, and everything still open can be
              priced on an assumption that is written down.
            </p>
          )}
        </div>
      </section>

      {/* 2 — the two answers the offer owes whatever its commercial shape */}
      {t ? (
        <div className="answers">
          <div className="answer">
            <p className="answer-label">Built on</p>
            <p className="answer-value">{t.storefront.label}</p>
            <p className="muted small">{t.storefront.why}</p>
          </div>
          <div className="answer">
            <p className="answer-label">Shopify plan the requirements force</p>
            <p className="answer-value">{t.plan.label}</p>
            <p className="muted small">
              {t.plan.forced_by.length
                ? `${t.plan.forced_by.length} requirement${t.plan.forced_by.length === 1 ? '' : 's'} force${t.plan.forced_by.length === 1 ? 's' : ''} it`
                : 'Nothing in the requirements needs a higher plan'}
              {t.plan.disagreement ? ` · ${t.plan.disagreement}` : ''}
            </p>
          </div>
        </div>
      ) : null}

      {/* 3 — the numbers, each one countable */}
      <ul className="stats kpis">
        <li><strong>{r.counts.to_confirm}</strong><span>answers read from a document and still waiting on you</span></li>
        <li><strong>{r.counts.undecided}</strong><span>questions not yet asked or turned into an assumption</span></li>
        <li><strong>{r.counts.assumptions}</strong><span>assumptions the proposal will state</span></li>
        <li><strong>{r.counts.assumptions_without_consequence}</strong><span>of those with no consequence written down</span></li>
        <li><strong>{r.counts.stops}<span className="of"> · {r.counts.flags} · {r.counts.warns}</span></strong><span>rules fired — outside the offers · needs an owner · commercial</span></li>
      </ul>

      {/* 4 — why those two answers, with the page that sets each limit */}
      {t ? (
        <section>
          <h2>Why that plan, and why that storefront</h2>
          {t.plan.forced_by.length ? (
            <>
              <p className="muted">
                Each of these is a requirement this engagement has that the platform only offers above a certain
                plan. The plan is the highest one any of them needs — not a preference, and never an assumption
                that Plus is wanted.
              </p>
              <div className="table-scroll" role="region" tabIndex={0} aria-label="Open points, scrollable table">
                <table>
                  <thead><tr><th scope="col">Requirement</th><th scope="col">Needs</th><th scope="col">Shopify’s own page</th></tr></thead>
                  <tbody>
                    {t.plan.forced_by.map((f) => (
                      <tr key={f.feature}>
                        <th scope="row">{f.feature}</th>
                        <td>{f.plan}</td>
                        <td><a href={f.docs} target="_blank" rel="noreferrer">{new URL(f.docs).pathname.split('/').filter(Boolean).slice(-2).join('/')}</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="muted">No requirement in this engagement needs a plan above Basic. Anything higher would be the client’s choice, not ours.</p>
          )}
          <h3>The storefront</h3>
          <p>{t.storefront.why}</p>
          {t.storefront.evidence ? <p className="muted">{t.storefront.evidence}</p> : null}
          {t.storefront.would_change_it ? <p className="muted">{t.storefront.would_change_it}</p> : null}
        </section>
      ) : null}

      {/* 5 — what the engine still cannot decide */}
      <section>
        <h2>What the engine still cannot decide</h2>
        <p className="muted">
          Thirty-three rules decide which offer this is, which Shopify plan the requirements force and which risks
          get priced. A decision is settled when it fired on the answers, or when every answer it reads is
          recorded <em>and confirmed</em>. It is not a completeness score: the one still open may be the only one
          that matters.
        </p>
        {r.decisions.open.length ? (
          <ul className="ticks">
            {r.decisions.open.map((d) => (
              <li key={`${d.kind}-${d.id}`}>
                <strong>{d.kind === 'rule' ? `Rule ${d.id}` : d.label}</strong>
                {d.kind === 'rule' ? <> — {d.label}</> : null}
                <div className="muted small">{d.why}{d.missing.length ? ` · ${d.missing.length} input${d.missing.length === 1 ? '' : 's'} with nothing recorded` : ''}</div>
              </li>
            ))}
          </ul>
        ) : <p className="muted">All thirty-three have an answer behind them.</p>}
      </section>

      {/* 4 — what it costs to stay ignorant */}
      <section>
        <h2>Open points, and what they cost</h2>
        <Points
          title="Blocks a price"
          tone="stop"
          lead="Nothing we can assume covers these. A number put on the work without them is a guess with a price on it."
          rows={open.blocks_a_price}
          client={client}
        />
        <Points
          title="Priced on an assumption"
          tone="flag"
          lead="These will be answered in the proposal by stating what Merkle assumed, what it costs to be wrong and who chose it."
          rows={open.priced_on_an_assumption}
          client={client}
        />
        {!open.blocks_a_price.length && !open.priced_on_an_assumption.length
          ? <p className="muted">Nothing material is open.</p> : null}
      </section>

      {/* 5 — what each document actually settled */}
      {documents.length ? (
        <section>
          <h2>What each document gave us</h2>
          <div className="doc-bars">
            {r.documents.map((d) => {
              const most = Math.max(...r.documents.map((x) => x.answers), 1);
              return (
                <div key={d.name} className="doc-bar">
                  <span className="doc-bar-name">{d.name}</span>
                  <span className="doc-bar-track"><span style={{ width: `${Math.round((d.answers / most) * 100)}%` }} /></span>
                  <span className="doc-bar-n">{d.answers} answer{d.answers === 1 ? '' : 's'}{d.sections ? ` · ${d.sections} section${d.sections === 1 ? '' : 's'}` : ''}</span>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <p className="muted small">
        <Link to={`/engagements/${client}/review`}>Every answer</Link> ·{' '}
        <Link to={`/engagements/${client}/go-no-go`}>The architect’s position</Link> ·{' '}
        <a href={`/engagements/${client}/summary.md`} download>Download as Markdown</a>
        {notes.length ? ` · ${notes.length} consultant note${notes.length === 1 ? '' : 's'}` : ''}
        {p.app_signals && Object.values(p.app_signals).some((x) => x.length) ? ` · app signals in the engine summary` : ''}
      </p>
    </main>
  );
}
