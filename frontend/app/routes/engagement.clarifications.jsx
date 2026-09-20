import { useEffect } from 'react';
import { Form, useNavigation, useRevalidator } from 'react-router';

import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { Blockers, EngagementHeader, WithQuestionLinks } from '../components/question.jsx';
import { ServiceError } from '../../../discovery/service/index.js';
import { pageTitle } from '../brand.js';

export const meta = ({ params }) => [{ title: pageTitle('RFP Q&A', params.client) }];

/**
 * What Merkle sends back after reading an RFP. The engine has already chosen the
 * topics — this page is where the Lead Consultant reads what Claude wrote from
 * them, and takes the client-facing copy away to send.
 */
export async function loader({ request, params }) {
  const user = await requireUser(request);
  try {
    const saved = await discovery().getClarifications(user, params.client);
    let readiness;
    try {
      const prepared = await discovery().prepareClarifications(user, params.client);
      readiness = { ok: true, topics: prepared.topics ?? [], cannot_price: prepared.cannot_price_until_answered ?? [] };
    } catch (err) {
      if (!(err instanceof ServiceError)) throw err;
      readiness = { ok: false, error: err.message, errors: err.errors ?? [], blockers: err.blockers ?? [] };
    }
    return { ...saved, readiness };
  } catch (err) {
    throw serviceFailure(err);
  }
}

export async function action({ request, params }) {
  const user = await requireUser(request);
  const form = await request.formData();
  try {
    const result = await discovery().decideClarifications(user, params.client, {
      id: form.get('id') ? String(form.get('id')) : undefined,
      status: String(form.get('status') ?? ''),
      all: form.get('all') === '1',
    });
    return { ok: true, ...result };
  } catch (err) {
    return serviceFailure(err);
  }
}

const VIA = { claude: 'Claude', web: 'web app', cli: 'CLI' };

/** Accept or reject, as two plain posts. */
function Decide({ id, status, busy }) {
  return (
    <div className="decide-actions">
      <Form method="post">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value="accepted" />
        <button type="submit" className={status === 'accepted' ? '' : 'secondary'} disabled={busy}>
          {status === 'accepted' ? 'Accepted' : 'Ask this'}
        </button>
      </Form>
      <Form method="post">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value="rejected" />
        <button type="submit" className={status === 'rejected' ? 'destructive' : 'secondary'} disabled={busy}>
          {status === 'rejected' ? 'Not asked' : 'Don’t ask — assume it'}
        </button>
      </Form>
    </div>
  );
}

