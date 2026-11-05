# Quick Rules — index card

One line per rule. **rules.md is canonical** — this file is an index and never overrides it. Work
from this card; open the named rules.md section at each decision point (routing table at the end).
New rules are promoted into rules.md sections first, then get one pointer line here.

**Three tiers (→ Decision tiers and the override process):** Tier 1 Quality requirements =
non-negotiable · Tier 2 Design decision gates = earn their place via the six gate questions +
DESIGN.md log; the reviewer assesses the *reasoning*, not the pattern · Tier 3 AI-tell risk
indicators = co-occurrence scrutiny, not per-item failure.

- Study-proof approval uses the dated human answer, not production defaults (→ Study-proof authority).

**System gate (→ ui-design-system):** every declared token needs a real consumer — orphan tokens
read as sanctioned vocabulary and quietly revive retired treatments; changing or removing a token
requires an impact audit of its consumers first (→ `ui-design-system` Drift mode). Relationships
*between* tokens (contrast pairs incl. CTA-label, selection ≠ action, value step, ramp hue, scale
ratios) are checked by `validate-tokens.py`, not by eye — run it after defining tokens and before
the first component; a `FAIL` blocks. Whole-system work (create / extract / coherence audit / drift)
is the `ui-design-system` skill, not this card.

**Register gate (→ Design intent — the four registers):** settle intent before aesthetic —
**Persuade** (decide and act) · **Operate** (complete a task) · **Read** (understand something —
measure and pace, *few* actions, never dashboard density) · **Experience** (explore the work — the
design *recedes*). A product needs several and that is not incoherence: tokens hold across
registers, density/motion/type-sizing/decoration differ by register.

**Direction gate (→ design-directions.md):** classify visual language separately from layout,
content primitive, theme/mode, effect, and responsive/accessibility requirements. Commit one
dominant language plus an exclusion sentence. When available, `ui-ux-pro-max` may retrieve
candidates; project evidence and this skill adjudicate them.

## Quality requirements (Tier 1 — non-negotiable)

- No placeholder/lorem-ipsum text in production
- Animate `transform`/`opacity` only — never width/height/padding/margin/top/left
- Every reachable state designed: loading, empty, error, partial data
- Color is never the only signal
- Data-entry fields use visible labels by default; every control retains a persistent accessible name and context
- Semantic/index ramp (the meaning-carrying palette) never used for decoration — that leak corrupts the signal and is never waivable (→ Quality requirements → Semantic-palette leak)

## Design decision gates (Tier 2 — the tells; each earns its place via DESIGN.md log)

**A `DESIGN.md` the model wrote this session is a proposal, not an authority** — pre-existing
entries clear a gate, same-session ones are self-authored justification. A system can be coherent,
documented, consistently applied and still made of unexamined defaults; when a defect traces to a
value in `DESIGN.md`, the finding is against the system (→ Authoring resolution).

Each line is a *gate*, not a ban: the pattern is available to a design that clears Purpose ·
Direction-fit · Systematic · Still-communicates-without-it · No a11y/hierarchy cost · Legible,
logged in DESIGN.md. Write "lacks a defined role," never "failure: found." Recurring five with
explicit gates: gradient, shadow, glass, oversized radius, dark theme (→ Design decision gates →
Decision gates for the recurring five).

