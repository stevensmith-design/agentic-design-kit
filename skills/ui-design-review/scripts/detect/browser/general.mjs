// Browser-pass rules: page health and text that does not render as written.
import { toUrl } from '../../cdp.mjs';

const scriptError = {
  id: 'script-error',
  phase: 'load',
  why: 'A script throws on load; whatever it was meant to set up (menus, reveals, forms) is missing.',
  fix: 'Fix the exception (often a selector that matches nothing, or code that runs before its element exists).',
  async probe(ctx) {
    const here = ctx.url ? ctx.file : toUrl(ctx.file);
    return ctx.session.exceptions.map((ex) => {
      const inline = ex.url === here || !ex.url;
      const where = inline ? '' : ` (${ex.url.split('/').pop()}:${ex.line})`;
      return { line: inline && ex.line > 0 ? ex.line : null, sel: null, message: `Uncaught on load: ${ex.text}${where}.` };
    });
  },
};

// Clickable labels that must stay on one line. Links inside running prose are allowed to wrap.
function wrapsProbe() {
  const U = window.__udr;
  const out = [];
  const els = document.querySelectorAll('button, [role="button"], input[type="submit"], input[type="button"], a, summary');
  for (const el of els) {
    if (!U.shown(el) || U.srOnly(el)) continue;  // shown() already excludes consent UI
    if (el.tagName === 'A') {
      const looksButton = /\b(btn|button|cta|pill|chip|tab)\b/i.test(el.className) || el.getAttribute('role') === 'button';
      const inChrome = el.closest('nav, header, [role="navigation"], [role="banner"], [role="tablist"], footer nav');
      const inProse = el.closest('p, li p, blockquote, dd, figcaption, td') && !looksButton;
      if (inProse || (!looksButton && !inChrome)) continue;
    }
    const label = U.text(el);
    if (!label || label.length < 2) continue;
    // A card/disclosure with separate title and description has intentional rows.
    // Inline spans in an ordinary label are still measured together below.
    const rows = [...el.children].filter((child) => U.shown(child) && U.text(child) &&
      /^(block|flex|grid|flow-root)$/.test(getComputedStyle(child).display));
    if (!U.ownText(el) && rows.length >= 2) continue;
    const lines = U.lines(el).length;
    if (lines > 1) out.push(U.found(el, `"${label.slice(0, 40)}" renders on ${lines} lines`));
  }
  return out;
}

const buttonWraps = {
  id: 'button-text-wraps',
  phase: 'sweep',
  why: 'A button or navigation label breaks onto two lines; it stops reading as one control and the row jumps.',
  fix: 'Shorten the label first; then white-space: nowrap; then move the item into a menu at this width.',
  async probe(ctx) { return ctx.probe(wrapsProbe); },
};

// Scroll through so reveal-on-scroll handlers get their chance, then count text left at opacity 0.
async function hiddenProbe() {
  const U = window.__udr;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const closedUi = (el) => el.closest('[role="dialog"], [role="menu"], [role="tooltip"], [role="listbox"], [popover], dialog, [aria-hidden="true"], [inert]');
  const nodes = [];
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    const t = n.nodeValue.replace(/\s+/g, ' ').trim();
    if (!t) continue;
    const el = n.parentElement;
    if (!el || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(el.tagName)) continue;
    if (!el.getClientRects().length || U.srOnly(el) || closedUi(el) || U.consent(el)) continue;
    nodes.push({ el, len: t.length, seen: false });
  }
  const opacity = (el) => {
    let op = 1, owner = null;
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      const o = parseFloat(getComputedStyle(e).opacity);
      if (o < 0.05 && !owner) owner = e;
      op *= o;
    }
    return { op, owner };
  };
  // Text counts as visible if it is ever shown while it is on screen: scroll-linked fades and
  // reveal-on-scroll pass, a reveal that never fires does not.
  const look = () => {
    for (const n of nodes) {
      if (n.seen) continue;
      const r = n.el.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= innerHeight) continue;
      if (opacity(n.el).op >= 0.05) n.seen = true;
    }
  };
  const step = Math.max(200, Math.round(innerHeight * 0.5));
  look();
  for (let y = 0; y < document.documentElement.scrollHeight; y += step) { scrollTo(0, y); await wait(150); look(); }
  scrollTo(0, document.documentElement.scrollHeight);
  await wait(250); look();
  scrollTo(0, 0);
  await wait(600); look();

  let total = 0, hidden = 0;
  const owners = new Map();
  for (const n of nodes) {
    total += n.len;
    if (n.seen) continue;
    const { op, owner } = opacity(n.el);
    if (op >= 0.05) continue; // never on screen (e.g. off to the side) but visible
    hidden += n.len;
    if (owner) owners.set(owner, (owners.get(owner) || 0) + n.len);
  }
  if (total < 200 || hidden < 150 || hidden / total <= 0.3) return [];
  const pct = Math.round((100 * hidden) / total);
  return [...owners.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([el, n]) => U.found(el, `${n} characters never become visible, even when scrolled into view (${pct}% of the page's text)`));
}

