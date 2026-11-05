# Visual brand and design guidelines

Use when the person asks to create a visual brand guideline, style guide or reusable design
rules. This is agent-led authorship, not an automatic brand extractor. Match the requested scope;
a visual guide does not imply that naming, strategy, logo design or a legal identity check ran.

## Establish the source

Read the brief, audience, existing brand files, selected direction and actual references. Preserve
approved identity and system decisions. Ask only for missing information that materially changes
the result. Explicitly delegated design choices may be made within that scope; record important
assumptions as proposed choices rather than claiming the person approved each one.

If visual direction is unresolved and comparing alternatives would help, use direction-study and
return after selection. Do not impose a starter or a fixed number of options on an existing brand.
When extracting guidance from shipped work, inspect representative screens and use Extract mode
for implementation evidence instead of inventing a coherent history.

## Author the requested guide

Use BRAND.md or the person's requested format. Make it useful to the next designer:

- Intent, audience, character and provenance; distinguish approved decisions from proposals.
- Colour roles and usable text/ground pairings, including semantic states and theme limits.
- Typography roles, hierarchy, readable measure and fallback behaviour.
- Image/illustration treatment, composition and signature devices grounded in this brand.
- Component, spacing, shape and motion principles where relevant to the requested surfaces.
- Content/voice guidance only within the brief; record logo/asset usage only for available assets.
- Application examples from this project, showing the principles in context and explaining limits.

These are coverage prompts, not a mandatory full manual for a small assignment. Resolve visual
choices from the project; do not fill gaps with the kit's stock palette, radius or type defaults.
Review representative rendered applications: a plausible written guide may still fail in use.

## Connect guidance to an implementation system

If the task includes a system, use Create or Extract for the four-layer DESIGN.md, tokens.json
and component rules. Link BRAND.md to those artifacts: the brand records intent and use; DESIGN.md
and tokens record implementation. Keep values in one canonical location and link rather than
maintaining contradictory copies. Validate the final token graph, inspect representative renders,
and report exact failures, warnings and unassessed areas.

Optionally author brand.json against brand-to-system/schema/brand.schema.json when the approved
brand genuinely fits that deriver's light-ground, action-hue and tinted-neutral model. Confirm
compatibility before derivation. Dark, multi-accent or other separation strategies use Create;
never alter the brand merely to fit the derivation tool. Automated CSS-to-brand extraction remains
unimplemented. The brand file is authored by the agent from evidence, not inferred by a script.

## Apply it to future work

Hand off the approved guide, DESIGN.md, tokens, component references and original design sources.
Future builds consume these before choosing new values. Prefer existing components; use Drift and
Coherence modes to compare implementation against the system and assess whether it still works.
Review requests stay read-only. A request to create guidelines authorizes those deliverables;
changing an existing approved identity or shared system requires the applicable project authority.
