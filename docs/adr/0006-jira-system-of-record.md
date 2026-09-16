# ADR 0006 — Jira is the backlog system of record after first push

- **Status:** Proposed (Jira sandbox approach accepted as D7)
- **Date:** 2026-09-16

## Context

Stories are generated from the engagement spec, but consultants and clients refine them in
Jira. Re-running the generator must not duplicate issues or overwrite human edits.

## Decision

1. The generator owns stories until they are first pushed; after that **Jira owns them**.
2. Every generated story has a stable key (e.g. `LWC-MKT-003`) stored on the Jira issue
   (label or custom field). Pushes upsert by that key.
3. On re-push, the generator only fills fields that are still empty in Jira and adds new
   stories; it never deletes issues or overwrites edited fields. Removed stories are reported, not deleted.
4. Pushes are dry-run by default and need consultant approval (Gaia T2+ plan gate).
5. Delivery order: Jira CSV import first; then a push through the Atlassian Rovo connector or Jira REST.
6. The Jira project key comes from `engagement.json → jira.project_key` (Q10.5.3).

## Consequences

- Phase 4 tests: second push creates no duplicates and keeps manual edits.
- The Atlassian Rovo connector must be authorised in claude.ai connector settings before pushes.
