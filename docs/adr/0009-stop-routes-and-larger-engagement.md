# ADR 0009 — What happens after a STOP: Larger Engagement

- **Status:** Accepted (2026-09-17, owner decisions after the ReboLabs demo interview)
- **Date:** 2026-09-17
- **Relates to:** ADR 0001 (offer model), ADR 0002 (engagement.json), ADR 0003 (exit rules), ADR 0006 (Jira), ADR 0008 (interview)

## Context

Until v0.5.0 a STOP ended discovery with a `stop-report.md` only: no capability map, plan, app shortlist, deck or
backlog. In the ReboLabs demo (8 markets, 7 languages, B2B quotes, 14 systems, pharmaceutical) the consultant
decided to propose a larger engagement "with all the information we have" and the tool had nothing to give them.
The decision itself was only in the work folder's consultant notes.

## Decision

1. **Route:** after a STOP the lead consultant records `delivery.route` (question Q10.5.5, asked in every
   interview mode while a STOP is open): `larger_engagement` or `no_bid`. Routes live in `discovery/schema/offering.json`.
   The former destinations "Scale programme" (11.3, 11.4) and "Bespoke quote" (11.7) are renamed Larger Engagement.
2. **The STOP stays open.** `delivery.go` remains false; the route says how Merkle proceeds outside the S/M/L
   offers, not that the blocker is resolved.
3. **Larger Engagement** = a Merkle Enterprise Engagement that starts with a dedicated Discovery Phase:
   - the approach is drafted (same step as GO, with instructions: full scope, Phase 1 is the Discovery Phase with
     one workstream per open STOP);
   - discovery writes `larger-engagement-brief.md`, `capability-map.md`, `delivery-plan.md`, `app-shortlist.md`
     and `risks.md`;
   - the **client deck is generated** (`mode="LARGER_ENGAGEMENT"`): solution sections without offer, price band,
     backlog epics or stories; investment and build backlog are defined at the end of the Discovery Phase;
   - **no Jira tickets**: `npm run backlog` refuses, because the backlog belongs to the Discovery Phase.
4. **No bid** writes the STOP report with the decision; no approach, deck solution sections or backlog.
5. **Consultant notes** from the interview are stored in `engagement.notes` and shown in the STOP report, risks and
   brief. They are never sent to the approach model and never enter the client deck.
6. The brief shows the nearest standard offer for internal reference only; the client sections of the deck show no offer name or
   price band (`deck:check` enforces it).

Same release: exit rule 11.17 (FLAG, sensitive personal data), `markets.primary_markets` (one or more), app
signals from tools the client uses or prefers, questions feeding the offer, exit rules or app signals asked in
every mode, and a minimum Shopify plan suggestion while the plan is open.

## Consequences

- A STOP engagement still ends in a client-ready closing document and an internal brief for the proposal.
- The Jira backlog for a Larger Engagement is produced after its Discovery Phase (future: re-run discovery with
  the phase's decisions, which may turn the engagement GO or keep it outside the offers with its own backlog model).
- `markets.primary_market` (string) is replaced by `markets.primary_markets` (array); existing engagement files
  must be re-run through discovery.
