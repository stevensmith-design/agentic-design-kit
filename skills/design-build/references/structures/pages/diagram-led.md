# `diagram-led` — Diagram led

## Shape

A drawn diagram of the real system, place or process is the centre of the page; text annotates it.

## Reach for it when

The product is understood by its shape (a network, a route, an architecture, a supply chain).

## Avoid when

The diagram would be decorative; the shape is trivial.

## Treatments

- **Section heads:** section heads are diagram labels.
- **Body:** body is annotation tied to diagram parts.
- **Dividers:** dividers are the diagram's own lines.
- **Buttons:** the CTA follows the explanation.
- **Images:** the diagram is hand-built SVG from real data.
- **Reveal:** parts highlight on focus as well as hover.

## Variation settings

- **diagram-placement:** centre · full-bleed · sticky-beside-text
- **annotation:** callouts · numbered-key

Change at least one when this structure is used again (`check-distance.mjs`).

## Mobile

The diagram scrolls horizontally inside its own frame only if it must; otherwise it simplifies.

## Sketch

```html
<main>
  <figure class=diagram><svg role=img aria-labelledby=…>…</svg><figcaption>…</figcaption></figure>
  <ol class=key>…</ol>
</main>
```
