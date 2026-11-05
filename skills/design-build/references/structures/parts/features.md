# Features

How a group of features, capabilities or offers is shown.

Each part lists its variation settings. A part used again changes at least one
(`check-distance.mjs`); under a locked system nav and footer are shared instead.

### `tile-cluster`

Unequal tiles in one grid; the most important feature gets the largest tile.

Settings: tiles (4 | 6 | 8) · emphasis (one-large | two-large)

Mobile: One column, largest first.

### `pinned-scroll-stack`

A visual pinned on one side while feature texts scroll past and change it.

Settings: visual-side (left | right) · change (cut | cross-fade)

Mobile: Each text gets its own visual under it; nothing pins.

### `spec-table`

Features as rows of a real table: name, what it does, a fact.

Settings: columns (2 | 3 | 4) · rule (hairline-rows | zebra-off)

Mobile: Table scrolls inside its frame, or rows become stacked definitions.

### `step-sequence`

Features as numbered steps in the order they are used.

Settings: steps (3 | 4 | 5) · numerals (large | small)

Mobile: Stacks in order.

### `annotated-capture`

One real screenshot with numbered callouts tying each feature to the place it lives.

Settings: callouts (3 | 5) · key (beside | under)

Mobile: Key goes under the image.

### `item-cards`

Consistent cards for items of one kind (plans, products, people), each card the link.

Settings: per-row (2 | 3 | 4) · image (none | top | left)

Mobile: One per row; whole card stays the link target.
