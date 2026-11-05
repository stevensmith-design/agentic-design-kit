// Design-token helpers: custom properties declared at the page root, var() resolution without an
// element, and the type ramp a project declares in tokens.json or DESIGN.md.

import fs from 'node:fs';
import path from 'node:path';
import { globalVar, mediaExcluded } from './cascade.mjs';
import { splitTopLevel } from './css.mjs';

// Selectors that define page-level tokens: :root, html, body, and theme scopes on them.
const ROOTISH = /^(?::root|html|body)(?:\[[^\]]*\]|\.[\w-]+|:not\([^)]*\))*$|^\[data-[\w-]*theme[^\]]*\]$|^\.(?:dark|light|theme-[\w-]+)$/i;
export function isRootish(sel) { return ROOTISH.test(sel.trim()); }
export function rootishRule(rule) { return rule.selectors.length > 0 && rule.selectors.every(isRootish); }

// Every custom property declared in a root-level rule (all media: a dark theme's tokens count).
export function tokenDecls(ctx) {
  if (ctx._tokens) return ctx._tokens;
  const out = [];
  for (const r of ctx.rules) {
    if (!rootishRule(r)) continue;
    for (const d of r.decls) if (d.prop.startsWith('--')) out.push({ name: d.prop, value: d.value, line: d.line, file: r.file, rule: r });
  }
  ctx._tokens = out;
  return out;
}

// Resolve var() against root-level declarations (no element context).
export function resolveGlobal(ctx, value, depth = 0) {
  if (!value || !value.includes('var(') || depth > 10) return value;
  return value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*((?:[^()]|\([^()]*\))*))?\)/g, (m, name, fb) => {
    let v = globalVar(ctx, name);
    if (v == null) v = fb != null ? fb.trim() : '';
    return resolveGlobal(ctx, v, depth + 1);
  });
}

// A length written as an absolute literal: px, rem (16px root), pt. em / % / vw / calc → null.
export function literalPx(v) {
  const m = /^(-?[\d.]+)(px|rem|pt)$/.exec(String(v).trim().toLowerCase());
  if (!m) return null;
  const n = parseFloat(m[1]);
  return m[2] === 'px' ? n : m[2] === 'rem' ? n * 16 : (n * 4) / 3;
}

function flatten(obj, prefix = '', out = {}) {
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) flatten(v, prefix ? `${prefix}.${k}` : k, out);
  } else out[prefix] = obj;
  return out;
}

// Same selection as ui-design-system/scripts/validate-tokens.py collect_type_sizes(), so the two
// tools agree on what "the ramp" is.
function rampFromTokens(json) {
  const sizes = [];
  for (const [p, val] of Object.entries(flatten(json))) {
    const lp = p.toLowerCase();
    if (!/(type|font|text|size|heading|scale)/.test(lp)) continue;
    if (/weight|line|leading|track|letter|family|note/.test(lp)) continue;
    let px = null;
    if (typeof val === 'number') px = val;
    else if (typeof val === 'string') px = literalPx(val) ?? (/^\s*[\d.]+\s*$/.test(val) ? parseFloat(val) : null);
    if (px != null && px >= 6 && px <= 200) sizes.push(px);
  }
  return sizes;
}

// DESIGN.md: px / rem values on lines that name the type scale or ramp.
function rampFromDesignMd(text) {
  const sizes = [];
  for (const line of text.split('\n')) {
    if (!/\b(type|font|text)[\s-]*(scale|ramp|sizes?)\b/i.test(line)) continue;
    for (const m of line.matchAll(/(\d+(?:\.\d+)?)\s*(px|rem)\b/gi)) {
      const px = m[2].toLowerCase() === 'rem' ? parseFloat(m[1]) * 16 : parseFloat(m[1]);
      if (px >= 6 && px <= 200) sizes.push(px);
    }
  }
  return sizes;
}

function readRamp(file) {
  try {
    const txt = fs.readFileSync(file, 'utf8');
    const sizes = /\.json$/i.test(file) ? rampFromTokens(JSON.parse(txt)) : rampFromDesignMd(txt);
    return sizes.length >= 2 ? { sizes: [...new Set(sizes)].sort((a, b) => a - b), source: file } : null;
  } catch { return null; }
}

const rampCache = new Map();
const RAMP_FILES = ['tokens.json', 'design-tokens.json', 'DESIGN.md', 'design-system.md'];

// The ramp for this file: --design if given, else the nearest ramp file walking up from the
// file's folder, never above the scan target it was found under.
export function findRamp(ctx) {
  if (ctx.opts.design) {
    const k = path.resolve(ctx.opts.design);
    if (!rampCache.has(k)) rampCache.set(k, readRamp(k));
    return rampCache.get(k);
  }
  const stop = path.resolve(ctx.opts.root || path.dirname(ctx.file));
  for (let dir = path.dirname(path.resolve(ctx.file)); ; dir = path.dirname(dir)) {
    if (!rampCache.has(dir)) {
      let found = null;
      for (const f of RAMP_FILES) {
        const p = path.join(dir, f);
        if (fs.existsSync(p) && (found = readRamp(p))) break;
      }
      rampCache.set(dir, found);
    }
    if (rampCache.get(dir)) return rampCache.get(dir);
    if (dir === stop || !dir.startsWith(stop) || dir === path.dirname(dir)) return null;
  }
}

export { splitTopLevel, mediaExcluded };

// Breakpoints a project commits to: DESIGN.md lines that mention a breakpoint, and tokens.json
// keys under breakpoint / screen. Same discovery as the ramp (--design, else nearest file up to
// the scan target). Used by the browser pass to probe either side of each one.
function breakpointsIn(file) {
  try {
    const txt = fs.readFileSync(file, 'utf8');
    const out = [];
    if (/\.json$/i.test(file)) {
      for (const [p, v] of Object.entries(flatten(JSON.parse(txt)))) {
        if (!/breakpoint|screen/i.test(p)) continue;
        const px = typeof v === 'number' ? v : literalPx(String(v));
        if (px && px >= 200 && px <= 3000) out.push(px);
      }
    } else {
      for (const line of txt.split('\n')) {
        if (!/breakpoint/i.test(line)) continue;
        for (const m of line.matchAll(/(\d{3,4})\s*px\b/gi)) {
          const px = parseInt(m[1], 10);
          if (px >= 200 && px <= 3000) out.push(px);
        }
      }
    }
    return [...new Set(out)].sort((a, b) => a - b);
  } catch { return []; }
}

export function findBreakpoints({ file, root, design }) {
  if (design) return breakpointsIn(design);
  const stop = path.resolve(root || path.dirname(file));
  for (let dir = path.dirname(path.resolve(file)); ; dir = path.dirname(dir)) {
    for (const f of RAMP_FILES) {
      const p = path.join(dir, f);
      if (fs.existsSync(p)) { const b = breakpointsIn(p); if (b.length) return b; }
    }
    if (dir === stop || !dir.startsWith(stop) || dir === path.dirname(dir)) return [];
  }
}
