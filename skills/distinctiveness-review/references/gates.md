# Judgement gates

The gates no script can decide. Each id matches a row with owner `judgement` in
`ui-design-review/scripts/detect/registry.tsv`, one to one (`tests/run.sh` enforces it). A row
owned by `detect`, `browser`, `scan` or `tokens` is machine evidence: read it, never re-judge it
here.

For study proofs, the dated human reference-intake answer authorizes the approved traits; no
production DESIGN file is required. Preserve mechanical detections as observations. Distinguish
Tier-2 aesthetic warnings justified by that answer from actual quality/accessibility defects;
do not turn a pattern's mere presence into a visual failure or its absence into clearance.

## Verdicts

| Verdict | Means |
| --- | --- |
| **CONFIRMED SLOP** | The pattern is present and nothing names its job. For a quality gate, read it as *confirmed defect*. |
| **JUSTIFIED** | The brief, the supplied direction, the design contract or the visitor's task names the job the pattern does, and it is used systematically. The reason states that job. |
| **NEEDS INTENT** | A reason exists but its standing cannot be settled from here: an undated override, a direction that reads two ways. The reason is one question, and says what each answer makes the verdict. |
| **CLEAR** | Checked; the pattern is absent, or the gate does not apply to this surface (say why). |
| **NOT ASSESSABLE** | The evidence the gate needs is missing (width not rendered, state not reached, no build record). The reason names what is missing. |

**The presumption is CONFIRMED SLOP.** A pattern is kept only when something names its job. These
are not jobs: "it is consistent", "it is systematic", "it looks considered", taste alone, and a
meaning the layout already carries by position. In a review, NEEDS INTENT goes to a person; it
never quietly becomes keep or remove.

## Sameness

| Gate | Look for | JUSTIFIED when |
| --- | --- | --- |
| `generic-page-shape` | the stock marketing sequence (hero, three features, call to action, footer), or any structure the brief did not ask for | the content really has that shape and the brief calls for it; say which content forces it |
| `build-repeat` | the same structure or the same component variation settings as a recent build in the project's build log (`.design-build/log.jsonl`; `check-distance.mjs` is the mechanical half), or a build record that disagrees with the page — the stamp says one structure, the page shows another. No log at all is NOT ASSESSABLE | the pages belong to one product and are meant to share a locked system |
| `category-reflex` | the first idea anyone would have for this product category — or a page whose only idea is avoiding that, which is its own cliché | the convention is load-bearing: the visitor needs to recognise it to act |
| `direction-drift` | a supplied direction (brief, references, approved system) diluted toward a generic default: its distinctive traits softened, swapped for safer ones, or kept only in the hero | a person approved the change; preference alone never justifies drift. A page older than the direction is NOT ASSESSABLE here |
| `costume` | on an Operate or Read surface, a borrowed world that reaches past type, palette, density and one signature move into layout or controls | the borrowed control is the product's real, working control |
| `centred-hero` | every hero element on one centred axis; a full-height centred hero carrying one line | the hero is a single task (search, sign-in) and the centred axis is that task |
| `identical-card-grid` | three or more equal cards, icon above heading, every point given the same weight | the items are genuinely parallel and the grid is how the visitor compares them |
| `hero-metric-layout` | a huge number with small supporting stats as the hero; a bare number as the whole headline | the number is the product's real, sourced claim and the visitor came for it |
| `default-nav-footer` | a wordmark-links-button nav and a four-column link footer that the content did not shape | the site's real link count and grouping have that shape |
| `single-font` | one family everywhere with no size or weight contrast | an Operate or Read surface, or the one family carries a clear size and weight hierarchy |

## Decoration without a job

| Gate | Look for | JUSTIFIED when |
| --- | --- | --- |
| `unearned-decoration` | ornament the page or its contract cannot name a job for | the job is named: encoded meaning, grouping, a trait the direction evidences |
| `decorative-background` | an abstract backdrop with more than one colour, more than about 5% of the view, or an animated mesh | the direction calls for atmosphere and the backdrop never competes with text |
| `rough-svg-illustration` | crude or shape-assembled illustration that makes the page look unfinished | roughness is the direction's voice and it is executed with care |
| `redrawn-chrome` | fake browser bars, phone frames or editor windows drawn around content | the device itself is the subject of the section |
| `lottie-for-simple` | an animation file where CSS or inline SVG would do the same | the motion is character animation that CSS cannot carry |
| `mixed-icon-sets` | icons from more than one library or drawing style on one page | a second set has its own role (brand marks beside interface icons) |
| `highlight-misplaced` | a highlighter band or decorative underline on words that carry no emphasis, or set off the text it marks | the marked words are the ones the sentence turns on |
| `uniform-hover` | one hover treatment (scale, lift, glow) on unrelated kinds of element | the elements share one affordance and the treatment says so |

