// Load a file into a scan context and compute a best-effort "at rest, desktop" cascade.
// Rules inside max-width / print / reduced-motion / forced-colors / dark-scheme media are kept
// for CSS-level checks but excluded from the computed cascade (we model one desktop, light,
// motion-allowed view). State selectors (:hover, :focus, ...) never apply at rest.

import fs from 'node:fs';
import path from 'node:path';
import { parseHTML, walk } from './html.mjs';
import { parseCSS, parseDecls, longhands } from './css.mjs';
import { parseSelector, complexMatch, specificity } from './select.mjs';

const INHERITED = new Set(['color', 'font-family', 'font-size', 'font-style', 'font-weight',
  'line-height', 'letter-spacing', 'text-align', 'text-transform', 'hyphens', 'visibility',
  'word-spacing', 'white-space', 'font-variant', 'font-variant-caps', 'cursor', 'direction',
  'text-wrap', 'overflow-wrap', 'word-break']);

const UA = {
  h1: { 'font-size': '2em', 'font-weight': '700' }, h2: { 'font-size': '1.5em', 'font-weight': '700' },
  h3: { 'font-size': '1.17em', 'font-weight': '700' }, h4: { 'font-size': '1em', 'font-weight': '700' },
  h5: { 'font-size': '0.83em', 'font-weight': '700' }, h6: { 'font-size': '0.67em', 'font-weight': '700' },
  small: { 'font-size': '0.833em' }, b: { 'font-weight': '700' }, strong: { 'font-weight': '700' },
  em: { 'font-style': 'italic' }, i: { 'font-style': 'italic' },
  html: { 'font-size': '16px', color: '#000000', 'line-height': 'normal', 'font-family': 'serif' },
};

const EXCLUDED_MEDIA = /max-width|max-inline-size|\bprint\b|prefers-reduced-motion\s*:\s*reduce|forced-colors|prefers-color-scheme\s*:\s*dark|prefers-contrast/i;

export function mediaExcluded(media) { return (media || []).some((m) => EXCLUDED_MEDIA.test(m)); }

