# Decision regression cases

Use these cases when changing the reasoning instructions. They protect against prescriptive fixes
that satisfy a generic rule while making the product less coherent.

## 1. One active tab differs from its siblings

**Input:** A calm app uses an accent underline/weight for active tabs. One reviewed screen has a
weak active state.

**Must do:** inventory the shared tab component and representative tab screens; recommend the
smallest established active-state correction.

**Must not do:** introduce an ink/dark filled tab because the token exists or because dark fill
creates stronger contrast.

## 2. Multi-select emoji tiles

**Input:** Selected emotion tiles already use a persistent border, weight change, and shape/value
step that remain clear without hue.

**Must do:** recognize that colour is not the only signal and preserve the established channels.

**Must not do:** add a checkmark merely because the control is multi-select. A mark is warranted
only when rendered evidence shows the existing channels are ambiguous.

## 3. Small visible pill with an undersized web hit area

**Input:** A short-label pill is visually well proportioned but its web hit target is too small for
the applicable requirement.

**Must do:** prefer an expanded transparent hit area; if the visible pill changes, re-check height,
horizontal padding, radius, label length, and sibling geometry in the render.

**Must not do:** increase visible height alone and leave horizontal padding unchanged.

## 4. Bottom sheet containing unsaved or consequential work

**Input:** A bottom sheet has a grabber but contains a form whose dismissal could lose work.

**Must do:** retain/propose an explicit accessible close or cancel path and handle loss prevention.

**Must not do:** remove the close control because a bottom sheet “must” dismiss through its grabber
or backdrop.

## 5. Wide comparative table on mobile

**Input:** Column-to-column comparison is essential and card conversion would hide relationships.

**Must do:** allow a deliberate, labelled horizontal scrolling region with appropriate sticky
context when it best preserves the task.

**Must not do:** fail the design solely because the table scrolls horizontally.

## 6. Repeated native row actions grow from 36pt painted pills to 44pt

**Input:** The 44pt interaction target is valid, but the painted pills now occupy most of each row,
short labels look nearly circular, and two actions repeat beside every identity block.

**Must do:** separate hit area from visible geometry; flag the loss of hierarchy/contextual fit,
compare sibling compact controls, and recommend preserving the 44pt hit target with a more compact
painted pill or transparent hit slop.

**Must not do:** claim WCAG requires a 44px painted control or enlarge the painted control solely
to satisfy the hit-target requirement.

## 7. White bold CTA label measures 3.12:1

**Input:** The label is bold but its rendered size is ordinary button text, not WCAG-large.

**Must do:** fail text contrast at 4.5:1 and explain that boldness alone does not earn 3:1.

**Must not do:** send the accessibility failure to the design override log.

## 8. Gated pattern with no prior DESIGN.md decision (self-authorized override)

**Input:** During authoring, a gradient button is wanted on a screen that has **no prior
`DESIGN.md` gradient entry** (nothing in the override log, nothing resolving through
`scan-exceptions.conf`).

**Must do:** ship the flat/solid default form, and surface the gradient as a labeled suggestion
carrying its six-gate justification for a human to ratify. On the review side, treat a gradient
whose only authorization is an override entry created in the *same* change as a finding — the
decision must **pre-date** the use (rules.md gate question 6).

**Must not do:** implement the gradient **and** write its authorizing `DESIGN.md` override entry in
the same pass, then treat the gate as cleared. Self-authored justification is not legibility; a
plausible "purpose" sentence the author writes for its own change is exactly what the gate exists
to stop. (This is the case the decision-gate reframe regressed: a reasoning-only gate at authoring
time is not a real constraint, because the model can always produce the reasoning.)

## 9. Decorative phase bars + lead-card accent, colours pulled from the index ramp

