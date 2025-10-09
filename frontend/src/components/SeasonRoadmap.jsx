import React, { useEffect, useRef, useState } from 'react';
import { useRoadmapAnimation } from '../hooks/useRoadmapAnimation';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import RunnerSprite from './RunnerSprite';

/*
  SeasonRoadmap
  A curved "road" style timeline showing seasons (Winter, Spring, Summer, Fall) with nodes.
  Clicking a season triggers onSelect(seasonKey). Uses CSS for the road (SVG path) + GSAP entrance.
*/

const SEASONS = [
  { key: 's1', label: 'Season 1', color: '#6bc5ff', months: 'Intro' },
  { key: 's2', label: 'Season 2', color: '#8fff9f', months: 'Build' },
  { key: 's3', label: 'Season 3', color: '#ffd36b', months: 'Arc' },
  { key: 's4', label: 'Season 4', color: '#ff8f6b', months: 'Climax' },
  { key: 's5', label: 'Season 5', color: '#b28bff', months: 'Finale' },
];

export default function SeasonRoadmap({ activeSeason, onSelect, disabled, seasonData, title, relatedMovies = [] }) {
  const containerRef = useRef(null);
  useRoadmapAnimation(containerRef);
  const carRef = useRef(null);
  const nodesRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const lastTRef = useRef(0); // normalized progress 0..1
  const nodeTRef = useRef([]); // per-node normalized t values
  const movieTRef = useRef([]); // per-movie normalized t values  
  const movieBadgesRef = useRef([]); // movie badge elements
  const maxTRef = useRef(0); // furthest covered progress for persistent trail
  const DATA = seasonData && seasonData.length ? seasonData : SEASONS;

  useEffect(() => { gsap.registerPlugin(ScrollToPlugin); }, []);

  // Map each season node to a position (simple layout across the container)
  useEffect(() => {
    if (!containerRef.current) return;
    const nodes = containerRef.current.querySelectorAll('.season-node');
    const islandsWrapper = containerRef.current.querySelector('.islands-wrapper');
    if (!islandsWrapper) return;
    
    const wrapperRect = islandsWrapper.getBoundingClientRect();
    const arr = [];
    nodes.forEach((node) => {
      const r = node.getBoundingClientRect();
      // Position relative to the islands wrapper, not the main container
      const cx = r.left - wrapperRect.left + r.width / 2;
      const cy = r.top - wrapperRect.top + r.height * 0.4; // Position on the island art area
      arr.push({ x: cx, y: cy });
    });
    nodeTRef.current = arr;
    // movies are not used in islands layout for now
    movieTRef.current = [];
  }, [seasonData, relatedMovies, DATA.length]);

  // Position Luffy on the active island (only initial positioning, no automatic movement)
  useEffect(() => {
    if (!containerRef.current || !carRef.current) return;
    const idx = DATA.findIndex(s => s.key === activeSeason);
    const posArr = nodeTRef.current || [];
    const target = posArr[idx];
    if (!target) return;

    // Always position Luffy on the active island (for both initial load and season changes)
    gsap.set(carRef.current, {
      x: target.x,
      y: target.y - 30, // Position Luffy on top of the island art
    });
    carRef.current.classList.add('is-idle');
    carRef.current.classList.remove('is-running');
    lastTRef.current = target;
  }, [DATA, activeSeason]); // Run when DATA or activeSeason changes

  // Enhanced bouncing animation handler for Luffy movement between islands
  const handleSeasonClick = (seasonKey) => {
    if (onSelect && gsap) {
      const fromNode = document.querySelector('.season-node.island.active');
      const toNode = document.querySelector(`.season-node.island[data-season="${seasonKey}"]`);
      
      // Only animate if clicking a different island
      if (fromNode && toNode && fromNode !== toNode) {
        const runner = carRef.current;
        if (runner) {
          // Get the target position from nodeTRef
          const toIdx = DATA.findIndex(s => s.key === seasonKey);
          const posArr = nodeTRef.current || [];
          const targetPos = posArr[toIdx];
          
          if (targetPos) {
            // Calculate current and target positions
            const currentX = gsap.getProperty(runner, "x");
            const currentY = gsap.getProperty(runner, "y");
            const deltaX = targetPos.x - currentX;
            const deltaY = (targetPos.y - 30) - currentY; // Land on top of island art
            
            // Create bouncing jump animation
            gsap.timeline()
              .set(runner, { 
                scale: 1.1, // Slightly bigger during jump
                zIndex: 1000
              })
              .to(runner, {
                duration: 0.4,
                y: currentY - 50, // Jump up first
                ease: "power2.out",
                onStart: () => {
                  setIsRunning(true);
                  runner.classList.add('is-running');
                  runner.classList.remove('is-idle');
                }
              })
              .to(runner, {
                duration: 0.6,
                x: targetPos.x, // Move to target X
                y: targetPos.y - 80, // Arc height during travel
                ease: "power1.inOut",
              })
              .to(runner, {
                duration: 0.3,
                y: targetPos.y - 20, // Bounce down
                ease: "bounce.out"
              })
              .to(runner, {
                duration: 0.2,
                y: targetPos.y - 30, // Final position on top of island art
                scale: 1, // Return to normal size
                ease: "power2.out",
                onComplete: () => {
                  setIsRunning(false);
                  runner.classList.remove('is-running');
                  runner.classList.add('is-idle');
                  lastTRef.current = targetPos;
                  // Activate new island after landing
                  onSelect(seasonKey);
                }
              });
          }
        }
      } else if (!fromNode || fromNode === toNode) {
        // If no current active island or clicking the same island, just activate
        onSelect(seasonKey);
      }
    } else if (onSelect) {
      onSelect(seasonKey);
    }
  };

  return (
    <div className="season-roadmap hero-scale fullscreen" ref={containerRef} aria-label="Season based recommendation navigator">
      {title && <h3 className="roadmap-title">{title}</h3>}
      <div className="islands-wrapper">
        <div className="islands" ref={nodesRef}>
          {DATA.map((s, i) => (
            <div 
              key={s.key} 
              data-season={s.key}
              className={`season-node island ${activeSeason === s.key ? 'active' : ''}`} 
              style={{ '--season-color': s.color }} 
              role="tab" 
              aria-selected={activeSeason === s.key} 
              tabIndex={activeSeason === s.key ? 0 : -1} 
              onClick={() => handleSeasonClick(s.key)}
            >
              <div className="island-art" aria-hidden>
                {/* Diverse Floating Islands - Each Season Has Unique Biome */}
                <svg viewBox="0 0 240 180" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden>
                  <defs>
                    {/* Season 1: Crystal/Gem Island Gradients */}
                    <linearGradient id="crystalBase" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e0e0ff" />
                      <stop offset="50%" stopColor="#c0c0ff" />
                      <stop offset="100%" stopColor="#9090ff" />
                    </linearGradient>
                    <linearGradient id="crystalGems" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#ff80ff" />
                      <stop offset="50%" stopColor="#ff60ff" />
                      <stop offset="100%" stopColor="#e040e0" />
                    </linearGradient>
                    
                    {/* Season 2: Nature/Forest Island Gradients */}
                    <linearGradient id="forestBase" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B4513" />
                      <stop offset="50%" stopColor="#654321" />
                      <stop offset="100%" stopColor="#4a2c17" />
                    </linearGradient>
                    <linearGradient id="forestGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#90EE90" />
                      <stop offset="50%" stopColor="#32CD32" />
                      <stop offset="100%" stopColor="#228B22" />
                    </linearGradient>
                    
                    {/* Season 3: Lava/Volcanic Island Gradients */}
                    <linearGradient id="volcanoBase" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2a2a2a" />
                      <stop offset="50%" stopColor="#1a1a1a" />
                      <stop offset="100%" stopColor="#0a0a0a" />
                    </linearGradient>
                    <linearGradient id="lavaGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff6b35" />
                      <stop offset="50%" stopColor="#ff4500" />
                      <stop offset="100%" stopColor="#cc3300" />
                    </linearGradient>
                    
                    {/* Season 4: Ice/Snow Island Gradients */}
                    <linearGradient id="iceBase" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e0f0ff" />
                      <stop offset="50%" stopColor="#c0e0ff" />
                      <stop offset="100%" stopColor="#a0d0ff" />
                    </linearGradient>
                    <linearGradient id="iceShards" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="50%" stopColor="#e0f0ff" />
                      <stop offset="100%" stopColor="#c0e0ff" />
                    </linearGradient>
                    
                    {/* Season 5: Mystical/Dark Island Gradients */}
                    <linearGradient id="mysticBase" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4a4a4a" />
                      <stop offset="50%" stopColor="#2a2a2a" />
                      <stop offset="100%" stopColor="#1a1a1a" />
                    </linearGradient>
                    <linearGradient id="mysticPurple" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#8a2be2" />
                      <stop offset="50%" stopColor="#9932cc" />
                      <stop offset="100%" stopColor="#6a1b9a" />
                    </linearGradient>
                    
                    {/* Active state enhancements */}
                    <linearGradient id="activeGlow" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#FFD700" />
                      <stop offset="50%" stopColor="#FFA500" />
                      <stop offset="100%" stopColor="#FF6347" />
                    </linearGradient>
                    
                    {/* Effects */}
                    <filter id="floating-shadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="0" dy="12" stdDeviation="15" floodColor="#000" floodOpacity="0.4" />
                    </filter>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#ffd36b" floodOpacity="0.9" />
                    </filter>
                    <filter id="crystalGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#ff80ff" floodOpacity="0.8" />
                    </filter>
                  </defs>

                  {/* Dynamic Island Content Based on Season Index */}
                  <g className="floating-island" filter="url(#floating-shadow)">
                    
                    {/* Season 1 (i=0): Crystal/Gem Island */}
                    <g className={`island-type crystal-island ${i === 0 ? 'visible' : 'hidden'}`}>
                      <ellipse className="island-base" cx="120" cy="130" rx="80" ry="30" fill="url(#crystalBase)" />
                      
                      {/* Crystal formations */}
                      <polygon className="large-crystal" points="120,70 105,110 135,110" fill="url(#crystalGems)" />
                      <polygon className="medium-crystal" points="85,90 75,115 95,115" fill="url(#crystalGems)" opacity="0.8" />
                      <polygon className="medium-crystal" points="155,85 145,115 165,115" fill="url(#crystalGems)" opacity="0.8" />
                      <polygon className="small-crystal" points="100,100 95,110 105,110" fill="url(#crystalGems)" opacity="0.6" />
                      <polygon className="small-crystal" points="140,95 135,110 145,110" fill="url(#crystalGems)" opacity="0.6" />
                      
                      {/* Crystal sparkles */}
                      <circle className="crystal-sparkle" cx="120" cy="85" r="2" fill="#ffffff" opacity="0.9" />
                      <circle className="crystal-sparkle" cx="85" cy="100" r="1.5" fill="#ffffff" opacity="0.8" />
                      <circle className="crystal-sparkle" cx="155" cy="95" r="1.5" fill="#ffffff" opacity="0.8" />
                      
                      {/* Floating crystal shards */}
                      <polygon className="floating-shard" points="60,60 65,50 70,60" fill="url(#crystalGems)" opacity="0.6" />
                      <polygon className="floating-shard" points="170,65 175,55 180,65" fill="url(#crystalGems)" opacity="0.6" />
                    </g>
                    
                    {/* Season 2 (i=1): Nature/Forest Island */}
                    <g className={`island-type forest-island ${i === 1 ? 'visible' : 'hidden'}`}>
                      <ellipse className="island-base" cx="120" cy="130" rx="80" ry="30" fill="url(#forestBase)" />
                      <ellipse className="grass-layer" cx="120" cy="120" rx="75" ry="25" fill="url(#forestGreen)" />
                      
                      {/* Large central tree */}
                      <rect className="tree-trunk" x="118" y="90" width="4" height="30" fill="#654321" />
                      <circle className="tree-crown" cx="120" cy="85" r="15" fill="#228B22" />
                      
                      {/* Smaller trees */}
                      <rect className="small-tree-trunk" x="90" y="105" width="3" height="15" fill="#654321" />
                      <circle className="small-tree-crown" cx="91" cy="100" r="8" fill="#32CD32" />
                      <rect className="small-tree-trunk" x="150" y="100" width="3" height="18" fill="#654321" />
                      <circle className="small-tree-crown" cx="151" cy="95" r="10" fill="#32CD32" />
                      
                      {/* Bushes and vegetation */}
                      <circle className="bush" cx="75" cy="115" r="6" fill="#228B22" />
                      <circle className="bush" cx="165" cy="118" r="5" fill="#228B22" />
                      <circle className="bush" cx="105" cy="118" r="4" fill="#32CD32" />
                      <circle className="bush" cx="135" cy="120" r="4" fill="#32CD32" />
                      
                      {/* Floating leaves */}
                      <ellipse className="floating-leaf" cx="60" cy="70" rx="3" ry="2" fill="#90EE90" opacity="0.7" />
                      <ellipse className="floating-leaf" cx="180" cy="75" rx="2.5" ry="1.5" fill="#90EE90" opacity="0.6" />
                    </g>
                    
                    {/* Season 3 (i=2): Lava/Volcanic Island */}
                    <g className={`island-type volcano-island ${i === 2 ? 'visible' : 'hidden'}`}>
                      <ellipse className="island-base" cx="120" cy="130" rx="80" ry="30" fill="url(#volcanoBase)" />
                      
                      {/* Volcanic peaks */}
                      <path className="volcano-peak" d="M120,65 L105,110 L135,110 Z" fill="#2a2a2a" />
                      <path className="smaller-peak" d="M85,85 L75,115 L95,115 Z" fill="#1a1a1a" />
                      <path className="smaller-peak" d="M155,80 L145,115 L165,115 Z" fill="#1a1a1a" />
                      
                      {/* Lava flows and pools */}
                      <ellipse className="lava-pool" cx="120" cy="85" r="8" fill="url(#lavaGlow)" />
                      <path className="lava-flow" d="M120,93 Q115,105 110,115 Q105,120 100,125" stroke="url(#lavaGlow)" strokeWidth="3" fill="none" />
                      <path className="lava-flow" d="M128,93 Q133,105 138,115 Q143,120 148,125" stroke="url(#lavaGlow)" strokeWidth="3" fill="none" />
                      
                      {/* Smaller lava pools */}
                      <ellipse className="small-lava-pool" cx="90" cy="120" r="4" fill="url(#lavaGlow)" opacity="0.8" />
                      <ellipse className="small-lava-pool" cx="150" cy="118" r="5" fill="url(#lavaGlow)" opacity="0.8" />
                      
                      {/* Volcanic smoke/steam */}
                      <circle className="smoke" cx="120" cy="60" r="5" fill="#666" opacity="0.4" />
                      <circle className="smoke" cx="118" cy="50" r="3" fill="#666" opacity="0.3" />
                      
                      {/* Floating lava particles */}
                      <circle className="lava-particle" cx="70" cy="80" r="1.5" fill="#ff6b35" />
                      <circle className="lava-particle" cx="170" cy="85" r="1" fill="#ff4500" />
                    </g>
                    
                    {/* Season 4 (i=3): Ice/Snow Island */}
                    <g className={`island-type ice-island ${i === 3 ? 'visible' : 'hidden'}`}>
                      <ellipse className="island-base" cx="120" cy="130" rx="80" ry="30" fill="url(#iceBase)" />
                      
                      {/* Ice formations and spikes */}
                      <polygon className="ice-spike" points="120,65 110,110 130,110" fill="url(#iceShards)" />
                      <polygon className="ice-formation" points="85,85 80,115 95,115" fill="url(#iceShards)" opacity="0.9" />
                      <polygon className="ice-formation" points="155,80 150,115 165,115" fill="url(#iceShards)" opacity="0.9" />
                      
                      {/* Snow patches */}
                      <ellipse className="snow-patch" cx="120" cy="115" rx="60" ry="15" fill="#ffffff" opacity="0.7" />
                      <ellipse className="snow-drift" cx="75" cy="120" rx="15" ry="8" fill="#ffffff" opacity="0.6" />
                      <ellipse className="snow-drift" cx="165" cy="122" rx="12" ry="6" fill="#ffffff" opacity="0.6" />
                      
                      {/* Ice crystals */}
                      <path className="ice-crystal" d="M100,95 L102,90 L104,95 L102,100 Z" fill="#ffffff" opacity="0.8" />
                      <path className="ice-crystal" d="M140,90 L142,85 L144,90 L142,95 Z" fill="#ffffff" opacity="0.8" />
                      
                      {/* Floating ice shards */}
                      <polygon className="floating-ice" points="60,65 65,55 70,65" fill="#e0f0ff" opacity="0.7" />
                      <polygon className="floating-ice" points="170,70 175,60 180,70" fill="#e0f0ff" opacity="0.6" />
                      
                      {/* Icicles */}
                      <polygon className="icicle" points="110,110 112,125 108,125" fill="#c0e0ff" opacity="0.8" />
                      <polygon className="icicle" points="130,110 132,125 128,125" fill="#c0e0ff" opacity="0.8" />
                    </g>
                    
                    {/* Season 5 (i=4): Mystical/Dark Island */}
                    <g className={`island-type mystic-island ${i === 4 ? 'visible' : 'hidden'}`}>
                      <ellipse className="island-base" cx="120" cy="130" rx="80" ry="30" fill="url(#mysticBase)" />
                      
                      {/* Mystical structures */}
                      <rect className="mystic-tower" x="118" y="75" width="4" height="35" fill="#4a4a4a" />
                      <polygon className="tower-top" points="120,70 115,80 125,80" fill="url(#mysticPurple)" />
                      
                      {/* Mystical crystals */}
                      <polygon className="mystic-crystal" points="90,90 85,115 95,115" fill="url(#mysticPurple)" />
                      <polygon className="mystic-crystal" points="150,85 145,115 155,115" fill="url(#mysticPurple)" />
                      
                      {/* Dark vegetation */}
                      <circle className="dark-tree" cx="75" cy="105" r="8" fill="#2a2a2a" />
                      <circle className="dark-tree" cx="165" cy="108" r="6" fill="#2a2a2a" />
                      
                      {/* Mystical orbs */}
                      <circle className="mystic-orb" cx="120" cy="85" r="4" fill="url(#mysticPurple)" opacity="0.8" />
                      <circle className="floating-orb" cx="100" cy="70" r="2" fill="#8a2be2" opacity="0.6" />
                      <circle className="floating-orb" cx="140" cy="75" r="2" fill="#9932cc" opacity="0.6" />
                      
                      {/* Dark energy particles */}
                      <circle className="dark-particle" cx="65" cy="80" r="1" fill="#6a1b9a" />
                      <circle className="dark-particle" cx="175" cy="85" r="1.5" fill="#8a2be2" />
                      
                      {/* Mystical runes */}
                      <text className="rune" x="105" y="125" fontSize="6" fill="#9932cc" opacity="0.7">※</text>
                      <text className="rune" x="135" y="125" fontSize="6" fill="#8a2be2" opacity="0.7">◊</text>
                    </g>
                    
                  </g>

                  {/* Universal floating magical particles */}
                  <g className="universal-particles">
                    <circle className="particle" cx="50" cy="60" r="1" fill="#ffd700" opacity="0.6" />
                    <circle className="particle" cx="190" cy="70" r="1.2" fill="#ff69b4" opacity="0.5" />
                    <circle className="particle" cx="45" cy="90" r="0.8" fill="#87ceeb" opacity="0.7" />
                    <circle className="particle" cx="195" cy="95" r="1" fill="#98fb98" opacity="0.6" />
                  </g>
                </svg>
              </div>
              <div className="island-meta">
                <div className="bubble">{String(i+1).padStart(2,'0')}</div>
                <div className="label">{s.label}</div>
                <div className="desc">{s.subtitle || s.months || 'Short reason to watch this season goes here.'}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="character is-idle" ref={carRef} aria-hidden>
          <RunnerSprite size={120} running={isRunning} />
        </div>
      </div>
  <style jsx>{`
    .roadmap-title { text-align:center; margin:0 0 1.25rem; font-size:1.35rem; letter-spacing:.5px; opacity:.95; }
  .season-roadmap.hero-scale { position:relative; padding:3rem 0 2.5rem; }
  .season-roadmap.fullscreen { min-height: 80vh; display:flex; flex-direction:column; justify-content:center; }
  .islands-wrapper { width:100%; max-width:1400px; margin:0 auto; position:relative; min-height:420px; }
  .islands { display:flex; gap:2.5rem; justify-content:space-between; align-items:flex-end; padding:3rem 2rem; }
  .season-node.island { width:220px; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:.6rem; filter:grayscale(100%) contrast(.95); transition:all .35s ease; }
  .season-node.island .island-art { width:180px; height:120px; position:relative; }
  /* old island div styles removed to avoid conflict with inline SVG island */
  .season-node.island .island-meta { width:100%; text-align:center; }
  .season-node.island .bubble { background:#ddd; color:#0a0f18; font-weight:700; padding:.36rem .6rem; border-radius:999px; font-size:.8rem; display:inline-block; }
  .season-node.island .label { font-weight:700; font-size:1.05rem; margin-top:.25rem; }
  .season-node.island .desc { font-size:.73rem; opacity:.7; margin-top:.25rem; color:var(--color-text-dim); }
  .season-node.island:hover { transform: translateY(-8px) scale(1.02); filter:grayscale(0%); }
  .season-node.island.active { filter:grayscale(0%) drop-shadow(0 8px 24px rgba(212,175,55,0.18)); }
  /* Diverse Floating Islands SVG styling */
  .island-art svg { display:block; }
  
  /* Island type visibility control */
  .island-type.hidden { display: none; }
  .island-type.visible { display: block; }
  
  /* Crystal Island (Season 1) styling */
  .island-art .crystal-island .large-crystal { animation: crystal-pulse 3s ease-in-out infinite; }
  .island-art .crystal-island .crystal-sparkle { animation: sparkle-twinkle 2s ease-in-out infinite; }
  @keyframes crystal-pulse { 0% { opacity: 0.8} 50% { opacity: 1} 100% { opacity: 0.8} }
  @keyframes sparkle-twinkle { 0% { opacity: 0.5; transform: scale(1)} 50% { opacity: 1; transform: scale(1.3)} 100% { opacity: 0.5; transform: scale(1)} }
  
  /* Forest Island (Season 2) styling */
  .island-art .forest-island .floating-leaf { animation: leaf-float 4s ease-in-out infinite; }
  .island-art .forest-island .tree-crown { animation: sway 3s ease-in-out infinite; }
  @keyframes leaf-float { 0% { transform: translateY(0px) rotate(0deg)} 50% { transform: translateY(-5px) rotate(10deg)} 100% { transform: translateY(0px) rotate(0deg)} }
  @keyframes sway { 0% { transform: translateX(0px)} 50% { transform: translateX(2px)} 100% { transform: translateX(0px)} }
  
  /* Volcano Island (Season 3) styling */
  .island-art .volcano-island .lava-pool { animation: lava-glow 2s ease-in-out infinite; }
  .island-art .volcano-island .lava-flow { animation: lava-flow 3s ease-in-out infinite; }
  .island-art .volcano-island .lava-particle { animation: lava-spark 1.5s ease-in-out infinite; }
  .island-art .volcano-island .smoke { animation: smoke-rise 2s ease-in-out infinite; }
  @keyframes lava-glow { 0% { opacity: 0.6} 50% { opacity: 1} 100% { opacity: 0.6} }
  @keyframes lava-flow { 0% { opacity: 0.4} 50% { opacity: 0.8} 100% { opacity: 0.4} }
  @keyframes lava-spark { 0% { opacity: 0.7; transform: scale(1)} 50% { opacity: 1; transform: scale(1.2)} 100% { opacity: 0.7; transform: scale(1)} }
  @keyframes smoke-rise { 0% { transform: translateY(0px); opacity: 0.4} 100% { transform: translateY(-10px); opacity: 0} }
  
  /* Ice Island (Season 4) styling */
  .island-art .ice-island .ice-crystal { animation: ice-glimmer 2.5s ease-in-out infinite; }
  .island-art .ice-island .floating-ice { animation: ice-drift 3s ease-in-out infinite; }
  .island-art .ice-island .icicle { animation: icicle-drip 4s ease-in-out infinite; }
  @keyframes ice-glimmer { 0% { opacity: 0.6} 50% { opacity: 1} 100% { opacity: 0.6} }
  @keyframes ice-drift { 0% { transform: translateY(0px) rotate(0deg)} 50% { transform: translateY(-3px) rotate(5deg)} 100% { transform: translateY(0px) rotate(0deg)} }
  @keyframes icicle-drip { 0% { opacity: 0.8} 70% { opacity: 0.8} 100% { opacity: 0.4} }
  
  /* Mystical Island (Season 5) styling */
  .island-art .mystic-island .mystic-orb { animation: mystic-pulse 2s ease-in-out infinite; }
  .island-art .mystic-island .floating-orb { animation: orb-float 3s ease-in-out infinite; }
  .island-art .mystic-island .dark-particle { animation: dark-energy 2.5s ease-in-out infinite; }
  .island-art .mystic-island .rune { animation: rune-glow 4s ease-in-out infinite; }
  @keyframes mystic-pulse { 0% { opacity: 0.6; transform: scale(1)} 50% { opacity: 1; transform: scale(1.1)} 100% { opacity: 0.6; transform: scale(1)} }
  @keyframes orb-float { 0% { transform: translateY(0px)} 50% { transform: translateY(-4px)} 100% { transform: translateY(0px)} }
  @keyframes dark-energy { 0% { opacity: 0.5} 50% { opacity: 0.9} 100% { opacity: 0.5} }
  @keyframes rune-glow { 0% { opacity: 0.4} 50% { opacity: 0.9} 100% { opacity: 0.4} }
  
  /* Enhanced floating animation for diverse islands */
  .season-node.island .floating-island { 
    animation: diverse-island-float 4s ease-in-out infinite; 
    transform-origin: center center;
  }
  @keyframes diverse-island-float { 
    0% { transform: translateY(0px) rotate(0deg)} 
    25% { transform: translateY(-3px) rotate(0.5deg)} 
    50% { transform: translateY(-6px) rotate(0deg)} 
    75% { transform: translateY(-3px) rotate(-0.5deg)} 
    100% { transform: translateY(0px) rotate(0deg)} 
  }
  
  /* Universal particles floating animation */
  .island-art .universal-particles .particle { 
    animation: universal-drift 6s ease-in-out infinite; 
  }
  @keyframes universal-drift { 
    0% { opacity: 0.4; transform: translateY(0px) translateX(0px)} 
    33% { opacity: 0.8; transform: translateY(-4px) translateX(2px)} 
    66% { opacity: 0.6; transform: translateY(-2px) translateX(-1px)} 
    100% { opacity: 0.4; transform: translateY(0px) translateX(0px)} 
  }
  
  /* Active state - universal golden enhancement */
  .season-node.island.active .island-base { fill: url(#activeGlow); }
  .season-node.island.active .crystal-island .large-crystal { fill: #FFD700; }
  .season-node.island.active .forest-island .grass-layer { fill: #90EE90; }
  .season-node.island.active .forest-island .tree-crown { fill: #32CD32; }
  .season-node.island.active .volcano-island .lava-pool { fill: #FFD700; opacity: 1; }
  .season-node.island.active .ice-island .ice-spike { fill: #87CEEB; }
  .season-node.island.active .ice-island .snow-patch { fill: #ffffff; opacity: 1; }
  .season-node.island.active .mystic-island .mystic-orb { fill: #FFD700; }
  .season-node.island.active .mystic-island .mystic-crystal { fill: #FFA500; }
  
  /* Enhanced active floating with magical energy */
  .season-node.island.active .floating-island { 
    filter: url(#glow); 
    animation: active-diverse-float 2.5s ease-in-out infinite; 
  }
  @keyframes active-diverse-float { 
    0% { transform: translateY(-4px) rotate(0deg)} 
    33% { transform: translateY(-10px) rotate(1deg)} 
    66% { transform: translateY(-16px) rotate(-1deg)} 
    100% { transform: translateY(-4px) rotate(0deg)} 
  }
  
  /* Enhanced particles on active state */
  .season-node.island.active .universal-particles .particle { 
    animation: active-energy-sparkle 1.8s ease-in-out infinite; 
  }
  @keyframes active-energy-sparkle { 
    0% { opacity: 0.6; transform: scale(1) translateY(0px)} 
    25% { opacity: 1; transform: scale(1.5) translateY(-3px)} 
    50% { opacity: 1; transform: scale(2) translateY(-6px)} 
    75% { opacity: 1; transform: scale(1.5) translateY(-3px)} 
    100% { opacity: 0.6; transform: scale(1) translateY(0px)} 
  }
  /* palm sway animation - removed since we now have tree leaves instead */
  /* active SVG island handled via .island-art SVG element styles above */
  .season-node.island.active .bubble { background: #ffd36b; color: #111; }
  .character { 
    position: absolute; 
    left: 0; 
    top: 0; 
    transform: translate(-50%, -100%); 
    filter: drop-shadow(0 8px 20px rgba(0,0,0,0.4)); 
    pointer-events: none; 
    z-index: 100; 
    transition: all 0.3s ease;
  }
  .character.is-running { 
    filter: drop-shadow(0 12px 28px rgba(0,0,0,0.6)) drop-shadow(0 0 25px rgba(255, 215, 0, 0.4)); 
    transform: translate(-50%, -100%) scale(1.1);
  }
  .character.is-idle { 
    filter: drop-shadow(0 8px 20px rgba(0,0,0,0.4)) drop-shadow(0 0 15px rgba(255, 215, 0, 0.2)); 
    animation: character-idle-bounce 4s ease-in-out infinite;
    transform: translate(-50%, -100%);
  }
  @keyframes character-idle-bounce { 
    0% { transform: translate(-50%, -100%) translateY(0px) scale(1); } 
    25% { transform: translate(-50%, -100%) translateY(-2px) scale(1.02); }
    50% { transform: translate(-50%, -100%) translateY(-5px) scale(1.05); } 
    75% { transform: translate(-50%, -100%) translateY(-2px) scale(1.02); }
    100% { transform: translate(-50%, -100%) translateY(0px) scale(1); } 
  }
  .character::after { 
    content: ''; 
    position: absolute; 
    inset: auto -8px 12px -8px; 
    height: 8px; 
    background: radial-gradient(ellipse at center, rgba(255, 215, 0, 0.3), rgba(0,0,0,0.1) 40%, rgba(0,0,0,0) 70%); 
    pointer-events: none; 
    border-radius: 50%;
    filter: blur(3px);
  }
  @media(max-width:1100px){ .islands{padding:2rem 1rem;} .season-node.island{width:180px;} }
  @media(max-width:900px){ .islands{gap:1.25rem; overflow-x:auto; padding:1rem;} .season-node.island{flex:0 0 160px;} }
  @media(max-width:700px){ .islands{flex-direction:row; align-items:flex-start;} .character{display:none;} }
  `}</style>
    </div>
  );
}

export { SEASONS };
