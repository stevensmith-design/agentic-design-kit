# Component scope — one element, not a page

On demand: the brief is one component, fits in a sentence or two (about thirty words), or touches
one file.

## Keep

- The pre-flight scan, the direction source and the direction, stated in one line.
- The type rule (display + text + at most one outlier) and every token rule.
- The render and look, and the delegated review.

## Skip

- Page structure, parts, enrichment beyond what the component needs, and the distance test
  (`distance: n/a`). Log the build with `scope: component` and `structure: none`.

## The eight states

Every interactive component ships all of them, or says why one cannot occur: **default**,
**hover**, **focus-visible**, **active**, **disabled**, **loading**, **error**, **success**. Rules
for each are in `rules.md` → *Behaviour, states and recovery*.

## The state sheet

Alongside the component, a demo page that shows every state at once, side by side, without
interaction. Pair each pseudo-class with a class that forces it, and style both in one rule:

```css
.button:hover, .button.is-hover { … }
.button:focus-visible, .button.is-focus { … }
```

The sheet is how a reviewer sees eight states in one screenshot instead of hovering eight times.
Ship it next to the component (`<component>.states.html`), not inside the product.
