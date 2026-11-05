# <PROJECT NAME> — project context

<!-- agentic-design-kit default CLAUDE.md. This file belongs at the consumer project root. The
     distribution installs its eleven skills at .claude/skills/. Keep that layout, adapt
     <ANGLE BRACKETS>, then delete this comment.

     Do not replace the @-references with prose. A skill named with @ loads
     every session; a skill merely described in the table below relies on
     discovery and frequently never fires, even when its own description
     matches the task word for word. The table is documentation. The
     @-references are the wiring. See README.md → "Why this file exists". -->

## Execution mode

When explicitly asked to use only this folder, use **folder-execution** from its verified local
skill files. Otherwise use verified native project activation when available, or execute local
workflows directly if registration is unavailable. The native Skill-call instructions below apply
to native mode; folder execution follows `.claude/skills/design-build/references/skill-invocation.md`
and must be reported as executed, not natively invoked. Explicit native acceptance never silently
switches mode. No account installation is needed for folder execution.

## UI Design

**This kit is the complete design-production environment.** Do not load or invoke a global,
user-level or third-party design producer or design orchestrator alongside it, including a skill
named `frontend-design`. Browser, rendering and ordinary coding tools are not design producers. If
an external design skill is already loaded or invoked, stop before concepts or implementation and
report **`INVALID — EXTERNAL DESIGN SKILL ACTIVE`**. Do not silently fall back to it.

**Building a new page, screen or surface? Follow
@.claude/skills/design-build/SKILL.md.** It is the build sequence — direction, system, build,
render, delegated review — and it runs in full every time, including the post-build review. Do not
wait to be asked for the review.

**Exploring before choosing?** A broad request to use this kit for direction and review is enough.
For concepts, directions, alternatives or help choosing, invoke `/direction-study` through Claude
Code's **Skill tool** (`skill: "direction-study"`); do not begin the production build route. It owns
proof-time guardrails and post-render independent reviews, then stops at `STUDY — DECISION REQUIRED`.
The build starts only from the direction a person selects.

**Invocation and identity.** `/name` below means a Skill tool call with `skill: "name"`, plus `args`
when needed; it is not a shell command or merely reading a file. Before invoking, verify the resolved
skill is this project's `.claude/skills/<name>/SKILL.md`; personal or enterprise skills can shadow
project names. If resolution is external or cannot be verified, stop that phase and report the gap.
Available = discoverable; loaded = read/imported; selected = chosen for this phase; invoked = Skill
call succeeded from the packaged origin; completed = its work and required evidence finished.
Reading `SKILL.md` or an `@` import alone never counts as invocation or completion. Apply this to
all orchestrator handoffs; see `.claude/skills/design-build/references/skill-invocation.md`.

**Where direction comes from.** `design-build` step 2 names the source before system work: an
approved direction; an approved system or shipped surfaces (system-led); supplied inspiration
(reference-led); an explicit request to follow a design closely (reference-directed); a rich brief
with no visual direction (brief-originated); a sparse brief handed over (starter-led); or product UI
— app shells, settings, dashboards (product-interface). In reference-led work, the designer opens
the original images directly and keeps them available through study, direction generation and
proof-building. Notes may record observations but never replace, anonymise or hide the originals.
Starter directions are not preloaded: `/starter-directions` opens only when there is no direction at
all or a person names one, and never as a nearest match for a direction someone supplied.

**Then, guardrail.** Apply @.claude/skills/ui-design-principles/SKILL.md while you build. Read
`references/quick-rules.md` before any visual decision, and open the named `rules.md` section at
each decision point.

**Why so little is preloaded.** Every always-on line is read on every task. Across five builds,
more always-on guidance correlated with flatter output, and a preloaded theme catalogue pulled
supplied directions toward the nearest theme. The two `@`-references here are the build sequence and
its guardrail; everything else is invoked by name when its phase arrives.

**Standalone web study deliverable:** with a connected folder and no existing app, save one local
HTML/CSS proof per direction, a linking index and desktop/mobile rendered screenshots under that
folder. No Claude Design, hosted Artifact or publication unless requested. Existing-codebase,
native-app and requested Figma work retain their relevant output format. This project layout is for
Claude Code; Cowork uses the installed kit plugin and its folder instructions. Selecting this folder
alone is not a Cowork installation.

## The design system

These production instructions apply after direction selection. A direction study uses
`ui-design-principles` **study-proof** mode: no production system bootstrap, token promotion or
mandatory shared page structure during exploration.

