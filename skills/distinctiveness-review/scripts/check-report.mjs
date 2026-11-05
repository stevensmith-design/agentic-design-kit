#!/usr/bin/env node
// check-report — does a distinctiveness-review report have the shape the lens promises?
//   node check-report.mjs [--gates gates.md] [--registry registry.tsv] <report.md>
// Checks: the header lines (Direction source, AI product, Machine evidence); every judgement gate
// has exactly one row (AI-product gates only when "AI product: yes"); no machine-owned rule is
// re-judged; each verdict is one of five and carries what it owes (a Where for findings, the job
// for JUSTIFIED, a question for NEEDS INTENT, a reason for NOT ASSESSABLE); a pass reported as
// unverified carries the UNVERIFIED banner; and the report names no theme or starter.
// It checks shape, not taste — a well-formed report can still be wrong.
// Exit: 0 well-formed · 1 problems · 2 unreadable.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i === -1 ? null : args[i + 1]; };
const gatesPath = opt('--gates') || path.join(HERE, '..', 'references', 'gates.md');
const regPath = opt('--registry') || path.join(HERE, '..', '..', 'ui-design-review', 'scripts', 'detect', 'registry.tsv');
const report = args.filter((a, i) => !a.startsWith('--') && !['--gates', '--registry'].includes(args[i - 1]))[0];
if (!report) { console.error('usage: check-report.mjs [--gates md] [--registry tsv] <report.md>'); process.exit(2); }

let text, gatesMd;
try { text = fs.readFileSync(report, 'utf8'); gatesMd = fs.readFileSync(gatesPath, 'utf8'); }
catch (e) { console.error(`check-report: ${e.message}`); process.exit(2); }
text = text.replace(/<!--[\s\S]*?-->/g, '');

const gates = [...gatesMd.split(/^## Report\b/m)[0].matchAll(/^\|\s*`([a-z0-9-]+)`\s*\|/gm)].map((m) => m[1]);
const aiGates = new Set(gates.filter((g) => g.startsWith('ai-')));
const machine = new Map();
try {
  let header = null;
  for (const line of fs.readFileSync(regPath, 'utf8').split('\n')) {
    if (!line.trim() || line.startsWith('#')) continue;
    const c = line.split('\t');
    if (!header) { header = c; continue; }
    const r = Object.fromEntries(header.map((h, i) => [h, c[i] ?? '']));
    if (r.owner && r.owner !== 'judgement') machine.set(r.id, r.owner);
  }
} catch { /* registry optional: the machine-owned check is skipped */ }

const problems = [];
const line = (re) => text.split('\n').find((l) => re.test(l.trim()));
if (!line(/^Direction source:\s*\S/)) problems.push('missing "Direction source:" line');
const aiLine = line(/^AI product:/);
const ai = aiLine ? /^AI product:\s*yes\b/i.test(aiLine.trim()) : null;
if (!aiLine || (ai === false && !/^AI product:\s*no\b/i.test(aiLine.trim()))) problems.push('missing "AI product: yes|no" line');
const ev = line(/^Machine evidence:/);
if (!ev) problems.push('missing "Machine evidence:" line');
else if (/unverified/i.test(ev) && !text.split('\n').some((l) => /^UNVERIFIED\b/.test(l.trim())))
  problems.push('a pass is unverified but the report carries no UNVERIFIED banner');

const section = text.split(/^###\s+Judgement gates\s*$/m)[1]?.split(/^###?\s/m)[0];
if (section == null) problems.push('missing "### Judgement gates" section');
const VERDICTS = ['CONFIRMED SLOP', 'JUSTIFIED', 'NEEDS INTENT', 'CLEAR', 'NOT ASSESSABLE'];
const NON_REASON = /\b(it(?:'s| is)? (?:consistent|systematic)|consistent across|looks? (?:considered|polished|designed|good|nice)|feels? designed|matches the rest)\b/i;
const empty = (s) => !s || /^[—–-]*$/.test(s.trim());
const seen = new Map();
for (const l of (section || '').split('\n')) {
  if (!l.trim().startsWith('|')) continue;
  const cells = l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  const id = cells[0].replace(/`/g, '');
  if (!id || /^gate$/i.test(id) || /^-+$/.test(id.replace(/\s/g, ''))) continue;
  const [, verdict = '', where = '', reason = ''] = cells;
  seen.set(id, (seen.get(id) || 0) + 1);
  if (machine.has(id)) { problems.push(`${id} is machine-owned (${machine.get(id)}): list it as evidence, do not re-judge it`); continue; }
  if (!gates.includes(id)) { problems.push(`${id} is not a judgement gate`); continue; }
  if (aiGates.has(id) && ai === false) problems.push(`${id}: AI product: no, so AI-product gates take no row`);
  if (!VERDICTS.includes(verdict)) { problems.push(`${id}: unknown verdict "${verdict}"`); continue; }
  if ((verdict === 'CONFIRMED SLOP' || verdict === 'NEEDS INTENT' || verdict === 'JUSTIFIED') && empty(where))
    problems.push(`${id}: ${verdict} needs a Where (file:line or rendered region)`);
  if (verdict === 'JUSTIFIED') {
    if (empty(reason) || reason.length < 12) problems.push(`${id}: JUSTIFIED needs the job the pattern does`);
    else if (NON_REASON.test(reason)) problems.push(`${id}: not a job — consistency or polish does not justify a pattern`);
  }
  if (verdict === 'NEEDS INTENT' && !reason.includes('?')) problems.push(`${id}: NEEDS INTENT needs a question for the person`);
  if (verdict === 'NOT ASSESSABLE' && empty(reason)) problems.push(`${id}: NOT ASSESSABLE needs the missing evidence named`);
}
for (const g of gates) {
  if (aiGates.has(g) && ai !== true) continue;
  const n = seen.get(g) || 0;
  if (n === 0) problems.push(`${g} has no row — a gate with no row was not run`);
  else if (n > 1) problems.push(`${g} has ${n} rows`);
}
// The route names are how a build says where its direction came from; they may be named. A starter
// or theme *name*, or talk of themes and starters as things to map to, may not.
const routeFree = text.replace(/\b(named-starter[ -]match|starter-led|starter-derived)\b/gi, '');
const NAMES = /\b(Quire|Tabulae|Inkspill|Placard|Nightwatch|Phosphene|Orrery|Kumquat|Waveguide|Gumball|Graticule|Velodrome|Espalier|Specimen|Atelier|Newsprint|Manifesto|Almanac|Riso|Cobalt|Aurora|Carnival|Lumen)\b/;
if (/\b(themes?|starters?)\b/i.test(routeFree) || NAMES.test(text))
  problems.push('the report names a theme or starter — this lens never maps a page to one');

if (problems.length) { for (const p of problems) console.log(`✘ ${p}`); process.exit(1); }
console.log(`✔ well-formed: ${seen.size} gate rows${ai ? ' (AI-product gates included)' : ''}.`);
