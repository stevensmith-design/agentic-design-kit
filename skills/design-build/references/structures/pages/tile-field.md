# `tile-field` — Tile field

## Shape

Mixed-size tiles on one grid: a few large tiles carry the main ideas, small ones carry detail.
Hierarchy comes from tile area, not from order down the page.

## Reach for it when

The product has four to eight parallel things of unequal weight; visitors scan rather than read;
each tile can stand alone.

## Avoid when

The content is a sequence or an argument; every tile would hold the same kind of thing (that is a
card grid); there are fewer than four ideas.

## Treatments

- **Section heads:** section heads sit inside the tiles, not above the field.
- **Body:** body is short, one idea per tile.
- **Dividers:** tiles separate by gap and value step, not by borders and shadows together.
- **Buttons:** buttons are typographic links inside tiles.
- **Images:** media fills a tile edge to edge or is absent.
- **Reveal:** tiles appear at once; no staggered entrance.

## Variation settings

- **tile-count:** 5 · 7 · 9
- **span-pattern:** one-dominant · two-co-dominant · stepped
- **accent-placement:** one-tile-flooded · corner-marks · none

Change at least one when this structure is used again (`check-distance.mjs`).

## Mobile

Collapse to one column in reading order of importance, not grid order; the dominant tile first.

## Sketch

```html
<main>
  <section class=field>            <!-- one grid -->
    <article class=tile--lg>…</article>
    <article class=tile>…</article> ×n
  </section>
</main>
```
