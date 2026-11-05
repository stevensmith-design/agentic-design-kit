# Installation and runtime modes

## Portable folder — no account installation

Extract the portable archive, give your agent access to the folder and ask it to read START-HERE.md
and use the kit for your task. Select the correct kit copy if other versions are available.

    python3 scripts/folder-preflight.py --root /absolute/path/to/agentic-design-kit
    bash scripts/drift-check.sh

These authenticate local files. The agent must still execute the workflows and produce their
required evidence. File execution does not imply native registration, plugin activation or host
isolation. This option is useful for isolated tests because it changes no account defaults.

New work requested from the opened kit is created in a separate project folder by default. Its
project-local kit copy remains available for ongoing work. To choose a new destination explicitly:

    python3 scripts/create-project.py --destination /absolute/new/workshop-site

For an existing app, work in that app and direct the agent to the kit; do not run the new-project
helper against an existing directory. The helper never replaces existing project instructions.

## Claude Code project package

Inspect the Code archive before copying it into an existing project. It contains AGENTS.md, CLAUDE.md and
`.claude/skills/`; preserve existing instructions and resolve conflicts rather than overwriting them.
Its @ paths are project-relative and must resolve to this package's exact SKILL.md files.

    bash scripts/check-package-wiring.sh /absolute/path/to/project 11
    bash scripts/drift-check.sh

Start a fresh Claude Code session in the project. Project skill names remain `/direction-study`,
`/design-build`, `/design-review` and the other names in README.md. Verify actual native resolution;
readable files alone are not activation evidence.

## Native plugin

Upload the plugin ZIP through Claude's custom plugin interface, or load its extracted directory
using the plugin options supported by your Claude Code version. Confirm the installed plugin is
`agentic-design-kit` and its eleven skills are available. Namespaced entry examples:

    /agentic-design-kit:direction-study
    /agentic-design-kit:design-review

Plugins can affect skill availability beyond one selected folder. Use the portable package when
you want no account installation. Do not leave two kit versions active during an isolated test.
The package validator authenticates the ZIP payload; verify native registration in the host too.

Current host documentation:
[Claude plugins](https://code.claude.com/docs/en/plugins) and
[plugins in Claude/Cowork](https://support.claude.com/en/articles/13837440-use-plugins-in-claude).
The kit does not claim a tested native install merely because its layout validates.
