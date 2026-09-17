# ADR 0015 — Claude connector: shared memory between Claude Projects and the web app

- **Status:** Accepted (2026-09-17, owner decisions)
- **Date:** 2026-09-17
- **Relates to:** ADR 0007 (LLM data handling), ADR 0014 (Lead Consultant frontend)

## Context

Lead Consultants want to upload RFPs and other client documents to a Claude Project and have Claude work on the same
engagement as the discovery web app — one shared memory. Checked on claude.com/docs (2026-09-17): custom connectors are
remote MCP servers; Claude authenticates with OAuth 2.0 using a Client ID Metadata Document (CIMD), Dynamic Client
Registration or a pre-registered client, always with PKCE S256; the redirect URI is
`https://claude.ai/api/mcp/auth_callback`; the token endpoint takes form-encoded requests; refresh tokens should rotate;
the MCP server answers `401` with a `resource_metadata` pointer. On Team and Enterprise plans connectors work only in
private Projects.

## Decision

1. **Connector in the web app:** `/mcp` (Streamable HTTP, `mcp-handler`) exposes the discovery service as tools —
   `list_engagements`, `start_interview`, `get_interview`, `find_questions`, `record_answers`, `mark_questions`,
   `add_note`, `register_document`, `get_preview`, `list_answers`. The engine still validates every answer and decides
   the offer; server instructions tell Claude to report only what the preview returns.
2. **Own OAuth authorization server:** `/.well-known/oauth-authorization-server`, `/.well-known/oauth-protected-resource`,
   `/oauth/authorize` (consent after GitHub sign-in), `/oauth/token`. CIMD documents are fetched only from `claude.ai`;
   a pre-registered public client `merkle-discovery-claude` is the fallback. PKCE S256 required, single-use codes (5
   minutes), access tokens 1 hour, rotating refresh tokens 30 days, all stored as SHA-256 hashes, tokens bound to the
   `/mcp` resource. The allowlist is re-checked on every tool call.
3. **Answers from documents are "to confirm":** recorded as client answers with status TBC and a citation (document,
   section, short quote); the Lead Consultant confirms them on the engagement page (owner decision).
4. **Documents stay in the Claude Project:** the discovery tool keeps a register (name, type, date, summary, who added
   it), not the files (owner decision).
5. **Provenance per answer** in the session: channel (`web`, `claude`, `cli`), author and date; the engagement contract
   keeps source, status and note.
6. **Tables without JSON:** table questions (markets, integrations, KPIs, stakeholders…) are answered row by row in the
   web app; Claude sends an array of objects with the documented columns.

## Consequences

- Personal Claude accounts and the interim Vercel hosting: demo or anonymised documents and engagements only.
- Documents uploaded to a Claude Project are processed by Claude without our redaction step; the consent gate (Q10.5.2)
  and the personal-data checks on recorded answers still apply.
- Migration to dentsu: same endpoints; the GitHub sign-in in front of the consent step is replaced by dentsu SSO.
