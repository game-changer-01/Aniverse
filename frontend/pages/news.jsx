import React, { useEffect, useState } from 'react';
import PosterImage from '../src/components/PosterImage';
import axios from 'axios';

export default function NewsPage() {
  const [top, setTop] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setError('');
      try {
        // Use Jikan Top Anime as placeholder news content (title + images)
        const { data } = await axios.get('/api/jikan/top?limit=13');
        const list = data?.anime || [];
        if (!mounted) return;
        setTop(list[0] || null);
        setArticles(list.slice(1));
      } catch (e) { if (mounted) setError('Failed to load news.'); }
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="news-wrap">
      <h1 className="title">News</h1>
      {error && <div className="error">{error}</div>}
      {loading && <div className="loading">Loading…</div>}
      {top && (
        <article className="hero">
          <div className="hero-img">
            <PosterImage title={top.title} src={top.images?.jpg?.large_image_url || top.images?.jpg?.image_url} alt={top.title} />
          </div>
          <div className="hero-text">
            <h2>{top.title}</h2>
            {top.synopsis && <p>{top.synopsis}</p>}
            <a className="cta" href={`/jikan/${top.mal_id}`}>Read More</a>
          </div>
        </article>
      )}
      <div className="grid">
        {articles.map((a) => (
          <article className="card" key={a.mal_id}>
            <div className="thumb"><PosterImage title={a.title} src={a.images?.jpg?.image_url} alt={a.title} /></div>
            <div className="meta">
              <h3>{a.title}</h3>
              <a className="read" href={`/jikan/${a.mal_id}`}>Read More</a>
            </div>
          </article>
        ))}
      </div>
      <style jsx>{`
        .news-wrap{max-width:1160px;margin:0 auto;padding:1.5rem;color:#fff;}
        .title{font-size:2.2rem;text-align:center;margin:1rem 0 1.5rem;}
        .hero{position:relative;display:grid;grid-template-columns:1.5fr 1fr;gap:1rem;background:#101622;border:1px solid #263147;border-radius:14px;overflow:hidden;margin-bottom:1.25rem;}
        .hero-img{aspect-ratio:16/9;background:#0d1420}
        .hero-text{padding:1rem;display:flex;flex-direction:column;gap:.6rem}
        .cta{align-self:flex-start;background:#243249;border:1px solid #2e3d55;padding:.45rem .8rem;border-radius:10px;text-decoration:none;color:#fff}
        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem}
        .card{background:#0f1522;border:1px solid #263147;border-radius:12px;overflow:hidden;display:flex;flex-direction:column}
        .thumb{aspect-ratio:16/10;background:#0d1420}
        .meta{padding:.7rem .8rem;display:flex;flex-direction:column;gap:.5rem}
        .read{align-self:flex-start;background:#243249;border:1px solid #2e3d55;padding:.35rem .6rem;border-radius:8px;color:#fff;text-decoration:none}
        @media(max-width:860px){.hero{grid-template-columns:1fr}}
      `}</style>
    </div>
  );
}
