// Helpers shared by rules.
import { ownText, textOf, walk, elementChildren } from './html.mjs';
import { parseColor, colorsIn, over } from './color.mjs';
import { mediaExcluded } from './cascade.mjs';

export const HEADINGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
const NON_RENDERED = new Set(['head', 'script', 'style', 'template', 'noscript', 'title', 'meta', 'link']);

export function isHidden(ctx, el) {
  for (let e = el; e && e.tag !== '#root'; e = e.parent) {
    if (NON_RENDERED.has(e.tag)) return true;
    if ('hidden' in (e.attrs || {})) return true;
    if (ctx.get(e, 'display') === 'none') return true;
    const cls = e.attrs?.class || '';
    if (/\b(sr-only|visually-hidden|screen-reader-text)\b/.test(cls)) return true;
  }
  return ctx.get(el, 'visibility') === 'hidden';
}

export function norm(s) { return s.replace(/\s+/g, ' ').trim(); }

// Elements that own visible text, with that text.
export function textElements(ctx) {
  const out = [];
  for (const el of ctx.elements) {
    const t = norm(ownText(el));
    if (!t || isHidden(ctx, el)) continue;
    out.push({ el, text: t });
  }
  return out;
}

export function visibleText(ctx) {
  if (!ctx.root) return '';
  const body = ctx.elements.find((e) => e.tag === 'body') || ctx.root;
  const parts = [];
  const rec = (n) => {
    for (const c of n.children || []) {
      if (c.tag === '#text') parts.push(c.text);
      else if (!NON_RENDERED.has(c.tag) && !('hidden' in (c.attrs || {}))) { rec(c); if (/^(p|h\d|li|div|blockquote|footer|section|article|td|th|dd|dt|figcaption|br)$/.test(c.tag)) parts.push('\n'); }
    }
  };
  rec(body);
  return parts.join('');
}

export function isUppercase(ctx, el, text) {
  const tt = ctx.get(el, 'text-transform');
  if (tt === 'uppercase') return true;
  const fv = ctx.get(el, 'font-variant') || ctx.get(el, 'font-variant-caps') || '';
  if (/small-caps|all-small-caps/.test(fv)) return true;
  const letters = text.replace(/[^A-Za-z]/g, '');
  return letters.length >= 2 && letters === letters.toUpperCase();
}

export function emValue(ctx, el, prop) {
  const v = ctx.get(el, prop);
  if (v == null || v === 'normal') return 0;
  const fpx = ctx.fontPx(el);
  const m = /^(-?[\d.]+)(em|px|rem)?$/.exec(v.trim());
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (m[2] === 'em') return n;
  if (m[2] === 'rem') return (n * 16) / fpx;
  if (m[2] === 'px' || !m[2]) return n / fpx;
  return null;
}

// First opaque-ish background colour behind el, compositing translucent layers.
// Returns { color, stops } where stops are all gradient stops met (for worst-case checks).
export function backgroundBehind(ctx, el) {
  const layers = [];
  let gradientStops = null;
  for (let e = el; e && e.tag !== '#root'; e = e.parent) {
    const bc = ctx.get(e, 'background-color');
    const bi = ctx.get(e, 'background-image');
    let c = bc ? parseColor(bc) : null;
    if (bi && /gradient\(/.test(bi) && !gradientStops && !/url\(/.test(bi)) {
      const stops = colorsIn(bi).filter((s) => s.a > 0);
      if (stops.length) gradientStops = stops;
      if (!c && stops.length) c = stops[0];
    }
    if (bi && /url\(/.test(bi)) return { color: null, stops: null, image: true };
    if (c && c.a > 0) {
      layers.push(c);
      if (c.a >= 0.99) break;
    }
  }
  let base = { r: 255, g: 255, b: 255, a: 1 };
  for (let k = layers.length - 1; k >= 0; k--) base = over(layers[k], base);
  return { color: base, stops: gradientStops, image: false };
}

export function borderWidthPx(ctx, el, side) {
  const style = ctx.get(el, `border-${side}-style`);
  if (!style || /none|hidden/.test(style)) return 0;
  const w = ctx.get(el, `border-${side}-width`);
  if (w == null) return 3; // medium
  if (w === 'thin') return 1; if (w === 'medium') return 3; if (w === 'thick') return 5;
  return ctx.px(el, `border-${side}-width`) ?? 0;
}

export function radiusPx(ctx, el) {
  const v = ctx.get(el, 'border-radius');
  if (!v) return 0;
  if (/%/.test(v)) return 999;
  const first = v.split(/[\s/]+/)[0];
  const n = ctx.px(el, 'border-radius');
  return n ?? (parseFloat(first) || 0);
}

export function hasShadow(ctx, el) {
  const s = ctx.get(el, 'box-shadow');
  return !!s && s !== 'none';
}

export function bgColor(ctx, el) {
  const bc = ctx.get(el, 'background-color');
  let c = bc ? parseColor(bc) : null;
  if (!c) {
    const bi = ctx.get(el, 'background-image');
    if (bi && bi !== 'none') { const cs = colorsIn(bi); if (cs.length) c = cs[0]; }
  }
  return c && c.a > 0.05 ? c : null;
}

export function isCardLike(ctx, el) {
  if (['html', 'body', 'main', 'button', 'a', 'input', 'select', 'textarea', 'img', 'svg', 'dialog', 'menu', 'nav', 'header', 'footer', 'table', 'tr', 'td', 'th', 'thead', 'tbody'].includes(el.tag)) return false;
  if (/^(menu|menubar|listbox|dialog|tooltip|alertdialog)$/.test(el.attrs.role || '')) return false;
  if ('popover' in el.attrs) return false;
  const pos = ctx.get(el, 'position');
  if (pos === 'absolute' || pos === 'fixed') return false;
  const sides = ['top', 'right', 'bottom', 'left'].filter((s) => borderWidthPx(ctx, el, s) >= 1).length;
  if (hasShadow(ctx, el)) return true;
  if (sides >= 3) return true;
  if (bgColor(ctx, el) && radiusPx(ctx, el) > 0) return true;
  return false;
}

// Walk CSS rules (all sheets), optionally including media-excluded ones.
export function* cssRules(ctx, { includeExcluded = true } = {}) {
  for (const r of ctx.rules) {
    if (!includeExcluded && mediaExcluded(r.media)) continue;
    yield r;
  }
}

export function decl(rule, prop) {
  let d = null;
  for (const x of rule.decls) if (x.prop === prop) d = x;
  return d;
}

export { ownText, textOf, walk, elementChildren };
