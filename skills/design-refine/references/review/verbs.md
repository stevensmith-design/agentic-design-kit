# Verbs — what each one looks for

Read-only. This is the diagnosis a dry-run plan is built from: what the verb inspects, the order
it works in, where it stops to ask, and what it hands to another verb. How a change is applied is
not here; that lives with the edit lane and loads only after a go-ahead.

**Every verb, first:** say in one sentence what is on screen and what it is for (the identity you
must keep); read the system (`DESIGN.md`, tokens, the components already in use); name the visitor
mode of each surface in scope. A plan that would change the identity, the system or the mode is a
stop, not an action. A contract that only describes the page as built, or disowns it, is evidence,
not direction; and when the brief rejects the page's own look, there is no identity to keep there —
the plan carries the correctness fixes and puts the direction question to the owner as a stop.

**Every verb, stops:** a change that needs a new token or a contract change; a trade-off only the
owner can make; content that does not exist yet (a price, a customer, a benchmark, a quote — the
plan names the gap, it never fills it with an invented one); demo data that would ship unlabelled.

## polish — the final pass

Works from the critique in hand (this conversation, or one passed in); with none, evaluate first.
Every deviation gets a cause — missing token, one-off, or real drift — because the fix differs.
**Triage in this order and do not skip ahead:** broken tasks → missing states → flow and drift
between screens → visual detail → code hygiene. A pixel nudge on a screen with a dead button is
the wrong pass. Hands off: anything structural to `distill` or `layout`; copy to `clarify`.

## bolder — more impact

Diagnose why it reads as flat: no focal point, timid scale contrast, even rhythm, or a missing
point of view. Strengthen emphasis, proportion and rhythm before adding anything. **Scope is
sovereign:** the surface in scope sets its own intensity — a deliberately quiet section is not
lifted to match its loudest neighbour, and a bold move is not copied across to everything.
**Skeleton test:** strip the copy and imagery; does the structure still carry the hierarchy? If
not, the plan fixes structure before decoration. One focal point per view. Gradients, glass and
glow are not boldness. Stops: any colour, effect or typeface the system does not declare. Loading
a declared face that never loads is a fix, not a new typeface. A fix the scope cannot contain (a
font load is page-wide) is listed with its reach stated, as a handoff, not done inside the scope.

## quieter — less intensity

List every source of intensity (saturated fills, competing accents, motion, weight, density,
borders) and rank them. Cut the ones doing no job first. Neutrals carry the surface; the accent is
rare. The test at the end: calmer, still recognisably this product — a page that went generic has
over-corrected, and that is a finding.

## distill — down to the job

Name the one primary goal of the surface; everything else must serve it, move behind disclosure,
or go. Count colours, type sizes, button styles and competing calls to action — each count over
what the system declares is a candidate. Record every removal and where its function went, so
nothing a user needed disappears silently. Structure questions go to `/ia-review`.

## clarify — the words

Labels, buttons (verb + object), errors (what happened, why, what to do), empty states, loading,
confirmations, destructive dialogs. Rules: `rules.md` → *Copy hygiene*. Inconsistent names for one
thing across screens are a finding even when each is fine alone.

## colorize, typeset, layout

The rules are `rules.md` → *Color strategy* and *Color — semantic roles*; *Typography*; *Spacing
system* and *Page-level visual hierarchy*. The verb's job is the diagnosis: which roles are
missing or overloaded, which levels collapse into each other, where rhythm goes even or a grid goes
monotonous. **colorize** stops before adding a hue the system does not declare. **typeset** stops
before changing a typeface. **layout** runs the squint test: blur the view; the order you notice
things should be the order they matter.

## animate, delight

Motion rules: `rules.md` → *Motion*. **animate** — every motion names its job (feedback, state
change, orientation, one hero moment) and has a reduced-motion form; motion that only decorates
is cut, not tuned. **delight** — only where it is earned: success, empty, first run, recovery,
milestones. Never on the critical path, never on an error the user caused, never twice in one task.

## onboard — first run

What appears on first open, why it is empty, how to start, and the first moment of value. Value
before setup; optional steps are skippable; show, do not tell. Every empty state answers what will
appear here and how to make it appear.

## overdrive — the ambitious version

Proposes two or three directions (each one sentence and the technique behind it) and **stops for a
pick** — the plan never chooses. Progressive enhancement is required: the page works and reads
without the effect, under reduced motion and on a slow device. The plan names the fallback.

## harden — real data, real failure

Long and many content, empty, loading, error, offline, slow, permission denied, concurrent edits,
i18n (expansion, right-to-left, plurals, dates and numbers). Rules: `rules.md` → *Behaviour, states
and recovery*. For AI or agent products also `ai-agentic-readiness.md`. A state that cannot be
reached without a harness is `unassessed`, not passed.

## adapt — another context

Phone, tablet, wide desktop, print, email; touch, pointer, keyboard. Rethink, do not scale: what
does the task need on that device, and in what order? Rules: `rules.md` → *Responsive and adaptive
layout* and *Tap targets*.

## optimize — measured speed

Measure first (LCP, INP, CLS, payload, long tasks) and name the tool and conditions. Every action
cites the measurement that justifies it, and the plan states how the improvement will be measured.
A number nobody measured is not in the plan.

## extract — into the system

Only patterns used three or more times **with the same intent**; three things that look alike
for different reasons are not one component. List each instance with `file:line`, the variants
between them, the proposed shared token or component, and every call site that would migrate. A
pattern the system already has a component for is a migration, not an extraction.
