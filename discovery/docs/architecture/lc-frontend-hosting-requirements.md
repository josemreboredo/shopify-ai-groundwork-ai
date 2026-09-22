# Hosting and sign-in requirements — Merkle Discovery service (2.0.0)

- **For:** dentsu IT (platform, identity, security) · **From:** Merkle DACH Shopify practice · **Date:** 2026-09-17
- **Decision needed:** where to host the service (D2) and which single sign-on to use (D4)

## What we are building

A small internal service that Merkle Lead Consultants use to run Shopify discovery projects with clients. It has two
entry points:

1. **A web app** for Lead Consultants (browser, sign-in required).
2. **A connector for Claude** (the dentsu Claude Enterprise organisation): Claude calls the service's tools from a
   consultant's private Claude Project. Technically this is a remote MCP server that Anthropic's infrastructure calls
   over HTTPS.

Both use the same backend and the same engagement store. Until dentsu hosting is approved, the service is built and
piloted on interim personal accounts (Vercel, EU region, GitHub login allowlist) with **demo data only**; it is plain
Node behind storage and sign-in adapters, so it can move to the platform you choose.

## Requirements

| Area | Requirement |
|---|---|
| Region | EU hosting for the service, storage and backups |
| Runtime | Node.js 22 or later (web app and API in one or two containers) |
| Storage | Small document store or relational database for engagement records (JSON documents, tens of MB per year), with backups and point-in-time restore |
| Network | Public HTTPS endpoint with a Merkle / dentsu domain and TLS. The Claude connector is called **from Anthropic's infrastructure**, so the endpoint must be reachable from the internet or allowlist Anthropic's published IP ranges |
| Sign-in (web app) | Corporate SSO (OIDC or SAML); groups for the roles Lead Consultant, Reviewer and Owner |
| Sign-in (Claude connector) | OAuth 2.0 authorisation with the same identity provider (client ID and secret registered in the Claude organisation); scopes limited to the signed-in consultant's engagements. Claude Enterprise also supports organisation-managed connector auth through the identity provider |
| Secrets | Managed secret store for the Claude API key and OAuth secrets; nothing in code or the repository |
| Logging | Audit log of sign-ins, answers recorded, approvals and exports; no client personal data in application logs |
| Claude organisation | dentsu Claude Enterprise; an Owner adds the custom connector once; model training on customer data off (to confirm against the Enterprise terms) |
| Environments | Development and production; production data never copied to development |
| Deletion | Delete an engagement and its outputs on request |

## Data handled

- Client company information from discovery (business goals, markets, integrations, requirements) and Merkle's internal
  offer assessment (confidential, internal only).
- **No customer personal data** of the client's shoppers. Client stakeholders are recorded by role; names are optional.
- LLM processing requires the client's consent, recorded in the questionnaire (question Q10.5.2).

## Questions for dentsu IT

1. Which cloud platform and EU region should host an internal Merkle tool like this?
2. Which identity provider and groups should the web app and the Claude connector use?
3. Can the connector endpoint be public (with OAuth), or must it allowlist Anthropic's IP ranges?
4. Is the dentsu Claude Enterprise organisation available to Merkle DACH, and who is its Owner for adding the connector?
5. Which security review and data-classification process applies before real client data is stored?
