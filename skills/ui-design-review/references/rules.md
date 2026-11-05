# UI Design Rules

Shared reference for `ui-design-principles` and `ui-design-review`. Contains the complete rule set —
three decision tiers (quality requirements, design decision gates, AI-tell risk indicators) plus the
design standards. Nothing here is banned absolutely except the Tier-1 quality requirements;
everything else earns its place through legible, systematic reasoning. Both skills load this file.

<!-- MIRROR INVARIANT: this file is a byte-for-byte mirror of ui-design-review/references/rules.md.
     Do NOT edit one copy alone. Edit one, then re-mirror the other (cp) so both are identical.
     Enforced by ui-design-review/tests/check-mirror.sh (run from ui-design-review/tests/run.sh). -->

Maintainer evidence IDs `C1`–`C27` below refer to
`evidence/reviews/ui-pattern-gaps-2026-09-30.md` in the kit repository. They preserve source scope
and uncertainty; they are traceability labels, not a new severity scale.


## Contents

**Read this file by range, never whole.** At ~1,700 lines a full read costs more than the entire
intended build path — `quick-rules.md` names the section, and the line numbers below are how you
open just that section. They are recomputed and checked by `ui-design-principles/tests/run.sh`,
so a stale range fails a test instead of silently sending a reader to the wrong place.

