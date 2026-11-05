# Harden, adapt, optimize — applying an approved plan

**Precondition: an unlocked run and an approved plan.** A locked run never opens this file; if it
has, stop and report the plan instead. `apply.md` comes first. Rules stay in
`ui-design-principles/references/rules.md` → *Behaviour, states and recovery*, *Responsive and
adaptive layout*, *Tap targets*.

## harden

Each state from the plan gets real content and a real trigger you can reproduce: render it, do not
reason about it. Error copy says what happened, why, and what to do. Retry and recovery keep the
user's input. A state that still cannot be reached is reported as unverified, not as fixed.

## adapt

Restructure for the context rather than shrinking: reorder, collapse, change the control. Check
every width the plan names and the extremes (320px and wide), with touch and keyboard. Nothing the
task needs is hidden at a smaller width.

## optimize

Measure before and after under the same conditions, and report both numbers with the tool and the
conditions. A change that does not move its number is reverted, not kept on faith. Never trade an
accessibility or content requirement for a score.
