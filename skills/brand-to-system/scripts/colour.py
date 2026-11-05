"""OKLCH <-> sRGB and WCAG contrast. Stdlib only, matching validate-tokens.py's constraint.

Colour lives in OKLCH here because the two rules the design system turns on are stated in OKLCH
terms: a neutral ramp is "the brand hue at 2-8% chroma", and picking a primary means moving
lightness until a contrast ratio is met. Both are one-line operations in OKLCH and guesswork in hex.
"""
import math

def oklch_to_srgb(L, C, H):
    """L in 0..1, C in 0..~0.4, H in degrees. Returns (r,g,b) floats 0..1, unclamped."""
    a = C * math.cos(math.radians(H))
    b = C * math.sin(math.radians(H))
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b
    l, m, s = l_ ** 3, m_ ** 3, s_ ** 3
    r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    bb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    return (r, g, bb)

def _gamma(u):
    u = max(0.0, min(1.0, u))
    return 12.92 * u if u <= 0.0031308 else 1.055 * (u ** (1 / 2.4)) - 0.055

def oklch_to_hex(L, C, H):
    r, g, b = oklch_to_srgb(L, C, H)
    return "#" + "".join(f"{round(_gamma(v) * 255):02X}" for v in (r, g, b))

def in_gamut(L, C, H, tol=0.001):
    return all(-tol <= v <= 1 + tol for v in oklch_to_srgb(L, C, H))

def hex_to_rgb(h):
    h = h.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))

def relative_luminance(hexstr):
    def lin(u):
        return u / 12.92 if u <= 0.04045 else ((u + 0.055) / 1.055) ** 2.4
    r, g, b = (lin(v) for v in hex_to_rgb(hexstr))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def contrast(a, b):
    la, lb = relative_luminance(a), relative_luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)

def solve_lightness(C, H, against, target, prefer="darker", lo=0.03, hi=0.99, steps=2000):
    """Find the OKLCH lightness whose colour meets `target` contrast against `against`.

    This is the rule mode-create states and no tool performed: 'pick the primary for AA contrast
    against its own label BEFORE anything else commits to it'. Done by hand it is a guess; done
    here it is a search, and it returns the LEAST extreme lightness that clears the bar so the
    brand stays as close to its stated anchor as the contrast requirement allows.
    """
    # Walk from the light end down and STOP at the first lightness that clears the bar. The
    # earlier version kept walking and returned the darkest solution, which drove every text
    # role to #000000 — no brand tint, and textPrimary and textMuted collapsed into one colour.
    # The docstring above already claimed "the LEAST extreme lightness that clears the bar"; the
    # code did the opposite. Fixed on the first real brand this was run against.
    order = range(steps, -1, -1) if prefer == "darker" else range(steps + 1)
    for i in order:
        L = lo + (hi - lo) * i / steps
        if not in_gamut(L, C, H):
            continue
        hx = oklch_to_hex(L, C, H)
        if contrast(hx, against) >= target:
            return (L, hx, contrast(hx, against))
    return None
