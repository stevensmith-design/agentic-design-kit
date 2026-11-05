# Local workflows, native activation and identity

This protocol supports local folder execution and two native installations of the same eleven skills. It adds no aesthetic input and
never loads all skill bodies by default. Skill names in instructions are logical names; resolve them
through the selected installation before each handoff.

## Select the execution mode first

When directed to a folder containing the kit, resolve its actual local root and discover entrypoints
there. Do not search personal/global folders for same-named design skills. Ordinary file access is
enough for folder execution; no account installation is required. Use
`<kit-root>/scripts/folder-preflight.py --root <kit-root>` when supplied to verify/discover the local
payload. It supports `skills/` and `.claude/skills/`, uses the local lock, and prints paths rather
than preloading all skill bodies. Relocation changes the root, not the workflow.

If the person requests folder-only execution, use **folder-execution** even if native skills are
available. Otherwise, use a verified native registration when available; if local files are available
but registration is not, execute the same workflows directly and report folder-execution. An explicit
native-integration acceptance test must not silently switch modes and claim a native pass.

In folder mode, `/name` is the logical workflow at the discovered local `<name>/SKILL.md`, not a
shell command or a request to invoke a same-named account skill. Select it, read its instructions and
necessary references, then actually execute its scoped steps, scripts, renders/reviews and handoffs.
A file read alone is only loading. Give delegated reviewers the same root and exact local paths and
have them execute their assigned workflows independently. Never replace unavailable delegation with
a claimed fresh-context review. Missing required work remains incomplete; no positive recommendation.

Record **executed** with source-read and workflow-action/artifact evidence, and **completed** only
when the scoped work finishes. Do not record native invocation for direct file execution. The same
proof-time principles, detailed rules, independent distinctiveness review, detector ordering and
human decision boundaries apply. No additional creative or production-system gates are introduced.

For an isolated folder test, use only design workflows within the selected kit root. Do not install,
enable, load or invoke an external design skill. An already-active external design workflow makes
the run invalid; available-but-unused skills do not. Filesystem checks cannot prove absence of hidden
loaded guidance: disclose unavailable host evidence rather than claiming isolation. Runtime/copy
paths and script results stay explicit. Ordinary coding, image generation and rendering tools are
allowed; they must not introduce an outside design workflow or aesthetic source.

## Claude Code project

Discover `.claude/skills/<name>/SKILL.md`. `/name` means invoke Claude Code's Skill tool with
`skill: "name"` and optional `args` (for example `args: "study-proof"`). This is not a shell command.
Verify the tool's resolved origin: personal/enterprise skills can shadow project names. If identity
is ambiguous or external, stop that phase. Never invent an absolute-path Skill argument.

## Cowork plugin

Install the provided `agentic-design-kit` plugin once through Claude's custom-plugin interface.
Selecting a folder grants file access; it does not certify skill registration. The plugin ships
`skills/<name>/SKILL.md` and a lock containing the same source bytes as the Code project package.
Verify the native available-skill listing includes `agentic-design-kit:<name>` and resolves inside
this installed plugin. Invoke that registered identity through the host's native mechanism. If the
host exposes Skill, use the qualified name; if native activation loads the registered SKILL.md via
file tools, retain the native selection/activation evidence and execute its workflow. An arbitrary
file read is not activation. Do not invent a Skill tool where none exists.

If invocation returns only a pointer, it has not completed the workflow. Follow the pointer only
when the actual payload matches this plugin's packaged lock and belongs to this installation;
record both the activation and payload paths. An external same-named wrapper is not a substitute.
If registration, payload identity or activation cannot be verified, report the missing integration
and stop before creative work. Never compensate with a global design producer or a Design canvas.

For every supporting handoff, resolve the same qualified plugin identity, including in independent
reviewer contexts. Do not assume that bare `/name` selects the plugin. The setup smoke test is one
explicit qualified invocation without generating designs; normal work then uses broad user language.
Cowork folder instructions in the installation guide establish the pre-creative kit-only check.

## State and evidence (all modes)

| State | Evidence |
|---|---|
| available | native discovery or local inventory lists the actual source identity |
| loaded | file read/imported, including `@` imports; this alone is insufficient |
| selected | agent assigned it to this phase |
| invoked | native activation of the verified packaged identity succeeded |
| executed | folder-selected source workflow actually ran; retain actions/artifacts, not just reads |
| completed | activated/executed workflow finished with required artifacts/check results |

The user should not name every internal skill. Orchestrators activate or execute supporting
capabilities in the selected mode when their phase arrives. A delegated reviewer needs the same native skill access; attaching a file alone
is not invocation. Missing required activation/execution or review means no positive study recommendation;
production retains DRAFT/REVIEWED fallbacks. Record transcript locators, not desired state labels.
Independent reviewers receive original inputs, not builder preferences or other conclusions.

Cowork may expose a copied/mounted runtime root rather than the macOS path. Authenticate the actual
root against the shipped lock; record the mapping and tool results. A host browser installed on
macOS does not establish browser availability inside Cowork. Name the runtime where each render,
scan or detector ran. Copied kit files must match the lock; never omit unverified browser results.

Documented interfaces checked 2026-10-30:
[Code skills](https://code.claude.com/docs/en/skills),
[Claude plugins](https://support.claude.com/en/articles/13837440-use-plugins-in-claude).
Static packaging and receipts cannot certify native activation, model compliance or visual quality.