- No gradient buttons or gradient text (exception: committed same-hue ≤5% vertical light cue)
- No colored side-stripe borders; no decorative accent border/stripe/top-bar that encodes no data (consistency ≠ purpose; position ≠ meaning); no ghost-cards (border + wide shadow); no nested cards
- Card radius ≤ system cap (16px default; playful mobile may commit 20–24); nested radii concentric
- Canvas: one flat colour from the brand hue at 2–5% sat; no unmotivated cream; no gradient/glow layer — including via CSS variables
- Content surfaces opaque — no rgba-white fills, no backdrop-blur on cards
- Shadows neutral, positive y-offset (no `0 0` glows), ≤16px blur; never brand tints; blur may run 3–4× offset
- No icon-tile feature-card template; one card primitive with varied prominence; no 4+ card treatments per screen
- Homogeneous lists = plain rows + dividers, never per-item cards; settings = one section card
- No eyebrow-on-every-section — **and none above the hero H1 even as the page's one permitted kicker**: it occupies the same slot as the banned badge-above-H1 and does the same job, so it is presumed decorative whether or not it repeats (Tier-2 gate + `DESIGN.md` purpose; "it labels the section" is not one when the H1 names it). No 01/02/03 markers, no long all-caps
- No emoji as chrome (documented JP content-emoji system (JP consumer apps) is fine; chrome stays distinct from content)
- No sketchy SVG scenes, glow orbs/aurora, neon multi-accent dark, decorative status dots, rainbow accents
- No oversized italic serif hero; display font is a considered choice (not Inter/Roboto/Arial/Geist) — **and naming it in `DESIGN.md` does not make it chosen**: ask whether someone could guess the type stack from the product category alone; no purple-gradient-on-white
- No badge-above-hero-H1, stat banner rows, unmotivated permanent dark theme, centered-hero assembly
- No image scale/rotate on hover; no bounce/elastic easing
- No buzzwords; ≤2 em-dashes per block; CTAs specific ("Save changes", not "Submit"); no "X theater" framing (→ Copy hygiene)
- Decoration test: if removing it loses no meaning, remove it; ≤1 signature decorative moment per screen

## AI-tell risk indicators (Tier 3 — co-occurrence, not per-item failure) (→ AI-tell risk indicators)

- Assemblies, not single patterns: centered-hero assembly · icon-tile feature-card grid · badge-above-H1 · stat banner row · eyebrow-on-every-section · 01/02/03 markers · symmetry-everywhere
- One in isolation may be fine; **weight rises as they stack** — 2+ with no unifying rationale = strong "assembled, not designed" tell → downgrade Contextual fitness / Craft
- Fix is "break the assembly" (asymmetry, product-first, real screenshot), never "remove the gradient"

## Craft — the numbers (→ named section)

