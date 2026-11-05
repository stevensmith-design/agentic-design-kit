import { splitTopLevel } from '../lib/css.mjs';
import { decl } from '../lib/util.mjs';

const TIME = /^-?[\d.]+m?s$/i;
const EASE = /^(ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end|steps\(.*\)|cubic-bezier\(.*\)|linear\(.*\))$/i;

// Property names a transition value animates ('all' when none is named).
export function transitionProps(value) {
  const props = [];
  for (const seg of splitTopLevel(value, ',')) {
    const toks = splitTopLevel(seg.trim(), ' ').map((t) => t.trim()).filter(Boolean);
    const prop = toks.find((t) => !TIME.test(t) && !EASE.test(t) && !/^(normal|allow-discrete)$/i.test(t));
    props.push((prop || 'all').toLowerCase());
  }
  return props;
}

const transitionAll = {
  id: 'transition-all',
  why: 'transition: all animates every property that ever changes, including layout ones, and hides which change was meant to move.',
  fix: 'Name the properties that should move (e.g. background-color, color, transform, opacity).',
  run(ctx, report) {
    for (const r of ctx.rules) for (const d of r.decls) {
      if (d.prop !== 'transition' && d.prop !== 'transition-property') continue;
      if (d.prop === 'transition-property' ? /(^|,)\s*all\s*(,|$)/i.test(d.value) : transitionProps(d.value).includes('all')) {
        report({ line: d.line, file: r.file, snippet: `${r.selectorText.trim()} { ${d.prop}: ${d.value} }` });
      }
    }
  },
};

const FOCUS = /:focus(-visible|-within)?\b/;
const RING = /^(outline|outline-color|outline-width|outline-offset|outline-style|box-shadow)$/;

const focusRingFades = {
  id: 'focus-ring-fades',
  why: 'The focus indicator is transitioned, so it fades in; a keyboard user loses their place for the length of the animation.',
  fix: 'Exclude outline and box-shadow from the transition so the focus ring appears instantly.',
  run(ctx, report) {
    const ringRules = ctx.rules.filter((r) => r.selectors.some((s) => FOCUS.test(s)) && r.decls.some((d) => RING.test(d.prop)));
    if (!ringRules.length) return;
    for (const fr of ringRules) {
      const bases = new Set(fr.selectors.filter((s) => FOCUS.test(s)).map((s) => s.replace(/:focus(-visible|-within)?\b/g, '').trim()));
      bases.forEach((b) => bases.add(b));
      for (const r of ctx.rules) {
        const same = r === fr || r.selectors.some((s) => bases.has(s.trim()));
        if (!same) continue;
        for (const d of r.decls) {
          if (d.prop !== 'transition' && d.prop !== 'transition-property') continue;
          const props = d.prop === 'transition' ? transitionProps(d.value) : d.value.split(',').map((x) => x.trim().toLowerCase());
          // only the properties the focus rule actually draws its ring with
          const ringProps = new Set(fr.decls.filter((x) => RING.test(x.prop)).map((x) => (x.prop.startsWith('outline') ? 'outline' : x.prop)));
          const family = (p) => (p.startsWith('outline') ? 'outline' : p);
          if (props.some((p) => p === 'all' || ringProps.has(family(p)))) {
            report({ line: d.line, file: r.file, snippet: `${r.selectorText.trim()} { ${d.prop}: ${d.value} }` });
          }
        }
      }
    }
  },
};

function animationNames(rule, ctx) {
  const vals = rule.decls.filter((d) => d.prop === 'animation' || d.prop === 'animation-name').map((d) => d.value);
  const names = [];
  for (const v of vals) for (const seg of splitTopLevel(v, ',')) {
    for (const t of seg.trim().split(/\s+/)) if (ctx.keyframes[t]) names.push(t);
  }
  return names;
}

function isInfinite(rule) {
  return rule.decls.some((d) => (d.prop === 'animation' && /\binfinite\b/i.test(d.value)) ||
    (d.prop === 'animation-iteration-count' && /\binfinite\b/i.test(d.value)));
}

function reducedMotionOnly(rule) { return (rule.media || []).some((m) => /prefers-reduced-motion\s*:\s*reduce/i.test(m)); }

