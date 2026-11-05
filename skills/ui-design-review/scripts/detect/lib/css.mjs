// Minimal, dependency-free CSS parser. Comments are stripped first (newlines kept so line
// numbers stay true) — a declaration mentioned in a comment is never a declaration.

export function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

function splitTopLevel(s, sep) {
  const out = [];
  let depth = 0, quote = null, start = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quote) { if (c === quote && s[i - 1] !== '\\') quote = null; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (c === sep && depth === 0) { out.push(s.slice(start, i)); start = i + 1; }
  }
  out.push(s.slice(start));
  return out;
}
export { splitTopLevel };

export function parseDecls(body, baseLine) {
  const decls = [];
  let line = baseLine;
  for (const part of splitTopLevel(body, ';')) {
    const lead = part.match(/^\s*/)[0];
    const declLine = line + (lead.match(/\n/g) || []).length;
    line += (part.match(/\n/g) || []).length;
    const idx = part.indexOf(':');
    if (idx === -1) continue;
    const prop = part.slice(0, idx).trim().toLowerCase();
    if (!prop || /[{}]/.test(prop)) continue;
    let value = part.slice(idx + 1).trim();
    let important = false;
    if (/!\s*important\s*$/i.test(value)) { important = true; value = value.replace(/!\s*important\s*$/i, '').trim(); }
    decls.push({ prop, value, important, line: declLine });
  }
  return decls;
}

// Parse a stylesheet into flat rules. Each rule: { selectors:[...], decls, media:[...], line }.
// Media context is kept as a list of the enclosing @media / @supports preludes.
export function parseCSS(src, file = '', startLine = 1) {
  const css = stripComments(src);
  const sheet = { file, rules: [], keyframes: {}, fontFaces: [] };
  parseBlock(css, 0, css.length, [], startLine, sheet);
  return sheet;
}

function countNl(s, a, b) {
  let n = 0;
  for (let i = a; i < b; i++) if (s.charCodeAt(i) === 10) n++;
  return n;
}

function findClose(s, open) {
  let depth = 0, quote = null;
  for (let i = open; i < s.length; i++) {
    const c = s[i];
    if (quote) { if (c === quote && s[i - 1] !== '\\') quote = null; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return i; }
  }
  return s.length;
}

