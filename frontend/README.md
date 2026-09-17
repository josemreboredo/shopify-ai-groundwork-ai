# Lead Consultant web app (2.0.0)

React Router 7 app for Lead Consultants: engagement list, live interview with validation, offer, scope gates, exit
rules, Shopify plan and app signals — and the **Merkle Discovery connector** for Claude Projects (`/mcp`, ADR 0015):
Claude reads RFPs in a private Project and records answers “to confirm” that you review on the engagement page. Set-up
steps are on the app's **Claude Project** page; the end-to-end flow for Lead Consultants is the **Manual** page (`/manual`, no sign-in needed). It uses the discovery service (`../discovery/service/`) — the 1.0.0 engine
unchanged, so code decides. Architecture: [`../discovery/docs/architecture/lc-frontend-2.0.md`](../discovery/docs/architecture/lc-frontend-2.0.md)
(ADR 0014).

> **Interim hosting: demo or anonymised engagements only.** No real client data until the migration to dentsu systems.

## Run locally

```bash
npm install                 # from the repository root (npm workspaces)
DEV_LOGIN=<your-github-login> npm run web
```

Locally, `DEV_LOGIN` signs you in as owner without GitHub, and interviews are stored in `clients/.work/<slug>/interview.json`
— the same files the CLI and the `/interview` skill use, so an interview can move between them.

`npm run web:build` builds the app.

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `DEV_LOGIN` | local only | Sign in as owner without GitHub (ignored in production) |
| `DATA_STORE` | optional | `file` (default locally) or `postgres` (default on Vercel) |
| `DATABASE_URL` | Vercel | Postgres connection string (Neon, EU region) |
| `SESSION_SECRET` | Vercel | Long random string that signs the session cookie |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Vercel | GitHub OAuth app for sign-in |
| `OWNER_GITHUB_LOGINS` | Vercel | Comma-separated GitHub logins with the owner role (see every engagement) |
| `ENGAGEMENT_VISIBILITY` | optional | Default: everyone signed in sees and works on all engagements (pilot). `own`: consultants see only their own, owners all |
| `SIGN_IN_MODE` | optional | Default: every GitHub account can sign in as consultant (interim pilot). `allowlist`: only `CONSULTANT_GITHUB_LOGINS` |
| `CONSULTANT_GITHUB_LOGINS` | Vercel | With `SIGN_IN_MODE=allowlist`: comma-separated GitHub logins with the Lead Consultant role (own engagements) |

Secrets go only into Vercel environment variables — never into the repository or chat.

## Deploy to Vercel (interim, personal account)

1. Vercel **Pro** (the Hobby plan is for non-commercial use only).
2. New project from this GitHub repository, **Root Directory `frontend`**; keep source files outside the root directory
   included in the build (the app imports `../discovery` and `../contracts`). The framework (React Router) is set in
   `vercel.json`, which overrides the dashboard preset — a wrong preset serves Vercel's `404 NOT_FOUND`.
3. Functions run in London, next to the database: `vercel.json` sets `regions: ["lhr1"]`.
4. Storage: add **Neon** from the Vercel Marketplace in **London** (the closest region to the EU offered there; pilot data is demo only); it provides `DATABASE_URL`.
   The table `discovery_interviews` is created on first use.
5. GitHub OAuth app (GitHub → Settings → Developer settings → OAuth Apps): homepage `https://<your-project>.vercel.app`,
   callback `https://<your-project>.vercel.app/auth/github/callback`. Sign in on that production URL (preview URLs
   don't match the callback).
6. Set the environment variables above and deploy.

To be verified on the first deploy: monorepo install from the repository root and inclusion of `../discovery` in the
server bundle.
