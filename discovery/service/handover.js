/**
 * @file handover.js
 * @description What delivery receives when a discovery closes: the Jira backlog
 * and the configuration workbook the client fills in.
 *
 * Both have existed since the beginning and neither had any way out of the app —
 * they were reachable only by running `npm run backlog` and `npm run workbook` on
 * a laptop, against an engagement.json that the web app never writes. So the
 * engagement path appeared to end at the closing document, when what it actually
 * ends at is the thing the build team opens on day one.
 *
 * Nothing is generated here that the CLI does not generate: the same selection,
 * the same exports, from the same decided engagement. Only the door is new.
 *
 * @module discovery/service/handover
 */

import { selectStories, summariseByEpic } from '../agents/backlog/select.js';
import { toJiraCsv, toMarkdown } from '../agents/backlog/export.js';
import { buildWorkbook } from '../agents/workbook/build.js';
import { stopRoute } from '../agents/discovery/engine.js';

/**
 * Why there is no backlog, in the words the CLI uses — a Larger Engagement does
 * not get tickets because its backlog is defined inside the Discovery Phase, and
 * that is a fact about the offering, not a failure.
 *
 * @param {object} doc  decided engagement
 * @returns {{ id: string|null, label: string|null, why: string }|null}
 */
export function backlogBlocked(doc) {
  if (doc.delivery?.go) return null;
  const route = stopRoute(doc);
  if (route?.id === 'larger_engagement') {
    return {
      id: route.id,
      label: route.label,
      why: 'A Larger Engagement gets no Jira tickets here: its backlog, plan and investment are defined inside the dedicated Discovery Phase of the Merkle Enterprise Engagement. The client deck is still produced and shared.',
    };
  }
  if (route) {
    return { id: route.id, label: route.label, why: `The engagement is beyond the standard offers and the recorded route is "${route.label}", so no build backlog is generated.` };
  }
  return { id: null, label: null, why: 'The engagement is beyond the standard offers. Record how Merkle proceeds in Q10.5.5 before a backlog can be generated.' };
}

/**
 * What delivery gets, and what is still missing before they can start.
 *
 * @param {object} doc  decided, finalised engagement
 */
export function handoverView(doc) {
  const blocked = backlogBlocked(doc);
  const stories = blocked ? [] : selectStories(doc);
  const epics = blocked ? [] : summariseByEpic(stories);
  const points = epics.reduce((n, r) => n + r.points, 0);
  const owners = {};
  for (const s of stories) owners[s.owner] = (owners[s.owner] ?? 0) + 1;
  return {
    offer: { code: doc.offer?.code ?? null, name: doc.offer?.name ?? null },
    backlog: blocked
      ? { available: false, blocked }
      : {
        available: true,
        stories: stories.length,
        points,
        epics: epics.map(({ epic, stories: n, points: p }) => ({ epic, stories: n, points: p })),
        // Who the work falls to. The catalogue records an owner per story, and it
        // is the closest thing the tool has to a team shape today.
        owners: Object.entries(owners).map(([owner, n]) => ({ owner, stories: n })).sort((a, b) => b.stories - a.stories),
      },
    // The workbook is the client's homework, not ours: it is produced whatever the
    // route, because tax and shipping set-up has to be collected either way.
    workbook: { available: true },
  };
}

/**
 * One handover file. Returns null when the engagement has no backlog to give.
 *
 * @param {object} doc  decided, finalised engagement
 * @param {'backlog.csv'|'backlog.md'|'workbook.md'} which
 * @returns {string|null}
 */
export function handoverFile(doc, which) {
  if (which === 'workbook.md') return buildWorkbook(doc);
  if (backlogBlocked(doc)) return null;
  const stories = selectStories(doc);
  if (which === 'backlog.csv') return toJiraCsv(stories, { clientName: doc.meta?.client?.name });
  if (which === 'backlog.md') return toMarkdown(stories, doc, summariseByEpic(stories));
  return null;
}
