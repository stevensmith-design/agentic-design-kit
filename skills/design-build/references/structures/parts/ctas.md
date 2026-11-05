# Calls to action

The primary action outside the hero. Text is verb + object and never wraps.

Each part lists its variation settings. A part used again changes at least one
(`check-distance.mjs`); under a locked system nav and footer are shared instead.

### `outlined-chip`

A compact outlined control beside a short line of text.

Settings: radius (system-small | system-full) · placement (inline | end-of-section)

Mobile: Stays inline; never wraps.

### `inline-form`

The action is the form itself: one field and a button in one row.

Settings: field (email | search | text) · button (filled | text)

Mobile: Field and button stack; equal heights kept.

### `text-link-cta`

A typographic link in a sentence, underlined with offset, no box.

Settings: arrow (none | trailing) · weight (regular | heavy)

Mobile: Unchanged.

### `sticky-action-bar`

A bar pinned to the bottom of the viewport carrying one action on long pages.

Settings: appears (after-the-hero | always) · content (action | action-and-price)

Mobile: Full width; respects the safe area; never covers focused fields.
