import React, { useEffect, useRef } from 'react';
import anime from 'animejs';

export const FadeInUp = ({ children, delay = 0, duration = 800, className = '' }) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (elementRef.current) {
      // Set initial state
      anime.set(elementRef.current, {
        translateY: 30,
        opacity: 0
      });

      // Animate in
      anime({
        targets: elementRef.current,
        translateY: 0,
        opacity: 1,
        duration: duration,
        delay: delay,
        easing: 'easeOutCubic'
      });
    }
  }, [delay, duration]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
};

export const ScaleIn = ({ children, delay = 0, duration = 600, className = '' }) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (elementRef.current) {
      anime.set(elementRef.current, {
        scale: 0.8,
        opacity: 0
      });

      anime({
        targets: elementRef.current,
        scale: 1,
        opacity: 1,
        duration: duration,
        delay: delay,
        easing: 'easeOutElastic(1, .8)'
      });
    }
  }, [delay, duration]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
};

export const SlideInLeft = ({ children, delay = 0, duration = 700, className = '' }) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (elementRef.current) {
      anime.set(elementRef.current, {
        translateX: -50,
        opacity: 0
      });

      anime({
        targets: elementRef.current,
        translateX: 0,
        opacity: 1,
        duration: duration,
        delay: delay,
        easing: 'easeOutCubic'
      });
    }
  }, [delay, duration]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
};

export const PremiumButton = ({ children, onClick, className = '', variant = 'primary' }) => {
  const buttonRef = useRef(null);

  const handleMouseEnter = () => {
    if (buttonRef.current) {
      anime({
        targets: buttonRef.current,
        scale: 1.05,
        duration: 200,
        easing: 'easeOutCubic'
      });
    }
  };

  const handleMouseLeave = () => {
    if (buttonRef.current) {
      anime({
        targets: buttonRef.current,
        scale: 1,
        duration: 200,
        easing: 'easeOutCubic'
      });
    }
  };

  const handleClick = (e) => {
    if (buttonRef.current) {
      // Create ripple effect
      anime({
        targets: buttonRef.current,
        scale: [1, 0.95, 1],
        duration: 300,
        easing: 'easeOutCubic'
      });
    }
    if (onClick) onClick(e);
  };

  return (
    <button
      ref={buttonRef}
      className={`premium-button ${variant} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
      <style jsx>{`
        .premium-button {
          background: ${variant === 'primary' ? 'var(--color-accent)' : 'transparent'};
          border: 1px solid var(--color-accent);
          color: ${variant === 'primary' ? 'white' : 'var(--color-accent)'};
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-family: 'Noto Sans JP', sans-serif;
          font-weight: 400;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .premium-button:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }
        
        .premium-button.secondary {
          background: transparent;
          color: var(--color-accent);
        }
        
        .premium-button.secondary:hover {
          background: var(--color-accent-glow);
        }
      `}</style>
    </button>
  );
};

export default {
  FadeInUp,
  ScaleIn,
  SlideInLeft,
  PremiumButton
};