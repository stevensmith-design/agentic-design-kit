// Selector parsing, matching and specificity. Supports type, universal, #id, .class,
// [attr], [attr=v], [attr~=v], [attr^=v], [attr$=v], [attr*=v], [attr|=v], :not(), :is(),
// :where(), :root, :first-child, :last-child, combinators ' ', '>', '+', '~'.
// State pseudo-classes (:hover, :focus, ...) are recorded, not matched: a rule that needs a
// state never applies "at rest", and rules that look for state styling read rule.states.
// Pseudo-elements (::before, ::after, ...) mark the rule as targeting a pseudo-element.

import { splitTopLevel } from './css.mjs';
import { classList, elementChildren } from './html.mjs';

export const STATE_PSEUDOS = new Set(['hover', 'focus', 'focus-visible', 'focus-within', 'active',
  'visited', 'target', 'checked', 'disabled', 'enabled', 'invalid', 'valid', 'placeholder-shown',
  'open', 'popover-open', 'indeterminate', 'required', 'optional', 'read-only', 'read-write',
  'user-invalid', 'autofill', 'empty', 'link', 'any-link']);

const cache = new Map();

export function parseSelector(sel) {
  if (cache.has(sel)) return cache.get(sel);
  const parsed = parseComplex(sel.trim());
  cache.set(sel, parsed);
  return parsed;
}

function parseComplex(s) {
  // returns { parts: [{ compound, comb }], states:Set, pseudoEl, spec:[a,b,c] }
  const parts = [];
  let i = 0, comb = null;
  const states = new Set();
  let pseudoEl = null;
  const spec = [0, 0, 0];
  while (i < s.length) {
    while (i < s.length && /\s/.test(s[i])) { i++; if (comb === null && parts.length) comb = ' '; }
    if (i >= s.length) break;
    if ('>+~'.includes(s[i])) { comb = s[i]; i++; continue; }
    const { compound, next } = parseCompound(s, i, states, spec);
    if (compound.pseudoEl) pseudoEl = compound.pseudoEl;
    parts.push({ compound, comb: parts.length ? (comb || ' ') : null });
    comb = null;
    if (next === i) break; // safety
    i = next;
  }
  return { parts, states, pseudoEl, spec };
}

function readParen(s, i) {
  let depth = 0;
  for (let k = i; k < s.length; k++) {
    if (s[k] === '(') depth++;
    else if (s[k] === ')') { depth--; if (depth === 0) return k; }
  }
  return s.length;
}

function parseCompound(s, i, states, spec) {
  const c = { tag: null, id: null, classes: [], attrs: [], nots: [], ises: [], pseudo: [], pseudoEl: null };
  while (i < s.length && !/[\s>+~]/.test(s[i])) {
    const ch = s[i];
    if (ch === '*') { i++; continue; }
    if (ch === '#') {
      const m = /^#([\w-]+)/.exec(s.slice(i)); c.id = m ? m[1] : ''; spec[0]++; i += m ? m[0].length : 1; continue;
    }
    if (ch === '.') {
      const m = /^\.((?:\\.|[\w-])+)/.exec(s.slice(i));
      c.classes.push(m ? m[1].replace(/\\(.)/g, '$1') : ''); spec[1]++; i += m ? m[0].length : 1; continue;
    }
    if (ch === '[') {
      const end = s.indexOf(']', i);
      const body = s.slice(i + 1, end === -1 ? s.length : end);
      const m = /^\s*([\w:-]+)\s*(?:([~^$*|]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\s\]]+))\s*(i)?)?\s*$/.exec(body);
      if (m) c.attrs.push({ name: m[1].toLowerCase(), op: m[2] || null, val: m[3] ?? m[4] ?? m[5] ?? '', ci: !!m[6] });
      spec[1]++;
      i = end === -1 ? s.length : end + 1;
      continue;
    }
    if (ch === ':') {
      const dbl = s[i + 1] === ':';
      const m = /^::?([\w-]+)/.exec(s.slice(i));
      const name = m ? m[1].toLowerCase() : '';
      i += m ? m[0].length : 1;
      let arg = null;
      if (s[i] === '(') { const end = readParen(s, i); arg = s.slice(i + 1, end); i = end + 1; }
      if (dbl || ['before', 'after', 'first-line', 'first-letter', 'placeholder', 'selection', 'marker', 'backdrop'].includes(name)) {
        c.pseudoEl = name; spec[2]++; continue;
      }
      if (name === 'not') { c.nots.push(splitTopLevel(arg || '', ',').map((x) => parseSelector(x))); spec[1]++; continue; }
      if (name === 'is' || name === 'matches' || name === 'where') {
        const list = splitTopLevel(arg || '', ',').map((x) => parseSelector(x));
        c.ises.push(list);
        if (name !== 'where') spec[1]++;
        for (const p of list) for (const st of p.states) states.add(st);
        continue;
      }
      if (STATE_PSEUDOS.has(name)) { states.add(name); spec[1]++; continue; }
      c.pseudo.push({ name, arg }); spec[1]++;
      continue;
    }
    const m = /^[\w-]+/.exec(s.slice(i));
    if (m) { c.tag = m[0].toLowerCase(); spec[2]++; i += m[0].length; continue; }
    i++; // unknown char
  }
  return { compound: c, next: i };
}

