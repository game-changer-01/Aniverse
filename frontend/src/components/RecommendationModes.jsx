import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SkeletonCard from './SkeletonCard';
import { useRouter } from 'next/router';

const RecommendationModes = () => {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState('smart-mix');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [modeInfo, setModeInfo] = useState(null);

  const modes = [
    {
      id: 'smart-mix',
      name: 'Smart Mix',
      icon: '🎭',
      description: 'Balanced blend of all genres',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 'content-based',
      name: 'Top Rated',
      icon: '⭐',
      description: 'High ratings + compelling storylines',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      id: 'community',
      name: 'Community Picks',
      icon: '👥',
      description: 'Worldwide favorites by year',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      id: 'trending',
      name: 'Trending Now',
      icon: '🔥',
      description: 'Monthly top performers',
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    }
  ];

  useEffect(() => {
    fetchRecommendations(activeMode);
  }, [activeMode, selectedYear]);

  const fetchRecommendations = async (mode) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      let endpoint = '';
      let params = { limit: 20 };

      switch (mode) {
        case 'smart-mix':
          endpoint = '/api/recommend/smart-mix';
          break;
        case 'content-based':
          endpoint = '/api/recommend/content-based';
          break;
        case 'community':
          endpoint = '/api/recommend/community';
          params.year = selectedYear;
          break;
        case 'trending':
          endpoint = '/api/recommend/trending';
          params.limit = 10;
          break;
      }

      const response = await axios.get(endpoint, { headers, params });
      setRecommendations(response.data.recommendations || []);
      setModeInfo({
        message: response.data.message,
        year: response.data.year,
        period: response.data.period
      });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (modeId) => {
    setActiveMode(modeId);
  };

  const currentMode = modes.find(m => m.id === activeMode);
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="recommendation-modes" id="browse">
      {/* Main Heading */}
      <div className="main-heading">
        <h1 className="luxury-title">Browse Anime Collection</h1>
        <p className="luxury-subtitle">Curated selections powered by advanced algorithms</p>
      </div>

      {/* Mode Selector */}
      <div className="mode-selector">
        <h2 className="section-title">Choose Your Discovery Mode</h2>
        <div className="mode-grid">
          {modes.map((mode) => (
            <button
              key={mode.id}
              className={`mode-card ${activeMode === mode.id ? 'active' : ''}`}
              onClick={() => handleModeChange(mode.id)}
              style={{
                '--mode-gradient': mode.gradient,
                '--mode-color': mode.color
              }}
            >
              <div className="mode-icon">{mode.icon}</div>
              <div className="mode-info">
                <h3 className="mode-name">{mode.name}</h3>
                <p className="mode-desc">{mode.description}</p>
              </div>
              {activeMode === mode.id && (
                <div className="active-indicator">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Year Selector for Community Mode */}
      {activeMode === 'community' && (
        <div className="year-selector">
          <label>Select Year:</label>
          <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      )}

      {/* Mode Info Banner */}
      {modeInfo && (
        <div className="mode-info-banner" style={{ background: currentMode.gradient }}>
          <div className="banner-icon">{currentMode.icon}</div>
          <div className="banner-content">
            <h3>{currentMode.name}</h3>
            <p>{modeInfo.message}</p>
            {modeInfo.year && <span className="year-badge">Year: {modeInfo.year}</span>}
            {modeInfo.period && <span className="period-badge">{modeInfo.period}</span>}
          </div>
        </div>
      )}

      {/* Recommendations Grid */}
      <div className="recommendations-grid">
        {loading ? (
          Array.from({ length: activeMode === 'trending' ? 10 : 20 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))
        ) : recommendations.length > 0 ? (
          recommendations.map((anime, index) => (
            <div 
              key={anime._id || anime.mal_id} 
              className="anime-card-wrapper"
            >
              <div className="rank-badge" style={{ background: currentMode.color }}>
                #{index + 1}
              </div>
              <div className="recommendation-card">
                <div className="card-poster">
                  {anime.image || anime.images?.jpg?.large_image_url ? (
                    <img 
                      src={anime.image || anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url} 
                      alt={anime.title}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.classList.add('no-image');
                      }}
                    />
                  ) : (
                    <div className="no-image-placeholder">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="card-info">
                  <h4 className="card-title">{anime.title}</h4>
                  <div className="card-meta">
                    {anime.rating && <span className="rating">⭐ {anime.rating}</span>}
                    {anime.score && <span className="rating">⭐ {anime.score}</span>}
                    {anime.year && <span className="year">{anime.year}</span>}
                    {anime.type && <span className="type">{anime.type}</span>}
                  </div>
                  {anime.genres && anime.genres.length > 0 && (
                    <div className="card-genres">
                      {anime.genres.slice(0, 3).map((genre, i) => (
                        <span key={i} className="genre-tag">{typeof genre === 'string' ? genre : genre.name}</span>
                      ))}
                    </div>
                  )}
                  <div className="card-actions">
                    <button 
                      className="view-details-btn"
                      onClick={() => {
                        const id = anime._id || anime.mal_id;
                        const path = anime._id ? `/anime/${id}` : `/jikan/${id}`;
                        router.push(path);
                      }}
                    >
                      View Details
                    </button>
                    <button 
                      className="roadmap-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        const animeData = encodeURIComponent(JSON.stringify({
                          _id: anime._id,
                          mal_id: anime.mal_id,
                          title: anime.title,
                          image: anime.image || anime.images?.jpg?.large_image_url,
                          poster: anime.image || anime.images?.jpg?.large_image_url
                        }));
                        router.push(`/recommendations?anime=${anime._id || anime.mal_id}&data=${animeData}`);
                      }}
                    >
                      🗺️ Roadmap
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p>No recommendations available</p>
            <span>Try a different mode or year</span>
          </div>
        )}
      </div>

      <style jsx>{`
        .recommendation-modes {
          padding: 3rem 0 2rem;
        }

        .main-heading {
          text-align: center;
          margin-bottom: 4rem;
          padding: 2rem 1rem;
        }

        .luxury-title {
          font-size: 3.5rem;
          font-weight: 900;
          margin: 0 0 1rem;
          background: linear-gradient(135deg, #5856d6 0%, #dd2a7b 50%, #ffd700 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -1px;
          text-transform: uppercase;
          position: relative;
          display: inline-block;
          animation: shimmer 3s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 20px rgba(88, 86, 214, 0.3)); }
          50% { filter: brightness(1.2) drop-shadow(0 0 30px rgba(221, 42, 123, 0.5)); }
        }

        .luxury-subtitle {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin: 0;
        }

        .section-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: var(--color-text);
          text-align: center;
          letter-spacing: 0.5px;
        }

        .mode-selector {
          margin-bottom: 3rem;
        }

        .mode-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        @media (max-width: 1200px) {
          .mode-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .mode-card {
          position: relative;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: inherit;
          text-align: left;
          overflow: hidden;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .mode-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--mode-gradient);
          opacity: 0;
          transition: opacity 0.4s;
          z-index: 0;
        }

        .mode-card:hover::before {
          opacity: 0.15;
        }

        .mode-card.active {
          border-color: var(--mode-color);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.3), 
                      0 12px 40px rgba(0, 0, 0, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1);
          transform: translateY(-4px) scale(1.02);
          background: linear-gradient(135deg, rgba(88, 86, 214, 0.1), rgba(221, 42, 123, 0.05));
        }

        .mode-card.active::before {
          opacity: 0.2;
        }

        .mode-icon {
          font-size: 2.5rem;
          flex-shrink: 0;
          z-index: 1;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        .mode-info {
          flex: 1;
          z-index: 1;
        }

        .mode-name {
          font-size: 1.125rem;
          font-weight: 700;
          margin: 0 0 0.25rem;
          color: var(--color-text);
        }

        .mode-desc {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          margin: 0;
        }

        .active-indicator {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          color: var(--mode-color);
          z-index: 1;
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .active-indicator svg {
          width: 100%;
          height: 100%;
        }

        .year-selector {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          background: var(--color-surface);
          border-radius: 12px;
          margin-bottom: 2rem;
          border: 1px solid var(--color-border);
        }

        .year-selector label {
          font-weight: 600;
          color: var(--color-text);
        }

        .year-selector select {
          padding: 0.5rem 1rem;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          color: var(--color-text);
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .year-selector select:hover {
          border-color: var(--color-accent);
        }

        .year-selector select:focus {
          outline: none;
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px rgba(var(--color-accent-rgb), 0.1);
        }

        .mode-info-banner {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          border-radius: 16px;
          margin-bottom: 2rem;
          color: white;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }

        .banner-icon {
          font-size: 3rem;
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
        }

        .banner-content {
          flex: 1;
        }

        .banner-content h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem;
        }

        .banner-content p {
          font-size: 1rem;
          margin: 0 0 0.75rem;
          opacity: 0.95;
        }

        .year-badge, .period-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          backdrop-filter: blur(10px);
          margin-right: 0.5rem;
        }

        .recommendations-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 1.5rem;
        }

        @media (max-width: 1400px) {
          .recommendations-grid {
            grid-template-columns: repeat(5, 1fr);
          }
        }

        @media (max-width: 1200px) {
          .recommendations-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 900px) {
          .recommendations-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .anime-card-wrapper {
          position: relative;
        }

        .rank-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          z-index: 10;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 700;
          color: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .empty-state {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          color: var(--color-text-secondary);
        }

        .empty-state svg {
          width: 64px;
          height: 64px;
          margin-bottom: 1rem;
          opacity: 0.5;
          stroke-width: 1.5;
        }

        .empty-state p {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0 0 0.5rem;
        }

        .empty-state span {
          font-size: 0.875rem;
          opacity: 0.7;
        }

        .recommendation-card {
          background: linear-gradient(145deg, rgba(18, 18, 18, 0.95), rgba(30, 30, 30, 0.9));
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.08);
          height: 100%;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
        }

        .recommendation-card:hover {
          transform: translateY(-12px) scale(1.03);
          box-shadow: 0 20px 60px rgba(88, 86, 214, 0.4),
                      0 0 0 1px rgba(255, 255, 255, 0.1),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1);
          border-color: rgba(88, 86, 214, 0.5);
        }

        .card-poster {
          position: relative;
          width: 100%;
          aspect-ratio: 2/3;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(88, 86, 214, 0.1), rgba(221, 42, 123, 0.1));
        }

        .card-poster img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .recommendation-card:hover .card-poster img {
          transform: scale(1.1);
        }

        .no-image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(88, 86, 214, 0.2), rgba(221, 42, 123, 0.2));
        }

        .no-image-placeholder svg {
          width: 64px;
          height: 64px;
          opacity: 0.4;
          stroke-width: 1.5;
        }

        .card-info {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .card-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text, white);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          min-height: 2.8em;
          margin: 0;
        }

        .card-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
          flex-wrap: wrap;
        }

        .card-meta span {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .card-meta .rating {
          color: #ffc107;
          font-weight: 600;
        }

        .card-meta .separator {
          opacity: 0.5;
        }

        .card-genres {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
        }

        .genre-tag {
          padding: 0.25rem 0.625rem;
          background: rgba(88, 86, 214, 0.2);
          border: 1px solid rgba(88, 86, 214, 0.4);
          border-radius: 12px;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
          white-space: nowrap;
        }

        .card-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: auto;
          padding-top: 0.75rem;
        }

        .view-details-btn,
        .roadmap-btn {
          flex: 1;
          padding: 0.5rem 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .view-details-btn {
          background: linear-gradient(135deg, rgba(88, 86, 214, 0.3), rgba(88, 86, 214, 0.2));
          color: rgba(255, 255, 255, 0.9);
        }

        .view-details-btn:hover {
          background: linear-gradient(135deg, rgba(88, 86, 214, 0.5), rgba(88, 86, 214, 0.3));
          border-color: rgba(88, 86, 214, 0.6);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(88, 86, 214, 0.3);
        }

        .roadmap-btn {
          background: linear-gradient(135deg, rgba(221, 42, 123, 0.3), rgba(221, 42, 123, 0.2));
          color: rgba(255, 255, 255, 0.9);
        }

        .roadmap-btn:hover {
          background: linear-gradient(135deg, rgba(221, 42, 123, 0.5), rgba(221, 42, 123, 0.3));
          border-color: rgba(221, 42, 123, 0.6);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(221, 42, 123, 0.3);
        }

        @media (max-width: 768px) {
          .luxury-title {
            font-size: 2rem;
          }

          .luxury-subtitle {
            font-size: 0.875rem;
          }

          .main-heading {
            margin-bottom: 2rem;
            padding: 1rem;
          }

          .mode-grid {
            grid-template-columns: 1fr;
          }

          .mode-card {
            padding: 1rem;
          }

          .mode-icon {
            font-size: 2rem;
          }

          .banner-icon {
            font-size: 2rem;
          }

          .mode-info-banner {
            padding: 1.5rem;
          }

          .recommendations-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default RecommendationModes;
