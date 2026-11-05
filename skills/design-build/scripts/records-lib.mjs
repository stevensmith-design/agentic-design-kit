// records-lib — the build log and the stamp, read the same way by both checkers.
//
// Log: `.design-build/log.jsonl`, one JSON object per build, oldest first. Stamp: one comment block
// at the top of the build's main stylesheet, opening `/* design-build stamp`. The format is defined
// in references/build/records.md; change both together.

import fs from 'node:fs';

export const ENUMS = {
  route: ['approved-direction', 'system-led', 'reference-led', 'reference-directed',
    'brief-originated', 'starter-led', 'named-starter-match', 'product-interface',
    'reference-informed', 'brief-derived'], // final two retain historical log compatibility
  scope: ['page', 'component', 'redesign'],
  ground: ['dark', 'mid', 'light'],
  display: ['serif', 'sans', 'slab', 'mono', 'condensed', 'rounded', 'decorative'],
  accent: ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'violet', 'pink', 'neutral'],
  system: ['open', 'locked'],
  enrichment: ['type', 'css', 'svg', 'supplied-media', 'generated', 'runtime'],
  distance: ['applied', 'suspended', 'inverted', 'n/a'],
};
// The six structural treatments a page commits to (references/build/variation.md § Fingerprint).
export const FINGERPRINT = {
  headings: ['above', 'margin', 'hanging', 'run-in', 'pinned', 'inside-tiles', 'foot', 'none'],
  body: ['single-column', 'two-column', 'split-panes', 'grid', 'tiles', 'list', 'table'],
  dividers: ['space', 'hairline', 'value-step', 'material', 'flood'],
  buttons: ['filled', 'outlined', 'typographic', 'pill', 'form'],
  images: ['none', 'full-bleed', 'contained', 'grid', 'drawn', 'screens', 'inline-figures'],
  reveal: ['none', 'on-load', 'on-scroll', 'scroll-linked', 'interaction'],
};
export const SLOTS = ['hero', 'section-head', 'feature', 'cta', 'proof', 'nav', 'footer'];
export const SUPPLIED = ['approved-direction', 'reference-led', 'reference-directed',
  'named-starter-match', 'reference-informed'];
export const REQUIRED = ['date', 'route', 'direction', 'scope', 'structure', 'parts', 'axes.ground',
  'axes.display', 'axes.accent', 'system', 'enrichment', 'distance', 'brief'];

/** The distance mode a build must record, from its scope, system and route. */
export function expectedDistance(e) {
  if (e.scope === 'component') return 'n/a';
  if (e.system === 'locked') return 'inverted';
  if (SUPPLIED.includes(e.route)) return 'suspended';
  return 'applied';
}

const get = (o, p) => p.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o);

/** Parse the log. Returns {entries:[{line, entry}], errors:[msg]}. */
export function readLog(file) {
  const out = { entries: [], errors: [] };
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((l, i) => {
    if (!l.trim()) return;
    try { out.entries.push({ line: i + 1, entry: JSON.parse(l) }); }
    catch { out.errors.push(`line ${i + 1} is not JSON`); }
  });
  return out;
}

/** Library ids from structures/index.md: `- \`id\` (family) — path — text`. */
export function readIndex(file) {
  const pages = new Set(); const parts = new Map(); const paths = new Map();
  for (const l of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = l.match(/^- `([a-z0-9-]+)`(?: \(([a-z-]+)\))? — (\S+\.md) — /);
    if (!m) continue;
    paths.set(m[1], m[3]);
    if (m[2]) parts.set(m[1], m[2]); else pages.add(m[1]);
  }
  return { pages, parts, paths };
}

