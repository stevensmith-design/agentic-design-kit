import { HEADINGS, textElements, isUppercase, emValue, isHidden, norm, ownText, elementChildren } from '../lib/util.mjs';
import { prevElementSibling, closest, textOf } from '../lib/html.mjs';
import { parseDecls, splitTopLevel } from '../lib/css.mjs';
import { toPx } from '../lib/cascade.mjs';
import { resolveGlobal, rootishRule } from '../lib/tokens.mjs';

const INTERACTIVE = new Set(['a', 'button', 'label', 'input', 'select', 'option', 'summary', 'textarea']);
const SKIP_SIZE = new Set(['sup', 'sub', 'code', 'kbd', 'samp', 'pre']);

function isLegal(el) {
  if (el.tag === 'small') return true;
  return !!closest(el, (e) => e.tag === 'footer' || e.tag === 'small' || /legal|fine-?print|copyright|disclaimer/i.test(e.attrs.class || '')) ||
    /legal|fine-?print|copyright|disclaimer/i.test(el.attrs.class || '');
}

const undersized = {
  id: 'undersized-text',
  why: 'Text is set below a readable floor.',
  fix: 'Raise it to at least 11px for controls and labels (12px+ for running text); shrink with weight or colour, not size.',
  kinds: ['html'],
  run(ctx, report) {
    for (const { el, text } of textElements(ctx)) {
      if (SKIP_SIZE.has(el.tag) || closest(el, (e) => SKIP_SIZE.has(e.tag))) continue;
      const px = ctx.fontPx(el);
      const floor = isLegal(el) ? 10 : 11;
      const interactive = INTERACTIVE.has(el.tag) || !!closest(el, (e) => INTERACTIVE.has(e.tag));
      if (px < floor - 0.1) {
        report({ el, severity: 'error', message: `${interactive ? 'Interactive' : 'Content'} text at ${+px.toFixed(1)}px is below the ${floor}px floor.` });
      } else if (!interactive && text.length > 20 && px < 12 - 0.1 && !isLegal(el)) {
        report({ el, severity: 'warning', message: `Running text at ${+px.toFixed(1)}px is too small to read comfortably (12px minimum).` });
      }
    }
  },
};

const flatHierarchy = {
  id: 'flat-type-hierarchy',
  why: 'Every text size sits within a narrow band, so nothing reads as more important than anything else.',
  fix: 'Widen the scale: the largest text should be at least twice the smallest; use fewer, further-apart sizes.',
  kinds: ['html'],
  run(ctx, report) {
    const els = textElements(ctx);
    const sizes = new Set(els.map(({ el }) => Math.round(ctx.fontPx(el) * 2) / 2));
    if (sizes.size < 3) return;
    const max = Math.max(...sizes), min = Math.min(...sizes);
    if (max / min >= 2.0) return;
    const anchor = els.find(({ el }) => HEADINGS.has(el.tag)) || els[0];
    report({ el: anchor.el, message: `${sizes.size} text sizes span only ${min}–${max}px (ratio ${(max / min).toFixed(2)}; needs ≥ 2.0).` });
  },
};

const italicDisplay = {
  id: 'italic-display',
  why: 'An italic display headline — the default "editorial" move that most generated pages reach for.',
  fix: 'Set the headline upright; keep italic for emphasis inside running text.',
  kinds: ['html'],
  run(ctx, report) {
    for (const { el } of textElements(ctx)) {
      const px = ctx.fontPx(el);
      if (['em', 'i', 'cite', 'q', 'blockquote'].includes(el.tag)) {
        // Emphasis in running text is fine. An italic word inside a display heading is the
        // accent-word version of the same move (fixture --accent-word), unless the heading
        // is italic as a whole, which the heading itself reports.
        if (!['em', 'i'].includes(el.tag)) continue;
        let head = null;
        for (let n = el.parent; n && n.tag !== '#root'; n = n.parent) if (/^h[1-3]$/.test(n.tag)) { head = n; break; }
        if (!head || ctx.fontPx(head) < 32) continue;
        if (/italic|oblique/.test(ctx.get(head, 'font-style') || '')) continue;
        if (!/italic|oblique/.test(ctx.get(el, 'font-style') || '')) continue;
        report({ el, message: `Italic accent word inside a ${Math.round(ctx.fontPx(head))}px <${head.tag}>.` });
        continue;
      }
      const display = (['h1', 'h2', 'h3'].includes(el.tag) && px >= 24) || px >= 32;
      if (!display) continue;
      if (!/italic|oblique/.test(ctx.get(el, 'font-style') || '')) continue;
      report({ el, message: `Italic ${el.tag} at ${Math.round(ctx.fontPx(el))}px.` });
    }
  },
};

