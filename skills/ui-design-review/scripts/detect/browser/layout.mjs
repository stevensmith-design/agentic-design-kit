// Browser-pass rules: layout that only exists once the page is laid out.

function overflowProbe() {
  const U = window.__udr;
  const se = document.scrollingElement;
  const vw = se.clientWidth;
  const over = se.scrollWidth - vw;
  // A masked headline can lose text without increasing the document's scroll width.
  const clipped = [];
  for (const h of document.querySelectorAll('h1,h2,h3,h4,h5,h6')) {
    if (!U.shown(h) || U.srOnly(h) || U.consent(h)) continue;
    const boxes = [];
    const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.nodeValue.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      boxes.push(...range.getClientRects());
    }
    for (let e = h; e; e = e.parentElement) {
      const cs = getComputedStyle(e);
      // Explicit truncation is a different design decision, assessed by visual review.
      if (cs.textOverflow === 'ellipsis' || Number.parseInt(cs.webkitLineClamp, 10) > 0) break;
      if (!/hidden|clip/.test(cs.overflowX)) continue;
      const rect = e.getBoundingClientRect();
      const left = rect.left + e.clientLeft;
      const right = left + e.clientWidth;
      if (boxes.some((b) => b.left < left - 2 || b.right > right + 2)) {
        clipped.push(U.found(h, 'Heading text is cut off by an overflow hidden/clip container'));
        break;
      }
    }
  }
  if (over < 16) return clipped;
  const inScroller = (el) => {
    for (let e = el.parentElement; e && e !== document.body && e !== document.documentElement; e = e.parentElement) {
      if (/auto|scroll|hidden|clip/.test(getComputedStyle(e).overflowX)) return true;
    }
    return false;
  };
  const wide = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > vw + 1 || r.left < -1); };
  const culprits = [];
  for (const el of document.body.querySelectorAll('*')) {
    if (!wide(el) || inScroller(el) || U.consent(el) || getComputedStyle(el).position === 'fixed') continue;
    if (el.parentElement && el.parentElement !== document.body && wide(el.parentElement)) continue; // outermost only
    culprits.push(el);
    if (culprits.length >= 3) break;
  }
  if (!culprits.length) return [...clipped, U.found(document.body, `Page scrolls sideways by ${over}px`)];
  return [...clipped, ...culprits.map((el) => U.found(el, `Page scrolls sideways by ${over}px; <${el.tagName.toLowerCase()}> reaches ${Math.round(el.getBoundingClientRect().right)}px of ${vw}px`))];
}

const contentOverflow = {
  id: 'content-overflow',
  phase: 'sweep',
  why: 'Content exceeds its available width: the page scrolls sideways or a heading is silently clipped.',
  fix: 'Let the named content shrink or wrap; remove unintended clipping. Deliberate truncation still needs visual review.',
  async probe(ctx) { return ctx.probe(overflowProbe); },
};

function edgeProbe() {
  const U = window.__udr;
  const vw = document.scrollingElement.clientWidth;
  const out = [];
  for (const el of document.querySelectorAll('p, li')) {
    if (!U.shown(el) || U.srOnly(el)) continue;
    const t = U.text(el);
    if (t.length <= 40) continue;
    const lines = U.lines(el);
    if (!lines.length) continue;
    const left = Math.min(...lines.map((l) => l.rect.left));
    const right = Math.max(...lines.map((l) => l.rect.right));
    if (right - left < vw * 0.5) continue;
    if (right > vw + 1 || left < -1) continue; // runs off screen: content-overflow owns it
    const gap = Math.min(left, vw - right);
    if (gap < 16) out.push(U.found(el, `Running text sits ${Math.max(0, Math.round(gap))}px from the screen edge`));
  }
  return out;
}

const bodyTextEdge = {
  id: 'body-text-edge',
  phase: 'sweep',
  why: 'Running text runs to within a few pixels of the screen edge; lines are hard to start and end, and the page feels unfinished.',
  fix: 'Give the text column a side gutter of at least 16px (20–24px reads better on phones).',
  async probe(ctx) { return ctx.probe(edgeProbe); },
};

function rhythmProbe() {
  const U = window.__udr;
  const bad = [];
  for (const h of document.querySelectorAll('h2, h3, h4')) {
    if (!U.shown(h)) continue;
    let prev = h.previousElementSibling, next = h.nextElementSibling;
    while (prev && !U.shown(prev)) prev = prev.previousElementSibling;
    while (next && !U.shown(next)) next = next.nextElementSibling;
    if (!prev || !next) continue;
    const r = h.getBoundingClientRect();
    const above = r.top - prev.getBoundingClientRect().bottom;
    const below = next.getBoundingClientRect().top - r.bottom;
    if (below <= 0) continue;
    if (above < 0.75 * below && below - above >= 12) bad.push({ h, above, below });
  }
  if (bad.length < 2) return [];
  const { h, above, below } = bad[0];
  return [U.found(h, `${bad.length} headings sit closer to what precedes them than to what they introduce (e.g. ${Math.round(above)}px above, ${Math.round(below)}px below)`)];
}

