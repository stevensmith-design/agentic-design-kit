# `evidence-led` — Evidence led

## Shape

A real, sourced figure leads, with its unit, its context and its source in the same block; the page
then explains how it was earned.

## Reach for it when

The brief supplies a measured result that matters to the visitor, with a source.

## Avoid when

There is no real number (never invent one); the number needs a paragraph to mean anything; the
figure is vanity (users, downloads).

## Treatments

- **Section heads:** section heads are short claims the next figure supports.
- **Body:** body is short, figures carry the weight.
- **Dividers:** dividers are hairlines between figure rows.
- **Buttons:** the CTA follows the strongest figure.
- **Images:** charts drawn from real data, or none.
- **Reveal:** numbers do not count up on scroll.

## Variation settings

- **figure-count:** one · a-strip-of-three
- **figure-placement:** left-column · above-the-headline · inline-in-the-headline

Change at least one when this structure is used again (`check-distance.mjs`).

## Mobile

Figures stack; units never wrap away from their numbers.

## Sketch

```html
<header class=hero>
  <p class=figure><data value=…>…</data><span class=unit>…</span></p>
  <h1>…</h1><p class=source>…</p>
</header>
```
