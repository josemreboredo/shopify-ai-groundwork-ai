/**
 * @file select.js
 * @description Select and materialise backlog stories for one engagement.
 *
 * @module backlog/select
 */

import { EPICS, EPIC_IDS } from './model.js';
import { STORY_DEFINITIONS } from './stories/index.js';

const EPIC_BY_ID = new Map(EPICS.map((e) => [e.id, e]));

/**
 * Resolve a static value or a function of the engagement.
 *
 * @param {unknown} value
 * @param {object} doc
 */
const resolve = (value, doc) => (typeof value === 'function' ? value(doc) : value);

/**
 * Materialise one definition for an engagement.
 *
 * @param {import('./model.js').StoryDefinition} def
 * @param {object} doc
 * @returns {import('./model.js').Story}
 */
export function materialise(def, doc) {
  const deferred = Boolean(resolve(def.deferred, doc));
  const epic = EPIC_BY_ID.get(def.epic);
  const gateLabels = (def.gates ?? [])
    .filter((id) => doc.offer?.scope_gates?.[id]?.active)
    .map((id) => `gate-${id.replace(/_/g, '-')}`);

  return {
    key: def.key,
    epic: def.epic,
    epic_name: epic.name,
    title: resolve(def.title, doc),
    user_story: resolve(def.user_story, doc),
    description: resolve(def.description, doc) ?? '',
    acceptance_criteria: resolve(def.acceptance_criteria, doc),
    gaia_tier: def.gaia_tier,
    points: def.points,
    owner: def.owner,
    depends_on: def.depends_on ?? [],
    spec_refs: def.spec_refs,
    security_flags: def.security_flags ?? [],
    priority: resolve(def.priority, doc) ?? (deferred ? 'Low' : 'High'),
    deferred,
    labels: [
      'lwc',
      `lwc-key-${def.key}`,
      `offer-${(doc.offer?.code ?? 'x').toLowerCase()}`,
      `epic-${def.epic}`,
      deferred ? 'phase-2' : 'phase-1',
      `gaia-${def.gaia_tier.toLowerCase()}`,
      ...gateLabels,
      ...(def.security_flags ?? []).map((f) => `security-${f.replace(/_/g, '-')}`),
    ],
    agent_prompt: resolve(def.agent_prompt, doc),
  };
}

/**
 * Stories that apply to an engagement, in epic order then key order.
 * Dependencies on stories that do not apply are dropped.
 *
 * @param {object} doc  Engagement document (offer computed)
 * @returns {import('./model.js').Story[]}
 */
export function selectStories(doc) {
  const applicable = STORY_DEFINITIONS
    .filter((def) => {
      try {
        return def.applies(doc) === true;
      } catch {
        return false;
      }
    })
    .sort((a, b) => EPIC_IDS.indexOf(a.epic) - EPIC_IDS.indexOf(b.epic) || a.key.localeCompare(b.key, 'en', { numeric: true }));

  const keys = new Set(applicable.map((d) => d.key));
  return applicable.map((def) => {
    const story = materialise(def, doc);
    story.depends_on = story.depends_on.filter((k) => keys.has(k));
    return story;
  });
}

/**
 * Totals per epic (for the deck and internal notes).
 *
 * @param {import('./model.js').Story[]} stories
 * @returns {{ epic: string, name: string, stories: number, points: number, deferred: number }[]}
 */
export function summariseByEpic(stories) {
  return EPICS
    .map((e) => {
      const inEpic = stories.filter((s) => s.epic === e.id);
      return {
        epic: e.id,
        name: e.name,
        stories: inEpic.length,
        points: inEpic.reduce((n, s) => n + s.points, 0),
        deferred: inEpic.filter((s) => s.deferred).length,
      };
    })
    .filter((row) => row.stories > 0);
}
