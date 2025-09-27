import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PosterImage from './PosterImage';

// Simple grid to list some anime from /api/anime
export default function AnimeGrid({ onSelectAnime, pageSize = 24 }) {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const staticFallback = [
    { _id:'fallback1', title:'Attack on Titan', genres:['Action','Drama'], image:'https://cdn.myanimelist.net/images/anime/10/47347.jpg' },
    { _id:'fallback2', title:'Demon Slayer', genres:['Action','Supernatural'], image:'https://cdn.myanimelist.net/images/anime/1286/99889.jpg' },
    { _id:'fallback3', title:'Your Name', genres:['Romance','Drama'], image:'https://cdn.myanimelist.net/images/anime/5/87048.jpg' },
    { _id:'fallback4', title:'Fullmetal Alchemist: Brotherhood', genres:['Action','Adventure'], image:'https://cdn.myanimelist.net/images/anime/1223/96541.jpg' },
    { _id:'fallback5', title:'Steins;Gate', genres:['Sci-Fi','Thriller'], image:'https://cdn.myanimelist.net/images/anime/1935/127974.jpg' }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setError('');
      try {
        const { data } = await axios.get(`/api/anime?limit=${pageSize}`);
        if (!mounted) return;
        const list = data?.animes || data?.anime || [];
        setAnimes(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!mounted) return;
        setError('Unable to load anime list. Showing a small offline selection.');
        setAnimes(staticFallback);
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [pageSize]);

  return (
    <section className="anime-grid-wrap">
      <div className="top">
        <h2>Browse Anime</h2>
        <p className="hint">Pick any title and we’ll build a roadmap around it.</p>
      </div>
      {error && <div className="banner" role="status">{error}</div>}
      {loading && <div className="loading" role="status">Loading anime…</div>}
      <div className="grid">
        {animes.map(anime => (
          <div key={anime._id || anime.id} className="card">
            <div className="poster">
              <PosterImage title={anime.title} src={anime.image || anime.poster} alt={anime.title} />
            </div>
            <div className="info">
              <h3 className="title">{anime.title}</h3>
              {anime.genres && <div className="genres">{anime.genres.slice(0,3).join(', ')}</div>}
              <button className="details" onClick={() => onSelectAnime && onSelectAnime(anime)}>Details</button>
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        .anime-grid-wrap { max-width:1300px; margin:0 auto; padding:2rem 1.5rem 3rem; }
        .top { display:flex; align-items:baseline; justify-content:space-between; gap:1rem; margin-bottom:1rem; }
        h2 { margin:0; font-size:1.6rem; }
        .hint { margin:0; opacity:.75; }
        .banner { background:#2b2130; border:1px solid #5a3a48; color:#eed; padding:.6rem .8rem; border-radius:10px; margin:.6rem 0 1rem; }
        .loading { opacity:.8; padding:.5rem 0; }
        .grid { display:grid; gap:1.25rem; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); }
        .card { background:#1b2436; border:1px solid #28344d; border-radius:14px; overflow:hidden; display:flex; flex-direction:column; }
        .poster { aspect-ratio:3/4; background:#0e141f; }
        .info { padding:.75rem .8rem 1rem; display:flex; flex-direction:column; gap:.5rem; }
        .title { margin:0; font-size:0.98rem; line-height:1.3; }
        .genres { font-size:.7rem; opacity:.65; }
        .details { align-self:flex-start; background:#243249; border:1px solid #2e3d55; color:#fff; font-size:.75rem; padding:.45rem .7rem; border-radius:8px; cursor:pointer; }
        .details:hover { background:#2e3d55; }
      `}</style>
    </section>
  );
}
