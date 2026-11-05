# Dry-run format

Read-only. The shape of every verb's plan. Diagnosis per verb is in `verbs.md`.

```markdown
### Dry run — design-refine <verb>

#### Strategy it would lock first
<The stance for this target's visitor mode (Persuade, Operate, Read) and the overall approach.>

#### Where it would act

##### [P0–P3 | improvement / Act N] Short title
- **Where:** exact file:line call sites
- **Cause:** the owner of the problem — a token, a shared component, a wrapper, one page
- **Preserve:** what must not change — the identity, the approved direction, siblings' behaviour
- **Change:** the exact `old → new`, or bounded alternatives
- **Scope:** local/shared/system and representative siblings checked
- **Why:** the basis class (standard/correctness · project contract · established principle ·
  platform convention · heuristic/taste · UX/product hypothesis) and the evidence
- **How:** the form — token edit, component variant, CSS change, structural rewrite
- **Proof:** how the change will be confirmed — a render, a measurement, a rule going quiet
- **Uncertainty:** only when the exact change is unknown — candidates and the rule that picks one
- **AI-tell verdict:** when applicable, link the adjudication

#### Where it would stop and ask
<Ambiguous semantics, parked decisions, destructive trade-offs, missing owner intent.>

#### What it would hand off
<Follow-on verbs or work outside this verb's responsibility.>
```

Fields 2–9 are the eight of `ui-design-review/references/repair-prescriptions.md`, by the same
names. A defect carries its severity (P0–P3, `evaluate.md` § 3); a move that improves rather than
repairs — most of bolder, delight, overdrive — is marked `improvement`.

**Where the plan goes.** The dry run is a section of the report in `evaluate.md` § 5 — the same
header, banners and *Coverage and limits*, written once — placed after *Findings*. A verb that
works from a critique (polish) carries the critique too when none was in hand. A verb scoped to
one section or component carries no scores: ten heuristics on a hero measure nothing.

## Worked example (filled entry)

```markdown
### Dry run — design-refine polish

#### Strategy it would lock first
Operate surface, dense B2B pricing. Restore hierarchy so the recommended plan reads as primary
without colour tricks.

#### Where it would act

##### [P1 / Act 1] Remove the gradient from the three plan CTAs
- **Where:** `src/components/PricingCards.tsx:88`, `:141`, `:194` (each plan's CTA button)
- **Cause:** the shared CTA class, not the three buttons
- **Preserve:** the recommended plan stays the first thing the eye lands on
- **Change:** `bg-gradient-to-r from-indigo-500 to-violet-500` → `bg-[--color-primary]`
- **Scope:** shared component — 3 sibling CTAs checked; all use the same class
- **Why:** established principle (rules.md → Design decision gates: Gradient) — false depth with
  no meaning
- **How:** one CSS change in the shared class
- **Proof:** re-render at 1280 and 375; scan.sh "No gradient on interactive elements" goes quiet
- **AI-tell verdict:** CONFIRMED SLOP — no DESIGN.md entry, per-element, no stated purpose (see
  `adjudication.md`)

#### Where it would stop and ask
Whether the "Popular" plan should stay visually elevated — if yes, that is a **documented** intent
to log, not a gradient default.

#### What it would hand off
`design-refine typeset` for the price-figure hierarchy (out of scope for polish).
```

Rules:

- Cite real call sites and concrete changes.
- Respect the project contract without treating shipped frequency as proof of correctness.
- Surface parked decisions instead of resolving them silently.
- Adjudicate every detector hit; JUSTIFIED items remain visible as “keep,” not actions.
- Accessibility failures are mandatory fixes, never override suggestions.
- A material action entry meets the repair-prescription bar in
  `ui-design-review/references/repair-prescriptions.md`: constraints preserved, an exact or
  bounded change with its owning layer, a Proof, and any uncertainty given as bounded candidates
  plus a selection rule. A verb name is a handoff, not a prescription.
- Content that does not exist (a price, a customer, a benchmark, a quote) is a stop, never an
  invented value; demo data that would ship is labelled as such in the plan.
- A locked run ends with the lock line from SKILL.md, and nothing in the plan says it was applied.
