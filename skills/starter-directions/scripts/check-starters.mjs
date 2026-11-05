#!/usr/bin/env node
// check-starters — every starter is complete, buildable and free of the catalogue's old faults.
//
//   node check-starters.mjs --skill <skill-dir> [--index <design-build structures/index.md>]
//
// --index defaults to ../design-build/references/structures/index.md beside this skill (ids only).
//
// Checks: the catalogue and the starter files agree one to one; each starter has every section;
// its axes use the build log's values (so the distance test can read a starter build); two to
// four signature moves; every structure or part it names exists in the library; no italic
// display; the accent is capped at 5 % of a viewport band (one number, the detector's); and no
// brand or market-tier "register" — a starter is described by what it does, not whom it imitates.
//
// Exit: 0 clean · 1 findings · 2 cannot read the skill.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const dir = opt('--skill');
if (!dir || !fs.existsSync(path.join(dir, 'references', 'catalogue.md'))) {
  console.error('check-starters: no references/catalogue.md under --skill'); process.exit(2);
}
const here = path.dirname(fileURLToPath(import.meta.url));
const defIndex = path.join(here, '..', '..', 'design-build', 'references', 'structures', 'index.md');
const indexPath = opt('--index') || (fs.existsSync(defIndex) ? defIndex : null);

import { AXES } from './axes.mjs';
const SECTIONS = ['Suits', 'Avoid', 'Axes', 'Surface and colour', 'Type roles', 'Composition',
  'Object family', 'Signature moves', 'Motion', 'Ambition', 'Limits'];
const REGISTER = /\b(premium|luxury|enterprise-grade|AI[- ]tool|SaaS look|startup look|in the style of|à la|Apple|Stripe|Linear|Vercel|Notion|Figma|Airbnb|Spotify)\b/i;

const findings = [];
const add = (m) => { if (!findings.includes(m)) findings.push(m); };
const ref = path.join(dir, 'references');
const ids = new Set();
if (indexPath) for (const l of fs.readFileSync(indexPath, 'utf8').split('\n')) {
  const m = l.match(/^- `([a-z0-9-]+)`/); if (m) ids.add(m[1]);
}

const listed = new Map();
for (const l of fs.readFileSync(path.join(ref, 'catalogue.md'), 'utf8').split('\n')) {
  const m = l.match(/^- `([a-z0-9-]+)` — (starters\/[\w-]+\.md) — /);
  if (m) listed.set(m[2], m[1]);
}
const files = fs.existsSync(path.join(ref, 'starters'))
  ? fs.readdirSync(path.join(ref, 'starters')).filter((f) => f.endsWith('.md')).map((f) => `starters/${f}`) : [];
for (const f of files) if (!listed.has(f)) add(`not in the catalogue: ${f}`);

const section = (text, name) => {
  const m = text.match(new RegExp(`^## ${name}\\s*\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`, 'm'));
  return m ? m[1] : null;
};

for (const [rel, id] of listed) {
  const p = path.join(ref, rel);
  if (!fs.existsSync(p)) { add(`catalogue names a missing file: ${rel}`); continue; }
  const t = fs.readFileSync(p, 'utf8');
  for (const s of SECTIONS) if (section(t, s) === null) add(`starter ${id} lacks section: ${s}`);
  const ax = (section(t, 'Axes') || '').match(/axes: ground=(\S+) display=(\S+) accent=(\S+)/);
  if (section(t, 'Axes') !== null) {
    if (!ax) add(`starter ${id}: no "axes: ground=… display=… accent=…" line`);
    else ['ground', 'display', 'accent'].forEach((k, i) => {
      if (!AXES[k].includes(ax[i + 1])) add(`starter ${id}: ${k} must be one of ${AXES[k].join(' | ')}, got "${ax[i + 1]}"`);
    });
  }
  const moves = section(t, 'Signature moves');
  if (moves !== null) {
    const n = (moves.match(/^\d+\. /gm) || []).length;
    if (n < 2 || n > 4) add(`starter ${id}: 2–4 signature moves, found ${n}`);
  }
  const comp = section(t, 'Composition');
  if (comp !== null && indexPath) for (const m of comp.matchAll(/`([a-z0-9-]+)`/g))
    if (!ids.has(m[1])) add(`starter ${id} names an unknown structure or part: ${m[1]}`);
  const type = (section(t, 'Type roles') || '').replace(/\s+/g, ' ');
  if (/italic/i.test(type.replace(/\bno italic[^.]*\./gi, ''))) add(`starter ${id} sets italic display`);
  const lim = section(t, 'Limits');
  if (lim !== null && !/5\s?%/.test(lim.replace(/\s+/g, ' '))) add(`starter ${id}: Limits does not cap the accent at 5 %`);
  if (REGISTER.test(t)) add(`starter ${id} borrows a brand register: "${t.match(REGISTER)[0]}"`);
}

if (findings.length) {
  console.log(`check-starters: ${findings.length} finding(s)`);
  for (const f of findings) console.log(`  ✘ ${f}`);
  process.exit(1);
}
console.log(`check-starters: clean (${listed.size} starters${indexPath ? ', library ids checked' : ''})`);
