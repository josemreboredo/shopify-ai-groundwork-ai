import { Form, redirect, useNavigation } from 'react-router';

import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { EngagementErrorBoundary, EngagementHeader } from '../components/question.jsx';
import { PROCESSES, processMeta } from '../../../discovery/service/process.js';
import { OUTCOMES, outcomesFor } from '../../../discovery/service/outcome.js';
import { pageTitle } from '../brand.js';
import { LANGUAGES, LANGUAGE_NAMES } from '../../../discovery/agents/language.js';

export const meta = ({ params }) => [{ title: pageTitle('Change', params.client) }];

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
    // What the model has already written, and in which language. The engagement's
    // language can be corrected; a document that exists cannot re-write itself,
    // so the page has to say which ones would be left behind.
    const written = await discovery().languageState(user, params.client);
    return { engagement, written };
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
    if (intent === 'language') {
      const result = await discovery().setLanguage(user, params.client, { language: String(form.get('language') ?? '') });
      return { ok: true, intent, ...result };
    }
    if (intent === 'mode') {
      const result = await discovery().setInterviewMode(user, params.client, { mode: String(form.get('mode') ?? '') });
      return { ok: true, intent, ...result };
    }
    if (intent === 'outcome') {
      const price = String(form.get('submitted_price') ?? '').trim();
      const result = await discovery().recordOutcome(user, params.client, {
        outcome: String(form.get('outcome') ?? ''),
        submitted_price: price ? Number(price) : undefined,
        currency: String(form.get('currency') ?? '').trim() || undefined,
        note: String(form.get('note') ?? ''),
      });
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
  const { engagement, written } = loaderData;
  const stale = written.filter((w) => !w.matches);
  const busy = useNavigation().state !== 'idle';
  const rfp = engagement.process === 'rfp';
  const words = processMeta(engagement.process);
  const other = rfp ? PROCESSES.discovery : PROCESSES.rfp;
  const said = (intent) => actionData?.ok && actionData.intent === intent;
  const failed = (intent) => actionData?.error && actionData.intent === intent;

  return (
    <main id="main">
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
                citation, the questions you sent and each version of the client document all stay where they are.
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

      {/* 3 — the language, which had no way of being corrected at all. An
             engagement started in the wrong one stayed in it for ever. */}
      <details className="card prefill">
        <summary>
          <span className="prefill-title">Language</span>
          <span className="muted prefill-status">
            {LANGUAGE_NAMES[engagement.language] ?? engagement.language}
            {stale.length ? ` · ${stale.length} document${stale.length === 1 ? '' : 's'} in another language` : ''}
          </span>
        </summary>
        <p className="muted">
          The language the client is asked in, and the language every document they read is written in.
          Changing it is a correction and is always allowed. Nothing recorded moves: answers are held in
          English whatever language the questions were asked in, and a quotation from the client's own
          documents stays exactly as they wrote it.
        </p>
        {written.length ? (
          <>
            <p className="muted">Already written, and in which language:</p>
            <ul className="ticks">
              {written.map((w, i) => (
                <li key={`${w.where}-${i}`}>
                  <strong>{w.what}</strong> — {w.language ? (LANGUAGE_NAMES[w.language] ?? w.language) : 'written before the tool recorded the language'}
                  {w.detail ? <span className="muted"> · {w.detail}</span> : null}
                  {!w.matches ? <span className="badge flag">not the engagement's language</span> : null}
                  <div className="muted small">
                    Changing the language now will not rewrite it. Write it again to have it in the new language.
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="muted">Nothing has been written yet, so there is nothing a change would leave behind.</p>
        )}
        <Form method="post" className="inline-form">
          <input type="hidden" name="intent" value="language" />
          <div className="field">
            <label htmlFor="language">Run this {words.record.toLowerCase()} in</label>
            <select id="language" name="language" defaultValue={engagement.language}>
              {LANGUAGES.map((code) => <option key={code} value={code}>{LANGUAGE_NAMES[code]}</option>)}
            </select>
          </div>
          <button type="submit" className="secondary" disabled={busy}>Change the language</button>
        </Form>
        {said('language') ? (
          <p className="muted">
            Now {LANGUAGE_NAMES[actionData.language] ?? actionData.language}, was {LANGUAGE_NAMES[actionData.was] ?? actionData.was}.
            {actionData.coverage?.complete === false
              ? ` ${actionData.coverage.questions} of ${actionData.coverage.of} questions are translated so far; the rest are asked in English.`
              : ''}
            {(actionData.written_in ?? []).some((w) => !w.matches)
              ? ' What was already written stays in the language it was written in — write it again to change it.'
              : ' Nothing had been written yet, so nothing was left behind.'}
          </p>
        ) : null}
        {failed('language') ? <p className="error">{actionData.error}</p> : null}
      </details>

      {/* 4 — what happened to it. The one thing only Merkle can know. */}
      <section className="card">
        <h2>What happened to this {words.record.toLowerCase()}</h2>
        <p className="muted">
          Winning had a button and nothing else did — not a loss, not a submission, not a decision to walk
          away. Every number this tool quotes rests on Merkle’s offering rather than on a delivered project,
          because there has not been one; this is the record that eventually fixes that. It is also the only
          way to ever say whether any of the rest of this helps.
        </p>
        {engagement.outcome ? (
          <p className="question">Recorded as <strong>{OUTCOMES[engagement.outcome]?.label ?? engagement.outcome}</strong> — {OUTCOMES[engagement.outcome]?.meaning}</p>
        ) : null}
        <Form method="post" className="outcome-form">
          <input type="hidden" name="intent" value="outcome" />
          <div className="field">
            <label htmlFor="outcome">Outcome</label>
            <select id="outcome" name="outcome" defaultValue={engagement.outcome ?? 'submitted'}>
              {Object.entries(outcomesFor(engagement.process)).map(([id, o]) => <option key={id} value={id}>{o.label} — {o.meaning}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="submitted_price">Price submitted <span className="muted">(optional)</span></label>
            <input id="submitted_price" name="submitted_price" type="number" min="0" step="1000" placeholder="88000" />
          </div>
          <div className="field">
            <label htmlFor="currency">Currency</label>
            <input id="currency" name="currency" placeholder="EUR" maxLength={3} autoComplete="off" />
          </div>
          <div className="field wide">
            <label htmlFor="note">Why <span className="muted">(what decided it — the thing a number will never say)</span></label>
            <input id="note" name="note" placeholder="Lost on price; incumbent retained" />
          </div>
          <button type="submit" className="secondary" disabled={busy}>Record it</button>
        </Form>
        {said('outcome') ? (
          <p className="muted">
            Recorded. The engine’s position at this moment is frozen with it — what it classified, what it said
            about pricing and how much it had to assume — because the question a year from now is what it said
            at the time.
          </p>
        ) : null}
        {failed('outcome') ? <p className="error">{actionData.error}</p> : null}
      </section>

      {/* 4 — how deep the questions go */}
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

// The record survives a page that does not.
export const ErrorBoundary = EngagementErrorBoundary;
