---
name: ui-design-principles
description: >
  Apply human-centered UI design principles before and during interface creation. Use this
  skill whenever the user asks to build, design, add, or modify any UI — components, screens,
  flows, dashboards, forms, onboarding, empty states, or any visual interface. Also triggers
  when a design brief or spec mentions new screens, when design-build runs, and when
  any frontend file (.tsx, .vue, .css, .html, component) is newly created or significantly
  changed. This is a guardrail skill — load it at the start of UI work, not after. If a
  project CLAUDE.md references this skill, apply it throughout that project's UI work.
  Siblings: use ui-design-system to create/extract/audit the design system as a whole,
  ui-design-review to review a finished screen or PR, and ia-review for navigation/flow
  structure; this skill is the build-time guardrail while a screen is being made.
---

# UI Design Principles

Guardrail skill for UI creation. Loads before design decisions are made — not after.

**Dependencies:** `ui-design-system` owns system creation/extraction and its token validator;
`ui-design-review` owns post-build sign-off. If either sibling is unavailable, do not silently
reimplement it here—state the limitation and keep this skill to build-time guardrails.
This skill's `references/rules.md` is canonical; the review skill carries a byte-identical mirror.

## Study-proof mode (`args: "study-proof"`)

When invoked by `/direction-study`, use this bounded mode instead of production Steps 1 and 1.5.
Consume the provisional direction contract already formed after exploration; do not restart direction
selection, create/revise `DESIGN.md` or production tokens, extract a system, or require a full page.
Proof-local values are provisional implementation choices, not promoted production rules. Consume
linked per-source visual guides alongside originals: preserve colour roles/coverage, type character,
component treatments and imagery while adapting composition to content. Label project-driven
departures honestly; do not silently recolour the canvas to satisfy a metric or replace an agreed
image medium when a tool fails. Resolve material conflicts through the study workflow.

Keep the actual assigned reference images directly visible. Open `references/quick-rules.md` as an
index, then read the relevant detailed `references/rules.md` sections at each visual decision:
typography, colour, canvas, layout, cards, navigation, imagery and responsive behaviour where used.
Record decision → named section in the proof notes. An index-only read does not complete this skill.
Apply contextual craft/accessibility guidance to the narrow proof; heuristic defaults and AI-tell
combinations do not choose its aesthetic or displace the supplied references. No detector gate runs
before creativity. The post-render reviewer adjudicates the made design independently.

For approved Tier-2 traits, use the dated human reference-intake answer as authority under
`rules.md` → **Study-proof authority**. Link it from the proof contract; no production DESIGN file
or token/exception registration is needed. Do not apply production flat/default substitution or
canvas, accent, radius and type heuristics against that approved intent. Evaluate their actual
craft and accessibility in the rendered proof.

IA Mode 3 is conditional: invoke packaged `/ia-review` only if materially unresolved navigation,
grouping, content hierarchy, labels, progressive disclosure or task structure must be settled to test
this direction. A narrow visual study need not share a page structure with other directions.
Finish this mode with the proof's decision/section notes and scope limitations, then return to the
study. Production bootstrap and system validation below resume only after human direction selection.

## Production mode

Three responsibilities:
1. **Commit to a design direction** before any code is written
2. **Define the design system** — establish binding token rules before the first component
3. **Apply the rules** throughout — preventing AI-generated-looking output

---

## Step 1: Design thinking (run before writing any code)

Before touching code or layout, answer these nine questions. The answers become the design contract for this piece of work. Resolve the **task structure** before committing to a visual direction — an aesthetic chosen before the structure is settled ends up decorating the wrong layout.

If task structure involves navigation, grouping, labels, information scent, or progressive
disclosure, run **`ia-review` Mode 3 (structure design)** before committing the visual direction —
the build-time mode, which takes a brief and produces a structure rather than auditing one that
already exists. Modes 1 and 2 need the artifact to exist and are the wrong call here; reaching for
them at this point is what causes the step to be skipped or run against a sketch. Consume Mode 3's
committed structure as the task-structure answer below, rather than silently treating visual layout
decisions as IA approval. After the build, `ia-review` Mode 1 audits the result against that
committed structure.

