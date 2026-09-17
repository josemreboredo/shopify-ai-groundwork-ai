# ADR 0014 — Lead Consultant frontend: hybrid, staged, React Router

- **Status:** Accepted (2026-09-17, owner decisions); target hosting and single sign-on pending dentsu IT
- **Date:** 2026-09-17
- **Relates to:** ADR 0007 (LLM data handling), ADR 0008 (interview surface), ADR 0013 (repository layout)
- **Design:** [`discovery/docs/architecture/lc-frontend-2.0.md`](../../discovery/docs/architecture/lc-frontend-2.0.md)

## Context

Version 1.0.0 needs Claude Code and a terminal. Version 2.0.0 gives Lead Consultants a frontend that also connects to
Claude Projects. Checked on support.claude.com (2026-09-17): custom connectors (remote MCP) work on Team and Enterprise
but only in **private** Projects, must be reachable from Anthropic's infrastructure, and are added by an organisation
Owner; there is no documented API to create Projects.

## Decision

1. **Hybrid:** one discovery service (REST API and MCP server) reusing `discovery/agents` — code still decides — used by
   a Lead Consultant web app and by a "Merkle Discovery" connector in each consultant's private Claude Project.
2. **Staged hosting:** build and pilot on **interim personal accounts** — Vercel Pro (the Hobby plan forbids commercial
   use), functions and Postgres (Neon) in London (`lhr1`) — the Vercel Marketplace offered no EU region for Neon —, GitHub
   login with an allowlist — with demo data only.
   Then migrate to dentsu systems (hosting, SSO, Claude Enterprise) for real client data; requirements in
   `discovery/docs/architecture/lc-frontend-hosting-requirements.md`. Cloudflare Workers was not chosen: no `eval` /
   `new Function`, so the engine would need rework.
3. **Stack:** React with React Router for the web app; Node service. New folders: `frontend/` and `discovery/service/`.
4. **Pilot:** the owner, with demo clients, until the hosted service and the dentsu Claude Enterprise account are
   approved.

**Amendment (2026-09-17, owner decision):** sign-in is open to every GitHub account as consultant by default during
the pilot (`SIGN_IN_MODE=allowlist` restricts it to `CONSULTANT_GITHUB_LOGINS`); owners stay named. Every signed-in
user sees and works on every engagement, in the web app and the Claude connector (`ENGAGEMENT_VISIBILITY=own` restores
consultants seeing only their own). Consultants see only their own engagements; creating an engagement
with a slug that exists elsewhere says only that the slug is not available. Recommended alternatives (company email
domain, GitHub organisation) were declined for the pilot.

## Consequences

- No real client data on the interim personal hosting or a personal Claude account — demo or anonymised engagements only.
- The service keeps storage and sign-in behind adapters so the dentsu migration changes no engine code.
- Sharing between consultants happens in the service, not by sharing Claude Projects.
- The CLI and Claude Code skills stay for development and as a fallback.
