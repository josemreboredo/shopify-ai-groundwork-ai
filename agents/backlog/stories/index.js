/**
 * @file index.js — all story definitions, one module per epic.
 */

import foundation from './foundation.js';
import markets from './markets.js';

/** @type {import('../model.js').StoryDefinition[]} */
export const STORY_DEFINITIONS = [
  ...foundation,
  ...markets,
];
