// Browser-pass rules: colour as it is actually painted.

function spotlightProbe() {
  const U = window.__udr;
  const COLOR = /(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\([^)]*\)|#[0-9a-f]{3,8}\b|\btransparent\b/gi;
  const texts = U.textEls(2).map((e) => e.getBoundingClientRect());
  const out = [];
  for (const el of document.body.querySelectorAll('*')) {
    if (!U.shown(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 240 || r.height < 160) continue;
    for (const pseudo of [null, '::before', '::after']) {
      const bi = getComputedStyle(el, pseudo).backgroundImage;
      if (!bi || !/radial-gradient\(/.test(bi) || /url\(/.test(bi)) continue;
      const stops = (bi.match(COLOR) || []).map((c) => U.rgba(c)).filter(Boolean);
      if (stops.length < 2 || stops.some((c) => c.a >= 0.45)) continue;
      const tinted = stops.some((c) => c.a >= 0.05 && Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b) >= 24);
      if (!tinted) continue;
      const overlaps = texts.some((t) => t.left < r.right && t.right > r.left && t.top < r.bottom && t.bottom > r.top);
      if (overlaps) { out.push(U.found(el, `Faint coloured radial glow${pseudo ? ' (' + pseudo + ')' : ''} behind text on a ${Math.round(r.width)}×${Math.round(r.height)}px box`)); break; }
    }
  }
  return out;
}

const radialSpotlight = {
  id: 'radial-spotlight',
  phase: 'desktop',
  why: 'A faint tinted radial glow sits behind the text: ambient decoration that stands in for hierarchy and muddies the surface.',
  fix: 'Remove the glow; separate the area with space, type scale, a real image or a flat surface change.',
  async probe(ctx) { return ctx.probe(spotlightProbe); },
};

function footprintProbe() {
  const U = window.__udr;
  const root = getComputedStyle(document.documentElement);
  const name = ['--accent', '--color-accent', '--brand', '--color-brand', '--primary', '--color-primary']
    .find((n) => root.getPropertyValue(n).trim());
  if (!name) return [];
  const probe = document.createElement('div');
  probe.style.cssText = `position:absolute;width:1px;height:1px;background-color:var(${name})`;
  document.body.appendChild(probe);
  const accent = U.rgba(getComputedStyle(probe).backgroundColor);
  probe.remove();
  if (!accent || accent.a < 0.5) return [];
  const same = (c) => c && c.a >= 0.9 && Math.abs(c.r - accent.r) <= 6 && Math.abs(c.g - accent.g) <= 6 && Math.abs(c.b - accent.b) <= 6;
  const vw = document.scrollingElement.clientWidth, vh = innerHeight;
  const fills = [];
  for (const el of document.body.querySelectorAll('*')) {
    if (!U.shown(el) || !same(U.rgba(getComputedStyle(el).backgroundColor))) continue;
    if (fills.some((f) => f.el.contains(el))) continue;
    const r = el.getBoundingClientRect();
    fills.push({ el, top: r.top + scrollY, bottom: r.bottom + scrollY, w: Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0)) });
  }
  if (!fills.length) return [];
  const pageH = document.documentElement.scrollHeight;
  let worst = { share: 0 };
  for (let y = 0; y < pageH; y += vh / 2) {
    let area = 0, big = null;
    for (const f of fills) {
      const h = Math.max(0, Math.min(f.bottom, y + vh) - Math.max(f.top, y));
      const a = h * f.w;
      area += a;
      if (!big || a > big.a) big = { el: f.el, a };
    }
    const share = area / (vw * vh);
    if (share > worst.share) worst = { share, el: big.el, y };
  }
  if (worst.share <= 0.05) return [];
  return [U.found(worst.el, `The accent (${name}) fills ${Math.round(worst.share * 100)}% of one viewport`)];
}

const accentFootprint = {
  id: 'accent-footprint',
  phase: 'desktop',
  why: 'The accent colour covers a large share of the screen; an accent that is everywhere stops pointing at anything.',
  fix: 'Keep accent fills to the few things that need attention (roughly 5% of a viewport at most); use the neutral surfaces for large areas.',
  async probe(ctx) { return ctx.probe(footprintProbe); },
};

export default [radialSpotlight, accentFootprint];
