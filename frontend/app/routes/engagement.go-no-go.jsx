import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { EngagementHeader } from '../components/question.jsx';

export const meta = ({ params }) => [{ title: `Go/No-Go support · ${params.client} · Merkle Discovery` }];

/**
 * What the Solution Architect brings to the Go/No-Go meeting.
 *
 * Laid out in the order the scorecard asks its questions, so it can be read
 * straight into the room. The architect owns seven of the twenty-eight; the rest
 * are named with whoever does own them, because a page that quietly skips
 * nineteen questions looks like a page that forgot them.
 */
export async function loader({ request, params }) {
  const user = await requireUser(request);
  try {
    return await discovery().getGoNoGo(user, params.client);
  } catch (err) {
    throw serviceFailure(err);
  }
}

const VERDICT = {
  'enough to price': { tone: 'go', line: 'The RFP answers what the price depends on. A comparable offer can be built from it.' },
  'priceable with stated assumptions': { tone: 'flag', line: 'A comparable offer can be built, but part of it rests on what we assume rather than what they told us.' },
  'not enough to price without asking': { tone: 'stop', line: 'Too much of what sets the price is missing. Pricing this without spending the Q&A window is guessing.' },
};

export default function GoNoGo({ loaderData }) {
  const { engagement, go_no_go: g, documents } = loaderData;
  const client = engagement.client;
  const verdict = VERDICT[g.headline.verdict] ?? { tone: 'flag', line: '' };
  // The headline is question 20 and is answered here too, just not in a section.
  const answered = g.sections.reduce((n, s) => n + s.questions.length, 0) + 1;

  return (
    <main>
      <EngagementHeader
        engagement={engagement}
        eyebrow="Go/No-Go support"
        meta={`${answered} of ${answered + g.not_ours.length} scorecard questions · ${documents.length} document${documents.length === 1 ? '' : 's'} read`}
      />

      <p className="muted">
        The architect’s side of the Go/No-Go scorecard. Everything below is computed from the RFP and Merkle’s
        offering — nothing is estimated for this page, and nothing here is a recommendation to bid or not.
      </p>

      {/* The question this page exists for */}
      <section className={`card start ${verdict.tone === 'go' ? 'current' : 'blocked'}`}>
        <div className="start-head">
          <div>
            <p className="eyebrow">Question {g.headline.n}</p>
            <p className="question">{g.headline.ask}</p>
            <p className="muted">{verdict.line}</p>
          </div>
          <span className={`badge ${verdict.tone}`}>{g.headline.verdict}</span>
        </div>
        <ul className="stats">
          <li><strong>{g.headline.pct}%</strong><span>of what sets the price is answered ({g.headline.answered} of {g.headline.total})</span></li>
          <li><strong>{g.headline.open_topics}</strong><span>topic{g.headline.open_topics === 1 ? '' : 's'} still open that move the offer, the plan, the topology or the cost</span></li>
          <li><strong>{g.headline.assumptions_total}</strong><span>assumption{g.headline.assumptions_total === 1 ? '' : 's'} the proposal would rest on</span></li>
        </ul>
        {g.headline.cannot_price.length ? (
          <>
            <p className="muted"><strong>Cannot be costed at all until answered:</strong></p>
            <ul className="ticks">{g.headline.cannot_price.map((i) => <li key={i}>{i}</li>)}</ul>
          </>
        ) : null}
      </section>

      {/* The scorecard, in its own order */}
      {g.sections.map((section) => (
        <section key={section.id}>
          <h2>{section.title}</h2>
          <ol className="scorecard">
            {section.questions.map((q) => (
              <li key={q.n}>
                <p className="sc-n" aria-hidden="true">{q.n}</p>
                <div>
                  <h3>{q.ask}</h3>
                  <p className="sc-says">{q.says}</p>
                  {q.detail.length ? (
                    <ul className="sc-detail">
                      {q.detail.map((d) => (
                        <li key={d.capability}><strong>{d.capability}</strong><span>{d.evidence}</span></li>
                      ))}
                    </ul>
                  ) : null}
                  {q.watch ? <p className="sc-watch">{q.watch}</p> : null}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}

      {/* What we are betting on */}
      {g.assumptions.length ? (
        <section>
          <h2>What we would be betting on</h2>
          <p className="muted">
            {g.assumptions_total} stated assumption{g.assumptions_total === 1 ? '' : 's'}. Which of them to settle
            before the price is committed is decided in <a href={`/engagements/${client}/clarifications`}>RFP Q&amp;A</a>.
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

      {/* The boundary, said out loud */}
      <section>
        <h2>Not from this tool ({g.not_ours.length})</h2>
        <p className="muted">
          The rest of the scorecard is commercial and relationship ground — the opportunity value in Salesforce,
          the NPS, who sits in the buying centre, whether a pitch team is confirmed. An RFP cannot tell us any of
          it, and a guess written into a scorecard gets read as a fact.
        </p>
        <div className="table-scroll">
          <table>
            <thead><tr><th>#</th><th>Question</th><th>Who answers it</th></tr></thead>
            <tbody>
              {g.not_ours.map((q) => (
                <tr key={q.n}><td>{q.n}</td><td>{q.ask}</td><td>{q.owner}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
