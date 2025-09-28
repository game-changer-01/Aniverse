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
        const { data } = await axios.get(`/api/anime?limit=${pageSize}${search ? `&search=${encodeURIComponent(search)}` : ''}`);
        if (!mounted) return;
        let list = data?.animes || data?.anime || [];
        if (!Array.isArray(list)) list = [];
        // If we have no results and a search term, try Jikan search as fallback
        if (list.length === 0 && search) {
          try {
            const j = await axios.get(`/api/jikan/search?q=${encodeURIComponent(search)}&limit=${pageSize}`);
            list = j.data?.anime || [];
          } catch {}
        }
        setAnimes(list);
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
                  onClick={() => {
                    const malId = anime.mal_id;
                    if (malId) router.push(`/jikan/${malId}`);
                    else router.push(`/anime/${anime._id || anime.id}`);
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
        h2 { margin:0; font-size:1.6rem; }
        .hint { margin:0; opacity:.75; }
        .banner { background:#2b2130; border:1px solid #5a3a48; color:#eed; padding:.6rem .8rem; border-radius:10px; margin:.6rem 0 1rem; }
        .loading { opacity:.8; padding:.5rem 0; }
        .grid { display:grid; gap:1.25rem; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); }
        .card { background:#1b2436; border:1px solid #28344d; border-radius:14px; overflow:hidden; display:flex; flex-direction:column; cursor:pointer; transition: transform .2s ease, box-shadow .2s ease; }
        .card:hover { transform: translateY(-4px); box-shadow: 0 10px 24px rgba(0,0,0,.35); }
        .poster { position:relative; aspect-ratio:3/4; background:#0e141f; }
        .overlay-gradient { position:absolute; inset:0; background:linear-gradient(180deg, rgba(0,0,0,0) 65%, rgba(18,24,38,0.95) 100%); opacity:0; transition:opacity .2s ease; }
        .card:hover .overlay-gradient { opacity:1; }
        .info { padding:.75rem .8rem 1rem; display:flex; flex-direction:column; gap:.5rem; }
        .title { margin:0; font-size:0.98rem; line-height:1.3; }
        .genres { font-size:.7rem; opacity:.65; }
  .actions { display:flex; gap:.5rem; }
  .details { align-self:flex-start; background:#243249; border:1px solid #2e3d55; color:#fff; font-size:.75rem; padding:.45rem .7rem; border-radius:8px; cursor:pointer; }
  .details:hover { background:#2e3d55; }
      `}</style>
    </section>
  );
}
