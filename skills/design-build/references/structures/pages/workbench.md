# `workbench` — Workbench

## Shape

The product's working surface is the page: the visitor uses the thing (an input, a live output)
instead of reading about it.

## Reach for it when

The product can do something useful in the browser in under a minute with no account.

## Avoid when

The product cannot run in the page; a fake demo would be needed (never fake one); the visitor needs
persuading first.

## Treatments

- **Section heads:** one short heading above the bench, the rest in the tool's own labels.
- **Body:** body is the tool's output.
- **Dividers:** dividers are panel edges.
- **Buttons:** the CTA appears after the first successful use.
- **Images:** no decorative media.
- **Reveal:** no reveal; the bench is ready at load.

## Variation settings

- **bench-layout:** input-left-output-right · stacked · single-field
- **starting-state:** empty-with-an-example-button · pre-filled-with-real-sample

Change at least one when this structure is used again (`check-distance.mjs`).

## Mobile

Panels stack input-first; output scrolls into view after a run.

## Sketch

```html
<main>
  <h1>…</h1>
  <section class=bench><form>…</form><output>…</output></section>
  <section>…what happened, how…</section>
</main>
```
