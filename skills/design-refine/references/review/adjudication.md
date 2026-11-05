# AI-tell adjudication

Read-only. One adjudication vocabulary across the ensemble: `distinctiveness-review` uses the same
three verdicts for its judgement gates. This file decides a verdict on a technique that a detector
or a verb flagged; it never writes the exception that would clear it.

## Two required gates

For every detector hit that flags a **technique** (a choice someone could defend), assess both. A
hit that flags a plain **defect** — a face that never loads, a dead link, an unlabelled control — is
not adjudicated: it goes in the findings as a defect with its severity.

1. **Principle gate:** does the technique serve a named purpose—hierarchy, affordance, brand,
   platform convention, content, or another established principle—without avoidable harm?
2. **System gate:** is it compatible with the current project language, systematic across relevant
   instances, and legible in the design contract when it is a deliberate exception?

**Why the presumption is CONFIRMED SLOP (not neutral).** The failure mode this guards against is a
decorative gesture excused as "systematic" — the phase-bar / card accent-border case where
consistency was read as purpose and the tell shipped. Because that mistake is silent and common, a
detector hit is treated as a defect *unless the design actively clears both gates with documented,
affirmative evidence*. The burden is on the design to justify keeping the pattern — not on the
reviewer to prove it fails. Silence, ambiguity, or "no reason found" resolves to **defect**, never
to
neutral or benefit-of-the-doubt. Passing a gate requires
the design to **name the specific job the element does that plain structure, weight, or surface
would not do better** — and to have logged it. "Present and tidy" is not passing.

Outcomes:

- both gates cleared with affirmative, documented evidence → **JUSTIFIED**;
- otherwise (including silence / no reason found / decorative-but-consistent) → **CONFIRMED SLOP**;
- genuine incomplete/contradictory evidence or decision-owner input needed → **NEEDS INTENT** (see
  the context split below — it never resolves to "keep by default").

**What does NOT count as justification.** Clearing the gates may not rest on any of these — each is
a non-reason, and a verdict that leans on one is still CONFIRMED SLOP:

- **Consistency / "it's systematic."** A repeated decorative gesture is *systematic decoration*;
  consistency is not purpose. (This is the specific blind spot that let decorative phase-bar / card
  accent borders through — consistency was read as purpose.)
- **"Looks considered" / general polish / "makes it feel designed."**
- **Positional-only meaning** — e.g. a coloured bar on "Phase 1" that encodes only *leftmost*, not
  *safe* / a real status. Encoding position the layout already carries is not encoding meaning.
- **Aesthetic preference alone** (Heuristic/taste class) — optional only; never converts a defect
  to JUSTIFIED on its own.

A valid justification points to a **real encoded meaning, affordance, brand rule, or platform
convention**, logged in `DESIGN.md`.

An override records intent; it does not prove quality and cannot waive an applicable accessibility
or correctness requirement. It records intent only when it **pre-dates** the use — an override
entry written in the same change that introduces the pattern is self-justification, not legibility,
and is itself a finding.

**`NEEDS INTENT` resolves in opposite directions by context:**

- **Authoring** (the pattern is about to be written): resolve to **ship the default/flat form and
  surface the gated pattern as a labeled proposal** with its six-gate justification. Absence of a
  prior decision means the decision is "no" — the author does not self-authorize by writing both
  the pattern and its override in one pass.

  > **Two distinct gate models — do not conflate.** The **two required gates** above (Principle,
  > System) are *this skill's review-adjudication* gates: they decide a verdict on a pattern that
  > already exists. The **six-gate justification** named here is a *separate authoring gate* owned
> by
  > `ui-design-principles` — its six questions are **Purpose · Direction-fit · Systematic ·
  > Still-communicates-without-it · No a11y/hierarchy cost · Legible** (see `ui-design-principles`
  > SKILL.md, "Tier-2 Design decision gates" / rules.md gate question 6). Adjudication uses two
  > gates; authoring a Tier-2 pattern must clear all six. They are complementary, not the same count
  > stated twice.
