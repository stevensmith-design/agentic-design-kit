// Colour parsing and maths. Colours are { r, g, b, a } with r,g,b in 0..255, a in 0..1.

const NAMED = {
  black: '#000000', white: '#ffffff', red: '#ff0000', green: '#008000', blue: '#0000ff',
  yellow: '#ffff00', orange: '#ffa500', purple: '#800080', gray: '#808080', grey: '#808080',
  silver: '#c0c0c0', navy: '#000080', teal: '#008080', maroon: '#800000', olive: '#808000',
  lime: '#00ff00', aqua: '#00ffff', cyan: '#00ffff', fuchsia: '#ff00ff', magenta: '#ff00ff',
  pink: '#ffc0cb', violet: '#ee82ee', indigo: '#4b0082', beige: '#f5f5dc', ivory: '#fffff0',
  linen: '#faf0e6', cornsilk: '#fff8dc', whitesmoke: '#f5f5f5', gainsboro: '#dcdcdc',
  lightgray: '#d3d3d3', lightgrey: '#d3d3d3', darkgray: '#a9a9a9', darkgrey: '#a9a9a9',
  dimgray: '#696969', slategray: '#708090', blueviolet: '#8a2be2', mediumpurple: '#9370db',
  rebeccapurple: '#663399', darkviolet: '#9400d3', orchid: '#da70d6', crimson: '#dc143c',
  tomato: '#ff6347', coral: '#ff7f50', gold: '#ffd700', khaki: '#f0e68c', tan: '#d2b48c',
  wheat: '#f5deb3', snow: '#fffafa', floralwhite: '#fffaf0', oldlace: '#fdf5e6',
  antiquewhite: '#faebd7', papayawhip: '#ffefd5', seashell: '#fff5ee',
};

function clamp(x, lo, hi) { return Math.min(hi, Math.max(lo, x)); }

function num(tok, scale) {
  tok = tok.trim();
  if (tok.endsWith('%')) return (parseFloat(tok) / 100) * scale;
  return parseFloat(tok);
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360; s = clamp(s, 0, 1); l = clamp(l, 0, 1);
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

function oklchToRgb(L, C, H) {
  const hr = (H * Math.PI) / 180;
  const a = C * Math.cos(hr), b = C * Math.sin(hr);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return lin.map((c) => 255 * clamp(c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055, 0, 1));
}

export function parseColor(input) {
  if (!input) return null;
  let s = String(input).trim().toLowerCase();
  if (s === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  if (NAMED[s]) s = NAMED[s];
  let m;
  if ((m = /^#([0-9a-f]{3,8})$/.exec(s))) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) return null;
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16),
      a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 };
  }
  if ((m = /^(rgba?|hsla?|oklch)\(([^)]*)\)$/.exec(s))) {
    const fn = m[1];
    const parts = m[2].replace(/\//g, ' / ').split(/[\s,]+/).filter(Boolean);
    let alpha = 1;
    const slash = parts.indexOf('/');
    let comps = parts;
    if (slash !== -1) { alpha = num(parts[slash + 1], 1); comps = parts.slice(0, slash); }
    else if (parts.length === 4) { alpha = num(parts[3], 1); comps = parts.slice(0, 3); }
    if (comps.length < 3 || comps.some((c) => c.includes('var('))) return null;
    if (fn.startsWith('rgb')) {
      return { r: clamp(num(comps[0], 255), 0, 255), g: clamp(num(comps[1], 255), 0, 255),
        b: clamp(num(comps[2], 255), 0, 255), a: clamp(alpha, 0, 1) };
    }
    if (fn.startsWith('hsl')) {
      const [r, g, b] = hslToRgb(parseFloat(comps[0]), num(comps[1], 1) / (comps[1].endsWith('%') ? 1 : 100), num(comps[2], 1) / (comps[2].endsWith('%') ? 1 : 100));
      return { r, g, b, a: clamp(alpha, 0, 1) };
    }
    if (fn === 'oklch') {
      const L = comps[0].endsWith('%') ? parseFloat(comps[0]) / 100 : parseFloat(comps[0]);
      const C = comps[1].endsWith('%') ? (parseFloat(comps[1]) / 100) * 0.4 : parseFloat(comps[1]);
      const H = parseFloat(comps[2]) || 0;
      const [r, g, b] = oklchToRgb(L, C, H);
      return { r, g, b, a: clamp(alpha, 0, 1) };
    }
  }
  return null;
}

// All colour literals inside a value (gradients, shadows, ...).
export function colorsIn(value) {
  if (!value) return [];
  const out = [];
  const re = /#[0-9a-f]{3,8}\b|(?:rgba?|hsla?|oklch)\([^)]*\)|\b[a-z]+\b/gi;
  let m;
  while ((m = re.exec(value))) {
    const c = parseColor(m[0]);
    if (c && (m[0][0] === '#' || m[0].includes('(') || NAMED[m[0].toLowerCase()] || m[0].toLowerCase() === 'transparent')) out.push({ ...c, src: m[0], index: m.index });
  }
  return out;
}

function lin(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }

export function luminance(c) { return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b); }

export function contrast(a, b) {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// Composite fg (with alpha) over an opaque bg.
export function over(fg, bg) {
  const a = fg.a ?? 1;
  return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
}

export function toOklch(c) {
  const l0 = lin(c.r), m0 = lin(c.g), s0 = lin(c.b);
  const l = Math.cbrt(0.4122214708 * l0 + 0.5363325363 * m0 + 0.0514459929 * s0);
  const m = Math.cbrt(0.2119034982 * l0 + 0.6806995451 * m0 + 0.1073969566 * s0);
  const s = Math.cbrt(0.0883024619 * l0 + 0.2817188376 * m0 + 0.6299787005 * s0);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.sqrt(A * A + B * B);
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H };
}

// "Chroma" on a 0..~130 scale comparable to the classic HSL-ish thresholds used in rule
// specs (≥ 24 / ≥ 30 / ≥ 40): max(r,g,b) − min(r,g,b).
export function spread(c) { return Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b); }

export function hslHue(c) {
  const r = c.r / 255, g = c.g / 255, b = c.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (d === 0) return null;
  let h;
  if (max === r) h = ((g - b) / d) % 6; else if (max === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
  h *= 60; if (h < 0) h += 360;
  return h;
}

export function hslSat(c) {
  const r = c.r / 255, g = c.g / 255, b = c.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  if (d === 0) return 0;
  return d / (1 - Math.abs(2 * l - 1));
}
