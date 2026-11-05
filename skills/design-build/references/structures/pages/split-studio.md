# `split-studio` — Split studio

## Shape

Two persistent panes: one stays (an image, a list, a statement) while the other scrolls through
content.

## Reach for it when

One thing stays relevant while the visitor reads many (a portfolio subject, a product image).

## Avoid when

Both panes would scroll; the fixed pane is decoration.

## Treatments

- **Section heads:** headings live in the scrolling pane.
- **Body:** body in the scrolling pane.
- **Dividers:** dividers are the pane edge.
- **Buttons:** the CTA is pinned in the fixed pane.
- **Images:** the fixed pane holds the media.
- **Reveal:** the fixed pane changes with the scroll position, quietly.

## Variation settings

- **split:** 50/50 · 40/60 · 33/67
- **fixed-side:** left · right

Change at least one when this structure is used again (`check-distance.mjs`).

## Mobile

Panes stack: the fixed content becomes the first section.

## Sketch

```html
<main class=split>
  <aside class=fixed>…</aside>
  <div class=scroll><section>…</section> ×n</div>
</main>
```
