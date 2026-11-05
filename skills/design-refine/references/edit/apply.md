# Apply — the edit protocol every family follows

**Precondition: an unlocked run and an approved plan.** A locked run never opens this file; if it
has, stop and report the plan instead. No plan yet: go back to the review lane and make one.

## 1 · Hold the scope

Change exactly what the approved plan lists — its files, call sites and siblings. Something new
that needs fixing goes in the report as a proposal, not into this pass. A plan item that turns out
to be wrong is a stop: say what you found and ask. A file another surface also uses (a shared
stylesheet or component) is in scope only when the plan names it.

## 2 · System first

Read `DESIGN.md`, the tokens and the components in use before the first edit. Reuse what exists;
a second implementation of an existing component is the defect this kit cares most about. **Never
edit the contract:** a needed token or rule change is a stop, recorded for the person, not a
workaround with a literal.

## 3 · Evidence on hand

Use only content that exists. Never invent a price, a customer, a logo, a testimonial, a metric or a
benchmark; an empty slot stays visibly empty, or is named in the report. Demo data the person
asked for is labelled as demo data where it renders.

## 4 · Apply

In the plan's order, smallest change that does the job, through tokens and shared components. The
family file for the verb says what to watch for while editing.

## 5 · Verify — you have not finished until you have looked

Render what changed: desktop and 375px, light and dark where the system has both, and every state
the plan touched. Then re-run the floor on the changed files — `findings.mjs`, `scan.sh`, and the
token validator when tokens are involved. **The floor that counts is the one after the last
edit;** an earlier run describes a file that no longer exists.

Seal the evidence against the artifact it describes. After the last edit, hash every implementation
and applicable local system/spec file into a source manifest; run the renders, interaction checks
and whole floor; then hash the same files again. Both manifests must match byte for byte, and every
evidence record names that manifest. A later edit invalidates the evidence: discard it and rerun,
never patch the timestamp or quote an earlier detector excerpt.

Start from a changed-file inventory, not a guessed allowlist. Include every file changed by the
repair that affects or records the artifact, including artifact-local `.design-build` records, in the
sealed manifest. Evidence outputs that cannot hash themselves are named separately as generated
after the sealed inputs. Before handoff, write a path inventory and prove every promised plan, diff,
artifact, capture, manifest and floor path exists and is readable.

Verification fails closed. Do not ignore browser/protocol exceptions or call an API without proving
it exists and changed state. Back/Forward evidence must leave the state and restore it through a
supported browser-history operation; URL re-entry must prove refresh, copied URL in a fresh context
and new-tab restoration. For 200% zoom/reflow use browser-native zoom or a documented half-width
CSS-viewport equivalent—never `body.style.zoom`—and record the method. Measure rendered contrast
or preserve UNVERIFIED. Target receipts measure visible controls at the critical widths and zoom,
and explicitly exclude hidden controls rather than recording unexplained `0×0` targets.

“Fresh context” and “new tab” mean a distinct browser context/target, not another navigation in the
same page; record both source and destination IDs. Name each assertion precisely: `document.title`
is not a heading selector, and a record-title check names its selector. Pass the final CSS/theme path
to token drift validation so drift cannot become SKIP merely because implementation was omitted.

Finish with a contract-drift sweep. When a repair changes an implementation choice described by an
artifact-local `DESIGN.md`, token or component spec, update that in-scope local document in the same
pass or revert the implementation. Compare all three to the frozen direction as well; repair may not
silently replace a committed duration or behavior. A shared contract still requires separate authorization.

## 6 · Finish review

Hand the plan, the diff, the labelled captures, matching source manifest and floor output to a fresh subagent following
`../review/finish-review.md`. Then:

- **ship** — the pass ends; report.
- **fix** — one more pass on the listed items only, re-verify, one more finish review. Still not
  ship after that: report what remains and stop.
- **rebuild** — stop and hand back to the person with the reviewer's reason.
- **recapture** — retake the named captures, then review again. It does not count as a pass.

No subagents available: say so at the top of the report — the edit was checked by the context that
made it, which is the weaker check.

## 7 · Report

What changed (`file:line`), how each item was confirmed, the floor result after the last edit, the
finish disposition, and every stop or proposal left for the person.
