import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PosterImage from './PosterImage';
import { useRouter } from 'next/router';

export default function TopPopular() {
  // Conditional router - only use on client-side
  const router = typeof window !== 'undefined' ? useRouter() : null;
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
        console.log('Top Popular API Response:', data);
        const items = data?.anime || [];
        console.log('Parsed items:', items.length, 'anime found');
        setList(Array.isArray(items) ? items : []);
      } catch (e) {
        if (!mounted) return;
        console.error('Top Popular API Error:', e.message, e.response?.status, e.response?.data);
        setError('Could not load Top 500 popular anime.');
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="loading" role="status">Loading Top 500…</div>;
  if (error) return <div className="error" role="alert">{error}</div>;

  return (
    <div className="top-grid">
      {list.map(anime => {
        const genres = anime.genres && Array.isArray(anime.genres) && anime.genres.length > 0 
          ? anime.genres.slice(0, 3) 
          : [];
        const rating = anime.score || anime.rating || 0;
        const year = anime.year || (anime.aired?.prop?.from?.year) || '';
        const type = anime.type || 'TV';
        const episodes = anime.episodes || 0;
        
        return (
          <div
            className="card"
            key={anime.mal_id || anime._id || anime.id}
            role="article"
            aria-label={anime.title}
          >
            <div 
              className="poster"
              onClick={() => router?.push(`/jikan/${anime.mal_id || anime._id || anime.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e)=>{ if(e.key==='Enter' && router) router.push(`/jikan/${anime.mal_id || anime._id || anime.id}`); }}
            >
              <PosterImage title={anime.title} src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || anime.image || anime.poster} alt={anime.title} />
              {rating > 0 && (
                <div className="rating-badge">
                  <span className="star">★</span>
                  <span className="score">{rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <div className="meta">
              <div className="title">{anime.title}</div>
              <div className="info-row">
                {rating > 0 && <span className="info-badge rating-text">★ {rating.toFixed(1)}</span>}
                {year && <span className="info-badge">{year}</span>}
                {type && <span className="info-badge">{type}</span>}
                {episodes > 0 && <span className="info-badge">{episodes} EPS</span>}
              </div>
              {genres.length > 0 && (
                <div className="genres">
                  {genres.map((genre, idx) => (
                    <span key={idx} className="genre-badge">{genre.name || genre}</span>
                  ))}
                </div>
              )}
              <div className="actions">
                <button 
                  className="btn btn-details"
                  onClick={() => router?.push(`/jikan/${anime.mal_id || anime._id || anime.id}`)}
                  aria-label={`View details for ${anime.title}`}
                >
                  VIEW DETAILS
                </button>
                <button 
                  className="btn btn-roadmap"
                  onClick={() => {
                    const animeData = encodeURIComponent(JSON.stringify({
                      mal_id: anime.mal_id,
                      title: anime.title,
                      image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
                      poster: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
                    }));
                    router?.push(`/recommendations?anime=${anime.mal_id}&data=${animeData}`);
                  }}
                  aria-label={`View roadmap for ${anime.title}`}
                >
                  🗺️ ROADMAP
                </button>
              </div>
            </div>
          </div>
        );
      })}
      <style jsx>{`
        .loading { padding:2rem; text-align:center; color:var(--color-text-dim); }
        .error { padding:2rem; text-align:center; color:var(--luxury-rose); background:rgba(221,42,123,0.1); border-radius:12px; font-size:1.1rem; }
        .top-grid { 
          display:grid; 
          grid-template-columns:repeat(6, 1fr); 
          gap:1rem; 
          padding:1rem;
          max-width:1600px;
          margin:0 auto;
        }
        .card { 
          background:rgba(30, 30, 35, 0.95); 
          border:2px solid rgba(255, 255, 255, 0.1); 
          border-radius:12px; 
          overflow:hidden; 
          transition:all .4s cubic-bezier(.4,0,.2,1);
          position:relative;
          box-shadow:0 6px 24px rgba(0,0,0,0.4);
          backdrop-filter: blur(10px);
        }
        .card:hover { 
          transform:translateY(-8px) scale(1.02); 
          border-color:var(--luxury-gold);
          box-shadow:0 16px 48px rgba(227,199,112,0.5), 0 0 0 2px var(--luxury-gold);
        }
        .card::before {
          content:'';
          position:absolute;
          inset:-2px;
          background:linear-gradient(135deg,var(--luxury-gold),var(--luxury-rose));
          opacity:0;
          border-radius:inherit;
          transition:opacity 0.4s;
          z-index:-1;
        }
        .card:hover::before {
          opacity:0.2;
        }
        .poster { 
          aspect-ratio:2/3; 
          background:linear-gradient(135deg,rgba(227,199,112,0.1),rgba(221,42,123,0.1)); 
          position:relative;
          overflow:hidden;
          cursor:pointer;
        }
        .poster img {
          width:100%;
          height:100%;
          object-fit:cover;
          transition:transform .4s ease;
        }
        .card:hover .poster img {
          transform:scale(1.1);
        }
        .rating-badge {
          position:absolute;
          top:6px;
          left:6px;
          background:rgba(255, 215, 0, 0.95);
          color:#000;
          padding:2px 6px;
          border-radius:12px;
          font-weight:800;
          font-size:0.7rem;
          display:flex;
          align-items:center;
          gap:2px;
          box-shadow:0 3px 8px rgba(255, 215, 0, 0.5);
          z-index:2;
        }
        .rating-badge .star {
          font-size:0.75rem;
          color:#000;
        }
        .rating-badge .score {
          font-weight:800;
          font-size:0.7rem;
        }
        .meta { 
          padding:0.6rem 0.7rem 0.75rem; 
          color:var(--color-text);
        }
        .title { 
          font-size:0.75rem; 
          margin:0 0 .4rem; 
          color:#fff;
          line-height:1.2;
          font-weight:700;
          overflow:hidden;
          text-overflow:ellipsis;
          display:-webkit-box;
          -webkit-line-clamp:2;
          -webkit-box-orient:vertical;
          min-height:1.8rem;
          font-family: 'Japan Ramen', 'Inter', sans-serif;
          text-transform:uppercase;
          letter-spacing:0.3px;
        }
        .info-row {
          display:flex;
          flex-wrap:wrap;
          gap:0.25rem;
          margin-bottom:0.5rem;
        }
        .info-badge {
          background:rgba(255, 255, 255, 0.1);
          color:rgba(255, 255, 255, 0.8);
          padding:2px 5px;
          border-radius:3px;
          font-size:0.55rem;
          font-weight:600;
          text-transform:uppercase;
          letter-spacing:0.3px;
        }
        .info-badge.rating-text {
          background:rgba(255, 215, 0, 0.2);
          color:#ffd700;
        }
        .genres {
          display:flex;
          flex-wrap:wrap;
          gap:0.25rem;
          margin-bottom:0.5rem;
        }
        .genre-badge {
          background:rgba(88, 86, 214, 0.3);
          color:#b8b6ff;
          padding:2px 6px;
          border-radius:4px;
          font-size:0.55rem;
          font-weight:600;
          text-transform:uppercase;
          letter-spacing:0.3px;
          border:1px solid rgba(88, 86, 214, 0.5);
        }
        .actions {
          display:flex;
          gap:0.35rem;
          margin-top:0.5rem;
        }
        .btn {
          flex:1;
          padding:0.45rem 0.5rem;
          border:none;
          border-radius:6px;
          font-size:0.6rem;
          font-weight:700;
          cursor:pointer;
          transition:all 0.3s ease;
          text-transform:uppercase;
          letter-spacing:0.5px;
          font-family: 'Japan Ramen', 'Inter', sans-serif;
        }
        .btn-details {
          background:linear-gradient(135deg, #8B7355, #A0826D);
          color:#fff;
          box-shadow:0 3px 8px rgba(139, 115, 85, 0.4);
        }
        .btn-details:hover {
          transform:translateY(-2px);
          box-shadow:0 5px 12px rgba(139, 115, 85, 0.6);
          background:linear-gradient(135deg, #A0826D, #B89968);
        }
        .btn-roadmap {
          background:rgba(30, 30, 35, 0.8);
          color:#fff;
          border:1.5px solid #8B5A7C;
        }
        .btn-roadmap:hover {
          background:linear-gradient(135deg, rgba(139, 90, 124, 0.3), rgba(139, 115, 85, 0.3));
          transform:translateY(-2px);
          box-shadow:0 5px 12px rgba(139, 90, 124, 0.4);
        }
        @media(max-width:1400px){.top-grid{grid-template-columns:repeat(5, 1fr)}}
        @media(max-width:1100px){.top-grid{grid-template-columns:repeat(4, 1fr)}}
        @media(max-width:900px){.top-grid{grid-template-columns:repeat(3, 1fr)}}
        @media(max-width:600px){
          .top-grid{grid-template-columns:repeat(2, 1fr); gap:0.75rem;}
          .actions{flex-direction:column; gap:0.25rem;}
          .btn{font-size:0.55rem; padding:0.4rem;}
        }
      `}</style>
    </div>
  );
}
