/**
 * @file scope-view.js
 * @description What an offer actually builds, epic by epic, and what it does
 * not — read off the backlog the engine itself generates rather than written
 * again by hand on a page.
 *
 * These projects are sold at a fixed price. "The templates the catalogue needs"
 * and "the usual integrations" are the sentences that become an argument in
 * week six, and the offering pages were carrying a lot of them: three lines of
 * base scope per offer against a backlog of a hundred and eighteen stories in
 * sixteen epics. A client buying a fixed price is entitled to the list.
 *
 * Every story lands in exactly one of three places, and the difference is what
 * the client is buying:
 *
 *  - **Always.** Its guard is true before a single question is answered, so it
 *    is in every engagement of this offer at this price.
 *  - **When the answers call for it.** Its guard reads the engagement, and no
 *    scope gate prices it: it is inside the band, and the page names the
 *    question that switches it on so nobody has to guess.
 *  - **Behind a gate.** A scope gate prices it. Inside the offer's gate
 *    capacity it costs nothing more; past that capacity the gate is added to
 *    the weeks and to the band. The gate's own condition travels with it.
 *
 * The labels are the stories' own. Where a title only reads well with answers
 * in it ("Configure Shopify Markets for DE, AT and CH"), the story carries a
 * `scope` label for this page, and a test holds every label to being readable
 * with no engagement at all.
 *
 * @module discovery/service/scope-view
 */

import { offering, questionForPointer } from '../schema/index.js';
import { EPICS } from '../agents/backlog/model.js';
import { STORY_DEFINITIONS } from '../agents/backlog/stories/index.js';

/** The label a story has when there is no engagement in front of it. */
export function storyLabel(story) {
  if (story.scope) return story.scope;
  return typeof story.title === 'string' ? story.title : story.title({});
}

/**
 * Does this story apply before anyone has answered anything?
 *
 * An unanswered engagement is the honest test of "always": a guard that is
 * already true with an empty document asks nothing of the client, so the work
 * is in the price whatever they say. A guard that throws on an empty document
 * is reading something, so it is conditional — never silently "always".
 */
function unconditional(story) {
  try {
    return story.applies({}) === true;
  } catch {
    return false;
  }
}

/** The questions whose answers decide whether a story is in scope. */
function decidedBy(story) {
  const seen = new Map();
  for (const ref of story.spec_refs ?? []) {
    const q = questionForPointer(ref.replace(/\/\*(?=\/|$)/g, ''));
    if (q && !seen.has(q.id)) seen.set(q.id, q);
  }
  return [...seen.values()];
}

const entry = (story) => ({
  key: story.key,
  label: storyLabel(story),
  points: story.points,
  owner: story.owner,
  tier: story.gaia_tier,
  decided_by: decidedBy(story),
});

/** Gate metadata as this page needs it: what fires it, and what it adds. */
function gateInfo(id) {
  const gate = offering.scope_gates.find((g) => g.id === id);
  const modifiers = offering.modifiers.filter((m) => m.gate === id);
  if (!gate) return null;
  return {
    id,
    label: gate.label,
    condition: gate.condition,
    effort_weeks: modifiers.length
      ? { min: Math.min(...modifiers.map((m) => m.effort_weeks.min)), max: Math.max(...modifiers.map((m) => m.effort_weeks.max)) }
      : null,
  };
}

/**
 * The whole backlog as a scope statement, grouped the way it is sold.
 *
 * @returns {Array<{ id: string, name: string, summary: string, points: number,
 *   always: object[], conditional: object[], gated: object[] }>}
 */
export function scopeCatalogue() {
  return EPICS.map((epic) => {
    const stories = STORY_DEFINITIONS.filter((s) => s.epic === epic.id);
    const always = [];
    const conditional = [];
    const byGate = new Map();

    for (const story of stories) {
      const [gate] = story.gates ?? [];
      if (gate) {
        byGate.set(gate, [...(byGate.get(gate) ?? []), entry(story)]);
        continue;
      }
      (unconditional(story) ? always : conditional).push(entry(story));
    }

    return {
      id: epic.id,
      name: epic.name,
      summary: epic.summary,
      points: stories.reduce((sum, s) => sum + s.points, 0),
      story_count: stories.length,
      always,
      conditional,
      gated: [...byGate.entries()]
        .map(([id, entries]) => ({ ...gateInfo(id), stories: entries }))
        .filter((g) => g.id)
        .sort((a, b) => a.label.localeCompare(b.label)),
    };
  });
}

/** Totals, so a page can say how much of the backlog is unconditional. */
export function scopeTotals(catalogue = scopeCatalogue()) {
  const count = (key) => catalogue.reduce((n, e) => n + (key === 'gated'
    ? e.gated.reduce((g, x) => g + x.stories.length, 0)
    : e[key].length), 0);
  return {
    epics: catalogue.length,
    stories: catalogue.reduce((n, e) => n + e.story_count, 0),
    always: count('always'),
    conditional: count('conditional'),
    gated: count('gated'),
  };
}
