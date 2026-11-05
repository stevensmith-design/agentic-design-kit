// A library timeline registered on mount with no scoped context and no teardown.
// rules.md -> Motion, implementation point 2: cleanup scoped to the component and reverted on
// unmount; point 4: complete teardown, no leaked triggers or listeners. This is a correctness
// failure in the same class as a memory leak, not a taste call — every remount adds another
// live timeline, and the trigger outlives the component that created it.
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function Reveal({ children }) {
  const root = useRef(null);
  useEffect(() => {
    gsap.to('.reveal-item', {
      opacity: 1,
      y: 0,
      stagger: 0.08,
      scrollTrigger: { trigger: root.current, start: 'top 80%' },
    });
  }, []);
  return <div ref={root}>{children}</div>;
}
