#!/usr/bin/env node
// check-report — the shape of a design-refine report, and the arithmetic of its scores.
//
//   node check-report.mjs <report.md>
//
// Review reports (evaluate, critique, audit, any verb's dry run): the read-only statement, the
// Lock / Isolation / Detector / Confidence lines, the DEGRADED and UNVERIFIED banners when they
// are owed, ten critique heuristics and five audit dimensions whose totals, percentages and bands
// add up (n/a and unassessed leave the maximum), file:line on every dry-run entry, known verdicts,
// and a locked run that applied nothing. Finish reviews: evidence before disposition.
// It checks shape and sums. It cannot tell whether a score is right.
//
// Exit: 0 clean · 1 findings · 2 cannot read the report.

import fs from 'node:fs';

const file = process.argv[2];
if (!file || !fs.existsSync(file)) { console.error('check-report: no report given'); process.exit(2); }
const text = fs.readFileSync(file, 'utf8').replace(/^<!--.*?-->\n/, '');
const lines = text.split('\n');
const findings = [];
const add = (m) => { if (!findings.includes(m)) findings.push(m); };
const line = (re) => lines.find((l) => re.test(l));

const HEURISTICS = 10;
const DIMENSIONS = ['Accessibility', 'Performance', 'Theming', 'Responsive', 'Implementation integrity'];
const VERDICTS = ['CONFIRMED SLOP', 'JUSTIFIED', 'NEEDS INTENT'];
const THEMES = /\b(Specimen|Atelier|Brutal|Newsprint|Manifesto|Midnight|Almanac|Riso|Bloom|Cobalt|Aurora|Carnival|Lumen)\b/;

// Too few scored rows and the percentage means nothing: five heuristics, three audit dimensions.
function band(total, max, scored, floor) {
  if (scored < floor) return 'not banded';
  const r = (100 * total) / max;
  return r >= 90 ? 'strong' : r >= 70 ? 'solid' : r >= 50 ? 'uneven' : r >= 30 ? 'weak' : 'failing';
}

// A scored table: heading "### <Name> — T/M (P%, band)", rows "| … | <score> | <note> |".
function scoredTable(name, floor, rowsOf) {
  const hi = lines.findIndex((l) => new RegExp(`^### ${name} — `).test(l));
  if (hi < 0) return null;
  const head = lines[hi].match(/— (\d+)\/(\d+) \((\d+)%, ([^)]+)\)/);
  const rows = [];
  for (let i = hi + 1; i < lines.length && !/^#{1,3} /.test(lines[i]); i++) {
    const cells = lines[i].split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 3 || /^-+$/.test(cells[0]) || /^(#|Dimension)$/.test(cells[0])) continue;
    rows.push(rowsOf(cells));
  }
  return { head, rows, floor, label: name.toLowerCase() };
}

function sums(t) {
  let total = 0, scored = 0, unassessed = 0, invalid = 0;
  for (const r of t.rows) {
    if (/^[0-4]$/.test(r.score)) { total += Number(r.score); scored++; continue; }
    if (r.score === 'n/a' || r.score === 'unassessed') {
      if (!r.note || r.note === '—' || r.note === '-') add(`${t.label} row ${r.id}: ${r.score} needs a reason`);
      if (r.score === 'unassessed') unassessed++;
      continue;
    }
    add(`${t.label} row ${r.id}: score must be 0–4, n/a or unassessed`); invalid++;
  }
  if (invalid) return { unassessed }; // the sum of an invalid table is meaningless; one finding, not two
  const max = 4 * scored;
  if (!t.head) { add(`${t.label} heading has no "T/M (P%, band)"`); return { unassessed }; }
  const [, T, M, P, B] = t.head;
  if (Number(T) !== total || Number(M) !== max)
    add(`${t.label} total does not add up: heading says ${T}/${M}, rows give ${total}/${max}`);
  else {
    const pct = max ? Math.round((100 * total) / max) : 0;
    if (Number(P) !== pct) add(`${t.label} percent is wrong: ${P}% for ${total}/${max} (expected ${pct}%)`);
    const want = band(total, max, scored, t.floor);
    if (B.trim() !== want) add(`${t.label} band is wrong: "${B.trim()}" for ${total}/${max} (expected "${want}")`);
  }
  return { unassessed };
}

