# Section heads

How each section announces itself. One section-head part per page; it is part of the fingerprint.

Each part lists its variation settings. A part used again changes at least one
(`check-distance.mjs`); under a locked system nav and footer are shared instead.

### `margin-label`

A short label — a key fact, a word, or a number only where the order itself carries meaning — in its
own margin column, the heading in the text column. The label is a grid column, not an eyebrow beside
the heading; a decorative 01 / 02 / 03 sequence is the generic marker `rules.md` warns about, not
this part.

Settings: label (fact | word | sequence-number) · column-width (narrow | wide)

Mobile: Below the collapse width the label stacks above the heading.

### `hanging-head`

The heading hangs out into the margin, left of the text edge.

Settings: overhang (small | full-margin) · weight (light | heavy)

Mobile: Overhang removed; heading aligns with text.

### `pinned-head`

The heading stays pinned while its section scrolls past.

Settings: pin-side (left-column | top) · release (at-section-end | never)

Mobile: Unpinned; heading sits above its section.

### `run-in-head`

The heading runs into the first sentence of the section, no break.

Settings: emphasis (weight | case | colour) · punctuation (full-stop | colon)

Mobile: Unchanged.

### `foot-anchored-head`

The heading sits at the bottom of the section, closing it rather than opening it.

Settings: rule (above | none) · size (same-as-body-+-one-rung | display)

Mobile: Moves above the section; a closing heading below 375px reads as a lost label.