function attrMatch(el, a) {
  const has = Object.prototype.hasOwnProperty.call(el.attrs, a.name);
  if (!has) return false;
  if (!a.op) return true;
  let v = el.attrs[a.name] ?? '';
  let t = a.val;
  if (a.ci) { v = v.toLowerCase(); t = t.toLowerCase(); }
  switch (a.op) {
    case '=': return v === t;
    case '~=': return v.split(/\s+/).includes(t);
    case '^=': return t !== '' && v.startsWith(t);
    case '$=': return t !== '' && v.endsWith(t);
    case '*=': return t !== '' && v.includes(t);
    case '|=': return v === t || v.startsWith(t + '-');
    default: return false;
  }
}

function siblingsOf(el) {
  return el.parent ? elementChildren(el.parent) : [el];
}

function compoundMatch(el, c, ignoreStates) {
  if (!el || el.tag === '#root' || el.tag === '#text') return false;
  if (c.tag && c.tag !== el.tag) return false;
  if (c.id !== null && el.attrs.id !== c.id) return false;
  if (c.classes.length) { const cl = classList(el); for (const k of c.classes) if (!cl.includes(k)) return false; }
  for (const a of c.attrs) if (!attrMatch(el, a)) return false;
  for (const list of c.nots) if (list.some((p) => complexMatch(el, p, true))) return false;
  for (const list of c.ises) if (!list.some((p) => complexMatch(el, p, ignoreStates))) return false;
  for (const p of c.pseudo) {
    const sibs = siblingsOf(el);
    if (p.name === 'root') { if (el.tag !== 'html') return false; }
    else if (p.name === 'first-child') { if (sibs[0] !== el) return false; }
    else if (p.name === 'last-child') { if (sibs[sibs.length - 1] !== el) return false; }
    else if (p.name === 'only-child') { if (sibs.length !== 1) return false; }
    else if (p.name === 'nth-child' || p.name === 'nth-of-type') { /* treat as matching */ }
    else if (p.name === 'has') { /* unsupported: treat as matching */ }
    // unknown pseudos: treat as matching (best-effort)
  }
  return true;
}

// ignoreStates: when true, state pseudo-classes are treated as satisfied (used for :not()).
export function complexMatch(el, parsed, ignoreStates = false) {
  const parts = parsed.parts;
  if (!parts.length) return false;
  return matchFrom(el, parts, parts.length - 1, ignoreStates);
}

function matchFrom(el, parts, idx, ignoreStates) {
  if (!compoundMatch(el, parts[idx].compound, ignoreStates)) return false;
  if (idx === 0) return true;
  const comb = parts[idx].comb;
  if (comb === '>') return matchFrom(el.parent, parts, idx - 1, ignoreStates);
  if (comb === ' ') {
    for (let p = el.parent; p && p.tag !== '#root'; p = p.parent) if (matchFrom(p, parts, idx - 1, ignoreStates)) return true;
    return false;
  }
  const sibs = siblingsOf(el);
  const pos = sibs.indexOf(el);
  if (comb === '+') return pos > 0 && matchFrom(sibs[pos - 1], parts, idx - 1, ignoreStates);
  if (comb === '~') {
    for (let k = pos - 1; k >= 0; k--) if (matchFrom(sibs[k], parts, idx - 1, ignoreStates)) return true;
    return false;
  }
  return false;
}

export function specificity(parsed) {
  const [a, b, c] = parsed.spec;
  return a * 10000 + b * 100 + c;
}
