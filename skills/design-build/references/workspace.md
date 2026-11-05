# Choose the project workspace before writing project files

Use an explicit project/output destination when the person supplies one. Work in an existing
application's root for additions, reviews and refinements. Do not create a new project merely
because the existing app contains or references this kit. Kit maintenance, examples or tests
explicitly requested inside the kit remain scoped kit work.

When the person opens the kit checkout/distribution itself and asks for a new page, app or design
project, keep the kit as a tool dependency and create a separate project. Pick a descriptive name
from the brief and announce the resulting path. The helper defaults beside the kit's repository
boundary, uses a numeric suffix for an existing name, and never overwrites another project:

    python3 <kit-root>/scripts/create-project.py --name <project-name>

For a supplied new destination, use --destination /absolute/new/project instead. A host-managed
plugin/cache is not a projects directory: use the host's real project workspace or an explicit
accessible destination. If the host cannot write outside the selected kit folder, ask for access
or a project location instead of silently putting the app inside the kit. Respect host access limits.

The helper pins the complete authenticated kit in .agentic-design-kit/ and creates project-local
AGENTS.md and CLAUDE.md pointers. All eleven workflows stay available for later builds, reviews,
refinement, brand/system work and drift checks; file availability does not preload every body or
register native skills. Use the returned project_root as the working directory for subsequent file/build/render tools;
creating a folder does not change the caller's working directory. Use the returned kit_root for
workflow handoffs. Continue from this project copy in folder-execution mode. Keep app files,
assets, proofs, renders and BRAND.md / DESIGN.md / tokens.json in the project, outside its kit copy.

Inside a project-local copy, project-context.json records project_root as "..". Treat that parent
as the existing project root; do not recursively create another project during normal iteration.
Keep the pinned kit out of application compilation/test discovery and deployed assets, while
retaining it in project version control. For a scaffolder requiring an empty directory, stage the
application separately and merge its files without replacing the kit or agent contexts.
The contexts use relative paths and remain valid after moving the project. Respect a person's
explicit preference to reference an external kit instead of pinning a copy. Selective copies must
not masquerade as a complete locked kit; use a complete snapshot for the supported local setup.
