import { useEffect } from 'react';
import gsap from 'gsap';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export function useRoadmapAnimation(containerRef) {
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (!containerRef.current) return;
    if (reduced) return; // skip heavy animations
    const ctx = gsap.context(() => {
      gsap.from('.season-node', { opacity:0, y:30, stagger:0.15, duration:0.8, ease:'power3.out' });
    }, containerRef);
    return () => ctx.revert();
  }, [containerRef, reduced]);
}
