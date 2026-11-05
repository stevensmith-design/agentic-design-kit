# Mode 1 — Create (intent → principles → tokens → relationships)

Greenfield. Build the system in the same order as the four layers (see
`references/design-system-layers.md`), and do not skip down to token values before the layer above is
decided.

**Direction precedence.** When a human-approved or reference-led direction exists, create the system
from that direction and keep its original references available. The examples below describe roles and
relationships, not a house style: they cannot forbid glow, require a tinted neutral ramp, select a
separation model or otherwise override an intentional treatment in the direction. First establish the
visual direction; then encode and validate its system.

1. **Intent (Layer 1).** Name the aesthetic commitment in one sentence (vague is wrong). State
   platform, audience, register (product UI vs brand UI). Settle the **task structure** first
   (primary action, information priority, interaction primitive, surface type, irreversibility,
   responsive behaviour) — structure precedes the visual direction. Fill the *Defaults retained vs
   product-specific decisions* declaration — a system that retained everything and decided nothing is
   a finding, not a system.
2. **System principles (Layer 2).** Choose the colour strategy and record why every non-neutral hue
   is permitted (brand/action, brand-derived support, semantic state, or data/category). Define the
   page hierarchy model, including how repeated actions stay subordinate to decision actions. Then
   choose the separation model the direction supports (for example value step, shadow, hairline,
   translucency or light),
   elevation-by-role, and motion character. These are the rules the tokens will instantiate.
3. **Tokens (Layer 3).** Fill `tokens.json` from `ui-design-principles/references/tokens-template.json`
   (its key names are the ones `validate-tokens.py` resolves) and the DESIGN.md token sections from
   the template.
   Define a coherent neutral strategy from the direction and brand. A tinted ramp is one option, not a
   default. Confirm that action colours meet required contrast with their labels.
4. **Relationships (Layer 4).** Write down why the values cohere, then prove it with the validator
   (invocation in SKILL.md — greenfield uses `--strict`):

   ```bash
   python3 <resolved>/validate-tokens.py <project-dir> --strict
   ```

   `--strict`: the core relationships (body-on-canvas, CTA-label, value step, neutral ramp) must be
   *assessed*, not SKIPped — an unresolved required role FAILs, so a half-populated token file can't
   pass on missing coverage.
   **The system must cohere before production components are finalized.** The first visual exploration
   may precede formal token validation; resolve every FAIL and every greenfield
   WARN. In particular, consume or retire every orphan token; reserve one only when Layer 4 names
   its future consumer and reason. After the final token or CSS edit, rerun the validator and record
   the checked relationships (contrast pairs, selection≠action, value step, ramp hue). Only then
   hand off to `ui-design-principles` for building screens.

## Required output sections

A Create run outputs: (1) the four-layer `DESIGN.md`, (2) `tokens.json` mirroring Layer 3 1:1,
(3) the **final** validator summary with its exact PASS / PASS WITH WARNINGS / FAIL verdict, counts,
WARNs and SKIPs, and (4) the Layer-4 relationship record (which pairs were checked and why they
hold). A greenfield Create run with an unresolved WARN, a missing Layer-4 record, or no final
`--strict` run is incomplete.

### Worked example — a filled Layer-4 entry

Illustrative verification only; its palette, separation and ramp choices are not defaults for another
project.

```
## Layer 4 — Relationships & rationale

- Body-on-canvas: ink #1A2422 on canvas #F7F9F8 = 13.1:1 (AA/AAA). Checked.
- CTA-label-on-CTA: white #FFFFFF on primary #0E7C66 = 4.9:1 (AA for normal text). Checked —
  this is the pair that most often fails; primary was chosen for this ratio before anything else.
- Value step: card #FFFFFF vs canvas #F7F9F8 = 1.06 (within 1.05–1.12). Separation is by value
  step, not shadow — matches the "calm, flat" intent.
- Selection ≠ action: selected fill #E3EFEC vs primary #0E7C66 — deltaE 41 plus a 2px inset ring,
  so selection never reads as the CTA even in grayscale.
- Neutral ramp: derived from brand hue 168° at 4% chroma — tinted, not dead-gray, not off-hue.
- Override log: none yet. (Any Tier-2 pattern added later lands here with its six-gate reasoning.)
```
