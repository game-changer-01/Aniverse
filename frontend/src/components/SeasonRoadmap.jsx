import React, { useEffect, useRef, useState } from 'react';
import { useRoadmapAnimation } from '../hooks/useRoadmapAnimation';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
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
  const pathRef = useRef(null); // the dashed path used for motion
  const trailRef = useRef(null); // glowing trail
  const [isRunning, setIsRunning] = useState(false);
  const lastTRef = useRef(0); // normalized progress 0..1
  const nodeTRef = useRef([]); // per-node normalized t values
  const movieTRef = useRef([]); // per-movie normalized t values  
  const movieBadgesRef = useRef([]); // movie badge elements
  const maxTRef = useRef(0); // furthest covered progress for persistent trail
  const DATA = seasonData && seasonData.length ? seasonData : SEASONS;

  useEffect(() => { gsap.registerPlugin(MotionPathPlugin, ScrollToPlugin); }, []);

  // Utility: project (px,py) onto path to find normalized progress t in [0,1]
  const projectToPath = (pathEl, px, py) => {
    if (!pathEl) return 0;
    const L = pathEl.getTotalLength();
    let start = 0, end = L, best = 0, bestDist = Infinity;
    for (let i = 0; i < 24; i++) { // binary-ish search sampling
      const t1 = start + (end - start) / 3;
      const t2 = end - (end - start) / 3;
      const p1 = pathEl.getPointAtLength(t1);
      const p2 = pathEl.getPointAtLength(t2);
      const d1 = (p1.x - px) ** 2 + (p1.y - py) ** 2;
      const d2 = (p2.x - px) ** 2 + (p2.y - py) ** 2;
      if (d1 < d2) { end = t2; if (d1 < bestDist) { bestDist = d1; best = t1; } }
      else { start = t1; if (d2 < bestDist) { bestDist = d2; best = t2; } }
    }
    return best / L;
  };

  // Map each season node to a progress value along the path
  useEffect(() => {
    if (!containerRef.current || !pathRef.current) return;
    const nodes = containerRef.current.querySelectorAll('.season-node');
    const pathEl = pathRef.current;
    const parentRect = containerRef.current.getBoundingClientRect();
    const arr = [];
    nodes.forEach((node) => {
      const r = node.getBoundingClientRect();
      // Project season box position to the nearest point on the road path
      const cx = r.left - parentRect.left + r.width / 2;
      const cy = r.top - parentRect.top + r.height / 2;
      const t = projectToPath(pathEl, cx, cy);
      arr.push(t);
    });
    nodeTRef.current = arr;

    // Map related movies to path positions (spread between seasons)
    const movieArr = [];
    if (relatedMovies.length > 0) {
      relatedMovies.forEach((movie, idx) => {
        // Distribute movies along the path between season nodes
        const seasonSpacing = 1 / Math.max(1, DATA.length - 1);
        const movieT = (idx + 0.5) * seasonSpacing / relatedMovies.length;
        movieArr.push({ ...movie, t: Math.min(0.95, movieT) });
      });
    }
    movieTRef.current = movieArr;
  }, [seasonData, relatedMovies]);

  // move the runner along the road path to the active node
  useEffect(() => {
    if (!containerRef.current || !carRef.current || !pathRef.current) return;
    const idx = DATA.findIndex(s => s.key === activeSeason);
    const tArr = nodeTRef.current;
    const targetT = tArr[idx] ?? 0;
    const startT = lastTRef.current;
    if (targetT === undefined) return;

    const L = pathRef.current.getTotalLength();
    const startLen = Math.max(0, Math.min(L, startT * L));
    const endLen = Math.max(0, Math.min(L, targetT * L));

    const pStart = pathRef.current.getPointAtLength(startLen);
    const pEnd = pathRef.current.getPointAtLength(endLen);
    const dx = pEnd.x - pStart.x;
    const goingRight = dx >= 0;
    carRef.current.style.setProperty('--scaleX', goingRight ? '1' : '-1');
    carRef.current.style.setProperty('--lean', goingRight ? '8deg' : '-8deg');

    const dist = Math.hypot(dx, pEnd.y - pStart.y);
    const base = 0.55; // Slightly longer base duration for smoother animation
    const dur = Math.min(2.2, Math.max(0.4, dist / 800 + base)); // Extended duration range
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // animate along the path and update glowing trail
    const proxy = { t: startT };
  const yOffset = -2; // fine centerline lock: adjust to lane thickness (-2..+4)
    const trail = trailRef.current;
    const pathEl = pathRef.current;

    const tween = gsap.to(proxy, {
      t: targetT,
      duration: prefersReduced ? 0 : dur,
      ease: 'power2.inOut', // Smoother easing for more natural movement
      onStart: () => { 
        setIsRunning(true); 
        carRef.current.classList.add('is-running'); 
        carRef.current.classList.remove('is-idle');
        // Show trail only during animation
        if (trail) {
          trail.style.opacity = '0.95';
        }
      },
      onUpdate: () => {
        // Position character exactly on the road line
        const len = proxy.t * L;
        const p = pathEl.getPointAtLength(len);
        // tangent for rotation
        const lookAhead = Math.min(L, len + 1);
        const p2 = pathEl.getPointAtLength(lookAhead);
        const angle = Math.atan2(p2.y - p.y, p2.x - p.x) * (180 / Math.PI);
        
        // set character position directly on the road path
        gsap.set(carRef.current, { x: p.x, y: p.y });
        carRef.current.style.setProperty('--lean', `${angle}deg`);

        // Animate trail drawing progressively during movement
        if (trail) {
          const maxProgress = Math.max(maxTRef.current * L, len);
          trail.setAttribute('stroke-dasharray', `${maxProgress} ${Math.max(0, L - maxProgress)}`);
          // Update max progress if we've gone further
          if (len > maxTRef.current * L) {
            maxTRef.current = len / L;
          }
        }

        // keep runner roughly centered in viewport (throttled)
        if (typeof window !== 'undefined') {
          const now = performance.now();
          if (!window.__roadmapScrollTs || now - window.__roadmapScrollTs > 90) {
            window.__roadmapScrollTs = now;
            const runnerRect = carRef.current.getBoundingClientRect();
            const runnerCenterY = runnerRect.top + runnerRect.height / 2;
            const viewH = window.innerHeight;
            // center if outside middle band
            if (runnerCenterY < viewH * 0.35 || runnerCenterY > viewH * 0.65) {
              const targetY = window.scrollY + (runnerCenterY - viewH / 2);
              gsap.to(window, { duration: 0.35, ease: 'power2.out', scrollTo: { y: targetY, autoKill: true } });
            }
          }
        }
      },
      onComplete: () => {
        setIsRunning(false);
        carRef.current.classList.remove('is-running');
        carRef.current.classList.add('is-idle');
        // preserve final angle for a natural stop
        lastTRef.current = targetT;
        // Keep trail visible with persistent progress
        if (trail) {
          trail.style.opacity = '0.95';
          const finalLen = targetT * L;
          if (finalLen > maxTRef.current * L) {
            maxTRef.current = targetT;
            trail.setAttribute('stroke-dasharray', `${finalLen} ${Math.max(0, L - finalLen)}`);
          }
        }
      }
    });

    return () => tween.kill();
  }, [activeSeason, seasonData]);

  return (
  <div className="season-roadmap hero-scale fullscreen" ref={containerRef} aria-label="Season based recommendation navigator">
      {title && <h3 className="roadmap-title">{title}</h3>}
      <div className="road-wrapper">
        <svg className="road" viewBox="0 0 1800 500" preserveAspectRatio="none" aria-hidden>
          <path className="road-path" d="M0 420 C200 280 450 180 700 320 C950 460 1200 380 1450 300 C1600 240 1700 260 1800 250" fill="none" stroke="#2a3350" strokeWidth="45" strokeLinecap="round" />
          <path ref={pathRef} className="road-dash" d="M0 420 C200 280 450 180 700 320 C950 460 1200 380 1450 300 C1600 240 1700 260 1800 250" fill="none" stroke="#5d6b8f" strokeWidth="10" strokeDasharray="25 32" strokeLinecap="round" />
          {/* Glowing progress trail - initially hidden */}
          <path ref={trailRef} className="road-trail" d="M0 420 C200 280 450 180 700 320 C950 460 1200 380 1450 300 C1600 240 1700 260 1800 250" fill="none" stroke="#ffd36b" strokeWidth="12" strokeLinecap="round" strokeDasharray="0 9999" style={{ opacity: 0 }} />
        </svg>
        <div className="character is-idle" ref={carRef} aria-hidden>
          <RunnerSprite size={140} running={isRunning} />
        </div>
        <ul className="season-nodes" role="tablist">
          {DATA.map((s, i) => (
            <li key={s.key} className={`season-node ${activeSeason === s.key ? 'active' : ''}`} style={{ '--season-color': s.color }}>
              <button
                role="tab"
                aria-selected={activeSeason === s.key}
                tabIndex={activeSeason === s.key ? 0 : -1}
                disabled={disabled}
                onClick={() => onSelect && onSelect(s.key)}
              >
                <div className="bubble">{String(i+1).padStart(2,'0')}</div>
                <div className="label">{s.label}</div>
                {s.months && <div className="months">{s.months}</div>}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <style jsx>{`
        .roadmap-title { text-align:center; margin:0 0 1.25rem; font-size:1.35rem; letter-spacing:.5px; opacity:.9; }
  .season-roadmap.hero-scale { position:relative; padding:3rem 0 2.5rem; }
  .season-roadmap.fullscreen { min-height: 95vh; display:flex; flex-direction:column; justify-content:center; }
  .road-wrapper { position:relative; width:100%; max-width:1800px; margin:0 auto; min-height:620px; }
  .road { width:100%; height:520px; }
          .road-trail { filter: drop-shadow(0 0 15px rgba(255,211,107,0.85)); opacity:0.95; }
        .season-nodes { list-style:none; margin:0; padding:0; }
        .season-node { position:absolute; top:0; transform:translate(-50%, -50%); }
        .season-node:nth-child(1){ left:5%; top:84%; }
        .season-node:nth-child(2){ left:25%; top:36%; }
        .season-node:nth-child(3){ left:50%; top:92%; }
        .season-node:nth-child(4){ left:75%; top:48%; }
        .season-node:nth-child(5){ left:95%; top:50%; }
        .season-node button { background:linear-gradient(135deg, #1f2638 0%, #242f46 100%); border:2px solid transparent; border-radius:18px; padding:1.05rem 1.3rem; min-width:160px; cursor:pointer; color:#fff; display:flex; flex-direction:column; align-items:flex-start; gap:.3rem; box-shadow:0 10px 28px -8px rgba(0,0,0,0.6); transition:.35s; }
        .season-node button:hover { transform:translateY(-6px); }
        .season-node.active button { border-color:var(--season-color); box-shadow:0 0 0 2px rgba(255,255,255,0.08), 0 8px 30px -4px var(--season-color); }
        .bubble { background:var(--season-color); color:#0a0f18; font-weight:700; padding:.38rem .65rem; border-radius:999px; font-size:.8rem; letter-spacing:.6px; }
        .label { font-weight:700; font-size:1.05rem; letter-spacing:.6px; }
        .months { font-size:.72rem; opacity:.65; letter-spacing:.55px; }
  .character { position:absolute; left:0; top:0; transform:translate(-50%,-50%); filter: drop-shadow(0 6px 16px rgba(0,0,0,0.6)); }
  .character.is-running { filter: drop-shadow(0 10px 22px rgba(0,0,0,0.7)); }
  .character::after { content:''; position:absolute; inset:auto -10px -8px -10px; height:10px; background: radial-gradient(ellipse at center, rgba(0,0,0,0.25), rgba(0,0,0,0) 70%); pointer-events:none; }
  @media(max-width:1100px){ .road{height:380px;} .road-wrapper{min-height:480px;} .season-node button{min-width:150px;} }
        @media(max-width:900px){ .season-node button{min-width:130px;padding:.9rem 1rem;} }
        @media(max-width:700px){ .season-node{position:static; transform:none; margin:0 0 1rem 0;} .road{display:none;} .character{display:none;} .season-nodes{display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:1rem;} .season-roadmap{padding:2rem 1rem;} }
      `}</style>
    </div>
  );
}

export { SEASONS };