- **Review** (the pattern already exists in the target): resolve by **surfacing it to the human** —
  never auto-pass, never auto-fail. Report the missing/insufficient intent as the finding and ask.

## Evidence classes

- **Standard/correctness:** applicable accessibility/platform rule or demonstrated defect.
- **Project contract:** current approved design rule, token, component, or override.
- **Established principle:** named principle with visible evidence and trade-off.
- **Platform convention:** the host platform's documented behaviour (a system sheet, a native
  control, a minimum target size).
- **Heuristic/taste:** plausible craft preference without stronger support; optional only.
- **UX/product hypothesis:** question needing product/research input; hand off.

Only standards and broken current project contracts automatically fail Correctness.

## Finding format

```markdown
### [CONFIRMED SLOP | JUSTIFIED | NEEDS INTENT] Technique at file:line
- **Flagged as:** the detector rule that fired, or `plan (<verb>)` for a technique the plan would
  keep or remove
- **Case for the concern:** why it is risky here
- **Case for the use:** named purpose/principle, or none found
- **Project contract:** supports, contradicts, or is silent
- **Evidence and scope:** class, observed instances, representative siblings
- **Verdict:** which gates passed/failed
- **Action:** remove/replace, keep, or ask
```

Apply this to both evaluation reports and action-command dry runs.

**Compact example:** A decorative radial glow on a standard login surface with no hierarchy role
and a project rule against ambient glow is **CONFIRMED SLOP**. Backdrop blur on native sheet chrome,
when the project explicitly reserves blur for overlay chrome and contrast remains sound, is
**JUSTIFIED**. The distinction is purpose and system fit—not the mere presence of blur or glow.

### Worked example — NEEDS INTENT, the verdict most often mis-assigned

NEEDS INTENT is the hardest of the three because it looks like both neighbours. The line that
separates them: **CONFIRMED SLOP is silence — no reason exists in the code or the contract.
NEEDS INTENT is a reason that exists but cannot be established** — its owner, its date, or its scope
is unresolved, and asking is cheaper than guessing wrong in either direction.

```markdown
### [NEEDS INTENT] Same-hue vertical gradient on the primary CTA at Checkout.tsx:118
- **Flagged as:** scan.sh "No gradient on interactive elements"
- **Case for the concern:** the flat `--color-primary` is used for every other primary in the app;
  this instance is the only gradient, so it reads as drift rather than system.
- **Case for the use:** DESIGN.md carries an override entry — "same-hue ≤5% vertical gradient on
  primaries, as a light-source cue" — with a stated purpose that clears five of the six gates.
- **Project contract:** supports it, *conditionally*. The entry is undated and unattributed, and
  `git log` shows it added in the same commit as this component.
- **Evidence and scope:** [Verified] one instance; 14 sibling primaries all flat. Basis class:
  project contract — but the contract's own standing is what is in question.
- **Verdict:** gates 1–5 pass on the written justification. Gate 6 (legibility) cannot be assessed:
  a purpose the author wrote for their own change in the same change is self-authored justification,
  and this review cannot tell whether a human ratified it or the author wrote both halves.
- **Action:** ask. "Was the primary-gradient override ratified before Checkout shipped, or written
  alongside it?" A yes makes this JUSTIFIED and the 14 flat siblings become the finding instead.
  A no makes it CONFIRMED SLOP and the flat default is the fix.
```

Note what the example does **not** do: it does not resolve the ambiguity by picking the cautious
option. NEEDS INTENT that quietly becomes "keep it" is JUSTIFIED without evidence; NEEDS INTENT
that quietly becomes "remove it" is CONFIRMED SLOP without evidence. It resolves by asking a
question specific enough to be answered in one sentence — and it names what each answer implies, so
the answer settles the finding instead of starting a second round.
