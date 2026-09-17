# Store configuration workbook

Tax and shipping set-up detail the discovery does not collect (ADR 0012), pre-filled from
`clients/<slug>/engagement.json`.

```bash
npm run workbook -- --client <slug>   # → clients/<slug>/configuration-workbook.md
```

Share it with the client once the scope is agreed; their finance and logistics teams complete it, and the store is
configured from it (backlog stories LWC-SHP-001, LWC-SHP-004 and the duties story). The workbook is client-facing: no
internal pricing, offer logic, exit rules, Shopify plan requirements, credentials or personal names.

Tests: `tests/unit/workbook.test.js`.
