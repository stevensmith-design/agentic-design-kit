# Build passes — the production bar

Step 4. The same bar for a marketing page and a product screen. Build in passes, not in one
attempt; each pass leaves the page working.

## Before editing

State the files you expect to modify, create or delete. Never delete a production file, route,
component folder or old site without a file-level plan the person confirmed. Briefs, READMEs,
PDFs and decks are reference material, not copy to paste.

## Direction recap — before the first implementation

Keep this short. It confirms the chosen direction; it does not turn that direction into a kit-shaped
contract or ask verification documents to invent the aesthetic:

- **Route and direction** — the source named at step 2, and the direction in one sentence.
- **Composition and hierarchy** — the direction's own large-scale intent.
- **Distinctive choices** — only the choices material to this brief and its references.
- **Enrichment** — type only, or the tier and why (`enrichment.md` when beyond type).
- **Motion** — what it communicates, if motion is part of the direction.

## Evidence on hand

Never invent a price, a customer, a testimonial, a logo, a metric or a benchmark. Use what the brief
supplies; where it is missing, ask, or leave a placeholder that *looks* like a placeholder
(`[Customer quote — to come]`) and list it under decisions for the person. A labelled placeholder is
a draft state, never production: it does not ship (`quick-rules.md` Tier 1). Synthetic demo data in
a product screen is labelled as such. No
re-drawn browser bars, phone frames or code-editor windows around real content: show the content.

## Pass 1 — structure and content

Semantic HTML first: landmarks, one `h1`, headings in order, real lists and tables, buttons that
are buttons and links that go somewhere. Real content in every slot — no lorem, no placeholder
names. The headline's measured length and the chosen direction inform its treatment (`rules.md` →
*Typography*). Do not impose or ban an eyebrow, hero pattern or other house-style element unless the
brief, system or direction supports that choice.

## Pass 2 — system

Every colour, space, size, radius, shadow and duration is a token by name (`var(--…)`). A value
you need and do not have: reuse one, or stop and ask — never invent. Tokens file written or updated
through step 3, never by hand here. **The system has a gap** (no spacing scale, no motion token):
reuse the shipped surfaces' values consistently, never invent new ones, and list the gap for the
person as a Reconcile candidate.

Every named font must actually load from a shipped local file or approved provider. If that cannot
be guaranteed, use the honest system stack in both the tokens and CSS. A preferred family followed
by fallbacks is not "loaded" merely because the fallback renders.

## Pass 3 — states

Every interactive element has its states (`rules.md` → *Behaviour, states and recovery*): default,
hover, focus-visible, active, disabled, loading, error, success where they apply. Every surface
that fetches or lists has empty, loading, long, many and error. Focus rings appear instantly and
are never drawn from the border. Inputs and buttons in one row share a height; a helper-text slot
does not collapse when empty; disabled is more than opacity.

Every action named by the interface performs that action in the delivered scope. Exercise each
primary, secondary, recovery and state-transition action in a browser and record the observable
result. A demo may use an honest local simulation, but a live-looking control may not only move
focus, change its own label, or announce success while leaving the promised object/state absent.
If a destination is out of scope, mark the control unavailable and say why instead of shipping a
dead link or no-op.

Visible action copy and its handler derive from the same effective state. Preview/demo modes may
project state, but they must not label an action from the projection while executing against hidden
persisted state. Seed persistence, enter every preview state, activate each visible action and prove
the named transition occurred; an “Add” control that removes a hidden item is a material failure.

Loading preserves the final surface's meaningful geometry and hierarchy. Skeletons mirror the
real ledger/list/detail regions they replace; generic blank rectangles that cause the page to
recompose on completion do not satisfy the loading state. Render loading and loaded at the same
viewport and name the placeholder-to-final correspondence for every major region; if a region has
no corresponding shell or stable reserved space, the loading state is incomplete.

Distinguish **initial load** from **refreshing newer data**. Skeletons are permitted only for facts
that have not arrived. When usable offline, cached or previously loaded content already exists, a
refresh keeps that known content and its actions mounted in their established regions, adds an
in-flow status, and marks the affected region busy. Never replace known values, notes or controls
with explanatory placeholder rows merely to prove correspondence; correspondence is not
preservation when the person's available working content disappears.

A selection, filter or route change updates **every dependent region as one state transaction**.
Inventory the selected record's title, status, measurements, evidence, notes and actions, then
exercise at least one alternate selection. If complete content is unavailable, replace the whole
dependent detail with an honest unavailable state. Write that state as a limitation of the
provided content (for example, `Full dossier unavailable in provided content`), not as a new fact
about the record (`No further note supplied`) and not as synthetic evidence. Never leave one record's title above another
record's measurements or actions.

## Pass 4 — motion

Motion only where it has a job (`rules.md` → *Motion*): transform and opacity only, never
`transition: all`, no bounce on state changes, success is quiet, undo beats confirm. Three named
easings at most. Everything has a reduced-motion path.

## Pass 5 — responsive and verify

Clickable text never wraps: shorten, then `white-space: nowrap`, then hide behind a disclosure.
`overflow-x: clip` on the page; nothing scrolls sideways from 320px up. Images have dimensions
and alt text; image URLs resolve. The build or the page loads without errors.

Inventory and measure every visible control role at each critical width and required zoom. Apply
the project/system minimum when it is stricter than a generic accessibility floor; do not filter out
small utility, order, clear, disclosure or preview controls. Hidden controls are excluded explicitly.

Before the final build record, compare implementation and artifact-local `DESIGN.md`/tokens back to
the frozen direction contract, including motion durations and reduced-motion behavior. A locally
derived system may elaborate the contract, but it may not silently contradict a frozen value.

## Records

When the render is final (end of step 5), write the stamp and append the log entry (`records.md`),
then run — and run again after any later change:

```bash
node <design-build>/scripts/check-records.mjs --log .design-build/log.jsonl --stamp <stylesheet>
node <design-build>/scripts/check-distance.mjs --log .design-build/log.jsonl # optional repetition diagnostic
```

`check-records` validates record integrity. `check-distance` is useful after the first visual
implementation when repeated output is suspected; its result is evidence for review, never an input
that selects composition or style. You do not need to open the library index.
