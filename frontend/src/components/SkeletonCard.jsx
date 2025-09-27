import React from 'react';

const SkeletonCard = () => (
  <div className="skeleton-card" aria-hidden="true">
    <div className="skeleton-thumb shimmer" />
    <div className="skeleton-lines">
      <span className="skeleton-line shimmer" />
      <span className="skeleton-line short shimmer" />
      <span className="skeleton-line shimmer" />
    </div>
    <style jsx>{`
      .skeleton-card { width:240px; border-radius:16px; background:rgba(255,255,255,0.05); padding:1rem; display:flex; flex-direction:column; gap:.75rem; }
      .skeleton-thumb { width:100%; height:140px; background:rgba(255,255,255,0.08); border-radius:12px; }
      .skeleton-lines { display:flex; flex-direction:column; gap:.5rem; }
      .skeleton-line { height:10px; background:rgba(255,255,255,0.08); border-radius:6px; display:block; }
      .skeleton-line.short { width:60%; }
      .shimmer { position:relative; overflow:hidden; }
      .shimmer:before { content:''; position:absolute; inset:0; background:linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.15) 45%, transparent 90%); animation:shimmer 1.4s linear infinite; }
      @keyframes shimmer { from { transform:translateX(-100%);} to { transform:translateX(100%);} }
    `}</style>
  </div>
);

export default SkeletonCard;