# Whole-app coverage — a refuse-to-sign-off checklist

Read-only. Read this for a whole-app or multi-screen review. It defines what a **package-level
sign-off requires**, so that a set of individually-polished screens can still fail as a *product*.
This is a coverage discipline the reviewer runs by hand against the evidence available — **not**
an automation engine (see the hard boundary).

## Contents

1. Required coverage
2. Whole-app failure modes this catches
3. Hard boundary
4. Verdict rule

## 1. Required coverage — no whole-app PASS while any item is unassessed

Items 1–10 apply to every whole-app review; item 11 is conditional on the product being AI/agentic.

1. **Route & screen inventory** — enumerate the routes/screens; name what is explicitly out of scope.
2. **Screen-archetype sampling** — group screens into archetypes (list, detail, form, dashboard,
   settings, onboarding, empty/error) and review a representative of each; **name which screen stood
   in for each archetype**, and how many were not opened.
3. **Shared component-family inventory** — list the shared components (button, card, dialog, sheet,
   table, nav) and where each appears, so cross-screen comparison (§8 below) has a target list.
4. **IA coverage** — navigation, grouping, labels, information scent via `ia-review`; keep its
   structural verdict distinct from the visual one.
5. **Design-system coherence & drift** — run the `ui-design-system` coherence audit (seven axes +
   the four whole-product dimensions) and drift check; record the validator result (or mark it
   UNVERIFIED if it could not run).
6. **Per-screen visual review** — `ui-design-review` on each sampled screen, its full checklist per
   screen; a scanner/validator green is never visual sign-off.
7. **Widths, themes & interaction states** — record the actual widths, light/dark, and states
   (default/hover/focus/pressed/selected/disabled/loading/error/empty) observed; anything not
   rendered is `[Not assessable]`, never assumed to pass.
8. **Cross-screen component comparison** — verify each shared component looks and behaves the same on
   every screen it appears. A component that differs across routes is a finding **even if each
   instance is internally fine**.
9. **Integrated repair backlog** — collate findings as repair prescriptions (per the review skills'
   `repair-prescriptions.md`), deduped and prioritized — coherence fixes are usually few and
   structural.
10. **Missing-evidence reporting** — one combined verdict that explicitly names every domain, width,
    and state **not** assessed.
11. **AI/agentic readiness** — *conditional; applies only when the product's core interaction is a
    model or an agent.* Run `ai-agentic-readiness.md`'s required coverage — the six model-failure
    families, interruption and partial effects, mid-run failure, quota/rate limits, concurrency and
    staleness, permission scope, provenance retention, reviewability at production scale, streaming
    a11y, and designed degradation. For any other product, record it as **not applicable** rather
    than silently omitting it.

## 2. Whole-app failure modes this catches

- **Individually polished, collectively incoherent** — screens that each pass alone but use
  inconsistent component families, separation models, or type systems → whole-app **FAIL** on
  coherence.
- **A shared component behaving differently across routes** — same "Save" button at two heights, a
  dialog that dismisses two ways → a finding surfaced by §8, not by any single-screen review.
- **Silent coverage gaps** — a required domain (IA, visual, system/tokens, a11y) or a width/state
  left unassessed → no unconditional pass.

## 3. Hard boundary — what the portable skill may and may not do

**The skill MAY:** inventory routes/screens, inspect the evidence available, sample representative
screens, compare shared components across that evidence, refuse sign-off, and describe missing
coverage.

**The skill MUST NOT pretend it ran harness-level automation.** The design harness owns: automated
route crawling, live multi-width capture, visual diffs, component sandboxes, reference-corpus
ingestion, licence automation, and large-scale benchmarks. When one of those would be needed, name
it as the next step and mark the corresponding coverage `[Not assessable]` — never assume the
automation ran or infer a whole-app pass from partial evidence.

## 4. Verdict rule

A whole-app **PASS** requires every required-coverage item (1–10, plus 11 where it applies)
assessed and no material cross-screen incoherence. **Missing evidence caps the verdict; it never
rounds up.** State the real coverage — screens sampled, widths, themes, states — so no reader
mistakes a partial review for a whole-app pass.


## 5. Output — the shape a whole-app review actually takes

**The score comes from `evaluate.md`, not from here.** That file owns the critique rubric — ten
heuristics 0–4, `n/a` and `unassessed` left out of the maximum, bands by percentage — and a
second scale in this file would drift from it. Run that rubric and report that total. What this
file adds is the coverage record, which is what stops a number from being read as a sign-off.

Report in this order:

```markdown
## Whole-app review — <product> (read-only)

**Verdict:** PASS / CONDITIONAL / FAIL   ·   **Critique:** <total>/<max> (<percent>%, <band>)
**Confidence:** high / medium / low — <the evidence class that sets the ceiling>

### Coverage
| # | Required domain | Assessed | Evidence |
|---|---|---|---|
(items 1–10, plus 11 when the product is AI/agentic — every row filled, `[Not assessable]` where it is)

### Cross-screen findings
(each one a finding only a whole-app pass can see, with source lens and severity preserved)

### Adjudicated flags
(CONFIRMED SLOP / JUSTIFIED / NEEDS INTENT, in the finding format from `adjudication.md`)

### Not assessed, and the next step for each
### If this were run for real: the dry-run plans
```

**Filled example — the head of a real report:**

```markdown
## Whole-app review — Northwind admin console (read-only)

**Verdict:** CONDITIONAL   ·   **Critique:** 27/36 (75%, solid — help and documentation n/a)
**Confidence:** medium — static code plus 6 of 41 routes rendered at two widths; no live data states.

### Coverage
| # | Required domain | Assessed | Evidence |
|---|---|---|---|
| 1 | Route & screen inventory | Yes | 41 routes from the router; 6 sampled |
| 3 | Shared component-family inventory | Yes | Button, Table, Dialog listed with their routes |
| 6 | Per-screen visual review | **[Not assessable]** | No keyboard or screen-reader pass — needs the harness |
| 7 | Widths, themes & interaction states | Partial | Empty states seen; error states never reached without live data |
| 8 | Cross-screen component comparison | Yes | The three families compared across the 6 routes |

### Cross-screen findings
**[Major · cross-screen] Two dismissal models for the same Dialog.** Billing dismisses on backdrop
click, Settings does not; same component, opposite contracts. Invisible to a per-screen pass —
each screen is internally consistent. Source lens: design-refine (whole-product).
```

**Two rules the example is showing.** Every coverage row is filled — a domain that was not assessed
says so rather than being left out, because an absent row reads as a pass. And the verdict cannot
be higher than the confidence: 75% with a required domain unassessed is CONDITIONAL, never PASS,
no matter how good the number looks.
