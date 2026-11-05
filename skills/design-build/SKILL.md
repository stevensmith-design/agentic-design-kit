---
name: design-build
description: "Build a new page, screen, component or UI surface, or redesign an existing one: name the direction source, commit to a direction, encode it into the design system, build to a production bar, render and look at it, then delegate the review. Use whenever UI is created from scratch or substantially rebuilt, including product UI (app shells, dashboards, settings). It does not review its own work — it launches design-review in a fresh context and reports the state that comes back."
metadata:
  version: 0.3.0
---

# design-build

**This is a sequence, not a reference.** Its steps run in order every time UI is built; you do not need permission to run them. Load only what the step and the route need — never a whole
`references/` folder.

**It never reports a finished page.** Do not report done, finished, complete or ready — only
`/design-review` declares readiness. This skill does not review its own work: it **delegates** the
review to `/design-review` in a fresh context and reports the state that comes back. A review run
at the tail of the build's own context does not happen — observed four times; both times the
lenses really ran, the reviewer had a context that had not built the artifact.

Judged on three things, scored apart: **Creative ceiling** (made for this brief, or anyone's
page?), **Quality floor** (AI tells, alignment, spacing, responsiveness, accessibility) and
**Consistency** (one implementation per component, one scale, one set of text roles — the second
implementation of something that exists is the defect this project cares most about).

Use only design producers and orchestrators shipped with this kit. Do not load or invoke a global,
user-level or third-party design skill, including `frontend-design`, as a collaborator, fallback or
replacement. If one is already active, stop before concepts or implementation and report
**`INVALID — EXTERNAL DESIGN SKILL ACTIVE`**.

## Invocation handoffs

For this orchestrator and every supporting skill, follow `references/skill-invocation.md`.
Use native activation or verified folder-execution as selected; distinguish loading from running.
A broad request for direction and review routes to `/direction-study` before production work.
Before saving project artifacts, resolve the workspace with `references/workspace.md`.

## The sequence

### 1 · Read the direction you were given

In full: the brief, `BRAND.md` or a machine-readable brand, `DESIGN.md`, `tokens.json`, approved
references' contracts and the surfaces already built. Read `DESIGN.md` **as rules you must obey,
not as background**; note every prose rule before writing markup.
`references/direction/discovery.md` when needed: its pre-flight on an existing codebase, its one
question when the brief cannot answer who / what / how it should feel, its discovery when the person
wants help with the brief.

### 2 · Commit to a direction — before any system work

A brief plus a `DESIGN.md` is a constraint set, not a direction; going straight to markup yields a
page that breaks no rule and commits to nothing.

**Exploring, not building? Stop here.** Concepts, alternatives, routes or help choosing → invoke
`/direction-study`. It ends at `STUDY — DECISION REQUIRED`; the build resumes only from the
contract a person selects. Never pick one concept silently and build it.

**Name the direction source** before opening any catalogue or structure library — but supplied
visual references are part of discovering and understanding a reference-led direction, so open
them directly. Precedence, highest first; a lower source never reinterprets a
higher one: (1) human-approved direction — an accepted contract, or a starter the person selected;
(2) the approved design system and shipped surfaces; (3) the brief and its content, informed by
role-assigned references; (4) starter directions and kit examples — fallback scaffolding only.

| Route | When | Direction comes from |
|---|---|---|
| **approved-direction** | an accepted concept or study contract, or a starter the person chose | that direction |
| **system-led** | an approved `DESIGN.md`, brand system or shipped surfaces | the system — extend it |
| **reference-led** | the person supplies inspiration (the default whenever meaningful references arrive) | the original references establish taste; `/direction-study` studies them directly, proposes a content-connected direction, then freezes its contract |
| **reference-directed** | an **explicit** request to follow, adapt or recreate a supplied design | the designated source, within recorded limits |
| **brief-originated** | a rich brief, no visual references | develop original directions; starters only after explicit handoff or request |
| **starter-led** | a sparse brief, no references, no system, and direction handed to you | `/starter-directions` — offer, then commit to one |
| **named-starter match** | a starter is named against a supplied direction | the supplied direction, the starter bounded to what matched |
| **product-interface** | app shells, dashboards, settings, data-dense tools | the system and existing product surfaces |

Route detail, the match gate and the offer wording: `references/direction/routes.md`.

**Visual examples are direct inputs, not abstractions.** In a reference-led build, the context holds
the brief, real assets, frozen contract and the assigned original references. The designer may
reopen those originals throughout implementation; finding cards and contracts never replace them.
Keep rejected concepts, unrequested starters and unchosen structure libraries out. In other routes,
references stay out unless the accepted direction explicitly carries them.
**Never map a supplied direction to the nearest starter.** No orphan
motif: every major device traces to the brief, a finding, brand evidence, content or a need.

Then **state the direction out loud** — the composition, hierarchy, navigation, enrichment and
responsive intent that this brief and its references support. Use the direction's own vocabulary;
do not import repeated kit concept language or compare it with a stock direction. An existing
`DESIGN.md` does not remove this step — it constrains it.

### 3 · Encode the direction into the system

