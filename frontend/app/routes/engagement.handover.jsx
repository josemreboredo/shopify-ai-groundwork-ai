import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { EngagementHeader, WithQuestionLinks } from '../components/question.jsx';
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
    return await discovery().getHandover(user, params.client);
  } catch (err) {
    throw serviceFailure(err);
  }
}

const OWNER = {
  agent: 'Claude Code agent',
  developer: 'Developer',
  consultant: 'Consultant',
  client: 'Client',
};

export default function Handover({ loaderData }) {
  const { engagement, handover } = loaderData;
  const client = engagement.client;
  const { backlog, workbook } = handover;

  return (
    <main>
      <EngagementHeader
        engagement={engagement}
        eyebrow="Handover"
        meta={backlog.available ? `${backlog.stories} stories · ${backlog.points} points · ${backlog.epics.length} epics` : null}
      />

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
          <div className="table-scroll">
            <table>
              <thead><tr><th>Epic</th><th>Stories</th><th>Points</th></tr></thead>
              <tbody>
                {backlog.epics.map((e) => (
                  <tr key={e.epic}><td>{e.epic}</td><td>{e.stories}</td><td>{e.points}</td></tr>
                ))}
              </tbody>
              <tfoot><tr><th scope="row">Total</th><th>{backlog.stories}</th><th>{backlog.points}</th></tr></tfoot>
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
