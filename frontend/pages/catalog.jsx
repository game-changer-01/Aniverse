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
      <h1 className="heading">Catalog</h1>
      <div className="layout">
        <aside className="filters">
          <div className="group">
            <div className="label">Year</div>
            <div className="chips">
              {years.slice(0,3).map(y => (
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
              {['Action','Fantasy','Comedy','Romance','Drama'].map(g => (
                <label key={g} className="check"><input type="checkbox" checked={genre===g} onChange={()=>setGenre(genre===g?'':g)} /> {g}</label>
              ))}
            </div>
          </div>
        </aside>
        <section className="content">
          {error && <div className="error">{error}</div>}
          <div className="grid">
            {items.map(a => (
              <div key={a.mal_id || a._id} className="card" onClick={()=>router.push(`/jikan/${a.mal_id || a._id}`)}>
                <div className="poster"><PosterImage title={a.title} src={a.images?.jpg?.large_image_url || a.images?.jpg?.image_url || a.image || a.poster} alt={a.title} /></div>
                <div className="meta">
                  <div className="title">{a.title}</div>
                  <div className="sub">{[a.year, a.type].filter(Boolean).join(', ')}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="more">
            <button disabled={loading} onClick={()=>setPage(p=>p+1)}>{loading? 'Loading…':'Show More'}</button>
          </div>
        </section>
      </div>
      <style jsx>{`
        .wrap{max-width:1200px;margin:0 auto;padding:1.5rem;color:var(--color-text)}
        .heading{text-align:center;font-size:2.2rem;margin:1rem 0 1.2rem;background:linear-gradient(45deg, var(--color-accent), var(--color-accent-glow));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .layout{display:grid;grid-template-columns:280px 1fr;gap:1rem}
        .filters{background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;padding:1rem;position:sticky;top:84px;height:max-content}
        .group{margin-bottom:1rem}
        .label{opacity:.8;margin-bottom:.4rem;color:var(--color-text)}
        .chips{display:flex;gap:.5rem;flex-wrap:wrap}
        .chip{background:var(--color-glass);border:1px solid var(--color-border);border-radius:999px;padding:.35rem .6rem;color:var(--color-text);transition:all .2s}
        .chip:hover{background:var(--color-accent-glow);border-color:var(--color-accent)}
        .chip.active{background:var(--color-accent);border-color:var(--color-accent);color:var(--color-glass)}
        .checks{display:flex;flex-direction:column;gap:.3rem}
        .check{opacity:.9;color:var(--color-text)}
        .content{}
        .error{color:var(--color-accent);text-align:center;padding:1rem}
        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:1rem}
        .card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;overflow:hidden;cursor:pointer;transition:all .2s}
        .card:hover{border-color:var(--color-accent-glow);transform:translateY(-2px)}
        .poster{aspect-ratio:3/4;background:var(--color-bg-alt)}
        .meta{padding:.6rem .7rem}
        .title{font-size:.95rem;color:var(--color-text)}
        .sub{opacity:.7;font-size:.8rem;color:var(--color-text-dim)}
        .more{display:flex;justify-content:center;margin:1rem 0}
        .more button{background:var(--color-surface);border:1px solid var(--color-border);border-radius:10px;color:var(--color-text);padding:.5rem 1rem;transition:all .2s}
        .more button:hover{background:var(--color-accent-alt);border-color:var(--color-accent)}
        .more button:disabled{opacity:0.5;cursor:not-allowed}
        @media(max-width:960px){.layout{grid-template-columns:1fr}}
      `}</style>
    </div>
  );
}