**Purpose** — What problem does this interface solve? Who is the user and what do they need to do?

**Platform** — Web, iOS, Android, or cross-platform? Platform determines navigation conventions, tap target sizing, font choices, and which native components to use.

**Register** — What is the user here to *do*? Four registers, and the answer scopes which rules apply
and how bold to go (full table: `references/rules.md` → **Design intent — the four registers**):

- **Persuade** — decide and act. Landing pages, campaigns, pricing. Design carries the message.
- **Operate** — complete a task. Dashboards, editors, tools. Design serves the task.
- **Read** — understand something. Docs, guides, help. Measure, rhythm and pace over density; *few*
  actions, not efficient ones. Judging a docs page by dashboard density produces a hostile page.
- **Experience** — explore the work. Portfolios, galleries, showcases. **The design recedes** and the
  work is the subject — the opposite goal to Persuade, with the same visual ambition.

A product often needs several. That is not incoherence: the token system holds across registers,
while density, motion budget, type sizing and decorative allowance are expected to differ.

**Task structure** — Settle these before any visual choice; they decide the layout, and the aesthetic only dresses it:

- the primary action / decision
- information priority
- frequency and expertise of the user
- the interaction primitive
- page vs. panel vs. modal
- progressive disclosure
- irreversibility / consequences
- responsive structural behaviour

**Aesthetic commitment** — Pick a clear direction and name it in one sentence. Vague is wrong. Examples:
- "Calm and minimal — no heavy shadows, flat structure, lots of white space"
- "Warm and playful — rounded forms, soft colors, expressive type"
- "Editorial — strong typographic hierarchy, restrained color, unexpected layout"
- "Dense and utilitarian — information-first, tight spacing, no decoration"

When the user names a style, the direction is unresolved, multiple styles are being mixed, or an
external style recommender is available, read `references/design-directions.md`. Classify visual
language separately from layout strategy, content primitive, theme/mode, effect, and requirements;
then write both a direction sentence and an exclusion sentence. Do not turn a style list into a
sampler.

When the user supplies or names an **external source** — a live site, a screenshot, a component
library, a design-system file (e.g. a found `DESIGN.md`), or a style recommender — read
`references/reference-intake.md` first. Record the source's role and provenance and treat it as
evidence, not authority; project evidence and these rules adjudicate what it suggests.

When the user explicitly requests Material Design, the target is Android, or the codebase already
uses Material 3 components/tokens, also read `references/material-3.md`. Decide whether the product
is Material-native, Material-adapted, or merely Material-compatible before selecting components.

**Differentiation** — What will make this screen feel considered rather than generated? One specific choice that signals a human made a decision here (a font pairing, a color, a layout move, a motion detail).

### The decision contract — three questions the aesthetic cannot answer

The six above settle *what* is being built. These three settle what it is being built **for**, and
they are the ones a review can later hold the design to. Answer each in one sentence; a vague answer
here is a design with nothing to fail against.

**Outcome** — What measurable user outcome should improve? Name the thing that gets better for the
person using it — a task completed more often, an error made less often, a decision reached with
less back-and-forth — not a metric the business watches and not "engagement". If no user outcome can
be named, the work is decoration or it is scope that has not been thought through, and it is cheaper
to find that out now.

**Trade-off** — What is this design accepting in exchange? Every real design decision costs
something: density costs scannability, speed costs reversibility, power costs first-run
comprehension, a distinctive form costs familiarity. Naming the cost is what separates a decision
from a preference, and an unnamed trade-off is the one that surfaces in review as an argument
nobody can settle. State it as *"we accept X to get Y"*.

**Human control** — What must remain under direct human control, whatever else the system does?
Decide it before the flow is designed rather than discovering it during implementation. Anything
irreversible, anything that reaches a third party, anything that spends money, and anything the user
would be held accountable for belongs on this list by default. This answer binds: a later
convenience must not quietly take one of these away.

