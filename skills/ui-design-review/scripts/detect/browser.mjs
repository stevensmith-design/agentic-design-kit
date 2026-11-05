#!/usr/bin/env node
// detect/browser — the rendered half of the detector. Rules that need real layout, paint or
// script state (overflow, occlusion, reveal-on-scroll, wrapping, rhythm) run here, in whatever
// Chromium-based browser is installed, through the kit's own zero-dependency CDP driver
// (../cdp.mjs). No Playwright, no Puppeteer, no download.
//
//   node browser.mjs [--json] [--rules id,id] [--widths 320,768,1280,1920]
//                    [--design tokens.json|DESIGN.md] [--list] <file-dir-or-url>...
//
// Desktop is 1280×900 — the same desktop the static engine (detect.mjs) models. The width sweep
// is one width per band of the kit's committed breakpoints plus both extremes; when a project's
// DESIGN.md / tokens.json commits its own breakpoints, 1px either side of each is added.
//
// Exit: 0 clean · 1 findings · 2 could not measure (no browser, page failed to load). 2 is
// UNVERIFIED and must never be reported as clean. Static findings come from detect.mjs; a review
// runs both and merges them (a missing browser never blocks the static half).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openSession } from '../cdp.mjs';
import { parseHTML, walk } from './lib/html.mjs';
import { findBreakpoints } from './lib/tokens.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DESKTOP = { width: 1280, height: 900 };
const SWEEP = [320, 768, 1280, 1920];
const HEIGHT_FOR = (w) => (w < 640 ? 740 : w < 1024 ? 1024 : w < 1600 ? 900 : 1080);

function loadRegistry() {
  const reg = {};
  let header = null;
  for (const line of fs.readFileSync(path.join(HERE, 'registry.tsv'), 'utf8').split('\n')) {
    if (!line.trim() || line.startsWith('#')) continue;
    const cols = line.split('\t');
    if (!header) { header = cols; continue; }
    const row = Object.fromEntries(header.map((h, i) => [h, cols[i] ?? '']));
    reg[row.id] = row;
  }
  return reg;
}

async function loadRules() {
  const dir = path.join(HERE, 'browser');
  const rules = [];
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.mjs')).sort()) {
    const mod = await import(path.join(dir, f));
    for (const r of [].concat(mod.default)) rules.push(r);
  }
  return rules;
}

function collect(target, out, root) {
  if (/^(https?|file):/.test(target)) { out.push({ file: target, root: null, url: true }); return; }
  if (!fs.existsSync(target)) return;
  const st = fs.statSync(target);
  if (root == null) root = st.isFile() ? path.dirname(target) : target;
  if (st.isFile()) { if (/\.html?$/i.test(target)) out.push({ file: target, root }); return; }
  for (const e of fs.readdirSync(target).sort()) {
    if (e === 'node_modules' || e.startsWith('.')) continue;
    collect(path.join(target, e), out, root);
  }
}