const crushed = {
  id: 'crushed-tracking',
  why: 'Letter-spacing is pulled so tight that characters start to touch.',
  fix: 'Keep negative tracking above −0.05em; large display type rarely needs more than −0.03em.',
  kinds: ['html'],
  run(ctx, report) {
    for (const { el, text } of textElements(ctx)) {
      if (text.length <= 20) continue;
      const em = emValue(ctx, el, 'letter-spacing');
      if (em != null && em <= -0.05) report({ el, message: `letter-spacing ${em.toFixed(3)}em on ${text.length} characters.` });
    }
  },
};

const wide = {
  id: 'wide-tracking',
  why: 'Running text is letter-spaced; tracking breaks word shapes and slows reading.',
  fix: 'Keep body tracking at 0–0.02em; reserve wide tracking for short uppercase labels.',
  kinds: ['html'],
  run(ctx, report) {
    for (const { el, text } of textElements(ctx)) {
      if (text.length <= 20 || HEADINGS.has(el.tag) || ctx.fontPx(el) >= 24) continue;
      if (isUppercase(ctx, el, text)) continue;
      const em = emValue(ctx, el, 'letter-spacing');
      if (em != null && em > 0.05) report({ el, message: `letter-spacing ${em.toFixed(3)}em on body text.` });
    }
  },
};

const tightLeading = {
  id: 'tight-leading',
  why: 'Multi-line text with leading this tight makes lines collide and the eye lose its row.',
  fix: 'Use line-height 1.4–1.7 for running text; tighten only headings.',
  kinds: ['html'],
  run(ctx, report) {
    for (const { el, text } of textElements(ctx)) {
      if (text.length <= 50 || HEADINGS.has(el.tag) || ctx.fontPx(el) >= 28) continue;
      const lh = ctx.px(el, 'line-height');
      const fs = ctx.fontPx(el);
      if (lh != null && fs > 0 && lh / fs < 1.3) report({ el, message: `line-height ${(lh / fs).toFixed(2)} on running text.` });
    }
  },
};

const GENERIC = new Set(['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-sans-serif',
  'ui-serif', 'ui-monospace', 'ui-rounded', 'math', 'emoji', 'fangsong', 'inherit', 'initial', 'unset', 'revert',
  '-apple-system', 'blinkmacsystemfont']);

