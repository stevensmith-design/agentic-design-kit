// Scroll-linked motion with no reduced-motion branch anywhere in the file.
// rules.md -> Motion, implementation point 3: an explicit (prefers-reduced-motion: reduce) branch,
// not a global duration multiplier. Cleanup here is correct; the accessibility branch is what is
// missing, so the two detectors are independent.
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function Parallax({ target }) {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(target, { yPercent: -20, scrollTrigger: { scrub: true } });
    });
    return () => ctx.revert();
  }, [target]);
  return null;
}
