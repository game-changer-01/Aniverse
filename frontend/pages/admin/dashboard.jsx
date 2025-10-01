import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [unverifiedUsers, setUnverifiedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('unverified');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [unverifiedResponse, usersResponse] = await Promise.all([
        axios.get('/api/admin/unverified'),
        axios.get('/api/admin/users?limit=20')
      ]);
      
      setUnverifiedUsers(unverifiedResponse.data);
      setUsers(usersResponse.data.users);
    } catch (err) {
      setError('Failed to load admin data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId, verified = true) => {
    try {
      await axios.post(`/api/admin/verify/${userId}`, { verified });
      // Refresh data
      fetchData();
    } catch (err) {
      console.error('Verification failed:', err);
      alert('Failed to update verification status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading admin dashboard...</div>
        <style jsx>{`
          .admin-dashboard { padding: 2rem; }
          .loading { text-align: center; padding: 4rem; color: #666; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>🎌 AniVerse Admin Dashboard</h1>
        <p>Manage user verifications and monitor platform activity</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Pending Verifications</h3>
          <div className="stat-number">{unverifiedUsers.length}</div>
        </div>
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="stat-number">{users.length}</div>
        </div>
        <div className="stat-card">
          <h3>Verified Users</h3>
          <div className="stat-number">{users.filter(u => u.verified).length}</div>
        </div>
      </div>

      <div className="tab-navigation">
        <button 
          className={`tab ${activeTab === 'unverified' ? 'active' : ''}`}
          onClick={() => setActiveTab('unverified')}
        >
          Pending Verifications ({unverifiedUsers.length})
        </button>
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Users ({users.length})
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {activeTab === 'unverified' && (
        <div className="users-section">
          <h2>🔐 Users Pending Verification</h2>
          {unverifiedUsers.length === 0 ? (
            <div className="empty-state">
              <p>🎉 No pending verifications! All users are verified.</p>
            </div>
          ) : (
            <div className="users-grid">
              {unverifiedUsers.map(user => (
                <div key={user._id} className="user-card pending">
                  <div className="user-avatar">
                    {user.picture || user.avatar ? (
                      <img src={user.picture || user.avatar} alt={user.username} />
                    ) : (
                      <div className="avatar-placeholder">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="user-info">
                    <h3>{user.username}</h3>
                    <p className="email">{user.email}</p>
                    <p className="join-date">Joined: {formatDate(user.createdAt)}</p>
                  </div>
                  <div className="user-actions">
                    <button 
                      className="verify-btn"
                      onClick={() => handleVerifyUser(user._id, true)}
                    >
                      ✓ Verify
                    </button>
                    <button 
                      className="reject-btn"
                      onClick={() => handleVerifyUser(user._id, false)}
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'all' && (
        <div className="users-section">
          <h2>👥 All Users</h2>
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Last Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-cell">
                        {user.picture || user.avatar ? (
                          <img src={user.picture || user.avatar} alt={user.username} className="table-avatar" />
                        ) : (
                          <div className="table-avatar-placeholder">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span>{user.username}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <div className="status-badges">
                        <span className={`badge ${user.verified ? 'verified' : 'unverified'}`}>
                          {user.verified ? '✓ Verified' : '⏳ Pending'}
                        </span>
                        {user.premium && (
                          <span className="badge premium">⭐ Premium</span>
                        )}
                      </div>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>{formatDate(user.lastActive)}</td>
                    <td>
                      <button 
                        className={`toggle-btn ${user.verified ? 'unverify' : 'verify'}`}
                        onClick={() => handleVerifyUser(user._id, !user.verified)}
                      >
                        {user.verified ? 'Unverify' : 'Verify'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-dashboard {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          background: var(--color-bg);
          min-height: 100vh;
          color: var(--color-text);
        }
        .dashboard-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        .dashboard-header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(45deg, var(--color-accent), var(--color-accent-glow));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .dashboard-header p {
          color: var(--color-text-dim);
          font-size: 1.1rem;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        .stat-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
        }
        .stat-card h3 {
          margin: 0 0 1rem 0;
          color: var(--color-accent);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .stat-number {
          font-size: 2.5rem;
          font-weight: bold;
          color: var(--color-text);
        }
        .tab-navigation {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .tab {
          background: var(--color-glass);
          border: 1px solid var(--color-border);
          color: var(--color-text);
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .tab:hover {
          background: var(--color-accent-glow);
          border-color: var(--color-accent);
        }
        .tab.active {
          background: linear-gradient(135deg, var(--color-accent), var(--color-accent-glow));
          border-color: var(--color-accent);
          color: var(--color-glass);
        }
        .users-section h2 {
          margin-bottom: 1.5rem;
          color: var(--color-accent);
        }
        .empty-state {
          text-align: center;
          padding: 3rem;
          background: var(--color-surface);
          border-radius: 12px;
          color: var(--color-text-dim);
        }
        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .user-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .user-card.pending {
          border-color: var(--color-accent);
          background: var(--color-accent-glow);
        }
        .user-avatar {
          align-self: center;
        }
        .user-avatar img {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
        }
        .avatar-placeholder {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-accent), var(--color-accent-glow));
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-glass);
          font-weight: bold;
          font-size: 1.5rem;
        }
        .user-info {
          text-align: center;
        }
        .user-info h3 {
          margin: 0 0 0.5rem 0;
          color: var(--color-text);
        }
        .email {
          color: var(--color-text-dim);
          font-size: 0.9rem;
          margin: 0 0 0.5rem 0;
        }
        .join-date {
          color: var(--color-text-dim);
          font-size: 0.8rem;
          margin: 0;
        }
        .user-actions {
          display: flex;
          gap: 0.5rem;
        }
        .verify-btn, .reject-btn, .toggle-btn {
          flex: 1;
          padding: 0.6rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .verify-btn, .toggle-btn.verify {
          background: linear-gradient(135deg, var(--color-accent), var(--color-accent-glow));
          color: var(--color-glass);
        }
        .verify-btn:hover, .toggle-btn.verify:hover {
          background: linear-gradient(135deg, var(--color-accent-alt), var(--color-accent));
        }
        .reject-btn, .toggle-btn.unverify {
          background: linear-gradient(135deg, var(--color-accent), var(--color-accent-alt));
          color: var(--color-glass);
        }
        .reject-btn:hover, .toggle-btn.unverify:hover {
          background: linear-gradient(135deg, var(--color-accent-alt), var(--color-accent-glow));
        }
        .users-table {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          overflow: hidden;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid var(--color-border);
        }
        th {
          background: var(--color-glass);
          color: var(--color-accent);
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 1px;
        }
        .user-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .table-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }
        .table-avatar-placeholder {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-accent), var(--color-accent-glow));
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-glass);
          font-weight: bold;
          font-size: 0.9rem;
        }
        .status-badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .badge {
          padding: 0.3rem 0.6rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 500;
        }
        .badge.verified {
          background: var(--color-accent-glow);
          color: var(--color-accent);
        }
        .badge.unverified {
          background: var(--color-surface);
          color: var(--color-text-dim);
          border: 1px solid var(--color-border);
        }
        .badge.premium {
          background: linear-gradient(135deg, var(--color-accent), var(--color-accent-glow));
          color: var(--color-glass);
        }
        .error-message {
          background: var(--color-surface);
          border: 1px solid var(--color-accent);
          color: var(--color-accent);
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }
        .loading {
          text-align: center;
          padding: 4rem;
          color: var(--color-text-dim);
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;

// Use a custom layout for admin pages
AdminDashboard.getLayout = (page) => page;