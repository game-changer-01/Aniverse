import React, { useEffect, useRef } from 'react';
// Note: Avoiding createPortal to keep SSR-safe and simpler compile
import PosterImage from './PosterImage';

export default function AnimeDetailsModal({ open, onClose, anime, episodes, trailer, sourceLabel = 'Details' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={`${anime?.title || 'Anime'} ${sourceLabel}`} onClick={onClose}>
      <div className="modal-card" ref={ref} onClick={(e)=>e.stopPropagation()}>
        <div className="header">
          <div className="poster"><PosterImage title={anime?.title} src={anime?.images?.jpg?.large_image_url || anime?.images?.jpg?.image_url || anime?.images?.cover?.extraLarge || anime?.image || anime?.poster} alt={anime?.title} /></div>
          <div className="meta">
            <h2>{anime?.title}</h2>
            {anime?.genres && <div className="genres">{(anime.genres || []).join(', ')}</div>}
            {(anime?.season || anime?.year) && <div className="season">{[anime.season, anime.year].filter(Boolean).join(' ')}</div>}
            {anime?.synopsis && <p className="desc">{anime.synopsis}</p>}
          </div>
        </div>
        {trailer && trailer.site && trailer.id && (
          <div className="trailer">
            <div className="video-wrap">
              <div className="gradient" />
              {trailer.site === 'youtube' || trailer.site === 'YOUTUBE' ? (
                <iframe
                  title="Trailer"
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${trailer.id}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="no-trailer">Trailer preview not available</div>
              )}
            </div>
          </div>
        )}
        {!!episodes?.length && (
          <div className="episodes">
            <h3>Episodes</h3>
            <ul className="ep-list">
              {episodes.map((ep, idx) => (
                <li key={ep.mal_id || ep._id || idx} className="ep">
                  <span className="num">Ep {ep.episode || ep.number || idx + 1}</span>
                  <span className="title">{ep.title || ep.title_romanji || ep.title_japanese || 'Untitled'}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <button className="close" onClick={onClose} aria-label="Close details">×</button>
      </div>
      <style jsx>{`
        .modal-overlay { position:fixed; inset:0; background:var(--color-shadow); backdrop-filter:blur(6px); display:flex; align-items:flex-start; justify-content:center; padding:4vh 2vw; animation:fadeIn .2s ease; }
        .modal-card { position:relative; width:min(1100px, 96vw); max-height:92vh; overflow:auto; background:var(--color-surface); border:1px solid var(--color-border); border-radius:16px; box-shadow:0 20px 60px var(--color-shadow); animation:slideUp .25s ease; color:var(--color-text); }
        .header { display:grid; grid-template-columns:240px 1fr; gap:1rem; padding:1rem; }
        .poster { aspect-ratio:3/4; background:var(--color-bg-alt); border-radius:12px; overflow:hidden; border:1px solid var(--color-border); }
        .meta h2 { margin:.25rem 0 .5rem; color:var(--color-text); background:linear-gradient(45deg, var(--color-accent), var(--color-accent-glow));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
        .genres, .season { opacity:.8; font-size:.9rem; margin:.15rem 0; color:var(--color-text-dim); }
        .desc { opacity:.9; line-height:1.6; margin-top:.5rem; color:var(--color-text); }
        .trailer { padding:0 1rem 1rem; }
        .video-wrap { position:relative; width:100%; aspect-ratio:16/9; background:var(--color-bg); border:1px solid var(--color-border); border-radius:12px; overflow:hidden; }
        .gradient { position:absolute; inset:auto 0 0 0; height:40%; background:linear-gradient(180deg, transparent 0%, var(--color-shadow) 70%, var(--color-surface) 100%); pointer-events:none; }
        .episodes { padding:0 1rem 1rem; }
        .episodes h3 { color:var(--color-accent); }
        .ep-list { list-style:none; padding:0; margin:0; display:grid; gap:.5rem; }
        .ep { display:flex; align-items:center; gap:.6rem; background:var(--color-glass); border:1px solid var(--color-border); border-radius:10px; padding:.5rem .6rem; transition:all .2s; }
        .ep:hover { border-color:var(--color-accent-glow); }
        .ep .title { color:var(--color-text); }
        .num { background:var(--color-accent); border:1px solid var(--color-accent); border-radius:6px; padding:.1rem .4rem; font-size:.8rem; color:var(--color-glass); }
        .close { position:sticky; left:calc(100% - 40px); top:10px; background:transparent; color:var(--color-text); border:none; font-size:1.6rem; cursor:pointer; transition:color .2s; }
        .close:hover { color:var(--color-accent); }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { transform:translateY(8px); opacity:.9 } to { transform:none; opacity:1 } }
        @media (max-width: 760px) { .header { grid-template-columns:1fr; } }
      `}</style>
    </div>
  );
}
