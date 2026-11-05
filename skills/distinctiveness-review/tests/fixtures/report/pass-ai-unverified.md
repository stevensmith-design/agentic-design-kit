<!-- expect: ok -->
## distinctiveness-review · index.html

UNVERIFIED — browser pass did not run (no Chromium-based browser found). Findings below come only from the pass that ran; its silence is not a clean result.
Direction source: brief — a booking tool for a ferry operator
Surfaces: index.html → Operate
AI product: yes
Machine evidence: static ran, 1 finding · browser unverified · scan.sh ran, 0 findings
- transition-all ×1 — style.css:3

### Judgement gates

| Gate | Verdict | Where | Reason |
| --- | --- | --- | --- |
| `alpha-gate` | CONFIRMED SLOP | index.html:10–40 | hero, three cards, call to action; the brief asked for a timetable first |
| `beta-gate` | JUSTIFIED | index.html:52 | the colour encodes sailing status (on time, delayed, cancelled), named in DESIGN.md |
| `gamma-gate` | NEEDS INTENT | index.html:80 | Was the override for the route map ratified before this page? Yes makes it JUSTIFIED; no makes it CONFIRMED SLOP. |
| `ai-delta` | NOT ASSESSABLE | — | the streamed state could not be reached without a live model |

### Sameness read

Nothing here belongs only to this brief; the page is the category default with a new name.
