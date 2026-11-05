# Working on agentic-design-kit

For a new page/app requested from the opened kit checkout/distribution, read START-HERE.md and
use scripts/create-project.py to create a separate project. Keep application output outside the
kit. An explicit destination or an existing application takes precedence; a project-local kit
with project-context.json belongs to its parent project and must not spawn another by default.
Kit maintenance and explicitly scoped kit examples remain work in this checkout.

Read CONTRIBUTING.md before editing skills or checkers. Preserve the requested scope and approved
creative intent. Keep substantial mode guidance in references loaded only when relevant.

Use focused failing fixtures before checker changes. Re-mirror the canonical rules.md and refresh
its ranges when edited. Regenerate skills-lock.json after skill changes and run the full gate with
a Chromium browser before producing a release. Do not treat skipped checks as passes or evaluation
definitions as executed model evaluations. Keep generated outputs and user projects out of source.
