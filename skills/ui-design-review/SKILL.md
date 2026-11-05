---
name: ui-design-review
description: >
  Review completed UI screens, screenshots, rendered HTML, Figma output, frontend files, or
  UI-focused diffs for visual quality, consistency, accessibility, and unjustified AI-style
  patterns. Use for “review this screen”, “is this ready to ship?”, client handoff, or a
  per-screen/per-PR quality gate. Run visual review for pixels and code review for files; combine
  them when both exist. Use ui-design-system instead for creating/extracting a system or auditing
  whole-app coherence and drift. Use design-refine for a whole-app scored critique or a
  read-only preview of a refinement. Use ui-design-principles during implementation.
---

# UI Design Review

Read-only quality gate for completed UI. A request to review does not authorize edits, design-doc
updates, snapshots, candidate logs, or exception entries — this holds even when the user asks you,
mid-review, to "just add the exception" so a scanner stops flagging. Authoring an override or
exception in the same pass that reviews the pattern is a self-authored, same-change override: the
justification and the thing it authorizes get written together, which is exactly what the gate
exists to stop (see gate question 6 below). The favour the user is asking for is the trap. Instead,
surface the exception as a labeled proposal for a separate, human-authorized decision that pre-dates
any future use, and leave the write to that later step — then the review stays read-only and the
override, if made, is legible rather than self-granted.

## Required dependencies

- `ui-design-principles/references/rules.md` is the canonical rulebook. This skill's mirrored
  `references/rules.md` must remain byte-identical.
- `ui-design-system/scripts/validate-tokens.py` owns deterministic token-relationship checks.
- If a dependency is unavailable, continue with the evidence available and mark the affected
  checks **[Not assessable]**; do not invent a substitute rule.

**Path resolution (shared convention).** The `<ui-design-review-path>` / `<ui-design-system-path>`
placeholders below are **resolved once from the active skill catalog/project configuration** — do
not
hand-substitute a guessed root like `.claude/skills`. Resolve each sibling/self location, **print
the
resolved absolute path in your report as evidence** of which copy ran, and if a resource cannot be
resolved, **report the missing coverage cleanly** (mark the affected checks `[Not assessable]`)
rather
than fabricating a path or a result. `ui-design-principles` and `ui-design-system` use the same
convention.

## Review model

Always assess three layers:

1. **Existence** — are type, colour, spacing, radius, component, and state rules defined?
2. **Quality** — are those rules sound together: contrast, hierarchy, scale, semantic roles,
   interaction geometry, and aesthetic coherence?
3. **Application** — does the implementation use them consistently, without unexplained drift?

Check for `DESIGN.md`, equivalent design guidance, and `tokens.json`. A current approved contract
is strong evidence, but it cannot waive accessibility/correctness. A shipped one-off can be drift.

Every adverse finding states:

- **Evidence:** `[Verified]`, `[Inferred]`, or `[Not assessable]`
- **Basis:** the **basis class**, one of six — standard/correctness · project contract ·
  established principle · **platform convention** · heuristic/taste · UX/product hypothesis. This
  list is canonical in `references/repair-prescriptions.md` field 5; quote it, do not paraphrase it.
- **Scope checked:** local instance, shared component, and representative siblings
- **Repair prescription:** the smallest compatible change, specified implementation-ready per
  `references/repair-prescriptions.md`. The contract is **eight fields — Cause · Preserve · Change ·
  Scope · Why · How · Proof · Uncertainty** — and those are the names to use verbatim ("Proof", not
  "acceptance criteria"). Scale to severity per that file's tiers: the full eight for a P0/P1 or
  material failure, a compact cause · change · acceptance check for a minor bounded defect, one line
  for a warning. A material finding without a full prescription is incomplete.

Only a standards/correctness defect or broken current project contract automatically fails
Correctness. **Platform convention does not auto-fail** — a 44pt/48dp target or a platform-native
navigation pattern is a strong basis and usually a real finding, but it is adjudicable against the
project's own contract and register, so it carries its own severity rather than tripping Correctness
by default. It auto-fails only where the convention *is* the accessibility standard, in which case
the basis is standard/correctness and should be labelled that way. Heuristics are optional notes.
UX/product hypotheses are handed off, not presented as UI defects.

## Mode routing

- **Visual review:** screenshots, rendered app/HTML, Figma, “review this screen”, sign-off.
  **Read `references/visual-checklist.md` before reviewing.** This is mandatory even for a single
  screenshot; do not rely on memory or the scanner.
- **Code review:** PR, diff, component files, automated hook. **Read
  `references/code-review.md` and run `scripts/scan.sh`.**
- **Both available:** run both, reconcile evidence, and issue one verdict.
- **System-level:** create/extract/audit coherence/drift across the product → `ui-design-system`.
- **Structural findings:** when the issue is navigation, grouping, labels, information scent, or
  progressive disclosure, run `ia-review` alongside this skill. Keep its structural verdict
  distinct from the visual verdict so a visually polished screen cannot silently pass broken IA.