function parseBlock(s, from, to, media, baseLine, sheet) {
  let i = from;
  let line = baseLine;
  while (i < to) {
    const brace = s.indexOf('{', i);
    const semi = s.indexOf(';', i);
    if (brace === -1 || brace >= to) break;
    // A top-level statement like @import ...; before the next block
    if (semi !== -1 && semi < brace && s.slice(i, semi).trim().startsWith('@')) {
      line += countNl(s, i, semi + 1);
      i = semi + 1;
      continue;
    }
    const prelude = s.slice(i, brace);
    const preludeLine = line + countNl(s, i, i + prelude.length - prelude.trimStart().length);
    const close = findClose(s, brace);
    const bodyLine = line + countNl(s, i, brace + 1);
    const pre = prelude.trim();
    if (pre.startsWith('@')) {
      const name = pre.slice(1).split(/[\s(]/)[0].toLowerCase();
      if (name === 'media' || name === 'supports' || name === 'layer' || name === 'container') {
        parseBlock(s, brace + 1, close, media.concat(pre), bodyLine, sheet);
      } else if (name.endsWith('keyframes')) {
        const kname = pre.replace(/^@[\w-]*keyframes\s*/i, '').trim();
        const body = s.slice(brace + 1, close);
        const frames = [];
        const sub = { rules: [], keyframes: {}, fontFaces: [] };
        parseBlock(s, brace + 1, close, [], bodyLine, sub);
        for (const r of sub.rules) frames.push({ stops: r.selectors, decls: r.decls });
        sheet.keyframes[kname] = { name: kname, frames, text: body, line: preludeLine, media };
      } else if (name === 'font-face') {
        sheet.fontFaces.push({ decls: parseDecls(s.slice(brace + 1, close), bodyLine), line: preludeLine });
      }
      // other at-rules (@page, @property, ...) ignored
    } else if (pre) {
      const body = s.slice(brace + 1, close);
      // Nested rules (CSS nesting) are not expanded: take declarations before the first '{'.
      const flatBody = body.includes('{') ? body.slice(0, body.indexOf('{')).replace(/[^;]*$/, '') : body;
      sheet.rules.push({
        selectors: splitTopLevel(pre, ',').map((x) => x.trim()).filter(Boolean),
        selectorText: pre,
        decls: parseDecls(flatBody, bodyLine),
        media,
        line: preludeLine,
        file: sheet.file,
      });
    }
    line += countNl(s, i, close + 1);
    i = close + 1;
  }
}

// Expand shorthands we care about into longhands (best-effort).
export function longhands(decl) {
  const { prop, value } = decl;
  if (prop === 'border' || /^border-(top|right|bottom|left)$/.test(prop)) {
    const sides = prop === 'border' ? ['top', 'right', 'bottom', 'left'] : [prop.split('-')[1]];
    const parts = splitTopLevel(value, ' ').map((p) => p.trim()).filter(Boolean);
    let width = null, style = null, color = null;
    for (const p of parts) {
      if (/^(none|hidden|solid|dashed|dotted|double|groove|ridge|inset|outset)$/i.test(p)) style = p;
      else if (/^-?[\d.]+(px|em|rem)?$|^(thin|medium|thick)$/i.test(p)) width = p;
      else color = p;
    }
    const out = [];
    for (const sd of sides) {
      if (width !== null) out.push({ ...decl, prop: `border-${sd}-width`, value: width });
      if (style !== null) out.push({ ...decl, prop: `border-${sd}-style`, value: style });
      if (color !== null) out.push({ ...decl, prop: `border-${sd}-color`, value: color });
      if (style && /none|hidden/i.test(style)) out.push({ ...decl, prop: `border-${sd}-width`, value: '0' });
    }
    return out;
  }
  if (prop === 'border-width' || prop === 'border-color' || prop === 'border-style' ||
      prop === 'padding' || prop === 'margin') {
    const parts = splitTopLevel(value, ' ').map((p) => p.trim()).filter(Boolean);
    const [t, r = t, b = t, l = r] = parts;
    const vals = { top: t, right: r, bottom: b, left: l };
    if (prop.startsWith('border-')) {
      const kind = prop.split('-')[1];
      return Object.entries(vals).map(([sd, v]) => ({ ...decl, prop: `border-${sd}-${kind}`, value: v }));
    }
    return Object.entries(vals).map(([sd, v]) => ({ ...decl, prop: `${prop}-${sd}`, value: v }));
  }
  if (prop === 'background') {
    // The shorthand resets both longhands. A value with no image layer is a colour (possibly a
    // var() resolved later); one with gradient / url layers keeps the whole value as the image
    // (rules read its colour stops) and a colour only if the final layer names one.
    const layered = /(gradient|url|image-set)\(/i.test(value);
    if (!layered) return [decl, { ...decl, prop: 'background-color', value }, { ...decl, prop: 'background-image', value: 'none' }];
    const layers = splitTopLevel(value, ',');
    const last = layers[layers.length - 1].replace(/(?:[\w-]*gradient|url|image-set)\((?:[^()]|\([^()]*\))*\)/gi, '');
    const col = /#[0-9a-f]{3,8}\b|(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\([^)]*\)|var\(--[\w-]+\)/i.exec(last);
    return [decl, { ...decl, prop: 'background-image', value }, { ...decl, prop: 'background-color', value: col ? col[0] : 'transparent' }];
  }
  if (prop === 'font') {
    const out = [decl];
    if (/\bitalic\b/i.test(value)) out.push({ ...decl, prop: 'font-style', value: 'italic' });
    // Size and line-height may be literals or var() (`var(--size) / var(--leading) family`).
    const V = '[\\d.]+(?:px|rem|em|%)|var\\(--[\\w-]+\\)';
    const sz = new RegExp(`(?:^|\\s)(${V})(?:\\s*\\/\\s*([\\d.]+(?:px|rem|em|%)?|var\\(--[\\w-]+\\)))?\\s`).exec(` ${value} `);
    if (sz) {
      out.push({ ...decl, prop: 'font-size', value: sz[1] });
      if (sz[2]) out.push({ ...decl, prop: 'line-height', value: sz[2] });
      const fam = value.slice(value.indexOf(sz[0].trim()) + sz[0].trim().length).trim();
      if (fam) out.push({ ...decl, prop: 'font-family', value: fam });
    }
    return out;
  }
  if (prop === 'inset') return [decl];
  return [decl];
}
