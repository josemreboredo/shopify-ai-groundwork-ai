import { Form, redirect, useNavigation } from 'react-router';

import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { EngagementHeader } from '../components/question.jsx';
import { PROCESSES, processMeta } from '../../../discovery/service/process.js';

export const meta = ({ params }) => [{ title: `Change · ${params.client} · Merkle Discovery` }];

/**
 * Everything about the record itself, in one place.
 *
 * These controls used to be scattered: what the record is sat in a dropdown next
 * to the interview depth in the review table, and deleting it hid at the bottom
 * of the same page. Two of them change the whole shape of the work and one is
 * irreversible, so they were competing for attention with 157 rows of answers.
 * Here they are the only thing on the page, in the order they matter.
 */
export async function loader({ request, params }) {
  const user = await requireUser(request);
  try {
    const { engagement } = await discovery().getSummary(user, params.client);
    return { engagement };
  } catch (err) {
    throw serviceFailure(err);
  }
}

export async function action({ request, params }) {
  const user = await requireUser(request);
  const form = await request.formData();
  const intent = String(form.get('intent') ?? '');
  try {
    if (intent === 'won') {
      const result = await discovery().markBidWon(user, params.client);
      return { ok: true, intent, ...result };
    }
    if (intent === 'process') {
      const result = await discovery().setProcess(user, params.client, { process: String(form.get('process') ?? '') });
      return { ok: true, intent, ...result };
    }
    if (intent === 'mode') {
      const result = await discovery().setInterviewMode(user, params.client, { mode: String(form.get('mode') ?? '') });
      return { ok: true, intent, ...result };
    }
    if (intent === 'delete') {
      await discovery().deleteEngagement(user, params.client, { confirm: String(form.get('confirm') ?? '') });
      return redirect('/');
    }
  } catch (err) {
    return serviceFailure(err, { intent });
  }
  return { error: 'Unknown action' };
}

const MODES = [
  ['quick', 'Quick — required questions only'],
  ['standard', 'Standard — required and recommended'],
  ['full', 'Full — everything'],
];

export default function Settings({ loaderData, actionData }) {
  const { engagement } = loaderData;
  const busy = useNavigation().state !== 'idle';
  const rfp = engagement.process === 'rfp';
  const words = processMeta(engagement.process);
  const other = rfp ? PROCESSES.discovery : PROCESSES.rfp;
  const said = (intent) => actionData?.ok && actionData.intent === intent;
  const failed = (intent) => actionData?.error && actionData.intent === intent;

  return (
    <main>
      <EngagementHeader engagement={engagement} eyebrow="Change" />

      {/* 1 — the milestone, when there is one to record */}
      {rfp && engagement.closing_document_at ? (
        <section className="card start">
          <div className="start-head">
            <div>
              <p className="question">Did we win it?</p>
              <p className="muted">
                The proposal went out on {engagement.closing_document_at}. If Merkle won, this becomes an
                engagement and the work carries on here — the RFP, every answer read out of it with its
                citation, the questions you sent and each version of the proposal all stay where they are.
              </p>
            </div>
          </div>
          <div className="actions">
            <Form method="post">
              <button type="submit" name="intent" value="won" className="button" disabled={busy}>We won it — make it an engagement</button>
            </Form>
          </div>
          {said('won') ? <p className="muted">Now an engagement, won {actionData.won_at}. Nothing was moved or deleted.</p> : null}
          {failed('won') ? <p className="error">{actionData.error}</p> : null}
        </section>
      ) : null}

      {/* 2 — what this record is: needed once, if ever, so it stays closed */}
      <details className="card prefill">
        <summary>
          <span className="prefill-title">What this is</span>
          <span className="muted prefill-status">{words.a.replace(/^./, (c) => c.toUpperCase())} — {words.label}</span>
        </summary>
        <p className="muted">{words.lede}</p>
        {engagement.won ? (
          <p className="muted">Won from a bid on {engagement.won.at}, recorded by {engagement.won.by}.</p>
        ) : null}
        <p className="muted">
          Change it only if the record was started as the wrong kind. It reorders the steps and renames the
          document; not one answer, document or saved version is touched.
        </p>
        <Form method="post" className="actions">
          <input type="hidden" name="intent" value="process" />
          <input type="hidden" name="process" value={other.id} />
          <button type="submit" className="secondary" disabled={busy}>This is not {words.a} — make it {other.a}</button>
        </Form>
        {said('process') ? <p className="muted">Changed to {processMeta(actionData.process).a} — no answer has changed.</p> : null}
        {failed('process') ? <p className="error">{actionData.error}</p> : null}
      </details>

      {/* 3 — how deep the questions go */}
      <section className="card">
        <h2>How many questions</h2>
        <p className="muted">
          The depth decides which questions are ever asked: a quick interview never reaches a
          <em> recommended</em> question, however relevant it has become. Widening it never loses an answer.
        </p>
        <Form method="post" className="mode-form">
          <input type="hidden" name="intent" value="mode" />
          <label htmlFor="mode" className="muted">Depth</label>
          <select id="mode" name="mode" defaultValue={engagement.mode}>
            {MODES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <button type="submit" className="secondary" disabled={busy}>Change</button>
        </Form>
        {said('mode') ? <p className="muted">Depth changed from {actionData.was} to {actionData.mode} — {actionData.remaining} questions open.</p> : null}
        {failed('mode') ? <p className="error">{actionData.error}</p> : null}
      </section>

      {/* 4 — the one that cannot be undone */}
      <details className="danger">
        <summary>Delete this {words.record.toLowerCase()}</summary>
        <p className="muted">
          Deletes every answer, document, note, the approach and every saved version of the document for{' '}
          <strong>{engagement.client}</strong>. It cannot be undone, and files you already downloaded are not affected.
        </p>
        {failed('delete') ? <p className="error">{actionData.error}</p> : null}
        <Form method="post" className="danger-form">
          <input type="hidden" name="intent" value="delete" />
          <div className="field">
            <label htmlFor="confirm">Type <code>{engagement.client}</code> to confirm</label>
            <input id="confirm" name="confirm" autoComplete="off" placeholder={engagement.client} required />
          </div>
          <button type="submit" className="destructive" disabled={busy}>Delete</button>
        </Form>
      </details>
    </main>
  );
}
