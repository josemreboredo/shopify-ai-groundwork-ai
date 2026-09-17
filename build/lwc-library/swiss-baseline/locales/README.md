# Swiss Locale Packs

Switzerland has **four official languages**: German (de-CH), French (fr-CH), Italian (it-CH), Romansh (rm-CH).
Standard LWC scope covers **de / fr / it**. Romansh is only added if explicitly required by the brief.

## Language ↔ Market mapping

| Language | Locale code | Region(s) | Market |
|---|---|---|---|
| German | `de` (primary) | Zürich, Bern, Basel, central CH | Switzerland |
| French | `fr` | Geneva, Lausanne, Fribourg, Valais | Switzerland |
| Italian | `it` | Ticino, Graubünden (partial) | Switzerland |
| Romansh | `rm` | Graubünden only | Switzerland (out of scope by default) |

Note: For Shopify Markets, a single Swiss market can carry all three languages. Shopify auto-routes based on browser locale. The `hreflang` attributes are emitted by Shopify automatically when the market has multiple languages enabled.

---

## What to supply per locale

Each locale pack in Shopify is a single JSON file: `locales/<lang>.json` (primary) and `locales/<lang>.default.json` (the editable override layer).

Minimum keys required for LWC Starter/Medium:

```json
{
  "general": {
    "404": "Seite nicht gefunden",
    "typography": "Schrift",
    "fonts": "Schriftarten",
    "primary": "Primär",
    "layout": "Layout",
    "colors": "Farben",
    "page_width": "Seitenbreite",
    "page_margin": "Seitenrand",
    "corner_radius": "Eckenradius"
  },
  "labels": {
    "background": "Hintergrund",
    "foreground": "Vordergrund",
    "page_width": "Seitenbreite",
    "page_margin": "Seitenrand",
    "input_corner_radius": "Eingabefeld-Eckenradius",
    "add_to_cart": "In den Warenkorb",
    "sold_out": "Ausverkauft",
    "unavailable": "Nicht verfügbar",
    "sale": "Sale",
    "new": "Neu",
    "price": "Preis",
    "compare_at_price": "Vergleichspreis",
    "search": "Suchen",
    "close": "Schließen",
    "menu": "Menü",
    "cart": "Warenkorb",
    "account": "Konto",
    "checkout": "Zur Kasse"
  },
  "options": {
    "page_width": {
      "narrow": "Schmal",
      "wide": "Breit"
    }
  },
  "cart": {
    "title": "Warenkorb",
    "empty": "Dein Warenkorb ist leer",
    "subtotal": "Zwischensumme",
    "checkout": "Zur Kasse",
    "continue_shopping": "Weiter einkaufen",
    "remove": "Entfernen",
    "quantity": "Menge"
  },
  "product": {
    "add_to_cart": "In den Warenkorb",
    "sold_out": "Ausverkauft",
    "unavailable": "Nicht verfügbar",
    "quantity": "Menge",
    "sku": "Artikelnummer",
    "description": "Beschreibung"
  },
  "blog": {
    "article_metadata_html": "Von {{ author }} am {{ date }}",
    "article_comments": "Kommentare",
    "comment_form_title": "Kommentar hinterlassen",
    "comment_form_name": "Name",
    "comment_form_email": "E-Mail",
    "comment_form_body": "Kommentar",
    "comment_form_submit": "Absenden"
  },
  "404": {
    "title": "Seite nicht gefunden",
    "not_found": "Diese Seite existiert nicht.",
    "back_to_shopping": "Zurück zum Shop"
  },
  "accessibility": {
    "skip_to_content": "Zum Inhalt springen",
    "open_menu": "Menü öffnen",
    "close_menu": "Menü schließen",
    "open_cart": "Warenkorb öffnen",
    "close_cart": "Warenkorb schließen"
  }
}
```

**French (fr) and Italian (it) packs** follow identical key structure. See `de.json`, `fr.json`, `it.json` in this directory.

---

## Shopify admin setup steps

```
Admin → Settings → Languages
1. Add German (Switzerland) — de-CH
2. Add French (Switzerland) — fr-CH
3. Add Italian (Switzerland) — it-CH
4. Set German as primary

Admin → Settings → Markets → Switzerland
1. Add all three languages to the Swiss market
2. Enable Shopify Translate & Adapt (free) for content translation
3. Set CHF as the market currency

Note: Language codes in Shopify are BCP 47 (de, fr, it).
The regional variant (de-CH vs de-DE) is handled at the market level, not the locale file level.
```
