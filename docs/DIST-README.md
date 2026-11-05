# Design skills kit

Eleven skills for exploring, designing and reviewing interfaces with an AI coding assistant. They
encode a design system's rules, check what can be checked mechanically, and — this is the part that
does the work — review a finished screen through three deliberately different lenses, each in its
own fresh context.

Everything here is bash, Python 3 and Node. No install step, no dependency to add. The rendered
checks use a Chromium-based browser when one exists and say UNVERIFIED when none does.

---

## Kit or harness?

Both packages provide exploration, building, review, refinement, UI/IA guidance, visual brand
guidelines and design-system creation/application. Choose by the project setup you want:

| Choose | Suitable scenarios |
|---|---|
| **Agentic Design Kit** (this package) | A landing page, blog design, audit, refinement or system task; adding design capabilities to your own agent/development setup |
| **Agentic Design Harness** (companion repository) | An ongoing product that benefits from a reusable project template, persistent design context, decisions, patterns and consistency across sessions |

The harness includes a pinned copy of the complete kit; you do not need to install both.
The kit is the canonical source for workflow changes. The harness adds project integration and
memory rather than a different design methodology. It creates independent new-project copies and
can integrate additively with existing development harnesses without overwriting their files.

## Background reading

Steven Smith’s field report explains the design approach behind the kit: context, visual
references, exploration, reusable guidelines and review. Some examples use earlier kit versions.

