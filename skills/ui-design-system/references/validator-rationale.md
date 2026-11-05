# Validator provenance & rationale

Calibration rationale for individual validator checks. The authoritative inline copies remain as comments
in `scripts/validate-tokens.py` next to the code they explain (that is where a maintainer editing the
check will see them); this file collects them in one place so the reasoning is legible without
reading the script. When a check's rationale changes, update both.

## Calibration cases

> Early calibration cases informed these thresholds. The checks are app-agnostic: they encode
> the relationship being tested, not the application used to observe it.

- **Primary ↔ disabled distinctness (`distinct/primary-vs-disabled`).** An early calibration case exposed a CTA that read as disabled because an enabled
  primary and a ghost/disabled state were only ~1.92:1 apart at `#27A390` — confusable. The check
  computes enabled-vs-disabled distance and warns on low separation. (`validate-tokens.py` ~L404.)
- **Badge/count-label-on-accent.** Small inline badge labels are caught by the render/inline sweep;
  the validator assesses the pair only when a badge fill role is declared (inline badges are
  assessed during rendering). (~L381.)
- **Background ↔ card value step.** An early calibration case measured 1.033 on the canvas but 1.126 on the
  card it actually sits on; a canvas-only check misses it. The check evaluates the step against the
  ground the element really sits on. (~L522.)
- **Selection ≠ action second signal.** An early calibration case showed a mockup that dropped
  the scale-lift and the selected tile read as blending; the check reminds the reviewer to verify the
  non-colour channel. (~L527.)
- **Tinted-tile separation config.** A calibration configuration (12% tint + 1.04 lift + ink check,
  decorative border retired) is what the tile/well/chip/callout separation check guards; a
  retired-border NOTE flagged the fragile config. (~L547–555.)
- **Theme-vs-tokens drift ("green as false comfort").** Early calibration checks found the
  same failure class: `tokens.json` validated while the shipped theme CSS carried different values.
  The `--theme` diff (Drift mode) exists to catch it. (~L773.)
