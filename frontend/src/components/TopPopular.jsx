import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PosterImage from './PosterImage';
import { useRouter } from 'next/router';

export default function TopPopular() {
  const router = useRouter();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setError('');
      try {
        // Use Jikan Top Anime for richer dataset
        const { data } = await axios.get('/api/jikan/top?limit=100');
        if (!mounted) return;
        const items = data?.anime || [];
        setList(Array.isArray(items) ? items : []);
      } catch (e) {
        if (!mounted) return;
        setError('Could not load Top 500 popular anime.');
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="loading" role="status">Loading Top 500…</div>;
  if (error) return <div className="error" role="alert">{error}</div>;

  return (
    <div className="top-grid">
      {list.map(anime => (
        <div
          className="card"
          key={anime.mal_id || anime._id || anime.id}
          onClick={() => router.push(`/jikan/${anime.mal_id || anime._id || anime.id}`)}
          role="button"
          tabIndex={0}
          onKeyDown={(e)=>{ if(e.key==='Enter') router.push(`/jikan/${anime.mal_id || anime._id || anime.id}`); }}
        >
          <div className="poster"><PosterImage title={anime.title} src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || anime.image || anime.poster} alt={anime.title} /></div>
          <div className="meta">
            <div className="title">{anime.title}</div>
            {anime.genres && <div className="genres">{(anime.genres || []).slice(0,3).join(', ')}</div>}
          </div>
        </div>
      ))}
      <style jsx>{`
        .top-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:1rem; padding:1rem 1.5rem; }
  .card { background:#1b2436; border:1px solid #28344d; border-radius:12px; overflow:hidden; cursor:pointer; }
  .card:hover { transform: translateY(-2px); }
        .poster { aspect-ratio:3/4; background:#0e141f; }
        .meta { padding:.5rem .6rem .8rem; }
        .title { font-size:.9rem; margin:0 0 .25rem; }
        .genres { font-size:.7rem; opacity:.7; }
      `}</style>
    </div>
  );
}
