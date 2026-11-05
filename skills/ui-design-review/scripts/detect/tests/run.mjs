// Fixture suite for detect.mjs.
//   tests/flag/<rule>[--variant].(html|css)  — MUST fire <rule> and NOTHING else (isolation)
//   tests/clean/<rule>[--variant].(html|css) — MUST produce zero findings
//   A fixture may also be a directory tests/(flag|clean)/<rule>[--variant]/ — scanned as one
//   target, for rules that read a sibling file (the type ramp in tokens.json / DESIGN.md).
// Every rule module must have at least one flag and one clean fixture.
// Exit 0 = all behaved, 1 = regression.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DETECT = path.join(HERE, '..', 'detect.mjs');
const G = '\x1b[0;32m', R = '\x1b[0;31m', B = '\x1b[1m', X = '\x1b[0m';

function run(file) {
  try {
    const out = execFileSync(process.execPath, [DETECT, '--json', file], { encoding: 'utf8' });
    return JSON.parse(out);
  } catch (e) {
    if (e.status === 1) return JSON.parse(e.stdout);
    return { error: (e.stderr || e.message).trim() };
  }
}

let pass = 0, fail = 0;
const ruleOf = (f) => path.basename(f).replace(/\.(html|css)$/, '').split('--')[0];
const isFixture = (dir, f) => /\.(html|css)$/.test(f) || fs.statSync(path.join(dir, f)).isDirectory();
const seen = { flag: new Set(), clean: new Set() };

for (const kind of ['flag', 'clean']) {
  const dir = path.join(HERE, kind);
  for (const f of fs.readdirSync(dir).sort()) {
    if (!isFixture(dir, f)) continue;
    const id = ruleOf(f);
    seen[kind].add(id);
    const res = run(path.join(dir, f));
    let ok, why;
    if (res.error) { ok = false; why = res.error; }
    else if (kind === 'flag') {
      const ids = [...new Set(res.findings.map((x) => x.rule))];
      ok = ids.length === 1 && ids[0] === id;
      why = ids.length ? `fired: ${ids.join(', ')}` : 'nothing fired';
    } else {
      ok = res.findings.length === 0;
      why = res.findings.map((x) => `${x.rule}@${x.line}`).join(', ');
    }
    if (ok) pass++; else { fail++; console.log(`${R}✘${X} ${kind}/${f} — ${why}`); }
  }
}

// Coverage: every rule module needs both kinds of fixture.
const list = execFileSync(process.execPath, [DETECT, '--list'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean).map((l) => l.split('\t')[0]);
for (const id of list) {
  for (const kind of ['flag', 'clean']) {
    if (!seen[kind].has(id)) { fail++; console.log(`${R}✘${X} ${id} has no ${kind} fixture`); }
  }
}
// And no fixture for a rule that does not exist.
for (const kind of ['flag', 'clean']) for (const id of seen[kind]) {
  if (!list.includes(id)) { fail++; console.log(`${R}✘${X} ${kind} fixture for unknown rule ${id}`); }
}

const total = pass + fail;
if (fail) { console.log(`${R}${B}✘ detect: ${fail} of ${total} checks failed.${X}`); process.exit(1); }
console.log(`${G}${B}✔ detect: ${pass}/${total} fixtures behaved (${list.length} rules).${X}`);
