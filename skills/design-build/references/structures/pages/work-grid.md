# `work-grid` — Work grid

## Shape

A grid of finished work, each piece at a size that does it justice, with a title and one fact.

## Reach for it when

The brand sells its past work (studios, makers, portfolios).

## Avoid when

There are fewer than six pieces; the pieces are not visual.

## Treatments

- **Section heads:** no section heads, or one per discipline.
- **Body:** body is title and one fact per piece.
- **Dividers:** dividers are gaps.
- **Buttons:** the CTA is 'get in touch' after the grid.
- **Images:** work images at their own ratio, or one ratio for all.
- **Reveal:** no hover zoom.

## Variation settings

- **grid:** even · masonry-by-ratio · one-large-then-even
- **caption:** under · on-hover-free-overlay

Change at least one when this structure is used again (`check-distance.mjs`).

## Mobile

Two columns at 768px, one at 375px; captions under.

## Sketch

```html
<main>
  <ul class=work><li><a><img …><span>title</span></a></li> ×n</ul>
</main>
```