**Input:** A roadmap gives Phase 1 / 2 / 3 green / amber / red top-bars, and a feature grid gives
the "lead" card a pine top-border. The bar colours are pulled from the `index-a / index-b /
index-c` ramp (the project's meaning-carrying semantic ramp).

**Must do:** flag the accent borders as **decorative-by-default** — they encode only *position*
(which phase is leftmost), which the layout already carries, so they clear nothing. Separately flag
the index-ramp colours leaking into decoration as a **semantic-palette violation** (Tier-1, not
waivable — the meaning-carrying ramp must not be spent on non-semantic decoration). Recommend
carrying the hierarchy with surface / weight / structure instead. If any bar is kept, it requires a
real documented status mapping (not mere order) — and even then may not draw from the semantic ramp.

**Must not do:** accept the bars as "justified" solely because the three are consistent /
systematic. Consistency is systematic *decoration*, not purpose. Do not send the semantic-palette
leak to the override log as a waivable Tier-2 finding — it is a Tier-1 correctness failure in the
signalling system.

## 10. Dark-teal brand with an unassigned purple accent

**Input:** A restrained dark-teal product UI introduces purple for several buttons, badges, and
illustration details. Purple has no approved supporting-palette relationship, semantic meaning, or
data-category role; it was added because it looked attractive in isolation.

**Must do:** flag the missing palette permission and assess the colours at rendered proportions.
Recommend deriving ordinary chrome from the teal anchor and tinted-neutral ramp, or documenting and
validating a deliberate supporting harmony before purple enters the system.

**Must not do:** accept purple merely because it has a token, or ban all purple categorically. A
documented support, semantic, or category role can legitimately earn it a place.

## 11. Settings page with a filled button in every row

**Input:** Every settings row ends with the same saturated filled button; the page also has Save and
Delete Account actions. Components are internally consistent, but all actions compete equally.

**Must do:** preserve one button/component family while reclassifying roles. Render routine row
actions as the established toggle, navigation affordance, inline/ghost action, or trailing chevron;
keep Save dominant within its edited region; place the destructive action in a separated danger
zone. Verify with squint and grayscale checks.

**Must not do:** make every action identical in the name of consistency, or invent unrelated colours
to distinguish hierarchy that should first be carried by role, position, whitespace, and weight.

## 12. Nested sections drift off the shared page gutter

**Input:** A responsive settings screen uses the correct spacing tokens, but nested cards add their
own insets: the page title, section headings, card content, form labels, and repeated rows land on
several left edges 4–8px apart. No indentation is conveying hierarchy.

**Must do:** trace the shared axes at narrow and wide breakpoints, identify the nested padding or
off-scale margin causing the drift, and align elements intended to share a gutter. Preserve genuine
hierarchical indentation and documented ±1–2px optical compensation.

**Must not do:** pass the layout merely because every individual margin uses a valid token, or force
all content onto one edge when indentation carries a real structural relationship.

## Release 1 — repair-prescription and motion regressions

These lock the criticism→execution contract added in Release 1. A finding that only diagnoses fails
its severity tier. Each case obeys `repair-prescriptions.md`.

### R1. Source-backed finding must give an exact, owned change

**Input:** Source and tokens are available; a settings screen paints every row action as the filled
primary, so Save has no dominance.

**Must do:** name the owner (the shared `Button` used with `variant="primary"` for several roles),
give the exact per-call-site old → new mapping, name the owning layer (call-site variants, not the
global primary token, since Save is already correct), and give a squint/grayscale acceptance check.

**Must not do:** stop at “improve the hierarchy” or “use a more coherent palette,” or rewrite the
global primary token when only some call-sites are wrong.

### R2. Screenshot-only finding must be relational, never invented

**Input:** Only a screenshot shows a selected tile that reads by hue alone.

**Must do:** prescribe the missing persistent non-colour channel with two bounded candidates and the
rule that selects between them.

**Must not do:** invent a hex value, contrast ratio, file path, or token name; or add a checkmark
when the existing channels are not shown to be ambiguous outside the group.

### R3. A command handoff is not a repair

**Input:** An `audit`/`critique` finds a material colour problem.

**Must do:** specify the repair first (cause/owner, change, acceptance), then optionally hand to
`/design-refine colorize` to execute it.

**Must not do:** answer the finding with “run `/design-refine colorize`” and nothing else.

### R4. Ceremony matches severity

**Input:** A minor 4px off-scale gap and, separately, an optional polish note.

**Must do:** give the minor defect a compact prescription (cause · exact-or-bounded change ·
acceptance check); give the optional note a single line.

**Must not do:** force the full eight-field contract onto a 2px nudge, or inflate a warning into a
material finding.

### R5. Simple interaction motion stays CSS; GSAP is gated

**Input:** A proposal animates a button hover and a toggle with a GSAP timeline.

**Must do:** keep simple hover/press/toggle transitions in CSS; reserve GSAP for justified complex
choreography (coordinated timelines, scroll-linked, SVG/path, interruptible, multi-element) and
require its gate (purpose, cleanup, `matchMedia` + reduced-motion, teardown, no hijack, static
equivalent, perf).

**Must not do:** accept a GSAP timeline for a simple hover, or accept a React Bits effect with no
product purpose as the screen’s signature moment.

## Release 2 — reference-intake and component-integration regressions

These lock the reference-intake and component-adoption discipline added in Release 2.

### R6. A found DESIGN.md is a hypothesis, not a contract

**Input:** The user supplies a getdesign.md-style `DESIGN.md` for a well-known product and asks to
match it.

**Must do:** treat it as an unverified hypothesis — extract transferable principles, compare against
project evidence, and synthesize an original project system via `ui-design-system`.

**Must not do:** install the third-party `DESIGN.md` as the approved contract, or reproduce the
brand's identity (“make it look like Linear/Stripe/Apple”).

### R7. External component conflicting with the existing system

**Input:** A shadcn/registry button is proposed alongside the project's established button system.

**Must do:** run Tier B/C integration; map it to project tokens and the existing state vocabulary, or
reject it.

**Must not do:** promote it as a second button idiom or let it bring its own token/theme system.

### R8. Small existing-family change stays Tier A

**Input:** A new size variant of the existing Button.

**Must do:** reuse the primitive, consume existing tokens, verify the touched states and
representative siblings — Tier A, no full promotion record.

**Must not do:** force the full Tier-C compatibility matrix onto a one-variant change.

### R9. Relume structure on a dense product surface

**Input:** A Relume marketing-page section stack is proposed for a settings/dashboard screen.

**Must do:** treat Relume as a marketing-IA candidate only; route structure through `ia-review` and
reject the marketing archetype for the dense product surface.

**Must not do:** assemble the product screen from marketing section templates.

### R10. External recommender loses to project evidence

**Input:** `ui-ux-pro-max` (or any recommender) returns a style that conflicts with the platform/task
evidence.

**Must do:** treat the suggestion as a candidate; let current project evidence, platform convention,
and accessibility win.

**Must not do:** adopt the recommended style as authority over conflicting project evidence.

## Release 3 — whole-app coverage regressions

These lock the whole-app coverage discipline added in Release 3. See
`design-refine/references/review/whole-app-coverage.md`.

### R11. Individually polished screens, inconsistent component families

**Input:** Every screen passes its own review, but the button/card family differs across three
sections of the product.

**Must do:** run cross-screen component comparison; fail whole-app coherence and prescribe a single
component family.

**Must not do:** issue a whole-app pass because each screen passed in isolation.

### R12. A shared component differs across routes

**Input:** The “Save” button renders 40px tall in settings and 32px in the profile editor.

**Must do:** surface it through cross-screen comparison as a coherence finding with a repair
prescription (owner = the shared component; exact-or-bounded change; scope = both routes).

**Must not do:** miss it because each screen individually looks fine.

### R13. Missing width/state coverage blocks sign-off

**Input:** A whole-app review rendered only desktop; mobile, focus, error, and loading states were
not seen.

**Must do:** record the observed widths/states, mark the rest `[Not assessable]`, and refuse an
unconditional pass.

**Must not do:** issue a whole-app PASS, or imply that harness-level crawling / multi-width capture
was run.

## Pass criteria for every case

- The finding states its evidence class and names the relevant standard, project precedent, or
  established principle.
- Heuristic/taste is not presented as a defect.
- The recommendation names scope and representative sibling contexts.
- The change is not promoted to DESIGN.md, tokens, shared components, or a client guideline before
  cross-context validation and authorization.
