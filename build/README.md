# Build AI tool

Agents that build the Shopify store from the discovery handover. **Not started yet** — see the implementation plan,
Phase 6 (Commerce Agent, Theme Agent) in [`../docs/implementation-plan.md`](../docs/implementation-plan.md).

**Inputs (from the discovery tool, per client in `clients/<slug>/`):**

- `engagement.json` — shape in [`../contracts/engagement.schema.json`](../contracts/engagement.schema.json)
- `backlog.json` / `backlog.csv` — the Jira stories the build delivers (GO engagements)
- `configuration-workbook.md` — tax and shipping set-up completed by the client

The build tool does not read Merkle's internal offer pricing (`discovery/schema/offering.json`).

| Folder | Contents |
|---|---|
| `lwc-library/` | Design tokens (brand-swappable) and market presets (e.g. `swiss-baseline/`, ADR 0004) |
| `docs/conventions/` | Build conventions (`shopify-delivery.md`; theme, app, Hydrogen and API conventions planned) |

Security: store tokens and production guards follow [`../docs/conventions/security-gates.md`](../docs/conventions/security-gates.md).
