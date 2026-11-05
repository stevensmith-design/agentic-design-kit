# Extract — applying an approved plan

**Precondition: an unlocked run and an approved plan.** A locked run never opens this file; if it
has, stop and report the plan instead. `apply.md` comes first.

1. **Create** the shared token or component the plan names, in the project's existing location
   and naming. Variants the instances need become props or states, not copies.
2. **Migrate every call site** on the plan's list. A partial migration leaves two implementations,
   which is worse than the one you started with.
3. **Retire the old** one-off code once nothing uses it. Where files cannot be deleted in this
   environment, move them aside and say where.
4. **Record** the component or token where the system lists them (`components.md`, the token file)
   — only when the person approved recording it; changing `DESIGN.md` itself is a stop.
5. **Verify** each migrated call site renders as it did, plus the variants, per `apply.md` § 5.
