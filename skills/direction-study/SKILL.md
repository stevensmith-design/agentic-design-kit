---
name: direction-study
description: "Explore materially different visual directions before production. Use for broad requests to use this kit for direction and review, supplied references, concepts or alternatives, or when a build has no chosen direction. Keeps original references directly available, makes narrow proofs, reviews similarity and provenance after exploration, and stops for a human decision."
metadata:
  version: 0.10.0
---

# direction-study

This is an exploration workflow, not a production build. Its baseline is the original Design Skills
Kit sequence: understand the brief and the actual references, form directions, make the smallest
useful visual proofs, compare them, and stop for a person to decide.

The supplied references are creative inputs. Keep the originals directly available to the designer
through study, synthesis and proof-building. Notes, finding cards and provenance records may help,
but they never replace the originals or become a source-anonymous brief.

Use only design producers and orchestrators shipped with this kit. Do not load or invoke a global,
user-level or third-party design skill, including `frontend-design`, as a collaborator, fallback or
replacement. If one is already active, stop before generating directions and report
**`INVALID — EXTERNAL DESIGN SKILL ACTIVE`**.

## Invocation

A broad kit request for concepts, directions, alternatives or help choosing selects this workflow.
First select and record the mode using `../design-build/references/skill-invocation.md`:

- **Folder-execution:** select this folder's `direction-study/SKILL.md` and actually execute its
  workflow, scripts and supporting handoffs from the same root. No native activation is claimed.
- **Claude Code project:** invoke `/direction-study` through Skill (`skill: "direction-study"`).
- **Cowork plugin:** activate the verified `agentic-design-kit:direction-study` registration.

A file read or `@` import alone is only loading, not completed execution. Selecting a folder does
not register native skills, but direct workflow execution does not need registration. Do not ask the
person to name each internal skill. Every supporting `/name` below follows this same selected mode;
if its required workflow cannot run, report incomplete review and make no positive recommendation.

Before saving project artifacts, resolve the workspace with
`../design-build/references/workspace.md`.

## Proof output

For a standalone **web** direction study with a connected local folder and no existing application,
save one locally viewable HTML/CSS proof per direction, a simple local index linking them, and
rendered desktop and mobile screenshots, all under that connected project/output folder. Include
local proof, asset and render paths in comparison. A narrow fragment or page slice remains enough;
HTML does not imply a full page or production build. No Claude Design, hosted Artifact, publication
or other design-producing canvas unless the person explicitly requests that output.

This default does not redirect native-app work, an explicitly requested Figma/design-file workflow,
or proofs in an existing codebase; use the relevant requested/native implementation there. Ordinary
browser/rendering tools remain appropriate. If required local files or renders cannot be produced,
report the limitation instead of silently changing deliverable.

## Routes

- **Reference-led** — the normal route when visual references are supplied. Translate what is useful
  into a direction for this content; do not recreate a source.
- **Reference-directed** — only when the person explicitly asks for close recreation and has the
  right to do so. Record what may be followed and what must not transfer.
- **Brief-originated** — when a sufficiently rich brief exists without visual references. Work from
  its content, audience and desired experience. Do not open a starter catalogue unless the person
  asks for one or explicitly hands off visual direction.
- **Single-source study** — when the request is to understand one source rather than make directions.
  Follow `references/source-study.md` and stop without building.
- **Single-contract mode** — when `/design-build` needs one direction rather than alternatives. Run
  steps 1–6 for one direction, return the provisional contract, and offer a study if the material
  supports several equally plausible readings.

## Sequence

1. **Read the brief, original references, shipped surfaces and real assets.** Open the actual supplied
   material. If a file is ephemeral or inaccessible, copy it to a stable project-local location when
   possible; if it still cannot be viewed, name the gap. Do not pretend that metadata, a summary or a
   finding card is visual inspection.

2. **Partition the brief.** Record the invariants, open variables and the smallest test surfaces that
   can reveal a direction. Use `references/templates/brief-partition.md` when a written artifact helps.

