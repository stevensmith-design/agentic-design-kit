# Evaluate — critique and audit

Read-only. The scores here are the kit's own; nothing else defines them. The rules a finding cites
live in `ui-design-principles/references/rules.md` (open the section by its Contents range) — this
file says how to score and report, not what good design is.

## 1 · Two assessments, kept apart

A score formed after reading the detector is anchored by it: a judge who has seen forty machine
findings stops looking for the forty-first problem, which is the one no rule knows about. So:

- **Assessment A — design judgement.** A subagent that gets the target, the brief or direction
  source, the visitor mode per surface (Persuade, Operate, Read) and how to render it — and **not**
  the detector output or any other lens's report, even one that sits in the target's folder. It
  renders desktop and 375px, plus each state the surface can reach (long, many, empty, loading,
  error), walks the primary task, and returns scores and findings.
- **Assessment B — machine evidence.** Run separately:
  `node <ui-design-review-path>/scripts/detect/findings.mjs --json <target>` — the page or its
  folder; a page's local linked stylesheets are read with it. Under `/design-review`
  the merged report is handed in (if it was not, run it); it still stays out of assessment A.
- **Synthesis**, after both return, in the parent context. Four lists: **agreement** (both saw
  it), **detector-only** (judgement missed it), **judgement-only** (no rule covers it — a fixture
  candidate for the detector), **detector false positives** (each with the reason; also a fixture
  candidate, never silently dropped).

**When `/design-review` runs the two as separate steps** (judgement in one fresh context, synthesis
in another), each writes its own report in the shape below:

- The **judgement-only report** writes `Detector: static n/a · browser n/a (held out by design)`
  and a *Synthesis* section that says only that it follows in a separate context.
- The **synthesis report** keeps the judgement's scores exactly as written, since re-scoring after
  reading the detector is the anchoring this split prevents; a change the detector prompts goes
  under *Synthesis*. It restates the Detector line from the merged report, says which states and
  widths that report covered (it scans the default render only), verifies the detector hits
  against the source, and repeats the findings so the report stands alone, marking each one's
  source (judgement, detector, both).

If you cannot isolate the two (no subagents in this environment), run judgement first and write
its scores down, then the detector; a change the detector prompts goes under *Synthesis*, not into
the table. Put this line at the top of the report:

`DEGRADED — judgement and detector ran in one context; detector findings may have anchored the judgement.`

If `findings.mjs` printed an **UNVERIFIED** banner, copy it to the top of the report as well. A
pass that did not run is not a clean pass.

## 2 · Critique — ten heuristics

Score each heuristic 0–4: **0** absent or broken · **1** major problems · **2** works, with
friction · **3** good, small gaps · **4** nothing material to improve.

1. Visibility of system status
2. Match between the system and the real world
3. User control and freedom
4. Consistency and standards
5. Error prevention
6. Recognition rather than recall
7. Flexibility and efficiency of use
8. Aesthetic and minimalist design
9. Help users recognise, diagnose and recover from errors
10. Help and documentation

Two non-scores, each with a one-line reason in the Note column:

- **`n/a`** — the heuristic has nothing to act on here (error recovery on a page with no input).
- **`unassessed`** — it applies but you could not see it (no live data, no browser). This one also
  caps the confidence below high and goes under *Coverage and limits*.

Both leave the maximum: **total** = sum of the scored rows, **max** = 4 × scored rows, **percent**
= round(100 × total ÷ max). Band from the unrounded ratio: **≥ 90 strong · ≥ 70 solid · ≥ 50
uneven · ≥ 30 weak · below 30 failing**. With fewer than five scored heuristics the band is `not
banded` — too little applies for the number to mean anything. Most real interfaces land between
uneven and solid; a strong score on a first review deserves a second look.

Alongside the table: walk the primary task as two or three of — a first-time visitor, a frequent
expert, someone on a screen reader or keyboard, someone on a phone with half their attention, and
someone testing the edges (long names, bad input, double clicks). Name where each one stalls.
Cognitive load is scored through heuristics 6 and 8; its rules are `rules.md` → *Cognitive load
and interaction density*, and structure belongs to `/ia-review`.

Score whole surfaces. A verb scoped to one section or component carries its dry run and no scores.

Slop and sameness are not scored here — that is `/distinctiveness-review`'s lens. What is
adjudicated (`adjudication.md`) is every technique the detector flagged and every one the plan
would keep or remove, because a dry run has to say which. A pattern you only noticed and do not act
on goes to `/distinctiveness-review`, not into a verdict here.

## 3 · Audit — five dimensions

Same 0–4 scale, the same `n/a` and `unassessed` rules, max 20, the same bands — `not banded`
below three scored dimensions.

| Dimension | Asks |
| --- | --- |
| Accessibility | contrast, focus, semantics, targets, keyboard, motion preference |
| Performance | what was measured (LCP, INP, CLS, payload): score that and name what was not; nothing measured at all is `unassessed`, never estimated |
| Theming | tokens and `DESIGN.md` roles used, not literals; dark mode where the system has one |
| Responsive | 320px to wide; reflow, not shrink; nothing hidden that the task needs |
| Implementation integrity | the code does what the screen shows: real controls, wired states, no dead links or placeholder handlers, forms that submit, no faked success, a clean console |

**Severity:** **P0** blocks a task or loses data · **P1** major friction, or a WCAG AA failure
· **P2** minor · **P3** polish. Tiebreak: if someone would contact support about it, it is at
least P1. A broken rule of the approved contract is at least P2.

A detector green is not a sign-off; a screen not rendered was not looked at.

## 4 · Degraded runs

When a required input is missing — no render, no product context, no tokens — do not stop and
do not write a setup file. Lower the confidence, name the evidence class that was not reviewed
("rendered layout and interaction states UNREVIEWED: no browser; code-static only"), and give
the exact next step that would supply it. A domain inferred from static code is never recorded
as assessed.

## 5 · Report

```markdown
## design-refine · <critique | audit | evaluate | verb> · <target>

**Read-only. No project files were modified.**
Lock: <read-only (default) | read-only (locked by <caller>)>
DEGRADED — …              ← only when the two assessments shared a context
UNVERIFIED — …            ← copied from findings.mjs when a pass did not run
Isolation: <separate contexts | one context (DEGRADED)>
Detector: static <ran, N findings | unverified | n/a> · browser <…>
Confidence: <high | medium | low> — <the evidence that sets the ceiling>

### Critique — <total>/<max> (<percent>%, <band>)

| # | Heuristic | Score | Note |
| --- | --- | --- | --- |
| 1 | Visibility of system status | 3 | <what was seen> |

### Audit — <total>/<max> (<percent>%, <band>)

| Dimension | Score | Note |
| --- | --- | --- |
| Accessibility | 2 | <what was seen> |

### Synthesis
- Agreement: … · Detector-only: … · Judgement-only: … · Detector false positives: …

### Findings
- **[P1] <title>** — `file:line` · <what, and the rule or measurement behind it>

### Adjudicated flags
(the finding format in `adjudication.md`)

### Coverage and limits
(screens, widths, states, what was not assessed and the next step for each)

### Next verbs
(two or three, from the findings; none run)
```

A critique-only run omits the Audit section and the reverse; `evaluate` carries both. A verb run
puts its `### Dry run` section (`dry-run-format.md`) after *Findings*, inside this one report. A
locked run ends with the lock line from SKILL.md.
