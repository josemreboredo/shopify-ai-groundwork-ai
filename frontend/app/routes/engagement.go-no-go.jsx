import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { EngagementHeader } from '../components/question.jsx';
import { pageTitle } from '../brand.js';

export const meta = ({ params }) => [{ title: pageTitle('Go/No-Go support', params.client) }];

/**
 * Where the Solution Architect stands on the bid, and why.
 *
 * Not a scorecard. The meeting's twenty-eight questions are mostly commercial and
 * this desk is not there to answer them — it is there to say whether Merkle can
 * put a number on the work and stand behind it, from the documents and from what
 * has actually been verified in them.
 */
export async function loader({ request, params }) {
  const user = await requireUser(request);
  try {
    return await discovery().getGoNoGo(user, params.client);
  } catch (err) {
    throw serviceFailure(err);
  }
}

const TONE = {
  go: 'go',
  'go, but ask': 'flag',
  'ask first': 'flag',
  'not yet': 'flag',
  'not a standard bid': 'stop',
  'nothing to go on': 'stop',
};

const OWNER = { agent: 'Claude Code agent', developer: 'Developer', consultant: 'Consultant', client: 'Client' };
const money = (b) => (b ? `${b.currency ?? ''} ${Math.round(b.min / 1000)}k–${Math.round(b.max / 1000)}k${b.open_ended ? '+' : ''}`.trim() : null);

export default function GoNoGo({ loaderData }) {
  const { engagement, go_no_go: g } = loaderData;
  const client = engagement.client;
  const r = g.recommendation;
  const tone = TONE[r.verdict] ?? 'flag';

  return (
    <main>
      <EngagementHeader engagement={engagement} eyebrow="Go/No-Go support" />

      {/* The position */}
      <section className={`card start ${tone === 'go' ? 'current' : 'blocked'}`}>
        <div className="start-head">
          <div>
            <p className="eyebrow">Solution Architect</p>
            <p className="question">{r.headline}</p>
          </div>
          <span className={`badge ${tone}`}>{r.verdict}</span>
        </div>
        <ul className="because">
          {r.because.map((line) => <li key={line}>{line}</li>)}
        </ul>
        {r.before_you_go.length ? (
          <>
            <p className="eyebrow">Before the price is committed</p>
            <ul className="ticks">{r.before_you_go.map((line) => <li key={line}>{line}</li>)}</ul>
          </>
        ) : null}
        <p className="muted small">
          A recommendation, not the decision. The relationship, the competition and the pipeline are weighed in
          the room, and this desk knows nothing about them.
        </p>
      </section>

      {/* What the RFP is asking for */}
      {g.capabilities.length ? (
        <section>
          <h2>What they are asking for</h2>
          <p className="muted">
            Read out of the documents and confirmed. Each line carries the answer it came from.
          </p>
          <ul className="sc-detail">
            {g.capabilities.map((c) => (
              <li key={c.id}><strong>{c.capability}</strong><span>{c.evidence}</span></li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* What it would take to build */}
      <section>
        <h2>What it would take</h2>
        {g.scope.applies ? (
          <ul className="ticks">
            <li><strong>{g.scope.offer} · {g.scope.name}</strong> — {g.scope.track}</li>
            <li>{g.scope.weeks} weeks of build{g.scope.band ? `, ${money(g.scope.band)}` : ''}</li>
            {g.scope.shape.length ? <li>Shaped as {g.scope.shape.map((s) => `${s.stories} ${OWNER[s.owner] ?? s.owner}`).join(', ').toLowerCase()}</li> : null}
          </ul>
        ) : (
          <>
            <p className="muted">
              It does not map to S, M or L, so there is no standard scope or price to quote. Pricing it at{' '}
              <strong>{g.scope.offer}</strong> — what the scope gates classify it as — would sell bespoke work
              at a standard price.
            </p>
            <ul className="ticks">{g.scope.why_not.map((w) => <li key={w}>{w}</li>)}</ul>
          </>
        )}
      </section>

      {/* What could move the margin */}
      {g.risks.length ? (
        <section>
          <h2>What could move the margin</h2>
          <ul className="rules">
            {g.risks.map((x) => (
              <li key={x.rule_id}>
                <span className={`rule-id ${x.result.toLowerCase()}`}>{x.rule_id}</span>
                <div>
                  <p className="rule-when">{x.evidence}</p>
                  <p className="muted">{x.severity}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* What we would be betting on */}
      {g.assumptions.length ? (
        <section>
          <h2>What we would be betting on ({g.assumptions_total})</h2>
          <p className="muted">
            Which of these to settle before the price is committed is decided in{' '}
            <a href={`/engagements/${client}/clarifications`}>RFP Q&amp;A</a>.
          </p>
          <ul className="assumptions">
            {g.assumptions.map((a, i) => (
              <li key={`${a.assumed}-${i}`} className={a.source}>
                <p className="assumed">{a.assumed}</p>
                <p className="muted">{a.about}</p>
                {a.impact_if_wrong ? <p className="muted small">If wrong: {a.impact_if_wrong}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* The boundary */}
      <details className="rules-more">
        <summary>The rest of the scorecard is not this desk’s ({g.not_ours.length})</summary>
        <p className="muted">
          Commercial and relationship ground — the opportunity value, the NPS, the buying centre, whether a
          pitch team is confirmed. An RFP cannot tell us any of it, and a guess written into a scorecard gets
          read as a fact.
        </p>
        <div className="table-scroll">
          <table>
            <thead><tr><th>#</th><th>Question</th><th>Who answers it</th></tr></thead>
            <tbody>
              {g.not_ours.map((q) => <tr key={q.n}><td>{q.n}</td><td>{q.ask}</td><td>{q.owner}</td></tr>)}
            </tbody>
          </table>
        </div>
      </details>
    </main>
  );
}