function pxOf(v) {
  const m = /^([\d.]+)px$/.exec((v || '').trim());
  if (m) return parseFloat(m[1]);
  const r = /^([\d.]+)rem$/.exec((v || '').trim());
  return r ? parseFloat(r[1]) * 16 : null;
}

const pulsingDot = {
  id: 'pulsing-dot',
  why: 'A small dot pulses forever — a "live" signal on status that is not changing. It reads as decoration and pulls the eye from the content.',
  fix: 'Keep the dot static; animate it once when the status actually changes, or not at all.',
  run(ctx, report) {
    for (const r of ctx.rules) {
      if (reducedMotionOnly(r) || !isInfinite(r)) continue;
      const names = animationNames(r, ctx);
      const pulses = names.some((n) => /pulse|ping|blink|beat|glow|breath/i.test(n) ||
        /\b(opacity|box-shadow)\s*:|scale\(|\bscale\s*:/i.test(ctx.keyframes[n].text));
      if (!pulses) continue;
      const w = pxOf(decl(r, 'width')?.value) ?? pxOf(decl(r, 'inline-size')?.value);
      const h = pxOf(decl(r, 'height')?.value) ?? pxOf(decl(r, 'block-size')?.value) ?? w;
      if (w == null || h == null || w < 2 || w > 16 || h < 2 || h > 16) continue;
      const rad = decl(r, 'border-radius')?.value || '';
      const round = /%/.test(rad) ? parseFloat(rad) >= 40 : (pxOf(rad) ?? 0) >= 0.4 * Math.min(w, h);
      if (!round) continue;
      const inChrome = /\b(header|nav)\b/i.test(r.selectorText);
      const line = r.decls.find((d) => /^animation/.test(d.prop))?.line ?? r.line;
      report({ line, file: r.file, severity: inChrome ? 'error' : undefined, snippet: r.selectorText.trim() });
    }
  },
};

const marquee = {
  id: 'marquee',
  why: 'Content scrolls sideways on a loop with no pause — hard to read, impossible to stop, and a reflex "logo wall" move.',
  fix: 'Show the items statically (a wrapped row or grid); if motion is kept, it must pause on hover/focus and stop under reduced motion.',
  run(ctx, report) {
    for (const el of ctx.elements) if (el.tag === 'marquee') report({ el, line: el.line });
    for (const r of ctx.rules) {
      if (reducedMotionOnly(r) || !isInfinite(r)) continue;
      for (const n of animationNames(r, ctx)) {
        const text = ctx.keyframes[n].text;
        const m = [...text.matchAll(/translate(?:X|3d)?\(\s*(-?[\d.]+)%/gi)].map((x) => Math.abs(parseFloat(x[1])));
        if (m.some((v) => v >= 20)) {
          const line = r.decls.find((d) => /^animation/.test(d.prop))?.line ?? r.line;
          report({ line, file: r.file, snippet: r.selectorText.trim() });
          break;
        }
      }
    }
  },
};

const HOVER_KIND = [
  ['movement', /^(transform|translate|scale|rotate|top|left|margin(-\w+)?)$/],
  ['shadow', /^(box-shadow|text-shadow)$/],
  ['background', /^background(-color|-image)?$/],
  ['colour', /^color$/],
  ['border', /^(border(-[\w-]+)?|outline(-[\w-]+)?)$/],
];

const stackedHover = {
  id: 'stacked-hover-effects',
  why: 'One hover changes several things at once (lift, shadow, fill, colour, border); the effects compete and the element jumps rather than responds.',
  fix: 'Pick the one change that signals "this is interactive" and drop the rest.',
  run(ctx, report) {
    for (const r of ctx.rules) {
      if (!r.selectors.some((s) => /:hover\b/.test(s))) continue;
      const kinds = new Set();
      for (const d of r.decls) {
        if (d.prop === 'filter' && /drop-shadow\(/i.test(d.value)) { kinds.add('shadow'); continue; }
        for (const [k, re] of HOVER_KIND) if (re.test(d.prop)) kinds.add(k);
      }
      if (kinds.size >= 3) report({ line: r.line, file: r.file, message: `${r.selectorText.trim()} changes ${[...kinds].join(', ')} on hover.` });
    }
  },
};

export default [transitionAll, focusRingFades, pulsingDot, marquee, stackedHover];
