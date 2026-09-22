# Market topology — questionnaire audit

**Status:** Step 1 of the market-topology task. No question has been added or amended; this
document is the precondition for that work.
**Scope of the audit:** the whole question bank (297 questions, `discovery/schema/question-bank.json`
v1.2.0), the rules engine (`discovery/schema/offering.json` v1.3.0), the engagement contract
(`contracts/engagement.schema.json`) and the verified reference chapters.
**Date:** 2026-09-18.

> **The governing principle.** The questionnaire asks about the client's business. The engine
> decides the architecture.
>
> **The fact test.** Could a country manager, a controller, a merchandiser or a logistics lead
> answer this from what they already know about how their company operates, without knowing
> anything about Shopify? If not, it is not a discovery question — derive it.

**Open dependency.** The brief for this task was truncated partway through Step 2, so the Step 3
criteria list was never received. Part 1b is therefore written against the criteria set derived in
[§ 1b.0](#1b0-the-criteria-this-audit-tests-provisional) from the topology decision itself and from
the constraints documented in `discovery/docs/reference/shopify-markets.md` and
`managed-markets.md`. When the Step 3 list arrives, reconcile the two: any criterion there that is
not below needs its own derivability row before Step 2 starts.

---

## 1a. Solution leakage

A question leaks when it asks the client (or the Lead Consultant, mid-interview) to choose an
architecture, a pattern or a Shopify feature instead of describing the business. Leakage has two
costs: the answer comes back `not_sure` or TBC, and when it does come back it anchors the
engine on a decision nobody has analysed.

Severity is used as follows. **Blocking** — the question asks for the output of the discovery
itself; the engine cannot proceed without deriving it anyway. **High** — the answer is a solution
choice that a client cannot be expected to make, and a derivable fact exists behind it.
**Medium** — the question is answerable as a fact by a client who already runs Shopify, but is
worded in Shopify vocabulary and misfires on greenfield or non-Shopify clients. **Low** —
vocabulary only; the underlying intent is a business fact.

### The two known cases (in scope for this task)

| id | Current wording | Why it leaks | Replace with |
|---|---|---|---|
| **Q3.1.4** | "Operating model: one store with Shopify Markets, expansion stores, or hybrid?" | **Blocking.** This is the deliverable, asked as an input. It is addressed to the consultant, but the consultant is running an interview, not a solution workshop; on the reference engagement it came back TBC. Worse, it feeds exit rule 11.1 (plan gate), so an uninformed guess of `expansion_stores` fabricates a Plus requirement — or a guess of `shopify_markets` hides one. | Nothing. **Derive** the topology from the criteria in § 1b and write it to a new derived field; retire `/markets/strategy` as an input. |
| **Q3.1.6** | "Who is merchant of record for international orders?" (`self_managed_markets`, `managed_markets`, `third_party_mor_app`) | **Blocking.** "Merchant of record" is a term of art most clients have never met, and the answer is fully determined by facts we already hold — see § 1b.H. Managed Markets eligibility alone rules it out for every client not based in the US, Canada or the UK, which is most of Merkle's EMEA pipeline. | Nothing. **Derive** it. Eligibility is a closed set of documented conditions; the only judgement left is commercial, and that belongs in the approach, not the questionnaire. |

Both are `required` and `consultant`-audience, so today they block completion of a standard
interview with a question neither party can answer.

### Adjacent to topology, same failure mode

| id | Current wording | Severity | Why it leaks | Fact behind it |
|---|---|---|---|---|
| **Q3.1.7** | "Should any market have its own theme content, section order, checkout or customer-account settings?" | High | "Theme content", "section order" and "customer-account settings" are Shopify constructs. The question also silently encodes the answer: per-market theme customisation needs Advanced or higher, so a yes is a plan constraint the client cannot see they are creating. | "Does any country's site need to differ from the others — different homepage and campaigns, different content, a different look — or is it the same site in another language and currency?" |
| **Q3.1.1** (`domain_type` column) | Per market: `subfolder` \| `subdomain` \| `country_domain` | High | Asks the client to pick a domain architecture, which is an SEO and topology *output*. The column sits inside an otherwise exemplary fact-based table. | "Which web address do customers in this country use today, and do you already own it?" — existing equity is the fact; subfolder vs ccTLD is our recommendation. |
| **Q3.1.5** | "How should visitors reach their local market?" (`automatic_redirect`, `country_selector_only`, `suggest_banner`) | Medium | Reasonable as a business preference, but the options are Shopify behaviours, and the EU ccTLD redirect exception makes the right answer depend on the domain decision we have not made yet. | Keep as a preference, ask it after the domain recommendation, or reword to "should a visitor in the wrong country be moved automatically, or offered the choice?" |
| **Q3.2.1** | "How will translation be handled?" (`in_house`, `agency`, `translate_and_adapt`, `third_party_app`, `pim_supplied`) | Medium | Mixes two different things: who does the translating (fact — in-house, agency, PIM) and which tool does it (solution — Translate & Adapt, third-party app). | Split: keep the "who" as the fact; derive the tool from language count, translation scope and plan. |
| **Q3.4.6** | "Which tax service?" (`shopify_tax`, `tax_app`, `manual_rates`) | High | Pure solution choice, addressed to the consultant. Derivable from the market list, VAT registrations and Shopify Tax's documented coverage (US, EU, UK, CA; Basic Tax for NO, CH, AU, NZ, SG). | Nothing — derive. |
| **Q3.4.11** | "Who issues invoices to customers?" (`shopify_vat_invoices`, `order_printer`, `invoicing_app`, `erp`, `billing_or_tax_service`) | Medium | Three of the five options are Shopify answers. The fact is whether invoicing already happens in a finance system. | "Does a finance or ERP system issue the customer invoice today, or does it have to come from the webshop?" |

### Elsewhere in the questionnaire — reported, not rewritten in this task

Per the brief, these are findings only; nothing outside market topology is amended here.

| id | Current wording | Severity | Why it leaks | Fact behind it |
|---|---|---|---|---|
| **Q6.2.8** | "Native Shopify B2B or an app?" (`shopify_b2b`, `shopify_b2b_plus_apps`, `b2b_app_only`, `separate_b2b_expansion_store`) | Blocking | The same failure as Q3.1.4, in the B2B section — and `separate_b2b_expansion_store` is a *topology* answer hidden outside section 3. Everything needed to decide it is already collected in Q6.2.2–Q6.2.13 (company accounts, price lists, catalog count and company-specificity, payment terms, unsupported needs) against the documented B2B plan gates. | Nothing — derive. **This question must be resolved in the same movement as Q3.1.4, or the two will disagree.** |
| **Q9.2.6** | "Why headless?" (`ux_not_possible_in_theme`, `performance`, …) | Blocking | Presupposes the answer to Q9.2.1 and asks the client to justify an architecture. The reasons offered are our arguments, not their facts. | Derive the storefront track from the interaction requirements (Q9.2.4), the content model (Q9.2.8), the app estate and the plan; keep a fact question about existing front ends and CMS. |
| **Q9.2.7** | "Headless hosting?" (`oxygen`, `self_hosted_js_runtime`) | High | Consultant-facing solution choice inside the questionnaire. | Derive from the delivery track and the client's hosting constraints. |
| **Q9.2.9** | "Headless platform features required?" (`customer_account_api_accounts`, `markets_i18n_routes`, `b2b`, …) | High | A checklist of Shopify APIs. Every item restates a business requirement already captured elsewhere (accounts Q6.1.3, markets Q3.1.1, B2B § 6.2, subscriptions Q2.2.4, bundles Q2.2.3). | Derive — it is a join over answers we already hold. |
| **Q4.2.1** | "Which checkout changes are needed?" (`branding_in_editor`, `checkout_step_blocks_or_fields`, `checkout_branding_api_styling`, `backend_logic_functions`, `fully_custom_checkout_ui`) | High | Asks the client to choose the Shopify extension mechanism. The mechanism is exactly what decides the plan (checkout step extensions and the Branding API are Plus), so the client is unknowingly answering the plan question. Feeds exit rules 11.1 and 11.6. | "What has to happen at checkout that Shopify does not do out of the box — what must the customer see, enter or be prevented from doing?" Then derive the mechanism and the plan. |
| **Q5.1.4** | "How should Shopify pick the fulfilling location?" (`minimize_split_fulfillments`, `ranked_locations`, `location_metafields`, `custom_rule_function`, `erp_or_oms_decides`) | High | `location_metafields` and `custom_rule_function` are implementation techniques. Feeds exit rule 11.13. | "What rule decides which warehouse ships an order today — nearest to the customer, the one with stock, a fixed priority, or the ERP?" |
| **Q2.2.2** | "Will subscriptions run on Shopify Subscriptions (Shopify's app) or a third-party subscription app?" | High | Product selection asked as discovery. Derivable from the feature list in Q2.2.4 (prepaid multi-delivery, build-a-box, B2B subscriptions, contract migration). | Keep only "do you have subscription contracts to migrate, and from which system?" — a fact. |
| **Q2.3.3** | "Which product attributes go beyond Shopify's standard fields…?" | Medium | Requires the client to know Shopify's standard product fields. | "Which product attributes do customers need to see, search or filter on?" — the metafield decision is ours. |
| **Q5.1.12** | "How are shipping labels created?" (`shopify_shipping`, `3pl_system`, `carrier_software`, `shipping_app`) | Medium | Fact for an incumbent, solution for greenfield. | "Who prints the label today — your team, the 3PL, or the carrier's own system?" |
| **Q5.2.4 / Q6.3.3 / Q7.4.1** | "Which returns / loyalty / reviews app is used **or preferred**?" | Medium | "Or preferred" invites a client preference to override our shortlist, and the app shortlist is an engine output (`app_signals`). | Keep "which do you use today, and is there a contract you must keep" — drop "or preferred". |
| **Q1.2.3** | "Which Shopify plan will the new store run on (if already decided)?" | Medium | Guarded by "if already decided" and by the help text, and it is a real fact when the client has already bought a plan — but it feeds exit rule 11.1 directly, so an aspirational answer becomes a constraint. | Keep, but treat as *evidence of a client assumption*, never as the target; the engine already recommends the plan. Make the distinction explicit in the field. |
| **Q4.1.1** | "Which payment providers will you use (Shopify Payments, Adyen, Stripe, PayPal…)?" | Low | Naming Shopify Payments first anchors the answer. The underlying fact — existing acquirer relationships and contracts — is sound. | "Which payment providers do you use today, and are any of those contracts you must keep?" |
| **Q5.6.2** | "Point of sale at launch?" (`shopify_pos`, `other_pos_integrated`, `other_pos_separate`) | Low | "At launch" asks for a decision; the fact is which POS the stores run today. | "Which till system do your stores use today?" |
| **Q2.5.4** | "Which inventory tasks will your team do in Shopify?" | Low | Presupposes Shopify is the place those tasks happen. | "Which inventory tasks does your team do by hand today?" |
| **Q9.2.10** | "Do you want to A/B test themes or checkout configurations?" | Low | Shopify vocabulary around a genuine business intent. | "Do you run experiments on the site today, and with which tool?" |
| **Q7.7.2** | "Should Shopify enrol you automatically in new AI channels as they appear…?" | Low | Shopify-specific, but it is a genuine governance preference with no derivable answer — the client's risk appetite is the fact. | Keep; reword to lead with the business consequence. |

**Count:** 26 of 297 questions carry some degree of solution leakage — 4 blocking (Q3.1.4, Q3.1.6
in market topology; Q6.2.8, Q9.2.6 elsewhere), 8 high, 9 medium, 5 low. Q3.1.4, Q3.1.6 and
Q6.2.8 are the only ones that leak the *architecture of the store itself*; the rest leak feature
and product choices.

---

## 1b. Derivability

### 1b.0 The criteria this audit tests (provisional)

Pending the Step 3 list. Each criterion is stated as a business fact, with the topology
consequence it drives and the documented Shopify constraint behind it.

| # | Criterion | Topology consequence |
|---|---|---|
| A | Legal entity per market | A separate selling entity per country forces either business entities per market (Plus + Shopify Payments + new Markets) or one store per entity (expansion stores, Plus) |
| B | Settlement and payout separation | Payouts in more than one currency start at Advanced; separate bank accounts per entity push towards separate entities or stores |
| C | Assortment divergence | A deliberately different range per country is handled by catalogs on one store; a different catalogue *structure* is the documented reason for an expansion store |
| D | Pricing governance | Fixed per-market prices maintained in an ERP are a Markets price-list integration; independent local pricing authority points at separate stores |
| E | Merchandising and content divergence | Per-market theme customisation requires Advanced or higher; wholly different sites point at expansion stores |
| F | Localisation depth | 20 published languages on Basic–Advanced, 30 on Plus; >2 machine-translated languages is a cost line, not a topology driver |
| G | Domain and SEO footprint | Existing local domain equity justifies ccTLDs; shared domains are not indexed, and EU ccTLD visitors are never auto-redirected |
| H | Tax posture and merchant of record | Registration capacity decides self-managed vs Managed Markets vs third-party MoR; Managed Markets is US/CA/UK-only, Shopify Payments-only, no B2B |
| I | Inventory and fulfilment geography | Fulfilment inside the destination region changes duties, OSS eligibility and Managed Markets eligibility |
| J | Payments availability per market | Shopify Payments country support decides whether local currency pricing and Managed Markets are even possible |
| K | Local operating autonomy | Country teams that publish independently need separated admins, staff and release cycles — the strongest non-technical argument for expansion stores |
| L | Channel and segment separation | B2B alongside D2C, and retail markets, are separate market *types* on one store, or a separate store |
| M | Plan headroom | The topology proposes a plan; the plan constrains the topology. Circular unless both are derived together |
| N | Run cost, QA matrix and release model | Pure output — never asked |

### 1b.1 Derivability per criterion

**Verdicts:** ✅ derivable from existing answers · ⚠️ partly derivable, stated gap · ❌ not derivable.

| # | Derivable from | Verdict | Notes |
|---|---|---|---|
| **A** Legal entity per market | Q1.1.2 `/meta/client/hq_country`, Q1.1.6 `/meta/client/legal_entities`, Q3.1.1 `/markets/list/*/code` | ⚠️ | We learn *that* several entities exist and *which markets* exist, but nothing joins them. Two entities and six markets could mean one entity per region or one dormant holding company — opposite topologies. **Gap 1.** |
| **B** Settlement separation | Q4.1.4 `/payments/multi_currency_settlement`, Q3.1.1 `currency`, Q1.1.6 | ⚠️ | Multi-currency payout is captured and already feeds 11.1. Whether each entity needs its own payout account is not — it follows from Gap 1 once entities are mapped to markets. |
| **C** Assortment divergence | Q3.1.8 `/markets/product_restrictions_by_market`, Q2.1.1 `sku_count`, Q2.2.1 `product_types` | ⚠️ | Q3.1.8 covers only *prohibited* products (regulation, licensing, distribution). A deliberately different range per country — different brands, pack sizes, seasonal lines — is not asked anywhere. This is the single most common real reason for an expansion store. **Gap 2.** |
| **D** Pricing governance | Q3.1.1 `price_strategy` per market, Q2.4.3 `/catalogue/pricing/market_specific`, Q2.4.1, Q2.5.1 `/catalogue/inventory/source`, § 8 integrations | ✅ | `price_strategy` per row (`base_currency`, `auto_converted`, `manual`, `display_only`) plus Q2.4.3 and the ERP presence is enough to tell auto-conversion from ERP-maintained price lists. No new question. |
| **E** Merchandising divergence | Q3.1.7 `/markets/per_market_customisation`, Q9.2.4 `interactive_patterns`, Q1.3.x brand | ⚠️ | Q3.1.7 asks the right *thing* in the wrong *words* (§ 1a). Rewording it — same id, same field — closes this without a new question. |
| **F** Localisation depth | Q3.1.1 `languages` per market, Q3.2.2 `rtl_required`, Q3.2.3 `seo_per_language`, Q3.2.4 `translation_scope` | ✅ | Distinct language count is already computed (exit rule 11.4 at >6). Nothing further needed. |
| **G** Domain and SEO footprint | Q3.1.1 `domain` + `domain_type`, Q1.1.5 current URL, Q0.5.2 must-not-be-lost | ⚠️ | The `domain` column captures the intended address; `domain_type` asks for the architecture (§ 1a). Whether local domains are *already owned and ranking* — the only fact that justifies ccTLDs — is implied by Q0.5.2 at best. Closed by rewording `domain_type`, not by a new question. |
| **H** Tax posture and MoR | Q1.1.2 hq_country, Q1.2.3 plan, Q4.1.1 providers, Q3.4.2 `vat_countries`, Q3.4.8 `ddp_markets`, Q3.4.9 `low_value_schemes`, Q3.4.12 e-invoicing, Q5.1.3/Q5.1.1 fulfilment, Q1.1.4 business model | ⚠️ | **Managed Markets eligibility is fully derivable** — HQ outside US/CA/UK rules it out; so do B2B (Q1.1.4) and the absence of Shopify Payments (Q4.1.1), and a home-country fulfilment location is testable against Q5.1.1–Q5.1.3. So Q3.1.6 needs no replacement. What is missing is the *self-managed* side: whether the business is registered, or willing to register, in the destination countries it is not registered in today. Q3.4.2 gives the current registrations only. **Gap 3.** |
| **I** Fulfilment geography | Q5.1.1 `model`, Q5.1.2 `provider_3pl`, Q5.1.3 `fulfilment_locations`, Q5.1.9 `excluded_countries`, Q5.1.11 `delivery_methods`, Q5.6.1 `store_count` | ⚠️ | We know *how many* locations fulfil and the delivery methods, but not *where* they are. "Three locations" serving six markets is compatible with both topologies; "a warehouse in each region" is not. The country of each fulfilment location is a logistics fact. **Gap 4** — smallest of the four, and a candidate for amending Q5.1.3 rather than adding a question. |
| **J** Payments per market | Q4.1.1 `providers`, Q4.1.2 `local_methods`, Q4.1.4 settlement, Q4.1.5 `pci_scope`, Q3.1.1 `currency` | ✅ | Shopify Payments country support is a documented fact per market code; the questionnaire supplies the market list and the incumbent providers. Derive. |
| **K** Local operating autonomy | Q10.2.1 `/stakeholders` (role, RACI, decision-maker), Q1.2.6 `staff_users`, Q10.3.3 `support_model` | ❌ | Nothing asks who runs each country day to day. The stakeholder table records project roles, not operating structure, and a staff-user count says nothing about whether those users work for one team or five. This is the criterion clients answer most easily and we never ask. **Gap 5.** |
| **L** Channel and segment separation | Q1.1.4 `business_model`, Q6.2.2–Q6.2.13 (company accounts, price lists, catalog count, company-specific catalogs, payment terms, unsupported needs), Q5.6.1 `store_count`, Q1.1.7 channels | ✅ | Everything needed is present, including the documented B2B catalog gate (3 active catalogs off Plus; company-specific catalogs Plus). Q6.2.8 should be *derived from* these, not asked (§ 1a). |
| **M** Plan headroom | Q1.2.3 `target_plan`, Q1.2.6 `staff_users`, Q4.2.1 checkout, Q6.2.10 catalogs, Q3.1.7, plus the plan rules in `discovery/agents/discovery/plan.js` | ✅ | The engine already recommends a plan and already fires 11.1 on mismatch. Topology must be decided *with* the plan in one pass, not before it. |
| **N** Run cost, QA, release model | — | ✅ | Output of the topology, computed. Never asked. |

**Score:** of 14 criteria, 6 are fully derivable today, 7 are partly derivable, 1 is not derivable
at all. Every one of the 7 partials is closed either by a wording change to an existing question
or by one of the four gaps below.

---

## 1c. The irreducible gap

Minimising new questions is an explicit goal. The audit therefore separates three kinds of
remedy, in increasing cost to the interview.

### Retire — asked today, needed never

| id | Action | Justification |
|---|---|---|
| Q3.1.4 | Remove from the interview; keep `/markets/strategy` in the contract as a **derived** field | § 1b A–N: the criteria that decide it are derivable once Gaps 1–5 are closed |
| Q3.1.6 | Remove; keep `/markets/cross_border_model` as a **derived** field | § 1b H: eligibility is a closed documented set, and the commercial call belongs in the approach |
| Q3.4.6 | Remove; derive the tax service | § 1b H: Shopify Tax coverage vs the market list is a lookup |
| Q6.2.8 | Remove; derive the B2B approach **in the same pass as the topology** | § 1a: contains a topology answer (`separate_b2b_expansion_store`) outside section 3 |

Net effect on interview length: **−4 questions**, three of them `required`.

### Reword — same id, same field, business language

No new questions; these close criteria C (partly), E and G.

| id | Change |
|---|---|
| Q3.1.7 | From Shopify constructs to: does any country's site need to differ beyond language and currency, and how |
| Q3.1.1 `domain_type` | From an architecture choice to the fact: which address is used in this country today, and is it already owned |
| Q3.4.11 | From a list of Shopify tools to: does a finance system issue the invoice today |
| Q3.2.1 | Keep who translates; drop the tool options |

### Amend — an existing question grows a column

Cheaper than a new question: the client is already answering in that place.

| id | Amendment | Closes | Fact test |
|---|---|---|---|
| **Q1.1.6** | From a list of entity names to a small table: entity · countries it sells in · does it invoice customers in its own name · does it hold its own bank account and tax registrations | **Gap 1** (criterion A, and B by consequence) | ✅ a controller answers this from the org chart |
| **Q3.1.8** | Widen from "products not allowed" to cover both: products that may not be sold in a market, **and** ranges deliberately different by country | **Gap 2** (criterion C) | ✅ a merchandiser knows which countries sell a different range |
| **Q3.4.2** | Add the mirror of the current registrations: countries you sell to where you are **not** registered and do not intend to register | **Gap 3** (criterion H) | ✅ a controller knows where they file and where they refuse to |
| **Q5.1.3** | Add the country of each fulfilling location (a short table instead of a count) | **Gap 4** (criterion I) | ✅ a logistics lead knows where the warehouses are |

### Add — the one genuinely new question

| Proposed | Wording (draft, for Step 2) | Closes | Fact test |
|---|---|---|---|
| **Q3.1.9** | "Who runs each country day to day — one central team for all countries, or local teams that set their own prices, campaigns and site content?" | **Gap 5** (criterion K) | ✅ answerable by anyone in the business; contains no Shopify vocabulary and no architecture |

**Result: one new question, four amendments, four rewordings, four retirements — a net
reduction of three questions in the interview**, and market topology becomes derivable.

### Why these five gaps and no others

Each gap was tested against the alternative of inferring it:

1. **Entity ↔ market map** — cannot be inferred: the same entity count is compatible with opposite topologies.
2. **Assortment divergence** — cannot be inferred from SKU count or product types; a 40,000-SKU catalogue can be identical in every country.
3. **Registration refusal** — the absence of a country from Q3.4.2 is ambiguous between "not registered yet", "not required" and "never will be", and the three point at different cross-border models.
4. **Location countries** — a count cannot be geolocated; and this one is a column on a question already asked.
5. **Operating autonomy** — no proxy exists. Staff-user counts, support model and the stakeholder table all describe the project, not the operation.

Everything else in § 1b.1 resolved to existing answers.

---

## Appendix — engine surfaces that will consume the derived topology

Recorded here so Step 2 and Step 3 do not miss a dependency.

| Surface | Today | After |
|---|---|---|
| `scope_gates.markets` | Fires on ≥2 markets | Unchanged; topology is a separate output |
| `exit_rules.11.1` (plan gate, STOP) | Reads `/markets/strategy` and `/meta/client/legal_entities` as **client inputs** | Must read the **derived** topology, or it will keep firing on guesses |
| `exit_rules.11.3` (>5 markets, STOP) | Counts `/markets/list` | Unchanged |
| `exit_rules.11.13` (fulfilment routing, FLAG) | Reads Q5.1.3/Q5.1.4 | Gains the location countries from the Q5.1.3 amendment |
| `app_signals.translation_app` | Reads `/markets/list`, translation method and scope | Unchanged |
| `approach` / capability map | No topology capability | Needs a topology capability with `client_requirement`, `why_this_level`, `limits` and sources |
| `deck_schema` / `deck_xml` | `architecture` layout exists, no topology slide | Needs the decision, the options considered, pros and cons, and the run-cost consequence |
| Reference chapters | `shopify-markets`, `managed-markets` carry the constraints | Both are current (verified 2026-09-17) and already cite the plan gates this decision turns on |

---

## What is not in this document

- No question has been added, amended, reworded or renumbered. No id has been reused.
- The topology decision rules themselves (which combination of criteria yields which topology)
  are Step 3 and are deliberately absent.
- Leakage findings outside market topology are reported only, per the brief.
