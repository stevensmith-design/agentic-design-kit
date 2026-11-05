#!/usr/bin/env node
// ui-design-review — rendered (composited) contrast measurement
//
// `validate-tokens.py` checks the pairs a design system DECLARES. It cannot check the pairs a
// page actually COMPOSES: ink set on a violet card, translucent text over a gradient, a label
// on an image. Those ratios exist only once the pixels are stacked, and they are where real
// accessibility failures hide — a system whose every declared pair passes can still ship body
// copy at 3.8:1 because nobody composed that combination on purpose.
//
// Method: for each text node, walk up the ancestor chain compositing every non-transparent
// background (including each gradient's extreme stops) until an opaque layer is reached, then
// alpha-composite the text colour and compare. Gradients are sampled at both declared extremes
// and the WORST ratio is reported, because a ratio that only passes at one end of a gradient
// does not pass.
//
// The WCAG large-text exception is applied strictly: ≥24px regular, or ≥18.66px when the
// computed weight is ≥700. Bold alone is not large (visual-checklist.md §0).
//
// Usage:
//   node measure-contrast.mjs <file-or-url> [--selector <css>] [--width 1280] [--mobile]
//                             [--min 4.5] [--json]
//
// Exit codes: 0 = every measured text node clears its threshold, 1 = at least one does not,
//             2 = could not measure (never report 2 as a pass).

import { render, parseCommonArgs, failUnmeasurable } from './cdp.mjs';

const DEFAULT_SELECTOR = '[data-contrast]';
// Text-bearing elements worth sweeping when nothing is annotated.
const FALLBACK_SELECTOR = 'p,li,h1,h2,h3,h4,h5,h6,a,button,label,span,td,th,figcaption,summary';

