import React, { useEffect, useState } from 'react';
import PosterImage from '../src/components/PosterImage';
import axios from 'axios';

export default function NewsPage() {
  const [top, setTop] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sources, setSources] = useState(null);
  const [updated, setUpdated] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

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
        setSources(data.sources);
        setUpdated(data.updated);
      } catch (e) { if (mounted) setError('Failed to load news from multiple sources.'); }
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  const getSourceColor = (source) => {
    if (source?.includes('MyAnimeList')) return '#2e51a2';
    if (source?.includes('Anime News Network')) return '#e94f37';
    if (source?.includes('Crunchyroll')) return '#f47521';
    return '#8b5cf6';
  };

  // Anime Merchandise Categories and Items (India-focused)
  const categories = [
    { id: 'all', label: 'All Items', icon: '🛍️' },
    { id: 'figures', label: 'Figures & Models', icon: '🗿' },
    { id: 'clothing', label: 'Clothing', icon: '👕' },
    { id: 'accessories', label: 'Accessories', icon: '⌚' },
    { id: 'collectibles', label: 'Collectibles', icon: '🎴' },
    { id: 'home', label: 'Home Decor', icon: '🏠' }
  ];

  const merchandise = [
    // Figures & Models
    { id: 1, name: 'Naruto Uzumaki Action Figure', category: 'figures', price: '₹1,299', image: 'https://placehold.co/400x600/1a1a2e/ffd700?text=Naruto+Figure', buyLink: 'https://www.comicsense.xyz/search?q=naruto+figure', rating: 4.5 },
    { id: 2, name: 'One Piece Luffy Figure', category: 'figures', price: '₹1,899', image: 'https://placehold.co/400x600/1a1a2e/ffd700?text=Luffy+Figure', buyLink: 'https://www.comicsense.xyz/search?q=one+piece+figure', rating: 4.7 },
    { id: 3, name: 'Dragon Ball Z Goku Figure', category: 'figures', price: '₹2,499', image: 'https://placehold.co/400x600/1a1a2e/ffd700?text=Goku+Figure', buyLink: 'https://www.comicsense.xyz/search?q=dragon+ball+figure', rating: 4.8 },
    { id: 4, name: 'Attack on Titan Figure', category: 'figures', price: '₹1,799', image: 'https://placehold.co/400x600/1a1a2e/ffd700?text=AOT+Figure', buyLink: 'https://www.comicsense.xyz/search?q=attack+on+titan', rating: 4.6 },
    
    // Clothing
    { id: 5, name: 'Akatsuki Cloud Hoodie', category: 'clothing', price: '₹1,299', image: 'https://placehold.co/400x600/1a1a2e/dd2a7b?text=Akatsuki+Hoodie', buyLink: 'https://weebshop.in/collections/hoodies', rating: 4.4 },
    { id: 6, name: 'My Hero Academia T-Shirt', category: 'clothing', price: '₹699', image: 'https://placehold.co/400x600/1a1a2e/5856d6?text=MHA+T-Shirt', buyLink: 'https://weebshop.in/collections/t-shirts', rating: 4.3 },
    { id: 7, name: 'One Punch Man Hoodie', category: 'clothing', price: '₹1,499', image: 'https://placehold.co/400x600/1a1a2e/dd2a7b?text=OPM+Hoodie', buyLink: 'https://weebshop.in/collections/hoodies', rating: 4.5 },
    { id: 8, name: 'Demon Slayer T-Shirt', category: 'clothing', price: '₹799', image: 'https://placehold.co/400x600/1a1a2e/5856d6?text=Demon+Slayer', buyLink: 'https://weebshop.in/collections/t-shirts', rating: 4.6 },
    
    // Accessories
    { id: 9, name: 'Anime Keychain Collection', category: 'accessories', price: '₹299', image: 'https://placehold.co/400x600/1a1a2e/ffd700?text=Keychains', buyLink: 'https://www.comicsense.xyz/collections/accessories', rating: 4.2 },
    { id: 10, name: 'Naruto Headband Leaf Village', category: 'accessories', price: '₹399', image: 'https://placehold.co/400x600/1a1a2e/ffd700?text=Naruto+Headband', buyLink: 'https://weebshop.in/collections/accessories', rating: 4.4 },
    { id: 11, name: 'Attack on Titan Wings Pin', category: 'accessories', price: '₹199', image: 'https://placehold.co/400x600/1a1a2e/ffd700?text=AOT+Wings+Pin', buyLink: 'https://www.comicsense.xyz/collections/accessories', rating: 4.3 },
    { id: 12, name: 'Anime Character Phone Ring', category: 'accessories', price: '₹249', image: 'https://placehold.co/400x600/1a1a2e/ffd700?text=Phone+Ring', buyLink: 'https://weebshop.in/collections/accessories', rating: 4.1 },
    
    // Collectibles
    { id: 13, name: 'Anime Sticker Bomb Pack', category: 'collectibles', price: '₹249', image: 'https://placehold.co/400x600/1a1a2e/dd2a7b?text=Sticker+Pack', buyLink: 'https://www.comicsense.xyz/collections/stickers', rating: 4.5 },
    { id: 14, name: 'Pokemon Card Collection', category: 'collectibles', price: '₹899', image: 'https://placehold.co/400x600/1a1a2e/dd2a7b?text=Pokemon+Cards', buyLink: 'https://www.comicsense.xyz/collections/trading-cards', rating: 4.7 },
    { id: 15, name: 'One Piece Wanted Poster Set', category: 'collectibles', price: '₹399', image: 'https://placehold.co/400x600/1a1a2e/dd2a7b?text=Wanted+Posters', buyLink: 'https://weebshop.in/collections/posters', rating: 4.4 },
    { id: 16, name: 'Demon Slayer Katana Sword', category: 'collectibles', price: '₹1,999', image: 'https://placehold.co/400x600/1a1a2e/dd2a7b?text=Katana+Sword', buyLink: 'https://www.comicsense.xyz/collections/collectibles', rating: 4.6 },
    
    // Home Decor
    { id: 17, name: 'Anime Wall Poster Set', category: 'home', price: '₹599', image: 'https://placehold.co/400x600/1a1a2e/5856d6?text=Wall+Posters', buyLink: 'https://weebshop.in/collections/posters', rating: 4.5 },
    { id: 18, name: 'Totoro Plush Cushion', category: 'home', price: '₹799', image: 'https://placehold.co/400x600/1a1a2e/5856d6?text=Totoro+Plush', buyLink: 'https://www.comicsense.xyz/collections/plushies', rating: 4.8 },
    { id: 19, name: 'Attack on Titan Wall Flag', category: 'home', price: '₹599', image: 'https://placehold.co/400x600/1a1a2e/5856d6?text=AOT+Flag', buyLink: 'https://weebshop.in/collections/home-decor', rating: 4.3 },
    { id: 20, name: 'Anime 3D LED Lamp', category: 'home', price: '₹1,199', image: 'https://placehold.co/400x600/1a1a2e/5856d6?text=LED+Lamp', buyLink: 'https://www.comicsense.xyz/collections/home-decor', rating: 4.6 }
  ];

  const filteredMerchandise = selectedCategory === 'all' 
    ? merchandise 
    : merchandise.filter(item => item.category === selectedCategory);

  return (
    <div className="page-wrap">
      {/* ANIME MERCHANDISE STORE SECTION */}
      <section className="store-section">
        <div className="store-header">
          <h1 className="store-title">Anime Culture Store</h1>
          <p className="store-subtitle">Premium Anime Merchandise Available in India 🇮🇳</p>
        </div>

        {/* Category Filter */}
        <div className="category-filter">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`cat-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-label">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Merchandise Grid */}
        <div className="merch-grid">
          {filteredMerchandise.map(item => (
            <div key={item.id} className="merch-card">
              <div className="merch-image">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  loading="lazy"
                />
                <div className="rating-badge">
                  <span className="star">★</span>
                  <span className="score">{item.rating}</span>
                </div>
              </div>
              <div className="merch-info">
                <h3 className="merch-name">{item.name}</h3>
                <div className="merch-price">{item.price}</div>
                <a 
                  href={item.buyLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="buy-btn"
                >
                  {item.buyLink.includes('comicsense') ? 'Buy on ComicSense →' : 'Buy on WeebShop →'}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DIVIDER */}
      <div className="section-divider">
        <div className="divider-line"></div>
        <span className="divider-text">LATEST ANIME NEWS</span>
        <div className="divider-line"></div>
      </div>

      {/* NEWS SECTION */}
      <section className="news-section">
        <div className="header">
          <h2 className="news-title">Anime News</h2>
          <p className="subtitle">Latest updates from across the anime world</p>
          {sources && (
            <div className="source-badges">
              <span className="badge" style={{ background: '#2e51a2' }}>MyAnimeList ({sources.mal})</span>
              <span className="badge" style={{ background: '#e94f37' }}>Anime News Network ({sources.ann})</span>
              <span className="badge" style={{ background: '#f47521' }}>Crunchyroll ({sources.crunchyroll})</span>
            </div>
          )}
          {updated && <div className="update-time">Last updated: {new Date(updated).toLocaleString()}</div>}
        </div>
        {error && <div className="error">{error}</div>}
        {loading && <div className="loading">Loading news from multiple sources…</div>}
        {top && (
          <article className="hero">
            <div className="hero-img">
              <PosterImage title={top.title} src={top.thumbnail} alt={top.title} />
            </div>
            <div className="hero-text">
              <span className="source-tag" style={{ background: getSourceColor(top.source) }}>{top.source}</span>
              <h3>{top.title}</h3>
              {top.description && <p dangerouslySetInnerHTML={{ __html: top.description }} />}
              {top.author && <div className="author">By {top.author}</div>}
              <a className="cta" href={top.link} target="_blank" rel="noreferrer noopener">Read Full Article →</a>
            </div>
          </article>
        )}
        <div className="grid">
          {articles.map((a) => (
            <article className="card" key={a.mal_id}>
              <div className="thumb"><PosterImage title={a.title} src={a.thumbnail} alt={a.title} /></div>
              <div className="meta">
                <span className="source-tag small" style={{ background: getSourceColor(a.source) }}>{a.source}</span>
                <h4>{a.title}</h4>
                {a.author && <div className="author-small">By {a.author}</div>}
                <a className="read" href={a.link} target="_blank" rel="noreferrer noopener">Read Article →</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <style jsx>{`
        .page-wrap{max-width:1600px;margin:0 auto;padding:2rem 1.5rem;color:var(--color-text);min-height:100vh}
        
        /* STORE SECTION */
        .store-section{margin-bottom:4rem}
        .store-header{text-align:center;margin-bottom:3rem}
        .store-title{font-size:4rem;margin:0 0 0.5rem;font-weight:900;font-family:'Japan Ramen','Inter',sans-serif;background:linear-gradient(135deg,#5856d6 0%,#dd2a7b 50%,#ffd700 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:2px;text-transform:uppercase}
        .store-subtitle{font-size:1.2rem;color:rgba(255,255,255,0.7);letter-spacing:1.5px;text-transform:uppercase;margin:0;font-weight:500}
        
        .category-filter{display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;margin-bottom:2.5rem}
        .cat-btn{background:rgba(30,30,35,0.95);border:2px solid rgba(255,255,255,0.1);border-radius:12px;padding:0.8rem 1.5rem;display:flex;align-items:center;gap:0.6rem;font-size:0.95rem;font-weight:600;cursor:pointer;transition:all 0.3s ease;color:rgba(255,255,255,0.8)}
        .cat-btn:hover{border-color:var(--luxury-gold);background:rgba(227,199,112,0.2);transform:translateY(-2px)}
        .cat-btn.active{background:linear-gradient(135deg,var(--luxury-gold),var(--luxury-rose));border-color:var(--luxury-gold);color:#000;box-shadow:0 4px 16px rgba(227,199,112,0.4)}
        .cat-icon{font-size:1.3rem}
        
        .merch-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:1.5rem;margin-bottom:3rem}
        .merch-card{background:rgba(30,30,35,0.95);border:2px solid rgba(255,255,255,0.1);border-radius:12px;overflow:hidden;transition:all 0.4s ease;cursor:pointer}
        .merch-card:hover{transform:translateY(-8px);border-color:var(--luxury-gold);box-shadow:0 16px 48px rgba(227,199,112,0.4)}
        .merch-image{position:relative;aspect-ratio:3/4;overflow:hidden;background:#1a1a1e}
        .merch-image img{width:100%;height:100%;object-fit:cover;transition:transform 0.4s ease}
        .merch-card:hover .merch-image img{transform:scale(1.1)}
        .rating-badge{position:absolute;top:10px;right:10px;background:rgba(0,0,0,0.85);padding:4px 10px;border-radius:20px;display:flex;align-items:center;gap:4px;z-index:2}
        .star{color:#ffd700;font-size:0.9rem}
        .score{color:#fff;font-size:0.85rem;font-weight:700}
        .merch-info{padding:1rem}
        .merch-name{font-size:0.95rem;font-weight:700;margin:0 0 0.6rem;color:#fff;font-family:'Japan Ramen','Inter',sans-serif;text-transform:uppercase;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;min-height:2.5rem}
        .merch-price{font-size:1.3rem;font-weight:800;color:var(--luxury-gold);margin-bottom:0.8rem}
        .buy-btn{display:block;text-align:center;background:linear-gradient(135deg,var(--luxury-gold),var(--luxury-rose));border:none;padding:0.6rem 1rem;border-radius:8px;color:#000;text-decoration:none;font-weight:700;font-size:0.85rem;transition:all 0.3s ease}
        .buy-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(227,199,112,0.6)}
        
        /* DIVIDER */
        .section-divider{display:flex;align-items:center;gap:1.5rem;margin:4rem 0 3rem}
        .divider-line{flex:1;height:2px;background:linear-gradient(90deg,transparent,var(--luxury-gold),transparent)}
        .divider-text{font-size:1.5rem;font-weight:900;font-family:'Japan Ramen','Inter',sans-serif;background:linear-gradient(135deg,#5856d6,#dd2a7b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:2px}
        
        /* NEWS SECTION */
        .news-section{margin-bottom:4rem}
        .header{text-align:center;margin-bottom:3rem}
        .news-title{font-size:2.5rem;margin:0 0 0.5rem;font-weight:900;font-family:'Japan Ramen','Inter',sans-serif;background:linear-gradient(135deg,#5856d6 0%,#dd2a7b 50%,#ffd700 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:2px;text-transform:uppercase}
        .subtitle{font-size:1rem;color:rgba(255,255,255,0.7);letter-spacing:1.5px;text-transform:uppercase;margin:0 0 1.5rem;font-weight:500}
        .source-badges{display:flex;justify-content:center;gap:1rem;flex-wrap:wrap;margin-bottom:1rem}
        .badge{padding:0.5rem 1rem;border-radius:20px;font-size:0.85rem;font-weight:600;color:white;box-shadow:0 2px 8px rgba(0,0,0,0.3)}
        .update-time{font-size:0.8rem;color:rgba(255,255,255,0.5);margin-top:0.5rem}
        .error{color:var(--luxury-rose);text-align:center;padding:2rem;font-size:1.1rem;background:rgba(221,42,123,0.1);border-radius:12px;margin-bottom:1rem}
        .loading{color:var(--color-text-dim);text-align:center;padding:3rem;font-size:1.1rem}
        .hero{position:relative;display:grid;grid-template-columns:1.5fr 1fr;gap:1.5rem;background:var(--color-surface);border:2px solid var(--color-border);border-radius:16px;overflow:hidden;margin-bottom:2rem;box-shadow:0 8px 32px rgba(0,0,0,0.3)}
        .hero-img{aspect-ratio:16/9;background:linear-gradient(135deg,rgba(227,199,112,0.1),rgba(221,42,123,0.1));position:relative;overflow:hidden}
        .hero-text{padding:1.5rem;display:flex;flex-direction:column;gap:.8rem}
        .source-tag{display:inline-block;padding:0.4rem 0.8rem;border-radius:16px;font-size:0.75rem;font-weight:700;color:white;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.5rem}
        .source-tag.small{padding:0.3rem 0.6rem;font-size:0.7rem}
        .hero-text h3{color:var(--color-text);margin:0;font-size:1.75rem;line-height:1.3;font-weight:700}
        .hero-text p{color:var(--color-text-dim);margin:0;line-height:1.6;font-size:0.95rem}
        .author{font-size:0.85rem;color:var(--luxury-gold);font-weight:600}
        .author-small{font-size:0.75rem;color:rgba(255,255,255,0.6)}
        .cta{align-self:flex-start;background:linear-gradient(135deg,var(--luxury-gold),var(--luxury-rose));border:none;padding:.6rem 1.2rem;border-radius:10px;text-decoration:none;color:white;transition:all .3s;font-weight:700;font-size:0.9rem;box-shadow:0 4px 12px rgba(227,199,112,0.4)}
        .cta:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(227,199,112,0.6)}
        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.25rem}
        .card{background:var(--color-surface);border:2px solid var(--color-border);border-radius:12px;overflow:hidden;display:flex;flex-direction:column;transition:all .3s;box-shadow:0 4px 16px rgba(0,0,0,0.2)}
        .card:hover{border-color:var(--luxury-gold);transform:translateY(-4px);box-shadow:0 8px 32px rgba(227,199,112,0.3)}
        .thumb{aspect-ratio:16/10;background:linear-gradient(135deg,rgba(227,199,112,0.1),rgba(221,42,123,0.1));overflow:hidden;position:relative}
        .thumb img{transition:transform 0.3s}
        .card:hover .thumb img{transform:scale(1.05)}
        .meta{padding:1rem;display:flex;flex-direction:column;gap:.6rem}
        .meta h4{color:var(--color-text);margin:0;font-size:1rem;line-height:1.4;font-weight:600}
        .read{align-self:flex-start;background:rgba(227,199,112,0.2);border:1px solid var(--luxury-gold);padding:.4rem .8rem;border-radius:8px;color:var(--color-text);text-decoration:none;transition:all .3s;font-size:0.85rem;font-weight:600}
        .read:hover{background:linear-gradient(135deg,var(--luxury-gold),var(--luxury-rose));color:white;border-color:var(--luxury-gold);transform:translateY(-2px)}
        
        @media(max-width:1400px){.merch-grid{grid-template-columns:repeat(4,1fr)}}
        @media(max-width:1100px){.merch-grid{grid-template-columns:repeat(3,1fr)}}
        @media(max-width:960px){.hero{grid-template-columns:1fr}.store-title{font-size:2.5rem}.merch-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:600px){.merch-grid{grid-template-columns:1fr}.category-filter{flex-direction:column}.cat-btn{justify-content:center}.source-badges{flex-direction:column;align-items:center}}
      `}</style>
    </div>
  );
}