// In-page helpers, installed before every probe. Probes reach them as window.__udr.
function BOOT() {
  if (window.__udr) return;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const g = canvas.getContext('2d', { willReadFrequently: true });
  const cache = new Map();
  const CONSENT = ['onetrust', 'cookiebot', 'cybotcookiebot', 'cookie-consent', 'cookie-banner', 'cookie-notice',
    'cookieconsent', 'consent-banner', 'consent-manager', 'consentmanager', 'cmpbox', 'usercentrics', 'didomi',
    'truste', 'gdpr', 'tealiumgdpr', 'transcend', 'borlabs', 'brlbs', 'qc-cmp', 'sp_message', 'klaro', 'osano', 'iubenda']
    .map((k) => `[id*="${k}" i], [class*="${k}" i]`).join(', ');
  const U = {
    path(el) {
      const out = [];
      for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
        let i = 0;
        for (let s = e.previousElementSibling; s; s = s.previousElementSibling) if (s.tagName === e.tagName) i++;
        out.unshift([e.tagName.toLowerCase(), i]);
      }
      return out;
    },
    sel(el) {
      const part = (e) => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') +
        [...e.classList].slice(0, 2).map((c) => '.' + c).join('');
      const parts = [];
      for (let e = el; e && e.nodeType === 1 && parts.length < 3 && e !== document.body; e = e.parentElement) parts.unshift(part(e));
      return parts.join(' > ');
    },
    // Any CSS colour → {r,g,b,a} through the canvas, so oklch / color-mix / named all normalise.
    rgba(str) {
      if (!str) return null;
      if (cache.has(str)) return cache.get(str);
      let out = null;
      const m = /^rgba?\(([^)]+)\)$/.exec(str.trim());
      if (m) {
        const p = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);
        out = { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
      } else {
        g.clearRect(0, 0, 1, 1);
        g.fillStyle = '#000'; g.fillStyle = str;
        g.fillRect(0, 0, 1, 1);
        const d = g.getImageData(0, 0, 1, 1).data;
        out = { r: d[0], g: d[1], b: d[2], a: d[3] / 255 };
      }
      cache.set(str, out);
      return out;
    },
    // Third-party consent / cookie UI is not the design under review: it is neither a subject
    // nor an occluder for any browser rule.
    consent(el) {
      return !!(el.closest && el.closest(CONSENT));
    },
    shown(el) {
      if (!el.isConnected || U.consent(el)) return false;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.visibility === 'collapse') return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    },
    srOnly(el) {
      for (let e = el; e && e !== document.body; e = e.parentElement) {
        const r = e.getBoundingClientRect();
        if (r.width <= 2 && r.height <= 2) return true;
        const cs = getComputedStyle(e);
        if (cs.clip && cs.clip !== 'auto' && /rect\(0/.test(cs.clip)) return true;
        if (cs.clipPath && /inset\(50%\)/.test(cs.clipPath)) return true;
        if (e.getAttribute('aria-hidden') === 'true') return true;
      }
      return false;
    },
    ownText(el) {
      let t = '';
      for (const n of el.childNodes) if (n.nodeType === 3) t += n.nodeValue;
      return t.replace(/\s+/g, ' ').trim();
    },
    text(el) { return (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim(); },
    // Distinct rendered line boxes of an element's text.
    lines(el) {
      const range = document.createRange();
      range.selectNodeContents(el);
      const tops = [];
      for (const r of range.getClientRects()) {
        if (r.width < 1 || r.height < 1) continue;
        if (!tops.some((t) => Math.abs(t.top - r.top) < r.height / 2)) tops.push({ top: r.top, height: r.height, rect: r });
      }
      return tops;
    },
    // Elements that carry visible text of their own.
    textEls(min = 1) {
      const out = [];
      const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const seen = new Set();
      for (let n = tw.nextNode(); n; n = tw.nextNode()) {
        if (n.nodeValue.trim().length < 1) continue;
        const el = n.parentElement;
        if (!el || seen.has(el) || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|TITLE)$/.test(el.tagName)) continue;
        seen.add(el);
        if (U.ownText(el).length >= min && U.shown(el) && !U.srOnly(el)) out.push(el);
      }
      return out;
    },
    found(el, message, extra = {}) { return { path: U.path(el), sel: U.sel(el), id: el.id || null, message, ...extra }; },
  };
  window.__udr = U;
}

// Wait (≤ 3s) while a full-viewport layer that is not consent UI sits on top of the page centre.
async function SETTLE_OVERLAYS() {
  const U = window.__udr;
  const covered = () => {
    const top = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
    for (let e = top; e && e !== document.body && e !== document.documentElement; e = e.parentElement) {
      const r = e.getBoundingClientRect();
      if (/fixed|absolute/.test(getComputedStyle(e).position) && r.width * r.height >= 0.8 * innerWidth * innerHeight) return !U.consent(e);
    }
    return false;
  };
  for (let t = 0; t < 3000 && covered(); t += 150) await new Promise((r) => setTimeout(r, 150));
}

// Map a DOM path back to a source line by walking the same tag / nth-of-type path through the
// kit's own parse of the file. Best effort: returns null when scripts or implied elements make
// the trees disagree, and then the selector stands in for the line.
function makeLocator(file) {
  let root = null;
  try { root = parseHTML(fs.readFileSync(file, 'utf8')); } catch { return () => null; }
  const all = [...walk(root)];
  return (f) => {
    let node = root;
    for (const [tag, idx] of f.path || []) {
      const kids = (node.children || []).filter((c) => c.tag === tag);
      node = kids[idx];
      if (!node) { node = null; break; }
    }
    if (node && node !== root) return node.line;
    if (f.id) { const byId = all.find((e) => e.attrs?.id === f.id); if (byId) return byId.line; }
    return null;
  };
}