Now, and not before. A compatible machine-readable visual brand exists → `/brand-to-system`, then
its strict token validation. **Compatible** means its explicit colour/system strategy supports the
accepted direction; the deriver is not a neutral fallback and must not override a reference-led or
human-approved direction. No compatible machine-readable brand and no system → `/ui-design-system`
Create (a prose `BRAND.md` is an input, not a substitute). A system exists → `/ui-design-system`
Reconcile when the direction adds to it; otherwise consume it. Intent, then principles, then
tokens. Unsettled things stay provisional until a person accepts them; never invent brand facts.

### 4 · Build

**Invoke the skill — do not just read it.** A path in a table or an opened `SKILL.md` is not the
skill running. Invoke by name (`/direction-study`, `/starter-directions`, `/brand-to-system`,
`/ui-design-system`, `/ui-design-principles`, `/ia-review`; `/design-refine` only when a person asks
to refine what exists) and follow it; if you did not, say so.

Build in passes to the production bar in `references/build/passes.md`: evidence on hand, a first
visual implementation, responsive and state work, tokens by name, then post-build verification,
the stamp and the log entry
(`references/build/records.md`). Run `/ui-design-principles` throughout: its
`ui-design-principles/references/quick-rules.md` before any visual decision, the named `rules.md`
section at each decision point. **Where the
system licenses range, spend it** — a page that never uses a size its system declares has
under-delivered.

### 5 · Render it, and look at it

Render the real artifact and **view the image** — desktop and 375px at minimum, an intermediate
width when it is informative, and every state the surface can actually reach: long, many, empty,
loading and error as applicable. Not the source or scanner: this step is not satisfied by a
green scanner; detector output is evidence of defects, never proof of done. Cannot render? Say so and mark visual findings unassessed.

**Then check it against the direction you committed to** — the things you set: the brand's prose
rules line by line; the committed composition, parts and signature moves; the range the system
licensed; one implementation per component (count them); the floor — `scan.sh` and
`findings.mjs`. A variation record may diagnose accidental repetition after the build, but it does
not steer the initial aesthetic. Ask
of the page: is the idea clear, is the hierarchy earned, is it executed, is it specific to this
brief, and is it restrained? **After the final artifact edit**, rerun
the validator and the whole floor; copy their final status words and counts into the report. Exit 0
may still mean **PASS WITH WARNINGS**: name every WARN, SKIP and UNVERIFIED result rather than
rounding it to clean. Report what you measured and eyeballed. **This is not a review.**

### 6 · Delegate the review

**Your building is done here.** **Invoke `/design-review` in a subagent** — a fresh context —
naming the artifact, where it renders, the direction source, the direction you committed to, the
log and stamp, and on reference work where the original references are, so its lenses judge whether
the direction was fulfilled, not whether it matches a theme. Opening its `SKILL.md` to see what to
hand over is fine; judging the work is not. Do not summarise your own findings as its input. **Do
not review it yourself, and never in this context.**

Report: what you built, the direction source and direction; what you fixed from the render; **the
state the reviewer returned** (`REVIEWED`, `READY WITH PROPOSALS`, `READY`) as *its* verdict —
never upgrade it; decisions only a person can make, apart from anything mechanical. **If the
reviewer cannot be launched or cannot finish**, the state is `DRAFT — REVIEW REQUIRED`: say which
and name `/design-review` as the recovery command — *"This has not been independently reviewed."*

## On demand

Open these only when the route or the request needs them — never on the default path:

- **Page structure left open** by the direction (starter-led, brief-originated custom, a starter's
  composition, or the person asks to see structures): `references/structures/index.md`, then only
  the files you pick or the starter names.
- **An originated direction** (custom, no starter): `references/direction/custom-direction.md`.
- **Imagery or illustration** beyond type: `references/build/enrichment.md`.
- **One component** (a single element, a short brief, one file):
  `references/build/component-scope.md`.
- **Redesign** of an existing page or site: `references/build/redesign.md`.

## Guardrails

1. **The direction source was named and a direction committed to** before system work. On supplied
   directions no starter was opened or mapped to; no structure file loaded off the default path.
2. **The producer skills were invoked**, not merely read.
3. **The artifact was rendered and looked at** — desktop and 375px, with applicable states and an
   intermediate width when it reveals a material responsive decision.
4. **The stamp and the log entry match the page** (`check-records.mjs` clean).
5. **`/design-review` was invoked in a fresh context**, and the state reported is the one it
  returned — or `DRAFT — REVIEW REQUIRED`, why, and the recovery command.
6. **Report the final floor exactly.** WCAG 2.1 AA, no 320px overflow, declared scales only, no raw
   hex below `:root`; warnings and unverified checks remain visible.
7. **You did not review it yourself and call that the review.**
8. **No external design producer or orchestrator was loaded or invoked.**
## What this is not

Not a verification programme: no approval chain, evidence fingerprinting or check registry. The
failure mode replaced is a build that quietly skipped its review; the one to avoid creating is a
build that spends its budget proving it followed a process. If following this sequence would
produce a worse page, say so and why, then proceed deliberately.