export default function Clarifications({ loaderData, actionData }) {
  const { engagement, clarifications, triage, assumptions, documents, readiness, freshness, replies, reply_prompt: replyPrompt } = loaderData;
  const client = engagement.client;
  const busy = useNavigation().state !== 'idle';
  const questions = clarifications?.questions ?? [];
  const saved = questions.length > 0;

  const prompt = `Write Merkle's questions on the RFP for ${client}.

Call prepare_clarifications and read the topics the engine chose — the unknowns that move the offer, the Shopify plan, the store topology, the cost or the risk. Check every Shopify fact in the official documentation before you state it. Then write one question per topic, each opening in the client's own words and followed by a short "Why we ask" that shows the trade-off, and save them with save_clarifications.

Write every question we need answered to price this properly — the Lead Consultant decides which are actually sent, and anything not asked becomes a stated assumption in the proposal. Tell me what you saved and what each question is for.`;

  // While Claude is writing them, the page picks them up by itself.
  const revalidator = useRevalidator();
  useEffect(() => {
    if (saved) return undefined;
    const id = setInterval(() => {
      if (revalidator.state === 'idle' && globalThis.document?.visibilityState === 'visible') revalidator.revalidate();
    }, 20000);
    return () => clearInterval(id);
  }, [revalidator, saved]);

  return (
    <main id="main">
      <EngagementHeader
        engagement={engagement}
        eyebrow="RFP Q&A"
        meta={saved ? `${triage.accepted.length} to ask · ${triage.rejected.length} assumed · ${triage.proposed.length} to decide` : null}
      />

      {/* 1 — what to do now */}
      <section className={`card start ${readiness.ok ? (triage.ready_to_send ? 'current' : 'none') : 'blocked'}`}>
        <div className="start-head">
          <div>
            <p className="question">
              {!saved ? 'Not written yet'
                : triage.proposed.length ? `${triage.proposed.length} question${triage.proposed.length > 1 ? 's' : ''} waiting on you`
                  : `${triage.accepted.length} question${triage.accepted.length === 1 ? '' : 's'} ready to send`}
            </p>
            <p className="muted">
              {readiness.ok && !saved
                ? `The engine found ${readiness.topics.length} topic${readiness.topics.length > 1 ? 's' : ''} that have to be settled before this can be priced. Claude writes a question for each; you decide which are actually asked.`
                : saved
                  ? 'Every question here is one the proposal needs an answer to. Ask it, or decide not to and it becomes a stated assumption — there is no third option, and nothing is dropped.'
                  : readiness.error}
            </p>
          </div>
          {saved && triage.ready_to_send ? <span className="badge go">ready</span> : null}
        </div>

        {readiness.ok ? (
          <div className="actions">
            <a className="button" href={`https://claude.ai/new?q=${encodeURIComponent(prompt)}`} target="_blank" rel="noreferrer">
              {saved ? 'Write them again' : 'Write the questions in Claude'}
            </a>
            <button type="button" className="secondary" onClick={() => navigator.clipboard?.writeText(prompt)}>Copy the instruction</button>
            {!saved ? <span className="muted">This page updates itself when Claude saves.</span> : null}
          </div>
        ) : (
          <Blockers items={readiness.blockers} errors={readiness.errors} client={client} />
        )}
        {actionData?.error ? <p className="error">{actionData.error}</p> : null}
        {actionData?.warning ? (
          <div className="shape-warning">
            <p className="eyebrow">This one is not a detail</p>
            <p>{actionData.warning}</p>
            <ul className="ticks">{(actionData.shape_assumed ?? []).map((q) => <li key={q}>{q}</li>)}</ul>
          </div>
        ) : null}
      </section>

      {/* The questions are a snapshot and the engagement moves under them: answers
          get confirmed, documents get read in, and what is still open changes. */}
      {saved && !freshness.up_to_date ? (
        <section className="card start blocked">
          <div className="start-head">
            <div>
              <p className="question">
                {freshness.uncovered.length} topic{freshness.uncovered.length === 1 ? '' : 's'} these questions do not cover
              </p>
              <p className="muted">
                They were written from an earlier reading of the engagement. Since then the engine has found more
                that has to be settled before this can be priced — writing them again keeps what you already
                decided on the questions it rewrites.
              </p>
            </div>
            <span className="badge flag">out of date</span>
          </div>
          <ul className="ticks">
            {freshness.uncovered.map((t) => (
              <li key={t.title}><strong>{t.title}</strong> — settles {t.settles} unknown{t.settles === 1 ? '' : 's'}{t.impact === 'high' ? ', and changes the shape of the solution' : ''}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* 2 — and back again. The questions left the building and nothing used to
          bring the answers home. */}
      {triage.accepted.length ? (
        <section className={`card start ${replies.all_back ? 'current' : 'none'}`}>
          <div className="start-head">
            <div>
              <p className="question">
                {replies.all_back ? `All ${replies.asked} answered` : `${replies.back} of ${replies.asked} answered`}
              </p>
              <p className="muted">
                {replies.all_back
                  ? 'Everything Merkle asked has come back and is recorded against the questions it fills.'
                  : 'When the client replies, read it in here. Each question names the discovery questions it fills, so the answers land where they belong instead of being typed in from memory — and anything the reply does not cover stays a stated assumption.'}
              </p>
            </div>
            <span className={`badge ${replies.all_back ? 'go' : 'flag'}`}>{replies.back}/{replies.asked}</span>
          </div>
          {!replies.all_back && replies.asked ? (
            <div className="actions">
              <a className="button" href={`https://claude.ai/new?q=${encodeURIComponent(replyPrompt)}`} target="_blank" rel="noreferrer">Read the client’s reply in Claude</a>
              <button type="button" className="secondary" onClick={() => navigator.clipboard?.writeText(replyPrompt)}>Copy the instruction</button>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* 3 — the triage */}
      {saved ? (
        <section>
          <div className="section-head">
            <h2>{triage.proposed.length ? `To decide (${triage.proposed.length})` : 'The questions'}</h2>
            {triage.proposed.length ? (
              <div className="actions">
                <Form method="post">
                  <input type="hidden" name="all" value="1" />
                  <input type="hidden" name="status" value="accepted" />
                  <button type="submit" className="secondary" disabled={busy}>Ask all of them</button>
                </Form>
                <Form method="post">
                  <input type="hidden" name="all" value="1" />
                  <input type="hidden" name="status" value="rejected" />
                  <button type="submit" className="secondary" disabled={busy}>Assume all of them</button>
                </Form>
              </div>
            ) : (
              <div className="actions">
                <a className="button secondary" href={`/engagements/${client}/clarifications.md`}>Download to send</a>
                <a className="muted-link" href={`/engagements/${client}/clarifications.md?internal=1`}>Internal copy</a>
              </div>
            )}
          </div>
          <p className="muted">
            The download to send holds only what you accepted — the question and the “Why we ask” paragraph.
            What we would assume, and which discovery questions each one covers, are in the internal copy.
          </p>
          <ol className="clarifications">
            {questions.map((q) => (
              <li key={q.id} className={`q-${q.status ?? 'proposed'}`}>
                {/* The question is what you scan; the reasoning is what you open.
                    Ten lines of "Why we ask" on every one of eleven made the page
                    a wall you had to read to triage. Still to decide opens by
                    itself — that is the one waiting on you. */}
                <details open={(q.status ?? 'proposed') === 'proposed'}>
                  <summary>
                    <h3 className="q-text">{q.question}</h3>
                    <span className="q-badges">
                      {q.status === 'accepted' && replies.rows.find((r) => r.id === q.id)?.answered
                        ? <span className="badge go">answered</span>
                        : null}
                      {q.shape_changing ? <span className="badge flag">changes the shape</span> : null}
                    </span>
                  </summary>
                  <p className="why"><strong>Why we ask.</strong> {q.why_we_ask}</p>
                  <div className="for-us">
                    <p className="eyebrow">For us — not sent</p>
                    {q.shape_changing ? (
                      <p className="shape-note">Changes the shape of the solution, not a detail inside it — assuming it is assuming the size of the engagement.</p>
                    ) : null}
                    {(q.covers ?? []).length ? (
                      <p className="muted">Covers <WithQuestionLinks text={(q.covers ?? []).join(', ')} client={client} /></p>
                    ) : null}
                    <p className="muted">If we don’t ask it, the proposal assumes: {q.assume_if_unanswered}</p>
                  </div>
                </details>
                {/* Outside the fold: you can decide without opening it. */}
                <Decide id={q.id} status={q.status ?? 'proposed'} busy={busy} />
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* 3 — what the proposal will stand on */}
      {assumptions.length ? (
        <section>
          <h2>What the proposal will assume ({assumptions.length})</h2>
          <p className="muted">
            Everything nobody could tell us otherwise — what the engine had to assume to recommend anything, and
            every question you decided not to ask. This is where a bid loses money, so it is written down rather
            than carried in somebody’s head, and it goes into the proposal as a stated assumption.
          </p>
          <ul className="assumptions">
            {assumptions.map((a, i) => (
              <li key={`${a.assumed}-${i}`} className={a.source}>
                <p className="assumed">{a.assumed}</p>
                <p className="muted">
                  {a.about}
                  {a.covers?.length ? <> · <WithQuestionLinks text={a.covers.join(', ')} client={client} /></> : null}
                  {a.source === 'rejected' ? ' · we decided not to ask this' : ''}
                </p>
                {a.impact_if_wrong ? <p className="muted small">If wrong: {a.impact_if_wrong}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* 4 — what it was read from */}
      {documents.length ? (
        <section>
          <h2>Read from</h2>
          <ul>{documents.map((d) => <li key={d.name}><strong>{d.name}</strong> · {d.type}{d.date ? ` · ${d.date}` : ''}</li>)}</ul>
        </section>
      ) : null}
    </main>
  );
}
