import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../src/components/Layout';
import { useAuth } from '../../src/contexts/AuthContext';

const AdminDashboard = () => {
  const router = useRouter();
  const { user, token } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [animeList, setAnimeList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackFilter, setFeedbackFilter] = useState('');

  useEffect(() => {
    if (!user || !user.isAdmin) {
      router.push('/');
      return;
    }
    fetchDashboardData();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'anime') fetchAnimeList();
    if (activeTab === 'users') fetchUsersList();
    if (activeTab === 'feedback') fetchFeedbackList();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin-dashboard/overview', {
        headers: { 'Authorization': `Bearer ${token}` }
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

  const fetchAnimeList = async () => {
    try {
      const response = await fetch('/api/admin-dashboard/anime', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnimeList(data.anime);
      }
    } catch (error) {
      console.error('Error fetching anime list:', error);
    }
  };

  const fetchUsersList = async () => {
    try {
      const response = await fetch('/api/admin-dashboard/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsersList(data.users);
      }
    } catch (error) {
      console.error('Error fetching users list:', error);
    }
  };

  const fetchFeedbackList = async () => {
    try {
      const url = `/api/admin-dashboard/feedback${feedbackFilter ? `?status=${feedbackFilter}` : ''}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFeedbackList(data.feedback);
      }
    } catch (error) {
      console.error('Error fetching feedback list:', error);
    }
  };

  const updateFeedbackStatus = async (feedbackId, status, adminResponse = '') => {
    try {
      const response = await fetch(`/api/admin-dashboard/feedback/${feedbackId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, adminResponse })
      });
      
      if (response.ok) {
        fetchFeedbackList();
      }
    } catch (error) {
      console.error('Error updating feedback:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading admin dashboard...</p>
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

  const { stats, recentFeedback, animeStats, userActivity } = dashboardData;

  return (
    <Layout>
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Manage your anime platform</p>
        </div>

        <div className="dashboard-tabs">
          <button 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={activeTab === 'anime' ? 'active' : ''}
            onClick={() => setActiveTab('anime')}
          >
            Anime Management
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={activeTab === 'feedback' ? 'active' : ''}
            onClick={() => setActiveTab('feedback')}
          >
            Feedback & Issues
            {stats.criticalIssues > 0 && <span className="alert-badge">{stats.criticalIssues}</span>}
          </button>
        </div>

        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>{stats.totalUsers}</h3>
                  <p>Total Users</p>
                  <small>{stats.newUsers} new this week</small>
                </div>
                <div className="stat-card">
                  <h3>{stats.activeUsers}</h3>
                  <p>Active Users (24h)</p>
                </div>
                <div className="stat-card">
                  <h3>{stats.totalAnime}</h3>
                  <p>Total Anime</p>
                </div>
                <div className="stat-card">
                  <h3>{stats.totalReviews}</h3>
                  <p>Total Reviews</p>
                </div>
                <div className="stat-card priority">
                  <h3>{stats.openFeedback}</h3>
                  <p>Open Feedback</p>
                  {stats.criticalIssues > 0 && <small className="critical">{stats.criticalIssues} critical</small>}
                </div>
              </div>

              <div className="recent-activity">
                <h2>Recent Feedback</h2>
                <div className="feedback-list">
                  {recentFeedback.slice(0, 5).map((feedback, index) => (
                    <div key={index} className={`feedback-item ${feedback.priority}`}>
                      <div className="feedback-header">
                        <h4>{feedback.title}</h4>
                        <span className={`status ${feedback.status}`}>{feedback.status}</span>
                      </div>
                      <p>{feedback.description.substring(0, 100)}...</p>
                      <div className="feedback-meta">
                        <span>By: {feedback.user.username}</span>
                        <span>Type: {feedback.type}</span>
                        <span>Priority: {feedback.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'anime' && (
            <div className="anime-tab">
              <h2>Anime Management</h2>
              <div className="anime-list">
                {animeList.map((anime, index) => (
                  <div key={index} className="anime-item">
                    <img src={anime.image} alt={anime.title} />
                    <div className="anime-details">
                      <h3>{anime.title}</h3>
                      <p>Status: {anime.status}</p>
                      <p>Episodes: {anime.episodes || 'Unknown'}</p>
                      <p>Rating: {anime.rating || 'N/A'}</p>
                      <p>Added: {new Date(anime.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-tab">
              <h2>User Management</h2>
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Last Active</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((user, index) => (
                      <tr key={index}>
                        <td>
                          {user.username}
                          {user.verified && <span className="badge verified">✓</span>}
                          {user.premium && <span className="badge premium">★</span>}
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`status ${user.isActive ? 'active' : 'inactive'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{new Date(user.lastActive).toLocaleDateString()}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="feedback-tab">
              <div className="feedback-header">
                <h2>Feedback & Issues</h2>
                <div className="feedback-filters">
                  <select value={feedbackFilter} onChange={(e) => setFeedbackFilter(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <button onClick={fetchFeedbackList}>Refresh</button>
                </div>
              </div>
              
              <div className="feedback-list">
                {feedbackList.map((feedback, index) => (
                  <div key={index} className={`feedback-item detailed ${feedback.priority}`}>
                    <div className="feedback-header">
                      <h4>{feedback.title}</h4>
                      <div className="feedback-badges">
                        <span className={`status ${feedback.status}`}>{feedback.status}</span>
                        <span className={`priority ${feedback.priority}`}>{feedback.priority}</span>
                        <span className={`type ${feedback.type}`}>{feedback.type}</span>
                      </div>
                    </div>
                    
                    <p className="feedback-description">{feedback.description}</p>
                    
                    <div className="feedback-meta">
                      <span>By: {feedback.user.username} ({feedback.user.email})</span>
                      <span>Created: {new Date(feedback.createdAt).toLocaleDateString()}</span>
                      {feedback.page && <span>Page: {feedback.page}</span>}
                    </div>

                    {feedback.adminResponse && (
                      <div className="admin-response">
                        <strong>Admin Response:</strong>
                        <p>{feedback.adminResponse.message}</p>
                        <small>
                          Responded by {feedback.adminResponse.respondedBy?.username} on {' '}
                          {new Date(feedback.adminResponse.respondedAt).toLocaleDateString()}
                        </small>
                      </div>
                    )}

                    <div className="feedback-actions">
                      <select 
                        value={feedback.status} 
                        onChange={(e) => updateFeedbackStatus(feedback._id, e.target.value)}
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                      
                      <button onClick={() => {
                        const response = prompt('Admin response:');
                        if (response) {
                          updateFeedbackStatus(feedback._id, feedback.status, response);
                        }
                      }}>
                        Add Response
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .admin-dashboard {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          min-height: 100vh;
          background: var(--color-bg);
          color: var(--color-text);
        }

        .dashboard-header {
          margin-bottom: 2rem;
        }

        .dashboard-header h1 {
          font-size: 2.5rem;
          margin: 0 0 0.5rem 0;
          background: linear-gradient(45deg, var(--color-accent), var(--color-accent-glow));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dashboard-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--color-border);
          position: relative;
        }

        .dashboard-tabs button {
          padding: 1rem 1.5rem;
          background: none;
          border: none;
          color: var(--color-text-dim);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.3s ease;
          position: relative;
        }

        .dashboard-tabs button.active {
          color: var(--color-accent);
          border-bottom-color: var(--color-accent);
        }

        .alert-badge {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: #ff4444;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: var(--color-surface);
          padding: 2rem;
          border-radius: 16px;
          text-align: center;
          border: 1px solid var(--color-border);
          transition: transform 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
        }

        .stat-card.priority {
          border-color: var(--color-accent);
        }

        .stat-card h3 {
          font-size: 2.5rem;
          margin: 0 0 0.5rem 0;
          color: var(--color-accent);
        }

        .stat-card p {
          margin: 0 0 0.5rem 0;
          color: var(--color-text);
          font-weight: 600;
        }

        .stat-card small {
          color: var(--color-text-dim);
          font-size: 0.875rem;
        }

        .stat-card small.critical {
          color: #ff4444;
          font-weight: 600;
        }

        .feedback-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .feedback-item {
          background: var(--color-surface);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid var(--color-border);
          border-left: 4px solid var(--color-border);
        }

        .feedback-item.critical {
          border-left-color: #ff4444;
        }

        .feedback-item.high {
          border-left-color: #ff8800;
        }

        .feedback-item.medium {
          border-left-color: #ffcc00;
        }

        .feedback-item.low {
          border-left-color: #00aa00;
        }

        .feedback-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .feedback-header h4 {
          margin: 0;
          font-size: 1.1rem;
        }

        .feedback-badges {
          display: flex;
          gap: 0.5rem;
        }

        .status, .priority, .type {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .status.open { background: #ff4444; color: white; }
        .status.in-progress { background: #ffaa00; color: white; }
        .status.resolved { background: #00aa00; color: white; }
        .status.closed { background: #888; color: white; }

        .priority.critical { background: #ff0000; color: white; }
        .priority.high { background: #ff8800; color: white; }
        .priority.medium { background: #ffcc00; color: black; }
        .priority.low { background: #00aa00; color: white; }

        .feedback-description {
          margin: 1rem 0;
          line-height: 1.5;
        }

        .feedback-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          color: var(--color-text-dim);
          font-size: 0.875rem;
          margin: 1rem 0;
        }

        .admin-response {
          background: var(--color-bg-alt);
          padding: 1rem;
          border-radius: 8px;
          margin: 1rem 0;
        }

        .feedback-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .feedback-actions select,
        .feedback-actions button {
          padding: 0.5rem 1rem;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          background: var(--color-surface);
          color: var(--color-text);
          cursor: pointer;
        }

        .feedback-header-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .feedback-filters {
          display: flex;
          gap: 1rem;
        }

        .anime-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }

        .anime-item {
          display: flex;
          gap: 1rem;
          background: var(--color-surface);
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid var(--color-border);
        }

        .anime-item img {
          width: 80px;
          height: 120px;
          object-fit: cover;
          border-radius: 8px;
        }

        .users-table {
          background: var(--color-surface);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--color-border);
        }

        .users-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table th,
        .users-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid var(--color-border);
        }

        .users-table th {
          background: var(--color-bg-alt);
          font-weight: 600;
        }

        .badge {
          display: inline-block;
          margin-left: 0.5rem;
          padding: 0.25rem 0.5rem;
          border-radius: 8px;
          font-size: 0.75rem;
        }

        .badge.verified {
          background: var(--color-accent-glow);
          color: white;
        }

        .badge.premium {
          background: var(--color-accent);
          color: white;
        }

        .status.active {
          color: #00aa00;
        }

        .status.inactive {
          color: #888;
        }

        @media (max-width: 768px) {
          .admin-dashboard {
            padding: 1rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .dashboard-tabs {
            flex-wrap: wrap;
          }

          .feedback-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .feedback-actions {
            flex-direction: column;
          }

          .users-table {
            overflow-x: auto;
          }
        }
      `}</style>
    </Layout>
  );
};

export default AdminDashboard;