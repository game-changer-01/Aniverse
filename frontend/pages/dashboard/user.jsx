import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../src/components/Layout';
import { useAuth } from '../../src/contexts/AuthContext';

const UserDashboard = () => {
  const router = useRouter();
  const { user, token } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/api/dashboard/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </Layout>
    );
  }

  if (!dashboardData) {
    return (
      <Layout>
        <div className="dashboard-error">
          <p>Failed to load dashboard data</p>
        </div>
      </Layout>
    );
  }

  const { user: userData, visitedAnime, watchHistory, watchlist, stats, recentReviews } = dashboardData;

  return (
    <Layout>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="user-info">
            <div className="avatar">
              {userData.avatar ? (
                <img src={userData.avatar} alt={userData.username} />
              ) : (
                <div className="avatar-placeholder">{userData.username.charAt(0).toUpperCase()}</div>
              )}
            </div>
            <div className="user-details">
              <h1>{userData.username}</h1>
              <p className="email">{userData.email}</p>
              <div className="badges">
                {userData.verified && <span className="badge verified">Verified</span>}
                {userData.premium && <span className="badge premium">Premium</span>}
              </div>
              <p className="join-date">Member since {new Date(userData.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{stats.totalInteractions}</h3>
              <p>Total Interactions</p>
            </div>
            <div className="stat-card">
              <h3>{stats.totalWatched}</h3>
              <p>Completed</p>
            </div>
            <div className="stat-card">
              <h3>{stats.totalWatchlist}</h3>
              <p>Watchlist</p>
            </div>
            <div className="stat-card">
              <h3>{stats.avgRating ? stats.avgRating.toFixed(1) : 'N/A'}</h3>
              <p>Avg Rating</p>
            </div>
          </div>
        </div>

        <div className="dashboard-tabs">
          <button 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={activeTab === 'history' ? 'active' : ''}
            onClick={() => setActiveTab('history')}
          >
            Watch History
          </button>
          <button 
            className={activeTab === 'watchlist' ? 'active' : ''}
            onClick={() => setActiveTab('watchlist')}
          >
            Watchlist
          </button>
          <button 
            className={activeTab === 'reviews' ? 'active' : ''}
            onClick={() => setActiveTab('reviews')}
          >
            My Reviews
          </button>
        </div>

        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <section className="recently-visited">
                <h2>Recently Visited Anime</h2>
                <div className="anime-grid">
                  {visitedAnime.map((interaction, index) => (
                    <div key={index} className="anime-card" onClick={() => router.push(`/anime/${interaction.anime._id}`)}>
                      <img src={interaction.anime.image} alt={interaction.anime.title} />
                      <div className="anime-info">
                        <h3>{interaction.anime.title}</h3>
                        <p>{new Date(interaction.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="history-tab">
              <h2>Watch History</h2>
              <div className="history-list">
                {watchHistory.map((item, index) => (
                  <div key={index} className="history-item">
                    <img src={item.anime.image} alt={item.anime.title} />
                    <div className="history-info">
                      <h3>{item.anime.title}</h3>
                      <p>Episode {item.episode} • {item.completed ? 'Completed' : `${item.progress}% watched`}</p>
                      <p className="watch-date">Watched on {new Date(item.watchedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'watchlist' && (
            <div className="watchlist-tab">
              <h2>My Watchlist</h2>
              <div className="watchlist-grid">
                {watchlist.map((item, index) => (
                  <div key={index} className="watchlist-item">
                    <img src={item.anime.image} alt={item.anime.title} />
                    <div className="watchlist-info">
                      <h3>{item.anime.title}</h3>
                      <p>Priority: {item.priority}/5</p>
                      <p>Added {new Date(item.addedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-tab">
              <h2>My Reviews</h2>
              <div className="reviews-list">
                {recentReviews.map((review, index) => (
                  <div key={index} className="review-item">
                    <img src={review.anime.image} alt={review.anime.title} />
                    <div className="review-content">
                      <h3>{review.anime.title}</h3>
                      <div className="rating">Rating: {review.rating}/10</div>
                      {review.title && <h4>{review.title}</h4>}
                      <p>{review.content.substring(0, 200)}...</p>
                      <p className="review-date">Posted {new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          min-height: 100vh;
          background: var(--color-bg);
          color: var(--color-text);
        }

        .dashboard-header {
          background: var(--color-surface);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          border: 1px solid var(--color-border);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid var(--color-accent);
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: var(--color-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: bold;
          color: white;
        }

        .user-details h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
          background: linear-gradient(45deg, var(--color-accent), var(--color-accent-glow));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .email {
          color: var(--color-text-dim);
          margin: 0 0 1rem 0;
        }

        .badges {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .badge.verified {
          background: var(--color-accent-glow);
          color: var(--color-text);
        }

        .badge.premium {
          background: var(--color-accent);
          color: white;
        }

        .join-date {
          color: var(--color-text-dim);
          font-size: 0.875rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .stat-card {
          background: var(--color-bg-alt);
          padding: 1.5rem;
          border-radius: 12px;
          text-align: center;
          border: 1px solid var(--color-border);
        }

        .stat-card h3 {
          font-size: 2rem;
          margin: 0 0 0.5rem 0;
          color: var(--color-accent);
        }

        .stat-card p {
          margin: 0;
          color: var(--color-text-dim);
          font-size: 0.875rem;
        }

        .dashboard-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--color-border);
        }

        .dashboard-tabs button {
          padding: 1rem 1.5rem;
          background: none;
          border: none;
          color: var(--color-text-dim);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .dashboard-tabs button.active {
          color: var(--color-accent);
          border-bottom-color: var(--color-accent);
        }

        .dashboard-tabs button:hover {
          color: var(--color-text);
        }

        .anime-grid, .watchlist-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }

        .anime-card, .watchlist-item {
          background: var(--color-surface);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--color-border);
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .anime-card:hover, .watchlist-item:hover {
          transform: translateY(-4px);
        }

        .anime-card img, .watchlist-item img {
          width: 100%;
          height: 250px;
          object-fit: cover;
        }

        .anime-info, .watchlist-info {
          padding: 1rem;
        }

        .anime-info h3, .watchlist-info h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
        }

        .anime-info p, .watchlist-info p {
          margin: 0;
          color: var(--color-text-dim);
          font-size: 0.875rem;
        }

        .history-list, .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .history-item, .review-item {
          display: flex;
          gap: 1rem;
          background: var(--color-surface);
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid var(--color-border);
        }

        .history-item img, .review-item img {
          width: 80px;
          height: 120px;
          object-fit: cover;
          border-radius: 8px;
        }

        .history-info, .review-content {
          flex: 1;
        }

        .history-info h3, .review-content h3 {
          margin: 0 0 0.5rem 0;
        }

        .watch-date, .review-date {
          color: var(--color-text-dim);
          font-size: 0.875rem;
        }

        .rating {
          font-weight: 600;
          color: var(--color-accent);
          margin-bottom: 0.5rem;
        }

        .dashboard-loading, .dashboard-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          gap: 1rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--color-border);
          border-top: 4px solid var(--color-accent);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1rem;
          }

          .user-info {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .dashboard-tabs {
            flex-wrap: wrap;
          }

          .history-item, .review-item {
            flex-direction: column;
          }
        }
      `}</style>
    </Layout>
  );
};

export default UserDashboard;