- [Decision tiers and the override process](#decision-tiers-and-the-override-process)  · lines 66–125
- [Quality requirements](#quality-requirements) — correctness and completeness, non-negotiable  · lines 126–141
- [Design decision gates](#design-decision-gates) — patterns that must earn their place with legible, systematic reasoning  · lines 142–291
- [AI-tell risk indicators](#ai-tell-risk-indicators) — scrutiny triggers, not automatic failures; weight rises when several co-occur  · lines 292–327
- [Design intent — the four registers](#design-intent--the-four-registers) — read before the aesthetic; it scopes which other rules apply  · lines 330–368
- [Border radius scale](#border-radius-scale)  · lines 369–391
- [Shadows](#shadows) — incl. light-from-the-sky anatomy  · lines 392–423
- [Surface and elevation](#surface-and-elevation) — incl. choosing the canvas, separation toolkit  · lines 424–506
- [Gradients — when and how](#gradients--when-and-how)  · lines 507–524
- [Text on imagery](#text-on-imagery)  · lines 525–542
- [Icon system](#icon-system)  · lines 543–554
- [Optical alignment](#optical-alignment)  · lines 555–612
- [List and card patterns](#list-and-card-patterns)  · lines 613–651
- [Horizontal rails and carousels](#horizontal-rails-and-carousels)  · lines 652–691
- [Color — semantic roles](#color--semantic-roles)  · lines 692–775
- [Color strategy](#color-strategy)  · lines 776–829
- [Page-level visual hierarchy](#page-level-visual-hierarchy)  · lines 830–869
- [Data visualization](#data-visualization)  · lines 870–923
- [Data tables](#data-tables)  · lines 1319–1382
- [Imagery and avatars](#imagery-and-avatars)  · lines 924–939
- [Presence and availability](#presence-and-availability)  · lines 940–971
- [Accessible semantics and keyboard](#accessible-semantics-and-keyboard)  · lines 1227–1279
- [Responsive and adaptive layout](#responsive-and-adaptive-layout-web)  · lines 1280–1318
- [Typography](#typography)  · lines 972–1110
- [Color contrast](#color-contrast)  · lines 1111–1183
- [Tap targets](#tap-targets)  · lines 1184–1226
- [Button rules](#button-rules)  · lines 1383–1442
- [Form and input rules](#form-and-input-rules)  · lines 1443–1494
- [Spacing system](#spacing-system)  · lines 1495–1575
- [Behaviour, states and recovery](#behaviour-states-and-recovery) — states, runtime hazards, control-type semantics, form behaviour under failure  · lines 1576–1741
- [AI and agentic interfaces](#ai-and-agentic-interfaces) — **conditional**: load only when the product's core interaction is a model or an agent  · lines 1742–1853
- [Copy hygiene](#copy-hygiene)  · lines 1854–1889
- [Information hierarchy](#information-hierarchy)  · lines 1890–1901
- [Cognitive load and interaction density](#cognitive-load-and-interaction-density)  · lines 1902–1929
- [Modal and sheet weight](#modal-and-sheet-weight)  · lines 1930–1974
- [Motion](#motion)  · lines 1975–2076
- [Platform notes](#platform-notes)  · lines 2077–2218
- [Design commitment check](#design-commitment-check)  · lines 2219–2233
- [Documentation integrity — absolute claims must be verifiable](#documentation-integrity--absolute-claims-must-be-verifiable)  · lines 2234–2255

---

## Decision tiers and the override process

The rules below sort into three tiers. **Only the first is a hard line. Nothing in the other two is
banned absolutely — but a Tier-2 pattern is *presumed a defect by default*, and the design carries
the burden of a documented, functional justification to keep it.** Absence of that justification —
silence, "no reason found," or a reason that rests only on consistency/polish — *is* the finding;
the pattern's mere presence, unjustified, resolves to remove. The reviewer still assesses
*reasoning* rather than reflexively failing a technique that names a real job (the anti-dumb-linter
carve-outs stand — see the functional exceptions throughout), but the burden has flipped: "I
couldn't find a reason to keep it" now resolves to **remove it**, not leave it. "Failure: gradient
found" is still the wrong *phrasing*; "the gradient has no defined role and isn't documented —
presumed decorative, remove or justify" is the right one.

**Tier 1 — Quality requirements.** Correctness, completeness, accessibility, or demonstrated
performance failure. Wrong regardless of aesthetic intent; cannot be overridden. A failed contrast
ratio, inaccessible semantics, or a missing reachable/error state is a defect, not taste.
Performance patterns require scale and evidence: a layout animation across a large or repeated
subtree that measurably janks is a defect; a small isolated transition is a reviewable risk, not
automatically a correctness failure.

**Tier 2 — Design decision gates.** The patterns that read as AI slop *by default* — not because
they're forbidden, but because their unexplained use signals no decision was made. A gate is not a
"no"; it is a set of questions the choice must survive. A pattern passes the gate when it satisfies
**all** of:

1. **Purpose** — it does a specific job here (not "looks better").
2. **Direction-fit** — it follows from the Step-1 aesthetic commitment, the product, the audience,
   and the platform.
3. **Systematic** — applied as a system decision, not a one-off; the same choice recurs wherever the
   same condition does.
4. **Still communicates without it** — hierarchy/meaning don't *depend* on the effect (it survives
   grayscale / removal).
5. **No accessibility or hierarchy cost** — it doesn't break contrast, tap targets, or the reading
   order.
6. **Legible** — the reasoning is written where a reviewer can find it (`DESIGN.md` override log),
   not carried in the author's head, and applied where an existing brand/product language already
   points. Legibility requires the decision to **pre-date** the use: an override entry created in
   the *same* change that introduces the pattern is self-justification, not legibility — and is
   itself a finding.

**The bar is legible intent.** An unexplained choice reads as AI even when it's good — "I don't
understand why this button has a gradient" is a failed review regardless of the gradient's quality.
Some treatments also carry a cultural tax: guilt-by-association from AI-era overuse, so the intent
must be strong enough to outweigh the association *and* legible enough that the design itself
communicates it. A pattern that clears the six questions and is logged in `DESIGN.md` is a design
decision; the same pattern dropped in unexplained is a tell.

- **Legitimate:** a brand whose identity IS a warm cream palette uses a warm canvas, logged in
  `DESIGN.md`. Purpose, direction-fit, systematic, legible — it clears the gate.
- **Illegitimate:** the model self-decides a gradient button "looks better here." No purpose, no
  system, nothing written — the gate exists for exactly this.

**Tier 3 — AI-tell risk indicators.** Assemblies and co-occurrences that are *scrutiny triggers, not
failures on their own* (centered-hero assembly, icon-tile feature-card grids, badge-above-H1, stat
banner rows). One in isolation may be fine; several together is strong evidence the screen was
assembled from defaults rather than designed. Raise scrutiny as they stack — see the [AI-tell risk
indicators](#ai-tell-risk-indicators) tier.

---

## Quality requirements

**Tier 1.** These cannot be overridden. They are not taste decisions — they are correctness,
completeness, accessibility, or performance failures. (Formerly "hard bans.")

| Requirement (violation) | Why it's non-negotiable |
|-----|--------------|
| **Placeholder text (Lorem Ipsum) in production** | Unfinished work shipped as complete. |
| **Demonstrably harmful layout animation** | Animating layout properties can trigger repeated layout. Treat large/repeated animations or measured jank as defects. For a small isolated control, review duration, affected subtree, frequency, and device performance before ruling; prefer `transform`/`opacity` when they preserve the intended geometry. |
| **No edge-case states designed** | Loading, empty, error, and zero-data states are part of the feature, not optional polish. A screen without these states is incomplete. |
| **Colour, desaturation, or opacity as the only state signal** (`C1`, `C27`) | A change within the colour channel is still colour-only: hue, greying, fading, desaturation, or opacity may reinforce state but must not carry meaningful state alone. Pair it with a persistent non-colour channel — an icon/mark, label, shape, border, weight, size, or position — and expose the state programmatically where it matters. The second channel does not have to be a check or icon: for a single-select segmented/tab control the selected item's fill + border + weight + position can already provide it (see *Single-select vs multi-select* under Color — semantic roles). There is no blanket prohibition on a grey avatar; the failure is state becoming ambiguous or unavailable when the appearance treatment is removed. |
| **Controls without a persistent accessible name/context** | Placeholder-only data-entry fields lose context after entry. Visible labels are the strong default for forms; compact search/filter controls may use another persistent accessible labelling pattern when purpose remains clear before, during, and after input. |
| **Semantic-palette leak** (semantic/index ramp used for decoration) | The palette that is supposed to *mean* something — safety, order, status, category — must not be spent on non-semantic decoration. Drawing a decorative bar, border, or fill from the semantic/index ramp (e.g. phase bars from `index-a/b/c`, a "goal" label tinted from the status ramp) corrupts the meaning-carrying layer: once the ramp appears where it encodes nothing, it can no longer be trusted where it encodes something. This is a correctness failure in the signalling system, not a taste call — it is **not waivable by an override** and essentially never clears sign-off. Fix: carry decoration/hierarchy with the neutral ramp, surface, weight, or structure; reserve the semantic ramp for real encoded meaning. |

---

## Design decision gates

**Tier 2.** These are the reach-for-it defaults that produce generic output *when unexamined*. Each
row below names a pattern and its usual failure. Read it as a **gate, not a ban — but a gate whose
default is closed**: the pattern is *presumed a defect*, and becomes available only to a design that
actively runs it through the six gate questions (Purpose · Direction-fit · Systematic ·
Still-communicates-without-it · No a11y/hierarchy cost · Legible) *and logs the decision in*
`DESIGN.md`. The reviewer assesses whether that documented reasoning exists and holds; **absence of
it is the finding, not a reason to wait for proof of failure.** An unexplained instance is a defect
to remove-or-justify; a justified, documented, systematic one is a design decision. Consistency
alone does not clear the gate — a repeated decorative gesture is systematic *decoration* (see the
"What does NOT count as justification" list under *Decision tiers and the override process* → this
file's adjudication guidance, mirrored in `design-refine/references/review/adjudication.md`).
(Formerly "default bans.")

**Reviewer stance — assess the reasoning, both directions:**

- ✗ *"Gradient on the primary button. No entry in DESIGN.md, used on one button only, no stated
  purpose — the gate isn't cleared. Finding: reads as decoration/AI-default."*
- ✓ *"Gradient on the onboarding hero. DESIGN.md logs it: brand palette, immersive surface, 2 stops
  within 40° hue, one direction system-wide, hierarchy survives grayscale. Gate cleared — no
  issue."*

The verdict language is the tell: write "the gradient lacks a defined role and isn't documented,"
never "failure: gradient found."

### Study-proof authority

For `/direction-study` proofs, the dated human reference-intake answer is the authority for
approved Tier-2 traits. Record the trait, scope, purpose and answer in the study brief and link it
from the provisional contract; no production `DESIGN.md`, tokens or scan exception is required.
The human may approve in the current session before proof-building. This is not model-authored
self-authorization. Pending or declined traits are not silently implemented or silently removed;
settle the conflict with the person before proposing the affected direction.

In this mode, aesthetic defaults such as one accent, a tinted near-white canvas, a radius ceiling,
flat cards or a single family are fallback heuristics, not quality floors. Choose values from the
approved reference intent and the content. Gradients, layering, large radii, illustration and other
approved traits still need a clear role and a coherent implementation. Contrast, readable type,
focus, interaction clarity, responsive integrity and reduced-motion requirements remain binding.
Review the rendered result for evidence of harm or generic assembly; neither the presence nor the
absence of a named pattern establishes quality. Production authoring below resumes after selection.

### Authoring resolution — ship the default, propose the pattern

When *authoring* a Tier-2 gated pattern (the recurring five — gradient, elevation shadow,
glass/blur, oversized radius, dark theme — plus colored side-stripe borders and tinted shadows),
"propose" does **not** mean "implement the gated form and write its authorizing `DESIGN.md` entry in
the same change." That is self-authored justification, and self-authored justification is not
legibility (gate question 6). Instead:

- **Implement the default (flat / solid / neutral) form now** — the form that needs no gate.
- **Surface the gated pattern as a labeled suggestion** carrying its six-gate justification (Purpose
  · Direction-fit · Systematic · Still-communicates-without-it · No a11y/hierarchy cost · Legible),
  for a human to ratify.

**A `DESIGN.md` the model wrote is a proposal, not an authority.** The gate asks whether a decision
was made and logged; it cannot distinguish a human's decision from the model's own output written
down in the same session. When the system file was authored (or materially extended) by the model in
this session, it does not carry authority over that session's own gated choices — citing it is the
self-authored justification this section already rejects, one step earlier in the chain. Two
consequences:
- **Pre-existing beats same-session.** An override entry authored *before* the work began, by a
  human or in a ratified prior session, clears the gate. One written alongside the code it
  authorizes does not.
- **The system itself is reviewable.** A design system can be internally coherent, cleanly
  documented, consistently applied — and made of unexamined defaults. Coherence checks measure
  agreement between tokens; they say nothing about whether the tokens were chosen. When a defect
  traces back to a value in `DESIGN.md`, the finding is against the *system*, not just the screen,
  and "the system says so" is the thing being questioned rather than the answer.

This generalises beyond the recurring five to any gated choice the model both made and documented —
type stack, display scale, spacing rhythm, canvas colour.

The gated form ships only after **(a)** a human ratifies the proposal, or **(b)** a **pre-existing**
`DESIGN.md` override entry (resolved through `scan-exceptions.conf`) already authorizes it. Absence
of a prior decision resolves as "no": ship the default, keep the pattern as a proposal. This
restores the hard-ban's friction at the point of *shipping* while keeping the escape hatch at the
point of *proposing* — good design surfaces as a reviewable proposal instead of being silently
dropped, and the model cannot self-authorize the pattern into the code. (The review-side mirror of
this resolution is in `design-refine/references/review/adjudication.md` → NEEDS INTENT.)

### Decision gates for the recurring five

The five patterns that most often show up unexamined. Each is legitimate through its gate; the
questions below are how the reviewer (and the author) tell a decision from a reflex.

| Pattern | Passes the gate when… | Fails when… |
|---------|----------------------|-------------|
| **Gradient** (button/surface) | Documented in DESIGN.md: named surfaces, 2–3 stops within ~90° hue (or single-hue), one direction system-wide, hierarchy survives grayscale, no contrast interference. The one button gradient is the same-hue ≤5% lightness light-cue applied to *every* primary. | No DESIGN.md entry; per-element; two distant hues through gray; hierarchy leans on it; on chrome/text. |
| **Shadow** for elevation | Neutral (near-black), role-based from the `--elev` ramp, positive y-offset, spent only where the element floats/is tappable (elevation-by-role). | Brand-tinted or glow; offsetless `0 0`; on a static data card; eye-tuned per element. |
| **Glass / blur** | On native chrome that overlays *scrolling* content (nav/tab bar, sheet) — one place, justified by the overlay relationship. | On resting content cards/panels as a default surface treatment; more than the one justified instance. |
| **Oversized radius** (>16px) | A committed soft/playful **mobile** direction sets 20–24px as one named token, and every nested radius derives concentrically (inner = outer − gap). | Ad-hoc large radius; mixed radii; nesting that ignores the concentric rule. |
| **Dark theme** | A system feature paired with light, or a committed aesthetic direction in DESIGN.md; contrast re-checked on the dark surface; accents desaturated. | Dark-by-default "because it looks premium"; medium-grey body text failing AA; no light pair. |

### Visual

| Default-off pattern | Why | Fix (or the gate it must clear) |
|-----|-----|-----|
| **Gradient buttons / interactive elements** | Single most recognizable AI-design tell. Adds false depth with no meaning. | Flat solid color from the semantic color system. Exception: a same-hue vertical gradient of ≤ ~5% lightness on a primary button is a light-source cue (top lighter — see Shadows), not decoration. Commit it in DESIGN.md and apply it to every primary. |
| **Gradient text** | `background-clip: text` + gradient. Decorative, never meaningful. | Solid color — emphasize with weight or size instead |
| **Colored side-stripe borders** | `border-left/right` as a colored accent on cards, lists, callouts. Always a shortcut. | Full border, background tint, leading icon, or nothing |
| **Decorative accent border / stripe / top-bar** | A coloured top-bar, side-stripe, or accent border on a card or section that **encodes no data** — presumed decorative by default. Hierarchy and order are carried by structure, weight, or surface, not an applied accent. "The three phases each get a coloured bar" does **not** justify it: consistency is systematic decoration, and encoding only *position* (leftmost = phase 1) is not encoding meaning. Clears the gate only when the colour maps to a **real documented status/category** (not mere order) and is logged. If the colour comes from the semantic/index ramp, it is a Tier-1 semantic-palette leak, not this gate. | Carry order/hierarchy with structure, weight, spacing, or surface; drop the accent, or map it to a real status and log it |
| **Ghost-card pattern** | `border: 1px solid` AND `box-shadow` with blur ≥ 16px on the same element. Looks unresolved. | Pick one: solid border, OR shadow ≤ 8px blur |
| **Border radius ≥ 24px on cards / containers** | Ad-hoc oversized radius reads as AI default. The deeper tell is incoherence: mixed radii, or nesting that ignores geometry. | Cards top out at 16px by default. A soft/playful **mobile** aesthetic commitment may set 20–24px as the system value — one named token, committed in DESIGN.md (Habee-class apps do this). Every nested radius then follows the concentric-radius rule (see Border radius scale). |
| **Warm/cream/sand backgrounds as unmotivated default** | Token names like `--paper`, `--cream`, `--sand`, `--bone`, `--linen` are tells in themselves. The ban is on warm tints unrelated to the brand — not on warmth. | Derive the canvas from the brand hue at 2–5% saturation (see Choosing the canvas). A warm canvas is legitimate exactly when the brand is warm (Habee: yellow brand → warm neutral canvas) and it's committed in DESIGN.md. Saturation above ~8% reads as "cream paper" regardless of motivation. |
| **Purple gradient on white** | The single most clichéd AI color scheme. | Define a real color strategy before picking any gradient |
| **Glassmorphism as decoration** | Blurs and glass cards as default surface treatment. | Purposeful only — one element maximum, justified by context |
| **Generic feature-card template** | The icon-tile + heading + blurb card, ×3–6, is the universal AI template. The tell is the template — and screens mixing 4+ card treatments — not repetition itself. | Design one strong card primitive and repeat it consistently (repetition of a considered primitive is a signature, not a tell), or use a non-card pattern. Never the icon/heading/blurb template; never 4+ different card treatments on one screen. |
| **Nested cards** | Cards inside cards. No cost function for visual weight. | Flatten with spacing, typography, and dividers |
| **Card wrapping individual setting rows** | Each toggle or setting row gets its own card container. The card boundary implies "I am a distinct object" when the row is just a list item. Inflates visual weight with no semantic meaning. | One card container per settings section; rows inside it separated by dividers |
| **Unmotivated cards on homogeneous lists** | Repeating a heavy container around every same-type item can obscure grouping and inflate visual weight. | Start with rows/dividers for dense scanning; use cards when grouping, variable content, drag behaviour, selection, or the established product language gives the boundary a real job. |
| **Eyebrow text on every section** | Small all-caps tracked labels above every heading. AI editorial grammar. | One deliberate kicker as a system; otherwise remove |
| **Numbered section markers (01 / 02 / 03)** | Display numbers as section labels when content is not a true sequence. | Remove, or use real structural hierarchy |
| **Rounded-square icon tile above heading** | Small icon in a rounded-square container above a heading. The universal AI feature-card template. | Side-by-side icon + heading, or icon in flow without its own container |
| **Hand-drawn / sketchy SVG illustrations** | Crude hand-coded SVG scenes. Reads as amateurish. | Real assets or no illustration |
| **Decorative stripe / grid backgrounds** | Diagonal stripes or CSS grid overlays as texture. | Plain surface, product structure, or real assets |
| **Radial glow orbs / dark aurora background** | Radial gradients behind hero content. Learned as "premium dark mode" without purpose. | Plain dark surface, or a purposeful background image |
| **Neon / high-chroma palette on dark surface** | 5+ high-chroma accent colors on a dark background. Dribbble "modern SaaS" by reflex. | One saturated accent maximum; all others from the semantic role system |
| **Emoji as system / chrome icons** | Core UI elements (buttons, nav, notifications) use emoji. Chrome must stay visually distinct from content — when the content itself is emoji or emoji-labelled categories, emoji chrome destroys the distinction entirely. | SVG icon set throughout system chrome. Emoji in content and section labels is a legitimate JP consumer-app convention when it's a documented system (one emoji per category, logged in DESIGN.md) — never in buttons, nav, or notifications. |
| **Status dots on every item** | Colored dots on every list item with no semantic system. | Dots only where real status exists; use a label if the state isn't obvious from color |
| **Rainbow side tabs / multicolored card accents** | Multiple competing accent colors on adjacent card borders. No color budget. | One brand accent; semantic colors only (success/warning/error); never decorative |
| **Oversized italic serif hero headline** | A frequently repeated generic landing-page treatment when unrelated to the brand or content. | Set it roman, choose a product-specific display treatment, or document why it fits |
| **Image scale or rotate on hover** | Recurring AI-generated signature with no interaction meaning. | Let imagery sit still; use a color overlay or caption reveal if feedback is needed |
| **Generic fonts as the design choice** | A default system/grotesk—or a fashionable display face—used without a product-specific typographic reason. | Choose type for the product's register; a utilitarian system font may be correct when intentionally handled |
| **Translucent fills on resting content cards** | `rgba(255,255,255,0.7–0.9)` on cards/panels/rows over a tinted or gradient canvas never resolves to a clean surface; the colour varies across the card and separation reads as mush. Glassmorphism's quieter cousin — a top cheapness tell on light UI. | Opaque solid fill for all resting content surfaces. Reserve translucency + blur for native chrome that overlays scrolling content (nav/tab bars, sheets) — never content cards. |
| **Gradient or glow layer as the page/app background** | A `linear/radial-gradient` body background, or fixed "ambient" glow blobs behind content, is the light-mode twin of the banned dark-aurora orbs. Behind a card it destroys the value step. | One flat solid canvas colour. Separation comes from the surface system, not the background. |
| **Brand-tinted or coloured shadows for elevation** | Teal/purple-tinted `box-shadow`, or `glow` tokens used to lift elements, reads as decoration not depth — and at low opacity it's invisible, so nothing separates. | Neutral near-black shadow (`rgba(17,24,22,…)`). Glows are never an elevation tool. |
| **Pill badge directly above the hero H1** | The "✨ Now with AI" chip stacked over a centered headline — a near-universal slop marker. | Cut it, or fold the message into the headline or subhead |
| **Eyebrow / kicker / mono-cap label directly above the hero H1** | The *text* twin of the badge above — same slot, same job, and it survives every other rule in this file because they are all scoped to **repetition**. "Eyebrow on *every* section" and the Tier-3 co-occurrence count both permit a single instance, and the hero is where that allowance invariably gets spent. Scoped here to the hero specifically: an eyebrow above the hero H1 is **presumed decorative regardless of whether it repeats**. | Fold the message into the headline or the subhead, or cut it. It clears the gate only through Tier 2 with a stated purpose logged in `DESIGN.md` — and *"it labels the section"* is not a purpose when the H1 directly below already names it. A named brand system that uses kickers deliberately and systematically can still clear this; what changes is that the hero instance is no longer the free one. Where a kicker does clear the gate, it stacks vertically above the heading — never tag-left / heading-right. |
| **Stat banner row** | 3–4 big numbers with labels in a horizontal band, used as decorative scaffold. | Only with real, sourced numbers the user cares about; otherwise remove |
| **Permanent dark theme as unmotivated default** | Dark-by-default used as atmosphere without product/platform rationale, often with weak secondary-text contrast. | Treat dark mode as a system feature or committed aesthetic direction, and verify every contrast relationship |
| **The default SaaS nav bar** | Wordmark hard-left · 3–5 inline text links centred or right-grouped · a CTA button hard-right · full viewport width · sticky · white background · 1px hairline border-bottom. The most-recognised navigation fingerprint, emitted by default because nearly every SaaS site in the training data shipped it. Its failure is that it is **genre-blind**: the identical shape lands on a wedding photographer's portfolio, a bakery, a B2B dashboard and a manifesto. When the nav cannot tell you what kind of product you are on, the page was templated rather than designed. A minimal two-link version of it is the weakest case of all. | Decide the navigation archetype deliberately and record it in `DESIGN.md` (see Platform notes → Page navigation (web)). Alternatives that are equally standard and not fingerprints: a detached floating pill, a masthead, a side rail, an edge-aligned minimal bar, a command-palette-first nav, a banner-plus-retract. Reach for the bare wordmark-plus-two-links shape only when the page genuinely has two destinations. A dense, deliberately-composed marketing bar (wordmark · 4–6 centred links · CTA) is a legitimate archetype — what is presumed a defect is the *unexamined reflex*, not the shape's existence. |
| **Centered-hero assembly** | Badge + centered H1 in a generic sans + two-button pair: the complete AI landing-page template, even when each part passes individually. | Break the assembly: asymmetric layout, product-first hero, or a real screenshot as the anchor |

### Motion

| Default-off pattern | Why | Fix (or the gate it must clear) |
|-----|-----|-----|
| **Bounce / elastic easing** | Spring physics on flat UI surfaces. Bounce is not a property of digital panels. | ease-out-quart/quint/expo. Reserve spring for physically simulated elements (drag, scroll-linked) |

### Copy

| Default-off pattern | Why | Fix (or the gate it must clear) |
|-----|-----|-----|
| **Marketing buzzwords in UI copy** | "Supercharge," "streamline," "empower," "enterprise-grade," "world-class," "next-generation," "game-changing" in buttons, headings, microcopy. | Specific verb + noun describing what the product literally does |
| **Em-dash overuse** | More than 2 em-dashes per text block is an AI cadence tell. | Use commas, colons, periods, or parentheses |

---

## AI-tell risk indicators

**Tier 3 — scrutiny, not failure.** These are *assemblies* — combinations of individually-defensible
choices that, stacked, are the signature of a screen generated from defaults rather than designed.
No single indicator is a finding on its own; a considered design can carry one deliberately. **The
evidence is cumulative: weight rises as they co-occur.** One is a shrug; three on the same screen is
a strong tell worth a direct conversation about whether any decision was actually made.

The reviewer treats these as a co-occurrence count, not a checklist of bans:

- **Centered-hero assembly** — badge + centered H1 in a generic sans + a two-button pair. Each part
  passes alone; together they are the complete AI landing-page template.
- **Icon-tile feature-card grid** — the rounded-square-icon + heading + blurb card, repeated ×3–6.
  The template is the tell, not the repetition.
- **Badge-above-H1** — the "✨ Now with AI" chip stacked over the headline, or its text twin, the
  hero eyebrow/kicker above the H1 (which is separately gated under *Design decision gates* — it
  does not need a second instance to be a finding).
- **Stat banner row** — 3–4 big numbers in a horizontal band used as decorative scaffold rather than
  real, sourced data.
- **Eyebrow-on-every-section** — small all-caps tracked labels above every heading (AI editorial
  grammar).
- **Numbered section markers** (01 / 02 / 03) where the content is not a true sequence.
- **Symmetry-everywhere** — every section centered, equal weight, no focal asymmetry.

**How to weigh it:** name the indicators you see and count them. One, with a plausible reason, is
noted and passed. Two or more with no unifying rationale downgrade **Contextual fitness / Craft**
and warrant the first-principles question: *was this designed, or assembled?* The fix is never
"remove the gradient" — it's "break the assembly": introduce asymmetry, lead with the product,
anchor on a real screenshot, cut the scaffold.

The individual patterns keep their detailed rows under [Design decision
gates](#design-decision-gates) (each still has its own gate); this tier is about what their
**combination** signals.

---

## Design standards

### Design intent — the four registers

**Settle the intent before the aesthetic, because it decides which of the rules below even apply.**
This file previously split the world in two — product UI (design serves the product) and brand UI
(design *is* the product). That split is right as far as it goes and it is too coarse: two of the
four registers fall between its poles, and they are exactly the two where product-UI and brand-UI
rules actively mislead.

| Register | The user is there to… | The design's job | Common surfaces |
|---|---|---|---|
| **Persuade** | decide and act | Make the offer clear and give a reason to take the next step | Landing pages, campaigns, pricing |
| **Operate** | complete a task | Make frequent actions easy to find and carry out | Dashboards, editors, product UI, tools |
| **Read** | understand something | Clear structure, readable type, a comfortable pace | Documentation, guides, help, long-form |
| **Experience** | explore the work | **Recede.** Let the work itself lead | Portfolios, galleries, showcases, case studies |

*Persuade* and *Operate* are the old brand-UI / product-UI poles. The two additions matter because:

- **Read is not Operate.** Judging a documentation page by action density, information density and
  tap-target economy produces a cramped, hostile page. Read optimises **measure, rhythm and
  scanning-to-reading transition** — 65–75ch, generous leading, headings that survive being skimmed,
  and *few* actions rather than efficient ones. A docs surface with a dashboard's density is a
  common and confident-looking failure.
- **Experience is not Persuade.** Both are visually ambitious, and their goals are opposite. In
  Persuade the design carries the message; in Experience **the design is the frame and the work is
  the subject**, so chrome, motion and typographic personality all step back. A portfolio designed
  with landing-page energy competes with the work it exists to show.

**A product usually needs more than one, and that is not incoherence.** The same product may need a
persuasive landing page, an efficient app, and readable docs. **Consistency operates *within* a
register and through the shared token system across them** — the palette, type scale, spacing scale
and component family hold; density, motion budget, type sizing, action prominence and decorative
allowance are register decisions and are *expected* to differ. Judging every surface against one
register is the mistake; so is letting "different register" excuse a different button.

**Where the register scopes a rule, this file says so** — see *Font count is a register decision*
under Typography, the boldness ceiling in *Design decision gates*, and the density guidance in
*Cognitive load and interaction density*. When a rule reads as absolute but obviously suits one
register, name the register you are in and say what you are doing differently, in `DESIGN.md`.

### Border radius scale

Define these tokens and use them consistently. Never exceed `--radius-lg` on cards or containers
(unless the design system explicitly overrides with documented intent).

```
--radius-sm:   4–8px  → inputs, small chips, tooltips
--radius-md:   12px   → cards, panels, modals
--radius-lg:   16px   → large containers (max for cards by default)
--radius-pill: 999px  → tags, badge pills
```

Radius and spacing must feel related — tight spacing calls for smaller radius. Never mix large pill
radius with standard rectangles in the same component without clear intent.

**Concentric radius rule.** When a rounded element sits inside a rounded container, the inner radius
follows the geometry: `inner-radius = outer-radius − gap`. An image inside a 24px-radius card with
8px padding gets 16px radius. Equal inner and outer radii are what make AI-built cards look subtly
"off". This rule also governs the playful-brand override: a 20–24px card system is fine only if
every nested radius derives from it.

---

### Shadows

A shadow invisible at normal zoom isn't doing anything — remove it and use a border or
background-color instead.

- Shadow purpose: separate layers, not add texture
- Test at 100% zoom in both light and dark contexts
- Ghost-card rule: border OR shadow — never both as decoration (see Design decision gates)
- Maximum blur for structural UI shadows: 16px. Wider = decorative, not structural.
- Dark mode: shadows need higher opacity to remain visible (multiply by ~2 vs light mode values)
- Shadows are neutral (near-black), never brand-tinted. A brand-coloured or glow shadow is
  decoration, not elevation — use the neutral elevation ramp (see Surface and elevation).

**Light comes from the sky.** All depth cues assume one overhead light source — this is the
generative logic behind every shadow rule:

- Shadows sit **below** elements: the y-offset is positive and dominant over x. Soft shadows
  legitimately run blur at 3–4× the offset (our own ramp does; so does Material's). What's banned is
  the **offsetless glow** (`box-shadow: 0 0 Npx …`) — light doesn't radiate from inside a card.
- **Outset vs inset.** Raised elements (cards, buttons, popovers, sheets) get shadows below them.
  Carved elements (text inputs, wells, slider tracks, pressed states) are flat or subtly inset —
  never drop-shadowed.
- **Two-layer shadows read most naturally:** one tight contact shadow plus one soft diffuse, e.g. `0
  1px 2px rgba(17,24,22,0.10), 0 4px 12px rgba(17,24,22,0.06)`. Prefer this form for `--elev-1/2`
  over a single wide blur.
- The one legitimate button gradient follows the same physics: a same-hue vertical gradient, top
  lighter, ≤ ~5% lightness (see Design decision gates).
- Higher surface = slightly lighter fill (Material 3 tonal logic). In dark mode this value shift —
  not the shadow — is the primary elevation cue.

---

### Surface and elevation

On light UI a card is read as a distinct plane through a **deliberate value step**, not through
decoration. Get these four right and light-on-light looks professional; break any one and it looks
cheap.

1. **Value step.** This section describes the **light-canvas strategy** (off-white canvas,
   near-white cards) — the default for product UI. Pure `#FFFFFF` cards are the specific move *of
   that strategy*, not a universal law: a tonal, dark, or drenched system defines its own surface
   relationships (cards sit *lighter* than the canvas in dark mode; a tinted system may key every
   surface to the brand hue). What's invariant is the *relationship* — a deliberate, small value
   step between canvas and card — not the literal white. On a light canvas: canvas is a
   slightly-off-white neutral; resting content cards are pure `#FFFFFF`. Aim for a background↔card
   contrast of ~1.05–1.12:1 — small but present. Shipped references measure: iOS grouped 1.09, HR
   payroll 1.086, McDonald's 1.071, Habee 1.052.
2. **Opaque surfaces.** Resting content cards are opaque. No `rgba` white fills, no backdrop-blur on
   content. (Blur/translucency is legitimate only for native chrome that overlays scrolling content
   — nav/tab bars, sheets.)
3. **Flat canvas.** The page background is one solid colour. No gradient, no ambient glow.
4. **Separation is one honest signal, matched to role (elevation-by-role).** A drop shadow reads as
   "this floats / can be pressed" — so it's a signal, not decoration. Spend it only where that's
   true:
   - **Static / data card** (roster, settings group, list container, read-only content): opaque fill
     + value step + a delicate ~1px hairline. **No drop shadow** — a shadow here makes a
     non-tappable card look tappable. This is the iOS grouped-list model.
   - **Interactive / floating** (a card that is itself tappable, popover, menu, tab bar): neutral
     shadow (`--elev-1/2`), no hairline.
   - **Overlay** (sheet, modal): neutral shadow (`--elev-3`). Never a glow, never a coloured shadow.
     This resolves the classic tension between "section separation too subtle" and "cards that
     aren't tappable look tappable."

**Elevation ramp** — a small neutral set tied to layer role, not eye-tuned per element:

    --elev-0   none                              static / data cards (separate via hairline + value
    step) --elev-1   0 1px 2px  rgba(17,24,22,0.06)    tappable cards, tab bar --elev-2   0 4px 12px
    rgba(17,24,22,0.08)    menus, popovers, key raised / interactive cards --elev-3   0 12px 32px
    rgba(17,24,22,0.12)   sheets, modals

Dark mode roughly doubles these opacities. Structural card shadows stay ≤ 16px blur; only the
sheet/modal layer goes wider.

**The ramp is generative:** as elevation rises, blur and offset grow while opacity *falls*.
Extending the ramp (an `--elev-4`) with rising opacity produces heavy, dark high-elevation shadows —
the opposite of how distance from a surface reads.

**Z-index ramp.** Stacking order gets the same treatment as elevation: one token ramp tied to layer
role — content < sticky chrome < dropdown/popover < sheet/modal < toast. No literal z-index values
in components; `z-index: 9999` (and the arms race it starts) is a ban.

**Choosing the canvas — decision procedure.** Never pick the canvas in isolation; derive it:

1. Start from the brand hue. Desaturate to 2–5% saturation, lightness 96–98% (HSL). Zero-chroma gray
   is the fallback, not the goal — a dead-gray canvas under a colourful brand feels disconnected.
   Saturate neutrals toward the brand hue, including text inks (never dead black: near-black ink
   carries a trace of the brand hue).
2. Cards are pure `#FFFFFF`, opaque. Verify the value step lands at 1.05–1.12:1.
3. Derive the hairline border and muted text from the same hue family — build **one tinted-neutral
   ramp (~9 steps)** and pick canvas, border, muted text, and ink from it. One ramp = automatic
   coherence between canvas, borders, and shadows. This is the highest-leverage fix for "canvas,
   borders, and shading never quite match."
4. Test: a white card on the canvas at 100% zoom. Card boundary invisible → darken the canvas one
   ramp step. Canvas reads as a colour rather than off-white → desaturate.

**Separation toolkit — ordering.** To separate any two elements, try in this order and stop at the
first that works:

1. Whitespace alone
2. A background value step
3. A hairline divider (not a full box)
4. A bordered or shadowed container

Reaching for a bordered box first is the amateur move — most separation problems are solved by space
(fewer boxes, fewer borders, more whitespace). By the time you reach step 4, elevation-by-role
(above) decides border vs shadow.

**Dark mode as a system** (when committed): invert the ramp — cards sit *lighter* than the canvas
(elevation = lighter fill, the Material tonal model), shadows double in opacity but do less of the
work. Desaturate the brand accent slightly (full-chroma accents vibrate on dark) and check every
contrast pair again — muted text that passed on light usually fails on dark. Dark mode is a second
surface system derived from the same ramp, not a colour swap.

---

### Gradients — when and how

Gradients are off by default on chrome, buttons (except the same-hue light cue), text, and the app
canvas — each is available only through the Tier-2 gate. When a gradient is legitimate —
brand/hero/drenched surfaces, data viz, illustration, logomark — craft rules apply:

- **2–3 colour stops.** Two distant hues interpolate through gray in the middle — add a mid-stop
  along the colour-wheel path between them.
- Keep stops within ~90° of hue, or use one hue varying only lightness/saturation (the safest form,
  and what professional "subtle gradient" work actually is).
- **A coherent direction model** — keep one direction within a surface family or lighting model; a
  brand system may intentionally define different directions for distinct roles when documented.
- The design must survive grayscale: hierarchy may never depend on the gradient.
- Log it in DESIGN.md: which surfaces, which stops, which angle. A system decision, not a
  per-element effect.

---

### Text on imagery

Raw text or badges on an untreated photo is banned — it fails the moment the image changes. Pick one
method and systematize it:

| Method | Use |
|--------|-----|
| **Dark overlay** — 30–40% black over the whole image | Hero images, thumbnails with titles |
| **Text-in-a-pill/box** — solid or high-opacity fill behind the text | Badges and counts on photo cards |
| **Floor fade** — transparent → ~20% black gradient at the bottom, text at the bottom | Card imagery with captions; dark side down, consistent with overhead light |
| **Blur + darken region** | Native-style chrome over media |
| **Scrim** — elliptical translucent-black behind the text block | Subtle single-title overlays |

White text is the default on all of these. Test with every image the slot can receive, not just the
demo image.

---

### Icon system

- **One icon family** per product (SF Symbols / Material Symbols / Lucide / Phosphor — pick one),
  one stroke weight, sizes snapped to 16/20/24.
- Outline = inactive, filled = active is a legitimate two-state system for tab bars and toggles.
  Mixing families or stroke weights on one screen is an instant amateur tell.
- Icons align optically with adjacent text: match cap height, sit on the baseline grid.
- Emoji never in chrome (see Design decision gates). Where the product's own emoji or iconography IS
  the content, chrome must be visually distinct from it.

---

### Optical alignment

When geometry and perception disagree, perception wins — nudge, and document the nudge.

**Shared-axis and gutter audit.** Before polishing, trace the major vertical axes through the whole
screen: viewport/page gutter, section headings, card/list content, form labels and fields, and
repeated rows. Elements intended to share an axis use the same token-derived inset. A 2–8px drift
between nominally aligned left edges is rarely expressive; it usually exposes nested padding or an
off-scale margin. Preserve deliberate indentation for hierarchy and documented ±1–2px optical
compensation, but do not confuse either with accidental gutter drift. Re-run the audit at narrow and
wide breakpoints because container nesting often changes there.

- A play triangle centered geometrically in a circle looks off-center: shift it right ~4–8% of the
  diameter.
- Text in a button centers on **cap height**, not the bounding box — geometric centering sits text
  visibly high or low depending on the font's metrics.
- A button with a leading icon needs slightly less padding on the icon side; icons carry less visual
  mass than glyphs.
- Large display type hangs its left edge slightly past the container edge — glyph side-bearings
  otherwise create a visual indent.
- These nudges are the sanctioned grid breaks (see Spacing system): ±1–2px, on a specific element,
  annotated.

**A section head's alignment must cohere with the body it introduces.** Match it (a left-flush head
over left-flush content, a centred head over symmetric content) or break from it deliberately. The
failure is the *accidental* mismatch, and it has one dominant shape: a narrow head block that picks
up `margin-inline: auto` together with a `max-width`/`ch` cap, leaving it optically centred above
full-width, left-flush content beneath. Nothing about it is off-grid, so the axis audit above does
not catch it — check head-to-body alignment as its own pass. Centred, hanging, bottom-aligned and
asymmetric heads all remain available; what is being checked is intent, not uniformity.

**Declared padding is not rendered padding — measure the box, on all four sides.** The drift above
is described on the left edge because that is where shared axes live, but the defect is
axis-agnostic, and its most common form is a *bottom* edge: a container whose padding is correct in
the stylesheet yet gone at render, with the last child sitting flush against the container edge.
Reading the CSS cannot find this. The padding declaration is token-correct and passes every static
check; the loss is emergent, produced by a child competing with the padding for the same space.

The dominant shape is **`margin-block-start: auto` (or `margin-top: auto`) inside a fixed-height
flex column**. The auto margin's job is to absorb free space, so it absorbs *all* of it — including
the slack the padding box needed — and pins everything after it to the content edge. `justify-content:
space-between` on a fixed-height container does the same thing. The container does not overflow, no
scrollbar appears, and nothing looks wrong at page or section zoom; the gap is simply 2px where 30px
was specified. Fixed-height containers are where this concentrates, because a content-sized container
has slack to give.

The check is a measurement, not a glance: for each padded container holding a bottom-anchored child,
compare the rendered gap between the last child's outer edge and the container's border box against
the declared padding on that side. They must match within ~2px. In a browser or headless session,
`getBoundingClientRect()` on both plus `getComputedStyle().paddingBottom` is the whole test —
`container.getBoundingClientRect().bottom - lastChild.getBoundingClientRect().bottom` against the
computed value. Do this for any card, panel, sheet, or tile with pinned actions, a pinned footer row,
or an author/meta line pushed down by an auto margin, and repeat it at a narrow width, where extra
wrapping consumes the remaining slack first. **Screenshotting the whole page will not surface it** —
at section zoom a 2px gap and a 30px gap are a few pixels apart and both read as fine.

---

### List and card patterns

**The test: is this a homogeneous list of same-type items?**

If yes → plain list rows with dividers, regardless of whether items are tappable. If no → consider
cards.

This is consistent with Material Design and iOS HIG:

| Pattern | When | Example |
|---------|------|---------|
| **Plain list rows** | Homogeneous data — every item has the same structure | Members, chats, contacts, transactions, notifications |
| **Grouped card container** | A section of rows that belong together semantically | Settings section with title + 3 related toggles inside one card |
| **Individual cards** | Items with structurally variable or rich content — each item meaningfully differs in shape | Social posts (photo + caption + reactions + CTA vary per item) |

**Tappability is not the test.** Every chat list, contact list, and member list is tappable.
WhatsApp, LINE, iMessage all use plain rows — not because the items aren't interactive, but because
they're uniform in structure.

**Settings screens specifically:**
- Correct: one card container per section group, divider-separated rows inside
- Wrong: each individual toggle or nav row wrapped in its own card

**When cards on a list are legitimate:** each item shows substantively different content (one has an
image, another a chart, another a long description). The variable structure is what the card
boundary communicates — "parse this item on its own terms." Uniform items don't need that signal.

**One primitive ≠ uniform prominence.** Repeating one card primitive is a signature; giving every
instance equal size, position, and emphasis is a hierarchy failure ("everything looks the same, I
don't know where to look"). Vary prominence *within* the primitive system — the key metric gets the
large variant or the top slot; secondary data gets the compact variant. Order, size, and emphasis
carry priority; the primitive carries consistency.

For the whole-screen ranking procedure, settings/action-dense pages, squint test, and grayscale
verification, see **Page-level visual hierarchy**. This section owns the list/card primitive; that
section owns how its instances participate in the page's reading order.

---

### Horizontal rails and carousels

Start with the content relationship, not the widget (`C12`). A rail is a strong candidate when the
set is bounded, nonessential, or personally relevant enough that the user already has a reason to
seek the next item. It is a weak choice for primary navigation, essential content, or an
undifferentiated discovery set that depends on people finding item four. Prefer a list, grid, or
explicit route to the full collection when systematic browsing matters. This is a decision gate,
not a categorical ban on carousels.

- **Signal that more content exists without inventing a peek threshold** (`C13`, `C16`). Partial
  visibility can provide a useful continuity cue; dots alone are weak. No source establishes a
  required amount of the next item or a universal item-count ceiling, so size the cue from the
  content and viewport and verify that people can recognise the region as scrollable.
- **Prefer native overflow when it fits the interaction** (`C9`). Browser/OS scrolling keeps its
  built-in input mechanisms. A custom implementation that suppresses or replaces user-agent
  scrolling must provide a single-pointer alternative such as previous/next controls under WCAG
  2.5.7; this does not make carousel libraries inherently non-compliant.
- **Keep the scroll container keyboard reachable** (`C10`). Interactive descendants can satisfy
  this. If a rail contains no focusable descendants, make the scrolling container focusable and
  give it an appropriate role and accessible name. Verify keyboard scrolling and a visible focus
  indicator rather than adding `tabindex` mechanically.
- **Do not hide merely off-screen native-rail items from assistive technology** (`C11`). CSS
  overflow leaves the collection present and lets focus scroll items into view. A scripted,
  discrete-slide carousel is a different pattern and must keep inactive slides from becoming
  misleading focus stops. Do not bolt carousel roles onto an ordinary native list.
- **Keep the interactive rail clear of edge-gesture zones** (`C14`, `C19`). Use a page gutter and
  logical properties rather than registering a broad Android gesture exclusion; no authoritative
  gutter width exists.
- **Treat mandatory snap as a focus risk to verify, not an automatic failure** (`C15`). Pair
  mandatory snapping with logical `scroll-padding`, then tab, search, zoom, and use voice control
  to confirm the focused or highlighted item is fully visible and not obscured.
- **Use semantics and focus management proportionately** (`C17`). A semantic list is a useful
  default. For a very long, composite rail, roving tabindex can reduce tab-stop bloat only when the
  component also owns a clear keyboard interaction; it is not a requirement for every row of
  ordinary links.
- **Leave a safe place to start the swipe** (`C22`). Dense tappable items benefit from deliberate
  inter-item space and outer margin so scrolling does not feel like a risk of activating a card.

---

### Color — semantic roles

Every color in the UI must map to one of these roles. No ad-hoc values.

| Role | Usage |
|------|-------|
| `--color-primary` | Main interactive action — CTAs, key buttons |
| `--color-secondary` | Supporting actions, alternative buttons |
| `--color-destructive` | Delete, remove, sign out, irreversible actions |
| `--color-success` | Confirmation, completion, positive state |
| `--color-warning` | Caution, pending, needs attention |
| `--color-error` | Failure, validation error, blocking state |
| `--color-info` | Neutral informational state |
| `--color-surface` | Card/panel backgrounds |
| `--color-border` | Dividers, input borders |
| `--color-muted` | Secondary text, placeholders |

Product-specific semantic roles (category colors in data viz, emotion states in a mood app) can
extend this list — document them alongside these.

**Selection ≠ action.** Selected state and primary action must remain distinguishable in context.
They may share a brand hue when component shape, placement, label, border, weight, or indicator
keeps their meanings clear. Do not invent a new dark fill or checkmark merely to force numeric
distance; use the smallest established channel that removes actual ambiguity.

**A state treatment lives in one token; sibling surfaces move together.** Selected, active, and
error states must be owned by a shared token (fill, border, label) that every surface reads — tabs,
sub-tabs, tiles, list rows showing the same state must look identical because they resolve the same
token. Two consequences the reviewer must enforce:
- **Fix the token, not the instance.** If a shared state token is broken or retired (e.g. a
  `selected-border` set to `transparent`), the fix belongs in the token so all consumers update at
  once. Hand-patching one surface — giving *one* tab a visible teal border because the shared token
  gives none — forks the pattern and leaves its siblings behind. That local override is itself a
  finding, not a fix.
- **After any state-style change, audit the siblings.** Changing a selected/active style on one
  component obligates you to grep for every other surface rendering that state and confirm they
  still match. Divergence between two surfaces that share a state (a `入力` tab styled one way, its
  `つながり` sub-tab another) is a coherence failure even when each looks fine alone.

**A state has more channels than colour — evaluate and design across all of them.** When you assess
or build any differentiated state (selected, active, hover, pressed, error, disabled), do not reduce
it to a fill/contrast question. Enumerate which channels actually carry the state from the full set:
**value/fill, border, weight, size, elevation/shadow, scale-lift, position/indicator
(underline/dot), and iconography (check)** — then filter that set by what the design language
permits (a flat, opaque, neutral-elevation system rules elevation/coloured-shadow *out* as a
selection channel; a layered system may use it). Two review obligations follow:
- **Report the channel inventory, not just the contrast number.** "The active tab is 3.3:1" is half
  a finding; "the active state is carried by hue alone — the border, weight, and fill value-step are
  doing no work" is the finding. A state that passes contrast can still be a fault if colour is the
  sole channel, and a faint fill is fine when a border, weight step, or lift genuinely carries it.
- **Don't fix a state by adjusting colour alone.** If a selected state is weak, the first moves are
  usually a committed border, a value-step deepening, or a weight change — not nudging the hue.
  Reach for the channel the design language actually allows before touching colour.

**Which control to use is decided in *Behaviour, states and recovery* → Control-type semantics.** A
control's shape is a promise about its behaviour (a switch takes effect immediately; a checkbox
waits for a submit), so it is settled there. The rules below govern how a chosen control *shows* its
state.

**Single-select vs multi-select — the second channel differs; don't demand a mark unless the render
needs one.** The "colour is never the only signal" rule is satisfied differently by the two
selection models:
- **Multi-select** (emotion tiles, filter chips, any independently toggled set) — every selected
  item must remain independently identifiable, but the second channel may be border, shape, weight,
  label, scale, or a mark. A check is useful when other established channels remain faint or
  ambiguous; it is not a universal requirement and should not be added when it has no product
  meaning or precedent.
- **Single-select** (segmented controls, tab bars, radio-style pickers — exactly one item active,
  choosing one deselects the rest) — the differentiator is the *contrast between the one active item
  and its inactive siblings*, carried by **fill + border + weight + position/underline**. A per-item
  check is **not** required; the active item reading differently from its neighbours (and not
  reading as the CTA — Selection ≠ action still applies) is the whole requirement. Do not flag a tab
  or segment for lacking an ink check; flag it only if the active state is carried by hue alone with
  no fill/border/weight/position difference.

**A treatment's precedent context is part of its meaning.** Reusing a heavy/dark fill outside its
established surface triggers a compatibility check, not an automatic finding. Compare all related
instances and ask whether the new surface shares the same role and register. If it creates visible
hierarchy or semantic inconsistency, recommend the smallest established alternative; otherwise
record it as a coherent extension. A valid token is necessary but not sufficient, and a novel use is
not automatically wrong.

---

### Color strategy

Before picking colors, commit to a strategy. Restrained is the safe default for product UI;
committed or drenched for brand/campaign surfaces.

| Strategy | Description | When |
|----------|-------------|------|
| **Restrained** | Tinted neutrals + one accent ≤ 10% of surface | Product UI default |
| **Committed** | One saturated color carries 30–60% of surface | Brand-driven pages |
| **Full palette** | 3–4 named roles, each used deliberately | Campaigns, data viz |
| **Drenched** | The surface IS the color | Hero moments, campaign pages |

Strategy may also be assigned **per surface role** within one app, documented once: e.g. drenched
onboarding/hero/player screens + restrained content screens — the standard pattern in polished
consumer apps. What's banned is per-screen improvisation, not per-role assignment.

**60/30/10 proportion check.** Use this as a rough diagnostic for restrained colour strategies, not
a universal ratio or pass/fail threshold. Judge whether accent still preserves hierarchy and
semantic meaning; brand-led, data-rich, and drenched surfaces may use different documented budgets.

**Palette permission — every visible hue needs a reason to exist.** Build the palette outward from
the brand anchor instead of collecting attractive colours independently. A hue is allowed only when
it has one of four jobs: **brand/action**, **brand-derived support**, **semantic state**, or
**data/category distinction**. Brand-derived support should be visibly related to the anchor through
hue proximity, shared undertone, or a documented complementary/analogous scheme. Semantic colours
may leave the brand family because red, amber, and green carry learned meanings, but reserve them
for those meanings; do not use error red or success green decoratively. Data colours may be broader,
but belong to a named chart palette and must not leak into ordinary chrome.

An unrelated accent is not made coherent merely by turning it into a token. For example, a dark-teal
brand does not acquire purple buttons, badges, and illustrations by default. Purple earns a place
only through an approved supporting palette or a specific semantic/category role, and its
temperature and chroma must be tuned to the teal system. Otherwise derive the supporting colour from
teal and its tinted-neutral ramp. Test the palette in context, at approximate usage proportions, and
in grayscale; swatches viewed separately hide competition and hierarchy failures.

**Colour meaning is not universal — check it against the markets you actually ship to.** The
red-down/green-up convention inverts in parts of East Asia, where red reads as gain and celebration;
white carries mourning where black does elsewhere; and yellow, purple and green all pick up
region-specific readings. This is not a licence to redesign per market. It is two obligations: (a)
never let colour be the sole carrier of a meaning the user must act on — the Tier-1 rule, and the
reason a correctly-built UI degrades gracefully across cultures anyway; and (b) for the two or three
meanings your product genuinely depends on (financial direction, status, success/failure), check
them against its real audiences and log the decision in `DESIGN.md` rather than inheriting the
default by accident.

**Colour separation is relational, not a token-name check.** Compare adjacent surfaces at their
rendered size. A light-teal tile on a light-teal canvas may be technically different yet visually
collapse. If two neighbouring planes do not separate, change the permitted channel in this order:
whitespace, value/lightness step, hairline, then elevation when the role truly floats. Do not solve
a value-collapse problem by adding another hue, more saturation, or a glow.

---

### Page-level visual hierarchy

Professional coherence is **family resemblance plus role distinction**. Components that do the same
job share geometry, typography, states, and token logic; components with different importance do not
receive equal visual weight merely because they are all buttons, cards, or tiles.

Before polishing a screen, make a hierarchy inventory:

1. Name the screen's primary job and the one action that advances it.
2. Rank every visible action as **primary, secondary, tertiary/inline, navigation, destructive, or
   system/status**. Rank content as **page identity, section identity, primary content, supporting
   content, or metadata**.
3. Assign emphasis channels deliberately: position and whitespace first; then size/weight; then
   value/colour; border/elevation last. Do not turn every channel up on the same element unless it
   is genuinely the page's dominant moment.
4. Squint-test or blur the render. The primary job and first reading path should remain obvious;
   repeated controls should recede into groups rather than form a field of competing accents.
5. Remove colour and re-check. If hierarchy disappears in grayscale, colour is compensating for weak
   structure.

**Settings and action-dense pages.** Buttons should share a component family, not one identical
appearance. Routine row actions are usually navigation affordances, toggles, inline text/ghost
actions, or a trailing chevron—not repeated filled CTAs. A page-level Save/Apply may be the single
primary action for the edited region. Destructive account actions sit in a separated danger zone and
use destructive styling at the point of commitment; they do not compete with Save throughout the
page. Repetition lowers prominence: an action shown in every row should usually be quieter than a
one-off decision action.

**Hierarchy is a budget.** On a typical product screen, allow one dominant element in a visual
field, a small number of supporting emphases, and keep the remainder neutral. When everything is
filled, bordered, shadowed, saturated, large, or bold, no hierarchy remains. Consistency means the
same role resolves the same way; it does not mean every interactive element looks equally important.

This section is the page-level procedure. **Information hierarchy** owns the frequency/prominence
principle; **Cognitive load and interaction density** owns choice grouping and one-job-per-screen;
**List and card patterns** owns primitive selection. Apply them through this inventory rather than
restating their local rules in new sections.

---

### Data visualization

Charts and stats follow the same system as the rest of the UI — a chart is not a licence for new
colours.

- **Colours come from the token system:** category colours are documented product-semantic roles;
  state colours (success/warning/error) mean the same thing in a chart as in a form. Never a rainbow
  default palette.
- **One data series → the brand accent on neutral.** Multi-series → documented category colours,
  distinguishable without a legend and colour-blind-safe (pair colour with shape, position, or a
  direct label).
- **Gridlines are hairline-weight** on the neutral ramp — never darker than the data. Drop them
  entirely if the values are labelled directly.
- **Direct labels beat legends** where space allows; legends force the eye to ping-pong.
- **No 3D, no gradient fills, no drop shadows on chart elements.** A soft single-hue area fill under
  a line (fading to transparent) is the one legitimate chart gradient.
- Axis numbers use `tabular-nums`; abbreviate consistently (1.2k, 3.4M).
- Charts have loading, empty, and single-datapoint states like any other component.
- **Hover is not an affordance on touch.** If chart elements are tappable (a bar opens a detail),
  the affordance must be visible at rest — hover/tooltip reveals only enhance. Anything discoverable
  only by hovering does not exist on mobile.

**Choose the form from the question, before styling it.** The styling rules above assume the chart
type is already right, and an agent's default is whatever the library example showed. Name the one
question the chart answers, then start from its default form:

| The question | Default form | Switch away when |
|---|---|---|
| How did it change over time? | Line (area only for a single series or a running total) | Fewer than ~4 points → a stat with its delta; more than ~5 series → small multiples or a series filter |
| Which is bigger / how do they rank? | Bar sorted by value; horizontal when labels are long | More than ~15 categories → top-N plus "Other", or a sortable table |
| What share of the whole? | One stacked bar, or a donut with ≤5 segments | More than 5 segments, or segments within a few percent of each other → sorted bar with % labels |
| Are we on target? | Bullet bar (value, target marker, qualitative bands) | Never a gauge or speedometer — area spent on decoration, not data |
| How is it distributed? | Histogram; box or strip plot to compare groups | Averages alone hide the shape — don't reduce to a mean bar |
| Do two measures move together? | Scatter | Beyond ~1,000 points → aggregate into density or hex bins |
| Where do people drop off? | Horizontal bars per stage with step-to-step conversion % | Decorative funnel shapes distort the proportions they claim to show |
| What is the number right now? | Stat tile with comparison context (vs last period, vs target) | Never a one-point chart |

- **No dual y-axes.** Two scales on one plot let the scale choice manufacture a correlation; use two
  aligned charts sharing the x-axis.
- **Thousands of marks are aggregated or downsampled before they render**, with a drill-down to the
  detail — SVG copes with hundreds of marks, canvas with thousands, and no reader can see a hundred
  thousand.
- **Every chart has a non-visual path to the same data.** Its accessible name states the takeaway,
  not the chart type (the *informative image* case under *Accessible semantics and keyboard*); the
  underlying values are reachable as a real table (adjacent, or one toggle away); interactive marks
  are keyboard-focusable and their tooltips open on focus as well as hover. Series told apart by
  colour are also told apart by line style, marker shape, or a direct label, and data marks meet
  3:1 against their background (WCAG 1.4.11 non-text contrast).

(Chart-form defaults cross-checked against `ui-ux-pro-max`'s chart table; the wording and
thresholds here are this kit's own.)

---

### Imagery and avatars

- **Fixed aspect ratio per slot.** Every image slot (card cover, hero, thumbnail) declares one ratio
  and crops to it (`object-fit: cover`) — never stretch, squash, or letterbox user content. Mixed
  ratios in one grid is an instant amateur tell.
- **Image radius follows the concentric rule** (inner = outer − gap) when inside a card; standalone
  images use the system radius.
- **Avatars: one shape, 2–3 sizes.** Pick circle or squircle once, define sm/md/lg sizes on the
  icon/spacing scale, and never mix shapes. Placeholder = initials or a brand mark on a neutral-ramp
  fill — not a gray silhouette default, not an emoji.
- **Placeholder/broken states designed:** loading skeleton matches the slot's exact ratio (no layout
  shift); failed loads show a neutral fill, never a broken-image glyph.
- Text or badges over any image → see Text on imagery.

---

### Presence and availability

Presence is a statement about a person, not a decorative avatar treatment. Define what each state
means in the product before drawing the indicator, and preserve the distinction between known state,
explicitly unknown state, and missing data (`C4`, `C5`, `C8`).

- **Missing data renders no state** (`C4`). A presence component without a state must not silently
  default to available, offline, or another claim about the person.
- **Absence is the default for “not set”** (`C5`). Show an explicit unknown state only when users
  benefit from distinguishing “unknown” from “offline/unavailable”; document that product meaning
  in `DESIGN.md`.
- **State survives appearance changes and is programmatically determinable** (`C1`, `C3`, `C27`).
  Pair colour, desaturation, or opacity with a persistent label, glyph, shape, position, or other
  non-colour channel. The accessible name or adjacent text must carry the state; a custom visual
  node must not bypass that naming path.
- **Do not turn 3:1 into a blanket status-dot rule** (`C2`). Where the indicator itself carries
  visual information needed to identify a component or state, verify the current WCAG 1.4.11
  criterion text and test the relevant adjacent-colour contrast. Carbon's 3:1 indicator guidance is
  a useful system precedent, not proof that every ornamental dot is a WCAG failure. The exact WCAG
  scope remains a verify-before-citing point in the evidence base.
- **Ambient presence churn is quiet by default** (`C6`). Expose the current state persistently;
  announce a change only when it is timely and relevant to the user's current task, and prefer
  polite announcement. Do not make a busy roster narrate every background change.
- **Indicator anatomy is a system choice, not a universal ratio** (`C7`). Constant-proportion and
  constant-absolute-size systems both ship. On tinted or photographic avatars, consider a
  transparent mask/gap before an opaque ring that assumes a known background.
- **The state vocabulary belongs to the product** (`C8`). There is no canonical set of available,
  away, busy, focus, offline, unknown, or related states; define only distinctions that change a
  user decision and record precedence when presence competes with another status channel.

---

### Typography

**Hierarchy first — sizes must contrast.** Font size steps should have a ratio of at least 1.25×
**at display/heading levels above body**. If h1 is 32px, h2 should be ≥ 25px. Clustering sizes near
each other (28/26/24) is a flat scale, not a hierarchy. In dense product UI, adjacent levels in the
13–17px band may legitimately be separated by weight and colour instead of size (Apple's own text
styles do this) — the floor applies where size is the differentiator, not as a universal law. (The
token-graph validator enforces a hard ≥1.15× *distinct-level* floor — below that two steps read as
one level and it flags; the 1.25× here is the display-tier *target*, above the validator's floor.
Target and floor are deliberately different numbers.)

**Emphasis has three axes — size, weight, colour.** Prefer weight shifts and ink-vs-muted colour
steps before size jumps; size alone is the blunt instrument. Combine competing axes deliberately:
large numerals in a light weight; tiny labels bold/caps/tracked. Only page titles get all-out
emphasis (big AND bold AND dark). A big stat pairs with a small muted unit ("2,158 **steps**" — the
number gets size, the unit gets colour), never equal weight. Use `font-variant-numeric:
tabular-nums` on any number that updates or aligns in columns.

**Display letter-spacing floor:** ≥ -0.04em. Tighter and letters begin to touch. (Latin only — see
Japanese/CJK in Platform notes.)

**Body letter-spacing ceiling:** ≤ 0.05em. Wide tracking on body text disrupts natural character
groupings. Reserve tracked-out uppercase for short labels (4–6 words max).

**All-caps tracking is positive, and it has a range:** 0.05–0.12em on short all-caps labels,
eyebrows and small headings. Capitals were drawn to sit beside lowercase, not beside each other, so
at default spacing they crowd — the ceiling above says *reserve* tracking for caps without saying
how much, and this is how much. Prefer a real small-caps face (`font-variant-caps: small-caps` where
the family supports it) over shrinking capitals, which produces a lighter colour on the page than
the surrounding text and reads as a rendering fault.

**Light text on a dark ground needs optical compensation on three axes, not one.** The same type
that reads correctly as dark-on-light blooms when inverted — light glyphs on a dark field spread
optically and the counters close up. Compensate: line-height **+0.05–0.1**, letter-spacing
**+0.01–0.02em**, and consider stepping the weight *down* one notch rather than keeping the
light-mode weight. A dark theme that reuses the light theme's type metrics unchanged is the most
common reason a competent palette still reads muddy.

**Decorative text effects have geometry, and getting it wrong is visible from across the room.** A
highlighter band sits behind the **x-height**, not on the baseline — roughly
`linear-gradient(180deg, transparent 38%, accent 38%, accent 92%, transparent 92%)`; anchored at the
baseline it reads as a fat underline instead of a highlight. Underlines are **1–2px thick, offset
1–2px** from the baseline, never 5px or more. A decorative stroke or rule does not exceed **5% of
the viewport**. These are visual checks: confirm the band lands in the right vertical zone in the
render, not in the CSS.

**Body line length:** 65–75ch. Beyond 75ch reading becomes tiring; below 45ch the eye never settles
into flow.

**Line height is inversely proportional to size:** body 1.5–1.7×, subheads ~1.3×, display/h1
1.1–1.25×. A multi-line headline at body line-height is visibly gappy — an every-screen amateur
tell. Below 1.3× on body feels cramped.

**Body minimum size:** 14px for dense product UI, 16px preferred for reading-focused interfaces.
Below 12px is inaccessible.

**Font pairing:** Pair on a contrast axis — serif + sans, geometric + humanist. Don't pair two
similar sans-serifs (Inter + DM Sans is not a pairing, it's two defaults).

**Font selection precedence for CJK/JP (and any non-Latin script): coverage → legibility →
performance → distinctiveness.** "Pick a distinctive display face" is a Latin-first heuristic and is
*outranked* by script needs. A distinctive display font that lacks full kana/kanji coverage, renders
JP at poor legibility, or ships megabytes of glyphs is the wrong choice even though it would win on
a Latin landing page. For JP, prefer a well-hinted system or Noto-class family with the required
weights that actually exist (see Japanese/CJK) over a "characterful" face that fails coverage — the
considered choice there is legibility and correct rendering, not novelty.

**Font count is a register decision** (→ *Design intent — the four registers*; Read wants one highly
legible family and a generous measure, Experience usually wants the type to recede entirely). Brand
UI (landing pages, campaigns) expects a considered display face paired with a refined body font.
Product UI (apps, dashboards, tools) may legitimately use a **single well-set family** — iOS,
Linear, and Stripe's dashboard all do — with the design energy going into the weight/size/colour
system instead. What's never a decision: accepting the framework default font without choosing it,
or reflexively bolting a decorative display font onto a dashboard (the forced "serif display + Inter
body" pairing is itself becoming a tell).

**Writing the default into `DESIGN.md` does not turn it into a decision.** A documented font is not
automatically a chosen font. When the type stack is one of the reflex defaults (Inter, Roboto,
Arial, Geist, system-ui as the *stated* display face, or a fashionable grotesk picked for nothing in
particular), the gate is not cleared by the fact that a token names it — it is cleared by a stated
typographic reason that connects the face to this product's register. Ask the question against the
*system*, not just the screen: could someone guess this type stack from the product category alone?
If yes, the system is carrying an unexamined default no matter how consistently it is applied, and
consistency is not evidence of intent (see *Design commitment check*).

**Display size follows available measure and hierarchy — and the hero has brackets.** There is no
universal word-count limit, and the render is still the arbiter: test the actual copy, language,
viewport, wrap and fold, and reduce size or edit copy when the rendered hierarchy or line breaks
fail. But "judge it in the render" is not enough guidance at authoring time, so the hero headline
gets a starting bracket by measured length. Count characters in the rendered `h1`; the cap applies
*on top of* whatever `--text-display` clamp the system defines:

| Headline length | Cap | Notes |
|---|---|---|
| **≤ 20 chars** | full display; a single word may grow further | Display-heavy directions only |
| **21–50 chars** (the sweet spot) | full display | If it wraps past 2 lines at 414px, step down one rung |
| **51–90 chars** | step down one rung | Strongly consider splitting the message across headline + subhead |
| **> 90 chars** | rewrite shorter, or drop two rungs with tighter leading | A 100-character headline at display size is among the most reliable AI tells |

**When you write the headline yourself** (no user-supplied copy), aim for **≤ 7 words and ≤ 50
characters** from the start. Use no more than five type sizes on one page; past that, reach for
weight and colour rather than another size.

**Hero fit — the display clamp is sized to the fold, not to the token.** A hero can satisfy every
size rule and still fail, because the constraint is the *first screen*, not the type scale. Verify
on the rendered page at **1280×800** (a 13″ laptop — not just 1440×900, which hides it): the
headline, the lede, and **the primary CTA** must all be visible without scrolling. When they are
not, the usual causes are, in order: an oversized display `clamp()` maximum, display leading set
loose (~1.2 where 1.0–1.1 belongs), a lede running 3+ lines, and bloated hero `padding-block`. Pull
the clamp maximum down until the headline sits on **2–3 lines**, hold the lede to ~2 lines (≤
~60ch), then trim padding. **Do not overcorrect:** a hero that already fits passes untouched — this
never means small type or stripped whitespace. Deliberately art-directed long-form statements may
run taller, but the first screen must still read as a complete composition rather than a headline
sliced by the fold.

**Hero display leading runs tighter than ordinary display leading.** The 1.1–1.25 range above is for
display and h1 generally; at true hero sizes (~56px and up) leading scales down with size, and the
target is **1.0–1.1**. Below **1.0 is a floor, not a style choice** — uppercase and tall-ascender
faces collide cap-to-baseline on the second line, which is why a hero set at 0.95 looks tight in a
mock and broken the moment the headline wraps.

**Avoid all-caps on long passages.** Word recognition relies on shape (ascenders and descenders).
Reserve all-caps for short labels (1–4 words).

**Avoid justified text.** Without hyphenation, justified text creates uneven word spacing. Use
`text-align: left` for body text.

**Text enlarges without breaking.** Web: the layout must survive 200% zoom and a user-raised base
font size with no loss of content or function. Set type in `rem`/`em` so browser settings are
respected, never disable zoom (`user-scalable=no` is banned outright), and let containers grow with
their text instead of fixing their height. Native: support Dynamic Type / system font scale rather
than hard-coded point sizes. When space runs out the layout **stacks** — it does not truncate, clip,
or overlap; a two-column row becomes one column before its text is cut. Test with the longest real
string at the largest supported size, not with the sample copy.

**Text wrap:** Use `text-wrap: balance` on h1–h3; `text-wrap: pretty` on prose.

---

### Color contrast

- Body text: ≥ 4.5:1 against background (WCAG AA)
- Large text: ≥ 3:1 — but WCAG "large" means **18pt/24px regular or 14pt/≈18.5px bold**. Text at
  16–23px regular is NOT large text and needs the full 4.5:1. (A common units error is reading the
  thresholds as px.)
- **The ratio that counts is the composited one, not the declared pair.** A token validator checks
  the pairs a system *declares*; a page fails on the pairs it *composes* — ink set on an accent card,
  translucent text over a gradient, a label over an image. Those ratios exist only once the pixels
  are stacked, so a system whose every declared pair passes can still ship body copy at 3.8:1,
  because nobody composed that combination on purpose. Measure against the **actual backdrop**:
  composite every translucent layer down to the first opaque one, and for a gradient take the
  **worst stop**, not an average — a ratio that clears at only one end of a gradient does not clear.
  Translucent *text* composites too; dropping ink to 55% alpha over a warm fill can cost more than a
  point of ratio. This is also where a palette can force a design decision: when ink fails on one
  accent and white fails on another, those two surfaces are *obliged* to take opposite text
  treatments. That is a finding about the palette, not a style choice.
- WCAG exemptions — do not flag: disabled controls, placeholder text used purely as a format hint,
  and logotypes are exempt from contrast minimums. A properly-muted disabled state is correct, not a
  violation.
- Interactive element indicators (focus rings, active state borders): ≥ 3:1
- **Non-text component contrast (WCAG 2.1 SC 1.4.11) — scoped to *interactive* elements.** The 3:1
  boundary requirement applies to interactive components and their states (inputs, toggles, buttons,
  selectable tiles, tappable rows, focus/selected indicators). A purely decorative grouping card
  (roster, settings container, read-only data card) is not an interactive component and is not
  required to hit 3:1 — it may separate with the value step + a delicate hairline (~1.2:1,
  iOS-style). This is the correct reading of 1.4.11; the over-broad "every card must hit 3:1"
  version forces a darker background and makes cards look cheap. Translucent fills still fail: the
  fill never resolves and the step collapses.
- Most common failure: muted gray on tinted near-white. Move toward the ink end of the ramp.
- **Gray text on colored background:** A gray that passes on white will fail on a colored surface.
  Use a darker shade of the background hue, not generic gray.
- **Count badges / small labels on an accent fill.** Small text needs 4.5:1. Measure the actual
  foreground/background pair; do not infer failure from hue. Tint-fill + ink is a reliable option,
  and a darker brand accent is equally valid when the measured pair passes and still fits the
  approved palette.
- **Links inside body text are identifiable without colour.** A differently-coloured word inside a
  paragraph is colour-as-the-only-signal — the Tier-1 rule applied to its most common instance.
  Underline in-prose links by default. If the underline is removed, a non-colour channel must
  actually carry it (weight, a persistent border, a trailing external-link icon), and *hover-only*
  underlining does not count: it is invisible at rest and absent on touch. Navigation links and
  button-styled links are exempt — their position and shape already identify them. Contrast between
  link colour and surrounding body text should also reach 3:1 where colour is doing any of the work.
- **Text on a coloured or gradient ground: measure at the extremes, and don't let one ink carry the
  hierarchy.** Two obligations, and the second is the one that passes every contrast check and still
  looks wrong.
  - *Measure at both ends of the fill, not its average.* A gradient's contrast varies continuously
    across the element, so one sample proves nothing — measure the text against the lightest **and**
    darkest stop it actually crosses. Same for a photo, a video still, or any fill that changes
    beneath the text. Passing at one stop and failing at the other is a failure.
  - *On a coloured ground the colour axis collapses, so hierarchy has to come from somewhere else.*
    Emphasis normally runs on three axes — size, weight, colour — but a contrast-mandated ink leaves
    exactly one colour for everything on that surface. Four stacked elements in the identical ink
    flatten into a single plane where only size separates a heading from the paragraph beneath it.
    Rebuild the ladder with a deliberate **opacity sequence on the same ink** — full for the anchor,
    a step down for body, a further step for metadata — holding every step above the contrast floor,
    and lean harder on weight. Introducing a second hue is the wrong fix and usually breaks palette
    permission.
- **A text/ground pairing validated at one scale is not validated at every scale.** Ink-on-primary
  proven on a button — small, dense, one line, a flat fill — is a different proposition on a card: a
  large surface, several lines of mixed weight, and a fill that shifts under them. The *measurement*
  transfers; the *judgment* does not. When a pairing moves to a surface of different size or
  density, re-check how it reads there, not merely whether it passes. This is the text-and-ground
  instance of *A treatment's precedent context is part of its meaning* (→ Color — semantic roles).
- **Forced-colors / high-contrast mode is evaluated, not assumed.** Windows High Contrast and
  `forced-colors: active` replace the palette wholesale: background images drop out, `box-shadow`
  stops being a boundary, and any state carried by fill colour alone vanishes. Verify that focus
  rings, selected states, container boundaries and icons survive — draw boundaries that must persist
  as real `border`s rather than shadows, keep `forced-colors` media-query fallbacks for anything
  custom, and re-check that icons remain visible against the substituted background.

---

### Tap targets

- iOS minimum: 44 × 44pt
- Android minimum: 48 × 48dp
- Web: 24 × 24 CSS px at WCAG 2.5.8 AA, including its spacing exception; 44 × 44px is an enhanced
  target for primary and touch-heavy controls, not a universal AA failure threshold.
- If the visible element is smaller, add transparent padding to meet the minimum — grow the *hit
  area*, not the visible box. Inflating the visible control's height alone (e.g. `minHeight` 34→44)
  while leaving its horizontal padding fixed squishes a short-label control into a tall, narrow
  pill. Prefer transparent hit-area padding that leaves the resting shape untouched.
- Prefer generous separation between adjacent targets; on web, assess the actual WCAG spacing
  exception rather than imposing a universal 8px rule.
- **Bottom safe zone (native).** Interactive elements must clear the bottom safe-area inset — the
  iOS home-indicator strip and the Android gesture-nav zone. Pad the bottom bar / pinned CTA by the
  safe-area inset (`env(safe-area-inset-bottom)` or the platform equivalent); never let a tappable
  control sit flush against the very bottom edge, where accidental taps and the system gesture
  overlap. This is a native concern — a web layout with a footer link at the page bottom is fine; a
  native screen with a CTA jammed into the home-indicator zone is not (`C18`). On Android, apps
  cannot exclude the bottom home/quick-switch gesture area. The 200dp exclusion cap applies only
  to the vertical extent of back-gesture exclusions on each side, and ordinary scrolling regions
  do not warrant broad exclusions; solve those with layout and a gutter (`C19`).
- Applies to: all buttons, toggles, links, icons used as interactive elements, form checkboxes and
  radios.
- **No functionality reachable only via hover — on any element.** Hover may enhance (highlight,
  preview, tooltip) but never gate: hover-revealed row actions, hover-only delete buttons, and
  tooltips as a control's only label all fail on touch. (This generalizes the chart-affordance
  rule.)

**Bottom placement is an ergonomic trade-off, not a thumb-zone law** (`C20`, `C21`). Hoober's field
measurements report roughly 7mm accuracy at screen centre versus about 10–12mm at difficult edges
and corners, and recommend considering the middle half to two-thirds for key actions. Treat that as
attributed human-factors guidance, not a platform or accessibility requirement: posture, device,
task, and persistent navigation still matter. His often-quoted 49% figure describes how phones were
held, not proof of one-handed operation, and it does not justify bottom-anchoring everything.

**Stacked bottom-of-screen actions (native mobile):** avoid placing a small secondary text action
directly under a dominant CTA where the two are easy to confuse or hit accidentally. Prefer a
clearly separated secondary action above the primary, or use equally deliberate touch targets when
both must remain in the bottom zone. There is no authoritative universal gap or bottom-chrome
height budget; verify the actual reach, focus, safe-area clearance, and remaining content space.

---

### Accessible semantics and keyboard

Contrast and tap targets alone don't make a UI accessible — names and keyboard behaviour do, and
both are mechanically checkable.

- **Every icon-only interactive element has an `aria-label`.** An unlabelled icon button doesn't
  exist for a screen reader.
- **Interactive elements are real elements:** `<button>` and `<a>`, never clickable
  `<div>`/`<span>`. Real elements bring focus, keyboard activation, and semantics for free; fake
  ones bring bugs.
- **Heading levels descend without skipping** (h1 → h2 → h3). Headings are the screen-reader's table
  of contents, not font-size shortcuts.
- **Modals and sheets manage focus:** focus moves in on open, is trapped inside, `Esc` closes, and
  focus returns to the trigger on close. A modal without a focus trap strands keyboard users behind
  an invisible wall.
- **Enter submits** a focused single-field form.
- **Landmarks identify the major page regions.** Use real `<header>`, `<nav>`, `<main>`, `<aside>`
  and `<footer>` (or explicit ARIA landmark roles) so a screen-reader user can jump between regions
  instead of reading the page linearly. Exactly one `<main>`; distinguish repeated landmarks with
  `aria-label` when a page carries more than one `<nav>`. Where navigation precedes content, a skip
  link to `<main>` is required.
- **Focus order follows a meaningful sequence, and the screen-reader order agrees with the visual
  hierarchy.** Tab order follows DOM order, so any layout that reorders content visually — CSS
  `order`, `grid-area`, `flex-direction: row-reverse`, absolute positioning — must be checked
  against the actual tab path. An element that reads first and tabs last is a defect, and the fix is
  the DOM order, never a positive `tabindex`. Tab through every screen once before shipping it; the
  order that results is the order a screen reader announces.
- **Task-relevant status changes and async results are announced.** Anything that changes without a page load — a
  validation summary, a save confirmation, a result count after filtering, a background failure, a
  toast — reaches assistive tech only through a live region (`aria-live="polite"`; `assertive`
  reserved for genuine interruptions) or a deliberate focus move. A toast that no screen reader
  announces has communicated nothing. Announce the outcome, not the mechanism ("3 results", not
  "list updated"). Ambient presence churn is the exception: keep current state programmatically
  available and announce only changes relevant to the active task (`C6`; see *Presence and
  availability*).
- **A client-side route change moves focus and names the new view.** In a single-page app the browser
  does nothing on navigation: focus stays on a link that may no longer exist and a screen reader
  announces nothing. On each route change update `document.title`, move focus to the new view's
  `<h1>` (with `tabindex="-1"`) or its `<main>`, and start at the top — except on back/forward, where
  the previous scroll position and focus are restored.
- **Images carry the right alternative, and there are three cases, not one.** *Informative* images
  get alt text conveying the information itself, not the filename and not a description of the
  picture ("Revenue up 12% in Q3", not "bar chart"). *Decorative* images are hidden from assistive
  tech — `alt=""` on `<img>`, `aria-hidden="true"` or `role="presentation"` on inline SVG — so they
  are not announced at all; an empty `alt` is a decision, and a *missing* `alt` is a bug.
  *Functional* images (an image or icon that is a link or button) take the name of the **action**,
  not of the picture — the icon-only `aria-label` rule above is this third case; the other two are
  separate obligations.
- Focus-visible rings on every interactive element (web) — already required under Platform notes;
  restated here because it belongs to this contract.

---

### Responsive and adaptive layout (web)

One desktop layout that "reflows by accident" is not a responsive design. Adaptation is designed:

- **2–3 breakpoints maximum** (e.g. <640 / 640–1024 / >1024), committed as tokens in DESIGN.md. More
  breakpoints = eye-tuned chaos.
- **Every screen has a designed narrow variant.** Multi-column grids collapse in a declared order;
  side-by-side buttons stack with the primary on top; navigation transforms deliberately (rail →
  bottom bar / drawer).
- **Tables need a designed narrow strategy.** Card/row conversion works when records can be
  understood independently. A labelled horizontal-scrolling region is valid for wide comparative
  data when preserving column relationships matters; avoid accidental page-level body scroll.
- **Test every screen at 360px and 1440px** before shipping. Both extremes must look intended, not
  survived.
- Touch targets and type sizes never shrink below their minimums to fit a breakpoint — layout
  adapts, standards don't.

**Sticky chrome must not eat the content.** Fixed headers, cookie/consent banners, floating chat
widgets and pinned CTAs are drawn over the page, and three things routinely disappear underneath
them: the top of a section the user just scrolled to, the target of an in-page anchor or deep link,
and the element that just received keyboard focus.

- Reserve the space rather than hoping: `scroll-margin-top` on anchor targets and headings,
  `scroll-padding-top` on the scrolling container, and body padding matching the height of any
  pinned bottom bar so the last row is reachable.
- **Tab down the whole page and watch the focus ring.** If focus ever parks under a fixed bar, the
  keyboard user has lost the page — this is the failure the visual check never catches.
- Cap total fixed chrome. On a short viewport (a landscape phone, a 768px laptop with a banner),
  header + consent banner + pinned CTA can leave a content slot barely taller than one card.
  Collapse, auto-hide on scroll, or drop chrome — never shrink the content to fit around it. At the
  bottom, prefer one primary navigation surface; a second persistent element should read as a
  subordinate accessory and should minimise, collapse, or move inline when appropriate (`C23`).
  This is a hierarchy and viewport-cost check, not a categorical ban on stacking (`C24`), and no
  universal fixed-chrome height budget exists.
- A banner that blocks the primary action, or a chat bubble sitting on top of the submit button at
  360px, is a blocker, not a polish item. Check both extremes with the chrome present.

---

### Data tables

Dashboards are mostly tables, and agents default to bordered-everything, center-aligned grids. The
professional defaults:

- **Text left-aligned; numbers right-aligned** with `tabular-nums`, so magnitudes line up.
- **Headers muted** — weight *or* colour, not both — and aligned with their column's content.
- Start with restrained row separation. Hairlines are a strong default; zebra striping can improve
  tracking across very wide or dense rows when tested, and vertical rules are appropriate only where
  column grouping would otherwise be ambiguous.
- Row height ≥ 44px when rows are tappable; the whole row is the target.
- Sortable columns show the affordance at rest (not on hover); the active sort direction is always
  visible — and exposed: the header's sort control is a `<button>` inside the `<th>`, and the active
  column carries `aria-sort`. A visible arrow alone tells a screen reader nothing.
- **Large collections are never rendered whole.** Past a few hundred rows, paginate, load
  incrementally, or virtualize. A virtualized list still states the total ("3,400 invoices"), keeps
  search or filter as the way to find a row (browser find-in-page cannot see unrendered rows), and
  tells assistive tech where the reader is (`aria-rowcount` / `aria-rowindex` on tables,
  `aria-setsize` / `aria-posinset` on lists).
- Sticky header when the table scrolls; first column sticky if horizontal scroll is unavoidable on
  wide data.
- Empty, loading (skeleton rows), and single-row states designed like any component.

**Bulk selection and bulk actions state their scope.** A selection UI must answer three questions
before the user can commit to anything:
- *What is selected* — a live, visible count ("12 rows selected"), not just a set of ticked boxes
  scrolled off screen.
- *What the action will affect* — "Select all 12 on this page" and "Select all 340 matching this
  filter" are **different commands** and must be visibly distinguishable; a header checkbox that
  silently means the second one is the classic destructive surprise. When a selection extends beyond
  what is rendered, say so explicitly.
- *What happens next* — the action names the object and the count ("Delete 12 invoices", never a
  bare "Delete"), and the affected rows stay identifiable while the confirmation is up.

Selection survives a sort; it must be cleared or re-confirmed when the **filter** changes, because
the rows it refers to have. Bulk actions follow the undo-over-confirm rule like any other action —
reversible ones act immediately with an undo, and only the irreversible get a dialog. The diagnostic
to apply: **a workflow that forces one item at a time where a batch would be natural is a defect
even when every individual interaction is correct** — the cost is paid by the user who has forty
rows, and it is invisible to a reviewer testing with three. (This is Nielsen's *Flexibility and
efficiency of use* heuristic; the guidance here is this kit's own.)

**Filters show what is active and are easy to clear.** Every applied filter, search term and
non-default sort is visible on the results surface itself — not only inside a filter panel the user
has since closed. Render them as individually removable chips or a stated summary beside the result
count, and provide a single "Clear all". A screen that looks broken or empty because of a filter the
user forgot is a filter-visibility failure, not an empty-state one: an empty result caused by
filters is a **no-results** state that names the filters responsible and offers to clear them, never
the first-use state. Filters that persist across sessions or navigation must be especially loud
about it — a user who returns to a filtered view they do not remember setting reads the product as
broken, not as remembering. Every filter, search and selection has a one-action exit. (Nielsen's
*User control and freedom*; the guidance here is this kit's own.)

**Dates, times and timezones are explicit.** Decide per surface — and document it — whether a
timestamp is shown in the viewer's zone, the record's zone, or UTC, then label it wherever ambiguity
is possible ("14:30 JST"). Relative time ("2 hours ago") is friendly but lossy: pair it with the
absolute value in a tooltip or the detail view, and never use it alone where the exact moment
carries weight (audit logs, transactions, schedules, deadlines). Never compare or store a date as
its display string, never assume the viewer's zone matches the record's, and decide explicitly
whether a date-only field (a due date, a birthday, an invoice date) is zone-independent — it usually
is, and treating it as a timestamp is exactly what makes it render a day off.

---

### Button rules

**Hierarchy: one dominant action per decision context.** The rule is scoped to a *decision context*,
not literally one button per rendered screen — a screen with genuinely separate regions (a toolbar
action plus a distinct content CTA, a multi-section settings page) may carry one dominant action
*per region* as long as they don't compete in the same visual field. What's banned is two co-equal
primaries fighting for the same glance. Everything else is secondary or ghost.

| Variant | Use | Appearance |
|---------|-----|------------|
| **Primary** | The main action on the screen | Solid fill, `--color-primary` |
| **Secondary** | Supporting or alternative action | Outlined, or lower-contrast fill |
| **Ghost / text** | Low-priority or inline actions | No border, no fill — text only |
| **Destructive** | Irreversible actions | `--color-destructive`; require a confirmation step **only if irreversible** — see undo-vs-confirm below |
| **Link** | Navigation, not an action | Inline text only |

**All five button states are required:**

| State | Requirement |
|-------|-------------|
| Default | Resting appearance |
| Hover | Perceptible color shift (not just cursor change) |
| Active / pressed | Perceptible depression or darkening |
| Disabled | Reduced opacity or muted color. Use the `disabled` attribute when the control must be fully inert. Use `aria-disabled` + a click guard only when the control should stay focusable so its "why disabled" explanation is discoverable — `aria-disabled` alone does NOT prevent activation. |
| Loading | Spinner or skeleton inside the button; label persists or becomes "Loading…" |

**Sizing:**
- Minimum height: 36px (compact), 44px (standard), 52px (large/mobile primary)
- Minimum width: 80px; don't collapse below the label
- Padding: ≥ 12px horizontal for text labels
- **Height and horizontal padding scale together.** When you raise a control's height (e.g. to clear
  the tap-target minimum), scale its horizontal padding with it — otherwise a short 1–2-character
  label (承認, OK, ✕) sits in a tall, narrow box and the pill reads as a squished near-circle.
  Preferred fix is transparent hit-area padding that leaves the visible pill alone (see Tap
  targets); if you *do* enlarge the visible pill, hold roughly its resting height-to-padding ratio
  so the resting shape survives. Re-check short-label controls in the render after any height
  change.

**If a button is disabled, explain why.** A tooltip or adjacent text states the condition not met.

**Undo beats confirm for reversible actions.** Confirm only what's irreversible (permanent delete,
send, payment). For reversible actions (archive, remove item, dismiss), act immediately and offer
undo — a toast with an Undo action, ~5s. Confirmation dialogs on reversible actions train users to
click through them, which destroys the protection exactly where it matters.

**The primary CTA stays reachable.** On mobile, the screen's primary action must remain visible or
pinned as content expands — optional sections, revealed inputs, and long lists must not push it
below the fold. If content grows, pin the CTA or collapse the growth, don't bury the action.

**Pressed states are not just for buttons.** On native, every tappable row, card, and list item
needs touch-down feedback (background highlight or slight opacity dip, matching platform
convention). A tappable row with no pressed state is a "web dev built this" tell in a native app.

**Do not:** run two co-equal primary buttons in the same decision context (one dominant action per
context — see the hierarchy rule above); use *unmotivated* gradient fills on buttons (the committed
same-hue light cue is the one gated exception); use emoji as button labels; stack buttons vertically
on desktop unless the viewport is narrow.

---

### Form and input rules

**Labels remain available.** Placeholder-only data-entry fields lose context on focus or after
entry, so visible labels are the default for forms. Compact search/filter fields may use a
persistent accessible name plus stable surrounding context when a visible label would add no
information. Test before, during, and after entry—not only at rest.

**Placeholder text role:** Format hints only (e.g. "DD/MM/YYYY"). Never the field label.

**Input sizing:**
- Minimum height: 40px (web), 44pt (iOS), 48dp (Android)
- Width should match the expected input length — short code gets a short field, address gets a wider
  field

**Validation timing — reward early, punish late:**
- First pass: validate on blur (leaving the field), not on keypress
- Once a field is in an error state, re-validate on **every keystroke** so the error clears the
  instant it's fixed — "not on keypress" applies only before the first error
- Live-from-the-start validation is legitimate where feedback is the feature: password strength
  meters, username availability

**Prefer enabled-submit over disabled-submit.** For forms, the stronger pattern is keeping the
submit button enabled and surfacing validation on press (focus jumps to the first error) — a
disabled submit with no reachable explanation is a dead end for screen-reader and cognitively-loaded
users. Reserve disabled-with-explanation for genuinely unavailable actions.

**Error placement and content:**
- Inline: below the field, not in a toast
- Name what's wrong and how to fix it. "Invalid email" is insufficient; "Enter a valid email
  address, e.g. name@example.com" is correct
- Color alone is not enough — pair error color with an icon and a text message
- **Several errors on submit also get a summary.** When a submit fails with more than one error,
  place a summary at the top of the form that counts the errors and links each one to its field,
  and move focus to it; keep the inline messages too. On a short form (a handful of fields, all in
  view) focusing the first invalid field is enough. Inline errors alone scatter below the fold for
  a zoomed or screen-reader user, who then submits again and hears nothing new.

**Field grouping:**
- Group related fields visually (shipping address as a block)
- Use spatial proximity and light dividers to communicate grouping

**Required vs optional:**
- Mark only the minority ("Optional" if most are required; * if most are optional)
- Don't mark both

**Behaviour under failure lives in its own section.** What the form does when a submit fails, a
session expires, or the user navigates away — data survival, persistence visibility, step position,
limits stated before they are reached — is in *Behaviour, states and recovery* → Form behaviour
under failure. The rules above design the form at rest; those design it when something goes wrong.

---

### Spacing system

Use an 8pt grid. All spacing values are multiples of 8 (or 4 for fine-grained internal spacing).

```
--space-1:   4px   → icon-to-label gap, tight internal
--space-2:   8px   → compact internal padding, adjacent element gap
--space-3:  12px   → standard internal padding for small components
--space-4:  16px   → standard element spacing, default component padding
--space-5:  24px   → component separation
--space-6:  32px   → section internal spacing
--space-7:  48px   → between sections
--space-8:  64px   → major section breaks, hero padding
--space-9:  96px   → page-level vertical rhythm
```

**Spacing must have rhythm — not uniformity.** Related items use tight spacing; unrelated sections
use generous spacing. If every element has the same margin, the eye has no grouping signal.

**Monotonous spacing is an AI tell — and it has a test.** The same padding value everywhere signals
no rhythm was set. Concretely: within one layout, at least **three distinct magnitudes** from the
scale should be doing work — a tight one binding related items, a medium one separating components,
a large one breaking sections. If a page resolves to one gap value repeated (every gap 24px, every
section padded equally), it is a template regardless of whether that value sits on the grid. Being
on-scale and being rhythmic are different properties, and only the first is mechanically checkable.

**Use `gap` for sibling spacing; reserve `margin` for optical adjustment and flow breaks.** A row or
list of siblings spaced with stacked margins is fragile — margins collapse unpredictably, they do
not participate in flex or grid, and removing one item leaves its neighbour's spacing wrong. `gap`
belongs to the container, so the rhythm survives insertion, removal and reordering. Use `margin`
where the job genuinely is an individual offset: a documented optical nudge, or one element
deliberately breaking out of the flow.

**Section rhythm is asymmetric on purpose, and the hero is where it shows.** Sections do not need
equal top and bottom padding, and equal padding is what makes a block look pasted onto the page
rather than set into it. Heavier bottom padding pulls a section into the next one's rhythm; the
specific check that catches a floating hero is **`padding-block-end` ≥ 1.3× `padding-block-start`**.
Symmetric (1×) or top-heavy (<1×) hero padding is the defect. Vary padding across sections as well:
one section carrying a different rhythm reads as composed; uniformly padded sections read as
generated.

**A content container's height comes from its content — and a void inside a box is the proof it
didn't.** This is the whitespace-as-leftover failure in its most common form, and it is produced by
two things that are each defensible alone:

1. **A height the content did not ask for.** A fixed `aspect-ratio`, a `height: 100%`, a
   `min-height` used as a *dimension* rather than a floor, or a container stretched by its neighbour
   (a grid's default `align-items: stretch` makes a visual column as tall as the prose beside it).
   The imagery rule — one fixed ratio per slot, cover-fit — exists so *images* crop predictably;
   applied to a card, panel or tile holding text it sizes the box to the layout instead of to what
   is in it. Reserve `aspect-ratio` for image, video, map, chart and thumbnail slots, where the
   ratio is a property of the media.
2. **A distribution rule that pools the surplus.** `justify-content: space-between` in a container
   whose height is externally forced pushes the content to the extremes and collects all the slack
   into one gap in the middle. On a content-sized container it does nothing at all; the void is the
   combination, not the property.

**Fix the height before the distribution.** When a container looks empty the answer is one of two
things, and never a third: **reduce the height** so the box fits what is in it, or **give it content
that earns the height** — a real supporting line, not a stretched layout hiding a hole. Do not
redistribute the surplus, and do not fill it with decoration. A `min-height` floor that stops a card
collapsing is legitimate; the distinction is floor versus dimension. If two adjacent cards must
agree in height, that is the grid's job, not a ratio imposed on each — and if the agreed height
leaves one of them visibly empty, that card needs more content or the row needs less height.

**White space is an element, not leftover.** It is the cheapest separation channel available and the
first move in the *Separation toolkit*, ahead of value steps, hairlines and containers. Generated
layouts fail in both directions: space distributed so evenly that nothing groups, and space treated
as waste to be filled — every gap given a card, a divider, or a decorative flourish. If removing an
element leaves a gap that reads as deliberate emptiness, the layout is finished, not unfinished.

**Text never touches an edge.** ≥ 8px (ideally 12–16) of padding inside any bordered or filled
container; ≥ 16px horizontal between body text and the viewport edge.

**Sanctioned grid breaks.** Off-grid values are legitimate only as *documented optical compensation*
on a specific element — ±1–2px to align baselines or balance asymmetric glyphs, 1px hairlines, 2px
gaps inside segmented controls. Never as layout spacing. Reviewers: flag off-grid layout spacing,
not annotated optical nudges.

---

### Behaviour, states and recovery

This section owns **how the interface behaves across time, failure and interruption** — as opposed
to how a screen looks at rest. It is one domain: the states a surface can be in, what the platform
does to work in progress, which control promises which behaviour, and how a form survives its own
failure. Roughly 60% of what a generated UI omits lives here, because generation covers the happy
path and nothing else.

Every screen that can be in a non-default state must have that state designed and implemented. AI
generates only the happy path — absent states are an instant tell. (See also: Quality requirements
above.)

| State | Requirement |
|-------|-------------|
| **Loading** | Skeleton screens preferred over spinners for content areas; spinners acceptable for action feedback. Timing: delay indicators ~300ms (fast operations show nothing); once shown, keep visible ≥ 500ms (no flicker). Skeletons match the exact size of the content they replace — zero layout shift on resolve. |
| **Empty / zero-data** | Distinguish **first-use**, **user-cleared**, and **no-results** because they need different explanations/actions. Use only the content necessary to orient the user; an illustration is optional and must fit the established product language. Applying one generic template to all three is the defect. |
| **Error** | Distinguish network errors from data errors from permission errors — each needs different copy and a recovery action |
| **Partial data** | What does the screen look like with 1 item? With 100? With a very long name? |
| **Partially loaded** | Some data has arrived and some is still pending — this is its own state, not "loading". Render what resolved, mark what has not (per-region skeletons or an inline pending marker), and never hold resolved content behind an unresolved region. A page-level spinner covering data you already have is the defect; so is silently rendering a partial set as if it were complete. |
| **Offline / unreliable network** | Design the offline and degraded-network state, not just the words "network error". Decide what stays usable without a connection, how queued or unsent actions are shown, and what happens on reconnect (auto-retry, or a stated manual retry). Degrade to a labelled cached or read-only view rather than an empty screen, and never let a slow connection look identical to a broken one. |
| **Expired session / re-authentication** | Session expiry is a designed state, and it must not destroy in-progress work. Re-authenticate in place, or return the user to exactly where they were with their input intact. Bouncing a half-filled form to a login screen and back to an empty one is the failure — and a 401 arriving mid-task is the common trigger. |
| **Role / permission variants** | Every screen seen by more than one role (owner/member, creator/joined, admin/user) needs each variant designed. AI generates the author's perspective only — the same failure class as a missing empty state. |

**Expiring state** (`C25`, `C26`). For an informational time-boxed state, consider letting the
state end cleanly rather than adding a ticking countdown; the shipped precedents in the evidence
base communicate expiry by disappearance, but that convergence is thin and is not a standard. If a
viewer's decision depends on the remaining window, a static boundary label such as “until 22:00”
is a defensible project decision. Treat a countdown or boundary label as an intentional,
documented departure to test, not as a conventional default.

**Each API failure class is a different screen.** *Error* above says network / data / permission
errors differ; this is the concrete mapping, because "handle the error" is where it stays abstract
and generic copy gets shipped:

| Response | What the user is actually told, and what they can do |
|---|---|
| **400** validation | The specific fields that failed, inline, with their values preserved |
| **401** expired session | Re-authenticate **in place**; never bounce a half-filled form to login and back empty |
| **403** permission | That they lack access, *which* access, and who can grant it — not "not found" |
| **404** not found | The thing is gone or never existed, and where to go instead; distinct from an empty state |
| **429** rate limit / quota | That they are throttled, roughly for how long, and whether work in flight was kept. **The one almost no generated product designs**, and the one users hit most |
| **500** server | An honest generic failure *plus* a support path and a retry that does not lose their input |

A product where 403, 404 and 429 all render the same screen has three bugs, not one.

**Runtime hazards — the work survives the platform.** The table above designs *screens*. These are
events the platform throws at a screen that was designed only for the happy path, and each one has
the same failure mode: the user's in-progress work disappears.

- **Browser back, refresh, and open-in-new-tab do not destroy work.** Navigate back out of a
  multi-step flow and return — the entered values are still there. Refresh mid-task — the app
  restores from a draft or warns before discarding; it does not silently reset. Open a row in a new
  tab — it loads that row, not the list. A flow whose state lives only in memory fails all three.
  (The URL side of this — which views deserve their own address — is `ia-review` → *Web and SaaS
  structure*.)
- **Interruptions, backgrounding, and reconnection preserve progress** (native). An incoming call,
  an app switch, a lock screen, a low-memory kill, or a connection dropped mid-upload must resume or
  restore — not restart. Persist in-progress input on background, not only on submit.
- **Optimistic updates carry a rollback and a recovery path.** Showing success before the server
  confirms is legitimate for low-stakes reversible actions (like, follow, reorder, mark-read). It is
  only legitimate *with* a designed failure path: the UI reverts visibly, says that it reverted and
  why, and offers a retry — a silent revert is worse than a spinner, because the user believes the
  action succeeded. Never use optimistic UI for payments, destructive actions, or anything the user
  cannot simply repeat.

- **The same action must not run twice.** Disable or busy-mark the control the moment a submit is in
  flight, and key the request so a retry cannot duplicate the effect. Double-submission is the most
  common concurrency defect in generated UI because the happy path never reveals it. Where two users
  or two tabs can edit the same thing, decide the conflict rule — last-write-wins, merge, or
  refuse-and-show-the-difference — and tell the user which happened. Silent last-write-wins is data
  loss with a success message on top.
- **Anything a component starts, it stops.** Event listeners, subscriptions, timers and intervals,
  observers, and **in-flight requests aborted on unmount**. A resolved fetch writing into an
  unmounted component is a leak *and* a race. This generalises the animation-library teardown rule
  under *Motion* — same defect, wider surface.
- **The interface degrades rather than disappears.** Core content and navigation survive a failed or
  slow script, images carry alt text, and capability is decided by **feature detection, never
  browser detection**. Progressive enhancement here is not nostalgia: a bundle that fails on a flaky
  connection is the same event as a user with JS disabled, and it is far more common.

**Design for return, not only for first use.** Three usage moments need designing, and generated UI
covers only the middle one: **first use** (empty and unconfigured — the empty-state row above),
**steady use** (the happy path), and **return** — the user coming back after a week or a month.
Returning users need to see what changed while they were away, to re-find where they left off, and
to recover from a stale cache, an expired token, or a since-changed data model without starting
over. Onboarding they have already completed must not replay, and a "what's new" that fires on every
launch is the opposite failure. A screen that reads perfectly on day 1 and day 2 and is disorienting
on day 30 is unfinished.

#### Form behaviour under failure

**The user's work is not a casualty.** *Form and input rules* designs the form at rest — labels,
validation timing, error placement, grouping. These four design it when something goes wrong, which
is where AI-generated forms fail: the happy path is generated, the recovery path is not.

- **Entered data survives.** A failed submit, a validation error, a back navigation, a session
  expiry, or a refresh must not silently clear what the user typed. Repopulate from the submitted
  values and return focus to the first field that needs attention; never hand back an empty form
  after an error. Re-asking for work the user already did is the single most expensive defect in
  this section. (The platform-level cases — browser back, refresh, backgrounding, re-auth — are
  under *Runtime hazards* above.)
- **Persistence state is visible.** If the form saves, autosaves, or keeps a draft, the user can see
  which and when — "Saved", "Saving…", "Draft saved 2 min ago". If it does **not** persist, that
  must be knowable *before* they navigate away, not after. Unsaved changes are shown, never
  inferred: leaving a dirty form warns, it does not silently discard. An autosave with no visible
  confirmation is indistinguishable from data loss, and an unlabelled "Save" on an
  already-autosaving form teaches the user their work was at risk. Prevention beats recovery here: a
  draft that survives is worth more than the best-written "are you sure?" dialog. (Nielsen's *Error
  prevention*; the guidance here is this kit's own.)
- **Multi-step flows show position.** Any flow of three or more steps shows where the user is and
  what remains — a numbered stepper, a progress bar with named stages, or "Step 2 of 4". Completed
  steps are reviewable and, where the data allows, editable without restarting. A wizard that
  reveals its length only by ending is a maze.
- **Limits are stated before they are reached, not on rejection.** Character counts, upload size and
  file-type restrictions, and item maximums belong at the input, visible before the user invests
  effort. Surface the counter as the limit approaches (not from zero, which nags, and not only after
  it is exceeded, which is too late) and state file constraints beside the picker, not in the error
  that follows a failed upload.

#### Control-type semantics

**Pick the control type from its meaning, not from how it looks.** *Color — semantic roles* governs
how a chosen control *shows* its state (selection ≠ action, single- vs multi-select channels); this
governs which control is correct in the first place. A control's shape is a promise about its
behaviour, and the wrong shape is a promise the user only discovers by acting on it.

| Control | Means | Behaviour it promises |
|---------|-------|-----------------------|
| **Radio** | Exactly one from a visible, mutually exclusive set | Choosing one deselects the rest; the whole set is shown at once |
| **Checkbox** | Independent selections | Each toggles alone; zero, some, or all may be on |
| **Switch / toggle** | A setting that takes effect **immediately** | No Save step and no confirm — if the change must be applied or confirmed later, it is not a switch |
| **Segmented control** | Peer *views* of the same content | Changes what is displayed, not what is stored |
| **Dropdown / select** | One from a set too long or too rare to show inline | Costs an interaction to reveal — never use it for 2–3 options that fit as radios or a segmented control |

Three corollaries the reviewer enforces:
- **A switch that needs a Save button is the wrong control.** Either commit the change on toggle
  (and show that it committed), or use checkboxes with an explicit submit. A settings page mixing
  both models in one section teaches the user that nothing can be trusted to have applied.
- **A button must not be dressed as a tag, tab, or checkbox.** If it performs an action, it looks
  like a button. The common failure is an action rendered as a pill sitting in a row of filter chips
  — identical shape, entirely different consequence.
- **A tag is not tappable unless it is a filter.** A category, status, or metadata tag that carries
  no interaction must not carry hover, press, or focus affordances. If it *does* filter, it needs a
  visible selected state, and the multi-select rules in *Color — semantic roles* apply to it.

#### Build and asset hygiene

**Edit source and run the project's build.** Never write into `build/`, `dist/`, `.next/` or any
output directory directly — doing so skips asset hashing, image optimisation, code splitting and CSS
extraction, and produces files the dev server will not serve. The change appears to work and ships
broken. This is a failure mode specific to agents, which is why it is written down here.

**Verify an image URL before referencing it.** A guessed photo ID or a plausible-looking stock URL
ships as a broken-image placeholder. Check it resolves, or use fewer images you are confident about.
Prefer correct dimensions, useful alt text, lazy loading below the fold, and responsive
`srcset`/`picture` for raster.

#### Prototype hygiene

**Prototype hygiene.** Demo, reviewer, and dev controls never render on the product surface — a
first-time user will try to parse a leaked state-toggle as a feature. Gate them behind a build flag
or hidden gesture. Any non-persisted demo state (reactions, drafts that won't save) carries a
visible "won't be saved" cue.

---

### AI and agentic interfaces

**Load this section only when the product's core interaction is a model producing output or an agent
taking actions on the user's behalf.** It does not apply to a product that merely has AI somewhere
inside it. Everything here is scoped to what is *genuinely different* about designing these
interfaces — general principles that happen to be discussed in AI literature (undo, feedback
widgets, onboarding with familiar touchpoints, plain-language copy) are already covered in their own
sections and are not repeated here.

**The premise: three properties break assumptions the rest of this file makes.** Output is
*non-deterministic*, latency is *unbounded and variable*, and the system acts on an *interpretation*
of intent rather than on an instruction. Each one invalidates a rule that is correct everywhere
else.

#### Before the system acts

- **Confirm the interpretation, not the consequence.** Ordinary UI confirms actions that are hard to
  reverse. Here the risk is different: the model will proceed confidently on a plausible-but-wrong
  reading, and the cost lands after the work is done. When a request is materially ambiguous,
  resolve it *before* execution — in **one** round trip, not an interrogation. Offer concrete
  options rather than an open question ("which of these three did you mean?" beats "can you
  clarify?"), and always provide a way to proceed without answering.
- **Show the plan before a multi-step run.** Any agent that will act autonomously across several
  steps states what it will do, in what order, and where it will stop — *before* starting, because
  there is no inspecting it mid-flight and a long wrong run is the most expensive failure in this
  class. Steps are short, verb-first, and individually approvable or skippable. Fold a long plan
  into named groups rather than listing thirty items.
- **Scope permissions to the task, and show the scope.** An agent can reach things the user never
  considered. State what it may read, write, and call for *this* task; make the boundary visible
  rather than buried in settings; and escalate for anything outside it instead of proceeding. This
  is not the *role/permission variants* rule — that one is about what a person may see; this is
  about what the system may touch.
- **If the product has both an advisory and an acting mode, the mode is always visible and always
  the user's choice.** "Suggest" and "do it" have different consequences and must not look the same
  or switch implicitly.

#### While it is running

- **Streaming replaces the loading rules, it does not extend them.** The timings under *Behaviour,
  states and recovery* — delay an indicator ~300ms, hold it ≥500ms, size a skeleton to the exact
  content it replaces — assume a bounded operation with a knowable result size. Streaming has
  neither. Show the first token as soon as it exists rather than delaying, never reserve a skeleton
  sized to a length you cannot predict, and design the reflow so arriving text does not shift what
  the user is already reading. A response that streams for forty seconds and one that finishes in
  two must both look deliberate.
- **Make the process legible in proportion to its length and its stakes.** A short generation needs
  no narration. A long autonomous run needs to show what it is doing now, what it has finished, and
  what remains — a user watching an opaque spinner for two minutes cannot tell "working" from
  "stuck". Show real steps and real tool calls, not a fabricated progress animation.
- **Anything long-running is interruptible, and the partial result is handled deliberately.** Stop
  must be reachable at any moment and must actually stop the work, not just hide it. Then decide,
  and state, what happens to what was produced so far: kept, discarded, or offered as a draft.
  Silently throwing away ninety seconds of output is the failure.
- **Keep a person in the loop wherever the action is consequential or hard to reverse.** Automate
  progressively — the further the user's trust and the lower the stakes, the more the system may do
  unattended — and make the checkpoint a real decision, not a rubber stamp. When automation fails,
  hand control back with the work-in-progress intact rather than dead-ending.

#### After it produces something

- **When the system changes the user's artifacts, show a diff, not a summary.** "I updated three
  files" is not reviewable. Show what changed, per location, with per-change accept and reject.
  Prose describing an edit is a claim about the edit; the diff is the edit.
- **Generated content is attributed, and a claim that cannot be attributed is marked as generated.**
  Where output rests on sources, cite them at the point of the claim rather than in a bibliography
  at the end, and make the citation resolvable. This is the design-side answer to fabrication: not a
  promise of correctness, but making the user's verification cheap.

#### Cross-cutting

- **Generated content never carries the same visual authority as retrieved or verified content.**
  This is a *hierarchy* rule, and it is the most important one in this section. When a surface mixes
  the two — a summary above real records, an inferred field beside an entered one, a suggested value
  in a form — the distinction must be visible at a glance, in a channel other than colour, without
  the user reading anything. If a generated figure and an authoritative figure are styled
  identically, the interface has asserted something it cannot support.
- **Decide whether to show confidence at all — and default to no.** A percentage beside a generated
  claim reads as measured precision the model does not have, and users over-trust a high number and
  discard a low one rather than judging the content. Show it only where the user has a decision that
  the number genuinely changes, and prefer coarse, honest bands with stated meaning over a spurious
  figure. Never let a confidence display substitute for the attribution rule above.
- **Model failures are their own error family, and there are six of them.** *Behaviour, states and
  recovery* separates network from data from permission errors; these need the same treatment and
  are none of the above. Each needs its own copy and its own recovery, and none may render as
  "Something went wrong":
  - **Incorrect output** — it produced something confidently, and it is wrong. The defining failure
    of this class, and the only one the system usually cannot detect itself. There is no error state
    to design; the design response is everything that makes the error *findable* — attribution, the
    generated-vs-retrieved distinction, and a correction path that does not require starting over.
  - **No result** — it ran and found nothing. Distinct from an empty state, which means nothing
    exists yet; here something was searched and came back empty, and the user needs to know which.
  - **Refusal** — it declined. The user must be able to tell a decision from a fault, and be told
    what would make the request answerable.
  - **Low quality** — it produced something it does not stand behind. Say so rather than shipping it
    silently at full confidence.
  - **Tool or action failure** — a step it took on the user's behalf failed. Name the step, not the
    task, and say what state the world is now in.
  - **Unavailable evidence** — the answer exists but cannot be sourced or verified. Mark it as
    unattributed rather than presenting it identically to a cited claim.
- **State the capability boundary, because the interface does not imply it.** A button's affordance
  tells the user what it does; a text input that accepts anything tells them nothing about what will
  work. Say what the system is for and what it cannot do, at the point of use rather than only in
  onboarding — and phrase it as capability, not as architecture. The user needs to know what to ask
  for, not which model is running.
- **Design for non-determinism.** The same input can produce different output, so: *regenerate* is a
  first-class affordance rather than an afterthought; nothing in the UI may imply the answer is
  canonical; and anything the user needs to keep must be explicitly savable, because it may not be
  reproducible. This also bounds what can be tested — an exact-output fixture is not a valid check
  for a generated surface.

---

### Copy hygiene

**Em-dash overuse** (more than 2 in a single UI text block) is an AI cadence tell. Use commas,
colons, periods, or parentheses.

**Marketing buzzwords** are banned in microcopy (see Design decision gates). Specific verb + noun
instead.

**Aphoristic contrast cadence.** Sections that land on a short rebuttal ("Not a feature. A
platform.") read as AI copy. Once may be intentional; repeated is a tell. Dismissing something as
"theater" ("we killed the growth theater") is the same generated-copy tic — say plainly what the
thing does or does not do.

**Redundant labels.** If the visual already communicates it, the label is noise.

**Action labels must be specific.** "Submit" describes nothing. "Save changes," "Send message,"
"Book appointment" — every CTA should complete "Click this to…"

**Emotional register matches the user's state.** Negative, sensitive, or failure states use gentle,
indirect wording — never bluntly label the user's condition ("you are negative", "you failed"). In
wellbeing contexts especially, the moment the user feels worst is the moment copy must be kindest.
Frame around the action or the shared experience, not the diagnosis.

**Copy must parse one way.** If a phrase supports two readings ("resonated with the negative" vs "a
negative resonance"), rewrite it. Test labels by asking what a first-time user would think each
means.

**Truncation is a design decision, not an accident.** For every text slot, decide: single-line
ellipsis (names in rows), N-line clamp (card descriptions), or wrap (headings, body). Truncated text
must never hide the distinguishing part (truncate the middle of long unique IDs). Test with the
long-name partial-data case. JP↔EN note: translations shift length dramatically in both directions —
labels and buttons must survive both. Check heading text against clipping ancestors: a page with
no horizontal scrollbar can still lose half its headline behind `overflow: hidden` or `clip`.

---

### Information hierarchy

This section defines local priority principles. Apply them across a complete screen through
**Page-level visual hierarchy** rather than inventing a second ranking method.

- **Frequency drives prominence.** Low-frequency actions (logout, delete account, rarely-changed
  settings) should be visually subordinate — smaller, lower in the list, lower contrast.
- **No redundant labels.** If the visual communicates it, the label is noise (an ON/OFF label next
  to a toggle; a count label next to the avatars it counts).

---

### Cognitive load and interaction density

This section owns density and choice-management rules. Use **Page-level visual hierarchy** for the
screen-wide role inventory and emphasis-channel ordering.

- **Choice sets:** more than ~6 simultaneous options need grouping (categories, positive/negative,
  tabs) or progressive disclosure. Eight ungrouped choices is a wall.
- **One screen, one primary job.** A screen dense with co-equal interactive areas has no job.
  Sequence inputs, stage them visually, or collapse secondary inputs behind disclosure — and keep
  exactly one dominant action.
- **Prefer dominance over navigation.** When two actions compete, make the primary visually dominant
  rather than splitting the flow into more screens — every added screen is added task burden.
- **Unavailability pattern:** avoid a modal whose only job is announcing that something is locked.
  Explain ordinary unavailability at the point of need. A requested detail/recovery flow, permission
  explanation, or consequential restriction may justify a dialog or sheet.
- **One idiom per control type.** A product teaches one segmented-control style, one sheet pattern,
  one close affordance, one toggle. Two visually different idioms for the same job double the
  vocabulary the user must learn — and read as two design sessions stitched together.
- **Don't expose system-operated controls.** If the system sets a control's state automatically (a
  tab that switches by time of day, a filter the app manages), it isn't a control — it's noise that
  invites confusion. Hide it, or make it genuinely user-operated. A control the user can see must be
  one the user meaningfully operates.
- **The decoration test.** For every decorative element or animation, ask: does removing it lose any
  meaning? If not, remove it. One signature decorative moment per screen maximum — decoration
  competes with the task everywhere else.

---

### Modal and sheet weight

Match transition weight to action weight:

| Transition | Use for |
|------------|---------|
| Full-screen modal | Multi-step flows, onboarding, camera/media capture |
| Half-modal / bottom sheet | Settings, detail views, quick actions, confirmations |
| Inline expansion | Minimal context switches |
| Toast / snackbar | Non-blocking success and info feedback only — never for errors |

**If the modal needs a scrollbar and multiple columns, it belongs on its own page.**

Toasts are for success and informational states. Never use a toast for a foreground error that
requires user action — those are inline. Exception: failures of **background/async operations** (an
upload that fails after navigation, a sync error) have no inline location; use a persistent,
non-auto-dismissing snackbar with a retry action.

**Dismiss affordances — bottom sheet vs. centered dialog.** Match the dismiss affordance to the
modal type. Don't stack redundant close controls.

| Modal type | Identifying trait | Dismiss affordances | Close button? |
|------------|-------------------|---------------------|---------------|
| Bottom sheet | Slides up from bottom; may have a grabber | Swipe/backdrop for lightweight sheets; explicit close/cancel when dismissal is not obvious, gestures are unavailable, or work may be lost | Contextual |
| Centered dialog | Floats centered, no edge attachment | Explicit close/cancel; backdrop may dismiss only when accidental dismissal is harmless | Usually |

A grabber is a visual hint, not a complete accessible dismissal mechanism. Choose affordances by
platform convention, action consequence, accessibility, and whether dismissal loses work. More than
one dismissal path is not automatically redundant when the paths serve different input modes.

Supporting rules:
- A grabber must actually drag. A decorative grabber with no swipe-to-dismiss logic (threshold
  ~120px) is a bug — the affordance lies about the behaviour. Wire up swipe + backdrop tap before
  removing any explicit close button.
- The × on a dialog can be visually secondary but must remain perceivable and meet the platform's
  target-size requirement. Backdrop dismissal is supplementary, not the primary accessible route.
- Redundant-close smell test: remove duplicate controls only when they serve the same input mode and
  add clutter. Preserve explicit cancel/close when it prevents loss or supports keyboard, switch, or
  screen-reader users.
- A full-width Cancel/Close action in a sheet is contextual: avoid it when it competes with the
  primary action without adding access, but retain it when platform convention, reachability,
  consequence, or assistive access warrants it.

---

### Motion

- Motion is intentional — designed at the same time as layout, not added at the end.
- Ease out with exponential curves (ease-out-quart/quint/expo). No bounce, no elastic (see Design
  decision gates).
- Durations: ~150ms for hover/small state changes, ~250ms for panels/dropdowns, ~350ms for
  modals/page transitions. Under 100ms reads as a glitch; over 400ms reads as lag.
- **Response latency and transition duration are different numbers, and the kit's two figures are
  not in conflict.** *Transitions* under ~100ms read as a glitch — the eye registers a change it
  cannot follow, which is the line above. *Responses to direct input* under ~**80ms** feel
  instantaneous, because perception buffers roughly that long to synchronise the senses. So: a state
  change the user triggered should **land** inside ~80ms, and the animation that carries it should
  still **run** 150ms or more. When the two cannot both hold, acknowledge the input immediately and
  animate the consequence — never delay the acknowledgement to fit the curve.
- **Exits run faster than entrances** — **0.6–0.8×** the entrance duration (a 300ms enter pairs with
  a 200ms exit); ease-in or linear acceptable on exit. The user has already decided to leave. Never
  the reverse.
- **`transform-origin` is considered, not defaulted:** menus and popovers scale from their trigger
  corner, not from center.
- Stagger within one list: legitimate. The same entrance animation on every page section: AI
  grammar.
- `@media (prefers-reduced-motion: reduce)` is non-optional — crossfade or instant transition as
  fallback.
- Don't gate content visibility on a class-triggered animation.
- Animate `transform` and `opacity` only — not layout properties (see Quality requirements).

**Concrete recipes live in `motion-recipes.md`.** Trigger, what changes, duration, easing and the
accessibility line for the interactions that recur in every product — button press, input focus,
validation, toast, modal, dropdown, tooltip, tab change, number tick, copy, drag, optimistic update,
search-as-you-type, command palette, page-load reveal, streaming output. Open it when building an
interaction; this section decides *whether* and *how much*, that file is *how*.

**Motion budget — the count is the rule.** No more than **three distinct animation primitives per
screen**. A counter, a hover-lift and a stagger is three; the fourth is the one that makes the page
feel busy, and "just one more" is the reliable pull. Nothing runs longer than **2s** except a
deliberate continuous loop (marquee, ambient breathing, caret blink). Most screens are better with
two.

**0ms is a real answer, and often the right one.** Focus states, keyboard navigation, and error
appearance should generally not animate at all — a keyboard user has already moved, and an error the
user must read should be *there*, not arriving. Treat "no animation" as a first-class choice in the
timing decision rather than the absence of one.

**What never gets motion by default**, regardless of register:
- **Body text revealing on scroll.** Reading is not a cinematic experience.
- **Background gradient shifts.** Distraction with no state behind it.
- **Cursor followers.** No product purpose; a reliable AI tell.
- **Section-by-section fade-up-stagger.** Pick *one* orchestrated entrance for the page, not twelve;
  a page that never settles is the most-shipped motion defect there is. (This is the *specific* form
  of "the same entrance animation on every page section" above.)
- **Tab content sliding sideways.** Crossfade; the tabs are peer views, not places.
- **Scroll-linked animation on narrow viewports** (below ~40rem). There is not enough scroll
  distance for it to read as anything but jitter.

**Reaching for a JS animation library — the gate.** **CSS remains the default, and the default has
moved.** A hover, focus, press or component-state transition that a CSS `transition` can express
must never arrive as a library timeline. Before reaching for a library at all, check whether the
platform now covers the case:

| Want | Reach for | Not |
|---|---|---|
| Scroll-linked progress | `animation-timeline: scroll()` / `view()` — scroll-driven animations, no JS, runs off the main thread | a scroll listener, or a library timeline for a single element |
| Enter/exit on a DOM change | `@starting-style` + `transition-behavior: allow-discrete` (and `popover` for overlays) | mounting a library to fade one panel |
| A cross-page or cross-state morph | the **View Transitions API** (`startViewTransition`, `view-transition-name`) | hand-animating FLIP |
| Simple spring/physics feel | `linear()` easing with a generated curve, or CSS `transition` with a tuned cubic-bezier | a physics library for one button |
| One element, one property | `transition` | anything else |

A **library** (GSAP, the Web Animations API, Framer Motion, Motion One) is justified for exactly
five things: coordinated timelines sequencing several elements against one clock · scroll-linked
*progress* (not fire-once reveals) · SVG and path animation (morph, draw-on, motion along a path) ·
interruptible or reversible sequences · multi-element transitions that span components.

Every library-driven animation must then carry all seven of these, **whichever library it is**.
These are correctness requirements, not taste — a leaked scroll trigger and a missing reduced-motion
branch are defects in the same class as a memory leak, and they are why this belongs in the build
path rather than behind a verb:

1. a stated **motion purpose** — what state, feedback or continuity it conveys;
2. **lifecycle cleanup scoped to the component and torn down on unmount** — GSAP `gsap.context()` →
   `.revert()`; WAAPI keep the `Animation` handle → `.cancel()`; Framer Motion let `AnimatePresence`
   own exit rather than timers; Lenis/smooth-scroll `.destroy()`; Lottie `.destroy()`. Anything that
   registers a global (a scroll trigger, an observer, a listener, a ticker) unregisters it;
3. **responsive and reduced-motion branches** — GSAP `gsap.matchMedia()`, Framer Motion
   `useReducedMotion()`, or a plain `matchMedia('(prefers-reduced-motion: reduce)')` guard. An
   explicit reduce branch, not a global duration multiplier that still moves things;
4. **complete teardown** — no leaked triggers, listeners, RAF loops, or inline styles left on the
   DOM after the component goes;
5. **no scroll hijacking**, no interaction blocked while the animation runs, and no smooth-scroll
   library that breaks in-page anchors, browser find, or focus scrolling;
6. a **static equivalent that still communicates** — the screen must work with motion off, and
   content must never be *gated* on an animation or an intersection callback that may not fire;
7. **verified performance on target hardware** — ~60fps on representative mobile, not the
   developer's laptop; animate `transform`/`opacity`, promote deliberately, and never animate a
   property that triggers layout.

Fail any line → simplify, or fall back to CSS. Copy-in effect libraries (animated gradients,
spotlights, particles, cursor trails) are a source for *one* gated signature moment, never a general
component system: such an effect must clear the seven points **and** earn its place as the screen's
single signature moment. A decorative effect with no product purpose is an AI tell.

---

### Platform notes

The rules above apply universally. Platform-specific callouts:

**Web**
- Hover states are required; active states strongly recommended
- Focus rings are non-optional for keyboard and screen-reader users
- Max content width: 1280px typical; reading columns ≤ 75ch
- Scrollable containers must have a visible scroll affordance when content overflows
- Popovers, menus, and tooltips must escape clipping ancestors — an `overflow: hidden` container
  that cuts them off is a bug; free the overflow or portal the layer out

**Page navigation (web)**
- **The navigation archetype is a decision, and the system records it.** `DESIGN.md` pins cards,
  buttons, inputs, icons and modals; nav shape belongs in the same contract. A nav that no document
  specifies was not chosen — it is default-attractor output, and it is the single most visible
  element on the page. Name the archetype and one line of rationale.
- **Choose the archetype from the product's character, not from habit.** Full-width bar, detached
  floating pill, masthead, side rail, edge-aligned minimal, command-palette-first, banner + retract
  are all standard. The test is whether someone landing on the nav alone could tell what kind of
  product this is. If the answer is no, it is the fingerprint above.
- **Hiding the nav row is half a pattern; the toggle is the other half.** When the desktop row
  collapses below a breakpoint, a menu affordance must appear at the *same* breakpoint — a sheet,
  drawer, or disclosure menu. Shipping only the hide makes every hidden destination unreachable,
  which is a functional defect rather than a styling one. Order of fixes when the row will not fit:
  shorten the labels first, then `white-space: nowrap` and let the parent reflow, then
  `hidden=until-found` on the lowest-priority item (it stays in the DOM for find-in-page), and only
  then collapse into a menu.
- **Top-level nav links and CTAs never wrap to two lines** at any viewport. Clickable text on two
  lines reads as a rendering bug, not a choice. This concerns a single action label, not an
  intentionally composed clickable card or disclosure with a separate title and description.
- Skip links, landmark roles and focus order for the nav are covered under *Accessible semantics and
  keyboard* — a nav is the first thing a keyboard user meets.

**Navigation chrome (native, both platforms)**
- Tab bar: 3–5 items, every item labelled (icon-only tab bars fail recognition), filled-vs-outline
  or colour as the active state, active state always unambiguous.
- Headers: one title convention system-wide (e.g. large title on roots, inline title + back on
  pushed screens). Back is a chevron/arrow top-left — never a custom X on a pushed screen (X means
  dismiss, not back).
- **Persistent bottom stacks** (`C23`, `C24`). Prefer one surface as primary navigation. If a
  mini-player, call strip, or similar accessory also persists, keep it visually and semantically
  subordinate and consider minimising, collapsing, or moving it inline on scroll. Current platform
  patterns permit a supported stack, so “never stack bottom bars” is not a rule; review navigation
  semantics, safe-area clearance, focus visibility, and the content space the stack consumes.

**iOS (native)**
- Follow Apple Human Interface Guidelines for navigation (tab bar at bottom; stack navigation for
  hierarchy)
- Use system fonts (SF Pro) where brand permits — custom fonts require careful weight/size
  calibration
- Respect safe area insets, especially the bottom home indicator zone
- Prefer the platform presentation that preserves context and matches task weight; bottom sheets are
  useful for lightweight, mobile actions but are not a universal replacement for dialogs/pages.
- Provide haptic feedback on destructive actions

**Android (native)**
- Apply Material You design language where appropriate
- Navigation: three-button or gesture nav is a system responsibility — don't fight it
- Back is the system's: support predictive back (current Android previews the destination during the
  gesture) and keep the back stack honest so the preview shows where back actually goes. Intercept
  back only to guard unsaved work, through the platform's back-callback API — never by swallowing
  the gesture or jumping somewhere other than the previous screen.
- 48dp minimum touch targets (enforced)
- Use Snackbars for dismissible feedback
- Keep fixed bottom bars clear of the gesture navigation zone. The bottom home/quick-switch area
  cannot be excluded; the 200dp cap belongs only to side back-gesture exclusions, and broad scroll
  regions do not warrant exclusions (`C19`).

**Japanese / CJK text**
- Tracking: the −0.04em display floor is a Latin rule. JP display text: 0 to +0.05em; never
  negative-track kana/kanji.
- No italics in JP UI — emphasize with weight, size, or colour.
- Line height: JP body 1.6–1.9 (denser glyphs need more leading than Latin's 1.5–1.7).
- Line length: the 65–75ch rule doesn't map — target ~35–40 full-width characters.
- Name the JP font stack in DESIGN.md (e.g. Noto Sans JP, Hiragino Kaku Gothic). JP families ship
  fewer weights — verify the specified bold actually exists, or the browser fakes it (faux-bold is a
  cheapness tell).
- Headings: avoid awkward mid-phrase breaks — `word-break: auto-phrase` where supported, or manual
  `<wbr>`.
- Mixed JP/EN: dates and numbers stay Latin ("7月 9"); use a composite font stack so Latin glyphs
  harmonize with kana baselines.

**Software keyboard (mobile — native and web)**
- The keyboard must never hide the focused field or the action that submits it. On focus, the field,
  its label, its error message and the primary action all stay visible above the keyboard — scroll
  the container, resize to the visual viewport, or float the CTA above the keyboard inset. A
  Continue button permanently behind the keyboard is a blocker, not a polish item.
- Match the keyboard to the input (`inputmode` / `keyboardType`: numeric for codes and amounts,
  `email`, `tel`, `url`) and make the return key do the next meaningful thing — advance to the next
  field, or submit on the last one.
- Provide a way to dismiss it — tap-outside, a Done affordance, or scroll-to-dismiss — and confirm
  the layout settles back to rest afterwards without a leftover gap or a scrolled-off header.
- Test at the **smallest supported device height with the keyboard open**. A form that works on a
  6.7" screen and buries its primary action on a 5.4" one is untested, not responsive. This is the
  mobile twin of the sticky-chrome rule under *Responsive and adaptive layout*.

**Gestures and haptics (native)**
- **Every custom gesture has a visible alternative.** Swipe-to-delete, long-press menus, pinch,
  two-finger and custom edge-swipe gestures are invisible, undiscoverable, and unavailable to
  switch-control, voice-control and many motor-impaired users. Ship the gesture as an *accelerator*
  and a visible control — a row action, an overflow item, a button — that performs the same job.
  Platform-standard gestures (pull-to-refresh, system back-swipe) are learned and need no discovery
  affordance, but the action behind them must still exist somewhere in the UI.
- **A drag starts after a movement threshold, not on touch-down.** Use the platform's touch slop (or a
  few points of pointer movement on web) so a tap or a scroll is never read as a drag. A draggable
  item inside a scrolling list needs a handle or a long-press to begin, or scroll and drag fight
  over every touch — and reordering by drag still needs its visible alternative (above).
- **Haptics support feedback; they are never the only channel.** A haptic always accompanies a
  visible change (and an announced one where the result matters): the user may have haptics off
  system-wide, the device may be on a table or in a case, and a haptic conveys nothing to a
  screen-reader user. The destructive-action haptic required under *iOS (native)* above is a
  **second** channel on top of the visual confirmation, not a replacement for it.

**Internationalisation beyond JP**

The Japanese/CJK block above goes deepest because it is the kit's most frequent non-Latin case.
These apply to every locale.

- **RTL (Arabic, Hebrew, Farsi, Urdu): the layout mirrors, and so do directional icons.** Build with
  logical properties — `margin-inline-start`, `padding-inline`, `border-inline-end`, `text-align:
  start`, `inset-inline` — instead of left/right, and `dir="rtl"` mirrors the layout for free.
  Directional glyphs mirror: back/forward chevrons, progress and flow arrows, indent/outdent,
  undo/redo, send. Non-directional ones do not: clocks, checkmarks, the logo, and media transport
  controls by convention. Numbers and embedded Latin runs stay LTR inside RTL text.
- **Dates, times, numbers, currencies and units are locale-formatted, never hand-assembled.** Use
  the platform locale API (`Intl.DateTimeFormat`, `Intl.NumberFormat`, or the native equivalent).
  Never build "MM/DD/YYYY" or "1,234.56" by string surgery, never assume the decimal separator, and
  never pluralise with `count !== 1 ? 's' : ''` — plural rules differ by language and several
  languages have more than two forms.
- **Text expansion is designed for, not discovered.** Budget roughly 30–40% growth over English
  (German and Finnish are the usual worst cases) and expect CJK to shrink. Never fix the width of a
  text container to its English string; buttons, tabs, nav labels and table headers break first, and
  they break as clipping or overlap rather than as a visible error. This is the JP↔EN truncation
  obligation under *Copy hygiene*, generalised to every locale you ship.

**Cross-platform consistency:**
- Core spacing, color semantics, and interaction model should feel consistent
- Platform-specific controls should use native components — don't recreate them in custom CSS

---

### Design commitment check

Before shipping any interface, verify the design has a point of view:

- **First-order check:** Could someone guess the theme and palette from the product category alone?
  If yes, it's the first-reflex AI move. Rework.
- **Second-order check:** Could someone guess the aesthetic family from category + "not the obvious
  AI version"? If yes, the second reflex wasn't avoided either. Rework.

A design that feels considered has made at least one choice that surprises — a font, a color, a
layout move — that signals a human was thinking about this specific product, not applying a
template.

---

### Documentation integrity — absolute claims must be verifiable

An absolute claim in `DESIGN.md` ("**zero** coloured shadows," "no border+shadow combinations,"
"never a translucent fill," "all radii ≤ 16px") is a testable assertion, not prose. A doc that
states an absolute the codebase contradicts is worse than silence — it gives a false green and stops
reviewers from looking.

- **Every absolute doc claim is checked against the code, not taken on faith.** When `DESIGN.md`
  says *zero / no / never / always / all* about a property, the reviewer must confirm it in the
  **inline-style consistency sweep** (JSX `style={{…}}` and inline CSS the token graph can't see),
  not just against tokens.json. A "zero coloured shadows" claim contradicted by teal inline
  `box-shadow`s is a finding — the token validator sees only token values, so an inline violation
  hides behind a green validator.
- **An unverifiable or violated absolute is itself the finding.** If the claim can't be mechanically
  checked (too vague) or a sweep contradicts it, flag the *claim*: either the code must be brought
  into line, or the doc must be softened to what's true (e.g. "no coloured shadows *in tokens*" or
  "coloured shadows retired except the documented X"). Do not let an aspirational absolute stand as
  a statement of fact.
- Absolutes that map to an existing scanner pattern (coloured shadow, translucent fill,
  border+shadow, oversized radius) should be run through `scan.sh` over the whole surface, since the
  scanner reads inline styles the validator doesn't.
