# Example Studio — design system
<!-- DERIVED by brand-to-system from brand.json. Layer 4 is measured, not asserted. -->
## Layer 1 — Intent
**Aesthetic commitment:** Warm bone paper and a vermilion signal, set in cool-black ink — a printed manifesto, not a SaaS page.
**Register:** brand_ui — design IS the product.
**Platform / audience:** web, marketing site / designers and design leads evaluating an AI design practice

## Layer 2 — System principles
**Colour strategy.** One anchor hue (30°, chroma 0.205). Every neutral is derived from a single brand-tinted ramp at hue 80° and chroma 0.008 — inside the 2–8% band, so the greys carry the brand without becoming colour.
**Permitted hues.** anchor/action (the primary and its text role); brand-derived neutrals; semantic state (error, success, warning). No support accent is declared, so none is permitted.
**Gradient policy.** none.
**Separation model.** Value step between canvas and card — not shadow, not glow. Measured in Layer 4.

## Layer 3 — Tokens
Mirrors `tokens.json` 1:1.

```json
{
  "color": {
    "primary": "#DD3727",
    "onPrimary": "#FFFFFF",
    "accentText": "#D73120",
    "canvas": "#FAF7F2",
    "surface": "#FEFDFB",
    "border": "#E3E0DB",
    "textPrimary": "#1E1A14",
    "textMuted": "#76716B",
    "error": "#A35100",
    "success": "#1C8742",
    "warning": "#DA950B"
  },
  "type": {
    "caption": "12px",
    "body": "16px",
    "h3": "20px",
    "h2": "26px",
    "h1": "34px",
    "display": "55px"
  },
  "radius": {
    "sm": "4px",
    "md": "6px",
    "lg": "8px",
    "pill": "999px"
  },
  "elevation": {
    "1": "0 1px 2px rgba(17,24,22,0.06)",
    "2": "0 4px 12px rgba(17,24,22,0.08)",
    "3": "0 12px 32px rgba(17,24,22,0.12)"
  }
}
```

## Layer 4 — Relationships & rationale
Every line below was computed by `derive-system.py` at generation time and re-checkable by `validate-tokens.py --strict`.

- **Background/card value step:** card #FEFDFB vs canvas #FAF7F2 = 1.051 (band 1.05-1.12). Checked.
- **Body-on-canvas:** ink #1E1A14 on canvas #FAF7F2 = 16.20:1 (AAA). Checked.
- **Muted-on-canvas:** muted #76716B on canvas #FAF7F2 = 4.52:1 (AA). Checked.
- **Body-on-card:** ink #1E1A14 on card #FEFDFB = 17.03:1. Checked.
- **CTA-label-on-CTA:** label #FFFFFF on primary #DD3727 = 4.52:1 (AA normal). Checked.
- **Accent-as-small-text:** accent-text #D73120 on canvas #FAF7F2 = 4.52:1 (AA). Checked.
- **Semantic separation:** state hues rotated to at least 40 deg from the anchor so they are tellable apart from the action colour. Checked.
- **Type scale:** ratio 1.28 from 16px base -> caption 12px, body 16px, h3 20px, h2 26px, h1 34px, display 55px. Checked.
- **Display tier:** register "brand_ui" on web, marketing site ships a hero, so the scale carries a display step two rungs above h1 (55px). A product-only register gets none: an unused tier is a size someone will reach for without a reason.. Checked.

**Why the primary is what it is.** It was not chosen and then tested. Its lightness was *solved* for AA against its own label before any other token committed to it, which is the one ordering mode-create insists on and the check real systems most often fail.
