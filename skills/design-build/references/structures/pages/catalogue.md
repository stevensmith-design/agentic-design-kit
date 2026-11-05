# `catalogue` — Catalogue

## Shape

An inventory to browse: items with consistent anatomy, filters that matter, and a detail view one
step away.

## Reach for it when

There are many items of one kind and the visitor chooses between them.

## Avoid when

There are three items (that is a comparison); the items differ in kind.

## Treatments

- **Section heads:** section heads are filter groups or categories.
- **Body:** body is item anatomy: name, key fact, price if real.
- **Dividers:** dividers are row lines or grid gaps.
- **Buttons:** each item's action is the item itself.
- **Images:** item images consistent in ratio and crop.
- **Reveal:** no entrance animation.

## Variation settings

- **layout:** rows · grid · rows-with-expanding-detail
- **density:** compact · comfortable

Change at least one when this structure is used again (`check-distance.mjs`).

## Mobile

Filters move behind a disclosure; items go to one column.

## Sketch

```html
<main>
  <aside class=filters>…</aside>
  <ul class=items><li><a>…</a></li> ×n</ul>
</main>
```
