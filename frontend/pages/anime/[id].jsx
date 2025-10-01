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
        .details-wrap { max-width:1100px; margin:0 auto; padding:1.5rem; color:var(--color-text); }
        .wrap { max-width:1100px; margin:0 auto; padding:1.5rem; color:var(--color-text); }
        .loading, .error { text-align:center; padding:2rem; color:var(--color-text-dim); }
        .error { color:var(--color-accent); }
        .top { display:grid; grid-template-columns: 260px 1fr; gap:1.25rem; align-items:flex-start; }
        .poster { aspect-ratio:3/4; background:var(--color-bg-alt); border-radius:12px; overflow:hidden; border:1px solid var(--color-border); }
        .meta h1 { margin:0 0 .5rem; font-size:1.8rem; color:var(--color-text); background:linear-gradient(45deg, var(--color-accent), var(--color-accent-glow));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
        .genres, .year { opacity:.8; font-size:.9rem; margin:.15rem 0; color:var(--color-text-dim); }
        .desc { opacity:.9; line-height:1.6; margin-top:.75rem; color:var(--color-text); }
        .episodes { margin-top:2rem; }
        .episodes h2 { color:var(--color-accent); }
        .empty { padding:1rem; color:var(--color-text-dim); text-align:center; }
        .ep-list { list-style:none; padding:0; margin:0; display:grid; gap:.6rem; }
        .ep { display:flex; align-items:center; justify-content:space-between; background:var(--color-surface); border:1px solid var(--color-border); border-radius:10px; padding:.6rem .8rem; transition:all .2s; }
        .ep:hover { border-color:var(--color-accent-glow); }
        .ep .info { display:flex; align-items:center; gap:.75rem; }
        .ep .num { background:var(--color-glass); border:1px solid var(--color-border); border-radius:6px; padding:.15rem .45rem; font-size:.8rem; color:var(--color-text); }
        .ep .title { font-weight:600; color:var(--color-text); }
        .ep .dur { opacity:.7; font-size:.85rem; color:var(--color-text-dim); }
        .watch { background:var(--color-accent); border:1px solid var(--color-accent); border-radius:8px; padding:.35rem .6rem; color:var(--color-glass); text-decoration:none; transition:all .2s; }
        .watch:hover { background:var(--color-accent-alt); border-color:var(--color-accent-alt); }
        @media (max-width: 720px){ .top { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}