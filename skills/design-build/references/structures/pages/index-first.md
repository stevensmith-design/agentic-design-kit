# `index-first` — Index first

## Shape

The table of contents is the page: a dense, scannable index of everything, each entry linking to its
place.

## Reach for it when

The site is a body of content (docs, an archive, a studio's work) and finding is the job.

## Avoid when

There are fewer than a dozen entries; the visitor needs persuading first.

## Treatments

- **Section heads:** headings are index groups.
- **Body:** body is entry titles with one fact each.
- **Dividers:** dividers are hairlines, tabular alignment.
- **Buttons:** no CTA beyond the entries.
- **Images:** no media in the index.
- **Reveal:** no reveal.

## Variation settings

- **columns:** 1 · 2 · 3
- **entry-fact:** date · type · count

Change at least one when this structure is used again (`check-distance.mjs`).

## Mobile

Columns become one; groups become disclosures past twenty entries.

## Sketch

```html
<main>
  <h1>…</h1>
  <nav class=index><section><h2>…</h2><ul><li><a>…</a><span>…</span></li></ul></section></nav>
</main>
```
