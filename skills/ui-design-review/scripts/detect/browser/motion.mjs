// Browser-pass rules: motion that only exists while the page runs.

function caretProbe() {
  const U = window.__udr;
  const out = [];
  const GLYPH = /^["']?[|▏▎▍▌▋▊▉█_▮⎸]["']?$/;
  for (const a of document.getAnimations()) {
    const fx = a.effect;
    if (!fx || !fx.target || fx.getComputedTiming().iterations !== Infinity) continue;
    const frames = fx.getKeyframes();
    if (!frames.some((k) => 'opacity' in k || 'visibility' in k)) continue;
    const el = fx.target;
    if (el.isContentEditable || el.closest('input, textarea, [contenteditable=""], [contenteditable="true"]')) continue;
    const pseudo = fx.pseudoElement || null;
    const cs = getComputedStyle(el, pseudo);
    const text = pseudo ? cs.content : U.text(el);
    let w, h;
    if (pseudo) { w = parseFloat(cs.width) || 0; h = parseFloat(cs.height) || 0; }
    else { const r = el.getBoundingClientRect(); w = r.width; h = r.height; }
    const glyph = GLYPH.test((text || '').trim());
    const bar = w > 0 && w <= 14 && h >= 8 && h >= 1.4 * w;
    if (glyph || bar) out.push(U.found(el, `A caret-like ${pseudo || 'element'} blinks forever (${a.animationName || 'animation'})`));
  }
  return out;
}

const blinkingCursor = {
  id: 'blinking-cursor',
  phase: 'desktop',
  why: 'A fake text cursor blinks forever on something you cannot type into: a "typing" flourish that pulls the eye and means nothing.',
  fix: 'Drop the fake caret; if a typing effect stays, stop it when the text is complete and under reduced motion.',
  async probe(ctx) { return ctx.probe(caretProbe); },
};

export default [blinkingCursor];
