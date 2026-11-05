import { isCardLike, isHidden, textOf, norm, textElements, elementChildren } from '../lib/util.mjs';
import { toPx, mediaExcluded } from '../lib/cascade.mjs';
import { splitTopLevel } from '../lib/css.mjs';
import { resolveGlobal } from '../lib/tokens.mjs';

const nestedCards = {
  id: 'nested-cards',
  why: 'A card sits inside another card; the extra container adds noise and a second layer of depth that means nothing.',
  fix: 'Flatten the inner level: separate its items with spacing or a divider, not another box.',
  kinds: ['html'],
  run(ctx, report) {
    const cards = new Set(ctx.elements.filter((el) => !isHidden(ctx, el) && isCardLike(ctx, el)));
    for (const el of cards) {
      if (norm(textOf(el)).length < 10) continue;
      // An inline-level box (a status pill, a tag) sits in a line of text; it is not a container.
      if (/^inline(-|$)/.test(ctx.get(el, 'display') || '')) continue;
      let outer = null;
      for (let p = el.parent; p && p.tag !== '#root'; p = p.parent) if (cards.has(p)) { outer = p; break; }
      if (!outer) continue;
      // innermost only: skip if a card-like descendant also qualifies
      const stack = [...(el.children || [])];
      let hasInner = false;
      while (stack.length) { const c = stack.pop(); if (cards.has(c)) { hasInner = true; break; } stack.push(...(c.children || [])); }
      if (hasInner) continue;
      report({ el, message: `<${el.tag}${el.attrs.class ? ` class="${el.attrs.class}"` : ''}> is a card inside <${outer.tag}${outer.attrs.class ? ` class="${outer.attrs.class}"` : ''}> (line ${outer.line}).` });
    }
  },
};

const SPACING = /^(padding|margin|gap|row-gap|column-gap|grid-gap)(-(top|right|bottom|left|block|inline)(-(start|end))?)?$/;

const monotonous = {
  id: 'monotonous-spacing',
  why: 'Nearly every gap, margin and padding is the same value, so nothing is grouped and nothing is separated: the page has no spatial rhythm.',
  fix: 'Use the spacing scale with intent: tight inside a group, wider between groups, widest between sections.',
  run(ctx, report) {
    const vals = [];
    let first = null;
    for (const r of ctx.rules) for (const d of r.decls) {
      if (!SPACING.test(d.prop)) continue;
      for (const tok of splitTopLevel(resolveGlobal(ctx, d.value), ' ').map((x) => x.trim()).filter(Boolean)) {
        const px = toPx(tok, 16, 16);
        if (px == null || px <= 0) continue;
        vals.push(Math.round(px / 4) * 4);
        if (!first) first = { line: d.line, file: r.file };
      }
    }
    if (vals.length < 10) return;
    const counts = new Map();
    for (const v of vals) counts.set(v, (counts.get(v) || 0) + 1);
    const [top, n] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (counts.size > 3 || n / vals.length <= 0.6) return;
    report({ line: first.line, file: first.file, message: `${vals.length} spacing values, ${counts.size} distinct; ${top}px is ${Math.round((100 * n) / vals.length)}% of them.` });
  },
};

const MEASURE_TAGS = new Set(['p', 'li', 'dd', 'blockquote']);
const VIEWPORT = 1280; // shared desktop width with the browser pass (cdp.mjs)

