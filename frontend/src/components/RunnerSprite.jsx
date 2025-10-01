import React from 'react';

// Simple 2D runner sprite using a single image with bobbing/shadow to simulate running
export default function RunnerSprite({ src = '/images/runner.png', size = 140, className = '', running = false }) {
  return (
    <div className={`runner-sprite ${className} ${running ? 'is-running' : 'is-idle'}`} style={{ width: size, height: size }} aria-hidden>
      <div className="orient">
        <img src={src} alt="Runner character" />
        <div className="shadow" />
      </div>
      <style jsx>{
      `
        .runner-sprite { position:relative; display:inline-block; pointer-events:none; }
        .runner-sprite .orient { width:100%; height:100%; transform: translateZ(0) rotateZ(var(--lean, 0deg)) scaleX(var(--scaleX, 1)); transform-origin:center; }
        .runner-sprite img { position:relative; width:100%; height:100%; object-fit:contain; animation: run-bob 0.6s ease-in-out infinite; image-rendering: -webkit-optimize-contrast; animation-play-state: var(--run-state, paused); }
        .runner-sprite .shadow { position:absolute; left:15%; right:15%; bottom:6%; height:10%; background: radial-gradient(ellipse at center, rgba(0,0,0,0.35), rgba(0,0,0,0) 70%); transform-origin:center; animation: shadow-pulse 0.6s ease-in-out infinite; filter: blur(1px); animation-play-state: var(--run-state, paused); }
        .runner-sprite.is-running { --run-state: running; }
        .runner-sprite.is-idle { --run-state: paused; }
        @keyframes run-bob { 0% { transform: translateY(0px) } 50% { transform: translateY(-6px) } 100% { transform: translateY(0px) } }
        @keyframes shadow-pulse { 0% { transform: scale(1) } 50% { transform: scale(0.9) } 100% { transform: scale(1) } }
        @media (prefers-reduced-motion: reduce) {
          .runner-sprite img, .runner-sprite .shadow { animation: none !important; }
        }`
        }</style>
    </div>
  );
}
