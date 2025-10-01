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
        // Use backend global news aggregator
        const { data } = await axios.get('/api/news');
        const list = Array.isArray(data?.articles) ? data.articles : [];
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
            <PosterImage title={top.title} src={top.thumbnail} alt={top.title} />
          </div>
          <div className="hero-text">
            <h2>{top.title}</h2>
            {top.description && <p dangerouslySetInnerHTML={{ __html: top.description }} />}
            <a className="cta" href={top.link} target="_blank" rel="noreferrer noopener">Read More</a>
          </div>
        </article>
      )}
      <div className="grid">
        {articles.map((a) => (
          <article className="card" key={a.mal_id}>
            <div className="thumb"><PosterImage title={a.title} src={a.thumbnail} alt={a.title} /></div>
            <div className="meta">
              <h3>{a.title}</h3>
              <a className="read" href={a.link} target="_blank" rel="noreferrer noopener">Read More</a>
            </div>
          </article>
        ))}
      </div>
      <style jsx>{`
        .news-wrap{max-width:1160px;margin:0 auto;padding:1.5rem;color:var(--color-text);}
        .title{font-size:2.2rem;text-align:center;margin:1rem 0 1.5rem;background:linear-gradient(45deg, var(--color-accent), var(--color-accent-glow));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .error{color:var(--color-accent);text-align:center;padding:1rem;}
        .loading{color:var(--color-text-dim);text-align:center;padding:2rem;}
        .hero{position:relative;display:grid;grid-template-columns:1.5fr 1fr;gap:1rem;background:var(--color-surface);border:1px solid var(--color-border);border-radius:14px;overflow:hidden;margin-bottom:1.25rem;}
        .hero-img{aspect-ratio:16/9;background:var(--color-bg-alt)}
        .hero-text{padding:1rem;display:flex;flex-direction:column;gap:.6rem}
        .hero-text h2{color:var(--color-text);margin:0;}
        .hero-text p{color:var(--color-text-dim);margin:0;}
        .cta{align-self:flex-start;background:var(--color-accent);border:1px solid var(--color-accent);padding:.45rem .8rem;border-radius:10px;text-decoration:none;color:var(--color-glass);transition:all .2s}
        .cta:hover{background:var(--color-accent-alt);border-color:var(--color-accent-alt)}
        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem}
        .card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;overflow:hidden;display:flex;flex-direction:column;transition:all .2s}
        .card:hover{border-color:var(--color-accent-glow);transform:translateY(-2px)}
        .thumb{aspect-ratio:16/10;background:var(--color-bg-alt)}
        .meta{padding:.7rem .8rem;display:flex;flex-direction:column;gap:.5rem}
        .meta h3{color:var(--color-text);margin:0;}
        .read{align-self:flex-start;background:var(--color-glass);border:1px solid var(--color-border);padding:.35rem .6rem;border-radius:8px;color:var(--color-text);text-decoration:none;transition:all .2s}
        .read:hover{background:var(--color-accent-glow);border-color:var(--color-accent)}
        @media(max-width:860px){.hero{grid-template-columns:1fr}}
      `}</style>
    </div>
  );
}
