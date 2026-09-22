# Question-bank issues found while writing the explanations

Source: the agents that wrote the `teach` blocks, section by section. Each item is a wording or wiring
problem in discovery/schema/question-bank.json, not a platform fact.

## Section 2 — catalogue
- **Q2.4.1** evidence mismatch: the question asks about consumer VIP/member prices but carries B2B catalog
  documentation. Should cite customer-segment discounting instead.
- **Q2.1.3** overlaps Q2.1.2 and clients rarely know the number. Suggested rewording with an example
  ("10 sizes × 8 colours = 80").
- **Q2.1.4** double-barrelled; suggest splitting into "separate SKUs today?" and "shown as one product?".
- **Q2.2.3** conditional on Q2.2.1 but not marked; "what must they do" is vague — list the bundle behaviours.
- **Q2.4.2** mixes a promotion mechanic with a price-tier mechanic in one boolean; make it a multi-select.
- **Q2.5.4** has no `drives` — consider a training/enablement signal.
- No `drives` at all: Q2.3.1, Q2.3.2, Q2.4.1, Q2.4.2, Q2.4.3, Q2.5.1, Q2.5.2, Q2.5.4.

## Sections 0–1 — business context, company, brand
- **Q0.2.6** asks expected orders per month but sits under current performance and maps to post-purchase;
  split current from expected volume (it drives app pricing and migration sizing).
- **Q1.1.6** mixes yes/no with a list, and the help answers a different question; reword as "List every legal
  entity that will sell through the store".
- **Q1.2.2** bundles URL, plan and theme, and its dependency on Q1.2.1 is not marked.
- **Q1.2.5** is consultant-audience but needs admin access to the client's store; add a store-access question
  first, or mark it "requires store audit".
- **Q1.2.6** should put "excluding agency collaborators and POS-only staff" in the question text — it drives a
  plan gate.
- **Q0.6.2** "balance" is the obvious answer; force a ranking or ask what they would give up first.

## Section 10 — delivery, governance, compliance, wrap-up
- **Q10.3.3** answer values are not visible in the question; list them ("retainer / ad-hoc / client-run").
- **Q10.3.4** assumes the consultant knows the Grow retainer; say "the post-launch support agreement".
- **Q10.3.6** "at each Shopify Edition" needs a gloss: "Shopify's twice-yearly platform release".
- **Q10.5.5** reads as if a STOP has happened; prefix with "If discovery hit a STOP…".
- **Q10.4.4** Shopify Payments eligibility depends on country *and* product category; split it or point at the
  supported-countries page in the help.

## Section 6 — customers, B2B, loyalty, privacy
- **Q6.2.6** asks an either/or but is a boolean; reword to "Do buyers need to request a quote or negotiate
  prices before ordering?" and let Q6.2.8 carry the route.
- **Q6.2.12** reads as a list of needs while it is a list of things Shopify B2B does not support; reword so a
  tick cannot be read as "supported".
- **Q6.3.5 / Q6.3.6 / Q6.3.7** are customer segmentation sitting under the loyalty subsection; move them to 6.1
  or retitle 6.3, so the deck does not file segmentation under a loyalty phase.

## Section 7 — marketing, tracking, discounts
- **Q7.1.4** duplicates Q7.7.1 (AI discoverability); delete it or reduce it to a pointer to 7.7.
- **Q7.2.2** "Is server-side tracking needed?" — clients don't know; ask the outcome ("do your ad platforms
  need conversions sent server-side?").
- **Q7.5.2** invites a list but is an enum, and it is the only required question here (drives a plan STOP);
  name the trigger case instead.
- **Q7.6.5** overlaps Q7.3.2 and Q7.5.7; narrow to who creates the code.
- **Q7.6.9** help answers scheduling while the question asks about traffic; split scheduling from drop readiness.
- **Q7.4.2** "is UGC important" gets a yes from everyone; ask whether it launches with customer photos.
- **Numbering gaps:** Q7.3.3 and Q7.6.8 do not exist — confirm they were retired deliberately.

## Section 5 — shipping, returns, post-purchase, retail
- **Q5.2.2** carries the Shopify explanation inside the question text; move it to help and ask the decision.
- **Q5.4.2 vs Q5.4.13** are near-duplicates; merge into one enum (no self-cancellation / request with approval /
  instant) or make 5.4.13 conditional.
- **Q5.5.3** bundles product page and checkout, which have different answers; make it a multi-select of surfaces.
- **Q5.2.4** mixes tools in use with preferences; split it.
- **Numbering gaps:** Q5.1.8 and Q5.4.1 are absent — confirm deliberate.

## Section 3 — markets, tax, China
- **Q3.4.1 vs Q3.4.8** redundant: the country list already answers the boolean; drop 3.4.1 or reduce it to
  "do you ship across borders at all?".
- **Q3.4.2** asks only about VAT registration; should ask for the registrations that matter (VAT/GST, OSS, IOSS).
- **Q3.4.9** "these territories" has no antecedent in the question text; name them.
- **Q3.4.5** is phrased yes/no but typed enum; ask "tax included, excluded, or a mix?".
- **Q3.1.6** asks every client about merchant-of-record outsourcing, but Managed Markets is US/CA/UK only; gate
  it on the entity country.
- **Q3.5.6** too open for an enum; spell the choices in the text.
- **Q3.1.1** is the heaviest question in the bank (six columns plus pricing strategy); consider splitting pricing.
- **Q3.4.7** maps to B2B tax exemption but sits in tax; order it after the B2B section.

## Section 4 — payments and checkout
- **Q4.2.5 is missing** (4.2.4 → 4.2.6); confirm deliberate.
- **Q4.1.4** is heard as "can we sell in several currencies?"; reword to "paid out in more than one currency".
- **Q4.1.6** is a multi-select with no list in the text; name the express checkouts.
- **Q4.2.1 / Q4.2.2 / Q4.2.3** ask the client the same thing three times; fold 4.2.2 into 4.2.1 and split by
  where the change sits (thank-you and order status vs information, shipping and payment — the Plus boundary).

## Sections 8–9 — integrations, migration, design and performance
- **Q8.2.2** multi-select with no options in the text; list products, customers, orders, reviews, redirects,
  subscriptions, content.
- **Q8.2.6** (subscription migration) is the biggest migration risk in the section but has no follow-up;
  add a conditional question for gateway and subscription app.
- **Q9.1.2** "How complete is it?" only works right after 9.1.1; name the Figma file in the text.
- **Q9.2.6** "Why headless?" is asked unconditionally; gate it on Q9.2.1 = yes.
- **Q9.2.7 / Q9.2.9** are fragments, not questions; write them out.
- **Q9.4.1** asks clients for Core Web Vitals figures they rarely have; offer Google's thresholds as the default
  and record whether the target is agreed or assumed.

## Cross-cutting
- Questions whose answers drive no gate, rule or app signal inform the narrative only — worth deciding whether
  each should drive something or be marked as context.
- One unsourced statement in the explanations: Q8.1.1's note that webhook delivery is not guaranteed and
  reconciliation is therefore in scope. It is true and documented on shopify.dev, but it is not yet in a
  reference chapter — add it to a chapter and cite it.
