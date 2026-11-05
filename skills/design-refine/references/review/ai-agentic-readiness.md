# AI and agentic surfaces — the production-readiness lens

Read-only. **Conditional. Read this only when the product's core interaction is a model producing
output or an agent acting on the user's behalf.** A product that merely has AI somewhere inside it
is reviewed normally; say so in the coverage record and skip this file.

**This is one of three lenses on the same domain, and it is deliberately not the others.**
`ui-design-review/references/visual-checklist.md` § 7b asks whether the distinction survives the
rendered pixels. `distinctiveness-review/references/gates.md` → *AI products* asks whether the
product has a design of its own or the category template. This file asks the whole-product
question: **does the product survive the model failing, the run being interrupted, and the second
user arriving?** Findings from the three are expected to differ. Reconciliation groups
duplicates and preserves disagreement; it does not pick a winner.

The rules are in `ui-design-principles/references/rules.md` → *AI and agentic interfaces* and
*Behaviour, states and recovery*. This file does not restate them — it is the coverage discipline
that decides whether a package-level sign-off is honest.

---

## Why this is a whole-app concern, not a screen concern

Every failure worth catching here spans surfaces. A run starts on one screen, produces work that
lands on another, and is reviewed on a third; the state that decides whether the product is
trustworthy lives between them. A per-screen review can pass every screen and miss all of it —
which is the same failure mode `whole-app-coverage.md` exists for, in a domain where the cost is
higher because the system acted on the user's behalf while they were not watching.

---

## Required coverage — no AI/agentic PASS while any item is unassessed

Mark anything not rendered, not reachable, or not reproducible as `[Not assessable]`. Missing
evidence caps the verdict; it never rounds up.

### 1. The six model-failure families are each reachable and each distinct

Incorrect output · no result · refusal · low quality · tool-or-action failure · unavailable
evidence. Name the screen and the trigger for each one you reached. Any family that renders the same
copy as another, or as a generic message, is a finding. Any family you could not reach is
`[Not assessable]`, not a pass — *"the code has an error boundary"* is not coverage.

### 2. Interruption leaves the system in a defined state

Stop mid-run and record what happens to the work: kept, discarded, or offered as a draft — and
whether the product says which. Then check the harder half: **partial effects.** If the run had
already written three of eight files, sent one of four messages, or committed half a change set,
what is the user shown, and can they finish or reverse it? An agent whose stop button only hides the
output is a defect that no screen review sees.

### 3. Failure mid-run hands control back with the work intact

Distinct from the user stopping it. A tool error, a timeout, a quota exhaustion, or an unavailable
model part-way through a plan. Record where the user lands, whether the completed steps survive, and
whether resuming is possible or the only path is to start over.

### 4. Cost, quota and rate limits are designed states

Production reality that the rules do not name and that almost no generated product has: what the
user sees when they are out of credit, throttled, or mid-run when the limit lands. A 429 rendered as
"Something went wrong" is the same defect as an undesigned refusal, and it is the one users hit
most.

### 5. Concurrency and staleness

Two runs at once; a run still going when the user navigates away or closes the tab; a result
arriving after the user has moved on or changed the input it was computed from. Record what the
product does with the late result — applies it silently, discards it silently, or surfaces it. A
silent apply is a data-integrity finding, not a polish one.

### 6. Permission scope is visible and its escalation path exists

The rules require the scope to be stated. The production question is what happens at the boundary:
is there a real escalation path, does refusing it leave the task in a usable state, and can the user
see after the fact what was actually touched. Check this against a real run, not against settings
copy.

### 7. Provenance survives the session

What the agent did, on what evidence, is retrievable later — by the user who ran it and by whoever
inherits the result. If the run log lives only in the tab, the product cannot answer "why is this
file like this" tomorrow. Name where the record lives and how long it lasts.

### 8. Reviewability at production scale

The plan and the diff must hold up at the size this product actually produces, not at demo size. A
thirty-step plan, a forty-file diff, a two-thousand-line change. Record the largest artifact you
were able to render and whether per-item accept/reject remained usable at that size. A review UI
that works at three items and collapses at thirty is a finding.

### 9. Streaming output reaches assistive technology

Arriving content is announced through a live region or a deliberate focus move, and a long stream
does not announce itself continuously into uselessness. Stop, regenerate and per-item accept/reject
are keyboard-reachable while the run is in flight. This is the one item in this file that a
screen-level a11y pass often misses, because it only exists mid-stream.

### 10. Degradation is designed, not incidental

Model unavailable, tool unavailable, evidence unavailable, network degraded. Record what the product
becomes in each case — a labelled reduced mode, or a dead screen. The whole-app question is whether
the *rest* of the product stays usable when the model half is not.

---

## Verdict rule

An AI/agentic **PASS** requires items 1–10 assessed and no material cross-surface incoherence in how
runs, results and failures are represented. State the real coverage — which failure families were
reached, which were simulated, which were `[Not assessable]` — so no reader mistakes a happy-path
demo for a production review.

**The hard boundary still applies.** Reaching several of these reliably needs fault injection, a
seeded failure harness, or a long-running-job fixture. This skill may inspect the evidence available
and refuse sign-off; it must not imply it ran automation it did not. When an item needs the harness,
name it as the next step and mark the item `[Not assessable]` — see `whole-app-coverage.md` § 3.
