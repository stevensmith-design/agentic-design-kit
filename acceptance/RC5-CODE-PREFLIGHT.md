# RC5 Claude Code project acceptance

Use this project package in Claude Code. For Cowork, use the separate plugin ZIP and its README;
selecting this folder does not register Cowork skills. Do not enable both installations in one test.
Account-installed plugins can sync into Claude Code, so check actual active identities.

A fresh isolated Desktop folder can be created from this package root:

```bash
bash scripts/prepare-acceptance-fixture.sh \
  /absolute/user/Desktop/design-skills-kit-v2-acceptance-rc5
cd /absolute/user/Desktop/design-skills-kit-v2-acceptance-rc5
bash scripts/check-package-wiring.sh "$PWD" 11
bash scripts/drift-check.sh
claude
```

If this folder has already been prepared, start with `cd`; the preparer deliberately refuses an
existing destination. Do not run a test from the development repository or dist directory.

Before creative work, verify all eleven kit project skills in `/skills` and check loaded external
design skills. Resolve conflicting registrations/settings before the test; a new conversation alone
does not disable account or personal skills. Maintain active-skills.tsv from actual native evidence,
including the two imported files as loaded and the successful direction-study Skill call as invoked.
Do not mark file reads as calls. Run:

```bash
bash scripts/acceptance-preflight.sh --profile v2 --phase before \
  --catalog active-skills.tsv --skill-root .claude/skills
```

Use the actual supplied reference screenshots and a natural prompt:

> I want to create a professional landing page for an AI workshop and education portal. I don’t
> have brand guidelines, but I’ve attached examples I like. Study them and first give me three design
> directions to choose from. Use the design skills in this kit for direction and review.

No internal skill names are needed in the creative prompt. For a standalone web study in the connected folder with no existing app, the default is one local
HTML/CSS proof per direction, a linking index and desktop/mobile rendered screenshots, all beneath
that folder. Existing-codebase, native and requested Figma work keep their appropriate formats. Do not ask for Claude Design unless testing an explicitly
requested alternative output. Save untouched first delivery, native transcript and separate reviews.
Derive study-orchestration.json from that transcript, then run both gates:

```bash
bash scripts/acceptance-preflight.sh --profile v2 --phase after \
  --catalog active-skills.tsv --skill-root .claude/skills
python3 .claude/skills/direction-study/scripts/check-orchestration.py \
  study-orchestration.json --fixture "$PWD" --output-root "$PWD"
bash scripts/drift-check.sh
```

Human rendered judgement remains primary. Audit actual native activation/origin, detailed rules for
new decisions, original reference access and visual judgement before detector/scan evidence.
A receipt can be fabricated; zero findings do not certify originality or reveal all hidden clipping.
Do not run final visual acceptance as part of packaging/repair. That test needs a fresh session.
