---
name: design-review
description: "Review a built UI artifact and repair what the independent lenses find. Use after a build or when asked to critique a page or screen. Renders first, invokes distinctiveness-review, ui-design-review and design-refine as separate lenses, adds ia-review when material, verifies claims with detectors afterward, repairs once, and is the only route that may report readiness."
metadata:
  version: 0.2.0
---

# design-review

Run this in a context that did not build the artifact whenever possible. A fresh reviewer sees the
work more clearly and preserves the separation between making and judging.

The first-party replacements occupy the same integration points as the retired dependencies:

- `/distinctiveness-review` is the theme-free anti-slop and distinctiveness audit;
- `/design-refine`, locked read-only, is the critique, audit and whole-product review;
- `/ui-design-review` remains the rules and implementation lens;
- `/ia-review` remains conditional on navigation, grouping, labels or hierarchy being material.

For every lens and repair handoff, follow `../design-build/references/skill-invocation.md`:
activate natively or execute verified local workflows in folder mode, and report completed evidence.
Listing or reading a lens never counts as running it. If a required workflow cannot execute,
report `REVIEWED` with the missing lens; readiness remains forbidden.

## 1 · Render and look

Render the actual artifact before any lens: desktop and 375px at minimum, with an intermediate width
when it reveals a meaningful responsive decision. Render every state the surface can actually reach—
long, many, empty, loading and error where applicable—and reduced motion when the page moves.

Name anything that could not be rendered as **unassessed**. Source inspection is not visual review.

## 2 · Invoke the independent lenses

Run each lens separately and keep its report separate. Give each the artifact, renders, applicable
brief/system/direction and enough implementation context to do its job. Do not give a lens another
lens's conclusions before it writes its own.

1. **`/distinctiveness-review`** — the theme-free anti-slop audit. Judge coherence, specificity,
   genericness, composition and execution against the actual brief and accepted direction. On
   reference-informed work, give it the direction and original references so a deliberate trait is not
   mistaken for genericness. Do not ask it to enforce a house style or starter catalogue.
2. **`/ui-design-review`** — the UI rules, implementation and accessibility lens.
3. **`/design-refine`, locked read-only** — the read-only refinement review. Invoke its critique and
   audit capabilities without edit authority; it assesses polish, hierarchy, typography, layout,
   interaction, resilience and whole-product fit.
4. **`/ia-review`** — only when navigation, grouping, labels or hierarchy are material.
5. **Reference resonance and similarity** — for reference-led or reference-directed work, run
   `direction-study/references/similarity-review.md` after the independent lenses. Its reviewer sees
   the rendered result and the original references directly.

If a required lens cannot run, name it as not invoked. Reading a skill or running one of its scripts is
not invoking the lens.

## 3 · Keep disagreements

Do not merge conflicting judgements into one authoritative list. Record what each lens saw and hand
the subjective decision to the person. A disagreement is evidence, not a pipeline failure.

## 4 · Verify load-bearing claims

Now run objective checks. This placement is deliberate: detectors and provenance validate the design
after initial visual exploration and independent critique; they do not frame the aesthetic read.

```bash
node <ui-design-review-path>/scripts/detect/findings.mjs --json <target>
```

Use the static result even when a browser pass is unavailable, and preserve every `WARN`, `SKIP` and
`UNVERIFIED` label. When build records exist, run their integrity check. A variation/distance check is
optional evidence for suspected repetition, never an aesthetic gate.

Measure claims that affect the result—a contrast ratio, viewport overflow, control size, broken action
or stale token—before repeating them. When a tool and the render disagree, investigate the mismatch.

For reference-informed work, confirm decision provenance here: major decisions should have an honest
basis in the brief, content, function or named reference responsibility. Provenance explains the made
design; it does not select a style retroactively.

## 5 · Check product consistency

Read the applicable `BRAND.md`, `DESIGN.md`, tokens, components, patterns and shipped surfaces. Confirm
that the work reuses components, follows accepted brand/system decisions and remains coherent with the
product. Surface conflicts with accessibility or strong practice; do not silently rewrite a contract.

## 6 · Repair once through `/design-refine`

Invoke `/design-refine` again as a new, unlocked edit run whose approved scope is the confirmed material
findings. Preserve the accepted direction. One bounded pass; after it, rerender affected widths/states
and rerun the objective floor. The final reported checks must describe the final artifact.

If no edit was requested or this is a critique-only task, skip repair and say so.

## 7 · Report

Only this route declares one of these states:

| State | Meaning |
|---|---|
| **`REVIEWED`** | Review ran, but a required render/lens/check was unavailable, the final floor failed or remained unverified, or a material defect remains. |
| **`READY WITH PROPOSALS`** | Required renders, lenses and final floor completed; no unresolved mechanical, accessibility, system or consistency defect remains; only optional creative proposals or human decisions remain. |
| **`READY`** | The above passed and no material findings or proposals remain. |

Report:

- lenses invoked and any not invoked;
- confirmed defects fixed and how they were verified;
- disagreements and decisions only a person can make;
- accepted qualities deliberately protected;
- optional proposals;
- final detector/floor status, including warnings or unverified checks.

Readiness is forbidden when a required visual state was unassessed, a required lens did not run, the
final floor failed or was unverified, or a material defect remains.

## Guardrails

1. The artifact was rendered and looked at before critique.
2. Independent lenses wrote their judgements before detector evidence was synthesized with them.
3. The first-party audit and refinement lenses ran at their established review points.
4. Original references remained available to the reference-similarity reviewer.
5. Disagreements survived; load-bearing claims were measured.
6. Repair was bounded to one pass and the final floor ran after the last edit.
7. Approved creative direction was protected; verification did not redesign it.

## What this is not

Not a second direction study, not a house-style gate and not a compliance process that determines what
the initial design should look like. It critiques and verifies a design that already exists.
