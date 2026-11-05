# Motion recipes

Open this at the moment you are building an interaction, the way you open a `rules.md` section at a
decision point. `rules.md` → **Motion** decides *whether* and *how much*; this file is *how*, for the
interactions that recur in every product.

**These are product-UI recipes.** Delight moments, signature motion and brand-voice motion are a
build decision for the direction in hand (`design-build`), not defaults here.

Every recipe is: **trigger · what changes · duration · easing · the accessibility line**. If a
recipe is missing, derive it from `rules.md` → Motion rather than inventing a new timing.

---

## The timing canon

Pick a bucket. Do not invent new durations.

| Bucket | For |
|---|---|
| **0ms** | Focus states, keyboard navigation, error appearance, command-palette open. The right answer more often than it looks — a keyboard user has already moved, and an error the user must read should *be there*, not arrive. |
| **80–120ms** | Instant feedback: button press, checkbox flip, keystroke echo. Read as immediate. |
| **150–200ms** | Hover transitions, single-property fades, tooltip appearance. |
| **250–300ms** | Modal / sheet / dropdown open, content fade-in, tab crossfade. |
| **400–500ms** | Toast slide-in, first page-load reveal, multi-property transitions, accordion. |

**Exits run at 0.6–0.8× the entrance.** A 300ms enter pairs with a 200ms exit. Never the reverse.

**Easing.** Three curves cover ~90% of UI motion; tokenise them and never freestyle:
`--ease-out` for anything entering or responding (decelerate), `--ease-in` for anything leaving,
`--ease-in-out` for anything moving between two on-screen positions. No bounce or elastic on UI
state — reserve overshoot for physical/direct-manipulation gestures only.

**Reduced motion is a branch, not a multiplier.** `@media (prefers-reduced-motion: reduce)` either
removes the movement and keeps the state change, or collapses to a ≤150ms opacity crossfade. Scaling
every duration down still moves things.

---

## Recipes

### Button press
Trigger: pointer down. Changes: `transform: translateY(1px)` or `scale(0.98)` on press, base on
release. 100ms in / 150ms out; `--ease-in` in, `--ease-out` out.
**A11y:** the focus ring appears **instantly** and is never animated into existence.

### Input focus
Trigger: focus. Changes: border colour, and the label floats if the pattern uses one. 200ms
`--ease-out`. The change lands *before* the user types — that is what confirms the field is live.
**A11y:** `:focus-visible`, not `:focus`. Under reduced motion drop the label slide, keep the colour.

### Form validation
Trigger: **blur after the field has been touched once**, then re-validate on every input. Validating
from the first keystroke is hostile. Changes: icon scales in 200ms `--ease-out`, border tints, helper
text swaps. **A11y:** the message says what broke *and* how to fix it, sits below the field, and is
announced — colour is never the only channel.

### Toast
Trigger: an action completes or fails. Stack in one corner; new toasts push in one direction and
existing ones **do not reposition**. 400ms in `--ease-out`, 4–6s dwell, 300ms out `--ease-in`; pause
dwell on hover **and** focus.
**Use sparingly:** if the effect is visible on screen, no toast. Failures always get one, with retry
or undo. **A11y:** `aria-live="polite"`; `assertive` only for genuine interruptions.

### Modal / sheet
Backdrop fades 300ms. Content 0.96 → 1.0 scale + opacity, 300ms `--ease-out`. Close 220ms
`--ease-in`. Use native `<dialog>` — focus trap and `::backdrop` for free — and `inert` on the
background. First focus goes to the first interactive element, **not** the close button. Escape
closes; focus returns to the trigger. Reduced motion: 150ms opacity only.

### Dropdown / menu
Open 180ms `--ease-out`, optional 30ms item stagger at ≤8 items. Close 140ms `--ease-in`.
Light-dismiss on outside click and Escape. Use the Popover API and CSS anchor positioning where
available; flip within 16px of a viewport edge. Must escape any `overflow: hidden` ancestor.

