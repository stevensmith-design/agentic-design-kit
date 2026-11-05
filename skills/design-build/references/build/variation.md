# Variation — distance between builds

Two builds from one brief, or two pages in a row from one agent, drift toward one page. The
distance test makes the difference a stated, checked thing. It is about builds whose direction you
originated; it never overrides a direction someone supplied.

## The three axes

| Axis | Values |
| --- | --- |
| **Ground band** | dark · mid · light |
| **Display voice** | serif · sans · slab · mono · condensed · rounded · decorative |
| **Accent hue family** | red · orange · yellow · green · teal · blue · violet · pink · neutral |

## The test, by mode

The log entry records the mode; `check-records.mjs` checks that it matches the route.

- **applied** — starter-led (a starter you picked, or custom), brief-originated and product-interface
  builds with an open system.
  Differ from the previous page build on **at least one** axis **and at least two** of the six
  fingerprint treatments (below) — the axes alone let a recolour pass; use no page structure from
  the last
  three page builds; a part used before changes **at least one** variation setting from its last
  use, and so does a structure used again four or more builds later (record its settings as
  `structure_settings`).
- **suspended** — approved-direction (a contract or a starter the person selected),
  reference-led, reference-directed and named-starter match. You follow the direction; nothing
  is compared.
- **inverted** — a locked system (system-led, a multi-page redesign once the system is written).
  The pages share the system: ground, display and accent **match** it, and nav and footer are the
  shared ones. Structure may repeat within a family; other parts still change a setting when they
  repeat. A difference here is drift, not variety. A shipped page with no log entry gives the test
  nothing to compare: say "no logged predecessor" rather than reading the clean result as a match.
- **n/a** — component builds.

## Stating the pick

Say it before code, in the preview: *"Previous build: long-read, light / serif / orange. This one:
tile-field, dark / serif / orange — differs on ground; hero split-pair is new."* First build in a
project: say so; there is nothing to differ from. A person who asks for the same structure again
gets it — change the part settings instead, and say which.

## Fingerprint — the six treatments

A page structure sets six treatments; a redesign replaces them; a build under applied distance
changes at least two. The log records them in these words:

| Treatment | Values |
| --- | --- |
| `headings` — section-heading placement | above · margin · hanging · run-in · pinned · inside-tiles · foot · none |
| `body` — body composition | single-column · two-column · split-panes · grid · tiles · list · table |
| `dividers` — how sections separate | space · hairline · value-step · material · flood |
| `buttons` — button voice | filled · outlined · typographic · pill · form |
| `images` — image treatment | none · full-bleed · contained · grid · drawn · screens · inline-figures |
| `reveal` — how content arrives | none · on-load · on-scroll · scroll-linked · interaction |

Observed (2026-10-14): a second build that changed display voice, accent, structure and every part
still read as a recoloured sibling, because heading placement, body composition and copy order were
unchanged. The treatments are what a reader sees as "the same page".