const header = lines.find((l) => /^## /.test(l)) || '';
if (!/^## design-refine · /.test(header)) {
  add('not a design-refine report');
} else if (/· finish review ·/.test(header)) {
  // Finish review: evidence is validated before the work is judged.
  const ev = (line(/^Evidence: /) || '').match(/^Evidence: (valid|invalid)\b/);
  const di = (line(/^Disposition: /) || '').match(/^Disposition: (ship|fix|rebuild|recapture)\s*$/);
  if (!ev) add('missing the Evidence line');
  if (!di) add('missing or unknown Disposition');
  if (ev && di) {
    if (ev[1] === 'invalid' && di[1] !== 'recapture') add('invalid evidence must be recapture');
    if (ev[1] === 'valid' && di[1] === 'recapture') add('recapture with valid evidence');
    if (di[1] !== 'ship' && !lines.some((l) => /^- \S/.test(l))) add(`${di[1]} lists no items`);
  }
} else {
  if (!text.includes('**Read-only. No project files were modified.**')) add('missing the read-only statement');
  const lock = line(/^Lock: /);
  if (!lock || !/^Lock: read-only \((default|locked by .+)\)\s*$/.test(lock)) add('missing the Lock line');
  const iso = line(/^Isolation: /);
  const degraded = lines.some((l) => /^DEGRADED — /.test(l));
  if (!iso) add('missing the Isolation line');
  else if (/one context/.test(iso) && !degraded) add('one-context run without the DEGRADED banner');
  else if (/separate contexts/.test(iso) && degraded) add('DEGRADED banner contradicts the Isolation line');
  const det = line(/^Detector: /);
  if (!det) add('missing the Detector line');
  // A pass's status, not the word anywhere: "(no UNVERIFIED banner: both ran)" is not an unrun pass.
  else if (/\b(static|browser) unverified\b/i.test(det) && !lines.some((l) => /^UNVERIFIED — /.test(l)))
    add('unverified detector pass without the UNVERIFIED banner');
  const conf = (line(/^Confidence: /) || '').match(/^Confidence: (high|medium|low)\b/);
  if (!conf) add('missing the Confidence line');

  const critique = scoredTable('Critique', 5, (c) => ({ id: c[0], name: c[1], score: c[2], note: c[3] }));
  const audit = scoredTable('Audit', 3, (c) => ({ id: c[0], name: c[0], score: c[1], note: c[2] }));
  const dryRun = /^### Dry run — design-refine [\w-]+/m.test(text);
  if (!critique && !audit && !dryRun) add('no critique, audit or dry-run plan');

  let unassessed = 0;
  if (critique) {
    const ids = critique.rows.map((r) => Number(r.id));
    const ok = ids.length === HEURISTICS && ids.every((n, i) => n === i + 1);
    if (!ok) add(`critique must score all ten heuristics (found ${ids.length})`);
    unassessed += sums(critique).unassessed || 0;
  }
  if (audit) {
    const names = audit.rows.map((r) => r.name);
    for (const d of DIMENSIONS) if (!names.includes(d)) add(`audit is missing dimension: ${d}`);
    for (const n of names) if (!DIMENSIONS.includes(n)) add(`audit has unknown dimension: ${n}`);
    unassessed += sums(audit).unassessed || 0;
  }
  if (unassessed && conf && conf[1] === 'high') add('unassessed rows with high confidence');

  if (dryRun) {
    for (const l of lines.filter((x) => /^- \*\*Where:\*\*/.test(x)))
      if (!/[\w./-]+:\d+/.test(l)) add('dry-run entry without a file:line');
  }
  for (const l of lines) {
    const m = l.match(/^### \[([A-Z][A-Z ]+?)\]/);
    if (m && !VERDICTS.includes(m[1])) add(`unknown verdict: ${m[1]}`);
  }
  if (lock && /locked by/.test(lock)) {
    if (!/^Locked read-only by \S+: to apply, start a new \/design-refine run\./m.test(text))
      add('locked run without the closing lock line');
    if (/^#{2,5} (Applied|Changes made|Edits applied)\b/m.test(text)) add('a locked report records applied edits');
  }
}
// A theme name the report itself uses is the finding; the same word inside a quotation of the brief
// or the brand ("a printed manifesto") is the project's own vocabulary, not a catalogue mapping.
const unquoted = text.replace(/"[^"\n]*"|“[^”\n]*”/g, '""').split('\n').filter((l) => !/^\s*>/.test(l)).join('\n');
const theme = unquoted.match(THEMES);
if (theme) add(`names a catalogue theme: ${theme[1]}`);

if (findings.length) {
  console.log(`check-report: ${findings.length} finding(s) in ${file}`);
  for (const f of findings) console.log(`  ✘ ${f}`);
  process.exit(1);
}
console.log(`check-report: clean — ${file}`);
