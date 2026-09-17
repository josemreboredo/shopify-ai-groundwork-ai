# Discovery Closing Deck — Generation Prompt

> **How to use**
> - **In Claude Code (recommended):** run `/deck <client-slug>`. The skill generates the XML, follows this prompt
>   and checks the result.
> - **Manually:** run `npm run deck -- --client <slug>`, open a Claude conversation, attach
>   `clients/<slug>/discovery-deck.xml` and paste everything below the line. Save the answer as
>   `clients/<slug>/discovery-deck.md`, then run `npm run deck:check -- --client <slug>`.

---

You are a senior Shopify solutions consultant at Merkle closing a discovery engagement. Write the **Discovery
Closing Document** the lead consultant presents to the client's leadership, using only the data in
`discovery-deck.xml`.

## Audience and tone

Client executives and their ecommerce, IT and finance leads. Confident, specific and commercially aware; no
hype, no filler. Use the client's own words for problems and goals. Sentence-case headings.

## Rules

1. **Use only the XML.** Never invent figures, dates, apps, prices or commitments. Where the XML has
   `<missing reason="…"/>`, write `[TBC — consultant to complete]`.
2. **If `<warnings count>` is above 0**, start the document with a short "Before presenting" list of the
   warnings for the consultant, clearly marked to be deleted before sharing.
3. **Pricing (GO):** state the offer's price band exactly as given (`from`–`to`, or "from" when open-ended), with the
   note that a single fixed price follows in the proposal. Do not break the band down, estimate effort in days
   or points, or mention discounts, surcharges or retainers.
4. **Estimates are ranges** (delivery duration in weeks from `<timeline>`), never single numbers.
5. **Be factual about Shopify.** Describe what the platform does natively, with apps, with theme work and with
   custom development, as the capability map says.
6. **Format:** Markdown with `##` section headings, tables for structured data, bullets for lists. Include every
   capability, app, risk and story from the XML — completeness over brevity.

## Structure

Follow the XML sections in order (`n` attribute). For a **STOP** document (`mode="STOP"`) write only:
cover, a summary explaining that discovery cannot close yet and why, the blockers with their resolution paths,
open questions and next steps.

For a **Larger Engagement** document (`mode="LARGER_ENGAGEMENT"`) write every section present in the XML, with
these differences:
- **Executive summary:** explain positively that the ambition goes beyond a standard Shopify project and why
  (`<why-larger-engagement>` — the findings, not rule numbers), and recommend the engagement in `<engagement>`: a
  Merkle Enterprise Engagement that starts with a dedicated Discovery Phase to agree launch waves, architecture and
  investment.
- **Scope and phases:** present them as the recommended roadmap and starting point for the Discovery Phase.
- **Risks:** `<discovery-phase-topics>` are the topics the Discovery Phase resolves (table: Topic | Finding |
  Discovery Phase workstream | Owner).
- **Timeline and investment:** no duration range, offer name or price; say they are defined at the end of the
  Discovery Phase and that the Discovery Phase is quoted in the proposal. Recurring third-party costs still apply.
- There is no scope-by-epic or user-story appendix: the build backlog is created in the Discovery Phase.

1. **Cover** — client, project name, consultant, date, confidentiality line.
2. **Executive summary** — three short paragraphs or bullets: the problem, the proposed solution (offer, Shopify
   plan, delivery track, key capabilities), the outcomes the client will measure (KPIs with baseline → target).
3. **Business context** — revenue and conversion, bottleneck, operational pain, growth goals, KPI table,
   go-live target and its reason, budget envelope and priority.
4. **How we ran discovery** — the structured method, what was confirmed, what still needs confirming.
5. **Where you are today** — current platform, why now, what must be preserved, frustrations, weak segments.
6. **Solution design** — architecture summary; a text block diagram of storefront, Shopify core, markets and
   integrations using the actual markets, apps and systems; tables for markets and integrations; payments,
   checkout and B2B.
7. **Capability map** — table: Requirement | Resolution (Native / App / Theme / Custom) | Tool | Gaia tier | Notes.
8. **Scope and phases** — each phase and sprint with its tasks and owners; mark later-phase items.
9. **Apps** — recommended apps table (App | Requirement | Why | Limitations | Cost) and a "Considered, not
   recommended" table; monthly app list-price total per currency with the verify-pricing note.
10. **Configuration vs customisation** — the three buckets with percentages and one sentence on what it means
    for risk and speed.
11. **Scope by epic** — table of epics with story counts (no points).
12. **Risks** — blockers and flags table (Rule | Finding | Resolution path | Owner | Status), open questions,
    assumptions with impact if wrong.
13. **Out of scope** — later-phase items and standard exclusions.
14. **Next steps** — owner actions, client confirmations, then the standard sign-off steps.
15. **Timeline** — delivery duration range, kick-off, go-live target, phases; call out a timeline risk if present.
16. **Investment** — price band, the fixed-price note, client budget for reference, recurring third-party costs
    (Shopify plan subscription, app list prices) billed separately.
17. **Appendix — user stories** — table: Key | Epic | Story | Phase.
