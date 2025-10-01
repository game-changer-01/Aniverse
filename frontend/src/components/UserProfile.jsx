import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/router';

const UserProfile = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    router.push('/');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getProfilePicture = () => {
    // If user has Google profile picture, use it
    if (user?.picture) return user.picture;
    if (user?.avatar) return user.avatar;
    return null;
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-buttons">
        <Link href="/auth/login" className="login-btn">
          Sign In
        </Link>
        <Link href="/auth/signup" className="signup-btn">
          Sign Up
        </Link>
        <style jsx>{`
          .auth-buttons {
            display: flex;
            gap: 0.5rem;
            align-items: center;
          }
          .login-btn, .signup-btn {
            padding: 0.5rem 1rem;
            border-radius: 999px;
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.2s ease;
            text-decoration: none;
          }
          .login-btn {
            background: rgba(255,255,255,0.06);
            border: 1px solid #2e3d55;
            color: #fff;
          }
          .login-btn:hover {
            background: rgba(255,255,255,0.1);
            border-color: #3a4e6d;
            transform: translateY(-1px);
          }
          .signup-btn {
            background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
            border: 1px solid transparent;
            color: #fff;
          }
          .signup-btn:hover {
            background: linear-gradient(135deg, #ff5252, #26d0ce);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(78,205,196,0.3);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="user-profile" ref={dropdownRef}>
      <button 
        className="profile-button"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-expanded={showDropdown}
        aria-haspopup="true"
      >
        {getProfilePicture() ? (
          <img 
            src={getProfilePicture()} 
            alt={`${user.username}'s profile`}
            className="profile-picture"
          />
        ) : (
          <div className="profile-avatar">
            {getInitials(user.username || user.email)}
          </div>
        )}
        <span className="profile-name">{user.username || user.email?.split('@')[0]}</span>
        <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 8.5L2.5 5h7L6 8.5z"/>
        </svg>
      </button>

      {showDropdown && (
        <div className="profile-dropdown">
          <div className="dropdown-header">
            <div className="user-info">
              <strong>{user.username}</strong>
              <span className="email">{user.email}</span>
            </div>
            <div className="badges">
              {user.verified && (
                <span className="badge verified" title="Verified">
                  ✓ Verified
                </span>
              )}
              {!user.verified && (
                <span className="badge unverified" title="Pending Verification">
                  ⏳ Pending
                </span>
              )}
              {user.premium && (
                <span className="badge premium" title="Premium">
                  ⭐ Premium
                </span>
              )}
            </div>
          </div>
          <div className="dropdown-divider"></div>
          <div className="dropdown-menu">
            <Link href="/profile" className="dropdown-item">
              <span>Profile Settings</span>
            </Link>
            <Link href="/recommendations" className="dropdown-item">
              <span>My Recommendations</span>
            </Link>
            {!user.verified && (
              <button className="dropdown-item">
                <span>Verify Identity</span>
              </button>
            )}
            {!user.premium && (
              <button className="dropdown-item premium-action">
                <span>Upgrade to Premium</span>
              </button>
            )}
            <div className="dropdown-divider"></div>
            <button className="dropdown-item logout" onClick={handleLogout}>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .user-profile {
          position: relative;
        }
        .profile-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.06);
          border: 1px solid #2e3d55;
          color: #fff;
          padding: 0.4rem 0.8rem;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }
        .profile-button:hover {
          background: rgba(255,255,255,0.1);
          border-color: #3a4e6d;
          transform: translateY(-1px);
        }
        .profile-picture {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          object-fit: cover;
        }
        .profile-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 600;
          color: #fff;
        }
        .profile-name {
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .dropdown-arrow {
          transition: transform 0.2s ease;
          transform: ${showDropdown ? 'rotate(180deg)' : 'rotate(0deg)'};
        }
        .profile-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: rgba(36,47,70,0.95);
          backdrop-filter: blur(10px);
          border: 1px solid #2e3d55;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
          min-width: 240px;
          z-index: 1000;
          overflow: hidden;
        }
        .dropdown-header {
          padding: 1rem;
          background: rgba(255,255,255,0.02);
        }
        .user-info strong {
          display: block;
          font-size: 0.95rem;
          margin-bottom: 0.2rem;
        }
        .user-info .email {
          font-size: 0.8rem;
          opacity: 0.7;
        }
        .badges {
          margin-top: 0.5rem;
          display: flex;
          gap: 0.5rem;
        }
        .badge {
          background: rgba(255,255,255,0.1);
          padding: 0.2rem 0.5rem;
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
        .dropdown-divider {
          height: 1px;
          background: #2e3d55;
          margin: 0;
        }
        .dropdown-menu {
          padding: 0.5rem 0;
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 0.6rem 1rem;
          background: none;
          border: none;
          color: #fff;
          text-decoration: none;
          font-size: 0.9rem;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .dropdown-item:hover {
          background: rgba(255,255,255,0.05);
        }
        .dropdown-item.premium-action {
          color: #ffc107;
        }
        .dropdown-item.logout {
          color: #ff6b6b;
        }
        .dropdown-item.logout:hover {
          background: rgba(255,107,107,0.1);
        }

        @media (max-width: 768px) {
          .profile-name {
            display: none;
          }
          .profile-dropdown {
            min-width: 200px;
          }
        }
      `}</style>
    </div>
  );
};

export default UserProfile;