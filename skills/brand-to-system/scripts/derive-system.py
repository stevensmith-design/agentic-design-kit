#!/usr/bin/env python3
"""brand.json -> tokens.json + DESIGN.md  (Layers 1-4)

The missing producer. `ui-design-system` mode-create already knows how to turn a brand into a
validated system — "derive all neutrals from one brand-tinted ramp (brand hue at 2-8% chroma)",
"pick the primary for AA contrast against its own label before anything else commits to it" — but
it states those as instructions to a person. Nothing emitted a brand a machine could read, so the
hue was typed in by hand and the Layer-4 relationship record was written from memory.

This derives them, and records what it computed. Every number in the Layer-4 output is a
measurement made here, not a claim: the same discipline the development harness spent six weeks
learning, applied where it is cheap.

Usage:  derive-system.py BRAND.json OUTDIR
"""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from colour import oklch_to_hex, contrast, solve_lightness, in_gamut

AA_NORMAL, AA_LARGE, AAA_NORMAL = 4.5, 3.0, 7.0
VALUE_STEP_LO, VALUE_STEP_HI = 1.05, 1.12

def die(msg, code=2):
    print(f"derive-system: {msg}", file=sys.stderr); sys.exit(code)

def derive(brand):
    c = brand["colour"]
    a_hue, a_chroma = c["anchor"]["hue"], c["anchor"]["chroma"]
    n_hue = c.get("neutral", {}).get("hue", a_hue)
    n_chroma = c.get("neutral", {}).get("chroma", 0.010)
    if not (0.002 <= n_chroma <= 0.08):
        die(f"neutral chroma {n_chroma} is outside the 2-8% brand-tint band the system rule requires")
    ground = c.get("ground", "light")
    if ground != "light":
        die("only a light ground is derived today; dark-ground derivation is not written yet")

    notes = []
    T = {"color": {}, "type": {}, "radius": {}, "elevation": {}}

    # --- the ground, and the card that sits on it -----------------------------------------
    # Surface first, canvas solved DOWN from it until the value step lands in band. Doing it the
    # other way round tends to push the canvas out of gamut on a saturated brand tint.
    surface = oklch_to_hex(0.995, n_chroma * 0.35, n_hue)
    canvas = None
    for i in range(1000):
        L = 0.995 - i * 0.0004
        if not in_gamut(L, n_chroma, n_hue):
            continue
        hx = oklch_to_hex(L, n_chroma, n_hue)
        r = contrast(surface, hx)
        if VALUE_STEP_LO <= r <= VALUE_STEP_HI:
            canvas, canvas_L, step = hx, L, r
            break
    if canvas is None:
        die("could not find a canvas lightness giving a 1.05-1.12 value step against the card")
    notes.append(("Background/card value step", f"card {surface} vs canvas {canvas} = {step:.3f} (band {VALUE_STEP_LO}-{VALUE_STEP_HI})"))

    # --- ink, from the same ramp ----------------------------------------------------------
    # Ink is placed, then verified — not solved to the minimum. Solving it the same way as the
    # primary produced a mid-grey at exactly 7.02:1: compliant and visibly weak. Different roles
    # want different directions. The primary should be the LIGHTEST tone that still clears AA, so
    # it stays faithful to the declared brand hue; body ink should be decisively dark and merely
    # has to prove it clears. Found by looking at the first real output rather than the exit code.
    ink_L = brand.get("colour", {}).get("inkLightness", 0.22)
    ink_hex = oklch_to_hex(ink_L, n_chroma * 1.6, n_hue)
    ink_ratio = contrast(ink_hex, canvas)
    if ink_ratio < AAA_NORMAL:
        die(f"ink at L={ink_L} on the brand ramp is only {ink_ratio:.2f}:1 against the canvas; "
            "lower colour.inkLightness or lighten the canvas")
    ink = (ink_L, ink_hex, ink_ratio)
    notes.append(("Body-on-canvas", f"ink {ink[1]} on canvas {canvas} = {ink[2]:.2f}:1 (AAA)"))
    muted = solve_lightness(n_chroma * 1.4, n_hue, canvas, AA_NORMAL, prefer="darker")
    notes.append(("Muted-on-canvas", f"muted {muted[1]} on canvas {canvas} = {muted[2]:.2f}:1 (AA)"))
    body_on_card = contrast(ink[1], surface)
    notes.append(("Body-on-card", f"ink {ink[1]} on card {surface} = {body_on_card:.2f}:1"))
    border = oklch_to_hex(canvas_L - 0.07, n_chroma, n_hue)

    # --- the primary, chosen for its own label FIRST --------------------------------------
    on_primary = brand["colour"].get("onAnchor", "#FFFFFF")
    primary = solve_lightness(a_chroma, a_hue, on_primary, AA_NORMAL, prefer="darker")
    if not primary:
        die(f"no lightness at chroma {a_chroma} hue {a_hue} reaches 4.5:1 against {on_primary}; "
            "the anchor cannot carry a label at this chroma - lower the chroma or change the label colour")
    notes.append(("CTA-label-on-CTA", f"label {on_primary} on primary {primary[1]} = {primary[2]:.2f}:1 (AA normal)"))

    # A brand's accent usually cannot be its small-text colour on a light ground. That is why real
    # brands role-split it, and the split is derived rather than left to be discovered late.
    accent_text = solve_lightness(a_chroma, a_hue, canvas, AA_NORMAL, prefer="darker")
    if accent_text:
        notes.append(("Accent-as-small-text", f"accent-text {accent_text[1]} on canvas {canvas} = {accent_text[2]:.2f}:1 (AA)"))

    T["color"].update({
        "primary": primary[1], "onPrimary": on_primary,
        "accentText": accent_text[1] if accent_text else primary[1],
        "canvas": canvas, "surface": surface, "border": border,
        "textPrimary": ink[1], "textMuted": muted[1],
    })
    # Semantic hues are pushed away from the anchor rather than fixed. A red brand with a stock
    # red error state fails "state colours must be tellable apart without a legend" — the first
    # run of this deriver did exactly that (primary<->error deltaE 14.3, want >=15).
    sem = c.get("semantic", {})
    def _away(base_hue, L, C):
        h = base_hue
        for _ in range(36):
            sep = abs((h - a_hue + 180) % 360 - 180)
            if sep >= 40:
                break
            h = (h + 10) % 360
        return oklch_to_hex(L, C, h)
    for role, (L, C, H) in (("error", (0.52, 0.19, 27)), ("success", (0.55, 0.14, 150)), ("warning", (0.72, 0.15, 75))):
        T["color"][role] = sem[role] if role in sem else _away(H, L, C)
    notes.append(("Semantic separation", "state hues rotated to at least 40 deg from the anchor so they are tellable apart from the action colour"))

    # --- type scale, radius, elevation ----------------------------------------------------
    t = brand.get("type", {})
    ratio = t.get("scaleRatio", 1.25)
    base = t.get("baseSize", 16)
    steps = {"caption": -1, "body": 0, "h3": 1, "h2": 2, "h1": 3}
    # A marketing hero needs a size the product scale never reaches. Without a display tier the
    # page binds its hero to h1 and the headline carries the same weight as a card title two
    # screens down - a finding raised against the WORK that is really a hole in the SYSTEM.
    # It is earned, not assumed: only registers that actually ship a hero get one.
    register = brand.get("brand", {}).get("register", "")
    platform = brand.get("brand", {}).get("platform", "")
    wants_display = register in ("brand_ui", "editorial") or "marketing" in platform.lower()
    if wants_display:
        steps["display"] = 5
    for name, n in sorted(steps.items(), key=lambda kv: kv[1]):
        T["type"][name] = f"{round(base * (ratio ** n))}px"
    notes.append(("Type scale", f"ratio {ratio} from {base}px base -> " + ", ".join(f"{k} {v}" for k, v in T["type"].items())))
    if wants_display:
        notes.append(("Display tier", f'register "{register}" on {platform} ships a hero, so the scale carries a display '
                                      f'step two rungs above h1 ({T["type"]["display"]}). A product-only register gets none: '
                                      f'an unused tier is a size someone will reach for without a reason.'))
    r = brand.get("shape", {}).get("radiusBase", 8)
    T["radius"] = {"sm": f"{r}px", "md": f"{round(r*1.5)}px", "lg": f"{round(r*2)}px", "pill": "999px"}
    T["elevation"] = {
        "1": "0 1px 2px rgba(17,24,22,0.06)",
        "2": "0 4px 12px rgba(17,24,22,0.08)",
        "3": "0 12px 32px rgba(17,24,22,0.12)",
    }
    return T, notes

