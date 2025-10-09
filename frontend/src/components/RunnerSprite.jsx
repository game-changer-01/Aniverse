import React from 'react';

// Enhanced 2D runner sprite with improved animations and fun effects
export default function RunnerSprite({ src = '/images/runner.png', size = 120, className = '', running = false }) {
  return (
    <div className={`runner-sprite ${className} ${running ? 'is-running' : 'is-idle'}`} style={{ width: size, height: size }} aria-hidden>
      <div className="orient">
        <div className="character-container">
          <img src={src} alt="Luffy character" />
          <div className="sparkle-effect">
            <span className="sparkle spark-1">✨</span>
            <span className="sparkle spark-2">⭐</span>
            <span className="sparkle spark-3">✨</span>
          </div>
        </div>
        <div className="shadow" />
      </div>
      <style jsx>{
      `
        .runner-sprite { 
          position: relative; 
          display: inline-block; 
          pointer-events: none; 
          filter: drop-shadow(0 4px 12px rgba(255, 215, 0, 0.3));
        }
        .runner-sprite .orient { 
          width: 100%; 
          height: 100%; 
          transform: translateZ(0) rotateZ(var(--lean, 0deg)) scaleX(var(--scaleX, 1)); 
          transform-origin: center; 
        }
        .character-container {
          position: relative;
          width: 100%;
          height: 100%;
        }
        .runner-sprite img { 
          position: relative; 
          width: 100%; 
          height: 100%; 
          object-fit: contain; 
          animation: enhanced-bob 0.8s ease-in-out infinite; 
          image-rendering: -webkit-optimize-contrast; 
          animation-play-state: var(--run-state, paused);
          filter: brightness(1.1) contrast(1.1);
          z-index: 10;
        }
        .sparkle-effect {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: var(--sparkle-opacity, 0);
          z-index: 15;
        }
        .sparkle {
          position: absolute;
          font-size: 12px;
          animation: sparkle-float 2s ease-in-out infinite;
          animation-play-state: var(--sparkle-state, paused);
        }
        .spark-1 {
          top: 10%;
          left: 80%;
          animation-delay: 0s;
        }
        .spark-2 {
          top: 30%;
          left: 15%;
          animation-delay: 0.7s;
        }
        .spark-3 {
          top: 60%;
          left: 75%;
          animation-delay: 1.4s;
        }
        .runner-sprite .shadow { 
          position: absolute; 
          left: 10%; 
          right: 10%; 
          bottom: 2%; 
          height: 12%; 
          background: radial-gradient(ellipse at center, rgba(0,0,0,0.4), rgba(0,0,0,0) 70%); 
          transform-origin: center; 
          animation: enhanced-shadow-pulse 0.8s ease-in-out infinite; 
          filter: blur(2px); 
          animation-play-state: var(--run-state, paused);
        }
        .runner-sprite.is-running { 
          --run-state: running; 
          --sparkle-state: running;
          --sparkle-opacity: 1;
          filter: drop-shadow(0 6px 18px rgba(255, 215, 0, 0.5)) drop-shadow(0 0 20px rgba(255, 165, 0, 0.3));
        }
        .runner-sprite.is-idle { 
          --run-state: paused; 
          --sparkle-state: paused;
          --sparkle-opacity: 0.3;
          animation: idle-glow 3s ease-in-out infinite;
        }
        @keyframes enhanced-bob { 
          0% { transform: translateY(0px) scale(1); } 
          25% { transform: translateY(-3px) scale(1.02); }
          50% { transform: translateY(-8px) scale(1.05); } 
          75% { transform: translateY(-3px) scale(1.02); }
          100% { transform: translateY(0px) scale(1); } 
        }
        @keyframes enhanced-shadow-pulse { 
          0% { transform: scale(1) scaleY(0.8); opacity: 0.4; } 
          25% { transform: scale(1.1) scaleY(0.9); opacity: 0.5; }
          50% { transform: scale(0.9) scaleY(0.7); opacity: 0.6; } 
          75% { transform: scale(1.1) scaleY(0.9); opacity: 0.5; }
          100% { transform: scale(1) scaleY(0.8); opacity: 0.4; } 
        }
        @keyframes sparkle-float {
          0% { 
            transform: translateY(0px) rotate(0deg); 
            opacity: 0; 
          }
          20% { 
            opacity: 1; 
            transform: translateY(-5px) rotate(90deg);
          }
          80% { 
            opacity: 1; 
            transform: translateY(-15px) rotate(270deg);
          }
          100% { 
            transform: translateY(-20px) rotate(360deg); 
            opacity: 0; 
          }
        }
        @keyframes idle-glow {
          0% { 
            filter: drop-shadow(0 4px 12px rgba(255, 215, 0, 0.3)); 
          }
          50% { 
            filter: drop-shadow(0 6px 16px rgba(255, 215, 0, 0.5)) drop-shadow(0 0 25px rgba(255, 165, 0, 0.2)); 
          }
          100% { 
            filter: drop-shadow(0 4px 12px rgba(255, 215, 0, 0.3)); 
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .runner-sprite img, 
          .runner-sprite .shadow, 
          .sparkle,
          .runner-sprite.is-idle { 
            animation: none !important; 
          }
          .runner-sprite { 
            filter: drop-shadow(0 4px 12px rgba(255, 215, 0, 0.3)) !important; 
          }
        }`
        }</style>
    </div>
  );
}
