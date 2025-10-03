import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const MangaPage = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { id: 'all', label: 'All', icon: '📚', originalLanguage: null },
    { id: 'manga', label: 'Japanese Manga', icon: '🇯🇵', originalLanguage: 'ja' },
    { id: 'manhwa', label: 'Korean Manhwa', icon: '🇰🇷', originalLanguage: 'ko' },
    { id: 'manhua', label: 'Chinese Manhua', icon: '🇨🇳', originalLanguage: 'zh,zh-hk' },
    { id: 'popular', label: 'Popular', icon: '🔥', originalLanguage: null },
    { id: 'action', label: 'Action', icon: '⚔️', tag: 'action' },
    { id: 'romance', label: 'Romance', icon: '💕', tag: 'romance' }
  ];

  useEffect(() => {
    fetchManga();
  }, [selectedCategory]);

  const fetchManga = async () => {
    setLoading(true);
    setError('');
    try {
      const category = categories.find(c => c.id === selectedCategory);
      const params = new URLSearchParams({
        limit: 24,
        offset: 0
      });

      // Add language filter for manga/manhwa/manhua
      if (category?.originalLanguage) {
        params.append('originalLanguage', category.originalLanguage);
      }

      const endpoint = selectedCategory === 'popular' 
        ? '/api/mangadex/popular/all'
        : `/api/mangadex/search?${params}`;

      console.log('Fetching manga from:', endpoint);
      const { data } = await axios.get(endpoint);
      console.log('MangaDex API Response:', data);

      const items = data?.data || [];
      console.log('Parsed manga items:', items.length, 'found');
      
      setMangaList(items);
    } catch (e) {
      console.error('MangaDex API Error:', e.message, e.response?.status, e.response?.data);
      setError('Could not load manga. Please try again later.');
      setMangaList([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredManga = mangaList;

  return (
    <div className="manga-page">
      {/* Hero Section */}
      <section className="manga-hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">Manga Reading Hub</h1>
          <p className="hero-subtitle">Explore Manga, Manhwa & Manhua from across the world</p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="category-section">
        <div className="category-container">
          <div className="category-grid">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-label">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Manga Grid */}
      <section className="manga-section">
        <div className="manga-container">
          <div className="section-header">
            <h2 className="section-title">
              {categories.find(c => c.id === selectedCategory)?.label || 'All Manga'}
            </h2>
            <p className="section-count">
              {loading ? 'Loading...' : `${filteredManga.length} titles available`}
            </p>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading manga from MangaDex...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchManga} className="retry-btn">Retry</button>
            </div>
          )}

          {!loading && !error && (
            <div className="manga-grid">
              {filteredManga.map(manga => (
                <div key={manga.id} className="manga-card">
                  <div className="manga-cover">
                    <img 
                      src={manga.coverUrl || 'https://via.placeholder.com/300x400?text=No+Cover'} 
                      alt={manga.title}
                      loading="lazy"
                    />
                    <div className="manga-overlay">
                      <button 
                        className="read-btn"
                        onClick={() => window.open(`https://mangadex.org/title/${manga.id}`, '_blank')}
                      >
                        Read on MangaDex
                      </button>
                    </div>
                    <div className={`status-badge ${manga.status || 'unknown'}`}>
                      {manga.status || 'Unknown'}
                    </div>
                  </div>
                  <div className="manga-info">
                    <h3 className="manga-title">{manga.title}</h3>
                    <div className="manga-meta">
                      {manga.lastChapter && <span className="chapters">Ch. {manga.lastChapter}</span>}
                      {manga.originalLanguage && (
                        <span className="type">
                          {manga.originalLanguage === 'ja' ? 'MANGA' : 
                           manga.originalLanguage === 'ko' ? 'MANHWA' : 
                           manga.originalLanguage === 'zh' || manga.originalLanguage === 'zh-hk' ? 'MANHUA' : 
                           manga.originalLanguage.toUpperCase()}
                        </span>
                      )}
                      {manga.year && <span className="year">{manga.year}</span>}
                    </div>
                    <div className="manga-genres">
                      {manga.tags && manga.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="genre-tag">{tag.name}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        .manga-page {
          min-height: 100vh;
          background: var(--color-bg);
          color: var(--color-text);
        }

        /* Hero Section */
        .manga-hero {
          position: relative;
          height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          overflow: hidden;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 20% 30%, rgba(227, 199, 112, 0.1), transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(221, 42, 123, 0.1), transparent 50%);
          opacity: 0.5;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 0 2rem;
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 900;
          margin: 0 0 1rem 0;
          background: linear-gradient(135deg, #5856d6 0%, #dd2a7b 50%, #ffd700 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-transform: uppercase;
          font-family: 'Japan Ramen', 'Inter', sans-serif;
          letter-spacing: -1px;
        }

        .hero-subtitle {
          font-size: 1.3rem;
          color: rgba(255, 255, 255, 0.8);
          font-family: 'Japan Ramen', 'Inter', sans-serif;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        /* Category Section */
        .category-section {
          padding: 3rem 2rem 2rem;
          background: var(--color-bg);
        }

        .category-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .category-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: center;
        }

        .category-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(30, 30, 35, 0.8);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 50px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .category-btn:hover {
          border-color: var(--luxury-gold);
          background: rgba(227, 199, 112, 0.2);
          transform: translateY(-2px);
        }

        .category-btn.active {
          background: linear-gradient(135deg, var(--luxury-gold), var(--luxury-rose));
          border-color: var(--luxury-gold);
          color: #000;
          box-shadow: 0 4px 16px rgba(227, 199, 112, 0.4);
        }

        .cat-icon {
          font-size: 1.2rem;
        }

        /* Manga Section */
        .manga-section {
          padding: 2rem 2rem 6rem;
          background: var(--color-bg);
        }

        .manga-container {
          max-width: 1600px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 900;
          margin: 0 0 0.5rem 0;
          background: linear-gradient(135deg, #5856d6 0%, #dd2a7b 50%, #ffd700 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-family: 'Japan Ramen', 'Inter', sans-serif;
        }

        .section-count {
          color: rgba(255, 255, 255, 0.6);
          font-size: 1rem;
        }

        .manga-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 1.5rem;
        }

        .manga-card {
          background: rgba(30, 30, 35, 0.95);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.4s ease;
          cursor: pointer;
        }

        .manga-card:hover {
          transform: translateY(-8px);
          border-color: var(--luxury-gold);
          box-shadow: 0 16px 48px rgba(227, 199, 112, 0.4);
        }

        .manga-cover {
          position: relative;
          aspect-ratio: 2/3;
          overflow: hidden;
        }

        .manga-cover img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .manga-card:hover .manga-cover img {
          transform: scale(1.1);
        }

        .manga-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .manga-card:hover .manga-overlay {
          opacity: 1;
        }

        .read-btn {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, var(--luxury-gold), var(--luxury-rose));
          border: none;
          border-radius: 50px;
          color: #000;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: transform 0.3s ease;
        }

        .read-btn:hover {
          transform: scale(1.1);
        }

        .rating-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(255, 215, 0, 0.95);
          color: #000;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 3px;
          z-index: 2;
        }

        .star {
          font-size: 0.85rem;
        }

        .status-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          z-index: 2;
        }

        .status-badge.ongoing {
          background: rgba(76, 175, 80, 0.9);
          color: #fff;
        }

        .status-badge.completed {
          background: rgba(33, 150, 243, 0.9);
          color: #fff;
        }

        .manga-info {
          padding: 0.75rem;
        }

        .manga-title {
          font-size: 0.85rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: #fff;
          font-family: 'Japan Ramen', 'Inter', sans-serif;
          text-transform: uppercase;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          min-height: 2.1rem;
        }

        .manga-meta {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .manga-meta span {
          background: rgba(255, 255, 255, 0.1);
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
        }

        .manga-genres {
          display: flex;
          flex-wrap: wrap;
          gap: 0.3rem;
        }

        .genre-tag {
          background: rgba(88, 86, 214, 0.3);
          color: #b8b6ff;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.6rem;
          font-weight: 600;
          border: 1px solid rgba(88, 86, 214, 0.5);
        }

        /* Loading State */
        .loading-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .spinner {
          width: 50px;
          height: 50px;
          margin: 0 auto 1rem;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-top-color: var(--luxury-gold);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-state p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 1rem;
        }

        /* Error State */
        .error-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .error-state p {
          color: #ff6b6b;
          font-size: 1.1rem;
          margin-bottom: 1.5rem;
        }

        .retry-btn {
          background: var(--luxury-gold);
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 8px;
          font-weight: 700;
          color: #000;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .retry-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(227, 199, 112, 0.4);
        }

        .year {
          background: rgba(255, 215, 0, 0.2) !important;
          border: 1px solid rgba(255, 215, 0, 0.4);
        }

        /* Responsive */
        @media (max-width: 1400px) {
          .manga-grid {
            grid-template-columns: repeat(5, 1fr);
          }
        }

        @media (max-width: 1100px) {
          .manga-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 900px) {
          .manga-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          
          .hero-title {
            font-size: 2.5rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }
        }

        @media (max-width: 600px) {
          .manga-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }

          .category-grid {
            gap: 0.5rem;
          }

          .category-btn {
            padding: 0.6rem 1rem;
            font-size: 0.8rem;
          }

          .hero-title {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MangaPage;
