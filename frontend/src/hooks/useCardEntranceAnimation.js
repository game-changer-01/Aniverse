import { useEffect } from 'react';
import anime from 'animejs';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export function useCardEntranceAnimation(deps = []) {
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (reduced) return;
    anime({
      targets: '.rec-card',
      opacity: [0,1],
      translateY: [20,0],
      easing: 'easeOutQuad',
      delay: anime.stagger(60)
    });
  }, deps); // trigger when recommendations change
}