## Visual-review procedure

1. Render the runnable target and capture the actual states/screens. If it is runnable but cannot
   be rendered, open with a **DEGRADED** banner. Use faithful project fonts; otherwise mark type
   judgments `[Not assessable]`. A face the page itself never loads is not a reviewer's gap but the
   page's defect (`font-not-loaded`): judge the fallback that ships.
2. Read and execute every required audit in `references/visual-checklist.md`, beginning with the
   compact-control geometry audit. A token-validator PASS or scanner PASS is never visual sign-off.
3. When `tokens.json` exists, run:

   ```bash
   python3 <ui-design-system-path>/scripts/validate-tokens.py <project-dir>
   ```

   Fold FAILs into Layer 2. The validator checks the pairs the system *declares*; it cannot see
   the pairs the page *composes*, which is where real failures hide — see the rendered checks
   below.
4. **Run the rendered checks.** These measure what a stylesheet cannot express and a screenshot
   reliably hides. Both are dependency-free (they drive an installed Chrome over CDP):

   ```bash
   node <ui-design-review-path>/scripts/measure-padding.mjs  <file-or-url> --selector '.card'
   node <ui-design-review-path>/scripts/measure-contrast.mjs <file-or-url>
   ```

   - *padding* — for any container with a bottom-anchored child (pinned actions, a footer row, a
     meta line pushed down by `margin-block-start: auto`). At page zoom 2px and 30px of bottom
     padding look identical, and the CSS reads correct because it *is* correct.
   - *contrast* — composited ratios: ink on an accent card, translucent text over a gradient, a
     label over imagery. Composites to the first opaque layer and reports the worst gradient stop.

   For the detector's full static and rendered rule set, run
   `node <ui-design-review-path>/scripts/detect/findings.mjs --json <target>` — one merged report.

   Exit 1 is a finding. **Exit 2 means no browser was found — that is UNVERIFIED, not a pass.**
   Say so in the report rather than recording a clean result (see `references/visual-checklist.md`
   §2–3, `rules.md` → Optical alignment and Color contrast).
5. Inspect relevant states and representative siblings. Never fix one tab, pill, tile, or row in
   isolation without checking the equivalent components around it.
6. Use the report and verdict rules in `references/report-and-verdict.md`.

### Non-negotiable visual judgments

The five non-negotiables — hit-target-vs-visible-size, compact-action subordination, ordinary button
text at 4.5:1 (large-text exception only when size/weight proves it), minimum-sufficient state
signal, and accessibility-is-not-an-override — lead `references/visual-checklist.md` as **section 0
(read first)**. A green scanner/validator is never visual sign-off.

## Code-review procedure

Read `references/code-review.md`. Run the scanner on the requested scope, then perform its manual
consistency sweep because regex cannot judge dynamic styles, token drift, shared-state divergence,
visible geometry, or aesthetic coherence.

```bash
bash <ui-design-review-path>/scripts/scan.sh --staged
bash <ui-design-review-path>/scripts/scan.sh --diff main
bash <ui-design-review-path>/scripts/scan.sh <file-or-directory>
```

**Exit codes: 0 = pass · 1 = violations · 2 = could not scan.** A `2` means the target is not a git
repository, or the `--diff` branch does not resolve — the scanner refuses rather than reporting a
pass over files it never read. Treat it as missing coverage, not as a clean run: scan the path
directly instead, and if you cannot, mark the code-review layer `[Not assessable]`.

Project exceptions require an id in `scan-exceptions.conf` that resolves to a current DESIGN.md
override entry **whose decision pre-dates the use it authorizes**. An exception without that
governance is a violation — and so is one whose override entry was created in the same change as the
pattern it authorizes: a "purpose" the author writes for their own change is self-authored
justification, not legibility, so it does not clear the gate (gate question 6). When reviewing a
diff, treat a gradient/pattern whose only authorization is an override entry added in the *same*
diff as an unresolved finding, not a cleared one — the ship-the-flat-default form and hand the
exception to a human to ratify. Tier-2 overrides cannot waive Tier-1 accessibility/correctness.

## Verdict rules

Read `references/report-and-verdict.md` and rate Correctness, Consistency, Contextual fitness, and
Craft.

- **SHIP IT:** no material failures; optional notes only.
- **MINOR FIXES:** one or a few bounded, understood local defects with no systemic redesign needed.
  This may include an isolated correctness defect such as one known contrast pair when the fix and
  blast radius are clear.
- **MAJOR REVISION:** systemic or repeated correctness failure, two or more dimensions fail with
  defects that are not bounded and local, governing rules/tokens need rethinking, or the safe fix is
  unresolved.

Never issue MINOR merely because a report is long, and never issue MAJOR solely because the word
“accessibility” appears. Severity follows impact, spread, uncertainty, and required scope.

**Record actual coverage in the verdict.** State the real viewport widths rendered (e.g. desktop
1440px, mobile 390px — not "responsive checked") and the interaction states observed (default,
hover,
focus, active, disabled, error, loading, empty, selected). Any width or state not rendered is named
`[Not assessable]`, never assumed to pass.

