---
name: starter-directions
description: "Opt-in catalogue of starter directions — ready-made art directions for when someone has no direction at all and hands the choice over, or names a starter. Offers two or three with reasons and waits, compares them, or tests a named starter against a supplied direction with a five-dimension match gate. Use when the person asks to see starting points or starter directions, says 'you decide what it looks like' with no brief detail, references or system, names a starter, or when design-build's starter-led or brief-derived route asks for starters. Not for work that already has references, an approved system or a selected direction."
metadata:
  version: 0.1.0
---

# starter-directions

Ready-made directions for people who have none. **A starter is scaffolding, not a default**: it is
offered only when there is no direction at all, or opened by name. Once loaded, a starter's
composition and palette become a strong prior, so this skill is kept out of every other path.

Use only design producers and orchestrators shipped with this kit. Do not load or invoke an
external design skill, including `frontend-design`. If one is already active, stop before offering
directions and report **`INVALID — EXTERNAL DESIGN SKILL ACTIVE`**.

## When this runs — and when it never does

Runs when:

- the person asks to see starter directions or starting points;
- `/design-build`'s **starter-led** route (sparse brief, no references, no system, direction handed
  over) or its **brief-originated** route (the person chose to see starters) invokes it;
- a starter is **named** — "use Orrery", "would Quire fit this?" (§ Named starter).

Never:

- on reference-led, reference-directed, approved-direction or system-led work, unless the
  person names a starter — and then only the match gate, for that one starter;
- to find the nearest starter to a supplied direction, a study, a contract or a screenshot;
- inside a study, a review or a review lens.

## Offer — no direction at all

1. **Ask what you must.** If the brief cannot say who it is for, what they do, and how it should
   feel (as an extreme), ask that in one bundled question. "You decide" means infer and say so.
2. **Read the catalogue** — [`references/catalogue.md`](references/catalogue.md), one line per
   starter — and recommend **two or three**, each with one sentence tying it to the brief. Then open
   only those files from `references/starters/` to describe them properly.
3. **Wait** for the person to choose, compare, or go custom. Do not build. If the person handed the
   choice back or cannot be reached, pick one, say which and why, and hand it back as *picked, not
   selected*: the build stays starter-led.
4. **Compare** on request: the chosen few side by side on the five dimensions of the match gate,
   plus the axes line (ground / display / accent), so the difference is concrete.

Going custom forfeits a starter's signature moves and ambition; say so, and hand back to
`/design-build` for a custom direction from the brief.

## Named starter

A starter named against a direction the person supplied is the **named-starter match** route. It
runs the gate in [`references/match-gate.md`](references/match-gate.md): five dimensions, four must
match, evidence for each, a stated boundary. A starter named with no other direction is simply a
choice: open its
file and hand it back.

## After a choice

The chosen starter becomes the **human-approved direction** for `/design-build`, which builds it as
approved-direction. Resemblance to the starter is then expected, not a defect. Hand back the
starter's file path only; the build opens it, and nothing else from the catalogue.

## What a starter is

Each file in `references/starters/` holds one direction in the same shape: what it suits and
avoids; the axes line the build log uses; surface and colour; type *roles* (never a font list);
a composition named in the structure library's ids — a suggestion: when a named structure's *Avoid
when* fits the brief, the build picks another and says so; its object family; two to four signature
moves; motion; ambition floor, target and ceiling; and its limits. Every starter caps the accent at
5 % of a viewport band, keeps display sizes inside `rules.md`'s headline brackets, uses no italic
display, and names no brand to imitate. `scripts/check-starters.mjs` checks all of it.