export function loadContext(file, opts = {}) {
  const src = fs.readFileSync(file, 'utf8');
  const ext = path.extname(file).toLowerCase();
  const ctx = { file, src, kind: ext === '.css' ? 'css' : 'html', sheets: [], root: null, elements: [], opts };
  if (ctx.kind === 'css') {
    ctx.sheets.push(parseCSS(src, file));
  } else {
    ctx.root = parseHTML(src);
    ctx.elements = [...walk(ctx.root)];
    for (const el of ctx.elements) {
      if (el.tag === 'style' && el.raw != null) ctx.sheets.push(parseCSS(el.raw, file, el.rawLine));
      if (el.tag === 'link' && /\bstylesheet\b/i.test(el.attrs.rel || '') && el.attrs.href &&
          !/^(https?:)?\/\//i.test(el.attrs.href)) {
        const p = path.resolve(path.dirname(file), el.attrs.href.split(/[?#]/)[0]);
        if (fs.existsSync(p)) ctx.sheets.push(parseCSS(fs.readFileSync(p, 'utf8'), p));
      }
    }
  }
  ctx.rules = ctx.sheets.flatMap((s) => s.rules);
  ctx.keyframes = Object.assign({}, ...ctx.sheets.map((s) => s.keyframes));
  ctx.fontFaces = ctx.sheets.flatMap((s) => s.fontFaces);
  // Pre-parse selectors once.
  let order = 0;
  ctx.parsedRules = [];
  for (const r of ctx.rules) {
    for (const sel of r.selectors) {
      const p = parseSelector(sel);
      ctx.parsedRules.push({ rule: r, sel, parsed: p, spec: specificity(p), order: order++,
        atRest: !p.states.size && !p.pseudoEl && !mediaExcluded(r.media) });
    }
  }
  ctx.cache = new Map();
  ctx.get = (el, prop) => computedValue(ctx, el, prop);
  ctx.decl = (el, prop) => computed(ctx, el).get(prop);
  ctx.px = (el, prop) => resolvePx(ctx, el, prop);
  ctx.fontPx = (el) => fontPx(ctx, el);
  ctx.matching = (el, filter = () => true) => ctx.parsedRules.filter((pr) => filter(pr) && complexMatch(el, pr.parsed));
  return ctx;
}

function computed(ctx, el) {
  if (ctx.cache.has(el)) return ctx.cache.get(el);
  const map = new Map();
  const ua = UA[el.tag];
  if (ua) for (const [k, v] of Object.entries(ua)) map.set(k, { value: v, spec: -1, order: -1, important: false, ua: true });
  const apply = (d, spec, ord, src) => {
    for (const ld of longhands(d)) {
      const prev = map.get(ld.prop);
      if (!prev || (ld.important && !prev.important) || (ld.important === prev.important &&
          (spec > prev.spec || (spec === prev.spec && ord >= prev.order)))) {
        map.set(ld.prop, { value: ld.value, spec, order: ord, important: ld.important, line: ld.line, src });
      }
    }
  };
  if (el.tag !== '#root') {
    for (const pr of ctx.parsedRules) {
      if (!pr.atRest) continue;
      if (!complexMatch(el, pr.parsed)) continue;
      for (const d of pr.rule.decls) apply(d, pr.spec, pr.order, pr.rule);
    }
    if (el.attrs?.style) {
      for (const d of parseDecls(el.attrs.style, el.line)) apply(d, 1e9, 1e9, { inline: true, line: el.line });
    }
  }
  ctx.cache.set(el, map);
  return map;
}

function parentEl(el) { return el.parent && el.parent.tag !== '#root' ? el.parent : null; }

function rawValue(ctx, el, prop) {
  for (let e = el; e; e = parentEl(e)) {
    const d = computed(ctx, e).get(prop);
    if (d && d.value !== 'inherit') return { ...d, owner: e };
    if (!(INHERITED.has(prop) || prop.startsWith('--')) && !(d && d.value === 'inherit')) return null;
  }
  return null;
}

export function resolveVars(ctx, el, value, depth = 0) {
  if (!value || !value.includes('var(') || depth > 10) return value;
  return value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*((?:[^()]|\([^()]*\))*))?\)/g, (m, name, fb) => {
    const d = el ? rawValue(ctx, el, name) : null;
    let v = d ? d.value : globalVar(ctx, name);
    if (v == null) v = fb != null ? fb.trim() : '';
    return resolveVars(ctx, el, v, depth + 1);
  });
}

// For CSS-only files: the last :root / html / * declaration of a custom property.
export function globalVar(ctx, name) {
  let v = null;
  for (const r of ctx.rules) {
    if (mediaExcluded(r.media)) continue;
    if (!r.selectors.some((s) => /^(:root|html|\*|body)$/.test(s.trim()))) continue;
    for (const d of r.decls) if (d.prop === name) v = d.value;
  }
  return v;
}

export function computedValue(ctx, el, prop) {
  const d = rawValue(ctx, el, prop);
  if (!d) return null;
  return resolveVars(ctx, el, d.value);
}

const KEYWORD_SIZE = { 'xx-small': 9, 'x-small': 10, small: 13, medium: 16, large: 18, 'x-large': 24, 'xx-large': 32, 'xxx-large': 48 };

