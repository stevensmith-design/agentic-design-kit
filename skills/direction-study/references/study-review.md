# Proof reviews and orchestration evidence

## Early feedback checkpoint

For an initial choice of direction, show the smallest useful rendered samples before commissioning
full reviews, unless the person requested a reviewed comparison immediately. Keep the proof-time
rules and local output contract: actual originals, minimal contracts, local HTML where applicable,
and desktop/mobile inspection. Check visual fidelity against the originals, basic text contrast,
legibility, clipping and asset honesty. Present the source, what is preserved/adapted, departures
and limitations alongside each sample. This is builder inspection, not independent clearance.

Label the checkpoint **STUDY PREVIEW — FEEDBACK REQUIRED** with reviews pending. Offer no positive
recommendation, scores or readiness claim. Ask which style interpretation to carry forward or
correct. A preference is provisional; no full `design-review`, production stamp or token-system
work is needed to solicit that feedback. Preserve earlier versions. Don't endlessly rerun reviews
on options the person is still shaping.

When the person requests a completed comparison or confirms candidates for further study, run the
reviews below on every candidate included in that comparison. Keep discarded preview paths and
human decisions in a short history; they are not reviewed candidates. A preview does not satisfy
`check-orchestration.py` and must not be submitted as a completed acceptance receipt. Missing reviews
remain pending, never passes. If a person explicitly selects a preview for production, disclose and
complete its outstanding study reviews before handing it to production.

## Completed comparison reviews

After rendering, review each proof in the completed comparison independently from the builder.
Prefer a fresh reviewer context per lens; delegate through a Skill-capable agent and have it invoke packaged
`/distinctiveness-review`. Include only the original brief, supplied reference images, provisional
contract, actual content/assets, rendered proof and implementation access. Exclude builder
preferences, scores and other reviewers' conclusions. Use the two-stage reference handoff in `similarity-review.md`: original brief, originals and
human answers first; save observed traits before revealing contracts and builder notes. A fresh context may cover several proofs if each receives its own report and findings.

If fresh contexts are unavailable, explicitly report degraded isolation and run separate unprimed
passes before reading other conclusions. If the context already contains builder preference or
other review conclusions, mark independent review unavailable; request a fresh reviewer. Do not
claim independence through a role label in a primed context. Missing required review blocks a
positive recommendation. Report mechanical checks that cannot run as unverified, never as passes.

The distinctiveness reviewer inspects each render and saves its first visual judgement before
running/reading detector and relevant read-only UI scan evidence. Use the packaged
`ui-design-review/scripts/detect/findings.mjs --json <target>` and `ui-design-review/scripts/scan.sh
<target>` after that inspection. These identify patterns and mechanical defects, not an aesthetic.
Apply the lens's existing report validator as well. The reference review separately reports both
resonance and excessive similarity; neither clears genericness. Keep all four axes visible.

Before comparison, every proof needs the reference report, distinctiveness report, first visual
judgement and detector/scan results with warnings and unassessed states. Confirmed genericness or
obvious AI-default construction cannot be recommended. Preserve failed versions; any exploration
rerun starts from the original premise and repeats render and reviews on a new version. No edits
occur inside read-only review. Reject-all and no recommendation are valid.

## Acceptance receipt

During a completed visual acceptance run (not an early preview), save `study-orchestration.json`
after exploration, derived from the native tool transcript and artifact paths, using the event schema in
`../tests/fixtures/orchestration/pass-two-directions.json`. This fixture is synthetic test data,
not visual evidence. Do not create forms before exploration to generate an aesthetic.

The receipt has `route` and an ordered `events` array. Each event has an `evidence` locator into
the real tool transcript or artifact. `invoke` records carry `skill`, package-relative `origin`,
`mechanism: "Skill"`, and (for proof-specific calls) `direction`. Origins are relative to the
consumer root; the active skill inventory supplies the absolute resolved path and lock validation.
Record actual tool resolution, not a desired origin copied from this guide.

