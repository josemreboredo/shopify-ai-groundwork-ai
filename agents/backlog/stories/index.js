/**
 * @file index.js — all story definitions, one module per epic (EPICS order).
 */

import foundation from './foundation.js';
import theme from './theme.js';
import catalogue from './catalogue.js';
import markets from './markets.js';
import checkout from './checkout.js';
import shipping from './shipping.js';
import customers from './customers.js';
import promotions from './promotions.js';
import marketing from './marketing.js';
import integrations from './integrations.js';
import migration from './migration.js';
import compliance from './compliance.js';
import quality from './quality.js';
import launch from './launch.js';

/** @type {import('../model.js').StoryDefinition[]} */
export const STORY_DEFINITIONS = [
  ...foundation,
  ...theme,
  ...catalogue,
  ...markets,
  ...checkout,
  ...shipping,
  ...customers,
  ...promotions,
  ...marketing,
  ...integrations,
  ...migration,
  ...compliance,
  ...quality,
  ...launch,
];
