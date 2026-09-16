# Jira-ready backlog

Stories selected from `clients/<slug>/engagement.json` and exported for Jira (ADR 0006).

```bash
npm run backlog -- --client <slug>
```

Writes to `clients/<slug>/`:

| File | Purpose |
|---|---|
| `backlog.csv` | Jira Cloud CSV import: one Epic per epic in use, stories parented via Issue ID / Parent, labels, components, priority, story points, description with acceptance criteria, Definition of Done and agent prompt |
| `backlog.md` | Readable backlog with epic totals |
| `backlog.json` | Materialised stories — input for the deck and a later Jira push |

**Import into Jira:** Settings → System → External system import → CSV. Map `Issue ID` and `Parent` so stories
land under their epics, `Story Points` to *Story point estimate* (team-managed) or *Story Points*
(company-managed), and every `Labels` column to Labels. The `lwc-key-LWC-…` label is the stable key used to
update issues later instead of duplicating them.

## Stories

`stories/<epic>.js` — one module per epic, keys `LWC-<PREFIX>-NNN` (never reused). Each definition has a
guard (`applies(doc)`), a user story, Given/When/Then acceptance criteria, Gaia tier, Fibonacci points, owner,
dependencies, the engagement fields it relies on, the scope gates it delivers, security flags, and an agent
prompt for the build phase. Model and allowed values: `model.js`. Contract: `tests/unit/backlog.test.js`
(every story must fire for at least one engagement; every active scope gate must have a story).

Only GO engagements get a backlog.
