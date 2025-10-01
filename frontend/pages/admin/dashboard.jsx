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
          background: #0b0b0f;
          min-height: 100vh;
          color: #fff;
        }
        .dashboard-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        .dashboard-header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .dashboard-header p {
          color: #666;
          font-size: 1.1rem;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        .stat-card {
          background: rgba(36,47,70,0.6);
          border: 1px solid #2e3d55;
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
        }
        .stat-card h3 {
          margin: 0 0 1rem 0;
          color: #4ecdc4;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .stat-number {
          font-size: 2.5rem;
          font-weight: bold;
          color: #fff;
        }
        .tab-navigation {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .tab {
          background: rgba(255,255,255,0.06);
          border: 1px solid #2e3d55;
          color: #fff;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .tab:hover {
          background: rgba(255,255,255,0.1);
        }
        .tab.active {
          background: linear-gradient(135deg, #4ecdc4, #45b7d1);
          border-color: #4ecdc4;
        }
        .users-section h2 {
          margin-bottom: 1.5rem;
          color: #4ecdc4;
        }
        .empty-state {
          text-align: center;
          padding: 3rem;
          background: rgba(36,47,70,0.3);
          border-radius: 12px;
          color: #666;
        }
        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .user-card {
          background: rgba(36,47,70,0.6);
          border: 1px solid #2e3d55;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .user-card.pending {
          border-color: #ff9800;
          background: rgba(255,152,0,0.05);
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
          background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1.5rem;
        }
        .user-info {
          text-align: center;
        }
        .user-info h3 {
          margin: 0 0 0.5rem 0;
          color: #fff;
        }
        .email {
          color: #666;
          font-size: 0.9rem;
          margin: 0 0 0.5rem 0;
        }
        .join-date {
          color: #888;
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
          background: linear-gradient(135deg, #4caf50, #2e7d32);
          color: white;
        }
        .verify-btn:hover, .toggle-btn.verify:hover {
          background: linear-gradient(135deg, #45a049, #1b5e20);
        }
        .reject-btn, .toggle-btn.unverify {
          background: linear-gradient(135deg, #f44336, #c62828);
          color: white;
        }
        .reject-btn:hover, .toggle-btn.unverify:hover {
          background: linear-gradient(135deg, #d32f2f, #b71c1c);
        }
        .users-table {
          background: rgba(36,47,70,0.6);
          border: 1px solid #2e3d55;
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
          border-bottom: 1px solid #2e3d55;
        }
        th {
          background: rgba(255,255,255,0.05);
          color: #4ecdc4;
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
          background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
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
          background: rgba(76, 175, 80, 0.2);
          color: #4caf50;
        }
        .badge.unverified {
          background: rgba(255, 152, 0, 0.2);
          color: #ff9800;
        }
        .badge.premium {
          background: linear-gradient(135deg, rgba(255,193,7,0.2), rgba(255,152,0,0.2));
          color: #ffc107;
        }
        .error-message {
          background: rgba(244, 67, 54, 0.1);
          border: 1px solid #f44336;
          color: #f44336;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;

// Use a custom layout for admin pages
AdminDashboard.getLayout = (page) => page;