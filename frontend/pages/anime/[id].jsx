import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import PosterImage from '../../src/components/PosterImage';

export default function AnimeDetailsPage() {
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
        const [{ data: details }, { data: eps }] = await Promise.all([
          axios.get(`/api/anime/${encodeURIComponent(id)}`),
          axios.get(`/api/anime/${encodeURIComponent(id)}/episodes`)
        ]);
        if (!mounted) return;
        setAnime(details || null);
        setEpisodes(Array.isArray(eps?.episodes) ? eps.episodes : []);
      } catch (e) {
        if (!mounted) return;
        setError('Failed to load anime details.');
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [id]);

  const crunchyLink = (title, number) => {
    const q = `${title || ''} episode ${number || ''}`.trim();
    return `https://www.crunchyroll.com/search?q=${encodeURIComponent(q)}`;
  };

  if (loading) return <div className="wrap"><div className="loading" role="status">Loading…</div></div>;
  if (error) return <div className="wrap"><div className="error" role="alert">{error}</div></div>;
  if (!anime) return <div className="wrap"><div role="status">Anime not found.</div></div>;

  return (
    <div className="details-wrap">
      <div className="top">
        <div className="poster"><PosterImage title={anime.title} src={anime.image || anime.poster} alt={anime.title} /></div>
        <div className="meta">
          <h1>{anime.title}</h1>
          {anime.genres && <div className="genres">{anime.genres.join(', ')}</div>}
          {anime.year && <div className="year">{anime.year}</div>}
          {anime.description && <p className="desc">{anime.description}</p>}
        </div>
      </div>

      <div className="episodes">
        <h2>Episodes</h2>
        {episodes.length === 0 ? (
          <div className="empty">No episodes listed.</div>
        ) : (
          <ul className="ep-list">
            {episodes.map(ep => (
              <li key={ep.number} className="ep">
                <div className="info">
                  <span className="num">Ep {ep.number}</span>
                  <span className="title">{ep.title}</span>
                  {typeof ep.duration === 'number' && <span className="dur">{ep.duration} min</span>}
                </div>
                <div className="actions">
                  <a href={crunchyLink(anime.title, ep.number)} target="_blank" rel="noreferrer noopener" className="watch">Watch on Crunchyroll ↗</a>
                </div>
              </li>
            ))}
          </ul>
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
        .ep-list { list-style:none; padding:0; margin:0; display:grid; gap:.6rem; }
        .ep { display:flex; align-items:center; justify-content:space-between; background:#1b2436; border:1px solid #28344d; border-radius:10px; padding:.6rem .8rem; }
        .ep .info { display:flex; align-items:center; gap:.75rem; }
        .ep .num { background:#243249; border:1px solid #2e3d55; border-radius:6px; padding:.15rem .45rem; font-size:.8rem; }
        .ep .title { font-weight:600; }
        .ep .dur { opacity:.7; font-size:.85rem; }
        .watch { background:#243249; border:1px solid #2e3d55; border-radius:8px; padding:.35rem .6rem; color:#fff; text-decoration:none; }
        .watch:hover { background:#2e3d55; }
        @media (max-width: 720px){ .top { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}