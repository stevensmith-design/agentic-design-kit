#!/usr/bin/env node
// check-distance — does the newest build differ enough from the builds before it?
//
//   node check-distance.mjs --log .design-build/log.jsonl
//
// The newest log entry is the candidate. Component builds are skipped on both sides.
//   applied   — differ from the previous page build on at least one of ground, display, accent,
//               and on at least two of the six fingerprint treatments;
//               no page structure from the last three page builds; a repeated part changes at
//               least one variation setting from its last use; a structure used again (four or
//               more builds back) changes at least one of its settings.
//   inverted  — a locked system: ground, display and accent equal the system's (the previous
//               locked build), nav and footer equal the shared ones; other parts still may not
//               repeat with the same settings. Structure may repeat, with a setting changed.
//   suspended — the build follows a supplied direction; nothing is compared.
// Run check-records first: a malformed log is exit 2 here, never clean.
//
// Exit: 0 clean · 1 findings · 2 cannot read the log.

import fs from 'node:fs';
import { readLog, validateEntry, sameSettings, FINGERPRINT } from './records-lib.mjs';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const logPath = opt('--log');
if (!logPath || !fs.existsSync(logPath)) { console.error('check-distance: --log <log.jsonl> is required'); process.exit(2); }
const { entries, errors } = readLog(logPath);
const bad = [...errors, ...entries.flatMap(({ entry, line }) => validateEntry(entry, null, `line ${line}`))];
if (bad.length) { console.error(`check-distance: the log is malformed (${bad[0]}) — run check-records.mjs`); process.exit(2); }

const pages = entries.map((x) => x.entry).filter((e) => e.scope !== 'component');
const cand = pages[pages.length - 1];
const findings = [];
const notes = [];
const AX = ['ground', 'display', 'accent'];

function partRepeats(history, slots) {
  for (const [slot, p] of Object.entries(cand.parts)) {
    if (!slots.includes(slot) || /^own:/.test(p.part)) continue;
    const prev = [...history].reverse().map((e) => Object.values(e.parts).find((q) => q.part === p.part)).find(Boolean);
    if (prev && sameSettings(prev.settings, p.settings)) findings.push(`part ${p.part} repeats with the same settings as its last use`);
  }
}

function structureRepeats(history) {
  if (/^own:/.test(cand.structure) || !cand.structure_settings || !Object.keys(cand.structure_settings).length) return;
  const prev = [...history].reverse().find((e) => e.structure === cand.structure);
  if (prev && prev.structure_settings && sameSettings(prev.structure_settings, cand.structure_settings))
    findings.push(`structure ${cand.structure} repeats with the same settings as its last use`);
}

if (cand && pages.length > 1 && cand.distance !== 'suspended') {
  const history = pages.slice(0, -1);
  const allSlots = Object.keys(cand.parts);
  if (cand.distance === 'applied') {
    const prev = history[history.length - 1];
    if (AX.every((k) => prev.axes[k] === cand.axes[k])) findings.push('same ground, display and accent as the previous build');
    // Decision 3b (2026-10-14): the axes alone let a recolour pass. At least two of the six
    // structural treatments must change too. A previous build logged before the fingerprint
    // existed cannot be compared; that is said, not passed silently.
    if (prev.fingerprint && cand.fingerprint) {
      const n = Object.keys(FINGERPRINT).filter((k) => prev.fingerprint[k] !== cand.fingerprint[k]).length;
      if (n < 2) findings.push(`only ${n} of the six fingerprint treatments differs from the previous build (at least 2)`);
    } else if (!prev.fingerprint) notes.push('the previous build has no fingerprint: treatments not compared');
    const recent = history.slice(-3).map((e) => e.structure);
    if (!/^own:/.test(cand.structure) && recent.includes(cand.structure)) findings.push(`structure ${cand.structure} was used in the last three builds`);
    partRepeats(history, allSlots);
    if (!recent.includes(cand.structure)) structureRepeats(history);
  } else if (cand.distance === 'inverted') {
    const sys = [...history].reverse().find((e) => e.system === 'locked');
    if (sys) {
      for (const k of AX) if (sys.axes[k] !== cand.axes[k]) findings.push(`locked system: ${k} differs from the system`);
      for (const s of ['nav', 'footer']) {
        const a = sys.parts[s]; const b = cand.parts[s];
        if (a && (!b || a.part !== b.part || !sameSettings(a.settings, b.settings))) findings.push(`locked system: ${s} differs from the shared ${s}`);
      }
    }
    partRepeats(history, allSlots.filter((s) => s !== 'nav' && s !== 'footer'));
    structureRepeats(history);
  }
}

if (findings.length) {
  console.log(`check-distance: ${findings.length} finding(s)`);
  for (const f of findings) console.log(`  ✘ ${f}`);
  process.exit(1);
}
console.log(`check-distance: clean (${cand ? cand.distance : 'no page builds'}; ${pages.length} page build(s))${notes.length ? ' — note: ' + notes.join('; ') : ''}`);
