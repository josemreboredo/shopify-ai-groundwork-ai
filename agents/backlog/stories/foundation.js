/**
 * @file foundation.js — epic "Store foundation" (LWC-FND-*)
 */

import { storeName, isLiquidTrack, themeName, recommendedApps, money, list } from './helpers.js';

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
  {
    key: 'LWC-FND-002',
    epic: 'foundation',
    title: 'Set up the code repository, environments and Theme Check CI',
    user_story: 'As a developer, I want a version-controlled repository with separate development, staging and live environments and automated checks, so that every change is reviewed and reversible.',
    acceptance_criteria: (doc) => [
      isLiquidTrack(doc)
        ? `Given the ${themeName(doc)} theme, when it is pulled with Shopify CLI, then it is committed to the repository and connected to the development store through the GitHub integration or CLI pushes`
        : 'Given the Hydrogen storefront, when it is scaffolded with Shopify CLI, then it is committed to the repository and deploys preview environments to Oxygen',
      'Given a pull request, when CI runs, then Theme Check (or the storefront lint and tests) must pass before merge',
      'Given the repository, when it is scanned, then no access tokens, API keys or .env files are committed and .env is gitignored',
      'Given the environments, when a release is prepared, then development, staging (unpublished theme or preview) and live are named and documented',
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'developer',
    depends_on: ['LWC-FND-001'],
    spec_refs: ['/design/theme_preference', '/offer/delivery_track'],
    security_flags: ['secrets'],
    applies: () => true,
    agent_prompt: (doc) => (isLiquidTrack(doc)
      ? `Initialise the theme repository from the latest ${themeName(doc)} release with shopify theme init or pull. Add a CI workflow that runs shopify theme check (fail on errors) on every pull request. Create branches for development and staging, connect the staging branch to an unpublished theme on the development store, and document the release flow in the repository README. Add .env to .gitignore and a secret scan to CI. Never push to the live theme from CI without consultant approval.`
      : 'Scaffold the Hydrogen storefront with shopify hydrogen init, commit it, add lint, type-check and unit tests to CI, and connect Oxygen preview deployments. Keep Storefront and Customer Account API credentials in Oxygen environment variables only. Document the release flow in the README.'),
  },
  {
    key: 'LWC-FND-003',
    epic: 'foundation',
    title: 'Install the approved app baseline within the monthly app budget',
    user_story: 'As the client, I want only the approved apps installed and their running cost checked against our budget, so that the store stays lean and affordable.',
    description: (doc) => `Recommended apps: ${list(recommendedApps(doc).map((a) => a.name)) || 'none shortlisted yet'}. Monthly app ceiling: ${money(doc.business?.app_cost_ceiling_monthly, 'not set')}.`,
    acceptance_criteria: (doc) => [
      ...recommendedApps(doc).map((a) => `Given the app shortlist, when ${a.name} is installed on the development store, then it is on the plan agreed for "${a.requirement ?? a.name}" and the plan is recorded in the handover notes`),
      `Given the recommended plans, when their monthly costs are totalled in one currency, then the total is at or below ${money(doc.business?.app_cost_ceiling_monthly, 'the agreed ceiling')} or the overrun is approved in writing by the client`,
      'Given apps that were rejected on the shortlist, when the installed apps are reviewed, then none of them is installed and every installed app has least-privilege access scopes',
    ],
    gaia_tier: 'T1',
    points: 2,
    owner: 'consultant',
    depends_on: ['LWC-FND-001'],
    spec_refs: ['/approach/app_shortlist', '/business/app_cost_ceiling_monthly'],
    security_flags: ['auth'],
    applies: () => true,
    agent_prompt: (doc) => `List the recommended apps from engagement.approach.app_shortlist (${list(recommendedApps(doc).map((a) => a.name)) || 'none yet'}) with their plan and monthly cost; convert to ${doc.business?.app_cost_ceiling_monthly?.currency ?? 'the budget currency'} and compare the total with the ceiling of ${money(doc.business?.app_cost_ceiling_monthly, 'the agreed amount')}. Present the table for consultant approval, then install each approved app from the Shopify App Store on the development store only. Review the access scopes each app requests and flag any that go beyond its purpose. Do not install rejected apps. Record plans, costs and scopes in the handover notes.`,
  },
  {
    key: 'LWC-FND-004',
    epic: 'foundation',
    title: 'Put the production store guard and change runbook in place',
    user_story: 'As the client, I want every change to the live store to follow an approved runbook, so that build work can never break trading or leak credentials.',
    acceptance_criteria: [
      'Given any agent or CLI session, when a command targets a store, then it runs against the development store unless the consultant has approved a production change in writing',
      'Given the production store, when staff and collaborator access is reviewed, then collaborator accounts have only the permissions needed and are removed after hypercare',
      'Given a production change, when it is applied, then the runbook records who approved it, the rollback step and a theme or data backup taken beforehand',
    ],
    gaia_tier: 'T2',
    points: 2,
    owner: 'consultant',
    depends_on: ['LWC-FND-001'],
    spec_refs: ['/shopify/existing_store', '/shopify/store_url', '/delivery/admin_roles'],
    security_flags: ['production_store', 'auth', 'secrets'],
    applies: () => true,
    agent_prompt: (doc) => `Write the production change runbook for ${storeName(doc)}: store handles for development and production, which CLI profiles point where, the approval rule (consultant sign-off before any production mutation), backup steps (theme duplicate, Matrixify or bulk export of affected data) and rollback. ${doc.shopify?.existing_store ? 'A production store already exists — treat it as read-only during the build.' : 'The production store does not exist yet — create it only at the launch step.'} Configure the local tooling so production credentials are never loaded by default.`,
  },
];
