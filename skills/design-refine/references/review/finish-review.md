# Finish review — a fresh context checks the edit pass

Read-only. Called by the edit lane after the last edit of a pass; never part of the review lane's
own scoring. The editor does not grade its own work: a context that made the change reads its own
screenshots as proof. The finish reviewer is a **separate subagent** that did not make the edit and
judges the evidence it is handed, so bad evidence has to be caught first. Where it has a browser it
may render the targets itself as further evidence; it still validates what it was handed.

## What the reviewer is given

The approved plan (in the edit report or at the top of the diff — say where); the diff; and the
captures — before and after, each labelled with target, path,
viewport width, theme, state and the time it was taken. Plus the `findings.mjs` and `scan.sh`
output from after the last edit, and the before/after source manifests that bind all evidence to the
same artifact bytes. No summary of how the edit went: that is a claim, not evidence.

Preflight the handoff: every named plan, diff, artifact, capture, manifest and floor path exists and
is readable. Missing promised inputs make the evidence invalid. Compare the sealed manifest to the
changed-file inventory; an omitted changed artifact/spec/build-record file is not covered evidence.

## 1 · Validate the evidence first

For every capture: it exists; it is not blank, a loader, an error page or a consent wall; its
label matches what it shows (width, state, the right page); it was taken **after** the last edit;
each plan item and each state the plan touched has one. The floor output is also from after the
last edit. Recompute the source manifest: it matches both handed manifests, and detector excerpts
match the current DOM. A timestamp alone is insufficient.

Treat verification scripts as evidence, not authority. Unsupported browser/protocol calls, ignored
exceptions, CSS `zoom` standing in for browser zoom, unexplained hidden `0×0` targets, or a URL test
that never leaves and restores state invalidate that claim. Confirm refresh, copied-URL fresh-context
and new-tab re-entry when addressability was repaired. Rendered contrast without a rendered measure
remains UNVERIFIED. Check the final implementation against applicable local system/spec text so a
repair cannot silently leave the contract describing the pre-repair choice.

A fresh browser context/new tab has a distinct recorded target/context ID. Check assertions against
what they claim (`document.title` for the browser title; a named selector for a record heading).
Token drift validation receives the final CSS/theme path; an omitted implementation cannot turn the
check into an acceptable SKIP. Exercise visible actions after seeded persistence in each preview
state, measure every visible control against the project minimum, and compare local system values
back to the frozen direction.

Any capture that fails → the disposition is **recapture**, naming each one and why. Do not judge
the work on evidence that does not show it.

## 2 · Then judge

With valid evidence: is every plan item done, and only those? Did anything regress — a state, a
width, a contrast pair, a sibling the plan named? Did the edit stay inside the system and the
approved scope? Was any content invented (a price, a customer, a benchmark), or demo data left
unlabelled?

| Disposition | When |
| --- | --- |
| **ship** | every plan item is done, nothing regressed, nothing outside scope changed |
| **fix** | specific, local defects remain — list each one with `file:line` or the capture that shows it |
| **rebuild** | the approach does not meet the plan's goal; say why, and hand back to the person |
| **recapture** | the evidence is invalid or missing; name the captures |

One disposition per plan item when they differ (an item done, another stopped and reverted); the
pass
ends when no item is `fix` or `recapture`. `ship` ends the edit pass. It is not READY — only
`/design-review` declares readiness.

## Report

```markdown
## design-refine · finish review · <target>

Evidence: <valid | invalid — capture, reason>
Disposition: <ship | fix | rebuild | recapture>

- <item> — <file:line or capture>     ← one per fix item, recapture item or rebuild reason
```
