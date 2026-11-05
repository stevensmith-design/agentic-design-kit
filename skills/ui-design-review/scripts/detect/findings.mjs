#!/usr/bin/env node
// findings — one report from both halves of the detector. Runs detect.mjs (static) always and
// browser.mjs (rendered) when the target has a page to render, then merges their findings.
// This is what /design-review and every review lens read as machine evidence.
//
//   node findings.mjs [--json] [--design tokens.json|DESIGN.md] [--widths 320,768,...] <file-dir-or-url>...
//
// A missing browser never blocks the static half: its findings are reported under an
// UNVERIFIED banner instead. Each finding carries `pass: "static" | "browser"`.
// Exit: 1 = findings (from either pass) · 0 = both passes ran and found nothing ·
//       2 = no findings, but at least one pass could not run — UNVERIFIED, never clean.
// (DETECT_STATIC_RUNNER / DETECT_BROWSER_RUNNER swap the runners for the fixture suite only.)

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const STATIC = process.env.DETECT_STATIC_RUNNER || path.join(HERE, 'detect.mjs');
const BROWSER = process.env.DETECT_BROWSER_RUNNER || path.join(HERE, 'browser.mjs');

function hasPage(target) {
  if (/^(https?|file):/.test(target)) return true;
  if (!fs.existsSync(target)) return false;
  const st = fs.statSync(target);
  if (st.isFile()) return /\.html?$/i.test(target);
  for (const e of fs.readdirSync(target)) {
    if (e === 'node_modules' || e.startsWith('.')) continue;
    if (hasPage(path.join(target, e))) return true;
  }
  return false;
}

// The cause is the runner's first stderr line; its own trailing "UNVERIFIED — …" line is dropped
// (the banner says that once). Long finder lists are cut, not dumped into the banner.
function cause(s) {
  const first = (s || '').trim().split('\n').map((l) => l.trim()).find((l) => l && !/^UNVERIFIED\b/.test(l)) || '';
  const c = first.replace(/^(browser|detect):\s*/, '').replace(/\s*(looked in|tried):?\s*$/i, '');
  return c.length > 140 ? c.slice(0, 137).replace(/[\s,(]+\S*$/, '') + '…' : c;
}

function runPass(name, script, args) {
  const r = spawnSync(process.execPath, [script, '--json', ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status === 2 || r.status == null) {
    return { status: 'unverified', exit: r.status ?? 2, reason: cause(r.stderr) || `${name} pass did not run`, findings: [] };
  }
  let data;
  try { data = JSON.parse(r.stdout); } catch {
    return { status: 'unverified', exit: r.status, reason: `${name} pass returned unreadable output`, findings: [] };
  }
  const findings = (data.findings || []).map((f) => ({ ...f, pass: name }));
  const out = { status: 'ran', exit: r.status, files: data.files ?? null, findings };
  if (data.browser) out.browser = data.browser;
  return out;
}

function main(argv) {
  const args = argv.slice(2);
  const json = args.includes('--json');
  const valued = new Set(['--design', '--widths']);
  const passThrough = { static: [], browser: [] };
  const targets = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--json') continue;
    if (valued.has(a)) {
      const v = args[++i];
      if (v == null) { console.error(`findings: ${a} needs a value`); return 2; }
      passThrough.browser.push(a, v);
      if (a === '--design') passThrough.static.push(a, v);
      continue;
    }
    if (a.startsWith('--')) { console.error(`findings: unknown option ${a}`); return 2; }
    targets.push(a);
  }
  if (!targets.length) { console.error('usage: findings.mjs [--json] [--design path] [--widths 320,768] <file-dir-or-url>...'); return 2; }

  const fileTargets = targets.filter((t) => !/^(https?|file):/.test(t));
  const stat = fileTargets.length
    ? runPass('static', STATIC, [...passThrough.static, ...fileTargets])
    : { status: 'n/a', exit: null, reason: 'URL targets only — the static pass reads files', findings: [] };
  const brow = targets.some(hasPage)
    ? runPass('browser', BROWSER, [...passThrough.browser, ...targets])
    : { status: 'n/a', exit: null, reason: 'no page to render (stylesheets only)', findings: [] };

  const unverified = [['static', stat], ['browser', brow]].filter(([, p]) => p.status === 'unverified');
  const banner = unverified.length
    ? `UNVERIFIED — ${unverified.map(([n, p]) => `${n} pass did not run (${p.reason})`).join('; ')}. `
      + 'Findings below come only from the pass that ran; its silence is not a clean result.'
    : null;

  const findings = [...stat.findings, ...brow.findings]
    .sort((a, b) => String(a.file).localeCompare(String(b.file)) || (a.line ?? 0) - (b.line ?? 0));
  const strip = ({ findings: _f, ...rest }) => rest;
  const report = { targets, banner, static: strip(stat), browser: strip(brow), findings };

  if (json) console.log(JSON.stringify(report, null, 2));
  else {
    if (banner) console.log(banner + '\n');
    for (const f of findings) {
      console.log(`${f.file}:${f.line}  [${f.severity}] ${f.rule} (${f.pass}) — ${f.message}`);
      if (f.selector) console.log(`    at ${f.selector}`);
      if (f.snippet) console.log(`    ${f.snippet}`);
    }
    const s = (n, p) => `${n}: ${p.status}${p.status === 'ran' ? ` (${p.files ?? '?'} file(s))` : ''}`;
    console.log(`${findings.length} finding(s) · ${s('static', stat)} · ${s('browser', brow)}`);
  }
  if (findings.length) return 1;
  return unverified.length ? 2 : 0;
}

process.exit(main(process.argv));