const headingRhythm = {
  id: 'heading-rhythm',
  phase: 'desktop',
  why: 'Headings have less space above than below, so each one visually belongs to the section before it.',
  fix: 'Put more space above a heading than below it (roughly 2:1); the heading should hug the content it introduces.',
  async probe(ctx) { return ctx.probe(rhythmProbe); },
};

function columnProbe() {
  const U = window.__udr;
  const vh = innerHeight;
  const out = [];
  for (const c of document.body.querySelectorAll('*')) {
    const cs = getComputedStyle(c);
    if (!/flex|grid/.test(cs.display) || (/flex/.test(cs.display) && /column/.test(cs.flexDirection))) continue;
    const cr = c.getBoundingClientRect();
    if (cr.top + scrollY >= vh || cr.width < innerWidth * 0.5) continue;
    const kids = [...c.children].filter((k) => U.shown(k));
    if (kids.length < 2) continue;
    // Natural heights: stretch would make every column as tall as the tallest.
    const prev = c.style.alignItems;
    c.style.alignItems = 'flex-start';
    const boxes = kids.map((k) => ({ k, r: k.getBoundingClientRect() }));
    c.style.alignItems = prev;
    const side = boxes.filter((b) => boxes.some((o) => o !== b && (o.r.right <= b.r.left + 1 || o.r.left >= b.r.right - 1) &&
      o.r.top < b.r.bottom && b.r.top < o.r.bottom));
    if (side.length < 2) continue;
    const tall = side.reduce((a, b) => (b.r.height > a.r.height ? b : a));
    const short = side.filter((b) => b !== tall && b.r.height <= vh);
    if (tall.r.height > 1.4 * vh && short.length) {
      out.push(U.found(tall.k, `This column is ${Math.round(tall.r.height)}px tall beside one of ${Math.round(short[0].r.height)}px in a ${vh}px viewport`));
    }
  }
  return out;
}

const columnOverflow = {
  id: 'first-viewport-column-overflow',
  phase: 'desktop',
  why: 'In the opening split layout one column runs far below the fold while its neighbour ends inside it, leaving a long empty gutter and burying half the content.',
  fix: 'Rebalance the columns (move content, make the short side sticky) or stack them.',
  async probe(ctx) { return ctx.probe(columnProbe); },
};

function flushProbe() {
  const U = window.__udr;
  const vw = document.scrollingElement.clientWidth;
  const out = [];
  for (const s of document.body.querySelectorAll('*')) {
    if (!/auto|scroll/.test(getComputedStyle(s).overflowX) || s.scrollWidth <= s.clientWidth + 1 || !U.shown(s)) continue;
    const items = [...s.children].filter((k) => U.shown(k));
    if (items.length < 2) continue;
    const r = s.getBoundingClientRect();
    const inL = r.left + s.clientLeft, inR = inL + s.clientWidth;
    const keep = s.scrollLeft;
    s.scrollLeft = 0;
    const start = items[0].getBoundingClientRect().left - inL;
    s.scrollLeft = s.scrollWidth;
    const end = inR - items[items.length - 1].getBoundingClientRect().right;
    s.scrollLeft = keep;
    // Only a card that also meets the screen edge is flush; a rail inside the text column that
    // lines its first card up with the text is deliberate.
    const sides = [];
    if (start < 8 && inL < 8) sides.push(`start (${Math.round(start)}px)`);
    if (end < 8 && vw - inR < 8) sides.push(`end (${Math.round(end)}px)`);
    if (sides.length) out.push(U.found(s, `Cards touch the screen edge at the scroller's ${sides.join(' and ')}`));
  }
  return out;
}

const edgeFlush = {
  id: 'edge-flush-cards',
  phase: 'sweep',
  why: 'Cards in a horizontal scroller sit flush against the screen edge at the start or end of the scroll, so they look cut off rather than scrollable.',
  fix: 'Pad the scroller (padding-inline plus scroll-padding-inline) so the first and last cards keep the page gutter.',
  async probe(ctx) { return ctx.probe(flushProbe); },
};

