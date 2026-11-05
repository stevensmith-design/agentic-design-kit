# Redesign — changing an existing page or site

On demand: "redesign", "rework", "make this better" on something that exists.

## Non-destructive, always

List the files first. Change in place or beside; never delete a page, route, component folder or
asset without a file-level plan the person confirmed. Keep the old version reachable until the
person says otherwise.

## One page

**Keep:** the copy's intent, the information architecture, the brand, and the primary action.
**Replace:** the structural fingerprint (`variation.md` § Fingerprint — heading placement, body
composition, dividers, button voice, image treatment, reveal), the component voice, the rhythm.
A redesign that only recolours is a theme swap; say so if that is all the brief allows.

Name the direction source as for a new build. An existing approved system makes it system-led:
the fingerprint changes inside the system's range.

## Several pages

1. **Read every page first**, then pause and say what they share and where they diverge.
2. **Write the system before any page**: `/ui-design-system` Extract (from what exists) or
   Reconcile (with the direction). It records what every page **must share** — tokens, type roles,
   nav, footer, component voice, motion stance — and what each page **may vary** — section order,
   composition within a family, the hero.
3. **Redesign page by page against it.** Diversification **inverts**: the distance test checks that
   pages match the system (`distance: inverted`), not that they differ. Marketing pages may vary
   their structure within one family; product screens carry no enrichment.

Each page gets its own log entry; the first one after the system is written is `system: locked`.
