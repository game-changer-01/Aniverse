import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import PosterImage from '../../src/components/PosterImage';

export default function JikanAnimeDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [anime, setAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      setLoading(true); setError('');
      try {
        const { data: details } = await axios.get(`/api/jikan/anime/${encodeURIComponent(id)}`);
        if (!mounted) return;
        setAnime(details || null);
        // Fetch all episode pages (up to a safe cap)
        let all = [];
        let page = 1;
        const limit = 100;
        for (let i = 0; i < 10; i++) { // cap at 1000 episodes max
          const { data: eps } = await axios.get(`/api/jikan/anime/${encodeURIComponent(id)}/episodes?page=${page}&limit=${limit}`);
          const list = Array.isArray(eps?.episodes) ? eps.episodes : [];
          all = all.concat(list);
          const hasNext = eps?.pagination?.has_next_page;
          if (!hasNext || list.length === 0) break;
          page += 1;
        }
        if (!mounted) return;
        setEpisodes(all);
      } catch (e) {
        if (!mounted) return;
        setError('Failed to load anime details.');
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [id]);

  // Streaming/provider links removed per requirements

  if (loading) return <div className="wrap"><div className="loading" role="status">Loading…</div></div>;
  if (error) return <div className="wrap"><div className="error" role="alert">{error}</div></div>;
  if (!anime) return <div className="wrap"><div role="status">Anime not found.</div></div>;

  const poster = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
  const streaming = Array.isArray(anime?.streaming) ? anime.streaming : [];

  return (
    <div className="details-wrap">
      <div className="top">
        <div className="poster"><PosterImage title={anime.title} src={poster} alt={anime.title} /></div>
        <div className="meta">
          <h1>{anime.title}</h1>
          {anime.genres && <div className="genres">{anime.genres.join(', ')}</div>}
          {anime.year && <div className="year">{anime.year}</div>}
          {anime.synopsis && <p className="desc">{anime.synopsis}</p>}
        </div>
      </div>

      <div className="episodes">
        <div className="ep-header">
          <h2>Episodes {typeof anime?.episodes === 'number' ? `(Total ${anime.episodes})` : episodes.length ? `(Loaded ${episodes.length})` : ''}</h2>
          {streaming.length > 0 && (
            <a
              className="start-btn"
              href={streaming[0]?.url || '#'}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`Start watching ${anime.title} on ${streaming[0]?.name || 'available platform'}`}
            >
              Start
            </a>
          )}
        </div>
        {episodes.length === 0 ? (
          <div className="empty">No episodes listed.</div>
        ) : (
          <div className="ep-grid" role="list">
            {episodes.map((ep, idx) => {
              const epNum = ep.episode || ep.number || idx + 1;
              const epTitle = ep.title || ep.title_romanji || ep.title_japanese || 'Untitled';
              return (
                <div key={ep.mal_id || epNum || idx} className="ep-card" role="listitem" aria-label={`Episode ${epNum}: ${epTitle}`}>
                  <div className="thumb" aria-hidden>
                    <div className="bg" />
                    <div className="overlay">
                      <div className="badge">Ep {epNum}</div>
                      <div className="ep-title">{epTitle}</div>
                    </div>
                  </div>
                  {/* Provider links removed */}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .details-wrap { max-width:1100px; margin:0 auto; padding:1.5rem; color:#fff; }
        .top { display:grid; grid-template-columns: 260px 1fr; gap:1.25rem; align-items:flex-start; }
        .poster { aspect-ratio:3/4; background:#0e141f; border-radius:12px; overflow:hidden; border:1px solid #2e3d55; }
        .meta h1 { margin:0 0 .5rem; font-size:1.8rem; }
        .genres, .year { opacity:.8; font-size:.9rem; margin:.15rem 0; }
        .desc { opacity:.9; line-height:1.6; margin-top:.75rem; }
    .episodes { margin-top:2rem; }
    .ep-header { display:flex; align-items:center; justify-content:space-between; gap:1rem; }
    .ep-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap:1rem; }
    .ep-card { background:#121a29; border:1px solid #28344d; border-radius:12px; overflow:hidden; box-shadow: 0 6px 20px rgba(0,0,0,.25); transition: transform .25s ease, box-shadow .25s ease; }
    .ep-card:hover { transform: translateY(-4px); box-shadow: 0 10px 26px rgba(0,0,0,.35); }
    .thumb { position:relative; aspect-ratio:16/9; overflow:hidden; background:#0e141f; }
  .thumb .bg { position:absolute; inset:0; background-image:url(${poster ? `'${poster}'` : "''"}); background-size:cover; background-position:center; filter:brightness(.5) saturate(1.05); transform: scale(1.02); }
    .thumb .overlay { position:absolute; inset:auto 0 0 0; padding:.75rem; background: linear-gradient(to top, rgba(0,0,0,.55), rgba(0,0,0,.0)); display:flex; flex-direction:column; gap:.35rem; }
    .thumb .badge { align-self:flex-start; background:#243249; border:1px solid #2e3d55; color:#cfe7ff; font-weight:700; padding:.15rem .45rem; border-radius:6px; font-size:.8rem; }
    .thumb .ep-title { font-weight:600; }
    .card-actions { display:flex; flex-wrap:wrap; gap:.4rem; padding:.6rem .75rem .8rem; }
    .watch { background:#243249; border:1px solid #2e3d55; border-radius:8px; padding:.3rem .55rem; color:#fff; text-decoration:none; font-size:.8rem; }
    .watch:hover { background:#2e3d55; }
    .start-btn { position:relative; display:inline-flex; align-items:center; justify-content:center; padding:.55rem 1.1rem; min-width:120px; border-radius:14px; color:#fff; text-decoration:none; font-weight:700; letter-spacing:.5px; backdrop-filter: blur(10px); background: linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.12)); border:1px solid rgba(255,255,255,0.18); box-shadow: 0 8px 30px rgba(0,0,0,.35), 0 0 0 2px rgba(255,255,255,0.05) inset; overflow:hidden; }
    .start-btn::before { content:''; position:absolute; inset:-2px; background: conic-gradient(from 0deg, #ff3d3d, #ff7a00, #ffe600, #00ff85, #00c3ff, #6a00ff, #ff3dff, #ff3d3d); filter: blur(14px); opacity:.35; z-index:0; }
    .start-btn::after { content:''; position:absolute; inset:2px; border-radius:12px; background: rgba(8,12,20,0.65); z-index:0; }
    .start-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 36px rgba(0,0,0,.45); }
    .start-btn:focus-visible { outline: 2px solid #6bc5ff; outline-offset: 2px; }
    .start-btn > * { position:relative; z-index:1; }
        @media (max-width: 720px){ .top { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
