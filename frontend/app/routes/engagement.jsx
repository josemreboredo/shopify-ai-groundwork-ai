import { Form, Link, useNavigation } from 'react-router';

import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';

export const meta = ({ params }) => [{ title: `${params.client} · Merkle Discovery` }];

export async function loader({ request, params }) {
  const user = await requireUser(request);
  try {
    return await discovery().getInterview(user, params.client, { limit: 3 });
  } catch (err) {
    throw serviceFailure(err);
  }
}

export async function action({ request, params }) {
  const user = await requireUser(request);
  const form = await request.formData();
  const intent = String(form.get('intent') ?? '');
  const questionId = String(form.get('question_id') ?? '');
  const note = String(form.get('note') ?? '');
  const service = discovery();
  try {
    if (intent === 'answer') {
      const values = {};
      for (const key of new Set(form.keys())) if (key.startsWith('/')) values[key] = form.getAll(key).map(String);
      await service.answerQuestion(user, params.client, { question_id: questionId, values, note, status: form.get('tbc_status') ? 'tbc' : 'confirmed' });
    } else if (intent === 'tbc' || intent === 'skipped') {
      await service.markQuestion(user, params.client, { question_id: questionId, as: intent, note });
    } else if (intent === 'note') {
      await service.addNote(user, params.client, { text: String(form.get('text') ?? '') });
    } else {
      return { error: `Unknown action ${intent}` };
    }
  } catch (err) {
    return serviceFailure(err, { question_id: questionId, intent });
  }
  return { ok: true, intent, question_id: questionId };
}

const words = (id) => id.replace(/_/g, ' ');
const leaf = (pointer) => words(pointer.split('/').at(-1));

function FieldInput({ spec, showLabel }) {
  const name = spec.pointer;
  const label = spec.label ?? (showLabel ? leaf(spec.pointer) : null);
  let control;
  switch (spec.kind) {
    case 'boolean':
      control = (
        <div className="options">
          <label><input type="radio" name={name} value="true" /> Yes</label>
          <label><input type="radio" name={name} value="false" /> No</label>
        </div>
      );
      break;
    case 'enum':
      control = (
        <select name={name} defaultValue="">
          <option value="">—</option>
          {spec.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
      break;
    case 'multi_enum':
      control = (
        <div className="options">
          {spec.options.map((o) => <label key={o.value}><input type="checkbox" name={name} value={o.value} /> {o.label}</label>)}
        </div>
      );
      break;
    case 'integer':
    case 'number':
      control = <input type="number" name={name} step={spec.kind === 'integer' ? 1 : 'any'} />;
      break;
    case 'date':
      control = <input type="date" name={name} />;
      break;
    case 'long_text':
      control = <textarea name={name} />;
      break;
    case 'list':
      control = <textarea name={name} placeholder="One per line" />;
      break;
    case 'json': {
      const example = spec.item_fields
        ? JSON.stringify([Object.fromEntries(Object.entries(spec.item_fields).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]))], null, 2)
        : '{ }';
      control = (
        <>
          <textarea name={name} placeholder={example} rows={6} />
          {spec.item_fields ? (
            <details>
              <summary>Fields per row</summary>
              <ul className="muted">
                {Object.entries(spec.item_fields).map(([k, v]) => <li key={k}><code>{k}</code>: {Array.isArray(v) ? v.join(' · ') : v}</li>)}
              </ul>
            </details>
          ) : null}
        </>
      );
      break;
    }
    default:
      control = <input type="text" name={name} />;
  }
  return (
    <div className="field">
      {label ? <label>{label}</label> : null}
      {control}
    </div>
  );
}

function ShopifyKnowledge({ shopify }) {
  if (!shopify) return null;
  return (
    <details>
      <summary>Shopify knowledge (consultant only)</summary>
      <ul className="muted">
        {(shopify.native ?? []).map((n) => (
          <li key={n.feature}>
            <a href={n.docs} target="_blank" rel="noreferrer">{n.feature}</a> — from {n.plan}{n.plan_note ? ` (${n.plan_note})` : ''}
          </li>
        ))}
        {shopify.apps?.length ? <li>App Store candidates: {shopify.apps.join(', ')}</li> : null}
      </ul>
    </details>
  );
}

function QuestionCard({ question, actionData, busy }) {
  const errors = actionData?.question_id === question.id ? actionData.errors?.length ? actionData.errors : [actionData.error] : [];
  const consent = question.id === 'Q10.5.2';
  return (
    <section className="card">
      <div className="meta">
        {question.id} · {question.subsection} · <span className="badge">{question.priority}</span>
        {question.audience === 'consultant' ? <span className="badge">consultant</span> : null}
        {question.block === 'consultant_wrap_up' ? <span className="badge">wrap-up</span> : null}
      </div>
      <p className="question">{question.text}</p>
      {question.help ? <p className="muted">{question.help}</p> : null}
      <ShopifyKnowledge shopify={question.shopify} />
      <Form method="post" key={question.id}>
        <input type="hidden" name="question_id" value={question.id} />
        {question.inputs.map((spec) => <FieldInput key={spec.pointer} spec={spec} showLabel={question.inputs.length > 1} />)}
        <div className="field">
          <label>Note (original wording, caveats — no personal data)</label>
          <input type="text" name="note" />
        </div>
        {errors.length ? <ul className="errors">{errors.map((e) => <li key={e}>{e}</li>)}</ul> : null}
        <div className="actions">
          <button type="submit" name="intent" value="answer" disabled={busy}>Record answer</button>
          {!consent ? (
            <>
              <label className="muted"><input type="checkbox" name="tbc_status" /> to confirm with client</label>
              <button type="submit" name="intent" value="tbc" className="secondary" disabled={busy}>TBC</button>
              <button type="submit" name="intent" value="skipped" className="secondary" disabled={busy}>Not applicable</button>
            </>
          ) : null}
        </div>
      </Form>
    </section>
  );
}

