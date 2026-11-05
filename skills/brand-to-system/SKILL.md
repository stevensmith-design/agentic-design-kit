---
name: brand-to-system
description: >
  Derive a validated light-ground design system from a compatible machine-readable visual brand. Use when a brand exists
  (or has just been authored) and the project needs tokens.json + a four-layer DESIGN.md that
  passes validate-tokens.py --strict. Triggers on "turn this brand into a design system", "we have
  brand guidelines, set up the tokens", "derive tokens from the brand". Use ui-design-system's
  Create mode instead when there is no brand to derive from and the system is being authored from
  intent alone; use this when the brand is the input.
---

# Brand → system

The bridge between a compatible brand guideline and a design system. It is a deterministic producer,
not a creative direction source.

This particular deriver implements one explicit brand model: a light ground, one declared action hue
and a declared tinted-neutral strategy. Those choices must already exist in the machine-readable brand
and agree with the human-approved or reference-led direction. Never run this merely because a project
has references or lacks tokens; when the direction needs another colour, ground or separation strategy,
use `/ui-design-system` Create/Reconcile to encode that direction instead.

`brand-voice:*` covers voice and tone. This covers the visual half.

## Use

```bash
python3 scripts/derive-system.py BRAND.json OUTDIR
python3 <ui-design-system>/scripts/validate-tokens.py OUTDIR --strict    # must PASS
```

Outputs `tokens.json` and a four-layer `DESIGN.md` whose **Layer 4 is measured, not asserted** —
every relationship line is a number computed at generation time and re-checkable by the validator.

## The artifact

`schema/brand.schema.json`. The minimum a visual brand must state for a system to follow from it:

| Field | Why it is required |
|---|---|
| `colour.anchor` `{hue, chroma}` | The one action hue. Everything else is derived from or separated against it. |
| `colour.neutral` `{hue, chroma}` | The brand tint carried by the greys. Chroma must sit in 0.002–0.08 — outside that band the neutrals are either dead grey or actually colour. |
| `colour.onAnchor` | The label that sits on the action colour. The primary's lightness is *solved* against it. |
| `colour.inkLightness` | Where body ink sits on the ramp. Placed, then verified ≥ 7:1 — not solved to the minimum. |
| `type.baseSize`, `type.scaleRatio` | The scale the validator checks for ≥1.15× separation. |
| `brand.aestheticCommitment` | Layer 1. A vague commitment is a finding, not a system. |

Fields earn their place by being read. Nothing is in the schema that the deriver does not consume.

## What it decides that a person was deciding

- **The primary's lightness**, solved for AA against its own label before any other token commits.
  The lightest tone that clears the bar, so the result stays faithful to the declared hue.
- **The canvas**, solved down from the card until the value step lands in the 1.05–1.12 band.
- **The accent's text role.** A brand's action colour usually cannot also be its small-text colour
  on a light ground. The split is derived rather than discovered late.
- **Semantic hues**, rotated at least 40° off the anchor. A red brand with a stock red error state
  fails "state colours must be tellable apart without a legend".

## Known limitations

- **Light grounds only.** Dark-ground derivation is not written; the deriver refuses rather than
  guessing.
- **No support accent, no selection tokens, no dark mode.** The validator SKIPs those relationships.
  Seven of its checks are SKIPped on a system this size — a `--strict` PASS covers the four required
  relationships, not everything the validator can compute.
- **It cannot judge the brand.** A PASS means the relationships cohere. Whether the anchor hue is
  any good is `ui-design-review` and human judgement.
- **Brand authorship is agent-led.** For a requested visual guide from a brief or conversation,
  use `ui-design-system` → `references/brand-guidelines.md`. It may author compatible brand.json
  for this deriver. Automatic extraction of a brand artifact from existing CSS is not implemented.

## Worked example

`examples/groundwork/` — a real brand, hand-built by a designer, re-derived from a 20-line
`brand.json`: canvas `#FAF7F2` vs hand-made `#F6F3EE`, ink `#1E1A14` vs `#1E1712`, primary
`#DD3727` vs `#D52E1E`. `--strict` PASS, 4/4 required relationships assessed.

## Provenance

Three defects in this deriver were found by looking at its first real output rather than its exit
code, and are recorded in the code where they were fixed: every text role solving to `#000000`
(the docstring claimed a property the loop did not have); a stock error red sitting 14.3 deltaE from
a red brand anchor; and body ink solved to the minimum passing tone instead of placed and verified.
The first run passed `--strict` with all three present. **An exit code is not a design review.**
