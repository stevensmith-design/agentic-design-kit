<!-- expect: no critique, audit or dry-run plan -->
## design-refine · evaluate · landing/index.html

**Read-only. No project files were modified.**
Lock: read-only (default)
Isolation: separate contexts
Detector: static ran, 3 findings · browser ran, 1 finding
Confidence: medium — two widths rendered; no live data

### Synthesis
- Agreement: nav overflow · Detector-only: radial halo · Judgement-only: the modal has no back
  path · Detector false positives: none

### Findings
- **[P1] Nav overflows at 320px** — `index.html:22` · browser `content-overflow`

### Adjudicated flags

### [CONFIRMED SLOP] Radial glow behind the hero at styles.css:40
- **Flagged as:** detect `radial-halo`
- **Verdict:** no job named; both gates fail
- **Action:** remove

### Coverage and limits
- 375px and 1280px rendered; error states not reachable without the booking API.
