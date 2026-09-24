/**
 * @file moved.js
 * @description What an answer just changed, in one sentence.
 *
 * The interview used to carry a panel of the engine's state beside the
 * questions. Nobody watches a column of numbers while a client is talking, so
 * the state was available and unread — and it cost the questions a third of the
 * screen. The state belongs on "Where it stands"; what belongs here is the
 * event: that *this* answer moved something.
 *
 * Silence is the default. An answer with no consequence says nothing, because a
 * line that speaks when nothing happened is the line people stop reading.
 *
 * @module ai/shared/moved
 */

import { lowerFirst } from '../engine/text.js';

const words = (id) => String(id ?? '').replace(/_/g, ' ');

/* The preview reports each gate as { state, evidence }; older callers passed the
   bare state. Compared as strings, the object form never matched, so the
   interview never once said "put markets in scope". */
const stateOf = (v) => (typeof v === 'string' ? v : v?.state);

/**
 * @param {object} before  the engine's preview before the answer
 * @param {object} after   the engine's preview after it
 * @returns {string[]} what changed, each ready to read after "That answer"
 */
export function whatMoved(before, after) {
  if (!before || !after) return [];
  const moved = [];

  const offerName = (o) => [o?.code, o?.name].filter(Boolean).join(' · ');
  if (before.offer?.code !== after.offer?.code && after.offer?.code) {
    moved.push(`moved the offer to ${offerName(after.offer)}`);
  } else if (before.offer?.provisional && !after.offer?.provisional && after.offer?.code) {
    moved.push(`settled the offer at ${offerName(after.offer)}`);
  }

  if (before.go !== after.go) {
    moved.push(after.go
      ? 'brought the work back within the standard offers'
      : `took it beyond the standard offers${after.route ? ` — ${words(after.route)}` : ''}`);
  } else if (before.route !== after.route && after.route) {
    moved.push(`set the route to ${words(after.route)}`);
  }

  // A gate going active is the thing that grows a build, and it is the change a
  // consultant most needs to hear while the client is still in the room.
  for (const [id, state] of Object.entries(after.scope_gates ?? {})) {
    if (stateOf(state) === 'active' && stateOf(before.scope_gates?.[id]) !== 'active') moved.push(`put ${words(id)} in scope`);
  }
  for (const [id, state] of Object.entries(after.l_triggers ?? {})) {
    if (stateOf(state) !== 'active' || stateOf(before.l_triggers?.[id]) === 'active') continue;
    // Only a headless storefront names the pack; a further store is an add-on.
    moved.push(id === 'headless' ? 'made a headless storefront an L trigger' : `recorded ${words(id)} for the approach`);
  }

  // What now goes past the pack, by name — the re-estimate a client can follow.
  const had = new Set(before.offer?.addons ?? []);
  for (const label of after.offer?.addons ?? []) {
    if (!had.has(label) && after.offer?.name) moved.push(`added ${lowerFirst(label)} on top of ${after.offer.name}`);
  }

  const fired = new Set((before.exit_rules ?? []).map((r) => r.rule));
  for (const r of after.exit_rules ?? []) {
    if (!fired.has(r.rule)) moved.push(`fired ${r.rule} ${r.result} — ${r.evidence}`);
  }

  if (after.plan_suggestion?.value && before.plan_suggestion?.value !== after.plan_suggestion.value) {
    moved.push(`set the Shopify plan these answers need to ${after.plan_suggestion.value}`);
  }

  return moved;
}
