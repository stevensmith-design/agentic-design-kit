# Custom direction — originating a palette and type pairing

On demand: the starter-led route went custom, or a brief-originated custom direction needs values.
The output is a direction, not tokens: `/ui-design-system` Create turns it into `tokens.json` and
`DESIGN.md`. Every `rules.md` constraint still applies, and the slop lens judges the result.

## Palette — anchor first

1. **Anchor accent.** One hue, chosen from the brief (its subject, its materials, its scene), not
   from a list of safe colours. Say why in one line.
2. **Ground.** Pick the band from the scene sentence: dark, mid or light. Tint it toward the
   anchor hue — a ground with zero chroma reads as a default.
3. **Ink.** The primary text colour, tinted the same way; check AA on the ground before going on.
4. **Supporting neutrals.** Two or three steps between ground and ink for rules, secondary text and
   raised surfaces; same hue family, falling chroma.
5. **Focus.** A colour that stands out on every surface, not necessarily the accent.
6. **Accent ink.** The text colour used *on* the accent; check AA on it.
7. **Verify.** Every text / ground pair the page uses, measured, listed. The accent covers at most
   ~5 % of any viewport (the detector's `accent-footprint`). Dark mode keeps the hue; higher
   surfaces get lighter, not darker.

Author values in whatever format the system uses (OKLCH is easier to keep perceptually even; hex
is fine). No alpha inside named colour tokens; two-stop gradients only, and only with a job.

## Type — two plus one

A display face, a text face, and at most one outlier for a single job (labels, numerals, code) —
used in no more than two places. Mono counts as the outlier unless it carries the text. Choose the
display face for the brief's voice, not because it is fashionable; a platform default or the
current reflex face as the whole voice is a tell the lens will name. Heading weight sits at least
300 away from body weight, or the contrast comes from size and case instead. All-caps display
keeps leading at 1.0 or more. Sizes come from `rules.md` → *Typography* (headline brackets by
length, no more than five sizes a page). No italic display unless the brief asks for it.

## Then

Record the three axes the distance test reads: ground band, display voice, accent hue family
(`variation.md`). State palette and pairing in the preview before any code.