export function toPx(value, basePx, rootPx = 16) {
  if (value == null) return null;
  let v = String(value).trim().toLowerCase();
  if (KEYWORD_SIZE[v]) return KEYWORD_SIZE[v];
  if (v === 'smaller') return basePx / 1.2;
  if (v === 'larger') return basePx * 1.2;
  let m = /^(clamp|max)\((.*)\)$/.exec(v);
  if (m) {
    // desktop view: clamp's max bound / max()'s largest resolvable argument
    const args = splitArgs(m[2]).map((a) => toPx(a, basePx, rootPx)).filter((x) => x != null);
    if (!args.length) return null;
    return m[1] === 'clamp' ? (args.length === 3 ? args[2] : Math.max(...args)) : Math.max(...args);
  }
  m = /^min\((.*)\)$/.exec(v);
  if (m) { const args = splitArgs(m[1]).map((a) => toPx(a, basePx, rootPx)).filter((x) => x != null); return args.length ? Math.min(...args) : null; }
  m = /^calc\((.*)\)$/.exec(v);
  if (m) return evalCalc(m[1], basePx, rootPx);
  m = /^(-?[\d.]+)(px|rem|em|%|pt|vw|vh|ch|ex)?$/.exec(v);
  if (!m) return null;
  const n = parseFloat(m[1]);
  switch (m[2]) {
    case undefined: return n === 0 ? 0 : null;
    case 'px': return n;
    case 'rem': return n * rootPx;
    case 'em': return n * basePx;
    case '%': return (n / 100) * basePx;
    case 'pt': return (n * 4) / 3;
    case 'vw': return (n / 100) * 1280;
    case 'vh': return (n / 100) * 900;
    case 'ch': return n * basePx * 0.5;
    case 'ex': return n * basePx * 0.5;
    default: return null;
  }
}

function splitArgs(s) {
  const out = []; let depth = 0, start = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') depth++; else if (s[i] === ')') depth--;
    else if (s[i] === ',' && depth === 0) { out.push(s.slice(start, i).trim()); start = i + 1; }
  }
  out.push(s.slice(start).trim());
  return out;
}

function evalCalc(expr, basePx, rootPx) {
  // supports a + b, a - b, a * n, a / n with one level
  const tokens = expr.match(/-?[\d.]+(?:px|rem|em|%|vw|vh)?|[+\-*/]/g);
  if (!tokens) return null;
  let total = null, op = '+';
  for (const t of tokens) {
    if ('+-*/'.includes(t) && t.length === 1) { op = t; continue; }
    const isNum = /^-?[\d.]+$/.test(t);
    const val = isNum ? parseFloat(t) : toPx(t, basePx, rootPx);
    if (val == null) return null;
    if (total === null) { total = val; continue; }
    if (op === '+') total += val; else if (op === '-') total -= val;
    else if (op === '*') total *= val; else if (op === '/') total /= val;
  }
  return total;
}

function rootFontPx(ctx) {
  if (ctx._rootPx != null) return ctx._rootPx;
  const html = ctx.elements.find((e) => e.tag === 'html');
  let px = 16;
  if (html) {
    const d = computed(ctx, html).get('font-size');
    if (d) px = toPx(resolveVars(ctx, html, d.value), 16, 16) ?? 16;
  }
  ctx._rootPx = px;
  return px;
}

export function fontPx(ctx, el) {
  if (!el || el.tag === '#root') return 16;
  const key = '__fontPx';
  if (el[key] != null && el[key + 'ctx'] === ctx) return el[key];
  const parentPx = parentEl(el) ? fontPx(ctx, parentEl(el)) : 16;
  const d = computed(ctx, el).get('font-size');
  let px = parentPx;
  if (d) {
    const v = resolveVars(ctx, el, d.value);
    const r = toPx(v, parentPx, el.tag === 'html' ? 16 : rootFontPx(ctx));
    if (r != null) px = r;
  }
  el[key] = px; el[key + 'ctx'] = ctx;
  return px;
}

export function resolvePx(ctx, el, prop) {
  const v = computedValue(ctx, el, prop);
  if (v == null) return null;
  const base = fontPx(ctx, el);
  if (prop === 'line-height') {
    if (v === 'normal') return base * 1.2;
    if (/^[\d.]+$/.test(v)) return parseFloat(v) * base;
  }
  if (prop === 'letter-spacing' && v === 'normal') return 0;
  return toPx(v, base, rootFontPx(ctx));
}
