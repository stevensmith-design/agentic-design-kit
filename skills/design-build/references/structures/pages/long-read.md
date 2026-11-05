# `long-read` — Long read

## Shape

One argument read top to bottom in a single measured column, with marginal notes, figures and pull
lines breaking the column rather than new sections.

## Reach for it when

The product is understood by being explained; the audience reads; there is real writing to carry it.

## Avoid when

There is little copy; the visitor's job is to compare or act quickly; the copy is a list of features
in disguise.

## Treatments

- **Section heads:** section heads are part of the text flow, numbered or run-in.
- **Body:** body in one 60–70ch column.
- **Dividers:** dividers are space and the occasional hairline.
- **Buttons:** the CTA is a sentence with a link in it, repeated once at the end.
- **Images:** figures break out wider than the column.
- **Reveal:** no reveal; the text is simply there.

## Variation settings

- **margin-use:** notes · figures · numbers · none
- **break-out-width:** column+ · full-bleed

Change at least one when this structure is used again (`check-distance.mjs`).

## Mobile

The column already fits; marginal notes move inline after the paragraph they annotate.

## Sketch

```html
<main>
  <article class=read>
    <h1>…</h1><p class=standfirst>…</p>
    <p>…</p> <aside class=note>…</aside> <figure class=wide>…</figure>
  </article>
</main>
```