3. **Study the originals and assign bounded responsibilities.** Say what each source contributes—such
   as composition, type behaviour, image treatment, motion, density or interaction—and what must not
   transfer. One source may contribute to more than one direction for different reasons. Keep every
   original beside the observations; do not anonymise it or flatten several sources into generic taste
   words. Read `references/reference-study.md` and extract a provisional visual guide per source
   using `references/templates/reference-visual-guide.md`: colour roles and coverage, typography,
   layout/rhythm, component treatments and imagery. Keep 3–5 defining traits as a summary; distinguish
   observations, estimates and proposed adaptations. This is not a production design system.
   Reuse the person's stated influence preference or ask whether to preserve the full visual style,
   use loose inspiration, or mix selected ideas—and whether examples are alternatives. Style fidelity
   does not imply copying layout. Resolve material reference/rule conflicts and imagery permissions
   with concrete questions; wait for unanswered material decisions and record dated actual answers.
   Flag Tier-2 traits for approval without making the person approve every ordinary observation.
   Study approval does not waive contrast, legibility, hierarchy, usability or reduced-motion needs.
   Follow `references/reference-study.md` for conflicts, source coverage and asset fallback handling.

4. **Write a lightweight creative brief and propose directions.** Synthesize the project brief,
   content and references into positive premises. Then propose the number of directions the request
   needs; if it is unspecified, choose a useful number from the material rather than enforcing a
   default. A direction should say what the experience is trying to make felt, how the real content
   behaves, and which reference responsibilities inform it. Do not map reference-led work to a stock
   direction, house style, familiar product archetype or repeated concept vocabulary. Contrasting
   examples supplied as alternatives should yield coherent source-led alternatives, not a blend.
   Say what each direction preserves and adapts; label project-driven departures honestly.

5. **Check that the directions are worth testing.** Compare their content hierarchy, composition,
   typographic behaviour, material or imagery, interaction and responsive intent. Reject superficial
   palette swaps and deliberately weak options. This is a divergence check, not an aesthetic rubric;
   use `references/divergence-check.md` only as a prompt to compare substantive choices.

6. **Freeze provisional contracts after exploration.** Once the directions exist, capture only enough
   to build each proof consistently: premise, content behaviour, reference responsibilities, key
   choices, exclusions, responsive intent, motion intent and real-asset constraints. Link the visual
   guide and preserve its colour/type/component roles while adapting the composition to real content. Use
   `references/templates/direction-contract.md`. Record provenance now, after the creative proposal,
   with `references/templates/decision-provenance.md`; provenance explains a direction and does not
   generate one.

7. **Build narrow visual proofs.** Give each proof builder the project brief, its contract, real assets
   and its assigned original references. The originals remain directly viewable. Use the smallest
   suitable form—one composition, a fragment, a connected sequence or a page slice—that exposes the
   direction's decisive choices. It is allowed to fail. Include the relevant narrow/mobile and reduced-
   motion view when those qualities are part of the direction. Do not turn proofs into production pages.
   Before building each proof, invoke packaged `/ui-design-principles` with `args: "study-proof"`.
   Use `quick-rules.md` as an index, then open the relevant detailed `rules.md` sections at actual
   typography, colour, canvas, layout, cards, navigation, imagery and responsive decisions. Record
   the decision and section used; loading only the index is incomplete. Keep originals visible.
   New choices in a later round reopen their detailed sections (including imagery, text over images
   and motion); prior index reads do not cover them. Human approval of a visual trait records intent,
   not blanket clearance of accessibility, motion or genericness findings.
   This mode consumes the provisional premise, skips production system work and leaves IA conditional:
   invoke `/ia-review` Mode 3 only when materially unresolved navigation, grouping, hierarchy, labels,
   disclosure or task structure must be settled to test this direction. Do not force one shared
   structure on a narrow visual study.

8. **Render and inspect the proofs.** Look at what was actually made. Record missing assets honestly.
   Approved generated imagery and clearly labelled study-only product mockups are allowed within
   the agreed asset plan. Never present invented testimonials, outcomes, real product capability or
   customer evidence as fact. Check sample dates, sequence and totals for internal consistency.
   For an initial choice, default to the early feedback checkpoint in `references/study-review.md`:
   show small rendered previews after checking fidelity and basic legibility, before full reviews.
   Label them `STUDY PREVIEW — FEEDBACK REQUIRED`; do not recommend, claim completed review or run
   production sign-off. If the person requested a reviewed comparison now, continue to steps 9–10.

