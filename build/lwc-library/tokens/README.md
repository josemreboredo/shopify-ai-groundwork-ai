# LWC Library — Token Architecture

## Three-File Model

```
_base.css        Spacing, layout, radius primitives, motion, shadow, z-index
_typography.css  Font families, scale, weights, line-heights, semantic type roles
_colour.css      Brand palette primitives + semantic aliases + radius presets
```

### What changes per brand
| File | Swap? | What to change |
|---|---|---|
| `_base.css` | ❌ Never | Layout and motion are universal |
| `_typography.css` | ⚠️ Font families only | Replace `--lwc-font-primary/secondary`, adjust weights |
| `_colour.css` | ✅ Yes | Replace primitive palette; re-map semantic aliases; set radius preset |

### Why semantic aliases matter
Components **never reference primitive tokens directly**. They always use a semantic alias:

```css
/* ✅ Correct — survives a rebrand */
background: var(--lwc-color-bg);
color: var(--lwc-color-text);

/* ❌ Wrong — breaks on rebrand */
background: var(--lwc-primitive-white);
color: var(--lwc-primitive-grey-900);
```

This means: change `--lwc-color-bg` in `_colour.css` → every component picks it up automatically. Zero per-component edits.

---

## How to Apply to a New Brand

1. Copy `tokens/` into the brand's theme directory
2. Open `_colour.css`:
   - Replace the primitive palette values with brand hex colours
   - Adjust semantic aliases if needed (e.g. brand uses accent colour for buttons instead of black)
   - Set `--lwc-radius-*` to match brand feel (0 = luxury sharp, 8px = modern, 9999px = playful round)
3. Open `_typography.css`:
   - Replace `--lwc-font-primary` and `--lwc-font-secondary` with brand font stacks
   - Add `@font-face` rules or Shopify font picker output above `:root`
4. Leave `_base.css` untouched

**Time budget:** 30–90 minutes for a competent brand application. This is the "brand in a day" target.

---

## Token Naming Convention

```
--lwc-{category}-{variant}

Categories:
  space       Spacing scale
  text        Type size scale
  font        Font family
  font-weight Font weight
  leading     Line height
  tracking    Letter spacing
  color       Semantic colour alias
  primitive   Raw palette value (never used in components)
  radius      Corner radius
  shadow      Box shadow
  duration    Animation duration
  ease        Animation easing
  transition  Shorthand transition
  z           Z-index
  ratio       Aspect ratio
  max-width   Layout width cap
```

---

## Bucherer → LWC Mapping

The Bucherer theme used `--buch-*` tokens. Here is the canonical mapping:

| Bucherer token | LWC semantic alias |
|---|---|
| `--buch-black` | `--lwc-color-bg-inverse` |
| `--buch-white` | `--lwc-color-bg` |
| `--buch-off-white` | `--lwc-color-bg-subtle` |
| `--buch-grey-dark` | `--lwc-color-text-subtle` |
| `--buch-grey-mid` | `--lwc-color-text-muted` |
| `--buch-grey-light` | `--lwc-color-border` |
| `--buch-gold` | `--lwc-color-accent` |
| `--buch-font-display` | `--lwc-font-primary` |
| `--buch-font-ui` | `--lwc-font-secondary` |
