# `playground` — Playground

## Shape

Components shown live in all their states, with controls to change them, for people who will build
with them.

## Reach for it when

The product is a component library, a design system or an embeddable widget.

## Avoid when

The audience is not building anything.

## Treatments

- **Section heads:** section heads are component names.
- **Body:** body is usage and props.
- **Dividers:** dividers are stage frames.
- **Buttons:** the CTA is install or copy.
- **Images:** the stage is the media.
- **Reveal:** state changes in place, instantly.

## Variation settings

- **stage:** single · grid-of-states
- **controls:** beside · under · none

Change at least one when this structure is used again (`check-distance.mjs`).

## Mobile

Controls move under the stage; the stage keeps its own scroll.

## Sketch

```html
<main>
  <section class=component><h2>…</h2><div class=stage>…</div><form class=controls>…</form></section> ×n
</main>
```