Carry all three into `DESIGN.md` alongside the aesthetic commitment. They are the contract the
build is measured against — and, unlike the aesthetic, they are the part a reviewer can check
without taste entering into it.

### If the feature is AI or agentic

When the feature's **core interaction** is a model producing output or an agent acting for the user,
read `references/ai-agentic-build.md` before designing the flow: the **does-AI-add-value gate** (run
it per feature, and prefer deterministic or manual where predictability, transparency or direct
control matter more) and **autonomy as a six-level spectrum** rather than a manual/automatic switch,
with consequence and reversibility setting the ceiling. Skip both for a product that merely has AI
somewhere inside it — say so in one clause and move on.

Then also read `references/rules.md` → **AI and agentic interfaces**, and run `ia-review` Mode 3
step 2.5 for the structural half — actors, responsibility, persistent objects, handoffs, re-entry and
provenance.

### Evidence and authority — what can justify a change

The full authority and adjudication model is `references/rules.md` → **Decision tiers and the
override process** (accessibility/correctness first; then current project contract and authoritative
components; then platform conventions and named principles; generic heuristics last — a shipped
one-off can be drift, an override records intent but cannot waive accessibility). Every change states
basis, evidence, confidence, scope, and compatibility; before changing an existing component/state,
inventory representative instances, choose the smallest compatible correction, render the target plus
representative siblings, and promote into the system only after validation and authorization.

For state styling, use the **minimum sufficient signal**. "Do not rely on colour alone" does not mean
"always add a checkmark": a border, weight, shape, indicator, label, or positional relationship may
already communicate the state. Add a mark only when the selection model and rendered evidence need
one.

---

## Step 1.5: Design system bootstrap

**Scope gate — match the ceremony to the change.** Not every task needs a full system bootstrap:

