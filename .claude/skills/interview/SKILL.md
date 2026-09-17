---
name: interview
description: Run a Shopify discovery interview as a conversation in Claude Code — the lead consultant relays the client's answers (in any language), the engine asks only relevant questions, validates each answer, shows the offer (S/M/L), scope gates and exit rules as they emerge, and ends in clients/<slug>/engagement.json. Use when the user wants to interview a client, run discovery conversationally, or continue an interview.
---

# Discovery interview (consultant-run)

You converse; the repository code decides. Code chooses the next questions, validates every answer and computes the
offer, gates and exit rules. Never state an offer, gate or exit result that the CLI did not return, and never edit
`interview.json`, `decision.json` or `engagement.json` by hand.

## Before you start

1. Say once, in one line: this runs on the interim personal Claude Pro account (ADR 0007) and moves to dentsu's
   Claude Enterprise before dentsu / Merkle adoption or real client data at scale. Use example or anonymised clients
   until then.
2. Get the client slug (kebab-case, e.g. `acme-watches`), the language of the conversation and the mode:
   `quick` (required questions), `standard` (required + recommended, default) or `full` (everything). Every mode
   also asks the questions that change the offer or an exit rule, and app-related questions as soon as an earlier
   answer makes them relevant (e.g. high order volume brings the returns and tracking questions).

## Loop

1. Start or resume:
   ```bash
   npm run interview -- start --client <slug> --language <de|en|fr|it|es> --mode <quick|standard|full>
   ```
   An existing session resumes automatically. Use `--restart` only if the consultant asks to start over.
2. The first question is always consent (Q10.5.2). Nothing else can be recorded until it is answered `true`.
3. Ask the questions the CLI returns — up to three at a time, grouped naturally — **in the conversation language**.
   Translate the question text; keep option meanings exact. Show the `help` text when it matters for the answer.
   A question's `shopify` block is **for the consultant only** (owner decision 2026-09-17): the native Shopify
   feature, its minimum plan, the docs link and App Store candidates. Use it to steer toward what Shopify does
   natively and flag plan or app implications to the consultant (e.g. "consultant note: combined listings need
   Shopify Plus"); never present plan requirements as a question to the client unless the consultant asks.
   Full reference: `docs/discovery/consultant-guide.md`.
4. For each answer, map it to the returned `fields` and record it in **English**:
   ```bash
   npm run interview -- answer --client <slug> --question <id> --pointer <field> --value '<json>' \
     --source <client|consultant> [--status tbc] [--note "original wording or caveat"]
   ```
   - Enum answers must use an `allowed_values` entry exactly; table answers are one JSON array for the whole field
     using `item_fields`.
   - `source`: `client` when the client said it, `consultant` for the consultant's own assessment (questions with
     audience `consultant`).
   - Put the original wording in `--note` when translation could lose meaning (legal terms, product names).
   - If the CLI returns errors, explain them briefly and ask again. Never retry with a guessed value.
5. The client does not know yet → `npm run interview -- tbc --client <slug> --question <id> --note "..."`.
   Not applicable → `skip`. Consultant context that is not an answer → `note --text "..."`.
6. After each answer the CLI returns the offer, GO/STOP and fired exit rules. Mention them only when they change,
   and say "provisional" while `offer.provisional` is true. A STOP rule: tell the consultant immediately. The next
   question is then Q10.5.5 — how Merkle proceeds: `larger_engagement` (a Merkle Enterprise Engagement with a
   dedicated Discovery Phase) or `no_bid` (source `consultant`). A Larger Engagement keeps collecting everything and
   still produces the approach, a brief and the client deck — but no Jira tickets. If the consultant has not decided,
   mark it TBC and continue.
7. `plan_suggestion` in the output is the minimum Shopify plan the answers need (from Shopify's plan documentation),
   with its reasons, while the plan is open. Tell the consultant once and offer to record it
   (`--source inferred --note "Minimum plan for …"`); never record it silently. Do not assume Shopify Plus.
8. **Mainland China** (market code `CN`) is not part of the offering: rule 11.20 excludes it and routes it to a
   separate China discovery (`docs/discovery/china-mainland.md`: onshore selling needs a PRC entity, ICP and onshore
   hosting, and Shopify has no infrastructure in mainland China). The CLI then adds the § 3.5 Mainland China questions;
   without CN they are never asked.
   Tell the consultant when a client lists it; Hong Kong, Macau and Taiwan are separate markets.
9. Decisions and context that are not answers (e.g. "we will propose a Larger Engagement") go in `note`: notes are
   kept in `engagement.json` and shown in the STOP report, risks and brief.
10. Call `npm run interview -- next --client <slug>` when you need more questions, and
   `npm run interview -- preview --client <slug>` when the consultant asks where things stand (coverage, app
   signals).

## Personal data

Never record customer or stakeholder personal data. The CLI refuses e-mail addresses, phone numbers and card
numbers; stakeholder names are optional — record roles only unless the consultant insists.

## Finish

1. When `remaining` is 0, or the consultant wants to stop, run:
   ```bash
   npm run interview -- finish --client <slug>
   ```
   Unanswered and TBC questions become open items. If the result has `warning` (provisional offer), tell the
   consultant which decisive question is still open before continuing.
2. On GO, or STOP with route `larger_engagement`: follow the returned `next_step` — read
   `approach-instructions.md` in the work directory, write `approach.json`, then
   `npm run discover:finish -- --work clients/.work/<slug>`.
   On STOP without a route, or `no_bid`: run `npm run discover:finish -- --work clients/.work/<slug>` for the STOP report.
3. Offer the next steps: GO → `npm run backlog -- --client <slug>` and `/deck <slug>`; Larger Engagement →
   `/deck <slug>` only (no Jira tickets: the backlog is defined in the Discovery Phase).
4. Report: offer, GO/STOP and route, exit rules with evidence, open items, files written — in the conversation language.