function trackCount(value, width) {
  let n = 0;
  for (const t of splitTopLevel(value.trim(), ' ').map((x) => x.trim()).filter(Boolean)) {
    const m = /^repeat\((.*)\)$/i.exec(t);
    if (!m) { if (!t.startsWith('[')) n++; continue; }
    const [count, ...rest] = splitTopLevel(m[1], ',').map((x) => x.trim());
    const inner = rest.join(',');
    if (/^auto-(fit|fill)$/i.test(count)) {
      const min = /minmax\(\s*([^,]+),/i.exec(inner);
      const px = min ? toPx(min[1].trim(), 16, 16) : null;
      n += px ? Math.max(1, Math.floor(width / px)) : 1;
    } else n += (parseInt(count, 10) || 1) * Math.max(1, trackCount(inner, width));
  }
  return n || 1;
}

function lengthPx(ctx, el, prop, parentW) {
  const v = ctx.get(el, prop);
  if (!v || /^(none|auto|fit-content|max-content|min-content)$/.test(v)) return null;
  const pct = /^([\d.]+)%$/.exec(v.trim());
  if (pct) return (parseFloat(pct[1]) / 100) * parentW;
  return toPx(v, ctx.fontPx(el), 16);
}

// Best-effort content-box width at a 1280px desktop viewport: explicit widths, padding, and an
// even share of grid tracks, flex rows and columns. No layout engine — the browser pass measures.
function availableWidth(ctx, el, memo) {
  if (!el || el.tag === '#root') return VIEWPORT;
  if (memo.has(el)) return memo.get(el);
  const parent = el.parent && el.parent.tag !== '#root' ? el.parent : null;
  let w = parent ? availableWidth(ctx, parent, memo) : VIEWPORT;
  if (parent) {
    const disp = ctx.get(parent, 'display') || '';
    const kids = elementChildren(parent).filter((k) => !isHidden(ctx, k)).length;
    if (/grid/.test(disp)) {
      const tracks = trackCount(ctx.get(parent, 'grid-template-columns') || 'none', w);
      const gap = ctx.px(parent, 'column-gap') ?? 0;
      if (tracks > 1) w = (w - gap * (tracks - 1)) / tracks;
    } else if (/flex/.test(disp) && !/column/.test(ctx.get(parent, 'flex-direction') || '') && kids > 1) {
      w = w / kids;
    }
    const cols = parseInt(ctx.get(parent, 'column-count') || '', 10);
    if (cols > 1) w = w / cols;
  }
  for (const prop of ['width', 'max-width', 'inline-size', 'max-inline-size']) {
    const px = lengthPx(ctx, el, prop, w);
    if (px != null && px > 0) w = Math.min(w, px);
  }
  const pad = ['padding-left', 'padding-right'].reduce((a, p) => a + (ctx.px(el, p) ?? 0), 0);
  w = Math.max(0, w - pad);
  memo.set(el, w);
  return w;
}

const lineLength = {
  id: 'line-length',
  why: 'Running text spans too wide a column; long lines make the eye lose its place on the way back.',
  fix: 'Cap text containers at roughly 60–75ch (max-width: 65ch is a good default).',
  kinds: ['html'],
  run(ctx, report) {
    const memo = new Map();
    const seen = new Set();
    for (const { el, text } of textElements(ctx)) {
      if (!MEASURE_TAGS.has(el.tag) || norm(textOf(el)).length < 160) continue;
      const fpx = ctx.fontPx(el);
      if (fpx >= 24 || seen.has(el.parent)) continue;
      const chars = availableWidth(ctx, el, memo) / (0.5 * fpx);
      if (chars <= 85) continue;
      seen.add(el.parent);
      report({ el, message: `About ${Math.round(chars)} characters per line at a 1280px viewport (aim for 60–75).` });
    }
  },
};

function bareFr(v) {
  const s = v.replace(/(minmax|fit-content)\((?:[^()]|\([^()]*\))*\)/gi, ' ');
  return /(^|[\s(,])[\d.]*\d+fr\b/i.test(s);
}
const MEDIA = new Set(['img', 'picture', 'video', 'canvas']);
// An image grid item: the item is media, or media is its child or grandchild (figure > img,
// a > picture > img). Media buried deeper sits inside a card's content, not an image grid.
function mediaItem(item) {
  if (MEDIA.has(item.tag)) return true;
  return elementChildren(item).some((c) => MEDIA.has(c.tag) || elementChildren(c).some((g) => MEDIA.has(g.tag)));
}

const bareFrGrid = {
  id: 'image-grid-bare-1fr',
  why: 'An image grid sizes its columns with bare 1fr, whose minimum is its content\'s own width: one wide image or caption blows the column out and the page scrolls sideways.',
  fix: 'Use minmax(0, 1fr) for columns that hold images (e.g. repeat(3, minmax(0, 1fr))).',
  kinds: ['html'],
  run(ctx, report) {
    for (const el of ctx.elements) {
      if (!/grid/.test(ctx.get(el, 'display') || '') || isHidden(ctx, el)) continue;
      const v = ctx.get(el, 'grid-template-columns');
      if (!v || !bareFr(v)) continue;
      if (elementChildren(el).filter(mediaItem).length < 2) continue;
      let line = el.line, file;
      const d = ctx.decl(el, 'grid-template-columns');
      if (d && !d.src?.inline) { line = d.line; file = d.src?.file; }
      report({ line, file, message: `grid-template-columns: ${v} on a grid of images.` });
    }
  },
};

const NAV_SEL = /\b(nav|header|banner|navbar|topbar|top-bar|masthead|site-header|menu-bar|appbar|app-bar)\b/i;
const TABLE_SEL = /(^|[\s>+~,.#-])(table|thead|tbody|tr|th|td|caption)\b/i;

const doubleSticky = {
  id: 'double-sticky-top',
  why: 'A second element sticks at top: 0 under a sticky nav, so it slides underneath the nav and hides.',
  fix: 'Offset it by the nav height (top: var(--nav-h)), or make only one of them sticky.',
  run(ctx, report) {
    // In a page, a rule is the nav's if it styles a <header>/<nav> (or a banner / navigation role,
    // or an element that wraps a <nav>), whatever its selector is called.
    const navRules = new Set();
    for (const el of ctx.elements) {
      const navish = el.tag === 'nav' || el.tag === 'header' || /^(banner|navigation)$/.test(el.attrs.role || '') ||
        elementChildren(el).some((c) => c.tag === 'nav');
      if (navish) for (const pr of ctx.matching(el)) navRules.add(pr.rule);
    }
    const sticky = [];
    for (const r of ctx.rules) {
      if (mediaExcluded(r.media) || r.selectors.every((s) => /:(hover|focus|active)/.test(s))) continue;
      const pos = r.decls.filter((d) => d.prop === 'position').pop();
      if (!pos || !/sticky/i.test(pos.value)) continue;
      const top = r.decls.filter((d) => /^(top|inset-block-start|inset)$/.test(d.prop)).pop();
      if (!top) continue;
      const first = splitTopLevel(resolveGlobal(ctx, top.value).trim(), ' ')[0].trim();
      if (toPx(first, 16, 16) !== 0) continue;
      if (TABLE_SEL.test(r.selectorText)) continue;
      sticky.push({ r, pos, nav: NAV_SEL.test(r.selectorText) || navRules.has(r) });
    }
    if (sticky.length < 2 || !sticky.some((x) => x.nav)) return;
    const nav = sticky.find((x) => x.nav);
    for (const x of sticky) {
      if (x === nav) continue;
      report({ line: x.pos.line, file: x.r.file, message: `${x.r.selectorText.trim()} sticks at top: 0 under ${nav.r.selectorText.trim()} (line ${nav.pos.line}).` });
    }
  },
};

export default [nestedCards, monotonous, lineLength, bareFrGrid, doubleSticky];