function clipProbe() {
  const U = window.__udr;
  const out = [];
  const POPUP = /^(menu|listbox|tooltip|dialog|tree|grid)$/;
  for (const el of document.body.querySelectorAll('*')) {
    if (getComputedStyle(el).position !== 'absolute' || !U.shown(el) || U.srOnly(el)) continue;
    const interactive = POPUP.test(el.getAttribute('role') || '') || el.matches('a, button, input, select, textarea') ||
      el.querySelector('a, button, input, select, textarea, [role="menuitem"], [role="option"]');
    if (!interactive) continue;
    const r = el.getBoundingClientRect();
    if (r.width <= 2 || r.height <= 2) continue;
    // Overflow clips an absolutely positioned box only from its containing block outward.
    for (let a = el.offsetParent; a && a !== document.body && a !== document.documentElement; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (!/hidden|clip/.test(cs.overflowX + ' ' + cs.overflowY)) continue;
      const ar = a.getBoundingClientRect();
      const cut = Math.max(ar.left - r.left, r.right - ar.right, ar.top - r.top, r.bottom - ar.bottom);
      if (cut > 2) out.push(U.found(el, `${Math.round(cut)}px of this ${el.getAttribute('role') || 'control'} is cut off by overflow on ${U.sel(a)}`));
      break;
    }
  }
  return out;
}

const clippedPopover = {
  id: 'clipped-popover',
  phase: 'desktop',
  why: 'A menu, tooltip or other interactive overlay is cut off by an ancestor with overflow: hidden, so part of it cannot be seen or reached.',
  fix: 'Render the overlay outside the clipped container (the popover attribute or a top-layer portal), or remove the overflow clip.',
  async probe(ctx) { return ctx.probe(clipProbe); },
};

async function occlusionProbe() {
  const U = window.__udr;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const out = [];
  const done = new Set();
  const blurOf = (v) => { const m = /blur\(([\d.]+)px\)/.exec(v || ''); return m ? parseFloat(m[1]) : 0; };
  const pinned = (e) => { for (let x = e; x && x !== document.body; x = x.parentElement) { if (/fixed|sticky/.test(getComputedStyle(x).position)) return true; } return false; };
  const opaque = (e) => {
    if (/^(IMG|VIDEO|CANVAS|IFRAME|svg|OBJECT|EMBED)$/i.test(e.tagName)) return true;
    const cs = getComputedStyle(e);
    if (blurOf(cs.backdropFilter) >= 4) return true;
    if (cs.backgroundImage && cs.backgroundImage !== 'none') return true;
    const c = U.rgba(cs.backgroundColor);
    return !!c && c.a >= 0.5 && parseFloat(cs.opacity) >= 0.5;
  };
  const texts = U.textEls(2).slice(0, 800);
  const screens = new Map(); // full-viewport layers → how many text elements they cover
  for (const el of texts) {
    let b = 0;
    for (let x = el; x && x !== document.documentElement; x = x.parentElement) b = Math.max(b, blurOf(getComputedStyle(x).filter));
    if (b >= 4) { done.add(el); out.push(U.found(el, `Text is blurred (${b}px)`)); }
  }
  const pageH = document.documentElement.scrollHeight;
  const vh = innerHeight;
  for (let band = 0, y = 0; band < 8 && y < pageH; band++, y += Math.round(vh * 0.9)) {
    scrollTo(0, y);
    await wait(60);
    for (const el of texts) {
      if (done.has(el)) continue;
      const lines = U.lines(el).filter((l) => l.rect.top >= 0 && l.rect.bottom <= vh);
      if (!lines.length) continue;
      for (const l of lines.slice(0, 3)) {
        const x = l.rect.left + Math.min(l.rect.width / 2, 40), yy = l.rect.top + l.rect.height / 2;
        const top = document.elementsFromPoint(x, yy)[0];
        if (!top || top === el || el.contains(top) || top.contains(el)) continue;
        if (U.consent(top) || !opaque(top)) continue;
        if (band > 0 && pinned(top)) continue; // scroll chrome over content mid-scroll is expected
        done.add(el);
        let layer = null;
        for (let x = top; x && x !== document.body; x = x.parentElement) {
          const xr = x.getBoundingClientRect();
          if (xr.width * xr.height >= 0.8 * innerWidth * vh) { layer = x; break; }
        }
        if (layer) screens.set(layer, (screens.get(layer) || 0) + 1);
        else out.push(U.found(el, `Text is covered by ${U.sel(top)}`));
        break;
      }
    }
  }
  scrollTo(0, 0);
  for (const [layer, n] of screens) out.push(U.found(layer, `A full-screen layer still covers the page 3s after load, hiding ${n} text element${n > 1 ? 's' : ''}`));
  return out;
}

const textOcclusion = {
  id: 'text-occlusion',
  phase: 'desktop',
  why: 'Text is hidden under an opaque layer (or blurred) at rest, so the reader cannot read it.',
  fix: 'Move the covering layer, give the text its own space, or drop the blur; decorative layers belong behind text (z-index, or pointer-events: none plus a transparent fill).',
  async probe(ctx) { return ctx.probe(occlusionProbe); },
};

export default [contentOverflow, bodyTextEdge, headingRhythm, columnOverflow, edgeFlush, clippedPopover, textOcclusion];
