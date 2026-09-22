/**
 * @file foundation.js — epic "Store foundation" (LWC-FND-*)
 */

import { storeName, isLiquidTrack, themeName, recommendedApps, money, list } from './helpers.js';
import { PLAN_LABEL } from '../../engine/plan.js';

/**
 * The plan this engagement quoted, never a default of Plus.
 *
 * The first story in the backlog opened "Set up the Shopify Plus development
 * store" on every engagement, including the ones the engine had just quoted on
 * Basic. The offers do not assume Plus — the plan gate exists to earn it — so
 * the story reads the answer.
 */
const planName = (doc) => PLAN_LABEL[doc.shopify?.target_plan] ?? null;

/** @type {import('../model.js').StoryDefinition[]} */
export default [
  {
    key: 'LWC-FND-001',
    scope: 'Set up the build store and staff access',
    epic: 'foundation',
    title: (doc) => `Set up the ${planName(doc) ? `${planName(doc)} ` : ''}build store and staff access`,
    user_story: (doc) => `As the delivery team, we want a Shopify store for ${storeName(doc)} that can be handed to the client, with role-based staff access, so that all build work happens safely outside production and the client ends up owning what we built.`,
    /*
     * Verified 2026-09-21: a build store is "for building or testing an
     * app or theme instead of handing a store to a client"; dev stores "can't
     * be transferred to a client" and "can't be converted to production
     * stores". Building a merchant's store is a client transfer store, which
     * you "configure ... and then transfer ownership to the client when it is
     * ready to go live" — and while it sits in the Partner organisation its
     * "file, video, and 3D model storage limits match the Basic plan".
     */
    acceptance_criteria: (doc) => [
      `Given the engagement is GO, when the build store is created, then it is a client transfer store on the ${planName(doc) ?? 'plan this engagement quoted'} — not a build store, which cannot be converted to production or transferred to the client`,
      'Given the client admin roles, when staff accounts are created, then each role has only the permissions it needs and the store owner is the client decision-maker',
      'Given the store exists, when the Shopify CLI is authenticated, then the access token is stored only in .env and never committed',
      'Given the store sits in the Partner organisation until transfer, when media is uploaded during the build, then the Basic-plan file, video and 3D model storage limits are what apply, and a catalogue with heavy media is checked against them before the load',
    ],
    gaia_tier: 'T1',
    points: 2,
    owner: 'consultant',
    gates: ['store_estate'],
    spec_refs: ['/shopify/target_plan', '/delivery/admin_roles'],
    security_flags: ['auth', 'secrets'],
    applies: () => true,
    agent_prompt: (doc) => `Create the client transfer store for ${storeName(doc)} on the ${planName(doc) ?? 'plan this engagement quoted — read it from the engagement rather than defaulting to Plus'}. Use a client transfer store, not a build store: a dev store cannot be converted to production and cannot be transferred to the client. Create staff accounts for the roles in engagement.delivery.admin_roles with least-privilege permissions. Authenticate Shopify CLI against the build store only and keep credentials in .env. While the store is under the Partner organisation its media storage limits are the Basic plan's, so check a media-heavy catalogue against them before loading it. Do not touch any production store.`,
  },
  {
    key: 'LWC-FND-002',
    epic: 'foundation',
    title: 'Set up the code repository, environments and Theme Check CI',
    user_story: 'As a developer, I want a version-controlled repository with separate development, staging and live environments and automated checks, so that every change is reviewed and reversible.',
    acceptance_criteria: (doc) => [
      isLiquidTrack(doc)
        ? `Given the ${themeName(doc)} theme, when it is pulled with Shopify CLI, then it is committed to the repository and connected to the build store through the GitHub integration or CLI pushes`
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
      ? `Initialise the theme repository from the latest ${themeName(doc)} release with shopify theme init or pull. Add a CI workflow that runs shopify theme check (fail on errors) on every pull request. Create branches for development and staging, connect the staging branch to an unpublished theme on the build store, and document the release flow in the repository README. Add .env to .gitignore and a secret scan to CI. Never push to the live theme from CI without consultant approval.`
      : 'Scaffold the Hydrogen storefront with shopify hydrogen init, commit it, add lint, type-check and unit tests to CI, and connect Oxygen preview deployments. Keep Storefront and Customer Account API credentials in Oxygen environment variables only. Document the release flow in the README.'),
  },
  {
    key: 'LWC-FND-003',
    epic: 'foundation',
    title: 'Install the approved app baseline within the monthly app budget',
    user_story: 'As the client, I want only the approved apps installed and their running cost checked against our budget, so that the store stays lean and affordable.',
    description: (doc) => `Recommended apps: ${list(recommendedApps(doc).map((a) => a.name)) || 'none shortlisted yet'}. Monthly app ceiling: ${money(doc.business?.app_cost_ceiling_monthly, 'not set')}.`,
    acceptance_criteria: (doc) => [
      ...recommendedApps(doc).map((a) => `Given the app shortlist, when ${a.name} is installed on the build store, then it is on the plan agreed for "${a.requirement ?? a.name}" and the plan is recorded in the handover notes`),
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
    agent_prompt: (doc) => `List the recommended apps from engagement.approach.app_shortlist (${list(recommendedApps(doc).map((a) => a.name)) || 'none yet'}) with their plan and monthly cost; convert to ${doc.business?.app_cost_ceiling_monthly?.currency ?? 'the budget currency'} and compare the total with the ceiling of ${money(doc.business?.app_cost_ceiling_monthly, 'the agreed amount')}. Present the table for consultant approval, then install each approved app from the Shopify App Store on the build store only. Review the access scopes each app requests and flag any that go beyond its purpose. Do not install rejected apps. Record plans, costs and scopes in the handover notes.`,
  },
  {
    key: 'LWC-FND-004',
    epic: 'foundation',
    title: 'Put the production store guard and change runbook in place',
    user_story: 'As the client, I want every change to the live store to follow an approved runbook, so that build work can never break trading or leak credentials.',
    acceptance_criteria: [
      'Given any agent or CLI session, when a command targets a store, then it runs against the build store unless the consultant has approved a production change in writing',
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
