---
name: discover
description: Run the Shopify discovery engine on a completed client questionnaire inside Claude Code (no Anthropic API billing) — consent and redaction, answer extraction, S/M/L offer and exit rules, capability map, app shortlist and phases, written to clients/<slug>/. Use when the user asks to run discovery, process or analyse a completed questionnaire, or classify a client engagement.
---

# Discovery (Claude Code mode)

You do the two LLM steps; the repository code does everything else. Never compute the offer, gates or exit
rules yourself, and never edit `decision.json` or `engagement.json` by hand — they are code outputs.

## Before you start

1. Tell the user, once, in one line: this mode runs on the personal Claude Pro account (interim, ADR 0007) and
   must move to dentsu's Claude Enterprise before dentsu / Merkle adoption or real client data at scale.
2. You need the questionnaire path and, ideally, the client slug (kebab-case, e.g. `acme-watches`). Ask only if
   they are missing and cannot be inferred from the file name.

## Steps

1. **Prepare** — consent check and redaction:
   ```bash
   npm run discover:prepare -- --questionnaire <path> --client <slug>
   ```
   If it fails (no consent in Q10.5.2, card numbers, customer e-mail lists), stop and report the message.
   **From here on, read only files inside the printed work directory.** Do not open the original
   questionnaire — the redacted copy is the only version you may process.

2. **Extract** — read `<work>/extraction-instructions.md` and `<work>/questionnaire.redacted.md`, then write
   `<work>/extraction.json` exactly as the instructions describe. Record only what the questionnaire says;
   TBC or blank answers become `open_items`, never guesses.

3. **Assemble** — validation, offer and exit rules:
   ```bash
   npm run discover:assemble -- --work <work>
   ```
   If it lists problems, fix `extraction.json` and run it again (at most 3 attempts; then stop and show the
   remaining problems to the user).

4. **Approach** (only if assemble printed GO) — read `<work>/approach-instructions.md` and write
   `<work>/approach.json` as described.

5. **Finish** — full validation and output:
   ```bash
   npm run discover:finish -- --work <work>
   ```
   Add `--dry-run` if the user asked not to write files. Fix `approach.json` and re-run if it lists problems.

## Report back

In a few lines: client, offer (code and name), GO or STOP, each exit rule that fired with its evidence, the
number of open items, and the files written. Do not show internal pricing or modifiers.
