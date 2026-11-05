# Footers

The page's last block. Link text never wraps; it carries what the visitor might still need, not a
sitemap by reflex.

Each part lists its variation settings. A part used again changes at least one
(`check-distance.mjs`); under a locked system nav and footer are shared instead.

### `colophon-mast`

The name set large as a closing mast, a short colophon line under it.

Settings: name-scale (large | display) · colophon (one-line | two-lines)

Mobile: Name steps down.

### `single-line`

One line: name, two or three links, the year.

Settings: separator (dot | rule) · alignment (split | centred)

Mobile: Wraps to two lines at most.

### `category-index`

Grouped links under short headings, for sites with many pages.

Settings: columns (2 | 3 | 4) · headings (bold | small-caps)

Mobile: Columns become disclosures.

### `dense-type`

A tight block of small type carrying everything a visitor might look for, set like an imprint.

Settings: columns (1 | 2) · size (small | smaller)

Mobile: One column.

### `closing-statement`

One sentence that closes the page's argument, with one link.

Settings: scale (large | display) · link (inline | under)

Mobile: Steps down one rung.

### `letter-close`

A signature and a postscript, closing a letter-like page.

Settings: signature (typed | drawn) · postscript (link | none)

Mobile: Unchanged.

### `subscribe-first`

A sign-up field leads the footer; links follow in one line.

Settings: field (email | none) · lead-line (question | statement)

Mobile: Field and button stack.

### `running-ticker`

A slow horizontal line of text across the footer, with a pause control; static on reduced motion.

Settings: speed (slow | slower) · content (statement | list)

Mobile: Static and wrapping below 768px.