function probe(selector, fallbackSelector) {
  const num = (v) => parseFloat(v) || 0;

  const parseColor = (str) => {
    const m = String(str).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(',').map((x) => parseFloat(x.trim()));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };

  const over = (fg, bg) => {
    const a = fg.a + bg.a * (1 - fg.a);
    if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
    return {
      r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a,
      g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a,
      b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a,
      a,
    };
  };

  const lum = ({ r, g, b }) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };

  const ratio = (c1, c2) => {
    const l1 = lum(c1), l2 = lum(c2);
    const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
  };

  // Every colour stop in a gradient, so we can test the worst case rather than an average.
  const gradientStops = (bgImage) => {
    if (!bgImage || bgImage === 'none' || !/gradient/.test(bgImage)) return [];
    const out = [];
    const re = /rgba?\([^)]+\)/g;
    let m;
    while ((m = re.exec(bgImage))) {
      const c = parseColor(m[0]);
      if (c) out.push(c);
    }
    return out;
  };

  // Composite the backdrop behind `el`. Returns an array of candidate backdrops (more than one
  // when a gradient is involved) so the caller can take the worst.
  const backdrops = (el) => {
    let stacks = [{ r: 0, g: 0, b: 0, a: 0 }];
    let node = el;
    while (node && node !== document.documentElement.parentNode) {
      const cs = getComputedStyle(node);
      const stops = gradientStops(cs.backgroundImage);
      const solid = parseColor(cs.backgroundColor);

      if (stops.length) {
        const next = [];
        for (const s of stacks) for (const stop of stops) next.push(over(s, stop));
        stacks = next;
      }
      if (solid && solid.a > 0) {
        stacks = stacks.map((s) => over(s, solid));
      }
      if (stacks.every((s) => s.a >= 0.999)) break;
      node = node.parentElement;
    }
    // Anything still translucent sits on the canvas; assume white as the final backstop.
    return stacks.map((s) => over(s, { r: 255, g: 255, b: 255, a: 1 }));
  };

  let nodes = Array.from(document.querySelectorAll(selector));
  let usedFallback = false;
  if (!nodes.length) {
    nodes = Array.from(document.querySelectorAll(fallbackSelector));
    usedFallback = true;
  }

  const out = [];
  const seen = new Set();
  for (const el of nodes) {
    // Only elements with their own visible text; a wrapper's text belongs to its children.
    const own = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join(' ')
      .trim();
    if (!own) continue;

    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || num(cs.opacity) === 0) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;

    const fg = parseColor(cs.color);
    if (!fg) continue;

    const size = num(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    // WCAG: large = >=24px, or >=18.66px when bold. Bold alone is NOT large.
    const isLarge = size >= 24 || (size >= 18.66 && weight >= 700);
    const threshold = isLarge ? 3 : 4.5;

    let worst = Infinity;
    let worstBg = null;
    for (const bg of backdrops(el)) {
      const composed = over(fg, bg);       // honour translucent text
      const r = ratio(composed, bg);
      if (r < worst) { worst = r; worstBg = bg; }
    }

    const rgb = (c) => `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;
    let id = el.tagName.toLowerCase();
    if (el.id) id += '#' + el.id;
    else if (el.className && typeof el.className === 'string' && el.className.trim()) {
      id += '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.');
    }
    const key = id + '|' + own.slice(0, 40);
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({
      id,
      text: own.length > 48 ? own.slice(0, 45) + '…' : own,
      fontSize: size,
      fontWeight: weight,
      isLarge,
      threshold,
      ratio: Math.round(worst * 100) / 100,
      color: rgb(fg),
      backdrop: worstBg ? rgb(worstBg) : null,
      gradient: /gradient/.test(getComputedStyle(el).backgroundImage)
        || /gradient/.test(el.parentElement ? getComputedStyle(el.parentElement).backgroundImage : 'none'),
    });
  }
  return { usedFallback, records: out };
}

const opts = parseCommonArgs(process.argv.slice(2), { min: null });
for (let i = 0; i < process.argv.length; i++) {
  if (process.argv[i] === '--min') opts.min = Number(process.argv[i + 1]);
}
if (!opts.target) {
  console.error('usage: measure-contrast.mjs <file-or-url> [--selector <css>] [--min 4.5] [--json]');
  process.exit(2);
}

let result;
try {
  result = await render({
    target: opts.target,
    probe,
    args: [opts.selector || DEFAULT_SELECTOR, FALLBACK_SELECTOR],
    width: opts.width, height: opts.height, mobile: opts.mobile,
  });
} catch (err) {
  failUnmeasurable(err, 'measure-contrast');
}

const { usedFallback, records } = result;

if (opts.json) {
  console.log(JSON.stringify({ usedFallback, records }, null, 2));
}

if (!records.length) {
  if (!opts.json) {
    console.log('measure-contrast: no text nodes matched.');
    console.log('  Pass --selector, or add data-contrast to the text under review.');
  }
  process.exit(0);
}

let failures = 0;
for (const r of records) {
  const need = opts.min != null ? opts.min : r.threshold;
  if (r.ratio >= need) continue;
  failures++;
  if (opts.json) continue;
  console.log('');
  console.log(`  ✘ ${r.id} — ${r.ratio}:1 (needs ${need}:1)`);
  console.log(`      "${r.text}"`);
  console.log(`      ${r.color} on ${r.backdrop}${r.gradient ? ' (worst gradient stop)' : ''}`);
  console.log(`      ${r.fontSize}px / weight ${r.fontWeight}${r.isLarge ? ' — WCAG large, 3:1 applies' : ''}`);
}

if (!opts.json) {
  console.log('');
  console.log('  ' + '-'.repeat(40));
  if (usedFallback) console.log('  (no [data-contrast] match — swept common text elements instead)');
  if (failures) {
    console.log(`  ✘ ${failures} of ${records.length} text node(s) below the contrast floor.`);
  } else {
    console.log(`  ✔ ${records.length} text node(s): composited contrast clears the floor.`);
  }
}

process.exit(failures ? 1 : 0);
