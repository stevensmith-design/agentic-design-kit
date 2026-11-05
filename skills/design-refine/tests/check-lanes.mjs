#!/usr/bin/env node
// check-lanes — the two-lane contract of design-refine, checked on the files themselves.
//
//   node check-lanes.mjs --skill <skill-dir> [--rules <rules.md>]
//
// Fixture skills carry SKILL.fixture.md instead of SKILL.md: a packaged skill may hold exactly one
// SKILL.md (scripts/check-frontmatter.sh), so the checker reads whichever of the two exists.
//
// The review lane must never load edit instructions: not by naming an edit reference in the
// review-lane section, not through a review reference that points at one, and not through some
// other part of SKILL.md (a verb table) that a review run also reads. Every edit reference carries
// the lock precondition; the edit lane checks the lock before anything else; the lock section says
// the lock cannot be lifted from inside a run. Every named path exists, every reference file is
// named somewhere (no dead weight), and every `rules.md` → *Section* pointer resolves.
//
// Exit: 0 clean · 1 findings · 2 cannot read the skill.

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const skillDir = opt('--skill');
const rulesPath = opt('--rules');
const skillMd = ['SKILL.md', 'SKILL.fixture.md'].map((n) => path.join(skillDir || '', n)).find((p) => fs.existsSync(p));
if (!skillDir || !skillMd) {
  console.error('check-lanes: no SKILL.md (or SKILL.fixture.md) under --skill'); process.exit(2);
}

const findings = [];
const add = (m) => { if (!findings.includes(m)) findings.push(m); };
const read = (p) => fs.readFileSync(p, 'utf8');
const skill = read(skillMd);
const refRoot = path.join(skillDir, 'references');

function walk(d) {
  if (!fs.existsSync(d)) return [];
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.md') ? [path.join(d, e.name)] : []);
}
const refFiles = walk(refRoot).map((f) => path.relative(skillDir, f).split(path.sep).join('/')).sort();

// Sections of SKILL.md by "## " heading.
function sections(text) {
  const out = []; let cur = { title: '', start: 0, lines: [] };
  text.split('\n').forEach((l) => {
    if (/^## /.test(l)) { out.push(cur); cur = { title: l.slice(3).trim(), lines: [] }; }
    else cur.lines.push(l);
  });
  out.push(cur);
  return out.map((s) => ({ title: s.title, body: s.lines.join('\n') }));
}
const secs = sections(skill);
const sec = (re) => secs.find((s) => re.test(s.title));
const reviewLane = sec(/^Review lane/);
const editLane = sec(/^Edit lane/);
const lock = sec(/^Lock\b/);

// Paths this skill names as its own: "references/…md", not "<other-skill>/references/…md".
const OWN = /(?<![\w-]\/)references\/[\w./-]+?\.md/g;
const own = (t) => [...t.matchAll(OWN)].map((m) => m[0]);

// 1. Every own path named in SKILL.md exists.
for (const p of own(skill)) if (!fs.existsSync(path.join(skillDir, p))) add(`missing reference: ${p}`);

// 2. Edit references named outside the edit lane. Inside the review lane it is the worse case.
for (const s of secs) {
  if (s === editLane) continue;
  for (const p of own(s.body)) {
    if (!p.startsWith('references/edit/')) continue;
    add(s === reviewLane ? `review lane loads an edit reference: ${p}` : `edit reference named outside the edit lane: ${p}`);
  }
}

// 3. Review references must not lead into the edit lane, by any spelling of the path.
const named = new Set(own(skill));
for (const rel of refFiles) {
  const text = read(path.join(skillDir, rel));
  const dir = path.posix.dirname(rel);
  const rels = [...text.matchAll(/`((?:\.\.?\/)[\w./-]+?\.md)`/g)].map((m) => m[1]);
  for (const r of rels) {
    const target = path.posix.normalize(path.posix.join(dir, r));
    if (!fs.existsSync(path.join(skillDir, target))) add(`missing reference: ${target} (from ${rel})`);
    named.add(target);
    if (rel.startsWith('references/review/') && target.startsWith('references/edit/'))
      add(`review reference points at an edit reference: ${rel} → ${r}`);
  }
  for (const p of own(text)) {
    named.add(p);
    if (!fs.existsSync(path.join(skillDir, p))) add(`missing reference: ${p} (from ${rel})`);
    if (rel.startsWith('references/review/') && p.startsWith('references/edit/'))
      add(`review reference points at an edit reference: ${rel} → ${p}`);
  }
  // A bare sibling name (`apply.md`) inside the same folder counts as naming it.
  for (const m of text.matchAll(/`([\w-]+\.md)`/g)) {
    const sib = path.posix.join(dir, m[1]);
    if (refFiles.includes(sib)) {
      named.add(sib);
      if (rel.startsWith('references/review/') && sib.startsWith('references/edit/'))
        add(`review reference points at an edit reference: ${rel} → ${m[1]}`);
    }
  }
}

// 4. The edit lane checks the lock before anything else.
if (!editLane) add('no "## Edit lane" section');
else {
  const first = editLane.body.trim().split(/\n\s*\n/)[0] || '';
  if (!/\blocked\b/i.test(first)) add('edit lane does not check the lock first');
}

// 5. Every edit reference opens with the lock precondition.
for (const rel of refFiles.filter((r) => r.startsWith('references/edit/'))) {
  const head = read(path.join(skillDir, rel)).split('\n').slice(0, 6).join('\n');
  if (!head.includes('**Precondition: an unlocked run and an approved plan.**'))
    add(`edit reference lacks the lock precondition: ${rel}`);
}

// 6. The lock cannot be lifted from inside a run.
if (!lock || !lock.body.replace(/\s+/g, ' ').includes('cannot be lifted from inside the run'))
  add('the lock can be lifted from inside the run');

// 7. No dead weight: every reference file is named by SKILL.md or another reference.
for (const rel of refFiles) if (!named.has(rel)) add(`orphan reference: ${rel}`);

// 8. Every `rules.md` → *Section* pointer resolves to a ## or ### heading (prefix match, so
//    "Responsive and adaptive layout" finds "… (web)").
if (rulesPath) {
  const heads = read(rulesPath).split('\n').filter((l) => /^#{2,3} /.test(l)).map((l) => l.replace(/^#+ /, '').trim());
  const texts = [skill, ...refFiles.map((r) => read(path.join(skillDir, r)))];
  for (const t of texts) {
    const flat = t.replace(/\s+/g, ' ');
    for (const m of flat.matchAll(/rules\.md` → ((?:\*[^*]+\*(?:,| and| or|;)? ?)+)/g)) {
      for (const s of m[1].matchAll(/\*([^*]+)\*/g)) {
        const name = s[1].trim();
        if (!heads.some((h) => h === name || h.startsWith(name + ' ') || h.startsWith(name + ' —')))
          add(`unknown rules.md section: ${name}`);
      }
    }
  }
}

if (findings.length) {
  console.log(`check-lanes: ${findings.length} finding(s)`);
  for (const f of findings) console.log(`  ✘ ${f}`);
  process.exit(1);
}
console.log(`check-lanes: clean (${refFiles.length} references, rules ${rulesPath ? 'checked' : 'not checked'})`);
