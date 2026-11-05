// Minimal, dependency-free HTML parser. Builds an element tree with line numbers.
// Good enough for static UI files; not a spec-complete HTML5 parser.

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
  'param', 'source', 'track', 'wbr']);
const RAW = new Set(['script', 'style', 'textarea', 'title']);
// Elements whose open tag implicitly closes an open sibling of the same kind.
const AUTOCLOSE = { p: new Set(['p', 'div', 'ul', 'ol', 'section', 'h1', 'h2', 'h3', 'h4', 'h5',
  'h6', 'table', 'header', 'footer', 'nav', 'article', 'aside', 'main', 'form', 'figure']),
  li: new Set(['li']), option: new Set(['option']), tr: new Set(['tr']), td: new Set(['td', 'th']),
  th: new Set(['td', 'th']), dt: new Set(['dt', 'dd']), dd: new Set(['dt', 'dd']) };

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  mdash: '—', ndash: '–', hellip: '…', rsquo: '’', lsquo: '‘',
  rdquo: '”', ldquo: '“', copy: '©' };

export function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

function lineAt(src, idx, cache) {
  // cache: array of newline offsets
  let lo = 0, hi = cache.length;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (cache[mid] < idx) lo = mid + 1; else hi = mid; }
  return lo + 1;
}

export function parseHTML(src) {
  const nl = [];
  for (let i = 0; i < src.length; i++) if (src.charCodeAt(i) === 10) nl.push(i);
  const root = { tag: '#root', attrs: {}, children: [], parent: null, line: 1 };
  const stack = [root];
  const top = () => stack[stack.length - 1];
  let i = 0;
  const len = src.length;

  const pushText = (text, at) => {
    if (!text) return;
    top().children.push({ tag: '#text', text: decode(text), parent: top(), line: lineAt(src, at, nl) });
  };

  while (i < len) {
    const lt = src.indexOf('<', i);
    if (lt === -1) { pushText(src.slice(i), i); break; }
    if (lt > i) pushText(src.slice(i, lt), i);
    if (src.startsWith('<!--', lt)) {
      const end = src.indexOf('-->', lt + 4);
      i = end === -1 ? len : end + 3;
      continue;
    }
    if (src[lt + 1] === '!' || src[lt + 1] === '?') {
      const end = src.indexOf('>', lt);
      i = end === -1 ? len : end + 1;
      continue;
    }
    if (src[lt + 1] === '/') {
      const end = src.indexOf('>', lt);
      const name = src.slice(lt + 2, end === -1 ? len : end).trim().toLowerCase();
      for (let k = stack.length - 1; k > 0; k--) {
        if (stack[k].tag === name) { stack.length = k; break; }
      }
      i = end === -1 ? len : end + 1;
      continue;
    }
    const m = /^<([a-zA-Z][a-zA-Z0-9-]*)/.exec(src.slice(lt, lt + 64));
    if (!m) { pushText('<', lt); i = lt + 1; continue; }
    const tag = m[1].toLowerCase();
    // parse attributes up to the closing '>' (respecting quotes)
    let j = lt + m[0].length;
    const attrs = {};
    let selfClose = false;
    while (j < len) {
      while (j < len && /\s/.test(src[j])) j++;
      if (src[j] === '>') { j++; break; }
      if (src[j] === '/' && src[j + 1] === '>') { selfClose = true; j += 2; break; }
      const am = /^[^\s=>/]+/.exec(src.slice(j, j + 256));
      if (!am) { j++; continue; }
      const name = am[0].toLowerCase();
      j += am[0].length;
      while (j < len && /\s/.test(src[j])) j++;
      let val = '';
      if (src[j] === '=') {
        j++;
        while (j < len && /\s/.test(src[j])) j++;
        const q = src[j];
        if (q === '"' || q === "'") {
          const e = src.indexOf(q, j + 1);
          val = src.slice(j + 1, e === -1 ? len : e);
          j = e === -1 ? len : e + 1;
        } else {
          const vm = /^[^\s>]+/.exec(src.slice(j, j + 1024));
          val = vm ? vm[0] : '';
          j += val.length;
        }
      }
      attrs[name] = decode(val);
    }
    const auto = AUTOCLOSE[top().tag];
    if (auto && auto.has(tag) && top().tag !== '#root') stack.pop();
    const el = { tag, attrs, children: [], parent: top(), line: lineAt(src, lt, nl) };
    top().children.push(el);
    if (VOID.has(tag) || selfClose) { i = j; continue; }
    if (RAW.has(tag)) {
      const close = src.toLowerCase().indexOf(`</${tag}`, j);
      const end = close === -1 ? len : close;
      el.raw = src.slice(j, end);
      el.rawLine = lineAt(src, j, nl);
      if (tag === 'textarea' || tag === 'title') {
        el.children.push({ tag: '#text', text: decode(el.raw), parent: el, line: el.rawLine });
      }
      const gt = src.indexOf('>', end);
      i = gt === -1 ? len : gt + 1;
      continue;
    }
    stack.push(el);
    i = j;
  }
  return root;
}

export function* walk(node) {
  for (const c of node.children || []) {
    if (c.tag === '#text') continue;
    yield c;
    yield* walk(c);
  }
}

export function textOf(node) {
  if (node.tag === '#text') return node.text;
  if (node.tag === 'script' || node.tag === 'style') return '';
  return (node.children || []).map(textOf).join('');
}

// Text directly owned by this element (not descendants).
export function ownText(node) {
  return (node.children || []).filter((c) => c.tag === '#text').map((c) => c.text).join('');
}

export function elementChildren(node) {
  return (node.children || []).filter((c) => c.tag !== '#text');
}

export function prevElementSibling(node) {
  if (!node.parent) return null;
  const sibs = node.parent.children;
  const idx = sibs.indexOf(node);
  for (let k = idx - 1; k >= 0; k--) {
    const s = sibs[k];
    if (s.tag === '#text') { if (s.text.trim()) return null; continue; }
    return s;
  }
  return null;
}

export function classList(node) {
  return (node.attrs?.class || '').split(/\s+/).filter(Boolean);
}

export function closest(node, pred) {
  for (let n = node.parent; n && n.tag !== '#root'; n = n.parent) if (pred(n)) return n;
  return null;
}
