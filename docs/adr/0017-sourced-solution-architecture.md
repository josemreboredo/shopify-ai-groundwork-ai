# ADR 0017 — Sourced solution architecture in the Discovery Closing Document

- **Status:** Accepted (2026-09-17, owner decision)
- **Date:** 2026-09-17
- **Relates to:** ADR 0011 (Shopify facts from documentation), ADR 0015 (Claude connector), ADR 0016 (closing document from the Claude Project)

## Context

The Discovery Closing Document is the most valuable output of the tool: the Shopify consulting deliverable that defines
the project, the architecture, the solution and the risks. The owner expects it written as a Shopify Solution Architect
and Commerce Consultant to top-tier consulting standards — every statement founded on data and sources — using Shopify's
public documentation and the Shopify MCPs, with the strongest model making the architecture decisions.

Until now the approach held a capability map, apps, assumptions and phases, without sources, architecture decisions or a
risk register, and nothing checked where a Shopify statement came from.

## Decision

1. **The Solution Architect step runs in Claude Code** (owner decision): the `/architect` skill reads and writes the hosted
   engagement through the Merkle Discovery connector, researches with the Shopify Dev MCP (local `npx @shopify/dev-mcp`,
   not available in claude.ai) and official Shopify web pages, and runs on the strongest model at high effort. The Claude
   Project path stays available as an alternative with web research.
2. **Richer, sourced approach** (owner decision) in the engagement contract and the drafting schema:
   - `approach.architecture.decisions` — topic, question, at least two options with pros and cons, decision, rationale,
     plan impact, status (recommended or to validate in the Discovery Phase), sources, question ids;
   - `approach.architecture.integrations` — per system: system of record, pattern, direction, frequency, Shopify APIs,
     error handling and reconciliation, sources, question ids;
   - `approach.architecture.data_model` and `approach.architecture.non_functional`, with sources;
   - `approach.risks.register` — likelihood, impact, mitigation, owner, evidence (question ids or exit rules);
   - `sources` on every capability row; App Store or vendor URL on every recommended app.
3. **Code enforces the standard** (`approachQualityErrors`), in every path — connector `save_approach`, Claude Code
   `discover:finish`, and API mode (one repair call, then `ApproachQualityError`): every capability, decision, integration
   and data-model entry cites an official Shopify source (help.shopify.com, shopify.dev, shopify.com,
   changelog.shopify.com, apps.shopify.com, shopify.engineering); capabilities and decisions cite question ids; at least
   three decisions, three non-functional areas and three risks; integrations cover every system in the engagement; risks
   cite evidence. Patterns and minimum counts live in code because structured outputs do not support them in the schema.
4. **The document shows it:** the deck data carries decisions, integration architecture, data model, non-functional
   requirements, sources, question ids and the risk register; the deck prompt requires answer-first sections, question
   ids after client facts, numbered references for Shopify facts and a References list; discovery writes
   `architecture.md` alongside the other artefacts.

## Amendment (2026-09-17, owner decision)

Lead Consultants generate the document in their Claude Project by default (strongest model, web search on, same
connector tools and quality gate); `/architect` in Claude Code is the advanced path for complex integrations or tax
questions, or when a draft keeps failing the checks. The web app's Manual page (`/manual`) documents the flow.

## Consequences

- Drafting the approach costs more (research and a larger output) and takes longer; the owner accepts this for the
  deliverable that matters most.
- A link to an official domain does not prove the page supports the statement: the Lead Consultant still reviews the
  draft, and `status: to_validate_in_discovery` marks what research could not confirm.
- Engagements finalised before this ADR have no architecture; their deck data shows a warning to run `/architect`.
- The Shopify Dev MCP and Claude Code run on the interim personal Claude account (ADR 0007): demo or anonymised data only.