const RESULT_CLASS = { STOP: 'stop', FLAG: 'flag', WARN: 'warn' };

function PreviewPanel({ preview }) {
  const signals = Object.entries(preview.app_signals ?? {}).filter(([, reasons]) => reasons.length);
  return (
    <aside className="panel">
      <h2>Offer</h2>
      <p>
        <strong>{preview.offer.code} · {preview.offer.name}</strong>{' '}
        {preview.offer.provisional ? <span className="badge provisional">provisional</span> : null}
      </p>
      <p>{preview.go ? <span className="badge go">GO</span> : <span className="badge stop">STOP · route: {words(preview.route ?? 'not decided')}</span>}</p>

      <h3>Scope gates</h3>
      <ul>{Object.entries(preview.scope_gates).map(([id, state]) => <li key={id}>{words(id)}: {state}</li>)}</ul>
      <h3>L triggers</h3>
      <ul>{Object.entries(preview.l_triggers).map(([id, state]) => <li key={id}>{words(id)}: {state}</li>)}</ul>

      <h3>Exit rules</h3>
      {preview.exit_rules.length ? (
        <ul>{preview.exit_rules.map((r) => <li key={r.rule}><span className={`badge ${RESULT_CLASS[r.result] ?? ''}`}>{r.rule} {r.result}</span> {r.evidence}</li>)}</ul>
      ) : <p className="muted">None fired.</p>}

      {preview.plan_suggestion ? (
        <>
          <h3>Shopify plan (minimum for these answers)</h3>
          <p>{preview.plan_suggestion.value}</p>
          <ul>{preview.plan_suggestion.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
        </>
      ) : null}

      <h3>Coverage</h3>
      <p>{preview.coverage.required_answered} of {preview.coverage.required_total} required answered · {preview.coverage.required_tbc} TBC · {preview.coverage.required_open} open</p>

      {signals.length ? (
        <>
          <h3>App signals</h3>
          <ul>{signals.map(([area, reasons]) => <li key={area}>{words(area)}: {reasons.join('; ')}</li>)}</ul>
        </>
      ) : null}
    </aside>
  );
}

export default function Engagement({ loaderData, actionData }) {
  const { engagement, next, preview, notes, tbc } = loaderData;
  const busy = useNavigation().state !== 'idle';
  return (
    <main>
      <p><Link to="/">← Engagements</Link></p>
      <h1>{engagement.client}</h1>
      <p className="muted">
        {engagement.mode} interview · {engagement.language} · owner {engagement.owner ?? '—'} · updated {engagement.updated_at} · {next.remaining} questions open
        {typeof next.remaining_client === 'number' ? ` (${next.remaining_client} for the client)` : ''}
      </p>
      <div className="layout">
        <div>
          {next.consent_required ? <p className="error">Record the client's consent for AI processing before any other answer.</p> : null}
          {next.questions.length ? next.questions.map((q) => <QuestionCard key={q.id} question={q} actionData={actionData} busy={busy} />) : (
            <section className="card">
              <p className="question">All questions for this mode are answered.</p>
              <p className="muted">Finishing the discovery (approach, deck, backlog) comes in 2.0.0-beta; use <code>npm run interview -- finish --client {engagement.client}</code> meanwhile.</p>
            </section>
          )}

          <h2>Consultant notes</h2>
          {notes.length ? <ul>{notes.map((n, i) => <li key={i}>{n.at}: {n.text}</li>)}</ul> : <p className="muted">No notes.</p>}
          <Form method="post" className="actions">
            <input type="text" name="text" placeholder="Context that is not an answer (no personal data)" />
            <button type="submit" name="intent" value="note" className="secondary" disabled={busy}>Add note</button>
          </Form>
          {actionData?.intent === 'note' && actionData.error ? <ul className="errors">{(actionData.errors?.length ? actionData.errors : [actionData.error]).map((e) => <li key={e}>{e}</li>)}</ul> : null}

          {Object.keys(tbc).length ? (
            <>
              <h2>To confirm with the client</h2>
              <ul>{Object.entries(tbc).map(([id, note]) => <li key={id}>{id}{note ? `: ${note}` : ''}</li>)}</ul>
            </>
          ) : null}
        </div>
        <PreviewPanel preview={preview} />
      </div>
    </main>
  );
}
