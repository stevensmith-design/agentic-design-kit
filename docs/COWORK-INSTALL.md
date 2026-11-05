This guide is only for **native plugin** testing. To execute the kit directly from a local folder,
use the portable folder distribution and START-HERE.md; no plugin/account installation is required.
Do not apply this native-registration preflight to folder-execution or claim a native pass from it.

# Agentic Design Kit — Cowork plugin setup

This is the same eleven-skill source as the Claude Code project package, installed as a plugin.
The two layouts are different; selecting a local folder does not establish native skill registration.
No root CLAUDE.md is included here: plugin-root CLAUDE.md is not loaded by Claude Code's plugin
loader. The pre-creative folder instructions below are a separate setup step.

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

## Install once, then test in a fresh session

1. In Claude Desktop's Customize / Plugins interface, use the custom-plugin upload/import option
   and choose the provided Cowork plugin ZIP. Labels can vary by app version. If upload is unavailable
   on your account, stop and report it; do not treat selecting the ZIP/folder as installation.
2. Enable `agentic-design-kit`. Confirm its eleven skills are listed under that plugin, including
   direction-study, ui-design-principles and distinctiveness-review. Disable conflicting external
   design skills for this isolated test in your Claude settings; a new conversation alone does not
   disable account skills. Do not delete personal skills or alter unrelated projects.
3. Select a new empty local output folder in Cowork. Set its **Folder instructions** to the supplied
   `COWORK-FOLDER-INSTRUCTIONS.txt`. This is a setup action, not an expanded creative prompt; it
   establishes kit-only routing before the agent chooses tools. Do not assume Code's `@` imports
   or the selected folder's `.claude/skills` are loaded automatically in Cowork.
4. Run a non-creative setup smoke check: ask the agent to activate the installed plugin's
   `agentic-design-kit:direction-study` only far enough to identify its resolved payload and
   available tools, without producing directions. Verify the actual native activation in the
   transcript. A pointer response must be followed and its payload authenticated; no completed-study
   claim is allowed. If that activation is unavailable, stop before the visual test.
5. Start a fresh task with the same installed plugin and folder instructions. Attach the actual
   reference screenshots, then use your normal broad request to use the kit for direction and review.
   You should not name every supporting skill. For a standalone web study with a connected folder
   and no existing app, use one local HTML/CSS proof per direction, a linking index and desktop/mobile
   screenshots under that folder. Native, requested Figma and existing-codebase work keep their
   appropriate format. No Claude Design, hosted Artifact or publication unless explicitly requested.

## Cowork session preflight — before creativity

Export/record the **actual native session state**, not a list inferred from files on disk, as
`cowork-session.json`. It has `runtime: "cowork"`, a real `session_id`,
`inventory: {source: "native-session", complete: true, evidence: "<native inventory locator>"}`,
`plugins` entries (`id`, `installed`, `enabled`, `evidence`), and `skills` entries (`registered_name`,
`owner`, `role`, `status`). Use the kit plugin ID `agentic-design-kit`; record all eleven native
qualified registrations and every active external design identity. Available-but-unused external
skills do not contaminate; loaded/invoked/completed external design skills do.

Record `entry` with its actual `registered_name`, `status: "invoked"`, `activation_evidence`,
`payload_verified: true` and `payload_evidence` referencing a real lock/authentication result.
A pointer response without payload verification/execution is not completion. Do not set fields to
their desired values merely to pass. Run in the actual Cowork runtime:

```bash
python3 <resolved-plugin-root>/scripts/cowork-session-preflight.py <cowork-session.json>
```

The native inventory must establish installed/enabled state and actual entry activation before
creative work. The checker validates those recorded prerequisites; it cannot query your account or
prove that a self-reported inventory is truthful. Audit the locators against the native skill list
and tool transcript. If the host cannot expose enough state, stop as unverified. A Code filesystem
preflight cannot certify this run. Final orchestration checks below remain separate.

## Verify runtime identity and checks

The plugin loader may copy/mount files into a runtime root different from the macOS folder. Have the
agent record that resolved plugin root and authenticate it against the shipped lock:

```bash
bash <resolved-plugin-root>/scripts/drift-check.sh
python3 <resolved-plugin-root>/scripts/check-plugin-package.py <resolved-plugin-root>
```

The identity includes the plugin namespace and the actual payload; a same-named external skill or
wrapper is not interchangeable. Retain native activation evidence, payload location, lock-check
results and completion artifacts. If the host's native activation uses file tools rather than a
Skill tool, use its real mechanism; an arbitrary file read alone is not an invocation.

Record every active external design skill and stop if one is active. This filesystem validator
cannot inspect account state or certify absence of loaded external guidance. Verify the native skill
inventory and transcript. The Code project's `acceptance-preflight.sh` is not a Cowork validator.

For the completed study, derive the receipt described by
`skills/direction-study/references/study-review.md`, setting `host: "cowork-plugin"`, then run:

```bash
python3 <resolved-plugin-root>/skills/direction-study/scripts/check-orchestration.py \
  <study-orchestration.json> --fixture <resolved-plugin-root> \
  --output-root <connected-project-root>
```

Inspect original references and rendered proofs directly. Reopen detailed rules when imagery,
overlay text or motion changes in a later round. A user-approved trait records intent; it is not
blanket clearance of defects. Detectors and UI scans support visual judgement after it is recorded.
Keep clipping, missing renders and unverified browser checks visible even with zero detector hits.

Browser availability is runtime-specific: having Chrome on the Mac does not imply it is usable
inside Cowork. Authenticate copied kit payloads and record where checks ran. If a required render or
review cannot run, report the study as incomplete instead of silently using another design surface.

## Validation boundary

The package can be checked offline and validated by Claude Code's plugin validator. Neither proves
that your Cowork account has installed/enabled it or that a model will follow it. Native Cowork
activation and the later visual study remain separate acceptance checks. No visual acceptance was
run while preparing this package. Do not claim both hosts have passed behavioral acceptance yet.

Official references, checked 2026-10-30:
[Use plugins in Claude](https://support.claude.com/en/articles/13837440-use-plugins-in-claude),
[Skill installation](https://support.claude.com/en/articles/12512180-use-skills-in-claude),
[Plugin manifest/layout](https://code.claude.com/docs/en/plugins-reference),
[Cowork folder instructions](https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork).
