// The same work done correctly: a scoped context reverted on unmount, and an explicit
// reduced-motion branch through matchMedia. Both detectors must stay silent.
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function Reveal({ children }) {
  const root = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.to('.reveal-item', {
          opacity: 1, y: 0, stagger: 0.08,
          scrollTrigger: { trigger: root.current, start: 'top 80%' },
        });
      });
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('.reveal-item', { opacity: 1, y: 0 });
      });
    }, root);
    return () => ctx.revert();
  }, []);
  return <div ref={root}>{children}</div>;
}
