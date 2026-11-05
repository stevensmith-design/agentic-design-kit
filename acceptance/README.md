Current candidate: use [RC5-CODE-PREFLIGHT.md](RC5-CODE-PREFLIGHT.md) for Claude Code.
Cowork uses the separate installed plugin and its README; this project's preflight does not certify
Cowork registration. RC4 instructions below remain historical context.

For RC4, follow [RC4-NATIVE-PREFLIGHT.md](RC4-NATIVE-PREFLIGHT.md). Its after-delivery
orchestration receipt gate is required in addition to the identity preflight below.

# Acceptance environment preflight

Never run an acceptance session in the release directory under `v2/dist`. First use the packaged
preparer to copy only consumer files to a new directory outside the Design Skills Kit repository:

```bash
bash scripts/prepare-acceptance-fixture.sh \
  /absolute/user/Desktop/design-skills-kit-v2-acceptance-rc4
cd /absolute/user/Desktop/design-skills-kit-v2-acceptance-rc4
```

The preparer refuses an existing destination, any destination inside the development repository,
an inherited Git root and ancestor project instructions. It verifies the package wiring and writes
`acceptance-fixture-receipt.tsv`. Start the fresh model session only from the resulting directory.

Before a visual acceptance session generates concepts, record every available, loaded or invoked
design skill in `active-skills.tsv`. Use one row per identity, including same-named skills from
different origins. The required columns are:

```text
name  status  role  resolved_absolute_origin  ownership
```

`status` is `available`, `loaded` or `invoked`; `ownership` is `packaged` or `external`. Origins
must be absolute, real paths to the exact `SKILL.md`. Available-but-unused external skills do not
contaminate a run. Loaded or invoked external design producers, orchestrators, guardrails or
reviewers do. Browser, rendering and ordinary coding tools need not be listed as design skills.

Run the preflight after the natural design prompt has selected its skills but before any concept is
generated:

```bash
bash scripts/acceptance-preflight.sh \
  --profile v2 --phase before \
  --catalog active-skills.tsv \
  --skill-root .claude/skills
```

The before-phase prints `VALID — KIT-ONLY DESIGN SKILLS ACTIVE` only after it authenticates the
isolation receipt, ancestor environment, exact always-on files, skill origins, packaged lock,
`direction-study` readiness and an unused `starter-directions`. If evidence is absent it returns a
specific `DIAGNOSTIC ONLY` result; if evidence is contradictory it returns `INVALID`. If any
external design producer, orchestrator, guardrail or reviewer is loaded or invoked, it prints
`INVALID — EXTERNAL DESIGN SKILL ACTIVE` and the session stops. In particular, `frontend-design`
is never a dependency, collaborator or fallback for this kit.

After the untouched first delivery, update each used kit skill to `invoked` and run the same command
with `--phase after`. V2 requires `direction-study` to have been invoked. A V1 comparison uses
`--profile v1`; it is valid only when the packaged `hallmark` and `impeccable` skills both resolve
inside the V1 fixture and are recorded as invoked. A fallback to any global design skill invalidates
the baseline.

The catalog is an execution receipt, not a creative instruction. It does not add a style, theme or
constraint to the work.
