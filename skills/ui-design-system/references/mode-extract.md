# Mode 2 — Extract (existing app; frequency ≠ correctness)

Reverse-engineer the system already in the code. **The most common value is not automatically the
right one** — extraction surfaces the implicit system *and* its inconsistencies; it does not bless
whatever recurs most.

1. Inventory actual usage: every unique colour, font size, weight, radius, spacing value, shadow —
   with counts and the files they appear in.
2. Cluster into a proposed scale: dominant radius values → `--radius-*`; recurring colours → semantic
   roles; recurring sizes → type scale. Note near-duplicates (`#1A2E2B` vs `#1B2B2A` — almost
   certainly one intent) and off-scale outliers.
3. Draft a four-layer `DESIGN.md` + `tokens.json` from the clusters (see
   `references/design-system-layers.md`). Infer Layer 1 intent from the product; mark inferred intent
   as *provisional — confirm with the team*.
4. **Run the validator on the extracted tokens.** Extraction frequently reveals a relationship the
   code never satisfied (a muted text that never cleared 4.5:1, a selection that matches the CTA).
   These are extraction findings, not the validator being wrong.
5. Output the `DESIGN.md` **plus** a drift list: where the codebase already disagrees with the system
   you just extracted. That list is the alignment backlog.

## Required output sections

An Extract run outputs: (1) the usage inventory with counts, (2) the reverse-engineered four-layer
`DESIGN.md` + `tokens.json` with Layer 1 marked *provisional*, (3) the validator summary on the
extracted tokens, and (4) the drift/alignment backlog. Do not present extracted values as an approved
system — they are a proposal pending team confirmation.

## Output format

Extract produces two artifacts, and they use formats that already exist — do not invent a third.

**The usage inventory** — what the codebase actually does, before any judgment about what it should:

| Decision | Values found | Instances | Reading |
|---|---|---|---|
| Border radius | `4px` ×31, `6px` ×12, `12px` ×3 | 46 | `4px` is the system; `6px` is drift; `12px` is the modal, deliberate |
| Button height | `36px` ×18, `40px` ×6, `44px` ×2 | 26 | Two compact variants where one was intended |

The **Reading** column is the point. A value list is not an extraction — the judgment about which
value *is* the system, which is drift, and which is a legitimate second case is the work, and it is
what Layer 4 of `DESIGN.md` records.

**The drift list** uses the **same table as Drift mode** (`mode-drift.md` → Output) — token expected
vs. value found vs. locations — so an extracted backlog and a drift report are directly comparable,
and re-running Drift after the extraction lands measures progress against the same shape.

State plainly which decisions were **inferred from a majority** and which the code makes
unambiguous. An inferred rule presented as an established one is how an extraction launders an
accident into a contract.