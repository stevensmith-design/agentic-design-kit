#!/usr/bin/env node
// ui-design-review — rendered padding measurement
//
// Answers the one question no static scan can: does a container's DECLARED padding still exist
// at render? `scan.sh` reads the stylesheet and sees `padding: var(--space-5)` — correct,
// token-derived, clean. It cannot see that `margin-block-start:auto` in a fixed-height flex
// column absorbed the padding box's slack and pinned the last child flush to the edge. Nothing
// overflows, no scrollbar appears, and at page zoom a 2px gap and a 30px gap look identical.
//
// Usage:
//   node measure-padding.mjs <file-or-url> [--selector <css>] [--width 1280] [--height 900]
//                            [--mobile] [--tolerance 2] [--json]
//
// Default selector is '[data-measure]', falling back to a sweep of common padded containers so
// the script is useful without annotating a page first.
//
// Exit codes: 0 = padding survives everywhere, 1 = at least one container loses it,
//             2 = could not measure (see cdp.mjs — never report 2 as a pass).

import { render, parseCommonArgs, failUnmeasurable } from './cdp.mjs';

const DEFAULT_SELECTOR = '[data-measure]';
const FALLBACK_SELECTOR = [
  '[class*="card"]', '[class*="panel"]', '[class*="tile"]',
  '[class*="sheet"]', '[class*="modal"]', '[class*="dialog"]',
].join(',');

// Runs in the page. One record per matched container.
function probe(selector, fallbackSelector) {
  const num = (v) => parseFloat(v) || 0;
  let nodes = Array.from(document.querySelectorAll(selector));
  let usedFallback = false;
  if (!nodes.length) {
    nodes = Array.from(document.querySelectorAll(fallbackSelector));
    usedFallback = true;
  }

  const out = [];
  for (const el of nodes) {
    const cs = getComputedStyle(el);
    const pad = {
      top: num(cs.paddingTop), right: num(cs.paddingRight),
      bottom: num(cs.paddingBottom), left: num(cs.paddingLeft),
    };
    if (!pad.top && !pad.right && !pad.bottom && !pad.left) continue;

    const kids = Array.from(el.children).filter((k) => {
      const ks = getComputedStyle(k);
      if (ks.display === 'none' || ks.visibility === 'hidden') return false;
      // Out-of-flow children cannot be pinned by an auto margin; not the subject.
      if (ks.position === 'absolute' || ks.position === 'fixed') return false;
      const r = k.getBoundingClientRect();
      return r.width > 0 || r.height > 0;
    });
    if (!kids.length) continue;

    const box = el.getBoundingClientRect();
    const bw = {
      top: num(cs.borderTopWidth), right: num(cs.borderRightWidth),
      bottom: num(cs.borderBottomWidth), left: num(cs.borderLeftWidth),
    };

    // Measure to the padding edge (border box inset by the border), which is what the padding
    // value is defined against. Include each child's own margins: a child margin is legitimate
    // extra space, not a padding loss, and must not read as surplus hiding a deficit.
    let minTop = Infinity, minRight = Infinity, minBottom = Infinity, minLeft = Infinity;
    for (const k of kids) {
      const r = k.getBoundingClientRect();
      const ks = getComputedStyle(k);
      minTop = Math.min(minTop, (r.top - num(ks.marginTop)) - (box.top + bw.top));
      minLeft = Math.min(minLeft, (r.left - num(ks.marginLeft)) - (box.left + bw.left));
      minRight = Math.min(minRight, (box.right - bw.right) - (r.right + num(ks.marginRight)));
      minBottom = Math.min(minBottom, (box.bottom - bw.bottom) - (r.bottom + num(ks.marginBottom)));
    }

    let id = el.tagName.toLowerCase();
    if (el.id) id += '#' + el.id;
    else if (el.className && typeof el.className === 'string') {
      id += '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.');
    }

    // getComputedStyle resolves `margin-top:auto` to a used px value, so the string never reads
    // back as 'auto'. Ask the cascade instead of the used value.
    const autoMarginChild = kids.some((k) => {
      for (const sheet of Array.from(document.styleSheets)) {
        let rules;
        try { rules = sheet.cssRules; } catch { continue; }  // cross-origin sheet
        for (const rule of Array.from(rules || [])) {
          if (!rule.selectorText || !rule.style) continue;
          const m = rule.style.marginTop || rule.style.marginBlockStart;
          if (m !== 'auto') continue;
          try { if (k.matches(rule.selectorText)) return true; } catch {}
        }
      }
      return k.style.marginTop === 'auto' || k.style.marginBlockStart === 'auto';
    });

    out.push({
      id,
      flexColumn: cs.display.includes('flex') && cs.flexDirection === 'column',
      justify: cs.justifyContent,
      autoMarginChild,
      declared: pad,
      rendered: {
        top: Math.round(minTop * 10) / 10, right: Math.round(minRight * 10) / 10,
        bottom: Math.round(minBottom * 10) / 10, left: Math.round(minLeft * 10) / 10,
      },
    });
  }
  return { usedFallback, records: out };
}

const opts = parseCommonArgs(process.argv.slice(2));
if (!opts.target) {
  console.error('usage: measure-padding.mjs <file-or-url> [--selector <css>] [--width N] [--json]');
  process.exit(2);
}

let result;
try {
  result = await render({
    target: opts.target,
    probe,
    args: [opts.selector || DEFAULT_SELECTOR, FALLBACK_SELECTOR],
    width: opts.width, height: opts.height, mobile: opts.mobile,
  });
} catch (err) {
  failUnmeasurable(err, 'measure-padding');
}

const { usedFallback, records } = result;

if (opts.json) {
  console.log(JSON.stringify({ usedFallback, tolerance: opts.tolerance, records }, null, 2));
}

if (!records.length) {
  if (!opts.json) {
    console.log('measure-padding: no padded containers with in-flow children matched.');
    console.log('  Pass --selector to name them, or add data-measure to the containers under review.');
  }
  process.exit(0);
}

let failures = 0;
const SIDES = ['top', 'right', 'bottom', 'left'];

for (const r of records) {
  const bad = SIDES.filter((s) => r.declared[s] > 0 && (r.declared[s] - r.rendered[s]) > opts.tolerance);
  if (!bad.length) continue;
  failures++;
  if (opts.json) continue;
  console.log('');
  console.log(`  ✘ ${r.id}`);
  for (const s of bad) {
    const short = (r.declared[s] - r.rendered[s]).toFixed(1);
    console.log(`      padding-${s}: declared ${r.declared[s]}px · rendered ${r.rendered[s]}px  (short by ${short}px)`);
  }
  const why = [];
  if (r.flexColumn && r.autoMarginChild) why.push('auto margin on a child in a flex column absorbs the padding slack');
  if (r.flexColumn && r.justify === 'space-between') why.push('justify-content:space-between pools free space between children');
  if (why.length) console.log('      likely cause: ' + why.join('; '));
  console.log('      fix: give the pinned child explicit end spacing, or let the container height come from content.');
}

if (!opts.json) {
  console.log('');
  console.log('  ' + '-'.repeat(40));
  if (usedFallback) console.log('  (no [data-measure] match — swept common card/panel selectors instead)');
  if (failures) {
    console.log(`  ✘ ${failures} of ${records.length} container(s) lose declared padding at render.`);
  } else {
    console.log(`  ✔ ${records.length} container(s): declared padding survives at render (±${opts.tolerance}px).`);
  }
}

process.exit(failures ? 1 : 0);
