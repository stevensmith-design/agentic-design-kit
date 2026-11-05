# Mode 4 — Drift (DESIGN.md/tokens vs shipped UI)

A system exists; verify the code still obeys it.

1. **Run the validator** to confirm the *system itself* is still coherent (a token file can drift
   from its own DESIGN.md prose, or an edit can break a relationship). Fix the system before checking
   the code against it — comparing code to a broken standard wastes the pass.

   Pass **`--theme PATH`** (pointing at the shipped theme CSS, e.g. `theme.css` / `globals.css`) so
   the validator diffs the *implementation's* resolved values against `tokens.json` and raises
   `drift/theme-vs-tokens` when the CSS silently disagrees with the tokens — the "green as false
   comfort" case where `tokens.json` validates but the shipped CSS carries different values (see
   `references/validator-rationale.md`):

   ```bash
   python3 <resolved>/validate-tokens.py <project-dir> --theme path/to/theme.css --json
   ```
   Without `--theme`, this specific implementation-vs-tokens check is SKIPPED, not passed — say so in
   the report rather than implying the code was checked.
2. Compare the codebase against the documented tokens:

   | Drift pattern | What it looks like |
   |--------------|-------------------|
   | **Radius** | `border-radius` not matching a `--radius-*` token |
   | **Spacing** | hard-coded px off the grid / off the scale |
   | **Colour** | ad-hoc hex/hsl in components instead of a token |
   | **Font** | sizes or families not in the type scale |
   | **Shadow** | box-shadow not matching the `--elev-*` ramp |
   | **Button** | differing heights/padding/radii across the code |

   For code-side detection, `ui-design-review`'s `scan.sh` and its consistency sweep do the per-file
   pattern work; this mode consumes their findings at the system level.
3. **Check drift in the other direction: tokens with no consumer.** Steps 1–2 ask whether the code
   obeys the system. This step asks whether the system still describes the code. Every declared
   token needs a real consumer, and a token table is only trustworthy when it has been checked
   against the components that actually read it.

   | Direction | Question | Symptom |
   |-----------|----------|---------|
   | Code → tokens (step 2) | Does the code use values the system doesn't declare? | Hard-coded hex, off-scale spacing |
   | **Tokens → code (this step)** | Does the system declare values nothing uses? | **Orphan tokens** — declared, documented, consumed by nothing |

   An orphan token is not harmless. It inflates the apparent system, it survives every validator
   pass (relationships between unused tokens still compute), and the next author reads it as
   sanctioned vocabulary and reaches for it — so a retired treatment quietly comes back. A token
   that outlived its component is the same defect as a component that outlived its token.

   Three obligations. The first now has a mechanism — `validate-tokens.py` reports
   `tokens/orphans` when it is given a directory to scan, resolving alias chains and
   skipping when it sees no `var()` evidence at all. It reports at **WARN**: an orphan
   breaks no relationship, so it does not fail the validator, and the DRIFT-not-ALIGNED
   verdict below remains this mode's call rather than an exit code. The other two remain
   the designer's work:
   - **Enumerate consumers, don't assume them** *(validator-assisted)*. For each declared token, find the components that
     actually resolve it. A token whose only appearances are its own declaration and the DESIGN.md
     table is an orphan; report it as `ORPHAN` with the section that declares it.
   - **Removing or changing a token requires an impact audit first.** Before a value changes or a
     token is deleted, list every consumer and state what each will look like afterwards. A value
     change is a change to every consumer at once — that is the point of a token, and it is also
     why a "small tweak" to `--radius-card` is never small. Semantic aliases make this
     non-obvious: a token consumed only through an alias is *not* an orphan, and one whose alias
     was retired *is*.
   - **The token table is checked against real consumers, not maintained as prose.** When the
     documented table and the consuming components disagree, one of the two is wrong and the report
     says which. Retiring a token means removing it from the table in the same change, or logging
     it as deliberately reserved with a reason.

   Report orphans in the drift table with `—` as the value found and the declaring section as the
   file. A system with orphan tokens is `DRIFT`, not `ALIGNED`, even when every code reference is
   clean.

4. Report each drift: file, token expected, value found. Items in the DESIGN.md override log are
   intentional — not drift.

## Drift output format

```
## Design System Drift — [project scope]

### Validator: [PASS / PASS w/ warnings / FAIL]  (system-level coherence)
[paste the one-line summary; list any FAIL relationships]

### Code drift (if any)
| File | Token expected | Value found | Fix |
|------|---------------|-------------|-----|
| Card.tsx:24 | --radius-card (16px) | border-radius: 20px | use --radius-card |
| DESIGN.md § Elevation | --elev-3 (declared) | — (no consumer found) | ORPHAN — retire it, or name the component that should use it |

### Recommendation
[ALIGNED — validator green, no code drift, every declared token has a consumer]
[DRIFT — N inconsistencies and/or M orphan tokens; align code, retire orphans, or log overrides]
[SYSTEM FAIL — a token relationship is broken; fix DESIGN.md/tokens first]
```
