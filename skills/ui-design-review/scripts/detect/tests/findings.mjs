// Fixture suite for findings.mjs — the merge of the static and browser passes that /design-review
// reads. The runners are swapped for stubs (tests/findings/*.mjs) through two test-only
// environment variables, so every exit-code combination is exercised without a browser. One case
// runs the real detect.mjs to prove the static half is wired to the real engine.
// Exit 0 = all behaved, 1 = regression.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RUNNER = path.join(HERE, '..', 'findings.mjs');
const STUB = (n) => path.join(HERE, 'findings', `${n}.mjs`);
const PAGE = path.join(HERE, 'findings', 'page.html');
const CSS = path.join(HERE, 'flag', 'transition-all.css');
const G = '\x1b[0;32m', R = '\x1b[0;31m', B = '\x1b[1m', X = '\x1b[0m';

function run({ stat, brow, target = PAGE, json = true }) {
  const env = { ...process.env };
  if (stat) env.DETECT_STATIC_RUNNER = STUB(stat); else delete env.DETECT_STATIC_RUNNER;
  if (brow) env.DETECT_BROWSER_RUNNER = STUB(brow); else delete env.DETECT_BROWSER_RUNNER;
  const args = [RUNNER, ...(json ? ['--json'] : []), target];
  const r = spawnSync(process.execPath, args, { env, encoding: 'utf8' });
  let out = null;
  if (json) { try { out = JSON.parse(r.stdout); } catch { out = null; } }
  return { code: r.status, out, stdout: r.stdout, stderr: r.stderr };
}

const cases = [
  ['static findings survive a missing browser, under an UNVERIFIED banner',
    { stat: 'static-flag', brow: 'browser-none' }, (r) =>
      r.code === 1 && r.out?.findings.length === 1 && r.out.findings[0].pass === 'static'
      && r.out.browser.status === 'unverified' && /no Chromium/.test(r.out.browser.reason)
      && /^UNVERIFIED/.test(r.out.banner || '')],
  ['the banner quotes the cause once, not the runner’s own UNVERIFIED line',
    { stat: 'static-clean', brow: 'browser-none' }, (r) =>
      /no Chromium-based browser found/.test(r.out?.banner || '')
      && (r.out.banner.match(/UNVERIFIED/g) || []).length === 1],
  ['browser findings merge with a clean static pass, no banner',
    { stat: 'static-clean', brow: 'browser-flag' }, (r) =>
      r.code === 1 && r.out?.findings.length === 1 && r.out.findings[0].pass === 'browser'
      && r.out.banner === null && r.out.browser.status === 'ran'],
  ['both passes clean → exit 0',
    { stat: 'static-clean', brow: 'browser-clean' }, (r) =>
      r.code === 0 && r.out?.findings.length === 0 && r.out.banner === null],
  ['clean static + no browser is UNVERIFIED (exit 2), never clean',
    { stat: 'static-clean', brow: 'browser-none' }, (r) =>
      r.code === 2 && r.out?.static.status === 'ran' && /^UNVERIFIED/.test(r.out.banner || '')],
  ['a static pass that cannot scan does not hide browser findings',
    { stat: 'static-cannot', brow: 'browser-flag' }, (r) =>
      r.code === 1 && r.out?.static.status === 'unverified' && r.out.findings.length === 1
      && /static/.test(r.out.banner || '')],
  ['unreadable browser output is UNVERIFIED, not clean',
    { stat: 'static-flag', brow: 'browser-garbage' }, (r) =>
      r.code === 1 && r.out?.browser.status === 'unverified' && /^UNVERIFIED/.test(r.out.banner || '')],
  ['a stylesheet-only target skips the browser pass without a banner',
    { stat: 'static-flag', brow: 'browser-none', target: CSS }, (r) =>
      r.code === 1 && r.out?.browser.status === 'n/a' && r.out.banner === null],
  ['the static half runs the real detect.mjs',
    { brow: 'browser-none', target: CSS }, (r) =>
      r.code === 1 && r.out?.findings.some((f) => f.rule === 'transition-all' && f.pass === 'static')],
  ['text mode prints the banner first',
    { stat: 'static-flag', brow: 'browser-none', json: false }, (r) =>
      r.code === 1 && /^UNVERIFIED/.test(r.stdout) && /transition-all/.test(r.stdout)],
];

let pass = 0, fail = 0;
for (const [name, opts, ok] of cases) {
  const r = run(opts);
  if (ok(r)) { pass++; }
  else {
    fail++;
    console.log(`${R}✘${X} ${name}\n    exit ${r.code}; ${(r.stderr || '').trim().split('\n').slice(-2).join(' | ')}`);
    if (r.out) console.log(`    ${JSON.stringify({ static: r.out.static, browser: r.out.browser, banner: r.out.banner, n: r.out.findings?.length })}`);
  }
}
if (fail) { console.log(`${R}${B}✘ findings merge: ${fail} of ${pass + fail} case(s) regressed.${X}`); process.exit(1); }
console.log(`${G}✔ findings merge: ${pass}/${pass} cases behaved.${X}`);
