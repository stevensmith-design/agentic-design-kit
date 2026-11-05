# `walkthrough` — Walkthrough

## Shape

The page follows the work in the order it happens: step one, then two, each with what the visitor
sees at that step.

## Reach for it when

The product is a process and the steps are real and few (three to six).

## Avoid when

The steps are invented to fill a pattern; the order does not matter.

## Treatments

- **Section heads:** each step's head carries its number.
- **Body:** body is what happens and what you see.
- **Dividers:** dividers are the step boundaries.
- **Buttons:** the CTA comes after the last step.
- **Images:** each step shows the real screen or output.
- **Reveal:** steps are present at load; no scroll-jacking.

## Variation settings

- **step-layout:** alternating · single-column · sticky-visual-with-changing-text
- **numbering:** large-numerals · small-labels

Change at least one when this structure is used again (`check-distance.mjs`).

## Mobile

Steps stack, visual under text; a sticky visual unpins.

## Sketch

```html
<main>
  <ol class=steps><li><h2>1 · …</h2><p>…</p><figure>…</figure></li> ×n</ol>
</main>
```
