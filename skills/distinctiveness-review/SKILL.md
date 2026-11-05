---
name: distinctiveness-review
description: >
  Review a built page or screen for AI slop and sameness: does it read as made for its brief, or as
  generated, as the default for its category, or as a repeat of the last build? Use when asked
  whether a page looks AI-made, generic or templated, for an anti-slop or distinctiveness review,
  for "is this ready?", and inside /design-review as one of three lenses beside ui-design-review
  and design-refine. Makes an independent visual judgement first, then uses detector findings as
  evidence and adjudicates what no script can see as CONFIRMED SLOP, JUSTIFIED or NEEDS INTENT.
  Read-only, and theme-free.
metadata:
  version: 0.2.0
---

# Distinctiveness review

A read-only lens with one question: **was this page made for its brief, or could it be anyone's?**
It judges slop and sameness. Correctness on the rendered screen is `/ui-design-review`'s;
whole-product resilience is `/design-refine`'s.

## Direction-study handoff

Also invoked by `/direction-study` for every rendered proof, independently of reference-similarity
review. Use native activation or local folder execution with verified sources (the protocol is
`../design-build/references/skill-invocation.md`). Receive the original brief, actual supplied
references, provisional direction contract and rendered proof. Do not receive builder preference or
another reviewer's conclusions. Prefer a fresh context; if unavailable, label the separate unprimed
pass as degraded isolation. If already primed, request an independent reviewer and leave the proof
unassessed meanwhile. Dated human study approval authorizes traits without a production system.

Judge specificity to the brief, visible transformation of references, category-default/training-prior
composition and recognizable AI-design assemblies. Report reference resonance, excessive similarity,
distinctiveness versus genericness, and mechanical quality separately. A novel internal idea can
still be under-influenced by the references; resonance never clears confirmed genericness.
The report includes an explicit genericness judgement: clear, confirmed or unassessed, with visual
evidence. Confirmed genericness or obvious AI-default construction blocks positive recommendation.
This lens is read-only: preserve original evidence; return findings without editing.
## 1 · Look before machine evidence

Look at the rendered page, desktop and 375px, before reading detector output. Write the first-pass
judgement against the brief, accepted direction and actual content. A gate that needs a view you do
not have is NOT ASSESSABLE, never CLEAR.

After that first-pass judgement, take the machine findings from `/design-review` if available or run
them (`<ui-design-review-path>` resolves as in that skill):

```bash
node <ui-design-review-path>/scripts/detect/findings.mjs --json <target>
bash <ui-design-review-path>/scripts/scan.sh <file-or-directory>...
```

- A rule owned by `detect`, `browser`, `scan` or `tokens` in `scripts/detect/registry.tsv` is
  **not re-judged** here. List its slop findings as evidence; they feed the sameness read. A
  pattern you can see whose rule stayed silent goes under evidence as `missed: <rule>`: a detector
  gap to fix with a fixture, not a verdict.
- If `findings.mjs` printed an **UNVERIFIED** banner, put it at the top of your report. A pass
  that did not run is not a clean pass.
- Detector output can confirm, challenge or add to the first-pass judgement. It does not define the
  page's intended aesthetic and does not replace visual inspection.

## 2 · Know what the page answers to

Name the direction source first: the brief, a supplied direction (references, a frozen contract),
an approved system, or none. A contract that only describes the page as built, or disowns it, is
evidence, not direction. Name each surface's visitor mode: Persuade, Operate or Read.

- A trait the direction evidences is JUSTIFIED. Over-applying it is a finding; the trait is not.
  A direction the build picked itself with nobody to approve it (starter-led) is not supplied: a
  trait only it explains is NEEDS INTENT.
- A generic default the direction does not trace to is still a finding.
- The lens **never maps a page to a theme**, a starter or any catalogue look, and never proposes
  one. A fix names the defect and the brief or contract line it breaks.

## 3 · Adjudicate every judgement gate

The gates and the verdict rules are in `references/gates.md`. Every gate gets a row, CLEAR and
NOT ASSESSABLE included: a gate with no row did not run. The AI-product gates apply only when the
product's core interaction is a model or an agent.

Use **CONFIRMED SLOP** only when the render and context support the finding. **JUSTIFIED** states the
trait's job. **NEEDS INTENT** asks the person one question and says what each answer makes the
verdict. Absence of a formal provenance field is not, by itself, proof of slop.

## 4 · The sameness read

One short paragraph. Could this page be swapped for its category's default page without anyone
noticing? Name the one thing that belongs only to this brief — or say there is none. That is the
finding that outranks every row. Do not propose a look.

## 5 · Report

Use the format at the end of `references/gates.md`, then check its shape:

```bash
node <distinctiveness-review-path>/scripts/check-report.mjs <report.md>
```

It catches skipped gates, verdicts that owe a reason or a question, and an unverified pass
reported as clean. It cannot tell whether a verdict is right.

## The review ensemble
One of three lenses, with deliberately overlapping triggers: `/ui-design-review` (per-screen
correctness on rendered evidence), `/design-refine` (the whole product, read-only) and this one. Run
independently, before reading the others' conclusions. Keep each finding's source and severity;
disagreements go to a person, and the three reports are never merged into one list.

## What this is not

Not a fix: read-only, no edits, no `DESIGN.md` exceptions written to clear a finding. Not a
direction source: it asks whether the page has a point of view, and never supplies one.
