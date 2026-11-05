// Fixture suite for the browser pass (detect/browser.mjs). Same contract as run.mjs:
//   tests/browser/flag/<rule>[--variant].html (or a folder) — MUST fire <rule> and NOTHING else
//   tests/browser/clean/<rule>[--variant].html (or a folder) — MUST produce zero findings
// Every browser rule needs both. One browser session runs the whole suite.
// Exit 0 = all behaved, 1 = regression, 2 = no browser (SKIPPED / UNVERIFIED — never a pass).

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BROWSER = path.join(HERE, '..', 'browser.mjs');
const ROOT = path.join(HERE, 'browser');
const G = '\x1b[0;32m', R = '\x1b[0;31m', Y = '\x1b[1;33m', B = '\x1b[1m', X = '\x1b[0m';

let res;
try {
  res = JSON.parse(execFileSync(process.execPath, [BROWSER, '--json', path.join(ROOT, 'flag'), path.join(ROOT, 'clean')],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 << 20 }));
} catch (e) {
  if (e.status === 1) res = JSON.parse(e.stdout);
  else {
    console.log(`${Y}– browser fixtures SKIPPED (UNVERIFIED, not a pass): ${(e.stderr || e.message).trim().split('\n')[0]}${X}`);
    process.exit(2);
  }
}

const ruleOf = (name) => name.replace(/\.html?$/, '').split('--')[0];
const byFixture = new Map();
for (const f of res.findings) {
  const rel = path.relative(ROOT, path.resolve(f.file)).split(path.sep);
  const key = `${rel[0]}/${rel[1]}`;
  if (!byFixture.has(key)) byFixture.set(key, []);
  byFixture.get(key).push(f);
}

let pass = 0, fail = 0;
const seen = { flag: new Set(), clean: new Set() };
for (const kind of ['flag', 'clean']) {
  for (const name of fs.readdirSync(path.join(ROOT, kind)).sort()) {
    const full = path.join(ROOT, kind, name);
    if (!/\.html?$/.test(name) && !fs.statSync(full).isDirectory()) continue;
    const id = ruleOf(name);
    seen[kind].add(id);
    const got = byFixture.get(`${kind}/${name}`) || [];
    let ok, why;
    if (kind === 'flag') {
      const ids = [...new Set(got.map((x) => x.rule))];
      ok = ids.length === 1 && ids[0] === id;
      why = ids.length ? `fired: ${ids.join(', ')}` : 'nothing fired';
    } else {
      ok = got.length === 0;
      why = got.map((x) => `${x.rule}@${x.line} ${x.message}`).join('; ');
    }
    if (ok) pass++; else { fail++; console.log(`${R}✘${X} browser/${kind}/${name} — ${why}`); }
  }
}

const list = execFileSync(process.execPath, [BROWSER, '--list'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean).map((l) => l.split('\t')[0]);
for (const id of list) for (const kind of ['flag', 'clean']) {
  if (!seen[kind].has(id)) { fail++; console.log(`${R}✘${X} browser rule ${id} has no ${kind} fixture`); }
}
for (const kind of ['flag', 'clean']) for (const id of seen[kind]) {
  if (!list.includes(id)) { fail++; console.log(`${R}✘${X} browser ${kind} fixture for unknown rule ${id}`); }
}

const total = pass + fail;
if (fail) { console.log(`${R}${B}✘ browser: ${fail} of ${total} checks failed.${X}`); process.exit(1); }
console.log(`${G}${B}✔ browser: ${pass}/${total} fixtures behaved (${list.length} rules, ${path.basename(res.browser || '')}).${X}`);
