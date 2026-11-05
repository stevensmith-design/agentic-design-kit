# `photograph-led` — Photograph led

## Shape

Large real photographs carry the page; type sits beside or under them, never stamped over a busy
area.

## Reach for it when

The person supplies strong photography of the real thing, place or people.

## Avoid when

There are no real photographs (stock defeats it); the product is software.

## Treatments

- **Section heads:** section heads small, set beside images.
- **Body:** body short, captions carry information.
- **Dividers:** dividers are the image edges.
- **Buttons:** the CTA is a quiet link under the strongest image.
- **Images:** photographs full-bleed or on a strict grid, never rounded thumbnails.
- **Reveal:** images are present at load; no parallax.

## Variation settings

- **image-rhythm:** one-per-screen · pairs · full-bleed-then-grid
- **caption-placement:** under · beside · overlaid-on-a-calm-area

Change at least one when this structure is used again (`check-distance.mjs`).

## Mobile

Images stay full width; captions follow the image they describe.

## Sketch

```html
<main>
  <figure class=bleed><img …><figcaption>…</figcaption></figure>
  <section>…</section>
</main>
```
