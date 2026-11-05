#!/usr/bin/env node
// check-gates — the merged gate list stays one-to-one with the registry.
//   node check-gates.mjs --registry <registry.tsv> --gates <gates.md>
// Gates are the backticked first cells of table rows above "## Report" (the report template
// below it repeats ids as examples). Fails when: a judgement row has no gate in gates.md;
// gates.md names an id the registry lacks; gates.md adjudicates an id a machine owns (detect /
// browser / scan / tokens) — two owners give two answers; an id appears twice; or an origin gate (the upstream slop list, credited in NOTICE)
// number (H1–H57, H38a) has no registry row, which is how a gate silently drops out of the merge.
// Exit: 0 consistent · 1 inconsistent · 2 unreadable.

import fs from 'node:fs';

const arg = (k) => { const i = process.argv.indexOf(k); return i === -1 ? null : process.argv[i + 1]; };
const regPath = arg('--registry'), gatesPath = arg('--gates');
if (!regPath || !gatesPath) { console.error('usage: check-gates.mjs --registry <tsv> --gates <md>'); process.exit(2); }
let reg, md;
try { reg = fs.readFileSync(regPath, 'utf8'); md = fs.readFileSync(gatesPath, 'utf8'); }
catch (e) { console.error(`check-gates: ${e.message}`); process.exit(2); }

const rows = new Map();
const origins = new Set();
let header = null;
for (const line of reg.split('\n')) {
  if (!line.trim() || line.startsWith('#')) continue;
  const cols = line.split('\t');
  if (!header) { header = cols; continue; }
  const r = Object.fromEntries(header.map((h, i) => [h, cols[i] ?? '']));
  rows.set(r.id, r);
  for (const o of (r.origin || '').split(',')) origins.add(o.trim());
}

const ids = [...md.split(/^## Report\b/m)[0].matchAll(/^\|\s*`([a-z0-9-]+)`\s*\|/gm)].map((m) => m[1]);
const problems = [];
const count = new Map();
for (const id of ids) count.set(id, (count.get(id) || 0) + 1);
for (const [id, n] of count) {
  if (n > 1) problems.push(`${id} appears ${n} times in gates.md`);
  const r = rows.get(id);
  if (!r) problems.push(`${id} is not in the registry`);
  else if (r.owner !== 'judgement') problems.push(`${id} is owned by ${r.owner}; read it as evidence, do not adjudicate it`);
}
for (const [id, r] of rows) if (r.owner === 'judgement' && !count.has(id)) problems.push(`${id} has no row in gates.md`);
const originGates = [...Array.from({ length: 57 }, (_, i) => `H${i + 1}`), 'H38a'];
for (const h of originGates) if (!origins.has(h)) problems.push(`origin gate ${h} has no registry row`);

if (problems.length) { for (const p of problems) console.log(`✘ ${p}`); process.exit(1); }
console.log(`✔ ${count.size} judgement gates, one per registry row; ${originGates.length} origin gates owned.`);
