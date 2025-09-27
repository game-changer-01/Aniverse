import React, { useEffect, useRef } from 'react';
import { useRoadmapAnimation } from '../hooks/useRoadmapAnimation';
import { gsap } from 'gsap';

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
  { key: 's5', label: 'Season 5', color: '#b28bff', months: 'Finale' }
];

export default function SeasonRoadmap({ activeSeason, onSelect, disabled, seasonData, title }) {
  const containerRef = useRef(null);
  useRoadmapAnimation(containerRef);
  const carRef = useRef(null);
  const DATA = seasonData && seasonData.length ? seasonData : SEASONS;

  // move the car near the active node
  useEffect(() => {
    if (!containerRef.current || !carRef.current) return;
    const nodes = containerRef.current.querySelectorAll('.season-node');
    const idx = DATA.findIndex(s => s.key === activeSeason);
    const target = nodes[idx] || nodes[0];
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const parentRect = containerRef.current.getBoundingClientRect();
    const x = rect.left - parentRect.left;
    const y = rect.top - parentRect.top;
    gsap.to(carRef.current, { x, y, duration: 0.6, ease: 'power3.out' });
  }, [activeSeason, seasonData]);

  return (
    <div className="season-roadmap" ref={containerRef} aria-label="Season based recommendation navigator">
      {title && <h3 className="roadmap-title">{title}</h3>}
      <div className="road-wrapper">
        <svg className="road" viewBox="0 0 1200 300" preserveAspectRatio="none" aria-hidden>
          <path className="road-path" d="M0 250 C120 140 300 80 450 200 C600 320 750 280 900 200 C1020 140 1140 160 1200 150" fill="none" stroke="#2a3350" strokeWidth="30" strokeLinecap="round" />
          <path className="road-dash" d="M0 250 C120 140 300 80 450 200 C600 320 750 280 900 200 C1020 140 1140 160 1200 150" fill="none" stroke="#5d6b8f" strokeWidth="6" strokeDasharray="18 22" strokeLinecap="round" />
        </svg>
        <div className="car" ref={carRef} aria-hidden>🚗</div>
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
        .roadmap-title { text-align:center; margin:0 0 1rem; }
        .season-roadmap { position:relative; padding:4rem 0 2rem; }
        .road-wrapper { position:relative; width:100%; max-width:1100px; margin:0 auto; }
        .road { width:100%; height:300px; }
        .season-nodes { list-style:none; margin:0; padding:0; }
        .season-node { position:absolute; top:0; transform:translate(-50%, -50%); }
        .season-node:nth-child(1){ left:5%; top:70%; }
        .season-node:nth-child(2){ left:28%; top:25%; }
        .season-node:nth-child(3){ left:52%; top:80%; }
        .season-node:nth-child(4){ left:77%; top:35%; }
        .season-node:nth-child(5){ left:95%; top:55%; }
        .season-node button { background:linear-gradient(135deg, #1f2638 0%, #242f46 100%); border:2px solid transparent; border-radius:18px; padding:1rem 1.2rem; min-width:140px; cursor:pointer; color:#fff; display:flex; flex-direction:column; align-items:flex-start; gap:.25rem; box-shadow:0 8px 22px -6px rgba(0,0,0,0.5); transition:.35s; }
        .season-node button:hover { transform:translateY(-6px); }
        .season-node.active button { border-color:var(--season-color); box-shadow:0 0 0 2px rgba(255,255,255,0.08), 0 8px 30px -4px var(--season-color); }
        .bubble { background:var(--season-color); color:#0a0f18; font-weight:600; padding:.35rem .6rem; border-radius:999px; font-size:.75rem; letter-spacing:.5px; }
        .label { font-weight:600; font-size:1rem; letter-spacing:.5px; }
        .months { font-size:.7rem; opacity:.65; letter-spacing:.5px; }
        .car { position:absolute; left:0; top:0; transform:translate(-50%,-50%); filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5)); }
        @media(max-width:900px){ .season-node button{min-width:120px;padding:.9rem 1rem;} }
        @media(max-width:700px){ .season-node{position:static; transform:none; margin:0 0 1rem 0;} .road{display:none;} .car{display:none;} .season-nodes{display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:1rem;} .season-roadmap{padding:2rem 1rem;} }
      `}</style>
    </div>
  );
}

export { SEASONS };
