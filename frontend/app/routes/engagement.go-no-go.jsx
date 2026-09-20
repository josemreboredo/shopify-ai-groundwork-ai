import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { EngagementHeader, WithQuestionLinks } from '../components/question.jsx';
import { ServiceError } from '../../../discovery/service/index.js';
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
    return { ...(await discovery().getGoNoGo(user, params.client)), blocked: null };
  } catch (err) {
    // The blockers say which questions are missing and link to them. Rethrowing
    // sent the architect a bare "Some answers are still missing" on the page a
    // bid decision is taken from, while two sibling steps listed them.
    if (!(err instanceof ServiceError)) throw serviceFailure(err);
    // The engagement itself still loads, so the page keeps its header and its
    // spine rather than dropping the consultant onto a bare error.
    const { engagement } = await discovery().getSummary(user, params.client);
    return { engagement, blocked: { error: err.message, errors: err.errors ?? [], blockers: err.blockers ?? [] } };
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
  const { engagement, go_no_go: g, blocked } = loaderData;
  if (blocked) {
    return (
      <main>
        <EngagementHeader engagement={engagement} eyebrow="Go/No-Go support" />
        <section className="card start blocked">
          <p className="question">{blocked.error}</p>
          <p className="muted">There is nothing for this desk to weigh until these are recorded.</p>
          <ul className="blockers">
            {(blocked.blockers ?? []).map((b) => (
              <li key={b.what}>
                <strong>{b.what}</strong>
                <p className="muted"><WithQuestionLinks text={b.why} client={engagement.client} /></p>
              </li>
            ))}
            {!(blocked.blockers ?? []).length && blocked.errors.map((e) => (
              <li key={e}><p className="muted"><WithQuestionLinks text={e} client={engagement.client} /></p></li>
            ))}
          </ul>
        </section>
      </main>
    );
  }
  const client = engagement.client;
  const r = g.recommendation;
  const tone = TONE[r.verdict] ?? 'flag';

  return (
    <main id="main">
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
            Merkle’s standard offers cover; anything past it is scoped and priced on its own. An axis marked{' '}
            <strong>?</strong> is one the documents never mentioned — not one we know does not apply.
          </p>
          <div className="profile">
            <Radar axes={g.profile} />
            <div className="table-scroll" role="region" tabIndex={0} aria-label="The profile, scrollable table">
              <table>
                <thead><tr><th scope="col">Dimension</th><th scope="col">Standing</th><th scope="col">What they asked for</th></tr></thead>
                <tbody>
                  {g.profile.map((a) => (
                    <tr key={a.id} className={a.level === 0 && a.known !== false ? 'idle' : undefined}>
                      <th scope="row">{a.label}</th>
                      <td>
                        <span className={`badge ${a.level === 2 ? 'stop' : a.known === false ? 'flag' : a.level === 1 ? 'go' : ''}`}>{a.standing}</span>
                        {a.rules.length ? <div className="muted small">{a.rules.map((r) => r.rule_id).join(', ')}</div> : null}
                      </td>
                      <td>
                        {a.also?.length ? (
                          <div className="also">
                            {a.also.map((w) => <p key={w.work} className="muted small">{w.topic} — {w.work}</p>)}
                          </div>
                        ) : null}
                        {a.evidence ?? (a.known === false
                          ? <span className="muted">Nothing in the documents either way — <a href={`/engagements/${client}/clarifications`}>it is in the Q&amp;A</a> ({a.settled_by.join(', ')})</span>
                          : <span className="muted">—</span>)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}

      {/* Asked for, answered, and answered outside this build. Not an exclusion:
          a requirement listed as one reads as non-compliance and scores as a gap. */}
      {g.answered_elsewhere?.length ? (
        <section>
          <h2>Answered outside this build</h2>
          <p className="muted">
            Nothing they asked for is dropped. Part of it is answered with a route rather than with a Shopify
            build, and that part is scoped on its own — which is a smaller build here, not a smaller response.
          </p>
          <ul className="exclusions">
            {g.answered_elsewhere.map((x) => (
              <li key={x.rule_id}>
                <p className="excl-what">{x.what} <span className="rule-id flag">{x.rule_id}</span></p>
                <p className="muted small">They asked for it: {x.asked_for}</p>
                <p><strong>What we can do.</strong> {x.answer}</p>
                <p><strong>What Shopify cannot.</strong> {x.what_it_cannot}</p>
                <p className="muted">{x.where_it_goes}. {x.leaves}.</p>
                {x.work?.length ? (
                  <>
                    <p className="muted small"><strong>Answering it is work in this build:</strong></p>
                    <ul className="ticks">{x.work.map((w) => <li key={w}>{w}</li>)}</ul>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
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