9. **Review similarity, resonance and provenance after the visual exploration.** In a fresh context
   where possible, first observe the original brief and actual references without builder notes;
   save the defining traits, then compare each render and its contract with the originals using
   `references/similarity-review.md`. Report both under-influence and excessive resemblance. Confirm
   that major decisions have an honest basis in the brief, content, function or named reference
   responsibility. These checks assess the design; they do not retroactively prescribe its aesthetic.
   For a completed comparison, invoke packaged `/distinctiveness-review` independently for
   **every rendered proof** included in that comparison,
   preferably in a fresh context. Give it only the original brief, actual supplied references,
   provisional contract, real content and rendered proof plus implementation access. Give it no
   builder preference or other reviewer's conclusions. It first inspects the render and writes its
   visual judgement; only afterward run its detector and relevant read-only UI scan as supporting
   evidence. Keep reference resonance, excessive similarity, distinctiveness/genericness and
   mechanical implementation quality as four separate judgements. An internally distinctive proof
   may still be under-influenced by the references. Read `references/study-review.md` for handoff,
   completion evidence and unavailable-review handling.

10. **Compare and stop.** Use `references/comparison-report.md`. Explain the strengths, risks and
    differences, recommend when useful, and leave the verdict to the person. Show where each supplied
    reference leads or contributes; get confirmation before dropping one. Read-only UI/craft,
    distinctiveness and reference reviews are part of a study, not production sign-off. A confirmed
    generic or obvious AI-default direction cannot receive a positive recommendation, even if polished or
    reference-resonant. Missing required review means no positive recommendation. Present with a clear
    warning, remove it while preserving evidence, rerun from its original premise, or recommend none.
    Read-only review never silently repairs a finished proof. A pre-presentation exploration iteration
    is a new version from the original premise: preserve the original contract, proof, renders and
    findings, then rerender and repeat both reviews before a completed comparison; it is not a
    production repair pass. An early preview round may pause before those reviews.
    The valid outcomes include
    selecting one, reserving one, killing one, or **rejecting every direction and requesting a rerun**.
    End at **STUDY — DECISION REQUIRED**.

## Amendments

The agent recommends; the person decides. A selected direction becomes the human-approved direction.
If the person refines it, write an amendment with
`references/templates/contract-amendment.md`; refinement is an amendment, not a rewrite of the frozen
base contract. Hand `/design-build` the base contract, accepted amendments, original assigned
references, provisional visual guides and real assets. A preview preference identifies a candidate
for completed study review; it does not clear missing reviews or authorize production sign-off.

## Optional diagnostics

Source keys, inspection receipts and guidance-load records are troubleshooting aids, not prerequisites
for creativity. Use them when access is unreliable, when the person asks for an audit trail, or when
debugging accidental starter/library leakage. They must never hide references from the designer,
substitute written abstractions for originals, or move provenance ahead of direction generation.

## Never, during a study

- create or revise a production design system;
- run a production repair pass or report `READY`, `READY WITH PROPOSALS` or `REVIEWED`;
- assign the verdict, blend routes after the fact, or salvage fragments from a killed direction;
- open a starter or structure catalogue in reference-led work unless the person explicitly requests a
  named-starter comparison;
- replace original references with summaries, source-anonymous findings or contracts;
- use compliance gates, provenance forms or verification documents to choose the initial aesthetic;
- use an external design producer or orchestrator alongside this kit;
- infer reference-directed mode from enthusiasm alone;
- invent product evidence or present study-only imagery/mockups as supplied or verified assets.

## Guardrails

1. Original references were viewed and stayed directly available wherever they informed creative work.
2. Creative exploration preceded contracts, provenance and similarity/compliance review.
3. Directions differ through content and visual behaviour, not a prescribed house style or vocabulary.
4. Proofs are narrow, rendered and honestly constrained by available assets.
5. Post-exploration review checks resonance, resemblance and provenance without rewriting the premise.
   Every rendered proof in a completed comparison completes independent `/distinctiveness-review`.
   Early previews are explicitly unreviewed and cannot carry a positive recommendation.
   Visual judgement precedes detector/scan evidence, and confirmed genericness blocks recommendation.
6. The person may reject all directions and request a rerun.
7. Early feedback pauses at **STUDY PREVIEW — FEEDBACK REQUIRED**. A completed study stops at
   **STUDY — DECISION REQUIRED** or returns one provisional contract to
   `/design-build` in single-contract mode.