- [English: Designed, not generated](https://stevensmith.dev/writing/designed-not-generated)
- [日本語: 生成ではなく、デザインを。](https://stevensmith.dev/ja/writing/designed-not-generated)

## The skills

| Skill | When it runs | What it owns |
|---|---|---|
| **`direction-study`** | Before a direction is chosen | Concepts from references or a premise: original references remain directly available through study and proof-building, followed by provisional contracts, narrow proofs and comparison — stops at `STUDY — DECISION REQUIRED`. |
| **`design-build`** | A new or substantially rebuilt surface | The build sequence: name the direction source (eight routes, including product UI) → commit → encode into the system → build → render at desktop, 768 and 375 → delegate review. Owns the on-demand structure library, the build log and stamp, and the distance test between builds. |
| **`starter-directions`** | Only with no direction at all, or when one is named | An opt-in catalogue of 13 starter directions; offers two or three and waits, compares, or runs a five-dimension match gate on a named one. |
| **`design-review`** | After a build | Renders, runs the detector, launches each lens in its own fresh context, keeps disagreements, makes one repair pass, and is the only route that can report READY. |
| **`brand-to-system`** | A machine-readable visual brand exists, but no system does | Derives and strictly validates `tokens.json` plus a four-layer `DESIGN.md`. |
| **`ui-design-principles`** | Before and during a build | The rules. `references/quick-rules.md` names the section; `references/rules.md` is canonical — colour, type, spacing, states, forms, a11y, motion, platform — read by range, never whole. Start here. |
| **`ui-design-system`** | Establishing or auditing the system | `DESIGN.md` + `tokens.json` — create, extract, reconcile, audit; owns `validate-tokens.py`, which checks the relationships *between* tokens that no per-component rule can see. |
| **`ui-design-review`** | One finished screen or PR | The per-screen lens: rule catalogue, `scan.sh` code scan, and the zero-dependency detector (static and browser passes, one merged report). |
| **`distinctiveness-review`** | Every review | The slop and sameness lens: does the page read as made for its brief, or as generated, as the category default, or as a repeat of the last build? |
| **`design-refine`** | Critique, audit, refinement | Scored critique and audit, and the refinement verbs (polish, bolder, quieter, distill, harden, adapt …). Read-only by default; edits only on your go-ahead. |
| **`ia-review`** | Structure, before or after | Navigation, grouping, labels, disclosure. Mode 3 designs a structure; Modes 1–2 audit one. |

### The part that matters most

`ui-design-review`, `design-refine` and `distinctiveness-review` **overlap on purpose.** Three
lenses on the same screen produce materially better findings than one:

- `ui-design-review` — rendered evidence, system consistency, implementation detail
- `design-refine` (locked read-only) — whole-product resilience, polish, production readiness
- `distinctiveness-review` — distinctiveness, structural variety, recognisable AI patterns

**Run all three, independently, and do not reconcile them into one list.** Each finding keeps its
source lens and its original severity; grouping duplicates is fine, erasing disagreement is not.
Two lenses disagreeing is signal you can adjudicate — on project evidence, register and
accessibility, never by majority vote. A single "best" reviewer destroys the property the three
exist for.

`/design-review` does this for you: it launches each lens as its own fresh-context run, so no lens
reads another's conclusions. When it cannot isolate them (for example, when it is itself running
nested inside another agent) every lens report is marked **DEGRADED**, and a DEGRADED review never
reports READY.

**A review must not edit the contract it is reviewing against.** If a review pass changes `DESIGN.md`
or `tokens.json`, every later build is silently measured against a different standard, and the drift
looks like improvement. Checksum both files before and after any review and treat a change as a
finding, not a fix. The shipped `CLAUDE.md` carries this rule.

This instruction also lives inside the skills themselves — each of the three carries a
**"The review ensemble"** section naming its two peers and the contract above — so an assistant that
loads one of them learns about the other two without anyone having read this file.

The overlap is a feature at **review** time and a defect at **build** time. Three skills generating
with contradictory rules resolves nondeterministically; converge when building, diverge when
reviewing.

---

## Install

The distribution directory is a package source. Do not start an acceptance session inside it—its
ancestor repository can contribute instructions and global context. Create a clean consumer
fixture at a new destination outside the Design Skills Kit repository:

```bash
bash scripts/prepare-acceptance-fixture.sh \
  /absolute/new/acceptance-project
```

The preparer copies only consumer contents, checks ancestors and Git isolation, verifies package
wiring and writes a receipt. The resulting fixture keeps this layout:

```text
consumer-project/
├── CLAUDE.md
├── README.md
├── acceptance/
├── scripts/
└── .claude/
    └── skills/
        └── <the eleven shipped skills>
```

`CLAUDE.md` belongs at the project root. Its always-on references are the exact files
`@.claude/skills/design-build/SKILL.md` and
`@.claude/skills/ui-design-principles/SKILL.md`. A different skill root is unsupported until the
`@` paths are changed and `bash scripts/check-package-wiring.sh .` passes. Directory-only
references and merely having similarly named skill directories somewhere on disk are insufficient.

### Why the CLAUDE.md is not optional

A skill that is *listed* is not a skill that *loads*.

Skills named with an `@`-reference load every session. Skills merely described — in a table, in
prose, in this README — rely on the assistant discovering them from their own `description`, and in
practice they frequently never fire. Measured here in a four-run controlled comparison (same prompt,
same `DESIGN.md` and `tokens.json` by md5, only the skills varying): six skills were described in a
project `CLAUDE.md` table across four builds and **none was ever invoked** — including on a run where
an unnamed skill's description matched the task almost word for word. Only the `@`-referenced skill
loaded, and its rulebook was the only channel that reached the build.

So: if you strip the `@`-references out of `CLAUDE.md`, the kit degrades to whichever single skill
you left named, and the others become documentation. If an `@` path does not resolve, it loads
nothing and reports nothing. The package therefore validates the paths in the assembled consumer
fixture before publishing.

The shipped `CLAUDE.md` `@`-references **two** skills: `design-build` (the sequence) and
`ui-design-principles` (the guardrail). Everything else is invoked by name when its phase arrives —
`design-build` invokes `/design-review`, which invokes the lenses. Read *Why so little is
preloaded* before you add a third.

### Why so little is preloaded

Earlier versions `@`-referenced a third, "form" skill ahead of the guardrail. Two things argued
against it. The claim that a form skill first gives livelier output was tested and not supported —
preloading it ahead of `ui-design-principles` produced a **flatter page with more defects**, in a
confounded run (another skill's setup step also ran). And a preloaded theme catalogue was in every
session, which pulled supplied references toward the nearest theme. So the starter catalogue is its
own skill, `starter-directions`, and opens only when someone asks for it.

**What is still open: why the flatness happens at all.** A page can score zero on every instrument
here and still read as generated, because the checks measure defects, not presence. The leading
candidate is the sheer volume of always-on guidance — across five builds, more guidance correlated
with flatter output every time. Untested as a clean experiment, and worth knowing before you grow
your `CLAUDE.md`: length is a cost, not just a context cost.

### Choosing a design direction

You do not need a complete brief to start. Pick the path that matches what you have — the kit routes
on it before anything visual is decided, by this precedence: what you approved › your existing
system and shipped screens › references you supplied › starter directions.

**I have examples, references or a visual idea.** Share the screenshots, URLs, clips or moodboard.
The kit works **reference-led**: the designer opens the original images directly, studies the
relationships that matter, and keeps the assigned originals available through direction generation
and narrow proof-building. Notes can capture hierarchy, rhythm, motion and boundaries, but they do
not replace or anonymise the images. Similarity and provenance are reviewed after the initial visual
exploration, and no starter direction is involved unless you explicitly request one.

> I have five websites I like. Help me understand what I respond to, then create three genuinely
> different directions for our product.

**I want it to closely follow a specific design.** Say so explicitly — the kit will not assume it.
It then works **reference-directed**: it records exactly what may be followed closely and what still
cannot transfer (logos, copy, proprietary assets).

> Closely adapt the layout and motion of this reference for our own content.

Asking for *concepts*, *alternatives* or *help choosing* runs **`direction-study`**: provisional
contracts, narrow proofs, rendered evidence, a similarity check and a recommendation — then it stops
at `STUDY — DECISION REQUIRED` for you to Select, Reserve or Kill each one. Nothing is built for
production until you choose. Refinements you ask for are added as amendments; the original contract
is kept.

**I have a detailed brief but no visual direction.** The kit asks whether you want original
directions developed from the product's own meaning, a few starter directions as curated starting
points, or both side by side. If you leave it to the kit, it tells you which kind of direction it
chose.

**I already have a brand, design system or approved screen.** Share it and say what is already
approved. The kit extends that system and does not introduce a new visual direction unless you ask
to explore one.

> Use our existing design system and shipped account screen to design the billing area. Preserve
> the established visual direction.

**I am building product UI** — an app shell, settings, a dashboard, a form-heavy tool. Say so;
`design-build` takes its **product-interface** route: the system and your existing product surfaces
direct it, page structures and starters do not apply, and the extra care goes on states, density,
keyboard paths and the cost of a wrong click.

> Build the settings area for our admin app on the existing system — every state, keyboard
> reachable, production-ready.

**I don't know what direction I want.** Ask for starter directions. `starter-directions` is a
catalogue of 13 ready-made directions for projects with no brief detail, references or system yet.
It asks what it must in one question, recommends two or three with a sentence each on why they fit,
and waits for you to choose, compare or go custom. If you hand the choice back, it picks one, says
which and why, and treats it as *picked, not selected*.

> I don't have a design direction yet. Ask me the essential questions, then recommend two or three
> starter directions that could fit this product. Explain how they differ and wait for me to pick.

> Show me the starter directions side by side before we decide anything.

> None of these fit — develop a custom direction from the brief instead.

**I like a specific starter.** Name it. On its own, a named starter is simply your choice. Named
against a direction you already supplied, the kit runs a match gate on five dimensions —
composition, type roles, surface and colour, object family, motion and interaction — and four of
five must match, with evidence and a stated boundary, rather than applying it because of a similar
colour or mood. A starter is never offered as the nearest match to a direction you supplied.

> Would the "Orrery" starter fit the direction we agreed? Check composition, type roles, surface,
> objects and motion — not only its dark palette — and tell me where the boundary is.

Once chosen, a starter becomes the approved direction for the build, and resemblance to it is
expected, not a defect.

#### Slop and sameness, on every build

`distinctiveness-review` is the anti-AI-slop lens, and `design-review` runs it on every build,
whatever the direction source. It reads the detector's findings as evidence and adjudicates what no
script can see as CONFIRMED SLOP, JUSTIFIED or NEEDS INTENT. On work with its own direction it judges
whether that direction was carried out: intentional choices the direction evidences — a glow, a dark
ground, an unusual layout — are protected, generic defaults are still flagged. With a build log it
also checks the page against the previous build for repetition.

> Audit this interface for generic AI patterns and visual defaults without changing its approved
> direction.

### Starting without a design system

The kit has five paths. Pick by what already exists:

| You have | Use |
|---|---|
| A valid machine-readable visual brand, no system | `brand-to-system` — derive and strictly validate `tokens.json` plus the four-layer `DESIGN.md` |
| Code, no written system | `ui-design-system` **Extract mode** — reverse-engineer the implicit decisions |
| One page you are happy with | `ui-design-system` **Extract mode** on that page — lock the system from what you actually built (any route) |
| A greenfield product, not one page | `design-build` — its discovery step shapes the brief, then step 3 encodes the system |
| A brief and nothing else | `ui-design-system` **Create mode** — gates on `validate-tokens.py --strict`, so a half-populated token file cannot get through |

**On a blank project, prefer building one page first and locking it.** A design system is a
compression of decisions already made; generate one before any decisions exist and you compress
nothing, which is how you get a system that is defensible, generic and dull. Create mode is the
fallback when you cannot build a page first — not the default.

Locking the system from a page is `/ui-design-system` Extract; it needs asking for by name.

---

## Verify what you received

```bash
bash scripts/drift-check.sh          # every file against skills-lock.json
```

Each skill also carries its own suite, all offline and deterministic:

```bash
for s in .claude/skills/*/; do bash "$s/tests/run.sh"; done
```

Expected: `ui-design-review` 96/96, plus the detector's static fixtures and — with a Chromium-based
browser — its browser fixtures · `ui-design-system` 35/35 · the rest report their own guards.
Without a browser the rendered checks print SKIPPED / UNVERIFIED, which is never clean. If anything
is red, the tree was modified after packaging — the publish step gates on all of it being green.

---

## Running the mechanical checks on your project

```bash
# static scan of frontend files — tiered ERROR / REVIEW / RISK
bash .claude/skills/ui-design-review/scripts/scan.sh <file-or-dir>
bash .claude/skills/ui-design-review/scripts/scan.sh --diff main --tiered

# the detector — static pass always, browser pass when a Chromium-based browser exists, one report
node .claude/skills/ui-design-review/scripts/detect/findings.mjs --json <file-dir-or-url>

# token relationships — run before the first component, not after
python3 .claude/skills/ui-design-system/scripts/validate-tokens.py \
  --tokens tokens.json --design DESIGN.md --strict
```

The detector exits 1 on findings and 2 when a pass could not run — **UNVERIFIED, never a clean
result.**

**Scope the validator with `--tokens`/`--design`.** Pointed at a project directory it walks
`.claude/skills/**` and reports the kit's own test fixtures as orphan tokens.

`scan.sh` reads a `scan-exceptions.conf` next to your `DESIGN.md`; an exception must cite a real
entry in the design doc's override log, and no exception can suppress an ERROR.

**A green scanner is not sign-off.** The scan is regex over files and the detector checks known
patterns: neither can judge hierarchy, coherence or context. They exist to make the cheap failures
cheap, so review attention goes to the expensive ones.

---

## What this kit does and does not cover

**Web and SaaS production capable, with cross-platform and native design guidance.** That wording
is deliberate. The rules cover iOS, Android and cross-platform concerns, and the *enforcement* is
web-only: `scan.sh` matches `.tsx .ts .jsx .js .vue .css .scss .html`, and the detector reads HTML
and CSS, so every native rule the kit carries has guidance and no automated check.

Two more honest limits:

- **`evals/evals.json` in each skill is a *definition*, not an executed test.** The files specify
  what correct behaviour looks like; running them needs a model runner this package does not ship.
  The `tests/run.sh` suites are the executed half, and they are structural — manifests, reference
  integrity, routing contracts, checker fixtures.
- **What is checkable is a minority of what matters.** A triage of 37 behaviour and AI rules found
  2 with a statically-checkable root cause. Most of this kit's value is in the review lenses, which
  is why the three-lens instruction above is not optional advice.

---

## Licences

Every skill, script and document in this package is this project's own work; no third-party code or
prose is included. Agentic Design Kit is released under the MIT License; see `LICENSE` for the
full terms.

Ideas from Hallmark and Impeccable are credited in NOTICE.

## RC4 native orchestration

A broad request to use the kit for direction and review is sufficient. Claude Code invokes packaged
skills through its Skill tool; an import or file read is only loading. Direction studies invoke the
principles skill in study-proof mode, then independent distinctiveness review on every rendered
proof before comparison. Confirmed genericness cannot be recommended. IA remains conditional.
See `acceptance/RC4-NATIVE-PREFLIGHT.md` for the fresh macOS session, natural prompt and both
identity and orchestration receipt checks. Human rendered judgement remains primary.

## Claude Code and Cowork

This project package is for Claude Code. Cowork uses the separate installable
`agentic-design-kit` plugin ZIP plus its supplied folder instructions; selecting this folder
alone does not install skills. Both packages ship the same eleven skill payloads. Do not enable
both installations in one acceptance test. Standalone web studies in a connected folder with no
existing app default to one local HTML/CSS proof per direction, a linking index and desktop/mobile
screenshots under that folder. Existing-codebase, native and requested Figma work keep their
appropriate format. Claude Design, hosted Artifacts and publication require an explicit request. Cowork account installation/activation must be verified
in its native session, independently of these filesystem checks.

For the current candidate's exact fresh-session commands, follow
`acceptance/RC5-CODE-PREFLIGHT.md`. Earlier RC4 preflight references describe that prior candidate.

## Direct folder execution — no installation

Native registration is optional for running the workflows. Direct an agent to the local kit and
select folder-execution: it reads the relevant local entrypoints, executes their workflows and
supporting steps, and records actual source/action/output evidence. Reading files alone is not a
completed workflow; direct execution is never reported as native activation. The shared protocol is
`.claude/skills/design-build/references/skill-invocation.md`. The local discovery checker is
`scripts/folder-preflight.py --root <kit-root>`; it supports skills/ and .claude/skills/ layouts.
For the isolated file-based test, use the separate portable folder package's START-HERE.md,
TEST-SETUP.txt and original TEST-PROMPT.txt. No account/plugin installation or enabling is needed.
Existing native preflights do not certify this different mode, nor do file hashes prove isolation.