export async function main(argv) {
  const args = argv.slice(2);
  const json = args.includes('--json');
  const list = args.includes('--list');
  const opt = (name) => { const i = args.indexOf(name); return i === -1 ? null : args[i + 1]; };
  const only = opt('--rules') ? new Set(opt('--rules').split(',').filter(Boolean)) : null;
  const design = opt('--design');
  const widthsArg = opt('--widths');
  const valued = new Set(['--rules', '--design', '--widths']);
  const targets = args.filter((a, i) => !a.startsWith('--') && !valued.has(args[i - 1]));
  const registry = loadRegistry();
  const rules = await loadRules();

  for (const r of rules) {
    if (!registry[r.id]) { console.error(`browser: rule ${r.id} has no registry row`); return 2; }
    if (registry[r.id].owner !== 'browser') { console.error(`browser: rule ${r.id} is owned by ${registry[r.id].owner}, not browser`); return 2; }
  }
  if (list) { for (const r of rules) console.log(`${r.id}\t${registry[r.id].severity}\t${registry[r.id].family}\t${r.phase}`); return 0; }
  if (!targets.length) { console.error('usage: browser.mjs [--json] [--rules id,id] [--widths 320,768] [--design path] <file-dir-or-url>...'); return 2; }

  const pages = [];
  for (const t of targets) collect(t, pages);
  if (!pages.length) { console.error('browser: no .html files or URLs found'); return 2; }

  const active = rules.filter((r) => !only || only.has(r.id));
  const ORDER = { load: 0, desktop: 1, sweep: 2, scroll: 3 };
  active.sort((a, b) => ORDER[a.phase] - ORDER[b.phase]);

  let session;
  try { session = await openSession(DESKTOP); } catch (e) {
    console.error(`browser: ${e.message}\n  UNVERIFIED — the browser pass did not run; this is not a clean result.`);
    return 2;
  }
  const findings = [];
  try {
    for (const page of pages) {
      const file = page.file;
      const shown = page.url ? file : path.relative(process.cwd(), path.resolve(file)) || file;
      const locate = page.url ? () => null : makeLocator(file);
      const srcLines = page.url ? [] : fs.readFileSync(file, 'utf8').split('\n');
      let widths = widthsArg ? widthsArg.split(',').map(Number).filter(Boolean) : [...SWEEP];
      if (!widthsArg && !page.url) {
        for (const bp of findBreakpoints({ file, root: page.root, design })) widths.push(bp - 1, bp);
      }
      widths = [...new Set(widths)].sort((a, b) => a - b);

      await session.setViewport(DESKTOP.width, DESKTOP.height);
      try { await session.goto(file, { settleMs: 400 }); } catch (e) {
        console.error(`browser: ${e.message}\n  UNVERIFIED — ${shown} was not measured.`);
        return 2;
      }
      const probe = async (fn, ...a) => { await session.evaluate(BOOT); return session.evaluate(fn, ...a); };
      // A full-screen loader that clears by itself is not a finding: give it up to 3s.
      await probe(SETTLE_OVERLAYS);
      const seen = new Set();
      const report = (rule, f) => {
        const line = f.line ?? locate(f) ?? 1;
        const key = `${rule.id}:${line}:${f.sel || ''}:${f.message}`;
        if (seen.has(key)) return;
        seen.add(key);
        const snippet = (f.snippet ?? srcLines[line - 1] ?? f.sel ?? '').trim().slice(0, 160);
        findings.push({ rule: rule.id, severity: f.severity || registry[rule.id].severity, family: registry[rule.id].family,
          file: shown, line, selector: f.sel || null, snippet, message: f.message || rule.why, fix: rule.fix, pass: 'browser' });
      };
      const ctx = { session, probe, widths, desktop: DESKTOP, file, url: page.url, heightFor: HEIGHT_FOR };
      const run = async (rule, fn) => {
        try { return await fn(); } catch (e) {
          const err = new Error(`rule ${rule.id} could not measure ${shown}: ${e.message}`);
          err.code = 2;
          throw err;
        }
      };
      // Phases in order: load → desktop → sweep (each width set once, every sweep rule probed at
      // it) → scroll (mutates the page by scrolling it, so it runs last).
      for (const rule of active.filter((r) => r.phase === 'load' || r.phase === 'desktop')) {
        for (const f of (await run(rule, () => rule.probe(ctx))) || []) report(rule, f);
      }
      const sweepers = active.filter((r) => r.phase === 'sweep');
      if (sweepers.length) {
        const merged = new Map(sweepers.map((r) => [r.id, new Map()]));
        for (const w of widths) {
          await session.setViewport(w, HEIGHT_FOR(w));
          for (const rule of sweepers) {
            for (const f of (await run(rule, () => rule.probe(ctx, w))) || []) {
              const k = `${f.sel}|${JSON.stringify(f.path)}`;
              const m = merged.get(rule.id);
              if (!m.has(k)) m.set(k, { f, widths: [] });
              m.get(k).widths.push(w);
            }
          }
        }
        await session.setViewport(DESKTOP.width, DESKTOP.height);
        for (const rule of sweepers) {
          for (const { f, widths: ws } of merged.get(rule.id).values()) report(rule, { ...f, message: `${f.message} (at ${ws.join(', ')}px)` });
        }
      }
      for (const rule of active.filter((r) => r.phase === 'scroll')) {
        for (const f of (await run(rule, () => rule.probe(ctx))) || []) report(rule, f);
      }
    }
  } catch (e) {
    if (e.code !== 2) throw e;
    console.error(`browser: ${e.message}\n  UNVERIFIED — not a clean result.`);
    return 2;
  } finally {
    await session.close();
  }

  findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  if (json) console.log(JSON.stringify({ files: pages.length, browser: session.chrome, findings }, null, 2));
  else {
    for (const f of findings) {
      console.log(`${f.file}:${f.line}  [${f.severity}] ${f.rule} — ${f.message}`);
      if (f.snippet) console.log(`    ${f.snippet}`);
      if (f.fix) console.log(`    fix: ${f.fix}`);
    }
    console.log(findings.length ? `\n${findings.length} finding(s) in ${pages.length} page(s).` : `clean: ${pages.length} page(s).`);
  }
  return findings.length ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv).then((code) => process.exit(code));
}
