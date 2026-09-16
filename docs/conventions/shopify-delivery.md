# Shopify Delivery Conventions

> Agent reference — apply these rules on every Shopify engagement.

---

## Requirement → Shopify capability mapping

When a consultant describes a client requirement, map it to the right Shopify
capability in this order (cheapest/safest first):

```
1. Does Shopify have a NATIVE feature for this?
   → Recommend native (Markets, B2B, Bundles, Metaobjects, etc.)

2. Is there a WELL-ESTABLISHED APP on the Shopify App Store?
   → Recommend app + configuration guidance

3. Can it be solved with THEME CUSTOMISATION (Liquid/sections/CSS)?
   → Plan a T2 theme change

4. Does it need CUSTOM DATA STRUCTURES (metafields/metaobjects)?
   → Plan a T2–T3 data model change

5. Does it need a CUSTOM APP or Storefront API?
   → Plan a T3 with full scoping — this is rare for SME clients
```

Never jump to custom code if a native feature or app covers the requirement.

---

## Shopify tier guidance

| Work type | Default Gaia tier | Notes |
|---|---|---|
| Theme section / block edit | T2 | Schema validation required |
| CSS / typography token change | T1 | |
| New metafield definition | T2 | Namespace + key conventions below |
| New metaobject type | T3 | Crosses theme + admin surfaces |
| App install + config | T1–T2 | T2 if scripted config |
| B2B / Markets setup | T2–T3 | T3 if new pricing logic |
| Storefront API / Hydrogen | T3 | Always full scoping |
| Admin API custom app | T3–T4 | T4 if handles payments or PII |

---

## Metafield conventions

```
namespace: client_[shortname]      e.g. client_acme
key:       snake_case              e.g. wholesale_min_qty
type:      use built-in types      (number_integer, single_line_text_field, etc.)
```

Never use global namespace — always namespace under `client_*` to avoid conflicts.

---

## Liquid template rules

- Always validate Liquid with Shopify AI Toolkit before applying to a store.
- Never use deprecated `{% include %}` — use `{% render %}` only.
- Sections must have a valid `{% schema %}` block validated against Shopify schema.
- Never hardcode store-specific IDs in Liquid — use settings or metafields.

---

## App recommendation format

When recommending an app, always provide:
- App name + App Store URL
- Why it fits this requirement better than custom code
- Known limitations or gotchas
- Approximate cost (free / freemium / paid tier)
- Integration complexity (none / config-only / requires theme edit)

---

## Client store interaction rules

1. **Never mutate a production store without explicit consultant confirmation.**
2. Always work in a development store first.
3. Theme changes: use `shopify theme push --development` — never `--live` in MVP.
4. Every CLI action must be preceded by a T2+ plan approved by the consultant.
5. After any theme push, report what changed and how to preview it.
