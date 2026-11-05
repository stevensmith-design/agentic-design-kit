# `letter` — Letter

## Shape

A first-person note from a named person, set like correspondence: greeting, body, signature.

## Reach for it when

A founder or maker speaks for the product; the audience is small or warm.

## Avoid when

Nobody will sign it; the brand voice is institutional.

## Treatments

- **Section heads:** no section heads, or the date and greeting only.
- **Body:** body in one narrow column.
- **Dividers:** no dividers.
- **Buttons:** the CTA is a postscript.
- **Images:** one supplied photograph of the writer, or none.
- **Reveal:** no reveal.

## Variation settings

- **letterhead:** none · a-rule-and-a-name · a-full-masthead
- **signature:** typed · drawn-SVG

Change at least one when this structure is used again (`check-distance.mjs`).

## Mobile

Already narrow; margins shrink, the signature stays.

## Sketch

```html
<main>
  <article class=letter><p class=date>…</p><p>Dear …</p><p>…</p><p class=sig>…</p></article>
</main>
```
