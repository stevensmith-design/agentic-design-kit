# AI and agentic features — build-time gates

**Read this at Step 1 when the feature being built has a model or an agent at the centre of its core
interaction.** Skip it for a product that merely has AI somewhere inside it — that is a normal build,
and saying so in one clause is the correct handling.

Two gates, in order: **does a model add value here at all**, and **where on the autonomy spectrum
does this task sit**. Neither is answerable from the aesthetic, and both bind what gets built.

**First, the value gate — does AI add value here at all?** Run it before designing the interaction,
and run it per *feature*, not per product. A model is the right mechanism when the input is open-
ended, the space of valid answers is large, and an approximately-right answer is useful. It is the
wrong mechanism when **predictability**, **transparency** or **direct control** matter more than
coverage — and in that case a deterministic rule, a filter, a template, a sensible default, or
leaving the user to do it is the better design, not the lesser one. Three checks:

- **Would a deterministic version be right more often?** Sorting, validation, routing by explicit
  criteria, and anything with a correct answer usually have one. A model here trades a right answer
  for a plausible one.
- **Can the user tell when it is wrong, cheaply?** If verifying the output costs about as much as
  doing the task, the feature has moved work rather than removed it.
- **Does non-determinism break something the user relies on?** A result that changes between
  identical runs is a defect in anything the user compares, audits, cites, or repeats.

Write the answer down even when it is yes. *"Model, because the input is free-text and an
approximate answer is useful; the user can see the source in one click"* is a design decision.
Reaching for a model because the product is an AI product is the same failure as reaching for a
gradient because it is a landing page.

**Then, autonomy as a spectrum, not a switch.** "Manual versus autonomous" is a false pair, and
designing at one of its ends is what produces either a useless assistant or an unsupervisable one.
Place *each* task on the spectrum deliberately, and say why it sits there:

| Level | The system… | The human… |
|---|---|---|
| **Manual** | offers nothing | does the work |
| **Suggests** | proposes; nothing changes until accepted | accepts, edits, or ignores |
| **Drafts** | produces a complete artifact, unapplied | reviews and commits |
| **Acts with approval** | plans and executes, pausing at named checkpoints | approves each checkpoint |
| **Acts and reports** | completes the task, then presents what it did, reversibly | audits after the fact |
| **Acts silently** | completes without surfacing anything | is not involved |

Two rules govern the placement. **Consequence and reversibility set the ceiling** — nothing on the
Human-control list above may sit past *Acts with approval*, and anything irreversible stops at
*Drafts*. And **the level is earned, not assumed**: a product may move a task up the spectrum as
evidence accumulates, but it starts lower, moves one level at a time, and the move is visible to the
user rather than a silent change in behaviour. A single control that flips a whole product between
"off" and "autonomous" is the anti-pattern this replaces.

If the product's core interaction is a model or an agent, also read `references/rules.md` →
**AI and agentic interfaces** before designing the flow, and run `ia-review` Mode 3 step 2.5 for the
structural half — actors, responsibility, persistent objects, handoffs, re-entry and provenance.

**Example output:**
```
Purpose: B2B dashboard for ops teams. Users scan status across 20+ items and act on exceptions fast.
Platform: Web.
Register: Operate — design serves the task, not the brand.
Aesthetic: Dense and utilitarian — information-first, tight spacing, no decoration.
Differentiation: Status communicated by a left-aligned color ramp (not icons), so exceptions surface in peripheral vision without scanning each row.
Outcome: Ops leads clear the exception queue in one pass instead of re-scanning it twice a shift.
Trade-off: We accept lower first-run comprehension to get scanning speed for daily users.
Human control: Acknowledging and escalating an exception stays manual — it is auditable and reaches on-call.
```