- Canvas: brand hue, S 2–5%, L 96–98%; cards pure #FFF; value step 1.05–1.12:1 (→ Choosing the canvas)
- One brand-tinted neutral ramp drives canvas, border, muted text, ink (→ Choosing the canvas)
- Separation order: whitespace → value step → hairline → container (→ Separation toolkit)
- Elevation by role: static = hairline+step, no shadow; tappable = elev-1; menus = elev-2; sheets = elev-3 (→ Surface and elevation)
- Radius: 4–8 inputs / 12 cards / 16 large / pill tags; inner = outer − gap (→ Border radius scale)
- Spacing: 8pt grid, 9 named steps; rhythm, not uniformity; text never touches an edge (≥8px in containers, ≥16px at viewport) (→ Spacing system)
- Spacing rhythm has a test: **≥3 distinct magnitudes** doing work in one layout (tight binds, medium separates, large breaks sections). One gap value repeated = template, on-grid or not. On-scale ≠ rhythmic (→ Spacing system)
- `gap` for sibling spacing, `margin` only for optical nudges and flow breaks — stacked sibling margins collapse unpredictably and break on reorder (→ Spacing system)
- Section padding is asymmetric on purpose: **`padding-block-end` ≥ 1.3× `padding-block-start`** — symmetric or top-heavy hero padding makes it float off the page; vary rhythm across sections (→ Spacing system)
- A content container's height comes from its **content**; a void inside a box proves it didn't. Two causes, and the void is their combination: a forced height (`aspect-ratio` — media slots only · `height:100%` · `min-height` as a dimension rather than a floor · a grid's default `align-items:stretch` making a visual column match the prose beside it) **plus** `justify-content: space-between` pooling the slack into one middle gap. Fix the height first — reduce it, or give it content that earns it — never redistribute or decorate the surplus (→ Spacing system; Imagery and avatars)
- White space is an element: don't distribute it evenly (nothing groups) and don't fill every gap with a card or divider (→ Spacing system; Separation toolkit)
- Section-head alignment coheres with its body — the common accident is a narrow head with `margin-inline:auto` + a `ch` cap sitting centred over left-flush content; it is on-grid, so the axis audit misses it (→ Optical alignment)
- Declared padding ≠ rendered padding, on **all four sides**: `margin-block-start:auto` (or `justify-content:space-between`) in a **fixed-height** flex column eats the padding box's slack and pins the last child flush to the edge — token-correct in CSS, ~2px at render, invisible at page zoom and it never overflows. Measure `container.bottom − lastChild.bottom` against computed padding (±2px) for pinned actions/footers/meta rows, and re-check narrow (→ Optical alignment)
- Hero headline: **≤7 words / ≤50 chars** when you write it yourself; cap by measured length (≤20 full display · 21–50 full display · 51–90 step down one rung · >90 rewrite or drop two). ≤5 type sizes per page (→ Typography)
- Hero fit — **verify rendered at 1280×800**: headline, lede and primary CTA all visible without scrolling; headline on **2–3 lines**; hero display leading **1.0–1.1** (never <1.0 — caps collide on wrap); lede ≤2 lines / ~60ch. Causes in order: oversized display `clamp()` max, loose display leading, 3-line lede, bloated hero `padding-block`. A hero that already fits passes untouched (→ Typography)
- Type: heading ratios ≥ 1.25× target at display levels (validator hard floor 1.15×; dense-UI adjacents may use weight/colour); body ≥ 14/16px; LH by size — body 1.5–1.7 (JP 1.6–1.9), display 1.1–1.25; single family OK for product UI, pairing for brand UI; tabular-nums on data; display size follows actual measure, language, wrap, and hierarchy—not a word-count formula (→ Typography)
- Caps and inverted type: all-caps labels take **+0.05–0.12em** tracking (real small-caps over faux); light-on-dark needs compensation on three axes — line-height +0.05–0.1, tracking +0.01–0.02em, and consider one weight step down. A dark theme reusing light-mode type metrics is why a good palette still reads muddy (→ Typography)
- Decorative text effects have geometry: highlight band behind the **x-height** (~38%→92%), never the baseline — at the baseline it reads as a fat underline; underlines 1–2px, offset 1–2px, never 5+; decorative strokes ≤5% of viewport. Confirm in the render, not the CSS (→ Typography)
- JP (JP consumer apps): no italics, no negative tracking, ~35–40 chars/line, verify real font weights, manage heading breaks (`auto-phrase`/`<wbr>` — no dead whitespace from unmanaged wraps) (→ Japanese/CJK)
- Text on a coloured/gradient ground: measure at the **lightest and darkest stop it crosses**, not the average. And the colour axis is spent — one mandated ink means hierarchy must come from a deliberate **opacity ladder** (anchor / body / metadata, every step above the floor) plus weight, never a second hue. A pairing proven on a button is not proven on a card: the measurement transfers, the judgment doesn't (→ Color contrast)
- Links in body text are identifiable without colour — underline by default; if removed, weight/border/icon must carry it (hover-only doesn't count). Forced-colors/high-contrast mode is evaluated: real borders, not shadows, where a boundary must survive (→ Color contrast)
- Contrast: body and ordinary button labels ≥ 4.5:1; large (≥24px reg / 18.5px bold — bold alone is not large) ≥ 3:1; interactive boundaries ≥ 3:1; disabled/placeholder exempt; grays take the surface hue; count badge / small label on accent = full 4.5:1 (→ Color contrast)
- Measure the **composited** ratio, not the declared pair: a token validator checks pairs the system *declares*, a page fails on pairs it *composes* (ink on an accent card, translucent text on a gradient, a label over an image). Composite to the first opaque layer, take the **worst gradient stop**, and composite translucent text too. When ink fails one accent and white fails another, opposite text treatments are forced — a palette finding, not taste (→ Color contrast)
- Colour meaning is not universal — red/green direction inverts in parts of East Asia, white/black mourning differs; never let colour be the sole carrier, and check the 2–3 meanings the product depends on against its real markets (→ Color strategy)
- State survives without its appearance treatment: hue, greying, desaturation, and opacity may reinforce status but never carry meaningful state alone; pair them with a persistent non-colour and programmatic channel. A grey avatar is not forbidden — ambiguity is the failure (C1/C27 → Presence and availability; Quality requirements)
- Colour: semantic roles; colour budgets such as 60/30/10 are diagnostics, not laws; selection and action remain distinguishable in context; multi-select needs each item independently identifiable through the smallest established non-colour channel, not necessarily a check; heavy/dark treatments require a precedent-context compatibility check (→ Color — semantic roles; Color strategy)
- Palette permission: every hue must be brand/action, brand-derived support, semantic state, or data/category; unrelated accents need explicit approval and contextual harmony; adjacent tinted surfaces must separate by value/space/border, not merely different hex values (→ Color strategy)
- Page hierarchy: family resemblance + role distinction; inventory action/content priority, spend position/space before colour/elevation, verify with squint and grayscale tests; repeated settings-row actions stay quieter than the region's Save/Apply, and destructive actions live in a separated danger zone (→ Page-level visual hierarchy; Button rules)
- Buttons: one dominant action per decision context (not two co-equal primaries); five states; heights 36/44/52; pressed states on tappable rows too; primary CTA stays reachable (→ Button rules)
- Tap targets: iOS 44pt, Android 48dp; web WCAG AA 24×24 CSS px including its spacing exception, with ~44px preferred for touch-heavy controls; preserve visible geometry via expanded hit areas; native controls clear safe areas (→ Tap targets)
- Forms — structure: visible label **above** the field (placeholder = format hint only, never the label); input height ≥40px web / 44pt iOS / 48dp Android; field width matches the expected input length; related fields grouped by proximity + a light divider; mark only the minority required-or-optional, never both (→ Form and input rules)
- Forms — validation: on blur for the first pass, then **every keystroke** once a field is in error; live-from-the-start only where feedback is the feature (password strength, username availability); errors inline **below the field**, never a toast; name what's wrong *and* the fix ("Enter a valid email address, e.g. name@example.com", not "Invalid email"); colour + icon + text, never colour alone; keep submit **enabled** and jump focus to the first error rather than a disabled dead end; several errors → a linked summary at the top that takes focus (→ Form and input rules)
- Forms — behaviour under failure: entered data survives a failed submit, a back navigation, a session expiry and a refresh — never hand back an empty form; save/autosave/draft state is visible ("Saved", "Draft saved 2 min ago") and leaving dirty warns rather than discards; flows of 3+ steps show position ("Step 2 of 4"); character counts, upload size/type limits and item maximums are shown **at the input before they're reached**, not in the rejection (→ Form and input rules)
- Control type is a promise about behaviour (→ Behaviour, states and recovery — Control-type semantics): radio = exactly one from a visible set · checkbox = independent selections · switch = **takes effect immediately** (a switch needing a Save button is the wrong control) · segmented = peer views · dropdown = a set too long to show inline, never 2–3 options. A button is never dressed as a tag/tab/checkbox; a tag is not tappable unless it filters (→ Color — semantic roles)
- Selection model picks the second channel: multi-select = each item independently identifiable via the smallest established channel (border/shape/weight/label/scale/mark — a check is *not* mandatory); single-select = the active item reads differently from its siblings via fill + border + weight + position, no per-item check; selection never reads as the CTA (→ Color — semantic roles)
- Charts: **pick the form from the question first** (trend → line · rank → sorted bar · share → ≤5-segment donut/stacked bar · target → bullet, never a gauge · no dual y-axes); token colours, hairline gridlines, direct labels, no 3D/gradient fills; tappable elements affordant at rest; a non-visual path to the data — takeaway as its name, values as a table, focusable marks (→ Data visualization)
- Images: one fixed ratio per slot, cover-fit; avatars one shape, 2–3 sizes, designed placeholder (→ Imagery and avatars)
- Text on photos: overlay / pill / floor-fade / blur / scrim — pick one method and systematize (→ Text on imagery)
- Icons: one family, one stroke weight, 16/20/24; filled/outline only as state (→ Icon system)
- Cognitive load: > ~6 choices grouped; one primary job per screen; hide system-operated controls; one idiom per control type; disabled-in-place with reason, never a lock modal (→ Cognitive load)
- Modals: weight matches action; sheet = grabber + swipe (no ×); dialog = de-emphasized × (→ Modal and sheet weight)
- **AI/agentic products only** — if the core interaction is a model producing output or an agent acting for the user, open *AI and agentic interfaces* before designing the flow. Three properties break rules that hold everywhere else: output is non-deterministic, latency is unbounded, and the system acts on an *interpretation* of intent. Highest-value four: **generated content never carries the same visual authority as retrieved/verified content** (a hierarchy rule, non-colour channel) · **streaming replaces the 300ms/500ms/skeleton loading rules** rather than extending them · **confirm the interpretation, not the consequence**, in one round trip before a long run · **model failures are their own error family** (no-result / refusal / low-quality / failed-mid-run — none of them "Something went wrong"). Skip this line entirely for a product that merely has AI somewhere inside it (→ AI and agentic interfaces)
- Feedback channel matches the event: **inline** for foreground errors needing action · **toast** for non-blocking success/info only · **persistent snackbar + retry** for background/async failures · **undo (~5s)** for reversible actions, confirm only the irreversible · task-relevant status changes and async results also announced to assistive tech via a live region (→ Modal and sheet weight; Button rules; Accessible semantics and keyboard)
- Motion: ease-out expo curves; ~150/250/350ms; **exits 0.6–0.8× the entrance**; reduced-motion is a *branch*, not a duration multiplier. **Response ≠ transition**: input acknowledged within ~80ms (perceptual instant), the animation carrying it still ≥150ms — never delay the acknowledgement to fit the curve. Under 100ms *as a transition* reads as a glitch, over 400ms as lag. **0ms is a real answer** for focus, keyboard nav and error appearance (→ Motion)
- Motion is designed **with** the layout, not added at the end — the added-at-the-end version is what generated UI produces. Budget: **≤3 distinct animation primitives per screen**, nothing over 2s except a deliberate continuous loop. `transform-origin` is considered, not defaulted (a menu scales from its trigger corner). Stagger *within* one list is fine; the same entrance on every section is AI grammar (→ Motion)
- Never by default, any register: body text revealing on scroll · background gradient shifts · cursor followers · section-by-section fade-up-stagger · tab content sliding sideways · scroll-linked motion below ~40rem (→ Motion)
- **CSS is the default and the default has moved** — scroll-driven animations (`animation-timeline: scroll()/view()`), `@starting-style` + `allow-discrete`, the View Transitions API and `linear()` easing cover most of what a library used to be needed for. A JS library (GSAP, WAAPI, Framer Motion, Motion One) is justified for five things only — coordinated timelines · scroll-linked *progress* · SVG/path · interruptible or reversible sequences · multi-element cross-component transitions — and then carries all seven of the implementation points, of which **cleanup-on-unmount, an explicit reduced-motion branch, and complete teardown are correctness, not taste** (→ Motion)
- Building an actual interaction? Open `motion-recipes.md` — trigger · change · duration · easing · a11y line, for the ~16 interactions that recur in every product (→ `motion-recipes.md`)
- States — every reachable one designed, by kind: **loading** (skeleton for content, spinner for action feedback; delay ~300ms, hold ≥500ms, skeleton = exact content size) · **empty** (first-use / user-cleared / no-results are three different screens, not one template) · **error** (network / data / permission each get their own copy and recovery action) · **partial data** (1 item, 100 items, a very long name) · **partially loaded** (some arrived, some pending — render what resolved, mark what didn't; never a page spinner over data you have) · **offline** (what stays usable, how queued actions show, what happens on reconnect) · **expired session** (re-auth in place, never bounce a half-filled form to login and back empty) · **role/permission variants** for every screen more than one role sees (→ Behaviour, states and recovery)
- States — the runtime must not destroy work: browser back / refresh / open-in-new-tab, native backgrounding, interruption and reconnection all preserve in-progress input; optimistic updates carry a **visible** rollback + retry and are never used for payments or destructive actions (→ Behaviour, states and recovery)
- States — design for **return**, not just first use and steady use: what changed since they left, where they were, recovery from a stale cache or expired token; onboarding doesn't replay (→ Behaviour, states and recovery)
- Prototype hygiene: no demo/reviewer/dev controls on the product surface; non-persisted demo state carries a visible "won't be saved" cue (→ Behaviour, states and recovery)
- Copy: parses one way; gentle register for sensitive states; truncation decided per slot, survives JP↔EN (→ Copy hygiene)
- Nav (web) — **the archetype is a decision recorded in `DESIGN.md`**, not a default: wordmark-left + 3–5 inline links + CTA-right + full-width + sticky + white + hairline is *the* nav fingerprint and is genre-blind (identical on a bakery and a B2B dashboard). Floating pill, masthead, side rail, edge-aligned, command-palette, banner+retract are equally standard. A dense 4–6-link marketing bar is legitimate; the unexamined reflex is not (→ Platform notes → Page navigation (web))
- Nav collapse is a **pair**: hiding the desktop row obliges a toggle at the same breakpoint (sheet/drawer/disclosure). Hide-only makes every hidden destination unreachable — functional defect, not styling. Fix order: shorten labels → `nowrap` → `hidden=until-found` → collapse. Nav links and CTAs never wrap to two lines (→ Platform notes)
- Nav: tab bar 3–5 labelled items, unambiguous active state; back = chevron, never ×; Android back is the system's — support predictive back, intercept only to guard unsaved work (→ Platform notes)
- Software keyboard (mobile): never hides the focused field, its error, or the submit action; `inputmode`/keyboard type matches the input; dismissible; **test at the smallest supported device height with the keyboard open** (→ Platform notes)
- Gestures & haptics (native): every custom gesture has a visible alternative (swipe-to-delete, long-press, pinch); haptics are always a *second* channel, never the only one; a drag starts past a movement threshold (→ Platform notes)
- Android gesture zones: apps cannot exclude the bottom home/quick-switch area; 200dp is only the vertical cap for side back-gesture exclusions, and ordinary scroll regions do not warrant exclusions (C19 → Tap targets; Platform notes)
- i18n beyond JP: RTL mirrors layout **and** directional icons — build with logical properties; dates/numbers/currencies/plurals go through the locale API, never string surgery; budget ~30–40% text expansion and never fix a text container to its English width (→ Platform notes)
- A11y semantics: aria-label on every icon-only control; real `<button>`/`<a>`, no clickable divs; headings descend; modals trap + return focus, Esc closes; an SPA route change updates the title and moves focus to the new view (→ Accessible semantics and keyboard)
- A11y structure: real landmarks (`header`/`nav`/`main`/`aside`/`footer`, one `main`, skip link when nav precedes content); **tab order matches visual order** — any CSS reorder must be re-tabbed, never patched with positive `tabindex`; task-relevant status changes and async results announced via live region; images split three ways — informative (alt conveys the information), decorative (`alt=""`/`aria-hidden`), functional (named for the **action**) (→ Accessible semantics and keyboard)
- Text scales: survives 200% zoom / Dynamic Type with no loss of content or function; `rem`/`em`, never `user-scalable=no`; layouts **stack** rather than truncate or clip (→ Typography)
- Hover never gates functionality — on any element, tooltips included (→ Tap targets)
- Popovers/menus/tooltips escape clipping ancestors — overflow:hidden must not cut them off (→ Platform notes)
- Sticky chrome must not eat content: reserve space for fixed headers/banners/pinned CTAs (`scroll-margin-top`, `scroll-padding-top`, matching body padding); **tab the page and confirm focus never parks under a fixed bar**; cap total chrome on short viewports (→ Responsive and adaptive layout)
- Responsive: use a small committed breakpoint set; design narrow and wide variants; test representative extremes; avoid accidental page-level horizontal scroll (→ Responsive and adaptive layout)
- Tables — bulk & filters: selection states its scope (live count; "all 12 on this page" ≠ "all 340 matching"; action names object + count); selection re-confirms when the filter changes; active filters/search/sort visible on the results surface with individual remove + Clear all, and an empty result from filters is a **no-results** state naming them; timestamps declare their zone, relative time pairs with the absolute (→ Data tables)
- Tables: align text/numbers for scanning; choose hairlines/zebra/sticky headers from density and width; card conversion or a labelled horizontal region may be correct on narrow screens; sort exposed via `aria-sort`; large collections paginate or virtualize and still state the total (→ Data tables)
- Horizontal rails: prefer native overflow when it fits; if custom code suppresses or replaces user-agent scrolling, it must provide a single-pointer alternative such as previous/next controls (C9 → Horizontal rails and carousels)
- Z-index: token ramp by layer role; no literals, 9999 banned (→ Surface and elevation)
- Undo over confirm for reversible actions; confirm only the irreversible (→ Button rules)
- Optical alignment: audit shared page/section/card/form/row axes at narrow and wide breakpoints;
  distinguish intentional indentation from accidental 2–8px gutter drift; perception beats geometry
  only for documented ±1–2px nudges (→ Optical alignment)
- Commit: build grayscale-first; pass first-order AND second-order reflex checks (→ Design commitment check)
- Docs integrity: DESIGN.md absolute claims (zero/no/never/all) are checked against inline styles, not just tokens; a code comment citing an override must resolve to a real override-log entry (scan.sh #25) (→ Documentation integrity)

## Decision-point routing

| Building… | Open rules.md section |
|---|---|
| Screen canvas / surfaces / shadows | Choosing the canvas; Surface and elevation; Shadows |
| First card or list | Border radius scale; List and card patterns |
| Buttons / CTAs | Button rules; Tap targets |
| Type system | Typography; Japanese/CJK (Platform notes) |
| Colour system | Color — semantic roles; Color strategy; Color contrast; Page-level visual hierarchy |
| Chart / stats | Data visualization |
| Images / avatars | Imagery and avatars; Text on imagery |
| Presence / availability / avatar status | Presence and availability; Quality requirements |
| Horizontal rail / carousel / media scroller | Horizontal rails and carousels; Accessible semantics and keyboard; Platform notes |
| Forms | Form and input rules |
| Modal / sheet | Modal and sheet weight |
| Motion / animation / a microinteraction | Motion; then `motion-recipes.md` for the concrete recipe |
| Microcopy | Copy hygiene |
| Any gradient | Gradients — when and how |
| **Behaviour over time: states, failure, interruption, recovery** | **Behaviour, states and recovery** — the single owner for state kinds, runtime hazards, control-type semantics and form behaviour under failure |
| States / density / settings pages | Behaviour, states and recovery; Cognitive load; Page-level visual hierarchy; Button rules |
| Data table | Data tables |
| Web layout / breakpoints | Responsive and adaptive layout |
| Named/unclear/mixed visual style | `design-directions.md` → selection, composition, and review |
| External reference / screenshot / component library / found DESIGN.md | `reference-intake.md` → record provenance, extract principles, adopt nothing as authority |
| Material / Android / Material-token project | `material-3.md` → adoption boundary, system layers, components, adaptive layout |
| **AI or agentic product** (model output, assistant, agent acting for the user) | AI and agentic interfaces — *conditional section, skip for non-AI products* |
| Web/SaaS structure: large collections, current location, URLs, back/refresh/deep links, title↔nav↔breadcrumb agreement | `ia-review` → Web and SaaS structure (the persistence half stays here: Behaviour, states and recovery → Runtime hazards) |
| Accessibility semantics | Accessible semantics and keyboard |
| Whole design system / tokens.json | ui-design-system skill (Create/Extract/Coherence audit/Drift) + `validate-tokens.py` gate |
| A refinement verb (polish, bolder, harden …), or an ambiguous "improve this" request | `design-refine` — read-only lane by default, edits only on a go-ahead; DESIGN.md and tokens.json stay owned by ui-design-system |
| **AI or agentic feature** — a model or agent at the centre of the interaction | `ai-agentic-build.md` — the does-AI-add-value gate and the autonomy spectrum, then rules.md → AI and agentic interfaces |
| DESIGN.md claims / override citations | Documentation integrity |
