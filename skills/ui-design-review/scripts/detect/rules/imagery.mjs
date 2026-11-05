import { splitTopLevel } from '../lib/css.mjs';
import { colorsIn } from '../lib/color.mjs';
import { closest } from '../lib/html.mjs';
import { norm, textOf } from '../lib/util.mjs';

function onGrid(v) { const r = ((v % 25) + 25) % 25; return Math.min(r, 25 - r) <= 0.5; }

const organicClip = {
  id: 'organic-clip-path',
  why: 'An image or block is masked with a hand-wavy organic or torn edge — a decorative tell that also crops content unpredictably.',
  fix: 'Use a plain rectangle or a simple geometric cut; let the image itself carry the character.',
  run(ctx, report) {
    for (const r of ctx.rules) for (const d of r.decls) {
      if (!/^(-webkit-)?(clip-path|mask|shape-outside)$/.test(d.prop)) continue;
      const pm = /path\(\s*["']([^"']*)["']/i.exec(d.value);
      if (pm && (pm[1].match(/[CSQTAcsqta]/g) || []).length >= 3) { report({ line: d.line, file: r.file }); continue; }
      const poly = /polygon\(([^)]*)\)/i.exec(d.value);
      if (!poly) continue;
      const pts = splitTopLevel(poly[1], ',').map((p) => p.trim().split(/\s+/).map((x) => parseFloat(x))).filter((p) => p.length === 2 && p.every(Number.isFinite));
      if (pts.length < 10) continue;
      const offGrid = pts.every(([x, y]) => !onGrid(x) && !onGrid(y));
      const rectilinear = pts.every((p, i) => { const q = pts[(i + 1) % pts.length]; return p[0] === q[0] || p[1] === q[1]; });
      if (offGrid && !rectilinear) report({ line: d.line, file: r.file });
    }
  },
};

const buriedRaster = {
  id: 'buried-raster',
  why: 'An image is loaded and then buried under a near-opaque gradient — the photo costs bandwidth and adds nothing visible.',
  fix: 'Lighten the overlay (≤ 0.6 alpha) so the image reads, or drop the image.',
  run(ctx, report) {
    for (const r of ctx.rules) {
      if (r.decls.some((x) => x.prop === 'background-blend-mode')) continue;
      for (const d of r.decls) {
        if (!/^background(-image)?$/.test(d.prop) || !/url\(/i.test(d.value)) continue;
        const layers = splitTopLevel(d.value, ',');
        const firstUrl = layers.findIndex((l) => /url\(/i.test(l));
        // gradient layers listed before the image (top-most first)
        const above = [];
        let depth = 0, cur = '';
        for (const ch of d.value.slice(0, d.value.search(/url\(/i))) { cur += ch; }
        const grads = cur.match(/(?:linear|radial|conic)-gradient\((?:[^()]|\([^()]*\))*\)/gi) || [];
        for (const g of grads) above.push(g);
        if (!above.length || firstUrl < 0) continue;
        if (above.some((g) => { const cs = colorsIn(g); return cs.length && cs.every((c) => c.a >= 0.9); })) {
          report({ line: d.line, file: r.file, snippet: `${r.selectorText.trim()} { ${d.prop}: gradient(…), url(…) }` });
        }
        void depth;
      }
    }
  },
};

const PRIMS = new Set(['rect', 'circle', 'ellipse', 'polygon']);
function svgSize(el) {
  const w = parseFloat(el.attrs.width), h = parseFloat(el.attrs.height);
  if (Number.isFinite(w) && Number.isFinite(h)) return [w, h];
  const vb = (el.attrs.viewbox || '').split(/[\s,]+/).map(Number);
  return vb.length === 4 ? [vb[2], vb[3]] : [0, 0];
}
function* desc(el) { for (const c of el.children || []) { if (c.tag === '#text') continue; yield c; yield* desc(c); } }

const shapeIllustration = {
  id: 'shape-assembled-illustration',
  why: 'An "illustration" assembled from a pile of circles and rectangles — reads as placeholder art.',
  fix: 'Use a real image, a purposeful diagram, or nothing; if it is a chart, label it as one.',
  kinds: ['html'],
  run(ctx, report) {
    for (const el of ctx.elements) {
      if (el.tag !== 'svg' || closest(el, (e) => e.tag === 'svg')) continue;
      const [w, h] = svgSize(el);
      if (w < 200 || h < 200) continue;
      const all = [...desc(el)];
      if (all.some((c) => c.tag === 'pattern')) continue;
      const prims = all.filter((c) => PRIMS.has(c.tag));
      const texts = all.filter((c) => c.tag === 'text').length;
      const fills = new Set(prims.map((c) => (c.attrs.fill || (/fill:\s*([^;]+)/.exec(c.attrs.style || '') || [])[1] || '').toLowerCase()).filter(Boolean));
      if (prims.length >= 8 && fills.size >= 3 && texts <= 2) report({ el, message: `${prims.length} primitive shapes in ${fills.size} fills at ${w}×${h}.` });
    }
  },
};

function accessibleName(el) {
  return !!(el.attrs['aria-label'] || el.attrs['aria-labelledby'] || norm(textOf(el)));
}

const decorativeUnlabelled = {
  id: 'decorative-graphic-unlabelled',
  why: 'An inline SVG or canvas has no accessible name and is not hidden, so assistive tech may announce it as an unnamed image.',
  fix: 'Add aria-hidden="true" if it is decoration, or role="img" with an aria-label if it carries meaning.',
  kinds: ['html'],
  run(ctx, report) {
    for (const el of ctx.elements) {
      if (el.tag !== 'svg' && el.tag !== 'canvas') continue;
      if (el.tag === 'svg' && closest(el, (e) => e.tag === 'svg')) continue;
      const a = el.attrs;
      if (a['aria-label'] || a['aria-labelledby'] || a['aria-hidden'] === 'true' || /^(presentation|none)$/.test(a.role || '')) continue;
      if (el.tag === 'svg' && (el.children || []).some((c) => c.tag === 'title')) continue;
      if (el.tag === 'canvas' && norm(textOf(el))) continue;
      if (closest(el, (e) => (e.tag === 'a' || e.tag === 'button') && accessibleName(e))) continue;
      if (closest(el, (e) => e.attrs['aria-hidden'] === 'true')) continue;
      report({ el });
    }
  },
};

const heavyVideo = {
  id: 'heavy-video',
  why: 'Video that plays with sound or shows a blank frame while loading.',
  fix: 'Autoplaying video must be muted (and playsinline); every video needs a poster image.',
  kinds: ['html'],
  run(ctx, report) {
    for (const el of ctx.elements) {
      if (el.tag !== 'video') continue;
      if ('autoplay' in el.attrs && !('muted' in el.attrs)) report({ el, message: 'Autoplaying video is not muted.' });
      if (!('poster' in el.attrs)) report({ el, message: 'Video has no poster image.' });
    }
  },
};

export default [organicClip, buriedRaster, shapeIllustration, decorativeUnlabelled, heavyVideo];
