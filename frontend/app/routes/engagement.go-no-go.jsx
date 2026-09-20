import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { EngagementHeader } from '../components/question.jsx';
import { Radar } from '../components/radar.jsx';
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

      {/* The position: the verdict, then one why, then the ground under it */}
      <section className={`card position ${tone}`}>
        <p className="eyebrow">Solution Architect · {r.verdict}</p>
        <h2 className="plain verdict">{r.headline}</h2>

        <p className="why-line">{r.why}</p>

        {r.because.length ? (
          <ul className="grounds">
            {r.because.map((line) => <li key={line}>{line}</li>)}
          </ul>
        ) : null}

        {r.before_you_go.length ? (
          <div className="before">
            <p className="eyebrow">Before the price is committed</p>
            <ul className="ticks">{r.before_you_go.map((line) => <li key={line}>{line}</li>)}</ul>
          </div>
        ) : null}

        <p className="muted small">
          A recommendation, not the decision. The relationship, the competition and the pipeline are weighed in
          the room, and this desk knows nothing about them.
        </p>
      </section>

      {/* Where the complexity sits, before it is read */}
      {g.profile?.length ? (
        <section>
          <h2>Where the complexity sits</h2>
          <p className="muted">
            Each axis is one of the seven things that grow a Shopify build. Inside the dashed line is what
            Merkle’s standard offers cover; anything past it is scoped and priced on its own.
          </p>
          <div className="profile">
            <Radar axes={g.profile.filter((a) => a.level > 0).length ? g.profile : g.profile} />
            <div className="table-scroll">
              <table>
                <thead><tr><th>Dimension</th><th>Standing</th><th>What they asked for</th></tr></thead>
                <tbody>
                  {g.profile.map((a) => (
                    <tr key={a.id} className={a.level === 0 ? 'idle' : undefined}>
                      <th scope="row">{a.label}</th>
                      <td>
                        <span className={`badge ${a.level === 2 ? 'stop' : a.level === 1 ? 'go' : ''}`}>{a.standing}</span>
                        {a.rules.length ? <div className="muted small">{a.rules.map((r) => r.rule_id).join(', ')}</div> : null}
                      </td>
                      <td>{a.evidence ?? <span className="muted">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}

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

      {/* Complexity sources and risks */}
      {g.risks.length ? (
        <section>
          <h2>Complexity sources and risks</h2>
          <p className="muted">
            Every rule the requirements fired, worst first — what takes it outside the offers, and what needs a
            named owner before a build starts.
          </p>
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

      <p className="muted small">
        The rest of Merkle’s Go/No-Go scorecard is commercial and relationship ground — the opportunity value,
        the NPS, the buying centre, whether a pitch team is confirmed. An RFP cannot tell us any of it, and this
        desk does not guess at it.
      </p>
    </main>
  );
}