export function firstFamily(value) {
  if (!value || /var\(/.test(value)) return null;
  const f = value.split(',')[0].trim().replace(/^['"]|['"]$/g, '').toLowerCase();
  return f && !GENERIC.has(f) ? f : null;
}

const tooManyFamilies = {
  id: 'too-many-families',
  why: 'More than three type families are in use; the page loses a typographic voice.',
  fix: 'Settle on a display face, a text face and (optionally) one mono or accent face.',
  run(ctx, report) {
    const seen = new Map();
    for (const r of ctx.rules) for (const d of r.decls) {
      if (d.prop !== 'font-family') continue;
      const f = firstFamily(d.value);
      if (f && !seen.has(f)) seen.set(f, { line: d.line, file: r.file });
    }
    if (seen.size <= 3) return;
    const [, at] = [...seen.entries()][3];
    report({ line: at.line, file: at.file, message: `${seen.size} families: ${[...seen.keys()].join(', ')}.` });
  },
};

const DATE = /^(\d{4}|\d{1,2}[./-]\d{1,2}([./-]\d{2,4})?|[A-Za-z]{3,9}\.? \d{1,2},? \d{4}|\d{1,2} [A-Za-z]{3,9}\.? \d{4})$/;

const kicker = {
  id: 'kicker-above-heading',
  why: 'A small tracked uppercase label sits above a section heading — the most common generated-page tell. The heading should carry the section on its own.',
  fix: 'Delete the label, or fold its meaning into the heading. Keep a label only when it is real navigation (a step number, a date).',
  kinds: ['html'],
  run(ctx, report) {
    for (const h of ctx.elements) {
      if (!['h2', 'h3', 'h4'].includes(h.tag) || isHidden(ctx, h)) continue;
      const hp = ctx.fontPx(h);
      if (hp < 20) continue;
      const lab = prevElementSibling(h);
      if (!lab || !['p', 'span', 'div', 'small'].includes(lab.tag)) continue;
      if (elementChildren(lab).some((c) => !['span', 'em', 'strong', 'b'].includes(c.tag))) continue;
      const text = norm(lab.children.map((c) => (c.tag === '#text' ? c.text : '')).join('') || ownText(lab));
      const full = norm(lab.children.map((c) => (c.tag === '#text' ? c.text : (c.children || []).map((x) => x.text || '').join(''))).join(''));
      const t = full || text;
      if (t.length < 2 || t.length > 34) continue;
      if (/^step\s*\d+/i.test(t) || /^\d{1,2}$/.test(t) || DATE.test(t)) continue;
      if (!isUppercase(ctx, lab, t)) continue;
      const lp = ctx.fontPx(lab);
      if (lp > Math.max(14, Math.min(0.45 * hp, 16))) continue;
      const ls = emValue(ctx, lab, 'letter-spacing');
      if (ls == null || ls < 0.06) continue;
      report({ el: lab, message: `Kicker "${t}" above <${h.tag}>.` });
    }
  },
};

const ICONISH = new Set(['svg', 'img', 'i']);
function nextElementSibling(node) {
  const sibs = node.parent.children;
  for (let k = sibs.indexOf(node) + 1; k < sibs.length; k++) {
    const s = sibs[k];
    if (s.tag === '#text') { if (s.text.trim()) return null; continue; }
    return s;
  }
  return null;
}
function hasIcon(el) {
  for (const c of el.children || []) {
    if (c.tag === '#text') {
      const t = c.text.trim();
      if (!t) continue;
      // An emoji alone in the tile is the icon (fixture --emoji); any other text is a label.
      if (/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+$/u.test(t)) return true;
      return false;
    }
    if (ICONISH.has(c.tag)) return true;
    if (hasIcon(c)) return true;
  }
  return false;
}

const iconTile = {
  id: 'icon-tile-stack',
  why: 'An icon in a rounded tinted square stacked on a heading — the stock feature-card shape.',
  fix: 'Drop the tile; if the icon earns its place, set it inline with the heading or let the heading stand alone.',
  kinds: ['html'],
  run(ctx, report) {
    for (const el of ctx.elements) {
      if (!['div', 'span', 'figure'].includes(el.tag) || isHidden(ctx, el)) continue;
      const w = ctx.px(el, 'width'), h = ctx.px(el, 'height');
      if (w == null || h == null || w < 32 || w > 128 || h < 32 || h > 128) continue;
      if (w / h < 0.7 || w / h > 1.4) continue;
      const bg = ctx.get(el, 'background-color') || ctx.get(el, 'background-image');
      const bordered = ['top', 'right', 'bottom', 'left'].some((s) => ctx.get(el, `border-${s}-style`) && !/none/.test(ctx.get(el, `border-${s}-style`)));
      if (!bg && !bordered) continue;
      const rad = ctx.get(el, 'border-radius') || '';
      if (/%/.test(rad) ? parseFloat(rad) >= 50 : (ctx.px(el, 'border-radius') ?? 0) >= Math.min(w, h) / 2) continue;
      if (!hasIcon(el)) continue;
      const next = nextElementSibling(el);
      if (!next || !/^h[1-6]$/.test(next.tag)) continue;
      report({ el, message: `${Math.round(w)}×${Math.round(h)}px icon tile above <${next.tag}>.` });
    }
  },
};

const DISPLAY_SEL = /(^|[\s>+~,(])h[1-3]\b|display|hero|headline|title/i;

const outlierOveruse = {
  id: 'outlier-font-overuse',
  why: 'A third family (often a mono or a script) is spread across many rules; an accent face stops being an accent once it is everywhere.',
  fix: 'Keep the outlier to one or two jobs (code, a single label style); set everything else in the display or body face.',
  run(ctx, report) {
    const uses = new Map();
    let body = null;
    const display = new Map();
    for (const r of ctx.rules) for (const d of r.decls) {
      if (d.prop !== 'font-family' && d.prop !== 'font') continue;
      let v = resolveGlobal(ctx, d.value);
      if (d.prop === 'font') { const m = /[\d.]+(?:px|rem|em|%|pt)(?:\s*\/\s*\S+)?\s+(.+)$/.exec(v); if (!m) continue; v = m[1]; }
      const f = firstFamily(v);
      if (!f) continue;
      if (!uses.has(f)) uses.set(f, []);
      uses.get(f).push({ line: d.line, file: r.file });
      if (!body && rootishRule(r)) body = f;
      if (!rootishRule(r) && DISPLAY_SEL.test(r.selectorText)) display.set(f, (display.get(f) || 0) + 1);
    }
    if (uses.size < 3) return;
    const byUse = [...uses.keys()].sort((a, b) => uses.get(b).length - uses.get(a).length);
    if (!body) body = byUse[0];
    let disp = [...display.entries()].filter(([f]) => f !== body).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (!disp) disp = byUse.find((f) => f !== body);
    for (const [f, list] of uses) {
      if (f === body || f === disp || list.length <= 2) continue;
      report({ line: list[2].line, file: list[2].file, message: `"${f}" is set in ${list.length} rules (display "${disp}", body "${body}").` });
    }
  },
};

function overflowWrapped(ctx, el) {
  const ok = (d) => (/^(overflow-wrap|word-wrap)$/.test(d.prop) && /anywhere|break-word/i.test(d.value)) ||
    (d.prop === 'word-break' && /break-word|break-all/i.test(d.value));
  for (let e = el; e && e.tag !== '#root'; e = e.parent) {
    if (e.attrs?.style && parseDecls(e.attrs.style, e.line).some(ok)) return true;
    if (ctx.matching(e, (pr) => !pr.parsed.states.size && !pr.parsed.pseudoEl).some((pr) => pr.rule.decls.some(ok))) return true;
  }
  return false;
}

const displayNoWrap = {
  id: 'display-no-overflow-wrap',
  why: 'A display heading has no overflow-wrap, so one long word can push the page sideways on a narrow screen.',
  fix: 'Add overflow-wrap: anywhere (or break-word) to display headings.',
  kinds: ['html'],
  run(ctx, report) {
    for (const el of ctx.elements) {
      if (!HEADINGS.has(el.tag) || isHidden(ctx, el)) continue;
      const px = ctx.fontPx(el);
      if (px < 48) continue;
      // The smallest size it reaches: a clamp()'s lower bound, else the desktop size.
      const raw = ctx.get(el, 'font-size') || '';
      const lo = /^clamp\(/i.test(raw) ? toPx(splitTopLevel(raw.slice(6, -1), ',')[0].trim(), px, 16) : null;
      const minPx = lo ?? px;
      const longest = Math.max(...norm(textOf(el)).split(/\s+/).map((w) => w.length));
      // A word narrower than a 320px viewport less two 16px gutters cannot overflow.
      if (longest * 0.6 * minPx <= 288) continue;
      if (overflowWrapped(ctx, el)) continue;
      report({ el, message: `<${el.tag}> at ${Math.round(px)}px with a ${longest}-character word and no overflow-wrap.` });
    }
  },
};

export default [undersized, flatHierarchy, italicDisplay, crushed, wide, tightLeading, tooManyFamilies, kicker, iconTile, outlierOveruse, displayNoWrap];
