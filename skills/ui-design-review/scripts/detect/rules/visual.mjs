import { parseColor, spread } from '../lib/color.mjs';
import { borderWidthPx, radiusPx, isHidden } from '../lib/util.mjs';

const gridLines = {
  id: 'grid-line-background',
  why: 'A hairline grid painted behind the page as texture — a stock "technical" backdrop that carries no information.',
  fix: 'Remove it, or make the grid real: align content to it and let it explain something.',
  run(ctx, report) {
    for (const r of ctx.rules) for (const d of r.decls) {
      if (!/^background(-image)?$/.test(d.prop)) continue;
      const hits = (d.value.match(/\b([0-2](?:\.\d+)?)px\s*,\s*transparent\s+\1px/gi) || []).length;
      const sized = r.decls.some((x) => x.prop === 'background-size') || /\/\s*\d/.test(d.value);
      if (hits >= 2 && sized) report({ line: d.line, file: r.file, snippet: `${r.selectorText.trim()} { ${d.prop}: … }` });
    }
  },
};

const stripes = {
  id: 'repeating-stripes',
  why: 'Repeating stripes fill an empty area as texture — a placeholder look that signals nothing is there.',
  fix: 'Give the empty state content (what goes here, how to start), or leave the surface plain.',
  run(ctx, report) {
    for (const r of ctx.rules) for (const d of r.decls) {
      if (!/^background(-image)?$/.test(d.prop)) continue;
      if (/repeating-(linear|conic)-gradient\(/i.test(d.value)) report({ line: d.line, file: r.file, snippet: `${r.selectorText.trim()} { ${d.prop}: … }` });
    }
  },
};

const borderAccent = {
  id: 'border-accent-on-rounded',
  why: 'A thick coloured top or bottom border on a rounded box — the accent stripe fights the radius and reads as a template card.',
  fix: 'Drop the stripe; carry status or category with a label, icon or a tinted surface instead.',
  kinds: ['html'],
  run(ctx, report) {
    for (const el of ctx.elements) {
      if (isHidden(ctx, el) || radiusPx(ctx, el) <= 0) continue;
      const w = Object.fromEntries(['top', 'right', 'bottom', 'left'].map((s) => [s, borderWidthPx(ctx, el, s)]));
      for (const side of ['top', 'bottom']) {
        if (w[side] < 2) continue;
        const others = ['top', 'right', 'bottom', 'left'].filter((s) => s !== side).map((s) => w[s]);
        const maxOther = Math.max(...others);
        if (!(maxOther <= 1 || w[side] >= 2 * maxOther)) continue;
        const c = parseColor(ctx.get(el, `border-${side}-color`) || '');
        if (!c || spread(c) < 30) continue;
        report({ el, snippet: `<${el.tag} class="${el.attrs.class || ''}"> border-${side}: ${w[side]}px` });
      }
    }
  },
};

export default [gridLines, stripes, borderAccent];
