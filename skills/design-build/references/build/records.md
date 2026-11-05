# Records — the stamp and the build log

The evidence `/design-review`'s `build-repeat` gate reads, and the input to the distance test.
Both are written at the end of step 4 and checked by `scripts/check-records.mjs`. A record that
disagrees with the page is a finding of its own; so is a stamp carrying self-scores — a
self-assessment in the record reads as a review that did not happen.

## The log — `.design-build/log.jsonl`

One JSON object per build, appended, oldest first; never rewritten.

```json
{"date":"2026-10-14","route":"starter-led","direction":"starter: <name> | custom: <one line> | contract: <id> | system: DESIGN.md",
  "scope":"page","structure":"<structure id> | own:<label> | none","structure_settings":{"<setting>":"<value>"},
 "parts":{"hero":{"part":"<part id>","settings":{"<setting>":"<value>"}},"nav":{…},"footer":{…}},
  "axes":{"ground":"dark","display":"serif","accent":"orange"},
 "fingerprint":{"headings":"margin","body":"single-column","dividers":"hairline","buttons":"typographic","images":"none","reveal":"none"},
 "system":"open","enrichment":"type","distance":"applied","brief":"<one line>"}
```

- `route` — one of the eight route names, hyphenated (`named-starter-match`).
- `scope` — `page`, `component` or `redesign`. A component records `structure: "none"` and no parts.
- `structure` and part ids come from the structures index; a contract's or system's own vocabulary
  is written `own:<label>` — on system-led and contract-led work, every part is `own:`. Part slots:
  `hero`, `section-head`, `feature`, `cta`, `proof`, `nav`, `footer`; record only the slots the page
  has. Every library part records its variation settings; an `own:` part may. Part ids, setting
  names and values carry no spaces: hyphenate (`column-width=narrow`).
- `structure_settings` — the library structure's variation settings; omit for `own:` and `none`.
- `fingerprint` — the six structural treatments (`variation.md` § Fingerprint); required when
  distance is `applied`, welcome otherwise.
- `system` — `locked` once an approved `DESIGN.md` governs the pages; otherwise `open`.
- `enrichment` — `type`, `css`, `svg`, `supplied-media`, `generated` or `runtime` (`enrichment.md`).
- `distance` — `applied`, `suspended`, `inverted` or `n/a` (`variation.md`).

## The stamp — top of the stylesheet the page owns

The same facts, so a reader of the page finds them without the log. With shared CSS (a site
stylesheet) and a page stylesheet, the stamp goes in the page's own one:

```css
/* design-build stamp
   date: 2026-10-14
   route: starter-led
   direction: custom: <one line>
   scope: page
      structure: <structure id>
   structure.settings: <setting>=<value> <setting>=<value>

   part.hero: <part id> <setting>=<value> <setting>=<value>
   part.nav: <part id> <setting>=<value>
      axes: ground=dark display=serif accent=orange
   fingerprint: headings=margin body=single-column dividers=hairline buttons=typographic images=none reveal=none

   system: open
   enrichment: type
   distance: applied
*/
```

No scores, no gate results, no "reviewed". A studied or reference-led build names its contract,
never a source.