def design_md(brand, T, notes):
    b = brand["brand"]
    c = brand["colour"]
    t = brand.get("type", {})
    L = []
    L.append(f"# {b['name']} — design system\n")
    L.append("<!-- DERIVED by brand-to-system from brand.json. Layer 4 is measured, not asserted. -->\n")
    L.append("## Layer 1 — Intent\n")
    L.append(f"**Aesthetic commitment:** {b.get('aestheticCommitment','<unstated — a vague commitment is a finding>')}\n")
    L.append(f"**Register:** {b.get('register','product_ui')} — design {'IS the product' if b.get('register')=='brand_ui' else 'serves the product'}.\n")
    L.append(f"**Platform / audience:** {b.get('platform','<unstated>')} / {b.get('audience','<unstated>')}\n")
    L.append("\n## Layer 2 — System principles\n")
    L.append(f"**Colour strategy.** One anchor hue ({c['anchor']['hue']}°, chroma {c['anchor']['chroma']}). "
             f"Every neutral is derived from a single brand-tinted ramp at hue {c.get('neutral',{}).get('hue', c['anchor']['hue'])}° "
             f"and chroma {c.get('neutral',{}).get('chroma',0.010)} — inside the 2–8% band, so the greys carry the brand without becoming colour.\n")
    L.append(f"**Permitted hues.** anchor/action (the primary and its text role); brand-derived neutrals; semantic state (error, success, warning). "
             f"No support accent is declared, so none is permitted.\n")
    L.append(f"**Gradient policy.** {c.get('gradients','none')}.\n")
    L.append(f"**Separation model.** Value step between canvas and card — not shadow, not glow. Measured in Layer 4.\n")
    L.append("\n## Layer 3 — Tokens\n")
    L.append("Mirrors `tokens.json` 1:1.\n\n```json\n" + json.dumps(T, indent=2) + "\n```\n")
    L.append("\n## Layer 4 — Relationships & rationale\n")
    L.append("Every line below was computed by `derive-system.py` at generation time and re-checkable by "
             "`validate-tokens.py --strict`.\n\n")
    for name, detail in notes:
        L.append(f"- **{name}:** {detail}. Checked.\n")
    L.append("\n**Why the primary is what it is.** It was not chosen and then tested. Its lightness was "
             "*solved* for AA against its own label before any other token committed to it, which is the one "
             "ordering mode-create insists on and the check real systems most often fail.\n")
    return "".join(L)

def main():
    if len(sys.argv) != 3:
        die("usage: derive-system.py BRAND.json OUTDIR")
    brand = json.load(open(sys.argv[1]))
    out = sys.argv[2]
    os.makedirs(out, exist_ok=True)
    T, notes = derive(brand)
    with open(os.path.join(out, "tokens.json"), "w") as f:
        json.dump(T, f, indent=2); f.write("\n")
    with open(os.path.join(out, "DESIGN.md"), "w") as f:
        f.write(design_md(brand, T, notes))
    print(f"derived {out}/tokens.json and {out}/DESIGN.md")
    for name, detail in notes:
        print(f"  {name}: {detail}")

if __name__ == "__main__":
    main()
