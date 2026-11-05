#!/usr/bin/env node
// detect — the kit's own static UI anti-pattern detector. Zero dependencies (Node ≥ 18).
//
//   node detect.mjs [--json] [--rules id,id] [--design tokens.json|DESIGN.md] [--list] <file-or-dir>...
//
// Scans .html (with its <style> blocks and local <link rel=stylesheet>) and .css files.
// JSX / TSX / Vue are scan.sh's job. Rules that need a rendered page live in the browser pass.
// The type ramp (font-size-outside-ramp) comes from --design, else the nearest tokens.json /
// DESIGN.md between a file's folder and the scan target it was found under.
// Exit: 0 clean · 1 findings · 2 cannot scan (bad args, nothing readable).
//
// Suppress with a comment naming the rule:  detect-ignore-next-line <rule>  (next line only)
//                                          detect-ignore <rule>            (whole file)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContext } from './lib/cascade.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

function loadRegistry() {
  const reg = {};
  const txt = fs.readFileSync(path.join(HERE, 'registry.tsv'), 'utf8');
  let header = null;
  for (const line of txt.split('\n')) {
    if (!line.trim() || line.startsWith('#')) continue;
    const cols = line.split('\t');
    if (!header) { header = cols; continue; }
    const row = Object.fromEntries(header.map((h, i) => [h, cols[i] ?? '']));
    reg[row.id] = row;
  }
  return reg;
}

async function loadRules() {
  const dir = path.join(HERE, 'rules');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mjs')).sort();
  const rules = [];
  for (const f of files) {
    const mod = await import(path.join(dir, f));
    for (const r of [].concat(mod.default)) rules.push(r);
  }
  return rules;
}

function collect(target, out, root) {
  if (!fs.existsSync(target)) return;
  const st = fs.statSync(target);
  if (root == null) root = st.isFile() ? path.dirname(target) : target;
  if (st.isFile()) { if (/\.(html?|css)$/i.test(target)) out.push({ file: target, root }); return; }
  for (const e of fs.readdirSync(target)) {
    if (e === 'node_modules' || e.startsWith('.')) continue;
    collect(path.join(target, e), out, root);
  }
}

function suppressions(src) {
  const file = new Set();
  const lines = new Map();
  src.split('\n').forEach((l, i) => {
    let m;
    const re = /detect-ignore(-next-line)?\s+([\w,\s-]+?)(?:-->|\*\/|$)/g;
    while ((m = re.exec(l))) {
      const ids = m[2].split(/[\s,]+/).filter(Boolean);
      if (m[1]) for (const id of ids) lines.set(`${i + 2}:${id}`, true);
      else for (const id of ids) file.add(id);
    }
  });
  return { file, lines };
}

async function main(argv) {
  const args = argv.slice(2);
  const json = args.includes('--json');
  const list = args.includes('--list');
  let only = null;
  const ri = args.indexOf('--rules');
  if (ri !== -1) only = new Set((args[ri + 1] || '').split(',').filter(Boolean));
  const di = args.indexOf('--design');
  const design = di !== -1 ? args[di + 1] : null;
  if (di !== -1 && (!design || !fs.existsSync(design))) { console.error(`detect: --design ${design || ''} not found`); return 2; }
  const targets = args.filter((a, i) => !a.startsWith('--') && !(ri !== -1 && i === ri + 1) && !(di !== -1 && i === di + 1));
  const registry = loadRegistry();
  const rules = await loadRules();

  for (const r of rules) {
    if (!registry[r.id]) { console.error(`detect: rule ${r.id} has no registry row`); return 2; }
    if (registry[r.id].owner !== 'detect') { console.error(`detect: rule ${r.id} is owned by ${registry[r.id].owner}, not detect`); return 2; }
  }
  if (list) {
    for (const r of rules) console.log(`${r.id}\t${registry[r.id].severity}\t${registry[r.id].family}`);
    return 0;
  }
  if (!targets.length) { console.error('usage: detect.mjs [--json] [--rules id,id] [--design tokens.json|DESIGN.md] <file-or-dir>...'); return 2; }

  const files = [];
  for (const t of targets) collect(t, files);
  if (!files.length) { console.error('detect: no .html or .css files found'); return 2; }

  const findings = [];
  const fileLines = new Map();
  const globalSeen = new Set(); // a linked stylesheet is also scanned on its own: report once
  for (const { file, root } of files) {
    let ctx;
    try { ctx = loadContext(file, { root, design }); } catch (e) { console.error(`detect: cannot read ${file}: ${e.message}`); return 2; }
    const sup = suppressions(ctx.src);
    for (const rule of rules) {
      if (only && !only.has(rule.id)) continue;
      if (rule.kinds && !rule.kinds.includes(ctx.kind)) continue;
      if (sup.file.has(rule.id)) continue;
      const seen = new Set();
      const report = (f) => {
        const line = f.line ?? f.el?.line ?? 1;
        const key = `${line}:${f.message || ''}`;
        if (seen.has(key)) return;
        seen.add(key);
        if (sup.lines.has(`${line}:${rule.id}`)) return;
        const file2 = path.relative(process.cwd(), path.resolve(f.file || file)) || f.file || file;
        const gk = `${rule.id}:${path.resolve(file2)}:${line}:${f.message || ''}`;
        if (globalSeen.has(gk)) return;
        globalSeen.add(gk);
        const linesOf = (fp) => { const k = path.resolve(fp); if (!fileLines.has(k)) { try { fileLines.set(k, fs.readFileSync(k, 'utf8').split('\n')); } catch { fileLines.set(k, []); } } return fileLines.get(k); };
        const snippet = (f.snippet ?? linesOf(f.file || file)[line - 1] ?? '').trim().slice(0, 160);
        findings.push({ rule: rule.id, severity: f.severity || registry[rule.id].severity,
          family: registry[rule.id].family, file: file2, line, snippet,
          message: f.message || rule.why, fix: rule.fix });
      };
      try { rule.run(ctx, report); } catch (e) { console.error(`detect: rule ${rule.id} crashed on ${file}: ${e.stack}`); return 2; }
    }
  }

  findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  if (json) {
    console.log(JSON.stringify({ files: files.length, findings }, null, 2));
  } else {
    for (const f of findings) {
      console.log(`${f.file}:${f.line}  [${f.severity}] ${f.rule} — ${f.message}`);
      if (f.snippet) console.log(`    ${f.snippet}`);
      if (f.fix) console.log(`    fix: ${f.fix}`);
    }
    console.log(findings.length ? `\n${findings.length} finding(s) in ${files.length} file(s).` : `clean: ${files.length} file(s).`);
  }
  return findings.length ? 1 : 0;
}

main(process.argv).then((code) => process.exit(code));
