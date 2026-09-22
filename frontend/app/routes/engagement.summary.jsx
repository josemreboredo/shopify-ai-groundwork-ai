import { Link } from 'react-router';

import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { EngagementHeader, resultClass, words } from '../components/question.jsx';
import { pageTitle } from '../brand.js';

export const meta = ({ params }) => [{ title: pageTitle('Summary', params.client) }];

export async function loader({ request, params }) {
  const user = await requireUser(request);
  try {
    return await discovery().getSummary(user, params.client);
  } catch (err) {
    throw serviceFailure(err);
  }
}

const STATE_LABEL = { answered: 'Answered', tbc: 'TBC', skipped: 'Not applicable', commented: 'Clarified by comment' };

export default function Summary({ loaderData }) {
  const { engagement, preview: p, open_items: openItems, sections, documents, notes, generated_at: generatedAt } = loaderData;
  const signals = Object.entries(p.app_signals ?? {}).filter(([, reasons]) => reasons.length);
  return (
    <main>
      <EngagementHeader engagement={engagement} eyebrow="Summary" meta={`Computed by the engine on ${generatedAt}`} />
      <p className="muted">
        Internal working summary for the Lead Consultant — not a client document.{' '}
        <a href={`/engagements/${engagement.client}/summary.md`} download>Download as Markdown</a>
      </p>

      <div className="summary-grid">
        <section className="card">
          <h2>Offer</h2>
          <p><strong>{p.offer.code} · {p.offer.name}</strong> {p.offer.provisional ? <span className="badge provisional">provisional</span> : null}</p>
          <p>{p.go ? <span className="badge go">GO</span> : <span className="badge stop">STOP · route: {words(p.route ?? 'not decided')}</span>}</p>
          <p className="muted">{p.coverage.required_answered} of {p.coverage.required_total} required answered · {p.coverage.required_tbc} TBC · {p.coverage.required_commented ?? 0} by comment · {p.coverage.required_open} open</p>
          {p.plan_suggestion ? <p><strong>Minimum Shopify plan:</strong> {p.plan_suggestion.value}<br /><span className="muted">{p.plan_suggestion.reasons.join('; ')}</span></p> : null}
        </section>
        <section className="card">
          <h2>Exit rules</h2>
          {p.exit_rules.length ? <ul>{p.exit_rules.map((r) => <li key={r.rule}><span className={`badge ${resultClass(r.result)}`}>{r.rule} {r.result}</span> {r.evidence}</li>)}</ul> : <p className="muted">None fired.</p>}
          <h3>Scope gates</h3>
          <p className="muted">{Object.entries(p.scope_gates).map(([id, state]) => `${words(id)}: ${state}`).join(' · ')}</p>
          <h3>L triggers</h3>
          <p className="muted">{Object.entries(p.l_triggers).map(([id, state]) => `${words(id)}: ${state}`).join(' · ')}</p>
        </section>
      </div>

      <h2>Open items ({openItems.length})</h2>
      {openItems.length ? (
        <ul>{openItems.map((i) => <li key={`${i.question_id}-${i.why}`}><Link to={`/engagements/${engagement.client}/questions/${i.question_id}`}>{i.question_id}</Link> {i.question} — <span className="muted">{i.why}</span></li>)}</ul>
      ) : <p className="muted">None.</p>}

      <h2>App signals</h2>
      {signals.length ? <ul>{signals.map(([area, reasons]) => <li key={area}>{words(area)}: {reasons.join('; ')}</li>)}</ul> : <p className="muted">None — native Shopify covers the answers so far.</p>}

      {sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          <table>
            <thead><tr><th>#</th><th>Question</th><th>Answer</th><th>Status</th></tr></thead>
            <tbody>
              {section.questions.map((q) => (
                <tr key={q.id}>
                  <td><Link to={`/engagements/${engagement.client}/questions/${q.id}`}>{q.id}</Link></td>
                  <td>{q.text}</td>
                  <td><span className="pre">{q.value}</span>{q.note ? <div className="muted">{q.note}</div> : null}</td>
                  <td>{STATE_LABEL[q.state]}{q.to_confirm ? ' (to confirm)' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      {documents.length ? (<><h2>Documents used</h2><ul>{documents.map((d) => <li key={d.name}>{d.name} · {d.type}{d.summary ? ` — ${d.summary}` : ''}</li>)}</ul></>) : null}
      {notes.length ? (<><h2>Consultant notes</h2><ul>{notes.map((n, i) => <li key={i}>{n.at}: {n.text}</li>)}</ul></>) : null}
    </main>
  );
}
