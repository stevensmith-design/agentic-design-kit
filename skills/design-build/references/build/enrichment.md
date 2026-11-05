# Enrichment — does this page need imagery, and how much?

On demand. **Type only is the default.** Most pages that reach for an illustration, a gradient
blob or a 3D render are covering for a headline that has not been written yet.

## Does it need imagery at all?

| The brief is about… | Imagery |
| --- | --- |
| a physical product, a place, food, people's work | yes — the real thing, photographed or filmed, supplied by the person |
| software the visitor will use | the real interface, unframed, at real size — or nothing |
| a service, an idea, a stance, writing | usually none: type, space and one structural device carry it |
| data, a system, a process | a diagram that explains, drawn from the real data or steps |

If the answer is "yes" and the person has supplied nothing, ask for it, or leave an honest,
labelled placeholder of the right size. Never fill the slot with stock abstraction.

## The ladder — climb only as far as the job needs

1. **Type** — scale, weight, case, a typographic device.
2. **CSS drawing** — shapes, borders, gradients with a job, built from the system's tokens.
3. **Hand-built SVG** — an illustration or diagram drawn for this page; labelled or `aria-hidden`.
4. **Supplied media** — the person's photography, footage or screens.
5. **Generated image** — only with the person's approval of the direction and the result; never a
   stand-in for a real product, person or place.
6. **Animation runtime** — a canvas or animation library, last, and only when CSS and SVG cannot
   do the job.

Record the step reached as `enrichment` in the log (`type`, `css`, `svg`, `supplied-media`,
`generated`, `runtime`).

## Method notes per step

- **CSS drawing:** few elements, named custom properties for every colour and size, no magic
  numbers; it must survive 320px and a zoomed page.
- **SVG:** a `viewBox`, strokes on the system's scale, `currentColor` where it should follow the
  theme; declarative animation (CSS on SVG properties) before script; reduced-motion stops it.
- **Footage:** muted, a poster frame, no autoplay with sound, never the LCP element if it can be
  lazy; a clip can be cropped by the viewport edge instead of framed.
- **Screens:** the real interface at a readable size, no fake browser bar or device frame around
  it; annotate with callouts that sit outside the screenshot.
- **Background treatments:** at most one colour, under ~5 % of the viewport, static. An animated
  mesh or a radial glow behind the hero is a tell the lens will name.