const hiddenAtRest = {
  id: 'content-hidden-at-rest',
  phase: 'scroll',
  why: 'Text is still invisible after the page has loaded and been scrolled: a reveal effect that never fired (no JS, a missed observer, a print or reader view) leaves the reader with nothing.',
  fix: 'Make content visible by default and animate from that state (or gate the hidden state behind a class the script adds); never ship opacity: 0 as the resting style.',
  async probe(ctx) { return ctx.probe(hiddenProbe); },
};


// A face the page names for its text that never renders: no @font-face, a stylesheet that did not
// load, or a local() that is not installed. Measured, not inferred from source: after
// document.fonts.ready, a family is available when text set in it measures differently from every
// generic fallback. Generic families and the common system faces are skipped.
async function fontProbe() {
  const U = window.__udr;
  try { await document.fonts.ready; } catch {}
  const GENERIC = new Set(['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui',
    'ui-serif', 'ui-sans-serif', 'ui-monospace', 'ui-rounded', 'math', 'emoji', 'fangsong',
    '-apple-system', 'blinkmacsystemfont', 'inherit', 'initial', 'unset']);
  const SYSTEM = new Set(['arial', 'helvetica', 'helvetica neue', 'georgia', 'times', 'times new roman',
    'verdana', 'tahoma', 'trebuchet ms', 'courier', 'courier new', 'segoe ui', 'roboto', 'menlo',
    'monaco', 'consolas', 'sf pro text', 'sf pro display', 'sf mono', 'cambria', 'calibri',
    'palatino', 'garamond', 'gill sans', 'lucida grande', 'noto sans', 'noto serif']);
  const seen = new Map();
  for (const el of document.querySelectorAll('body *')) {
    if (!U.shown(el)) continue;
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.nodeValue.trim());
    if (!own) continue;
    const fam = getComputedStyle(el).fontFamily.split(',')[0].trim().replace(/^["']|["']$/g, '');
    const k = fam.toLowerCase();
    if (!fam || GENERIC.has(k) || SYSTEM.has(k)) continue;
    if (!seen.has(k)) seen.set(k, { fam, el, count: 0 });
    seen.get(k).count++;
  }
  const ctx2d = document.createElement('canvas').getContext('2d');
  const sample = 'mmmmmmmmmmlliWWQ@#0123456789 Field notes';
  const width = (f) => { ctx2d.font = `72px ${f}`; return ctx2d.measureText(sample).width; };
  const out = [];
  for (const { fam, el, count } of seen.values()) {
    const q = `"${fam.replace(/"/g, '')}"`;
    try { await document.fonts.load(`16px ${q}`); } catch {}
    const renders = ['monospace', 'serif', 'sans-serif'].some((g) => width(`${q}, ${g}`) !== width(g));
    if (!renders) out.push(U.found(el, `"${fam}" is named for ${count} text element(s) but never loads — the page renders in the fallback`));
  }
  return out;
}

const fontNotLoaded = {
  id: 'font-not-loaded',
  phase: 'desktop',
  why: 'The page names a face that never loads, so everyone sees the fallback — and a review of the declared type judges a page nobody sees.',
  fix: 'Load it (@font-face with a file you ship, or the provider\'s stylesheet), or change the declaration to what actually renders.',
  async probe(ctx) { return ctx.probe(fontProbe); },
};

export default [scriptError, buttonWraps, hiddenAtRest, fontNotLoaded];