**Worked finding + verdict line:**

> **[Consistency · Major] Selected tab invisible on the settings surface.** `[Verified]` at 1440px
> and 390px, default + selected states.
>
> A material finding takes the **full eight-field contract** — this is what that looks like:
>
> - **Cause** — the shared `Tabs` component's `selected` state, not the three screens that show it.
> - **Preserve** — the tab row's 40px height, the label type ramp, and the existing keyboard model.
> - **Change** — `bg-teal-50` → `--surface-selected` (one value step off canvas), plus
>   `font-weight: 500 → 600` on the selected label. Two signals, not one.
> - **Scope** — the shared component and all 3 instances (Settings, Billing, Team); siblings render
>   identically, so this is systemic, not local.
> - **Why** — basis class **standard/correctness**: state meaning. The active tab is `teal-50` on a
>   `teal-50` canvas, measured at **1.02:1**, with no second signal carrying the state.
> - **How** — token swap in the component's state map; no markup change.
> - **Proof** — selected-vs-unselected contrast ≥ 3:1 measured, and the selected tab identifiable in
>   grayscale; re-render all 3 instances at 1440px and 390px in default and selected.
> - **Uncertainty** — none. The token exists and its value is known, so this is an exact change
>   rather than a bounded one.
>
> **Verdict: MAJOR REVISION** — a state relied on by every settings screen fails to communicate.

Contrast the ceremony: a 2px alignment nudge gets one line, and a minor bounded defect gets
cause · change · acceptance check. Only P0/P1 and material failures get all eight. Inflating a small
finding into eight fields is its own failure mode — it buries the ones that matter.

## Applying changes

Do not modify source during a review. If the user separately asks to implement findings, use
`ui-design-principles`, inventory sibling contexts first, apply the smallest compatible change,
and re-render the target plus representative siblings.

### Re-checking after the fixes land

A review ends with a verdict, and a verdict is a claim about a state of the code that the fixes have
now changed. Re-rendering the target proves the pixels moved; it does not re-establish the verdict.
When the user says the findings are addressed:

1. **Re-run the mechanical gates on the changed scope** — `scan.sh` over the touched files and
   `validate-tokens.py --strict` if tokens moved. A fix applied by hand across several components is
   the most likely place for a new violation to enter, and it is the cheapest place to catch one.
2. **Re-render the target and the representative siblings**, at the same widths and states the
   original verdict recorded. Changing the coverage between passes makes the two verdicts
   incomparable.
3. **Re-issue the verdict, or state explicitly that it stands.** Record each original finding as
   resolved, partially resolved, or unchanged. A finding that vanishes from the second report reads
   as fixed — so a finding you did not re-check is named as not re-checked, not omitted.
4. **A fix that introduces a new finding is reported as both**, not netted off. "Resolved, and
   introduced X" is the honest shape; "resolved" alone hides the trade.

Per-finding `Proof` (`references/repair-prescriptions.md` field 7) covers whether one fix worked.
This step covers whether the *screen* is now shippable, which is a different question and the one
the verdict answers.


## The review ensemble — you are one of three lenses

This skill is the **per-screen gate**: rendered evidence, system consistency, implementation detail.
It is deliberately not the whole review. Two peers examine the same artifact through lenses this one
does not carry:

- **`design-refine`** (its read-only lane) — whole-product resilience, polish, production
  readiness, cross-screen coherence. Catches what a per-screen pass cannot see by construction.
- **`distinctiveness-review`** — slop and sameness: structural variety, recognisable AI patterns,
  creative character. Catches the template a technically-correct screen can still be.

**For anything more than a single-screen spot check, run all three.** Findings are expected to
differ; that is the point, and it is why the three exist as separate skills rather than one large
one. A screen this skill passes can still be incoherent with the rest of the product and still look
generated.

**The contract, when more than one runs.** Reviews run **independently** — a lens must not read
another's conclusions before forming its own. Every finding keeps its **source lens and original
severity**. Reconciliation groups duplicates and **never erases disagreement**; product impact is
normalised separately from reviewer severity. Conflicts are adjudicated on project evidence,
register and accessibility — **never by majority vote**. No reviewer edits files or writes its own
exception, and an implementation skill receives the reconciled findings only after a human approves
them.

Overlap at **review** time is the feature. Overlap at **build** time is a defect — three skills
generating against contradictory rules resolves nondeterministically. Converge when building,
diverge when reviewing.

---

## Closing step

Read `references/promote-findings.md` and classify lessons, but keep the review read-only. Propose
project decisions or generalizable candidates; persist them only with explicit authorization.
Never self-edit shared rules based on a single review.

## Tooling maintenance

Any scanner change requires a failing fixture before code and the complete suite:

```bash
bash <ui-design-review-path>/tests/run.sh
```

The qualitative cases in `tests/decision-regressions.md` must also remain satisfied. Keep
`references/rules.md` mirrored with the principles skill (`tests/check-mirror.sh` enforces it).
