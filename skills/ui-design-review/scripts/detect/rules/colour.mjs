import { parseColor, colorsIn, contrast, over, luminance, spread, hslHue, hslSat } from '../lib/color.mjs';
import { textElements, backgroundBehind, isHidden } from '../lib/util.mjs';
import { tokenDecls, resolveGlobal } from '../lib/tokens.mjs';
import { parseDecls } from '../lib/css.mjs';
import { mediaExcluded } from '../lib/cascade.mjs';

function pageBackground(ctx) {
  let bg = null;
  for (const r of ctx.rules) {
    if (mediaExcluded(r.media)) continue;
    if (!r.selectors.some((s) => /^(:root|html|body)$/.test(s.trim()))) continue;
    for (const d of r.decls) {
      if (d.prop === 'background-color' || d.prop === 'background') {
        const c = colorsIn(d.value)[0];
        if (c && c.a > 0.5) bg = c;
      }
    }
  }
  return bg;
}

const radialHalo = {
  id: 'radial-halo',
  why: 'A bright radial glow on a dark page — ambient decoration standing in for hierarchy.',
  fix: 'Remove the halo; separate the hero with type scale, space or a real image.',
  run(ctx, report) {
    const page = pageBackground(ctx);
    if (!page || luminance(page) >= 0.1) return;
    for (const r of ctx.rules) for (const d of r.decls) {
      if (!/^background(-image)?$/.test(d.prop) || !/radial-gradient\(/i.test(d.value) || /url\(/i.test(d.value)) continue;
      if (/\b(\d|1\d|2[0-4])px\b/.test(d.value.replace(/^[^,]*circle[^,]*,/, ''))) continue; // a tight px stop is a dot, not a halo
      const stops = colorsIn(d.value);
      if (stops.length < 2) continue;
      const first = stops[0];
      if (first.a >= 0.7 && spread(first) >= 24 && stops.slice(1).some((s) => s.a <= 0.05)) {
        report({ line: d.line, file: r.file, snippet: `${r.selectorText.trim()} { ${d.prop}: radial-gradient(…) }` });
      }
    }
  },
};

// Text painted by a clipped background (background-clip: text) takes its ink from that
// background, not from `color` (usually transparent). Gradient text is scan.sh's rule; the static
// contrast checks skip it rather than read the transparent colour as 1:1.
function clippedText(ctx, el) {
  for (let n = el; n && n.tag !== '#root'; n = n.parent) {
    if (!n.attrs) continue;
    const v = `${ctx.get(n, 'background-clip') || ''} ${ctx.get(n, '-webkit-background-clip') || ''}`;
    if (/\btext\b/.test(v)) return true;
  }
  return false;
}

function fgColor(ctx, el) {
  const v = ctx.get(el, 'color');
  return v ? parseColor(v) : null;
}

const lowContrast = {
  id: 'low-contrast',
  why: 'Text contrast is below WCAG AA against its background.',
  fix: 'Darken (or lighten) the text until it reaches 4.5:1 — 3:1 for text ≥ 24px or ≥ 18.7px bold.',
  kinds: ['html'],
  run(ctx, report) {
    for (const { el, text } of textElements(ctx)) {
      if (!/[\p{L}\p{N}]/u.test(text)) continue;
      if (clippedText(ctx, el)) continue;
      const fg = fgColor(ctx, el);
      if (!fg) continue;
      const { color: bg, stops, image } = backgroundBehind(ctx, el);
      if (image) continue; // text over an image: the browser pass measures it
      const px = ctx.fontPx(el);
      const weight = parseInt(ctx.get(el, 'font-weight') || '400', 10) || (ctx.get(el, 'font-weight') === 'bold' ? 700 : 400);
      const large = px >= 24 || (px >= 18.66 && weight >= 700);
      const need = large ? 3 : 4.5;
      const bgs = stops && stops.length ? stops.map((s) => over(s, bg)) : [bg];
      const worst = Math.min(...bgs.map((b) => contrast(over(fg, b), b)));
      if (worst < need) report({ el, message: `Contrast ${worst.toFixed(2)}:1 (needs ${need}:1) for ${Math.round(px)}px text.` });
    }
  },
};

const grayOnColour = {
  id: 'gray-on-colour',
  why: 'Neutral grey text on a saturated background looks washed out and muddy, even when contrast passes.',
  fix: 'Use a tint or shade of the background hue for secondary text, or plain white/near-black.',
  kinds: ['html'],
  run(ctx, report) {
    for (const { el } of textElements(ctx)) {
      if (clippedText(ctx, el)) continue;
      const fg = fgColor(ctx, el);
      if (!fg || spread(fg) >= 16) continue;
      const lum = luminance(fg);
      if (lum < 0.05 || lum > 0.85) continue;
      const { color: bg, stops, image } = backgroundBehind(ctx, el);
      if (image) continue;
      const bgs = stops && stops.length ? stops : [bg];
      if (bgs.every((b) => spread(b) >= 40)) report({ el, message: `Grey text on a coloured background.` });
    }
  },
};

const vivid = (c, lo, hi) => { const h = hslHue(c); return h != null && h >= lo && h <= hi && hslSat(c) >= 0.45 && spread(c) >= 70; };
// 250°, not 260°: the stock generated violet (#8b5cf6) sits at 258° (fixture --low-violet).
const isViolet = (c) => vivid(c, 250, 310);
const isCoolOrPink = (c) => vivid(c, 180, 250) || vivid(c, 311, 350);
const hex = (c) => '#' + [c.r, c.g, c.b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('');

const aiPalette = {
  id: 'ai-colour-palette',
  why: 'Violet on the headline, or a violet-to-blue/cyan/pink gradient: the palette generated pages fall back to when no colour was chosen.',
  fix: 'Derive the palette from the brief or brand; give large text the ink colour and keep one accent with a reason to be there.',
  run(ctx, report) {
    const gradient = (value, line, file) => {
      const stops = colorsIn(resolveGlobal(ctx, value)).filter((c) => c.a >= 0.3);
      const violets = stops.filter(isViolet);
      if (!violets.length) return;
      const v = violets[0];
      const o = stops.find((c) => c !== v && (isCoolOrPink(c) || isViolet(c)));
      if (o) report({ line, file, message: `Gradient ${v.src} → ${o.src}.` });
    };
    for (const r of ctx.rules) for (const d of r.decls) {
      if (!d.prop.startsWith('--') && /gradient\(/i.test(d.value)) gradient(d.value, d.line, r.file);
    }
    for (const el of ctx.elements) {
      if (!el.attrs.style || !/gradient\(/i.test(el.attrs.style)) continue;
      for (const d of parseDecls(el.attrs.style, el.line)) if (/gradient\(/i.test(d.value)) gradient(d.value, el.line);
    }
    // A violet that is the brand — it also paints the nav / header bar or a large solid surface,
    // or is the brand / primary token — is a choice, not the default palette. So is violet as one
    // of several category colours: sibling headings of one level, in one container, in three or
    // more hue families.
    const hueGap = (a, b) => { const d = Math.abs(a - b) % 360; return Math.min(d, 360 - d); };
    const brandHues = [];
    for (const t of tokenDecls(ctx)) {
      if (!/brand|primary/i.test(t.name)) continue;
      const c = parseColor(resolveGlobal(ctx, t.value).trim());
      if (c && spread(c) >= 40) brandHues.push(hslHue(c));
    }
    const surface = (c) => c && c.a >= 0.9 && spread(c) >= 40 && hslHue(c) != null;
    const SURFACE_SEL = /\b(nav|header|banner|navbar|topbar|top-bar|masthead|site-header|appbar|app-bar|hero|footer)\b/i;
    const slotHues = new Map();
    const violetHits = [];
    const large = (sel) => /(^|[\s>+~,(])h[1-3]\b|display|hero|headline/i.test(sel);
    if (ctx.kind === 'css') {
      for (const r of ctx.rules) {
        if (SURFACE_SEL.test(r.selectorText)) for (const d of r.decls) if (/^background(-color)?$/.test(d.prop)) {
          const c = parseColor(resolveGlobal(ctx, d.value).trim());
          if (surface(c)) brandHues.push(hslHue(c));
        }
        const fs = r.decls.find((d) => d.prop === 'font-size');
        const big = large(r.selectorText) || (fs && (parseFloat(fs.value) >= 24 && /px$/.test(fs.value) || parseFloat(fs.value) >= 1.5 && /rem$/.test(fs.value)));
        if (!big) continue;
        for (const d of r.decls) if (d.prop === 'color') {
          const c = parseColor(resolveGlobal(ctx, d.value));
          if (!c) continue;
          if (isViolet(c)) violetHits.push({ c, line: d.line, file: r.file, slot: null });
        }
      }
    } else {
      for (const el of ctx.elements) {
        const navish = /^(nav|header|footer|body|section)$/.test(el.tag) || /^(banner|navigation)$/.test(el.attrs.role || '') ||
          (el.children || []).some((k) => k.tag === 'nav');
        if (!navish || isHidden(ctx, el)) continue;
        const c = parseColor(ctx.get(el, 'background-color') || '');
        if (surface(c)) brandHues.push(hslHue(c));
      }
      for (const { el } of textElements(ctx)) {
        if (!/^h[1-3]$/.test(el.tag) && ctx.fontPx(el) < 24) continue;
        const v = ctx.get(el, 'color');
        const c = v && parseColor(v);
        if (!c) continue;
        const slot = `${ctx.elements.indexOf(el.parent)}>${el.tag}`;
        if (!slotHues.has(slot)) slotHues.set(slot, []);
        slotHues.get(slot).push(c);
        if (!isViolet(c)) continue;
        let line = el.line, file;
        for (let e = el; e && e.tag !== '#root'; e = e.parent) { const x = ctx.decl(e, 'color'); if (x && !x.ua) { line = x.src?.inline ? e.line : x.line; file = x.src?.inline ? undefined : x.src?.file; break; } }
        violetHits.push({ c, line, file, slot });
      }
    }
    const familyCount = (cs) => {
      const fam = [];
      for (const c of cs) {
        if (hslSat(c) < 0.45 || spread(c) < 70) continue;
        const h = hslHue(c);
        if (!fam.some((f) => hueGap(f, h) < 30)) fam.push(h);
      }
      return fam.length;
    };
    for (const { c, line, file, slot } of violetHits) {
      if (brandHues.some((b) => hueGap(b, hslHue(c)) <= 15)) continue;
      if (slot && familyCount(slotHues.get(slot)) >= 3) continue;
      report({ line, file, message: `Violet ${hex(c)} on large text.` });
    }
  },
};

const ROOT_BASE = /^(:root|html|body)$/;
const pure = (c) => c && c.a >= 0.99 && ((c.r >= 254.5 && c.g >= 254.5 && c.b >= 254.5) || (c.r <= 0.5 && c.g <= 0.5 && c.b <= 0.5));

const pureBase = {
  id: 'pure-black-white-base',
  why: 'The page base is pure #fff or #000. Untinted extremes read as a default rather than a choice; paper and ink are usually better a step off.',
  fix: 'Tint the base toward the palette\'s hue (an off-white paper, a near-black ink); keep pure white or black for small marks if at all.',
  run(ctx, report) {
    const last = { bg: null, ink: null };
    for (const pass of ['html', 'body']) {
      for (const r of ctx.rules) {
        if (mediaExcluded(r.media) || !r.selectors.some((s) => ROOT_BASE.test(s.trim()))) continue;
        const isBody = r.selectors.some((s) => s.trim() === 'body');
        if ((pass === 'body') !== isBody) continue;
        for (const d of r.decls) {
          if (d.prop === 'color') last.ink = { d, r };
          if ((d.prop === 'background-color' || d.prop === 'background') && !/(gradient|url|image-set)\(/i.test(d.value)) last.bg = { d, r };
        }
      }
    }
    for (const [kind, hit] of Object.entries(last)) {
      if (!hit) continue;
      const c = parseColor(resolveGlobal(ctx, hit.d.value).trim());
      if (pure(c)) report({ line: hit.d.line, file: hit.r.file, message: `Page ${kind === 'bg' ? 'background' : 'ink'} is ${c.r > 127 ? 'pure white' : 'pure black'} (${hit.d.value}).` });
    }
  },
};

const zeroChroma = {
  id: 'zero-chroma-neutrals',
  why: 'Every neutral token is a dead grey with no hue at all, so surfaces and text feel unrelated to the accent.',
  fix: 'Tint the neutral ramp slightly toward the anchor hue (a chroma of a few points is enough).',
  run(ctx, report) {
    const neutrals = [];
    for (const t of tokenDecls(ctx)) {
      const c = parseColor(resolveGlobal(ctx, t.value).trim());
      if (!c || c.a < 0.99 || spread(c) > 24 || pure(c)) continue;
      neutrals.push({ ...t, c });
    }
    if (neutrals.length < 3 || !neutrals.every((n) => spread(n.c) <= 1)) return;
    report({ line: neutrals[0].line, file: neutrals[0].file, message: `${neutrals.length} neutral tokens, all untinted (${neutrals.slice(0, 4).map((n) => n.name).join(', ')}…).` });
  },
};

export default [radialHalo, lowContrast, grayOnColour, aiPalette, pureBase, zeroChroma];
