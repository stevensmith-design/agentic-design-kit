# `sample-sheet` — Sample sheet

## Shape

The product's output shown as samples at real size — type, prints, sounds, results — with the
controls that made each one.

## Reach for it when

The product makes things whose quality is visible (fonts, paper, templates, generated output).

## Avoid when

The output cannot be shown honestly at page size; samples would be mock-ups.

## Treatments

- **Section heads:** section heads are sample labels.
- **Body:** body is specification beside each sample.
- **Dividers:** dividers are sample frames.
- **Buttons:** the CTA sits with the sample that sells it.
- **Images:** samples are the media.
- **Reveal:** samples present at load; interaction changes them in place.

## Variation settings

- **sample-size:** full-width · paired · grid-of-small
- **controls:** none · beside · under

Change at least one when this structure is used again (`check-distance.mjs`).

## Mobile

Samples fit the screen width; controls follow each sample.

## Sketch

```html
<main>
  <section class=sample><div class=specimen>…</div><dl class=spec>…</dl></section> ×n
</main>
```
