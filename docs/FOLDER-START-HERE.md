# Agentic Design Kit — start with this folder

This folder is a complete local kit of eleven design workflows. Use **folder-execution** here:
select the relevant local SKILL.md, then execute its workflow and required supporting steps.
No account skill/plugin installation is required, and no native activation is claimed. Native-only
registration/invocation requirements encountered in a workflow apply only in native mode; here,
execute the same required procedures directly and retain execution evidence.

Before choosing a design approach, resolve this folder's actual root and run its discovery check:

```bash
python3 "<kit-root>/scripts/folder-preflight.py" --root "<kit-root>"
```

It verifies the local skill payload against the lock and returns names and local paths. It does
not run the workflows or certify host isolation. It works after moving this folder; do not use
hardcoded Desktop paths, personal skill roots or other same-named copies. Read
`skills/design-build/references/skill-invocation.md` for mode, evidence and supporting handoffs.
Load only the selected workflow and the references/skills required at its current phase.

## Choose a project workspace

For a new page/app requested while this kit itself is open, first read
`skills/design-build/references/workspace.md` and create a separate project with
`scripts/create-project.py --name <project-name>`. It defaults beside the kit checkout and keeps
its authenticated workflows in the project's `.agentic-design-kit/` for ongoing work.

An explicit destination or existing application takes precedence. If this kit has
`project-context.json` with `project_root: ".."`, work in that parent project rather than creating
another one. Keep implementation, assets, proofs and guidelines outside the kit copy. If the host
cannot access a suitable destination, ask for a project location instead of building in the kit.
Kit maintenance and intentionally located tests/examples are unaffected.

## Route the request

| Request / phase | Local workflow |
|---|---|
| Concepts, directions, alternatives, supplied references or help choosing | `skills/direction-study/SKILL.md` — exploration, narrow proofs, independent review, human decision stop |
| Production implementation after direction selection | `skills/design-build/SKILL.md` — direction, system, build, render, delegated review |
| Independent post-build review | `skills/design-review/SKILL.md` — separate lenses and bounded production repair |
| Craft decisions while proofs/UI are made | `skills/ui-design-principles/SKILL.md` — study-proof mode during exploration; detailed rule sections at decisions |
| Genericness / AI tells after rendering | `skills/distinctiveness-review/SKILL.md` — visual judgement first, detector/scan evidence after |
| Finished-screen correctness and scan/detector scripts | `skills/ui-design-review/SKILL.md` |
| Whole-product critique/refinement | `skills/design-refine/SKILL.md` — read-only unless an editing scope is authorized |
| Material unresolved structure, hierarchy, grouping or labels | `skills/ia-review/SKILL.md` — conditional, not a mandatory study gate |
| Machine-readable visual brand to system | `skills/brand-to-system/SKILL.md` |
| Create/extract/reconcile/audit a production system | `skills/ui-design-system/SKILL.md` — no production system creation during a study |
| Explicitly requested starter, or genuinely absent direction | `skills/starter-directions/SKILL.md` — inactive in reference-led work |

A broad request to use this kit for directions and review is enough. The orchestrator selects and
executes supporting workflows; the person does not name each one. `direction-study` owns the
proof-time guardrail, detailed rules and post-render independent distinctiveness review.

Keep original references directly available. For a standalone web study in a connected folder with
no existing app, save one local HTML/CSS proof per direction, a linking index and desktop/mobile
screenshots beneath the connected project folder. Native, requested Figma and existing-app work
keep their appropriate output format. No Claude Design, hosted Artifact or publication unless asked.

## Isolated test boundary

For this test, use only design workflows from this kit root. Do not install, enable, load or invoke
personal/global/account design skills or another design producer, including `frontend-design`.
If outside design guidance is already active, stop as `INVALID — EXTERNAL DESIGN SKILL ACTIVE`.
An available-but-unused outside skill is not contamination. Do not claim knowledge of hidden host
state you cannot inspect. Ordinary file/code, image-generation and rendering tools remain allowed.

Reading a file is **loaded**; selecting its workflow and carrying out its scoped steps is
**executed**; required outputs/checks/reviews finishing is **completed**. Direct file execution is
not native skill activation. Preserve missing or unverified capabilities instead of substituting a
global skill, claiming a fresh reviewer that did not run, or recommending an unreviewed proof.
The same reference-first creative order, conditional IA and human decision ownership still apply.

Use `TEST-SETUP.txt` separately from `TEST-PROMPT.txt`. The latter preserves the original RC3
creative prompt with only the attached folder name updated. Attach the same reference images and
assets; save the untouched first delivery before any coaching or repair. Do not generate a visual
acceptance study during kit packaging. File hashes/receipts do not certify taste or truthful execution.