## Honesty

| Gate | Look for | JUSTIFIED when |
| --- | --- | --- |
| `invented-evidence` | metrics, customers, testimonials, logos, prices or benchmarks the brief did not supply; synthetic demo data with no label | never: label it as a placeholder or get the real figure. A clearly labelled placeholder is CLEAR |

## Interaction and fit

Quality gates. Where the last column says *never*, the verdict is CONFIRMED SLOP or CLEAR.

| Gate | Look for | JUSTIFIED when |
| --- | --- | --- |
| `success-theatre` | a celebration for a change the screen already shows | the moment is a rare milestone the visitor worked for |
| `tooltip-timing` | a tooltip that waits as long on keyboard focus as on hover | never: focus shows it at once |
| `auto-advance` | content advanced by script with no pause or stop control | never without a pause control; with one, CLEAR |
| `radio-tab-jump` | radio-input tabs that make the page jump when one is chosen | never |
| `row-alignment` | mixed-height items in one row with no deliberate shared axis | the stagger is the composition and reads as intended |
| `input-geometry` | inputs and buttons of different heights in one row; focus shown by changing the border; a helper slot that collapses | never |
| `missing-states` | an interactive element whose focus is not visible (a browser default ring counts as visible), or a control that can be pressed or disabled and shows no state for it | never |
| `hero-fit` | hero content (headline, lede, primary action) that does not fit the first 1280×800 view | the first view still says what the page is and the opening is meant to be read through |
| `section-head-collapse` | a two-column section head that does not stack on a phone | never |

## AI products

Only when the product's core interaction is a model producing output or an agent acting for the
visitor; a product with AI somewhere inside it skips this section and the report says
`AI product: no`. When the brief does not say, decide from the product the page sells and give
the reason on that line. On a marketing page for such a product, judge what the page shows; a gate with
nothing on the page to judge is NOT ASSESSABLE, not CLEAR. The category converged on one template, and that convergence is the reason to
avoid it, not the licence to reuse it.

| Gate | Look for | JUSTIFIED when |
| --- | --- | --- |
| `ai-generated-marker` | the category's stock icon (sparkle, star, wand, orb) marking generated content or standing in as the brand mark; generated content not told apart from retrieved content at all | the marker is this product's own visual language, used consistently |
| `ai-chat-default` | a conversation column chosen because the product is AI | the task really is dialogue; name the task |
| `ai-prompt-hero` | a centred prompt box with a suggestion-chip row, or a glow under the input, as the page's whole identity. Test: hide the box — can you still tell what the product does? | the product is the input and the rest of the page earns its place |
| `ai-badge-decoration` | model-name or powered-by badges the visitor cannot act on | it is a control: the visitor can switch the model |
| `ai-undesigned-run` | agent steps as console text, typing dots, a spinner where real steps could be named, streamed output with no considered reveal | never |
| `ai-persona-voice` | anthropomorphic filler standing in for character | never |

## Report

```markdown
## distinctiveness-review · <target>

UNVERIFIED — …            ← copied verbatim from findings.mjs when a pass did not run; else omit
Direction source: <brief | supplied direction | approved system | none> — <one line>
Surfaces: <surface → Persuade | Operate | Read>
AI product: <yes | no>
Machine evidence: static <ran, N findings | unverified | n/a> · browser <…> · scan.sh <…>
- <rule> ×N — <file:line, …>        ← slop-type machine findings, listed, not re-judged

### Judgement gates

| Gate | Verdict | Where | Reason |
| --- | --- | --- | --- |
| `generic-page-shape` | CONFIRMED SLOP | index.html:14–212 | <what was seen; the brief line it ignores> |
| `centred-hero` | CLEAR | — | — |

### Sameness read

<Could this page be swapped for the default page of its category without anyone noticing? Name
the one thing that belongs only to this brief, or say there is none. No proposed look.>
```

Every gate gets a row, the AI-product gates only when `AI product: yes`. `Where` is a file and
line range or a rendered region; it may be `—` only for CLEAR. A fix, where one is offered, names
the defect and the brief or contract line it breaks — never a theme, starter, palette, structure
family or signature look. `scripts/check-report.mjs <report.md>` checks the shape.