- **Small change** (adjust a button, a spacing value, one component in an existing app): use the project's authoritative existing components and tokens as-is. Document only a *genuinely new* decision. Do not create a `DESIGN.md` to move one button.
- **Substantial new UI** (a new screen, flow, or feature): write a lightweight design contract (Step 1) and confirm the tokens it needs already exist or add them.
- **Missing or incoherent system** (no `DESIGN.md`, or the tokens don't cohere): invoke the `ui-design-system` skill (Create or Extract mode) — that skill *owns* establishing the system; this skill *consumes* it. Do not reverse-engineer the whole system inline here.

The bootstrap steps below apply to the substantial-new-UI and (via `ui-design-system`) the missing-system cases — not to a small change against a system that already exists.

Before writing any code, locate the project's design document. Look for `DESIGN.md` first; if not found, check for `design-guidelines.*`, `DESIGN_SYSTEM.md`, `brand.md`, or similar. Also look for a `tokens.json` alongside it.

### If a design doc exists (under any name):
Read it. Treat current, approved decisions as the project contract, while checking that the
rendered authoritative components still agree with it. Do not introduce conflicting spacing,
colour, radius, or type values. If a decision is uncovered, propose it and validate its blast
radius before persisting it; a review or small implementation request does not itself authorize
rewriting the design contract.

### If nothing exists (missing system → hand off to `ui-design-system`, don't build it here):

Per the scope gate, a missing or incoherent system is established by the **`ui-design-system`** skill, not by this one. Invoke it (**Create mode** → `ui-design-system/references/mode-create.md`) to settle spacing scale, radius scale, colour tokens, typography, and surface/elevation and produce `DESIGN.md` + `tokens.json` from `references/design-system-template.md` and `references/tokens-template.json`, then return here to build screens against the result. Do the deciding there — do not reproduce or reinvent those token decisions inline here. Carry the **aesthetic commitment** from Step 1 into the file.

> **Gotcha — never synthesize a gradient or glow canvas, even if you believe a design doc committed one.** Verify the actual canvas token in the project's tokens file (tokens.json / theme) before styling the canvas. A half-remembered "documented gradient canvas" is almost always wrong; the only legitimate gradient surfaces are committed immersive screens, registered in the project's `scan-exceptions.conf`.

### Validator gate — the system must cohere before the first component

Once the tokens are defined (whether newly created or read from an existing file), run the
token-graph validator **as a gate**, before building any component. Do not hard-code an install path
— **discover** `ui-design-system/scripts/validate-tokens.py` from the active skill catalog/config,
falling back to common vendor roots (`.claude/skills`, `.agents/skills`, `$SKILLS_ROOT`,
`~/.claude/skills`) only if that fails, then run it `--strict` and **print the resolved path in your
report** as evidence of which copy ran:

```bash
python3 <resolved>/validate-tokens.py . --strict
```

**Validator absent (degraded mode).** If no `validate-tokens.py` can be discovered, do **not** claim
a `PASS` and do **not** silently skip the gate. Report the token relationships as **UNVERIFIED**,
name which relationships could not be computed (contrast pairs, value steps, ramp hue, type-scale,
elevation monotonicity), assess what you can by hand, and state the exact next step (install/point to
`ui-design-system`) needed to lift the gate. Building may proceed only with this caveat recorded — an
unverified system is never reported as a cleared gate.

`--strict` requires the core relationships (body-on-canvas, CTA-label, value step, neutral ramp) to
actually be assessed — an unresolved required role becomes a `FAIL`, not a silent `SKIP`. It computes
the between-token relationships no per-component rule can see (full catalog in
`ui-design-system/references/validator-checks.md`). **Resolve every `FAIL` before writing the first
component** — a broken relationship baked into the tokens propagates into every screen. A `PASS` is
the floor, not sign-off; it does not judge layout or taste. For full system work (Create / Extract /
Coherence audit / Drift), use the `ui-design-system` skill.

### Component-first token commitment

This is the most important principle: **when the AI introduces a new element type for the first time, it must define the token rules for that element before implementing it.**

- First card → define card `border-radius`, `padding`, `shadow`/`border` decision → apply consistently to all subsequent cards
- First button → define height, padding, border-radius, font-size for each variant → apply to all buttons
- First input → define height, border, label position → apply to all form inputs
- First modal → decide sheet vs. full modal, decide the radius, decide the backdrop → document it

The goal is that **every design decision is made once and then applied consistently** — not reinvented per component. A component that introduces a new spacing or radius value not in `DESIGN.md` is a sign that the design system wasn't followed.

If the project already has styles but no written system (existing app), that is the missing/incoherent-system case: use **`ui-design-system` (Extract mode)** to reverse-engineer the implicit decisions into `DESIGN.md` before adding new UI — don't extract ad hoc here. This makes inconsistencies visible and defines what to align to going forward.

---

## Refining what already exists

Changing a built screen — polish, bolder, quieter, distill, harden, and the rest — is
`/design-refine`'s, and its **read-only lane is the default**: a question, a review, or any scope
you are still inferring gets a file-and-line dry-run plan, not an edit, and you say which lane you
chose. It edits only on an explicit go-ahead, and an approval to *review* never carries mutation
authority into a later run. `DESIGN.md` and `tokens.json` stay owned by `ui-design-system`.

## Step 2: Apply the rules

Read `references/quick-rules.md` now — the complete rule index, one line per rule. Do **not** read all of `references/rules.md` up front. Instead, open the named rules.md section at each decision point (the routing table at the end of quick-rules.md maps decisions → sections): choosing the canvas → "Choosing the canvas"; first card → "Border radius scale" + "List and card patterns"; first button → "Button rules"; and so on. rules.md remains canonical — when the index and the full text seem to differ, the full text wins.

**Build in grayscale first.** Establish layout, spacing, and hierarchy using the neutral ramp only. Then add colour in this order: (1) the one brand accent per the colour strategy; (2) semantic state colours; (3) nothing else. If the screen doesn't work in grayscale, colour won't fix it — and colour added last is colour with purpose. This is the cheapest mechanical defence against colour sprawl.

Before polishing, run the page-level hierarchy inventory in `rules.md` → **Page-level visual
hierarchy**. This is required for settings pages, dashboards, toolbars, and any screen with repeated
actions: repeated components share a family but receive prominence according to role, frequency,
and consequence. Finish with the squint test and a second grayscale check; token consistency alone
does not prove that the page has a clear reading order.

Rules sort into **three tiers** — the full definitions and the override process live in `references/rules.md` → **Decision tiers**. In brief (nothing outside Tier 1 is banned absolutely):

- **Tier 1 — Quality requirements**, never overridable when applicable (placeholder text in production, missing reachable/error states, colour-only meaning, controls without an accessible name; performance only when it causes demonstrated harm at real scale).
- **Tier 2 — Design decision gates**: available to a design that clears the **six gate questions** (Purpose · Direction-fit · Systematic · Still-communicates-without-it · No a11y/hierarchy cost · Legible) and logs the decision. Reach deliberately and record why; an unexplained one reads as AI.
- **Tier 3 — AI-tell risk indicators**: assemblies to avoid stacking (centered-hero, icon-tile grid, badge-above-H1, stat banner…). Any one may be fine; several together signal "assembled, not designed."

The rule index in quick-rules.md is the working reference throughout — every gate and every craft number appears there with its rules.md section named.

---

## Step 3: During implementation

Check against the design system and rules at each decision point.

When introducing or changing an element type:
1. Check if the element type is defined in `DESIGN.md`
2. Inventory its existing instances and states before changing the shared rule
3. If undefined — propose the rule, implement the smallest local proof, and validate representative siblings
4. If defined — use the tokens exactly unless evidence shows the contract is stale or defective
5. Persist a new or revised rule only with authorization and cross-context validation

**"Propose" for a Tier-2 gated pattern — ship the default, surface the pattern.** Do not implement a gated pattern and write its authorizing `DESIGN.md` entry in the same change (self-authored justification is not legibility). Ship the default/flat/neutral form now and surface the gated pattern as a labeled proposal carrying its six-gate justification, for a human to ratify or a pre-existing override to authorize. Full doctrine: `references/rules.md` → **Authoring resolution — ship the default, propose the pattern**.

> **Before / after — the hero CTA on a new onboarding screen.**
> - ✗ *Ship-the-gated-form (wrong):* implement `bg-gradient-to-b from-indigo-400 to-indigo-600` on the CTA **and** add a DESIGN.md override in the same commit. That is self-authorization — the gate never had a human.
> - ✓ *Ship-the-default, propose:* ship the CTA as the flat `--color-primary` solid now. Alongside, surface: *"Proposal: same-hue ≤5% vertical gradient on the primary as a light-source cue — Purpose: depth on the immersive hero; Direction-fit: matches the committed 'warm, tactile' onboarding; Systematic: applied to every primary; Communicates-without: hierarchy already holds in grayscale; No a11y cost: label contrast unchanged; Legible: pending your ratification → DESIGN.md Override Log."* The gradient ships only after a human says yes.

Flag any deviation: state which rule is affected, why the deviation is justified, and log it in the Override Log if proceeding.

### Re-run the validator when the token graph changes

The validator gate in Step 1.5 runs **before the first component** — which means, on a new system,
it runs against a token graph that is close to empty. Component-first token commitment then adds
tokens for every new element type: the first card adds a radius, the first button adds heights, the
first modal adds an elevation. Those are exactly the *relationships* the validator computes, and
none of them existed when the gate passed.

So: **when a new element type introduces a token, re-run the validator before the next element
type.**

```bash
python3 <resolved>/validate-tokens.py . --strict
```

It is cheap and it fails early, while one component depends on the new value instead of twelve. A
`PASS` recorded at bootstrap is evidence about the system you had then, not the one you are
shipping — and reporting the bootstrap PASS as if it covered the finished token set is the
cleared-gate claim this skill tells reviewers not to accept.

---

## CLAUDE.md setup

To make this skill always active for UI work in a project, add to the project's CLAUDE.md:

```
## UI Design
Always apply @skills/ui-design-principles when creating or modifying any UI component, screen, or frontend file. Check for DESIGN.md and tokens.json at the project root and use them as the binding design contract. Read references/quick-rules.md before making any visual decisions, and open the named rules.md section at each decision point.
```
