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
        .loading { padding:2rem; text-align:center; color:var(--color-text-dim); }
        .error { padding:2rem; text-align:center; color:var(--color-accent); }
        .top-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:1.5rem; padding:1rem 1.5rem; }
        .card { 
          background:var(--color-surface); 
          border:1px solid var(--color-border); 
          border-radius:16px; 
          overflow:hidden; 
          cursor:pointer; 
          transition:all .35s ease;
          box-shadow:0 6px 20px -6px var(--color-shadow);
        }
        .card:hover { 
          transform:translateY(-6px); 
          border-color:var(--color-accent-glow);
          box-shadow:0 12px 30px -6px var(--color-shadow);
        }
        .poster { 
          aspect-ratio:3/4; 
          background:var(--color-bg-alt); 
          position:relative;
          overflow:hidden;
        }
        .poster img {
          width:100%;
          height:100%;
          object-fit:cover;
          transition:transform .35s ease;
        }
        .card:hover .poster img {
          transform:scale(1.05);
        }
        .meta { 
          padding:.9rem .95rem 1.2rem; 
          color:var(--color-text);
        }
        .title { 
          font-size:1rem; 
          margin:0 0 .5rem; 
          color:var(--color-text);
          line-height:1.3;
          font-weight:600;
        }
        .genres { 
          font-size:.75rem; 
          color:var(--color-text-dim);
          text-transform:uppercase;
          letter-spacing:.5px;
        }
      `}</style>
    </div>
  );
}
