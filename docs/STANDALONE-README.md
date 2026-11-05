# agentic-design-kit — 2.0.1

Standalone design and review workflows, promoted from RC7 on 2026-11-04. Eleven first-party skills;
no dependency on Hallmark or Impeccable. Credits remain in NOTICE.

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

## Start

Give the agent access to this folder and ask it to read START-HERE.md and use this kit for your
request. No account installation is needed for folder execution. The folder can be moved; the
entry resolves sibling workflows locally. Merely selecting a folder does not guarantee host
autodiscovery, and file execution is not native skill activation.

Examples of requests:

- Study supplied screenshots and propose design directions to choose from.
- Build the selected direction using its approved brand and design system.
- Review an existing page for generic/AI-default construction, UI quality and IA problems.
- Refine a page using the review findings and an authorized editing scope.
- Create visual brand guidelines and a reusable design system from an approved direction.
- Apply existing guidelines/components to another page, or check for drift across a product.

Keep original references accessible. Provide the actual project content, assets and existing
brand/system documents when available. The agent should ask material questions and can make
professional design choices when you delegate them.

New project requests made from the opened kit create a separate sibling project, with a pinned
`.agentic-design-kit/` copy and relative agent contexts for ongoing work. Explicit destinations and
existing applications take precedence. The helper refuses overwrites and does not install globally.

## Quality and continuity

The kit judges whether techniques earn their place in the brief and rendered design. Gradients,
large radii, illustration and other familiar treatments are not automatically slop. Pattern
presence, absence and zero detector findings cannot establish visual quality on their own.
Readability, accessible interactions, sound information structure and responsive behaviour still
matter. Reviews report their evidence, disagreements and unavailable coverage.

Visual brand guidance is agent-authored from a brief, references or selected direction. System
work produces a four-layer DESIGN.md plus tokens.json and component rules. Compatible existing
brand.json can use the light-ground derivation tool; other directions use the system's Create
mode. Future work consumes the approved guide/system and existing components, then checks drift.
The new brand-authoring route has structural coverage and evaluation definitions; it has not yet
had a separate creative acceptance run. See RELEASE-NOTES.md for the evidence and limits.

Direction proofs stop for a human decision; production review has its own readiness states.
A functional checkout and full application states are scoped by the actual task, rather than
assumed to be complete in a visual study.

## Verify the payload

    python3 scripts/folder-preflight.py --root <this-folder>
    bash scripts/drift-check.sh

These verify files, not design quality or hidden host state. This release contains no test prompt,
prior study outputs, generated project assets or account settings. Native Code/plugin packaging
is available separately from the canonical source.
