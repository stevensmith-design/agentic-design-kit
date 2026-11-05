# `feature-stack` — Feature stack

## Shape

Features stacked one per band, each with a claim, a short proof and a real visual.

## Reach for it when

There are three to six features that each need showing, and the visitor is comparing products.

## Avoid when

It would become the default hero → features → CTA page; the features are the same size of idea;
there are no real visuals.

## Treatments

- **Section heads:** feature heads are claims, not nouns.
- **Body:** body proves the claim in two sentences.
- **Dividers:** dividers alternate flat value steps, not boxed cards.
- **Buttons:** one CTA per stack, not per feature.
- **Images:** each feature shows the real interface.
- **Reveal:** no slide-in from the side.

## Variation settings

- **band-rhythm:** alternating-sides · all-left · escalating-size
- **visual-size:** half · two-thirds · full-bleed

Change at least one when this structure is used again (`check-distance.mjs`).

## Mobile

Visual follows the text in every band; no alternating on narrow screens.

## Sketch

```html
<main>
  <section class=feature><h2>claim</h2><p>proof</p><figure>…</figure></section> ×n
</main>
```
