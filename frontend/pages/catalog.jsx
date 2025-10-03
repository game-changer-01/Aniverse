import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import PosterImage from '../src/components/PosterImage';
import { useRouter } from 'next/router';

const seasons = ['Winter','Spring','Summer','Fall'];
const years = Array.from({ length: 20 }, (_, i) => 2025 - i);

export default function CatalogPage() {
  // Conditional router - only use on client-side
  const router = typeof window !== 'undefined' ? useRouter() : null;
  const [year, setYear] = useState('');
  const [season, setSeason] = useState('');
  const [genre, setGenre] = useState('');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const query = useMemo(() => {
    const q = [];
    if (genre) q.push(genre);
    if (year) q.push(year);
    if (season) q.push(season);
    return q.join(' ');
  }, [genre, year, season]);

  useEffect(() => { setPage(1); setItems([]); }, [query]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setError('');
      try {
        const limit = 24;
        let data;
        if (query) {
          const resp = await axios.get(`/api/jikan/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
          data = resp.data;
        } else {
          const resp = await axios.get(`/api/jikan/top?page=${page}&limit=${limit}`);
          data = resp.data;
        }
        if (!mounted) return;
        const list = data?.anime || [];
        setItems(prev => page === 1 ? list : prev.concat(list));
      } catch (e) { if (mounted) setError('Failed to load.'); }
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [page, query]);

  return (
    <div className="wrap">
      <div className="hero-header">
        <h1 className="heading">CATALOG</h1>
        <p className="subtitle">DISCOVER THE MOST BELOVED ANIME SERIES FROM JAPAN</p>
      </div>
      
      <div className="layout">
        <aside className="filters">
          <div className="filter-header">
            <h3>FILTERS</h3>
          </div>
          <div className="group">
            <div className="label">Year</div>
            <div className="chips">
              {years.slice(0,5).map(y => (
                <button key={y} className={year===y? 'chip active':'chip'} onClick={()=>setYear(y===year?'':y)}>{y}</button>
              ))}
            </div>
          </div>
          <div className="group">
            <div className="label">Season</div>
            <div className="checks">
              {seasons.map(s => (
                <label key={s} className="check"><input type="checkbox" checked={season===s} onChange={()=>setSeason(season===s?'':s)} /> {s}</label>
              ))}
            </div>
          </div>
          <div className="group">
            <div className="label">Genres</div>
            <div className="checks">
              {['Action','Fantasy','Comedy','Romance','Drama','Sci-Fi','Thriller','Adventure'].map(g => (
                <label key={g} className="check"><input type="checkbox" checked={genre===g} onChange={()=>setGenre(genre===g?'':g)} /> {g}</label>
              ))}
            </div>
          </div>
        </aside>
        <section className="content">
          {error && <div className="error">{error}</div>}
          {!loading && items.length === 0 && (
            <div className="empty-state">
              <h3>COULD NOT LOAD TOP 500 POPULAR ANIME.</h3>
              <p>Try adjusting your filters or check back later.</p>
            </div>
          )}
          <div className="grid">
            {items.map(a => (
              <div key={a.mal_id || a._id} className="card" onClick={()=>router && router.push(`/jikan/${a.mal_id || a._id}`)}>
                <div className="poster"><PosterImage title={a.title} src={a.images?.jpg?.large_image_url || a.images?.jpg?.image_url || a.image || a.poster} alt={a.title} /></div>
                <div className="meta">
                  <div className="title">{a.title}</div>
                  <div className="sub">{[a.year, a.type].filter(Boolean).join(', ')}</div>
                </div>
              </div>
            ))}
          </div>
          {items.length > 0 && (
            <div className="more">
              <button disabled={loading} onClick={()=>setPage(p=>p+1)}>{loading? 'Loading…':'Show More'}</button>
            </div>
          )}
        </section>
      </div>
      <style jsx>{`
        .wrap{max-width:1600px;margin:0 auto;padding:2rem 1.5rem;color:var(--color-text);min-height:100vh}
        .hero-header{text-align:center;margin-bottom:3rem;padding:2rem 1rem}
        .heading{font-size:3.5rem;margin:0 0 1rem;font-weight:900;font-family:'Japan Ramen','Inter',sans-serif;background:linear-gradient(135deg,#5856d6 0%,#dd2a7b 50%,#ffd700 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:2px;text-transform:uppercase}
        .subtitle{font-size:1rem;color:rgba(255,255,255,0.7);letter-spacing:2px;text-transform:uppercase;margin:0;font-weight:500}
        .layout{display:grid;grid-template-columns:300px 1fr;gap:2rem}
        .filters{background:var(--color-surface);border:2px solid var(--color-border);border-radius:16px;padding:1.5rem;position:sticky;top:100px;height:max-content;backdrop-filter:blur(10px);box-shadow:0 8px 32px rgba(0,0,0,0.2)}
        .filter-header{margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:2px solid var(--luxury-gold)}
        .filter-header h3{margin:0;font-size:1.25rem;font-weight:700;background:linear-gradient(135deg,var(--luxury-gold),var(--luxury-rose));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .group{margin-bottom:1.5rem}
        .label{opacity:.9;margin-bottom:.75rem;color:var(--color-text);font-weight:600;font-size:0.95rem;letter-spacing:0.5px}
        .chips{display:flex;gap:.6rem;flex-wrap:wrap}
        .chip{background:var(--color-glass);border:2px solid var(--color-border);border-radius:999px;padding:.5rem 1rem;color:var(--color-text);transition:all .3s;font-weight:600;font-size:0.9rem}
        .chip:hover{background:linear-gradient(135deg,rgba(227,199,112,0.2),rgba(221,42,123,0.2));border-color:var(--luxury-gold);transform:translateY(-2px);box-shadow:0 4px 12px rgba(227,199,112,0.3)}
        .chip.active{background:linear-gradient(135deg,var(--luxury-gold),var(--luxury-rose));border-color:var(--luxury-gold);color:white;box-shadow:0 4px 16px rgba(227,199,112,0.5)}
        .checks{display:flex;flex-direction:column;gap:.5rem}
        .check{opacity:.9;color:var(--color-text);cursor:pointer;padding:0.4rem;border-radius:6px;transition:background 0.2s}
        .check:hover{background:rgba(227,199,112,0.1)}
        .check input{margin-right:0.5rem;cursor:pointer}
        .content{min-height:400px}
        .error{color:var(--luxury-rose);text-align:center;padding:2rem;font-size:1.1rem;background:rgba(221,42,123,0.1);border-radius:12px;margin-bottom:1rem}
        .empty-state{text-align:center;padding:4rem 2rem;background:var(--color-surface);border-radius:16px;border:2px dashed var(--color-border)}
        .empty-state h3{font-size:1.5rem;margin:0 0 1rem;color:var(--luxury-gold);font-family:'Japan Ramen','Inter',sans-serif}
        .empty-state p{color:rgba(255,255,255,0.6);margin:0}
        .grid{display:grid;grid-template-columns:repeat(5,1fr);gap:1.25rem}
        .card{background:var(--color-surface);border:1.5px solid var(--color-border);border-radius:12px;overflow:hidden;cursor:pointer;transition:all .35s cubic-bezier(.4,0,.2,1);position:relative;box-shadow:0 3px 15px rgba(0,0,0,0.2)}
        .card:hover{border-color:var(--luxury-gold);transform:translateY(-6px) scale(1.015);box-shadow:0 16px 48px rgba(227,199,112,0.35),0 0 0 1px var(--luxury-gold)}
        .card::before{content:'';position:absolute;inset:-1.5px;background:linear-gradient(135deg,var(--luxury-gold),var(--luxury-rose));opacity:0;border-radius:inherit;transition:opacity 0.35s;z-index:-1}
        .card:hover::before{opacity:0.12}
        .poster{aspect-ratio:3/4;background:linear-gradient(135deg,rgba(227,199,112,0.1),rgba(221,42,123,0.1));overflow:hidden}
        .poster img{transition:transform 0.3s}
        .card:hover .poster img{transform:scale(1.08)}
        .meta{padding:0.75rem 0.9rem}
        .title{font-size:0.9rem;color:var(--color-text);font-weight:600;line-height:1.35;margin-bottom:0.4rem}
        .sub{opacity:.7;font-size:.75rem;color:var(--color-text-dim)}
        .more{display:flex;justify-content:center;margin:2rem 0}
        .more button{background:linear-gradient(135deg,rgba(227,199,112,0.2),rgba(221,42,123,0.2));border:2px solid var(--luxury-gold);border-radius:12px;color:var(--color-text);padding:.75rem 2rem;transition:all .3s;font-weight:600;font-size:1rem;letter-spacing:0.5px;text-transform:uppercase}
        .more button:hover{background:linear-gradient(135deg,var(--luxury-gold),var(--luxury-rose));border-color:var(--luxury-gold);color:white;transform:translateY(-2px);box-shadow:0 6px 20px rgba(227,199,112,0.5)}
        .more button:disabled{opacity:0.5;cursor:not-allowed;transform:none}
        @media(max-width:1400px){.grid{grid-template-columns:repeat(4,1fr);gap:1.15rem}}
        @media(max-width:1100px){.layout{grid-template-columns:1fr}.filters{position:relative;top:0}.grid{grid-template-columns:repeat(3,1fr);gap:1rem}}
        @media(max-width:800px){.grid{grid-template-columns:repeat(2,1fr);gap:0.9rem}}
        @media(max-width:500px){.grid{grid-template-columns:repeat(1,1fr);gap:0.8rem}.heading{font-size:2.5rem}}
      `}</style>
    </div>
  );
}
