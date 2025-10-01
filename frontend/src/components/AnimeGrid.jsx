import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PosterImage from './PosterImage';
import { useRouter } from 'next/router';
import AnimeDetailsModal from './AnimeDetailsModal';

// Simple grid to list some anime from /api/anime
export default function AnimeGrid({ onSelectAnime, pageSize = 24, search = '' }) {
  const router = useRouter();
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ anime: null, episodes: [], trailer: null, source: '' });

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
        let list = [];
        if (search && search.trim()) {
          // Prefer Jikan search as primary source
          try {
            const j = await axios.get(`/api/jikan/search?q=${encodeURIComponent(search)}&limit=${pageSize}`);
            list = Array.isArray(j.data?.anime) ? j.data.anime : [];
          } catch {}
          // Fallback to local /api/anime search if needed
          if (list.length === 0) {
            try {
              const { data } = await axios.get(`/api/anime?limit=${pageSize}&search=${encodeURIComponent(search)}`);
              list = Array.isArray(data?.animes) ? data.animes : (Array.isArray(data?.anime) ? data.anime : []);
            } catch {}
          }
        } else {
          // Default browse: use Jikan Top list
          try {
            const top = await axios.get(`/api/jikan/top?limit=${pageSize}`);
            list = Array.isArray(top.data?.anime) ? top.data.anime : [];
          } catch {}
          // Fallback to local curated list
          if (list.length === 0) {
            try {
              const { data } = await axios.get(`/api/anime?limit=${pageSize}`);
              list = Array.isArray(data?.animes) ? data.animes : (Array.isArray(data?.anime) ? data.anime : []);
            } catch {}
          }
        }
        if (!mounted) return;
        if (list.length > 0) {
          setAnimes(list);
        } else {
          setError('Unable to load anime list. Showing a small offline selection.');
          setAnimes(staticFallback);
        }
      } catch (e) {
        if (!mounted) return;
        setError('Unable to load anime list. Showing a small offline selection.');
        setAnimes(staticFallback);
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [pageSize, search]);

  const openDetails = async (anime) => {
    try {
      // Prefer Jikan if we can infer a MAL id in the object
      const malId = anime.mal_id;
      if (malId) {
        const [{ data: details }, { data: eps }] = await Promise.all([
          axios.get(`/api/jikan/anime/${malId}`),
          axios.get(`/api/jikan/anime/${malId}/episodes?limit=100`)
        ]);
        setModalData({ anime: details, episodes: eps?.episodes || [], trailer: (details?.trailer && (details.trailer.youtube_id ? { site:'youtube', id: details.trailer.youtube_id } : details.trailer)) || null, source: 'Jikan' });
        setModalOpen(true);
        return;
      }
    } catch {}
    // Fallback to internal details
    try {
      const id = anime._id || anime.id;
      if (!id) return;
      const [{ data: details }, { data: eps }] = await Promise.all([
        axios.get(`/api/anime/${id}`),
        axios.get(`/api/anime/${id}/episodes`)
      ]);
      setModalData({ anime: { ...details, images: { jpg: { image_url: details.image || details.poster } } }, episodes: eps?.episodes || [], trailer: null, source: 'Local' });
      setModalOpen(true);
    } catch {}
  };

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
          <div key={anime._id || anime.id || anime.mal_id} className="card" onClick={() => openDetails(anime)}>
            <div className="poster">
              <PosterImage
                title={anime.title}
                src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || anime.image || anime.poster}
                alt={anime.title}
              />
              <div className="overlay-gradient" />
            </div>
            <div className="info">
              <h3 className="title">{anime.title}</h3>
              {anime.genres && <div className="genres">{anime.genres.slice(0,3).join(', ')}</div>}
              <div className="actions" onClick={(e)=>e.stopPropagation()}>
                <button className="details" onClick={() => onSelectAnime && onSelectAnime(anime)}>Roadmap</button>
                <button
                  className="details"
                  onClick={(e) => {
                    e.stopPropagation();
                    const malId = anime.mal_id;
                    if (malId) {
                      router.push(`/jikan/${malId}`);
                    } else {
                      router.push(`/anime/${anime._id || anime.id}`);
                    }
                  }}
                >Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <AnimeDetailsModal open={modalOpen} onClose={() => setModalOpen(false)} anime={modalData.anime} episodes={modalData.episodes} trailer={modalData.trailer} sourceLabel={modalData.source} />
      <style jsx>{`
        .anime-grid-wrap { max-width:1300px; margin:0 auto; padding:2rem 1.5rem 3rem; }
        .top { display:flex; align-items:baseline; justify-content:space-between; gap:1rem; margin-bottom:1rem; }
        h2 { margin:0; font-size:1.6rem; color:var(--color-text); background:linear-gradient(45deg, var(--color-accent), var(--color-accent-glow));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
        .hint { margin:0; opacity:.75; color:var(--color-text-dim); }
        .banner { background:var(--color-surface); border:1px solid var(--color-border); color:var(--color-text); padding:.6rem .8rem; border-radius:10px; margin:.6rem 0 1rem; }
        .loading { opacity:.8; padding:.5rem 0; color:var(--color-text-dim); }
        .grid { display:grid; gap:1.25rem; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); }
        .card { background:var(--color-surface); border:1px solid var(--color-border); border-radius:14px; overflow:hidden; display:flex; flex-direction:column; cursor:pointer; transition: transform .2s ease, box-shadow .2s ease; }
        .card:hover { transform: translateY(-4px); box-shadow: 0 10px 24px var(--color-shadow); border-color:var(--color-accent-glow); }
        .poster { position:relative; aspect-ratio:3/4; background:var(--color-bg-alt); }
  .overlay-gradient { position:absolute; inset:0; background:linear-gradient(180deg, transparent 60%, var(--color-shadow) 100%); opacity:0; transition:opacity .2s ease; will-change: opacity; }
        .card:hover .overlay-gradient { opacity:1; }
        .info { padding:.75rem .8rem 1rem; display:flex; flex-direction:column; gap:.5rem; }
        .title { margin:0; font-size:0.98rem; line-height:1.3; color:var(--color-text); }
        .genres { font-size:.7rem; opacity:.65; color:var(--color-text-dim); }
  .actions { display:flex; gap:.5rem; }
  .details { align-self:flex-start; background:var(--color-glass); border:1px solid var(--color-border); color:var(--color-text); font-size:.75rem; padding:.45rem .7rem; border-radius:8px; cursor:pointer; transition:all .2s; }
  .details:hover { background:var(--color-accent-glow); border-color:var(--color-accent); }
      `}</style>
    </section>
  );
}
