import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { EngagementHeader } from '../components/question.jsx';

export const meta = ({ params }) => [{ title: `Go/No-Go support · ${params.client} · Merkle Discovery` }];

/**
 * The evidence for the bid decision, not the decision.
 *
 * The decision is taken in a room by people weighing things this tool knows
 * nothing about — the relationship, the pipeline, who else is pitching. What it
 * can do is assemble what the architect is always asked for and usually puts
 * together by hand the night before.
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
  'enough to price': { tone: 'go', line: 'The document answers what the price depends on.' },
  'priceable with stated assumptions': { tone: 'flag', line: 'Priceable, but part of it rests on what we assume rather than what they told us.' },
  'not enough to price without asking': { tone: 'stop', line: 'Too much of what sets the price is missing. Pricing this without using the Q&A window is guessing.' },
};

const TOPOLOGY = {
  single_store_markets: 'One store with Shopify Markets',
  expansion_stores: 'Expansion stores',
  hybrid: 'Hybrid',
  single_store_managed_markets: 'One store with Managed Markets',
};

export default function GoNoGo({ loaderData }) {
  const { engagement, go_no_go: g, documents } = loaderData;
  const client = engagement.client;
  const verdict = VERDICT[g.evidence.verdict] ?? { tone: 'flag', line: '' };

  return (
    <main>
      <EngagementHeader engagement={engagement} eyebrow="Go/No-Go support" meta={`${documents.length} document${documents.length === 1 ? '' : 's'} read`} />

      <p className="muted">
        Everything here is computed from the RFP and Merkle’s offering — nothing is estimated for this page.
        It is the evidence for the decision; the decision is taken in the meeting.
      </p>

      {/* 1 — can we price it at all */}
      <section className={`card start ${verdict.tone === 'go' ? 'current' : 'blocked'}`}>
        <div className="start-head">
          <div>
            <p className="question">Can we price it from what they sent?</p>
            <p className="muted">{verdict.line}</p>
          </div>
          <span className={`badge ${verdict.tone}`}>{g.evidence.verdict}</span>
        </div>
        <ul className="stats">
          <li><strong>{g.evidence.pct}%</strong><span>of what the price depends on is answered ({g.evidence.answered} of {g.evidence.total})</span></li>
          <li><strong>{g.evidence.open_topics}</strong><span>topic{g.evidence.open_topics === 1 ? '' : 's'} still open that move the offer, the plan, the topology or the cost</span></li>
          <li><strong>{g.assumptions_total}</strong><span>assumption{g.assumptions_total === 1 ? '' : 's'} the proposal would rest on</span></li>
        </ul>
        {g.evidence.cannot_price.length ? (
          <>
            <p className="muted"><strong>Cannot be costed at all until answered:</strong></p>
            <ul className="ticks">{g.evidence.cannot_price.map((i) => <li key={i}>{i}</li>)}</ul>
          </>
        ) : null}
      </section>

      {/* 2 — where it lands */}
      <section>
        <h2>Where it lands</h2>
        <div className="table-scroll">
          <table>
            <tbody>
              <tr><th scope="row">Offer</th><td>{g.fit.offer ? `${g.fit.offer} · ${g.fit.name}` : '—'}</td></tr>
              <tr><th scope="row">Within the standard offers</th><td>{g.fit.within_offers ? 'Yes' : `No${g.fit.route ? ` — ${g.fit.route.replace(/_/g, ' ')}` : ' — a route has to be recorded'}`}</td></tr>
              <tr><th scope="row">Shopify plan the requirements force</th><td>{g.fit.plan ?? 'not yet determined'}</td></tr>
              <tr><th scope="row">Markets</th><td>{g.fit.markets}</td></tr>
              <tr><th scope="row">Store topology</th><td>{g.fit.topology ? `${TOPOLOGY[g.fit.topology.recommendation] ?? g.fit.topology.recommendation} · ${g.fit.topology.confidence.replace(/_/g, ' ')}` : '—'}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 3 — the risk matrix */}
      <section>
        <div className="section-head">
          <h2>What the document commits us to</h2>
          <p className="muted">
            {g.risk_counts.stop} outside the offers · {g.risk_counts.flag} needing an owner · {g.risk_counts.warn} commercial
          </p>
        </div>
        {g.risks.length ? (
          <ul className="rules">
            {g.risks.map((r) => (
              <li key={r.rule_id}>
                <span className={`rule-id ${r.result.toLowerCase()}`}>{r.rule_id}</span>
                <div>
                  <p className="rule-when">{r.evidence}</p>
                  <p className="muted">{r.severity}{r.destination ? ` → ${r.destination}` : ''}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="muted">No rule fired: nothing in this RFP takes it outside the standard offers or needs an owner before build.</p>}
      </section>

      {/* 4 — what we would be betting on */}
      {g.betting_on.length ? (
        <section>
          <h2>What we would be betting on</h2>
          <p className="muted">
            A proposal resting on {g.assumptions_total} assumption{g.assumptions_total === 1 ? '' : 's'} is a different
            commercial object from one resting on two, whatever the price says. The full list, and the choice of
            which to settle, is in <a href={`/engagements/${client}/clarifications`}>RFP Q&amp;A</a>.
          </p>
          <ul className="assumptions">
            {g.betting_on.map((a, i) => (
              <li key={`${a.assumed}-${i}`} className={a.source}>
                <p className="assumed">{a.assumed}</p>
                <p className="muted">{a.about}</p>
                {a.impact_if_wrong ? <p className="muted small">If wrong: {a.impact_if_wrong}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* 5 — what would settle it */}
      {g.would_settle_it.length ? (
        <section>
          <h2>What the Q&amp;A window could settle</h2>
          <p className="muted">
            Spending the window on these turns assumptions into answers before the price is committed.
          </p>
          <ul className="ticks">
            {g.would_settle_it.map((t) => (
              <li key={t.title}><strong>{t.title}</strong> — settles {t.settles} unknown{t.settles === 1 ? '' : 's'}; changes {t.changes.join(', ')}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
