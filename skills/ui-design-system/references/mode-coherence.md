# Mode 3 — Coherence audit (the "assembled, not designed" test)

For when every element passes its rule and the whole still feels generic or incoherent. Run the
validator first (it catches the measurable incoherence), then apply judgment across **eleven axes**
— seven of form, four of behaviour and integration — and the five-question test. All eleven are
assessed and all eleven are reported; the split below is a grouping, not a scope boundary.

## Axes 1–7 — form

Assess each across the whole product, not one screen. For every adverse finding, name its basis
(standard/correctness, project contract, established principle, platform convention, heuristic/taste, or UX/product
hypothesis). Heuristics do not become system rules without cross-screen evidence and approval:

1. **Aesthetic** — do the choices express one named direction, or several borrowed at once?
2. **Geometric** — one radius language (all soft, or all crisp), concentric nesting, consistent corner logic.
3. **Typographic** — one type system; heading tiers actually distinct (validator: scale ratios); weight used consistently for the same job.
4. **Colour** — one palette with a 60/30/10 budget; semantic roles distinct (validator); selection ≠ action (validator).
5. **Surface & elevation** — one separation model applied everywhere (validator: value step, ramp monotonicity); shadow means the same thing on every screen.
6. **Component-family** — one card primitive, one button system, one idiom per control — repeated, not reinvented per screen.
7. **Cross-screen** — the same element looks and behaves the same on every screen it appears.

## Axes 8–11 — behaviour and integration

Axes 1–7 cover form; these four cover *behaviour and integration*, assessed across the whole product
the same way and reported in the same table. They are the ones most often quietly skipped, which is
why they are numbered rather than kept as an appendix. Each adverse finding becomes a repair-prescription backlog item.

8. **Interaction & state** — the same control resolves the same way in hover / focus / pressed /
   selected / disabled / loading / error / empty on every screen; one idiom per control type.
9. **Responsive & density** — breakpoint behavior, touch targets, and information density follow one
   model; the narrow layout is not a squeezed desktop, the wide layout is not a phone with margins.
10. **Accessibility & focus** — focus order, visible focus, keyboard operation, and accessible names
    are consistent; no screen silently drops them.
11. **Overlay & layering** — z-index, portals, scroll containment, and dismissal behave the same for
    dialogs, sheets, menus, and tooltips across the product.

## The five-question coherence test (the judgment layer)

The axes find *what* drifts; these five questions decide whether the system is actually coherent.
This is the layer on top of the computed checks — a system can pass the validator and still fail
here, because these are about meaning, not math.

1. **Intent** — Can you name the design's single intent in one sentence, from the artifact alone? If
   you need three, it has three.

   **Scope this per register before you fail it.** A product may legitimately span several of the
   four registers — **Persuade · Operate · Read · Experience**
   (`ui-design-principles/references/rules.md` → *Design intent — the four registers*). A persuasive
   landing page, an efficient dashboard and a readable docs surface in one product are **three
   registers, not three intents**, and reading that as incoherence is this question's most likely
   false positive. Ask it **per register**: within the Operate surfaces, is there one intent? Then
   ask the cross-register question separately, which is narrower — **do the tokens hold?** The
   palette, type scale, spacing scale and component family must be shared across every surface;
   density, motion budget, type sizing, action prominence and decorative allowance are register
   decisions and are expected to differ. A whole-app FAIL on intent needs either one register whose
   own surfaces disagree, or a token system that changes between them.
2. **Relationship** — Does every value relate to the others through a rule (a scale, a ramp, a
   ratio), or are values eye-tuned in isolation?
3. **Consistency** — Does the same decision resolve the same way every time it recurs?
4. **Variation** — Where things differ, do they differ *for a reason* (hierarchy, state, role) — or
   arbitrarily?
5. **Contradiction** — Is anything actively fighting the stated intent (a heavy shadow in a "calm,
   flat" system; a playful radius in a "dense, utilitarian" one)?

A coherent system answers 1 clearly, 2–4 "yes, by rule," and 5 "nothing." Each "no" is the audit's
finding — reported as the relationship that's missing, not the pattern that's present.

## Output

The **eleven-axis table** (pass/drift for every axis 1–11 — an axis not assessed is recorded as such, never omitted), the validator summary, the five-question verdict, and a
prioritized coherence backlog. Each backlog item is a repair prescription, not a symptom: name the
owner (the shared token, component, or separation model), the exact-or-bounded change, the scope of
screens affected, and an acceptance check — the same implementation-ready bar the review skills apply (see their `repair-prescriptions.md`). Coherence fixes are usually few and structural — one resolved
separation model fixes twenty screens.

### Worked example — the axis table (filled; abridged to four rows, a real report carries all eleven)

| Axis | Verdict | Evidence |
|------|---------|----------|
| Aesthetic | **Drift** | Dashboard reads "calm flat," billing screen adds glass panels + gradients — two directions |
| Geometric | Pass | One 8px radius language, concentric nesting throughout |
| Typographic | **Drift** | H2/H3 ratio is 1.08× on three screens (validator WARN) — tiers not distinct |
| Colour | Pass | 60/30/10 held; semantic roles distinct; selection ≠ action (validator PASS) |
| Surface & elevation | **Drift** | Cards use value-step on 4 screens but tinted shadow on billing — two separation models |
| Component-family | Pass | One card primitive, one button system across the product |
| Cross-screen | **Drift** | The "Save" button is 40px tall in settings, 32px in the profile editor |

**Five-question verdict:** Intent = *needs three sentences* (fail); Relationship = mostly by-rule;
Consistency = fails on Save height + separation model; Variation = billing differs arbitrarily;
Contradiction = glass panels fight the "calm flat" intent. **One structural fix — commit a single
separation model (value-step) and retire the tinted-shadow variant — resolves three of the four
drifts.**