Study events: invoke direction-study → references-viewed (original paths) → reference-intake →
directions-developed →
divergence-checked. Per direction: contract → invoke ui-design-principles (`mode: "study-proof"`)
→ rules-index → rules-section (`decision`, detailed `section`) → proof-built (`decisions` used,
`originals_visible`) → render-inspected (`render`) → invoke distinctiveness-review (`context`,
`independent`, raw `inputs`, `builder_preference: false`, `other_conclusions: false`) →
visual-judgement (`context`, `report`) → detector and ui-scan (`context`, `result`) →
distinctiveness-completed (`context`, `report`, `genericness: clear|confirmed|unassessed`).
Also record reference-review (`report`, separate `resonance`, `similarity`) after rendering.
For reference routes, `reference-intake` records `closeness: loose|rearranged|close`,
`decision_evidence`, `approval_date`, `traits` keyed by original path (3–5 observations each),
`trait_decisions` (trait, approved|declined|qualified|none-gated decision, actual evidence),
with fuller observations in linked per-source visual guides; the 3–5 traits are summaries, not a
limit on extraction. The person's existing concrete style preference can supply closeness evidence;
use the mapping in `reference-study.md` rather than asking the same question in internal terminology.
Also record
`image_permission` and `image_permission_evidence`. Each proof records `asset_plan_evidence` and
`imagery_status`. Each reference review records `blind_first: true`, `observation_report`,
`contract_after_observation: true`, `lead_reference`, and `structural_changes` (at least two).
Explicit close recreation instead cites `close_recreation_permission`. These are evidence of
actual actions and answers, never values to invent to satisfy a checker.

Then compare (`directions`, `recommended` IDs or empty list, `axes` exactly reference-resonance,
similarity, genericness, mechanical-quality), plus `reference_coverage` mapping each original to
contributing direction IDs or `omission_approvals` mapping an unused original to the human answer,
then stop (`state: "STUDY — DECISION REQUIRED"`).
For conditional IA calls add `material_unresolved_structure` explaining why IA is needed. A rerun
uses new version IDs, retains old versions in comparison/evidence and never recommends a failed one.

From the consumer root, run:

```bash
python3 .claude/skills/direction-study/scripts/check-orchestration.py \
  study-orchestration.json --fixture "$PWD"
```

The checker rejects missing discovery answers, coverage/image plans, blind-first observations,
structural changes, calls, wrong origins, uncovered proofs, index-only reads, detector-first
review and positive recommendations for confirmed/unassessed genericness. It measures receipt
shape/order, not truth. Audit locators, calls, origins and section reads against the actual transcript;
a fabricated receipt can pass. Rendered originality and resonance remain human judgements.

## Host and output evidence

The default receipt host is `claude-code-project`. A Cowork plugin receipt sets
`host: "cowork-plugin"`; invocation origins are relative to the authenticated plugin root as
`skills/<name>/SKILL.md`. Each call records `registered_name: "agentic-design-kit:<name>"`,
`mechanism: "Skill"` or `"registered-skill"`, and a real `activation_evidence` transcript locator.
A native pointer response alone is not workflow completion. See the shared invocation protocol for
pointer/payload authentication and runtime path mapping. Before checking a Cowork receipt, verify
that installed plugin root with `scripts/drift-check.sh`; pass it as `--fixture` to the checker.
The Code-only identity preflight does not certify Cowork registration or contamination status.

The receipt `output` object records `target` (standalone-web, existing-web, native or figma),
`connected_folder`, `existing_app` and `mode`. For standalone-web with a connected folder and no
existing app, `mode: "default"` requires a local HTML `index`. Every `proof-built` records
`format: "html"`, a project-relative `.html` `artifact` and `output_choice: "default"`; each
`render-inspected` records `views: {desktop: "<local screenshot>", mobile: "<local screenshot>"}`.
The index links to each proof. Keep CSS/assets local too. Paths stay beneath the connected folder.
Use `--output-root <connected-project-root>` to verify the recorded files exist there. A requested
alternative sets output `mode: "explicit-user-request"` with `user_request_evidence`, plus the same
explicit choice/evidence on each proof. Existing-web, native and requested Figma work retain their
own format. This is an output contract, not a full-page or aesthetic requirement.
New imagery, overlay text and motion decisions in a later round require their detailed rule sections
again. A zero detector count never clears hidden clipping or a visual judgement. Record the runtime
used for each check, including unverified browser availability, rather than saying the user's Mac
has no browser without checking. Rendered inspection remains mandatory.

## Folder-execution evidence

For a local-folder run set `host: "folder-execution"`, `runtime` to the actual host (for example
cowork), and `skill_root` to the discovered relative layout (`skills` or `.claude/skills`). Replace
native `invoke` events with `execute` events, retaining logical `skill`, local `origin` and scoped
`direction` where needed. Set `mechanism: "folder-workflow"`, `source_evidence` to the actual local
instruction-read locator and `execution_evidence` to the workflow actions/artifacts. A read-only
entry, missing execution evidence, external origin or native-activation claim fails this mode.
`../tests/fixtures/orchestration/pass-folder-execution.json` illustrates the schema with synthetic
data; it is not an execution record. The proof and review sequence is identical to native mode.
Use `--fixture <actual-kit-root>` and `--output-root <connected-project-root>` for local file checks.
A completed folder run tests workflow/design behavior, not native registration or plugin discovery.
The local payload preflight cannot prove that outside guidance was never loaded; audit the actual
host/tool record and disclose unassessed isolation. Do not fabricate missing native metadata.
