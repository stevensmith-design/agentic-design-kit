import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { visibleText, textElements, norm, isHidden } from '../lib/util.mjs';
import { classList, textOf } from '../lib/html.mjs';

function lineOfText(ctx, needle) {
  const idx = ctx.src.indexOf(needle);
  return idx === -1 ? 1 : ctx.src.slice(0, idx).split('\n').length;
}

const placeholderPeople = {
  id: 'placeholder-people',
  why: 'Placeholder names or filler text shipped as real content.',
  fix: 'Use real content, or a clearly labelled placeholder ("[Customer quote — pending approval]").',
  kinds: ['html'],
  run(ctx, report) {
    const t = visibleText(ctx);
    const re = /\b(?:John|Jane) Doe\b|\bAcme(?: Inc\.?| Corp\.?| Co\.?)?\b|\blorem ipsum\b/gi;
    let m;
    const seen = new Set();
    while ((m = re.exec(t))) {
      const k = m[0].toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      report({ line: lineOfText(ctx, m[0]), message: `Placeholder "${m[0]}" in visible copy.` });
    }
  },
};

const CADENCE = /\b(?:not|no)\s+[^.!?\n]{1,40}[.!?]\s+[^.!?\n]{1,40}[.!?]|\b[^.!?\n]{1,40}[.!?]\s+just\s+[^.!?\n]{1,30}[.!?]|\bit'?s not\s+[^.!?\n,]{1,40},\s*it'?s\s+[^.!?\n]{1,40}[.!?]/gi;

const cadence = {
  id: 'forced-contrast-cadence',
  why: 'Copy leans on the "Not X. Y." slogan cadence again and again — a strong generated-copy tell.',
  fix: 'Say what the thing is, plainly, once. Keep at most one contrast line on a page.',
  kinds: ['html'],
  run(ctx, report) {
    const t = visibleText(ctx);
    const hits = [];
    for (const line of t.split(/\n+/)) {
      const s = norm(line);
      if (!s) continue;
      CADENCE.lastIndex = 0;
      if (CADENCE.test(s)) hits.push(s);
      else if (/^(not|no)\s+[^.!?]{1,40}[.!?]\s*$/i.test(s)) hits.push(s);
    }
    // pair a lone "Not X." block with the following short line
    if (hits.length >= 3) report({ line: lineOfText(ctx, hits[0].split(/[.!?]/)[0]), message: `${hits.length} contrast-slogan lines, e.g. "${hits[0]}".` });
  },
};

const STOP = new Set(['the', 'a', 'an', 'community', 'local', 'national', 'movie', 'home', 'opera', 'musical', 'our',
  'this', 'that', 'at', 'in', 'street', 'open-air', "children's", 'film', 'royal', 'dinner', 'puppet', 'operating',
  'lecture', 'black-box', 'outdoor', 'city', 'state', 'public', 'old', 'new', 'grand', 'little', 'small', 'big', 'your',
  'their', 'his', 'her', 'its', 'my', 'to', 'of', 'and', 'or', 'immersive', 'dance', 'youth', 'regional']);

const theater = {
  id: 'theater-phrase',
  why: 'Something is dismissed as "X theater" — a stock rhetorical move that asserts rather than explains.',
  fix: 'Say what is wasteful about it, concretely.',
  kinds: ['html'],
  run(ctx, report) {
    const t = visibleText(ctx);
    const re = /\b([a-z][\w'-]*)[\s-]+theat(?:er|re)s?\b/gi;
    let m;
    while ((m = re.exec(t))) {
      const w = m[1].toLowerCase();
      const last = w.split('-').pop();
      if (STOP.has(w) || STOP.has(last)) continue;
      report({ line: lineOfText(ctx, m[0]), message: `"${m[0]}"` });
    }
  },
};

const repeatedText = {
  id: 'repeated-container-text',
  why: 'The same text appears in several different slots of one container (badge, heading, meta) — filler repetition that says nothing new.',
  fix: 'Give each slot its own job, or remove the slots that only repeat.',
  kinds: ['html'],
  run(ctx, report) {
    const leaves = textElements(ctx);
    const byText = new Map();
    for (const { el, text } of leaves) {
      if (text.length < 2 || /^[\d\s.,%$€¥£+-]+$/.test(text)) continue;
      const k = text.toLowerCase();
      if (!byText.has(k)) byText.set(k, []);
      byText.get(k).push(el);
    }
    const reported = new Set();
    for (const [text, els] of byText) {
      if (els.length < 3) continue;
      // deepest common container holding ≥3 occurrences with ≥3 distinct slot signatures
      const anc = (e) => { const a = []; for (let p = e.parent; p && p.tag !== '#root'; p = p.parent) a.push(p); return a; };
      const counts = new Map();
      for (const e of els) for (const a of anc(e)) { if (!counts.has(a)) counts.set(a, []); counts.get(a).push(e); }
      let best = null, bestDepth = -1;
      for (const [a, list] of counts) {
        if (['html', 'body', 'main'].includes(a.tag) || list.length < 3) continue;
        const sigs = new Set(list.map((e) => `${e.tag}.${classList(e).sort().join('.')}`));
        if (sigs.size < 3) continue;
        const depth = anc(a).length;
        if (depth > bestDepth) { best = a; bestDepth = depth; }
      }
      if (best && !reported.has(best)) { reported.add(best); report({ el: best, message: `"${els[0] && text}" repeated in ${counts.get(best).length} slots of one <${best.tag}>.` }); }
    }
  },
};

let OPENERS = null;
function openers() {
  if (OPENERS) return OPENERS;
  const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data', 'banned-openers.tsv');
  OPENERS = fs.readFileSync(file, 'utf8').split('\n')
    .filter((l) => l.trim() && !l.startsWith('#') && !l.startsWith('pattern\t'))
    .map((l) => { const [p, idea] = l.split('\t'); return { re: new RegExp(p, 'i'), idea: (idea || '').trim() }; });
  return OPENERS;
}

function nextElement(el) {
  const sibs = el.parent.children;
  for (let k = sibs.indexOf(el) + 1; k < sibs.length; k++) if (sibs[k].tag !== '#text') return sibs[k];
  return null;
}

const bannedOpener = {
  id: 'banned-opener',
  why: 'The page opens on a stock line that could head any product page; it tells the reader nothing about this one.',
  fix: 'Open with the specific thing: what it is, for whom, and what changes for them. Ask for the concrete noun rather than padding.',
  kinds: ['html'],
  run(ctx, report) {
    const heads = ctx.elements.filter((e) => /^h[12]$/.test(e.tag) && !isHidden(ctx, e));
    const head = heads.find((e) => e.tag === 'h1') || heads[0];
    if (!head) return;
    const lines = [head];
    const lede = nextElement(head);
    if (lede && lede.tag === 'p') lines.push(lede);
    for (const el of lines) {
      const t = norm(textOf(el));
      const hit = openers().find((o) => o.re.test(t));
      if (hit) report({ el, message: `"${t.slice(0, 60)}" — ${hit.idea}.` });
    }
  },
};

export default [placeholderPeople, cadence, theater, repeatedText, bannedOpener];
