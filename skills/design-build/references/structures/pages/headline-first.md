# `headline-first` — Headline first

## Shape

An oversized headline owns the first screen; everything else is subordinate and arrives after the
fold.

## Reach for it when

The product can be said in seven words or fewer and saying it is the point; the voice is confident.

## Avoid when

The headline needs a subhead to make sense; the product needs showing, not saying; the headline
would be a slogan.

## Treatments

- **Section heads:** section heads are much smaller than the headline, aligned to one edge.
- **Body:** body below the fold in two or three short blocks.
- **Dividers:** dividers are space; one rule under the headline at most.
- **Buttons:** one filled primary button, nothing beside it in the hero.
- **Images:** no hero media; type is the image.
- **Reveal:** headline is present at load; no letter-by-letter reveal.

## Variation settings

- **headline-scale:** fold-filling · two-thirds
- **alignment:** left · bottom-left · split-across-two-lines-with-indent

Change at least one when this structure is used again (`check-distance.mjs`).

## Mobile

The headline steps down one rung at 375px and must not hyphenate a word under five letters.

## Sketch

```html
<header class=hero>
  <h1 class=display>…</h1>
  <a class=button>…</a>
</header>
<main>…</main>
```
