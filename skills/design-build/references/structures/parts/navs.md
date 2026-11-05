# Navigation

The top-level navigation. Three to five destinations (`ia-review`'s budget). Link text never wraps.

Each part lists its variation settings. A part used again changes at least one
(`check-distance.mjs`); under a locked system nav and footer are shared instead.

### `minimal-pair`

Wordmark and two links, nothing else.

Settings: alignment (split | all-left) · rule (none | hairline-under)

Mobile: Unchanged; it fits.

### `three-zone-bar`

Wordmark left, destinations centre, one action right.

Settings: centre-alignment (centred | left-after-wordmark) · action (filled | outlined)

Mobile: Destinations move behind a menu button; action stays.

### `detached-bar`

A bar that sits inside the page margin, detached from the top edge, and settles into a compact state
on scroll. One easing for every property; no layout properties animated; it never hides content
under it; reduced motion jumps to the end state.

Settings: shape (rounded | square) · scroll-state (compact | none) · surface (solid | tinted)

Mobile: Full width at the top; detached only above 768px.

### `side-rail`

A vertical rail of destinations on one side of the page.

Settings: side (left | right) · labels (text | text-and-numerals)

Mobile: Becomes a top bar with a menu.

### `command-entry`

Destinations reachable through a command field or shortcut, with a visible entry point.

Settings: entry (pill | icon-and-shortcut-hint) · results (list | grouped)

Mobile: The entry point stays visible; shortcut hint hidden on touch.

### `masthead`

A full-width name set large across the top, destinations in a line beneath.

Settings: name-scale (large | display) · line (rule-above | rule-below)

Mobile: Name steps down; destinations scroll in their own line or move to a menu.

### `slab-bar`

A heavy, flat-colour bar with large type for destinations.

Settings: colour (ink | accent) · height (tall | compact)

Mobile: Destinations move behind a menu; the slab stays.

### `command-line-bar`

Destinations written as a short prompt line in mono.

Settings: prompt (symbol | path) · cursor (none | static)

Mobile: Line truncates to the current location.

### `edge-aligned`

Wordmark and destinations pushed to opposite edges, no bar, no background.

Settings: edges (top-corners | top-and-side) · case (as-written | small-caps)

Mobile: Destinations move behind a menu.

### `mega-panel`

A top bar whose items open a panel of grouped links; for sites with many sections.

Settings: panel (columns | featured-plus-columns) · trigger (click | click-and-hover)

Mobile: Panels become nested disclosures.

### `retracting-banner`

A thin announcement line above the nav that retracts after the first scroll.

Settings: content (one-sentence | sentence-and-link) · retract (on-scroll | on-dismiss)

Mobile: The line wraps to two lines at most; dismiss stays reachable.
