#!/usr/bin/env node
// check-paths — what design-build loads by default, and whether every path it names is real.
//
//   node check-paths.mjs --skill <skill-dir>
//
// Fixture skills carry SKILL.fixture.md (a package may hold one SKILL.md; check-frontmatter.sh).
//
// The structure library and the starter catalogue are high-bias inputs: in context, their shapes
// become the page. So the default path — SKILL.md outside its "## On demand" section, and every
// reference reachable from there — may name no file under references/structures/ and no file of
// the starter-directions skill. Invoking a skill by name is not loading its files; naming a path
// is. Then: every named path exists, no reference is dead weight, the structures index and its
// files agree one to one, every page structure carries its sections, every part its settings.
//
// Exit: 0 clean · 1 findings · 2 cannot read the skill.

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const dir = opt('--skill');
const skillMd = ['SKILL.md', 'SKILL.fixture.md'].map((n) => path.join(dir || '', n)).find((p) => fs.existsSync(p));
if (!dir || !skillMd) { console.error('check-paths: no SKILL.md (or SKILL.fixture.md) under --skill'); process.exit(2); }

const findings = [];
const add = (m) => { if (!findings.includes(m)) findings.push(m); };
const read = (p) => fs.readFileSync(path.join(dir, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(dir, p));
const skill = fs.readFileSync(skillMd, 'utf8');

function walk(d) {
  const abs = path.join(dir, d);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.posix.join(d, e.name)) : e.name.endsWith('.md') ? [path.posix.join(d, e.name)] : []);
}
const refFiles = walk('references').sort();
const STRUCT = 'references/structures/';
const STARTER = /starter-directions\/[\w./-]+\.md/g;

// Paths a text names, resolved against the file's folder.
function links(text, from) {
  const base = from ? path.posix.dirname(from) : '';
  const out = new Set();
  for (const m of text.matchAll(/(?<![\w-]\/)references\/[\w./-]+?\.md/g)) out.add(m[0]);
  for (const m of text.matchAll(/`(\.\.?\/[\w./-]+?\.md)`/g)) out.add(path.posix.normalize(path.posix.join(base, m[1])));
  if (from) for (const m of text.matchAll(/`([\w-]+\.md)`/g)) {
    const sib = path.posix.join(base, m[1]);
    if (refFiles.includes(sib)) out.add(sib);
  }
  return [...out];
}

// SKILL.md split at "## On demand".
const parts = skill.split(/^## On demand\b.*$/m);
const defaultText = parts[0] + (parts[1] ? (parts[1].split(/^## /m).slice(1).map((s) => '## ' + s).join('')) : '');

// 1. Default path, breadth first. Stop at a structures or starter file: reaching it is the finding.
const seen = new Set();
const queue = links(defaultText, null).map((p) => ({ p, via: null }));
for (const m of defaultText.matchAll(STARTER)) add(`default path loads a starter file: ${m[0]}`);
for (const m of defaultText.matchAll(/`((?:[\w.-]+\/)*structures\/[\w./-]+?\.md)`/g))
  if (!m[1].startsWith('references/')) add(`default path names a structures file: ${m[1]}`);
while (queue.length) {
  const { p, via } = queue.shift();
  if (seen.has(p)) continue; seen.add(p);
  if (p.startsWith(STRUCT)) { add(`default path loads a structures file: ${p}${via ? ` (via ${via})` : ''}`); continue; }
  if (!exists(p)) continue; // reported below as missing
  const text = read(p);
  for (const m of text.matchAll(STARTER)) add(`default path loads a starter file: ${m[0]} (via ${p})`);
  // A partial path that no link rule resolves still points the reader at the library.
  for (const m of text.matchAll(/`((?:[\w.-]+\/)*structures\/[\w./-]+?\.md)`/g))
    if (!links(text, p).some((q) => q.startsWith(STRUCT))) add(`default path names a structures file: ${m[1]} (via ${p})`);
  for (const q of links(text, p)) queue.push({ p: q, via: p });
}

// 2. Every named path exists; collect what is named.
const named = new Set();
for (const p of links(skill, null)) { named.add(p); if (!exists(p)) add(`missing reference: ${p}`); }
for (const r of refFiles) for (const p of links(read(r), r)) { named.add(p); if (!exists(p)) add(`missing reference: ${p} (from ${r})`); }

// 3. The structures index and its files, one to one.
const indexPath = STRUCT + 'index.md';
const indexed = new Set();
if (exists(indexPath)) {
  for (const l of read(indexPath).split('\n')) {
    const m = l.match(/^- `([a-z0-9-]+)`(?: \(([a-z-]+)\))? — (\S+\.md) — /);
    if (!m) continue;
    const [, id, family, rel] = m;
    const file = STRUCT + rel;
    indexed.add(file);
    if (!exists(file)) { add(`structures index names a missing file: ${rel}`); continue; }
    const text = read(file);
    if (!family) {
      for (const s of ['Shape', 'Reach for it when', 'Avoid when', 'Treatments', 'Variation settings', 'Mobile'])
        if (!new RegExp(`^## ${s}\\b`, 'm').test(text)) add(`page structure ${id} lacks section: ${s}`);
    } else {
      const at = text.search(new RegExp('^### `' + id + '`', 'm'));
      if (at < 0) { add(`part ${id} has no entry in ${rel}`); continue; }
      const block = text.slice(at).split(/\n(?=##+ )/)[0];
      if (!/^Settings: \S/m.test(block)) add(`part ${id} lists no settings`);
    }
  }
}
for (const r of refFiles) {
  if (r.startsWith(STRUCT + 'pages/') || r.startsWith(STRUCT + 'parts/')) {
    if (!indexed.has(r)) add(`not in the structures index: ${r.slice(STRUCT.length)}`);
  } else if (!named.has(r)) add(`orphan reference: ${r}`);
}

if (findings.length) {
  console.log(`check-paths: ${findings.length} finding(s)`);
  for (const f of findings) console.log(`  ✘ ${f}`);
  process.exit(1);
}
console.log(`check-paths: clean (${refFiles.length} references; default path: ${[...seen].length} file(s), no structures or starter file)`);
