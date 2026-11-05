#!/usr/bin/env node
// check-records — is the build log well formed, and does the stamp tell the truth?
//
//   node check-records.mjs --log .design-build/log.jsonl --stamp <stylesheet> [--index <index.md>] [--entry <line>]
//
// --index defaults to this skill's references/structures/index.md (ids only).
//
// The log and the stamp are the evidence distinctiveness-review's `build-repeat` gate reads. A
// malformed log hides a repeat; a stamp that disagrees with the log ("the stamp lies") makes the
// gate judge a page that is not there. A stamp carries no self-scores: a self-assessment written
// into the record reads as a review that did not happen.
//
// Exit: 0 clean · 1 findings · 2 cannot read the inputs.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readLog, readIndex, validateEntry, readStamp, sameSettings } from './records-lib.mjs';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const logPath = opt('--log'); const stampPath = opt('--stamp');
// Default: this skill's own library index — ids only; the structure files are never read.
const ownIndex = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'references', 'structures', 'index.md');
const indexPath = opt('--index') || (fs.existsSync(ownIndex) ? ownIndex : null);
if (!logPath || !fs.existsSync(logPath)) { console.error('check-records: --log <log.jsonl> is required'); process.exit(2); }

const findings = [];
const lib = indexPath ? readIndex(indexPath) : null;
const { entries, errors } = readLog(logPath);
findings.push(...errors);
let last = null; let lastValid = false;
for (const { line, entry } of entries) {
  const f = validateEntry(entry, lib, `line ${line}`);
  findings.push(...f);
  last = entry; lastValid = f.length === 0;
}
if (!entries.length) findings.push('the log has no entries');

if (stampPath) {
  if (!fs.existsSync(stampPath)) { console.error(`check-records: no file ${stampPath}`); process.exit(2); }
  const st = readStamp(fs.readFileSync(stampPath, 'utf8'));
  if (!st) findings.push(`no design-build stamp in ${stampPath}`);
  else {
    if (st.keys.some((k) => /score|critique|self-?check|rating/i.test(k))) findings.push('stamp carries self-scores');
    // Which build does this stamp describe? --entry <line> names it; otherwise the entry the stamp
    // matches exactly, else the newest. A stamp that matches no entry is compared with the newest
    // (or the named one) and every disagreeing field is reported.
    const diff = (x) => {
      const out = [];
      for (const k of ['date', 'route', 'direction', 'scope', 'structure', 'system', 'enrichment', 'distance'])
        if (String(st.fields[k] ?? '') !== String(x[k])) out.push(k);
      for (const k of ['ground', 'display', 'accent']) if (st.axes[k] !== x.axes[k]) out.push(`axes.${k}`);
      if (!sameSettings(st.structureSettings || {}, x.structure_settings || {})) out.push('structure.settings');
      if (!sameSettings(st.fingerprint || {}, x.fingerprint || {})) out.push('fingerprint');
      for (const s of new Set([...Object.keys(st.parts), ...Object.keys(x.parts)])) {
        const a = st.parts[s]; const b = x.parts[s];
        if (!a || !b || a.part !== b.part || !sameSettings(a.settings, b.settings)) out.push(`part.${s}`);
      }
      return out;
    };
    const wantLine = opt('--entry') ? Number(opt('--entry')) : null;
    const valid = entries.filter(({ entry, line }) => validateEntry(entry, lib, `line ${line}`).length === 0);
    let target = wantLine ? valid.find((x) => x.line === wantLine) : valid.find((x) => diff(x.entry).length === 0);
    if (wantLine && !target) findings.push(`--entry ${wantLine} is not a valid log line`);
    if (!target && !wantLine && last && lastValid) target = { entry: last };
    if (target) for (const k of diff(target.entry)) findings.push(`stamp disagrees with the log: ${k}`);
    else if (!wantLine && !lastValid) { /* the newest entry is invalid: reported above */ }
  }
}

if (findings.length) {
  console.log(`check-records: ${findings.length} finding(s)`);
  for (const f of findings) console.log(`  ✘ ${f}`);
  process.exit(1);
}
console.log(`check-records: clean (${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}${stampPath ? ', stamp matches' : ''})`);