- `DESIGN.md` — the rules. Read in full before writing markup.
- `tokens.json` — the values. Every colour, space, size, radius, shadow, duration and breakpoint you
  may use.

Implement tokens as CSS custom properties on `:root`, named to match their paths in `tokens.json`
(`--color-primary`, `--space-5`, `--radius-lg`). Then use `var()`. A raw hex, a raw px margin or a
hand-written shadow below `:root` is a defect, not a shortcut.

If a value you need is not declared, that is a signal to reuse one, not to invent one. **If you
believe a token or a rule is wrong, say so and stop — do not change it.** Record the conflict; the
human decides.

**This applies to review passes too.** A review that edits `DESIGN.md` or `tokens.json` while
reporting on a build silently changes the contract every later build is measured against. Checksum
both files before and after any review, and treat a change as a finding, not a fix.

**No `DESIGN.md` yet?** A valid machine-readable visual brand routes to `brand-to-system` first.
Otherwise prefer building one page, then lock the system from what you actually built
(`/ui-design-system` Extract). README.md → *"Starting without a design system"* has the other paths
and says when each applies. Delete this paragraph once
`DESIGN.md` exists.

## Skills in this repo

| Skill | Phase | Use it for |
|---|---|---|
| `design-build` | **orchestration** | direction → system → build → render → delegated review |
| `design-review` | **orchestration** | independent lenses, bounded repair, readiness state |
| `brand-to-system` | **foundation** | machine-readable visual brand → validated design system |
| `direction-study` | **exploration** | concepts before a choice; reference study; ends at `STUDY — DECISION REQUIRED` |
| `distinctiveness-review` | **review** | slop and sameness lens on every build; reads the detector's findings as evidence |
| `starter-directions` | **optional direction** | ready-made directions, only with no direction at all or when one is named |
| `ui-design-principles` | **build** | the guardrail while you write |
| `ui-design-system` | **review** | the system above the screen. Validator: `scripts/validate-tokens.py` |
| `ui-design-review` | **review** | a finished screen or PR. Code scan: `scripts/scan.sh` |
| `ia-review` | **review** | structure, labelling, hierarchy, progressive disclosure |
| `design-refine` | **review + refine** | read-only by default: critique, audit, dry-run plans; edits only on your go-ahead |

Reviewing a finished screen? Invoke `/ui-design-review`, `/design-refine` (read-only) and
`/distinctiveness-review` independently and **do not reconcile them into one list** — they are three deliberately different
lenses and their disagreements are the signal. Review skills are not a substitute for the build
phase: a page that passes every check can still be flat, because the checks measure defects, not
presence.

**For a new build you do not choose these — `design-build` step 6 runs them.** The table above is
documentation; a skill listed in a table and not otherwise invoked frequently never fires. That is
measured, not assumed.

## Before you call it done

```bash
python3 .claude/skills/ui-design-system/scripts/validate-tokens.py \
  --tokens tokens.json --design DESIGN.md --strict
bash .claude/skills/ui-design-review/scripts/scan.sh <file-or-dir>
```

Scope the validator with `--tokens`/`--design` — pointed at a project directory it walks
`.claude/skills/**` and reports the kit's own test fixtures as orphan tokens.

**A green scanner is not visual sign-off.** Render the screen and look at the image — at desktop
width and at 375px. Composition defects (a hole in a hero, a stranded column, labels sitting low in
their boxes) are invisible to every check here and obvious in a screenshot.

## Accessibility floor

WCAG 2.1 AA. One `<h1>`, no skipped heading levels, landmarks present, 44×44px minimum targets,
visible focus on everything focusable, no horizontal scrolling at 320px, `prefers-reduced-motion`
respected.

`DESIGN.md` lists the sanctioned text/ground pairings and their measured ratios. Anything not on
that list has not been checked.

## Component discipline

One implementation per component, varied by content and state — not rewritten per section. A second
implementation of something that already exists is the defect this project cares most about.

Nothing mechanical enforces this — no scanner counts your button variants. `design-build` step 6
makes it an explicit pass, because on a project past a few screens this is the defect that decides
whether the design system held or quietly stopped meaning anything.

## Project location

Use an explicit destination or existing application. When this folder is the kit distribution
itself and a new page/app is requested, follow the workspace guidance in
`.claude/skills/design-build/references/workspace.md` before writing project files.