### Tooltip
Hover opens after **800–1000ms**; keyboard focus opens at **0ms** — a keyboard user arrived
deliberately and must never be delayed. 150ms `--ease-out` opacity.
**A11y (WCAG 1.4.13):** hoverable, persistent, and dismissible with Escape. Never put anything
reachable only by hover inside it.

### Tab change
Indicator slides `transform: translateX()` + width, 250ms `--ease-out`. Outgoing content fades 100ms
`--ease-in`; incoming 150ms `--ease-out` after a 50ms delay. **Never animate the panel's height** —
if height changes, animate `grid-template-rows: 0fr → 1fr`. Content crossfades; it does not slide
sideways (tabs are peer views, not places).

### Number tick
Trigger: data resolved. Count 0 → value over 400ms with easing applied to the **value**, not the
element. Format with `Intl.NumberFormat`. **A11y:** announce the final value once via `aria-live`,
never every tick. Reduced motion: show the final value immediately.

### Copy to clipboard
Label swaps to "Copied" with a check; reverts after ~2.5s, or on `mouseleave` if sooner. **No
toast** — the label change *is* the feedback. **A11y:** the swap is announced, and the control keeps
a stable accessible name.

### Drag and reorder
Handle reveals on hover after a 1–2s delay. Cursor `grab` → `grabbing`; ghost at ~50% opacity; a 1px
accent drop indicator tracks the nearest valid target; release snaps with a spring
(~stiffness 280 / damping 26) — this is one of the few places overshoot is correct.
**A11y:** arrow-key reorder when the row is focused, and the drag state is announced. A drag with no
keyboard equivalent is a functional defect, not a missing nicety.

### Optimistic update
Trigger: a reversible, low-stakes action (toggle, like, archive, reorder). State mutates immediately.
On success **nothing happens** — silent success is the mark of taste. On failure: 200ms colour
rollback, then a message saying it reverted and why, with retry or undo, and it does not auto-dismiss
while the user might still want it. **Never** for payments, destructive actions, or anything the user
cannot simply repeat.

### Search as you type
Debounce 250ms before requesting; show a subtle pending cue (border or label shift) while debouncing.
Highlight matches. **A11y:** announce the result count once after the debounce settles, never per
keystroke.

### Command palette
Opens **instantly, no animation**. Arrow keys move a highlight that transitions ~120ms `--ease-out`
between rows — the *indicator* moves, the items do not. Input keeps focus throughout. Items may
stagger-fade on first open only, never on filter change.

### Page-load reveal
**One** orchestrated entrance, staggered by DOM index, capped at ~500ms total. Use
`IntersectionObserver`, never a scroll listener — or `animation-timeline: view()` and no JS at all.
After the first reveal, the page is still: no further on-scroll animation. Content is never *gated*
on the callback firing.

### Streaming / generated output
Show the first token as soon as it exists rather than delaying an indicator, and never reserve a
skeleton sized to a length you cannot predict. Design the reflow so arriving text does not shift what
is already being read. A two-second response and a forty-second one must both look deliberate.
(Full rules: `rules.md` → **AI and agentic interfaces**.)

---

## The motion tells — what generated UI produces

Treat any of these as a finding, not a preference:

- **Universal scroll-triggered fade-up-stagger** on every section, so the page never settles.
- **Everything animating on hover at once** — translate + scale + shadow + colour on one element.
- **`transition: all`** — never specify by omission.
- **A uniform `hover:scale-105`** applied across unrelated elements.
- **Bounce or elastic easing on UI state** (modals, dropdowns, buttons).
- **A focus ring that fades in** — keyboard users need it immediately.
- **Hover-only affordances on touch**, with no focus or tap equivalent.
- **A celebratory toast for an action whose effect is already visible.**
- **A cursor follower**, an ambient background gradient shift, or body text revealing on scroll —
  motion with no state behind it.
- **A library timeline for something a `transition` expresses.** See `rules.md` → Motion for the
  five cases that actually justify a library, the seven-point implementation contract, and the
  modern-CSS routes (`animation-timeline`, `@starting-style`, View Transitions) that remove the need
  for one.
