import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { ServiceError } from '../../../discovery/service/index.js';
import { EngagementErrorBoundary, Blockers, EngagementHeader } from '../components/question.jsx';
import { pageTitle } from '../brand.js';

export const meta = ({ params }) => [{ title: pageTitle('Handover', params.client) }];

/**
 * What delivery receives. The backlog and the workbook were only ever reachable
 * by running npm scripts against an engagement.json the web app does not write,
 * so the discovery appeared to finish at the closing document — when what it
 * finishes at is the thing the build team opens on day one.
 */
export async function loader({ request, params }) {
  const user = await requireUser(request);
  try {
    return { ...(await discovery().getHandover(user, params.client)), blocked: null };
  } catch (err) {
    // Handover is a permanent step on a discovery and a view on a bid, so an
    // incomplete record reaches it by clicking the nav. Rethrowing dropped the
    // consultant on a bare "Cannot do that yet" with the record, the steps and
    // every fix-link gone, while three sibling pages named the blockers.
    if (!(err instanceof ServiceError)) throw serviceFailure(err);
    const { engagement } = await discovery().getSummary(user, params.client);
    return { engagement, handover: null, blocked: { error: err.message, errors: err.errors ?? [], blockers: err.blockers ?? [] } };
  }
}

const OWNER = {
  agent: 'Claude Code agent',
  developer: 'Developer',
  consultant: 'Consultant',
  client: 'Client',
};

/**
 * What the backlog was built from, said plainly where it is downloaded. An
 * unfinished interview still produces a complete-looking CSV, and the page said
 * "ready" with nothing to the contrary — so delivery could open 64 stories
 * resting on two dozen questions nobody asked.
 */
function RestsOn({ on }) {
  if (!on) return null;
  const short = Math.max(0, (on.required_total ?? 0) - (on.required_answered ?? 0));
  const gaps = [
    short ? `${short} required question${short === 1 ? '' : 's'} still unanswered` : null,
    on.to_review ? `${on.to_review} answer${on.to_review === 1 ? '' : 's'} nobody has confirmed` : null,
    on.closing_document_at ? null : 'no closing document agreed with the client',
    on.assumptions ? `${on.assumptions} stated assumption${on.assumptions === 1 ? '' : 's'}` : null,
  ].filter(Boolean);
  if (!gaps.length) return null;
  return (
    <div className="card blocked">
      <p className="question">What this backlog does not rest on</p>
      <p className="muted">It is built from the answers that exist today. Before delivery works from it, they need to know it carries:</p>
      <ul>{gaps.map((g) => <li key={g}>{g}</li>)}</ul>
      <p className="muted">Finishing the earlier steps changes the backlog. Hand it over now only if delivery is told this with it.</p>
    </div>
  );
}

export default function Handover({ loaderData }) {
  const { engagement, handover, blocked } = loaderData;
  const client = engagement.client;
  if (blocked) {
    return (
      <main id="main">
        <EngagementHeader engagement={engagement} eyebrow="Handover" />
        <section className="card start blocked">
          <p className="question">{blocked.error}</p>
          <p className="muted">Delivery gets nothing from this record until the answers behind it exist.</p>
          <Blockers from={`/engagements/${client}/handover`} items={blocked.blockers} errors={blocked.errors} client={client} />
        </section>
      </main>
    );
  }
  const { backlog, workbook } = handover;

  return (
    <main id="main">
      <EngagementHeader
        engagement={engagement}
        eyebrow="Handover"
        meta={backlog.available ? `${backlog.stories} stories · ${backlog.points} points · ${backlog.epics.length} epics` : null}
      />

      <RestsOn on={handover.rests_on} />

      {/* 1 — the build backlog */}
      <section className={`card start ${backlog.available ? 'current' : 'blocked'}`}>
        <div className="start-head">
          <div>
            <p className="question">{backlog.available ? 'The build backlog is ready' : 'No build backlog for this engagement'}</p>
            <p className="muted">
              {backlog.available
                ? `Generated from the answers — ${backlog.stories} stories across ${backlog.epics.length} epics, each with its acceptance criteria, the fields it was built from and an agent prompt. The CSV imports straight into Jira.`
                : backlog.blocked.why}
            </p>
          </div>
          {backlog.available ? <span className="badge go">{handover.offer.code}</span> : <span className="badge flag">{backlog.blocked.label ?? 'decision needed'}</span>}
        </div>
        {backlog.available ? (
          <div className="actions">
            <a className="button" href={`/engagements/${client}/handover-backlog.csv`}>Download for Jira (CSV)</a>
            <a className="button secondary" href={`/engagements/${client}/handover-backlog.md`}>Read it as Markdown</a>
          </div>
        ) : null}
      </section>

      {/* 2 — what is in it */}
      {backlog.available ? (
        <section>
          <h2>What is in it</h2>
          <div className="table-scroll" role="region" tabIndex={0} aria-label="The backlog, scrollable table">
            <table>
              <thead><tr><th scope="col">Epic</th><th scope="col">Stories</th><th scope="col">Points</th></tr></thead>
              <tbody>
                {backlog.epics.map((e) => (
                  <tr key={e.epic}><td>{e.epic}</td><td>{e.stories}</td><td>{e.points}</td></tr>
                ))}
              </tbody>
              <tfoot><tr><th scope="row">Total</th><th scope="col">{backlog.stories}</th><th scope="col">{backlog.points}</th></tr></tfoot>
            </table>
          </div>

          <h2>Who the work falls to</h2>
          <p className="muted">
            Each story records who does it. This is the closest the tool gets to a team shape today — it counts
            stories, not effort, so read it as a distribution and not as a staffing plan.
          </p>
          <ul className="ticks">
            {backlog.owners.map((o) => <li key={o.owner}>{OWNER[o.owner] ?? o.owner} — {o.stories} stor{o.stories === 1 ? 'y' : 'ies'}</li>)}
          </ul>
        </section>
      ) : null}

      {/* 3 — the client's homework */}
      <section className="card">
        <h2>Configuration workbook</h2>
        <p className="muted">
          The tax, shipping and market set-up only the client can supply, as a document they fill in once the
          scope is agreed. It follows their answers: markets, registrations, carriers and returns are already
          pre-filled, and the sections that do not apply are left out.
        </p>
        <div className="actions">
          <a className="button secondary" href={`/engagements/${client}/handover-workbook.md`}>Download the workbook</a>
        </div>
        {!backlog.available ? (
          <p className="muted small">
            The workbook is produced whatever the route: tax and shipping have to be collected either way.
          </p>
        ) : null}
      </section>
    </main>
  );
}

// The record survives a page that does not.
export const ErrorBoundary = EngagementErrorBoundary;
