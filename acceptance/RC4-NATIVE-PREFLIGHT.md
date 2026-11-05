# RC4 later visual acceptance — native macOS

Do not perform this visual run in the repair session. Use a fresh authenticated native Claude Code
session, opened only at the prepared outside consumer fixture. The fixture contains no previous
concepts, renders, experimental artifacts or development instructions.

## Terminal preflight

For the fixture prepared by this repair:

```bash
cd /private/tmp/design-skills-kit-v2-acceptance-rc4
bash scripts/check-package-wiring.sh "$PWD" 11
bash scripts/drift-check.sh
cat acceptance-fixture-receipt.tsv
claude --version
claude
```

The chosen temporary path is outside the development repository and is writable in the repair
session. It persists until macOS clears temporary files. To prepare a durable Desktop fixture,
start in the RC4 package root recorded in `acceptance-fixture-receipt.tsv` and run:

```bash
bash scripts/prepare-acceptance-fixture.sh \
  /absolute/user/Desktop/design-skills-kit-v2-acceptance-rc4
```

Then use that new root for all commands. Never use the development repository, any prior RC fixture,
or a package directory under dist as the visual-test working directory.

## Native session preflight

Open `/skills` in Claude Code. All eleven kit skills must resolve as **project** from this fixture's
`.claude/skills/<name>/SKILL.md`. Check `/context` and available tool details as needed. Skill tool
must be available to the agent and reviewers. Resolve personal/enterprise collisions in session
configuration before starting; `/name` does not guarantee project origin. Do not read or invoke a
global frontend-design or other external design producer/orchestrator/guardrail/reviewer.

Attach the actual five screenshots and use the natural prompt below. The agent maintains
`active-skills.tsv`: all eleven begin available; update only from actual session evidence, mark the
two exact imported files loaded, and record direction-study's native call as invoked after success.
Same-named external identities need separate rows. An available unused external skill is harmless;
a loaded or invoked external design skill invalidates the test. Do not mark supporting calls invoked
merely to pass preflight.

After the prompt selects its route and before concepts are generated, run:

```bash
bash scripts/acceptance-preflight.sh --profile v2 --phase before \
  --catalog active-skills.tsv --skill-root .claude/skills
```

Require `VALID — KIT-ONLY DESIGN SKILLS ACTIVE`; diagnostic-only or invalid results are not passes.
This before-phase requires direction-study loaded or invoked, exact always-on imports, valid origins
and lock, an isolated fixture receipt and inactive starter-directions. The subsequent native Skill
call is mandatory even if the file was already read. Let the orchestrator invoke supporting skills;
the user does not issue their commands individually.

## Natural prompt

> I want to create a professional landing page for an AI workshop and education portal. I don’t
> have brand guidelines, but I’ve attached examples I like. Study them and first give me three design
> directions to choose from. Use the design skills in this kit for direction and review.

## After untouched first delivery

Preserve the native tool transcript, initial proofs/renders and separate review reports. Update the
identity inventory from actual calls. Derive `study-orchestration.json` from the transcript using
`.claude/skills/direction-study/references/study-review.md`, then run **both** gates:

```bash
bash scripts/acceptance-preflight.sh --profile v2 --phase after \
  --catalog active-skills.tsv --skill-root .claude/skills
python3 .claude/skills/direction-study/scripts/check-orchestration.py \
  study-orchestration.json --fixture "$PWD"
bash scripts/drift-check.sh
```

The identity preflight alone does not check supporting orchestration; the receipt checker is also
required. Verify evidence locators against the actual transcript, especially native invocations,
packaged origins, detailed rule sections and first visual judgement before detector/scan evidence.
Use the system Chrome if needed:

```bash
export CHROME_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
```

Judge the rendered output yourself: brief specificity, reference influence, imitation, genericness
and mechanical defects. Keep those judgements separate. A green receipt does not certify taste.
Do not invite repairs before saving the untouched first delivery. No public release or tag is needed.
