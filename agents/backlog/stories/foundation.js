/**
 * @file foundation.js — epic "Store foundation" (LWC-FND-*)
 */

import { storeName } from './helpers.js';

/** @type {import('../model.js').StoryDefinition[]} */
export default [
  {
    key: 'LWC-FND-001',
    epic: 'foundation',
    title: 'Set up the Shopify Plus development store and staff access',
    user_story: (doc) => `As the delivery team, we want a Shopify Plus development store for ${storeName(doc)} with role-based staff access, so that all build work happens safely outside production.`,
    acceptance_criteria: [
      'Given the engagement is GO, when the development store is created, then it is on the Shopify Plus plan (or a Plus sandbox) and not transferable to production by mistake',
      'Given the client admin roles, when staff accounts are created, then each role has only the permissions it needs and the store owner is the client decision-maker',
      'Given the store exists, when the Shopify CLI is authenticated, then the access token is stored only in .env and never committed',
    ],
    gaia_tier: 'T1',
    points: 2,
    owner: 'consultant',
    spec_refs: ['/shopify/target_plan', '/delivery/admin_roles'],
    security_flags: ['auth', 'secrets'],
    applies: () => true,
    agent_prompt: (doc) => `Create the Shopify Plus development store for ${storeName(doc)}. Create staff accounts for the roles in engagement.delivery.admin_roles with least-privilege permissions. Authenticate Shopify CLI against the development store only and keep credentials in .env. Do not touch any production store.`,
  },
];
