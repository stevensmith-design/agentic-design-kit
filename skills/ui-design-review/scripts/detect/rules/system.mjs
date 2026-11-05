// Design-system adherence: literal values that bypass the project's declared tokens.
import path from 'node:path';
import { parseColor, colorsIn } from '../lib/color.mjs';
import { parseDecls } from '../lib/css.mjs';
import { tokenDecls, resolveGlobal, literalPx, findRamp, rootishRule, splitTopLevel } from '../lib/tokens.mjs';
import { firstFamily } from './typography.mjs';

function sizeEnds(value) {
  const v = value.trim().toLowerCase();
  const m = /^clamp\((.*)\)$/.exec(v);
  if (!m) return [v];
  const a = splitTopLevel(m[1], ',').map((x) => x.trim());
  return a.length === 3 ? [a[0], a[2]] : [];
}

function fontSizeOf(d) {
  if (d.prop === 'font-size') return d.value;
  if (d.prop === 'font') { const m = /(?:^|\s)([\d.]+(?:px|rem|pt))(?:\s*\/|\s)/.exec(` ${d.value} `); return m ? m[1] : null; }
  return null;
}

const offRamp = {
  id: 'font-size-outside-ramp',
  why: 'A literal font size that is not a step on the project\'s type ramp.',
  fix: 'Use the nearest ramp step (or its token); if the size is genuinely needed, add it to the ramp in DESIGN.md / tokens.json first.',
  run(ctx, report) {
    const ramp = findRamp(ctx);
    if (!ramp) return;
    const src = path.relative(process.cwd(), ramp.source) || ramp.source;
    const check = (raw, line, file) => {
      if (raw == null) return;
      for (const end of sizeEnds(resolveGlobal(ctx, raw))) {
        const px = literalPx(end);
        if (px == null) continue;
        const nearest = ramp.sizes.reduce((a, b) => (Math.abs(b - px) < Math.abs(a - px) ? b : a));
        if (Math.abs(nearest - px) > 0.5) {
          report({ line, file, message: `font-size ${end}${/px$/.test(end) ? '' : ` (${+px.toFixed(2)}px)`} is off the ramp; nearest step ${nearest}px (${src}).` });
        }
      }
    };
    for (const r of ctx.rules) for (const d of r.decls) check(fontSizeOf(d), d.line, r.file);
    for (const el of ctx.elements) {
      if (!el.attrs.style) continue;
      for (const d of parseDecls(el.attrs.style, el.line)) check(fontSizeOf(d), el.line);
    }
  },
};

const COLOUR_PROP = /^(color|background|background-color|border|border-(top|right|bottom|left)|border(-(top|right|bottom|left))?-color|outline|outline-color|fill|stroke|text-decoration-color|caret-color|accent-color|column-rule-color)$/;
const KEYWORD = /^(transparent|currentcolor|inherit|initial|unset|revert|none)$/i;
const same = (a, b) => Math.abs(a.r - b.r) <= 1 && Math.abs(a.g - b.g) <= 1 && Math.abs(a.b - b.b) <= 1 && Math.abs((a.a ?? 1) - (b.a ?? 1)) <= 0.02;

function literalColours(value) {
  if (/var\(/.test(value)) value = value.replace(/var\((?:[^()]|\([^()]*\))*\)/g, ' ');
  return colorsIn(value).filter((c) => !KEYWORD.test(c.src));
}

const inlineLiteral = {
  id: 'inline-colour-or-font',
  why: 'A colour or font is written out literally where the project already has a token for it, so a theme or palette change will miss this spot.',
  fix: 'Reference the token (var(--name)) instead of repeating its value; move inline style="" colours and fonts into a class that uses tokens.',
  run(ctx, report) {
    const colourTokens = [];
    const fontTokens = [];
    for (const t of tokenDecls(ctx)) {
      const v = resolveGlobal(ctx, t.value);
      const c = parseColor(v);
      if (c) { colourTokens.push({ ...t, c }); continue; }
      if (/font|family|typeface/i.test(t.name)) { const f = firstFamily(v); if (f) fontTokens.push({ ...t, f }); }
    }
    if (!colourTokens.length && !fontTokens.length) return;

    for (const el of ctx.elements) {
      if (!el.attrs.style) continue;
      for (const d of parseDecls(el.attrs.style, el.line)) {
        if (colourTokens.length && COLOUR_PROP.test(d.prop)) {
          const lit = literalColours(d.value);
          if (lit.length) report({ line: el.line, message: `Inline style ${d.prop}: ${lit[0].src} — the page has colour tokens.` });
        }
        if (fontTokens.length && d.prop === 'font-family' && firstFamily(d.value)) {
          report({ line: el.line, message: `Inline style font-family: ${d.value} — the page has font tokens.` });
        }
      }
    }

    for (const r of ctx.rules) {
      if (rootishRule(r)) continue;
      for (const d of r.decls) {
        if (d.prop.startsWith('--')) continue;
        if (COLOUR_PROP.test(d.prop)) {
          for (const c of literalColours(d.value)) {
            const t = colourTokens.find((x) => same(x.c, c));
            if (t) { report({ line: d.line, file: r.file, message: `${c.src} is the value of ${t.name}; use var(${t.name}).` }); break; }
          }
        }
        if (d.prop === 'font-family' && !/var\(/.test(d.value)) {
          const f = firstFamily(d.value);
          const t = f && fontTokens.find((x) => x.f === f);
          if (t) report({ line: d.line, file: r.file, message: `"${f}" is the value of ${t.name}; use var(${t.name}).` });
        }
      }
    }
  },
};

export default [offRamp, inlineLiteral];
