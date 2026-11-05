# `question-led` — Question led

## Shape

The page is the visitor's questions, asked in their words and answered in order of how often they
are asked.

## Reach for it when

The product is bought after doubt is resolved; real questions exist (support, sales calls).

## Avoid when

The questions would be invented; the answers are one word; the content is a sales pitch phrased as
questions.

## Treatments

- **Section heads:** questions are the section heads, in the visitor's voice.
- **Body:** answers are short paragraphs, sometimes a table.
- **Dividers:** dividers are hairlines between questions.
- **Buttons:** the CTA closes the answer it belongs to.
- **Images:** media only where an answer needs showing.
- **Reveal:** answers are open by default; disclosure only past ten questions.

## Variation settings

- **grouping:** none · by-stage · by-audience
- **question-style:** full-sentence · short-phrase

Change at least one when this structure is used again (`check-distance.mjs`).

## Mobile

Questions stay full width; long answers get a 'back to questions' link.

## Sketch

```html
<main>
  <h1>…</h1>
  <section><h2>question?</h2><p>answer</p></section> ×n
</main>
```
