import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../src/contexts/AuthContext';

const UserDashboard = () => {
  // Conditional router - only use on client-side
  const router = typeof window !== 'undefined' ? useRouter() : null;
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
        console.log('Dashboard data received:', data);
        setDashboardData(data);
      } else {
        console.error('Failed to fetch dashboard:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error details:', errorData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
        <style jsx>{`
          .dashboard-loading {
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
        `}</style>
      </>
    );
  }

  if (!dashboardData) {
    return (
      <>
        <div className="dashboard-error">
          <p>Failed to load dashboard data</p>
          <p className="error-hint">Please try refreshing the page or logging in again.</p>
          <button className="retry-btn" onClick={() => { setLoading(true); fetchDashboardData(); }}>
            Retry
          </button>
        </div>
        <style jsx>{`
          .dashboard-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 50vh;
            gap: 1rem;
            padding: 2rem;
            text-align: center;
          }
          .dashboard-error p {
            font-size: 1.1rem;
            color: var(--color-text);
          }
          .error-hint {
            font-size: 0.9rem;
            color: var(--color-text-dim);
          }
          .retry-btn {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, var(--color-accent), var(--color-accent-glow));
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .retry-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }
        `}</style>
      </>
    );
  }

  const { user: userData, visitedAnime = [], watchHistory = [], watchlist = [], stats = {}, recentReviews = [] } = dashboardData;

  // If no user data, show error
  if (!userData) {
    return (
      <>
        <div className="dashboard-error">
          <p>Unable to load user information</p>
          <p className="error-hint">Please check your connection and try again.</p>
          <button className="retry-btn" onClick={() => { setLoading(true); fetchDashboardData(); }}>
            Retry
          </button>
        </div>
        <style jsx>{`
          .dashboard-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 50vh;
            gap: 1rem;
            padding: 2rem;
            text-align: center;
          }
          .dashboard-error p {
            font-size: 1.1rem;
            color: var(--color-text);
          }
          .error-hint {
            font-size: 0.9rem;
            color: var(--color-text-dim);
          }
          .retry-btn {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, var(--color-accent), var(--color-accent-glow));
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .retry-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }
        `}</style>
      </>
    );
  }

  return (
    <>
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
                {userData.verified && <span className="badge verified">✓ Verified</span>}
                {userData.premium && <span className="badge premium">⭐ Premium</span>}
              </div>
              <p className="join-date">Member since {new Date(userData.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{stats.totalInteractions || 0}</h3>
              <p>Total Interactions</p>
            </div>
            <div className="stat-card">
              <h3>{stats.totalWatched || 0}</h3>
              <p>Completed</p>
            </div>
            <div className="stat-card">
              <h3>{stats.totalWatchlist || 0}</h3>
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
                {visitedAnime.length > 0 ? (
                  <div className="anime-grid">
                    {visitedAnime.slice(0, 6).map((interaction, index) => (
                      <div key={index} className="anime-card" onClick={() => router.push(`/anime/${interaction.anime._id}`)}>
                        <img src={interaction.anime.image} alt={interaction.anime.title} />
                        <div className="anime-info">
                          <h3>{interaction.anime.title}</h3>
                          <p>{new Date(interaction.timestamp).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-message">No anime visited yet. Start exploring!</p>
                )}
              </section>

              <section className="quick-access">
                <div className="quick-access-grid">
                  <div className="quick-access-card">
                    <h3>
                      <span className="card-icon">📋</span>
                      My Watchlist Preview
                    </h3>
                    <p className="card-subtitle">{watchlist.length} anime in your watchlist</p>
                    {watchlist.length > 0 ? (
                      <div className="mini-list">
                        {watchlist.slice(0, 3).map((item, index) => (
                          <div key={index} className="mini-item" onClick={() => router.push(`/anime/${item.anime._id}`)}>
                            <img src={item.anime.image} alt={item.anime.title} />
                            <div className="mini-info">
                              <h4>{item.anime.title}</h4>
                              <span className="priority">Priority: {item.priority}/5</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="empty-state">No items in watchlist yet</p>
                    )}
                    <button className="view-all-btn" onClick={() => setActiveTab('watchlist')}>
                      View All Watchlist →
                    </button>
                  </div>

                  <div className="quick-access-card">
                    <h3>
                      <span className="card-icon">🗺️</span>
                      Recently Viewed Roadmaps
                    </h3>
                    <p className="card-subtitle">Your anime journey tracking</p>
                    {visitedAnime.length > 0 ? (
                      <div className="mini-list">
                        {visitedAnime.slice(0, 3).map((interaction, index) => (
                          <div key={index} className="mini-item" onClick={() => router.push(`/anime/${interaction.anime._id}`)}>
                            <img src={interaction.anime.image} alt={interaction.anime.title} />
                            <div className="mini-info">
                              <h4>{interaction.anime.title}</h4>
                              <span className="timestamp">{new Date(interaction.timestamp).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="empty-state">No roadmaps viewed yet</p>
                    )}
                    <button className="view-all-btn" onClick={() => router.push('/recommendations')}>
                      Explore Roadmaps →
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="history-tab">
              <h2>Watch History</h2>
              {watchHistory.length > 0 ? (
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
              ) : (
                <p className="empty-message">No watch history yet</p>
              )}
            </div>
          )}

          {activeTab === 'watchlist' && (
            <div className="watchlist-tab">
              <h2>My Watchlist</h2>
              {watchlist.length > 0 ? (
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
              ) : (
                <p className="empty-message">Your watchlist is empty</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-tab">
              <h2>My Reviews</h2>
              {recentReviews.length > 0 ? (
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
              ) : (
                <p className="empty-message">No reviews yet</p>
              )}
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
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--color-border);
        }

        .avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid var(--color-accent);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, var(--color-accent), var(--color-accent-glow));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: bold;
          color: white;
        }

        .user-details h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2.2rem;
          background: linear-gradient(45deg, var(--color-accent), var(--color-accent-glow));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .email {
          color: var(--color-text-dim);
          margin: 0 0 1rem 0;
          font-size: 1rem;
        }

        .badges {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .badge {
          padding: 0.4rem 1rem;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
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
          font-size: 0.9rem;
          font-style: italic;
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

        .quick-access {
          margin-top: 2rem;
        }

        .quick-access-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1.5rem;
        }

        .quick-access-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .quick-access-card h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.3rem;
          color: var(--color-text);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .card-icon {
          font-size: 1.5rem;
        }

        .card-subtitle {
          color: var(--color-text-dim);
          margin: 0 0 1rem 0;
          font-size: 0.9rem;
        }

        .mini-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .mini-item {
          display: flex;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--color-bg-alt);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid transparent;
        }

        .mini-item:hover {
          background: var(--color-bg);
          border-color: var(--color-accent);
          transform: translateX(4px);
        }

        .mini-item img {
          width: 60px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
        }

        .mini-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .mini-info h4 {
          margin: 0 0 0.3rem 0;
          font-size: 0.95rem;
          color: var(--color-text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .mini-info .priority,
        .mini-info .timestamp {
          font-size: 0.8rem;
          color: var(--color-text-dim);
        }

        .mini-info .priority {
          color: var(--color-accent);
          font-weight: 600;
        }

        .empty-state {
          color: var(--color-text-dim);
          font-style: italic;
          text-align: center;
          padding: 2rem 1rem;
        }

        .empty-message {
          color: var(--color-text-dim);
          font-style: italic;
          text-align: center;
          padding: 3rem 1rem;
          font-size: 1.1rem;
        }

        .view-all-btn {
          width: 100%;
          padding: 0.75rem;
          background: linear-gradient(135deg, var(--color-accent), var(--color-accent-glow));
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .view-all-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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

          .quick-access-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default UserDashboard;
