# Heroes

The first screen. Whatever the hero is, it fits 1280×800 with its primary action visible, and its
padding is heavier below than above (`rules.md` → *Typography*, hero fit).

Each part lists its variation settings. A part used again changes at least one
(`check-distance.mjs`); under a locked system nav and footer are shared instead.

### `headline-only`

Type alone: a headline sized by its length, one line of support, one action.

Settings: scale (fold-filling | two-thirds) · align (left | bottom-left | indented-second-line)

Mobile: Steps down one rung; the action stays visible without scrolling.

### `split-pair`

Two halves: words on one side, the real thing (product, photograph, sample) on the other.

Settings: ratio (50/50 | 60/40 | 40/60) · media-side (left | right) · media bleed (contained | to
the edge)

Mobile: Media goes under the words, not above.

### `quotation-hero`

A real attributed quotation as the headline.

Settings: scale (display | large) · attribution (under | beside)

Mobile: Quote steps down one rung; attribution stays attached.

### `evidence-figure`

A real sourced figure with its unit, context and source, and the headline under it.

Settings: figure-position (above | left | inline) · count (one | three)

Mobile: Figures stack; units never wrap from numbers.

### `letter-opening`

A greeting and the first paragraph of a signed note.

Settings: letterhead (none | rule-and-name) · width (narrow | text)

Mobile: Already narrow.

### `full-bleed-photo`

One supplied photograph across the whole first screen, type on its calmest area.

Settings: crop (tight | wide) · type-position (top-left | bottom-left | below-the-image)

Mobile: Type moves below the image when no calm area survives the crop.

### `edge-cropped-clip`

Real product footage cropped by the viewport edge rather than framed.

Settings: crop-edge (right | bottom) · loop (on | off-with-poster)

Mobile: Clip goes under the words; poster frame on reduced motion.

### `unframed-screenshot`

The real interface at readable size, no browser bar or device frame, with callouts outside it.

Settings: angle (flat | slight-overlap-of-the-fold) · callouts (none | two | three)

Mobile: Screenshot scales to width; callouts become a numbered list under it.

### `drawn-centrepiece`

One hand-built SVG drawing of the product's subject at the centre of the first screen.

Settings: placement (centre | right | behind-the-headline) · motion (static | one-slow-loop)

Mobile: Drawing shrinks above the words; motion stops on reduced motion.