/** Validate one entry; returns finding strings. `lib` may be null (no library check). */
export function validateEntry(e, lib, where = '') {
  const f = [];
  const at = where ? ` (${where})` : '';
  for (const k of REQUIRED) if (get(e, k) === undefined || get(e, k) === '') f.push(`missing field: ${k}${at}`);
  if (e.distance === 'applied' && e.fingerprint === undefined) f.push(`missing field: fingerprint${at}`);
  if (f.length) return f;
  if (e.fingerprint !== undefined) {
    if (typeof e.fingerprint !== 'object' || e.fingerprint === null) f.push(`fingerprint must be an object${at}`);
    else for (const [k, vals] of Object.entries(FINGERPRINT)) {
      const v = e.fingerprint[k];
      if (!vals.includes(v)) f.push(`fingerprint.${k} must be one of ${vals.join(' | ')}, got "${v}"${at}`);
    }
  }
  for (const [k, vals] of Object.entries(ENUMS)) {
    const v = k in e ? e[k] : e.axes[k];
    if (!vals.includes(v)) f.push(`${k} must be one of ${vals.join(' | ')}, got "${v}"${at}`);
  }
  const s = e.structure;
  if (e.scope === 'component') {
    if (s !== 'none') f.push(`a component build records structure "none"${at}`);
  } else if (!/^own:\S/.test(s) && lib && !lib.pages.has(s)) f.push(`unknown structure: ${s}${at}`);
  if (typeof e.parts !== 'object' || Array.isArray(e.parts)) f.push(`parts must be an object${at}`);
  else for (const [slot, p] of Object.entries(e.parts)) {
    if (!SLOTS.includes(slot)) { f.push(`unknown part slot: ${slot}${at}`); continue; }
    const id = p && p.part;
    if (!id) { f.push(`part slot ${slot} names no part${at}`); continue; }
    if (/\s/.test(id)) { f.push(`part ids are written without spaces (hyphenate): "${id}"${at}`); continue; }
    const own = /^own:\S/.test(id);
    const kv = p.settings && typeof p.settings === 'object' ? Object.entries(p.settings) : [];
    if (kv.some(([k, v]) => /\s/.test(k) || /\s/.test(String(v))))
      f.push(`setting names and values are written without spaces (hyphenate): part ${id}${at}`);
    if (!own && lib) {
      if (!lib.parts.has(id)) { f.push(`unknown part: ${id}${at}`); continue; }
      if (lib.parts.get(id) !== slot) f.push(`part ${id} is a ${lib.parts.get(id)}, not a ${slot}${at}`);
    }
    const n = p.settings && typeof p.settings === 'object' ? Object.keys(p.settings).length : 0;
    if (!own && n === 0) f.push(`part ${id} records no variation settings${at}`);
  }
  if (e.structure_settings !== undefined) {
    const ss = e.structure_settings;
    if (typeof ss !== 'object' || Array.isArray(ss) || ss === null) f.push(`structure_settings must be an object${at}`);
    else if (Object.entries(ss).some(([k, v]) => /\s/.test(k) || /\s/.test(String(v))))
      f.push(`setting names and values are written without spaces (hyphenate): structure ${s}${at}`);
  }
  const want = expectedDistance(e);
  if (ENUMS.distance.includes(e.distance) && e.distance !== want) {
    const why = want === 'suspended' ? `route ${e.route}` : want === 'inverted' ? 'a locked system' : want === 'n/a' ? 'a component build' : `route ${e.route}`;
    f.push(`distance must be ${want} on ${why}, got "${e.distance}"${at}`);
  }
  return f;
}

/** Parse the stamp block out of a stylesheet. Returns null when there is none. */
export function readStamp(css) {
  const m = css.match(/\/\*\s*design-build stamp\b([\s\S]*?)\*\//);
  if (!m) return null;
  const st = { fields: {}, parts: {}, axes: {}, keys: [] };
  for (const raw of m[1].split('\n')) {
    const l = raw.trim(); if (!l) continue;
    const i = l.indexOf(': '); if (i < 0) continue;
    const k = l.slice(0, i).trim(); const v = l.slice(i + 2).trim();
    st.keys.push(k);
    if (k === 'fingerprint') {
      st.fingerprint = Object.fromEntries(v.split(/\s+/).filter(Boolean).map((x) => x.split('=')));
    } else if (k === 'structure.settings') {
      st.structureSettings = Object.fromEntries(v.split(/\s+/).filter(Boolean).map((x) => x.split('=')));
    } else if (k.startsWith('part.')) {
      const [id, ...kv] = v.split(/\s+/);
      st.parts[k.slice(5)] = { part: id, settings: Object.fromEntries(kv.map((x) => x.split('='))) };
    } else if (k === 'axes') {
      for (const x of v.split(/\s+/)) { const [a, b] = x.split('='); st.axes[a] = b; }
    } else st.fields[k] = v;
  }
  return st;
}

export const sameSettings = (a = {}, b = {}) => {
  const ka = Object.keys(a).sort(); const kb = Object.keys(b).sort();
  return ka.length === kb.length && ka.every((k, i) => k === kb[i] && String(a[k]) === String(b[k]));
};
