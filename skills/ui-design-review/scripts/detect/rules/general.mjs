import fs from 'node:fs';
import path from 'node:path';
import { isHidden } from '../lib/util.mjs';
import { splitTopLevel } from '../lib/css.mjs';

const skippedHeading = {
  id: 'skipped-heading',
  why: 'Heading levels skip (e.g. h1 → h3), which breaks the outline screen-reader users navigate by.',
  fix: 'Use the next level down and restyle it, rather than picking a level for its size.',
  kinds: ['html'],
  run(ctx, report) {
    let prev = 0;
    for (const el of ctx.elements) {
      const m = /^h([1-6])$/.exec(el.tag);
      if (!m || isHidden(ctx, el)) continue;
      const lvl = +m[1];
      if (prev && lvl > prev + 1) report({ el, message: `<h${prev}> is followed by <h${lvl}>.` });
      prev = lvl;
    }
  },
};

const FIELD = /\b(input|select|textarea)\b|\.(input|field|text-?field|form-control)\b|\[type/i;
const DISABLED = /:disabled\b|\[disabled\]|\[aria-disabled(=["']?true["']?)?\]|\.(is-)?disabled\b/i;
const VISUAL_CUES = /^(color|background|background-color|background-image|border|border-color|border-style|border-[a-z]+-color|text-decoration|text-decoration-line|outline|box-shadow|filter|font-style)$/;

function widthOf(decls) {
  let w = null;
  for (const d of decls) {
    if (d.prop === 'border-width' || /^border-(top|right|bottom|left)-width$/.test(d.prop)) w = d.value.split(/\s+/)[0];
    else if (d.prop === 'border' || /^border-(top|right|bottom|left)$/.test(d.prop)) {
      const t = splitTopLevel(d.value, ' ').find((x) => /^[\d.]+(px|em|rem)?$|^(thin|medium|thick)$/.test(x.trim()));
      if (t) w = t.trim();
      else if (/\bnone\b/.test(d.value)) w = '0';
    }
  }
  return w;
}

const inputStateShift = {
  id: 'input-state-shift',
  why: 'A form state changes geometry or relies on opacity alone.',
  fix: 'Keep border width constant across states (signal focus with an outline or colour); show disabled with colour and cursor, not opacity alone.',
  run(ctx, report) {
    for (const r of ctx.rules) {
      const focusSels = r.selectors.filter((s) => /:focus(-visible|-within)?\b/.test(s) && FIELD.test(s));
      if (focusSels.length) {
        const fw = widthOf(r.decls);
        if (fw != null) {
          const bases = new Set(focusSels.map((s) => s.replace(/:focus(-visible|-within)?\b/g, '').trim()));
          let bw = null;
          for (const b of ctx.rules) if (b.selectors.some((s) => bases.has(s.trim()))) { const w = widthOf(b.decls); if (w != null) bw = w; }
          if ((bw != null && bw !== fw) || (bw == null && parseFloat(fw) > 1)) {
            const d = r.decls.find((x) => /^border/.test(x.prop));
            report({ line: d.line, file: r.file, message: `Border width changes on focus (${bw ?? '?'} → ${fw}); the field shifts the layout.` });
          }
        }
      }
      if (r.selectors.some((s) => DISABLED.test(s))) {
        const op = r.decls.find((d) => d.prop === 'opacity');
        if (op && !r.decls.some((d) => VISUAL_CUES.test(d.prop))) {
          report({ line: op.line, file: r.file, message: 'Disabled state is shown by opacity alone.' });
        }
      }
    }
  },
};

const justified = {
  id: 'justified-text',
  why: 'Justified text without hyphenation opens uneven rivers of space between words.',
  fix: 'Use text-align: start, or add hyphens: auto (and a lang attribute) if justification is a deliberate choice.',
  run(ctx, report) {
    for (const r of ctx.rules) {
      const ta = r.decls.find((d) => d.prop === 'text-align' && /^justify/.test(d.value));
      if (!ta) continue;
      const hyph = ctx.rules.some((x) => (x === r || x.selectorText.trim() === r.selectorText.trim()) && x.decls.some((d) => /^(-webkit-)?hyphens$/.test(d.prop) && d.value === 'auto'));
      if (!hyph) report({ line: ta.line, file: r.file, snippet: `${r.selectorText.trim()} { text-align: ${ta.value} }` });
    }
  },
};


// A relative link to a file that is not there. Static and local only: it resolves the href against
// the page's own folder and never fetches anything. A folder counts when it holds an index.html,
// or when it exists at all (a server may list it); a missing path is the defect.
const deadRelativeLink = {
  id: 'dead-relative-link',
  why: 'A relative link points at a file that does not exist beside the page, so the action leads nowhere.',
  fix: 'Point it at the real page, or say in the report that the destination is not built yet.',
  kinds: ['html'],
  run(ctx, report) {
    const base = path.dirname(path.resolve(ctx.file));
    for (const el of ctx.elements) {
      if (el.tag !== 'a' || !el.attrs.href) continue;
      const href = el.attrs.href.trim();
      if (!href || /^(#|[a-z][a-z0-9+.-]*:|\/\/)/i.test(href)) continue;
      const clean = decodeURIComponent(href.split(/[?#]/)[0]);
      if (!clean) continue;
      const target = clean.startsWith('/') ? null : path.resolve(base, clean);
      if (!target) continue; // root-relative: depends on where the site is served
      if (fs.existsSync(target)) continue;
      report({ el, message: `href="${href}" resolves to nothing beside the page.` });
    }
  },
};

export default [skippedHeading, inputStateShift, justified, deadRelativeLink];
