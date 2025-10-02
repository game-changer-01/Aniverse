import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

const UserProfile = ({ collapsed }) => {
  const { user, isAuthenticated, logout } = useAuth();
  // Conditional router - only use on client-side
  const router = typeof window !== 'undefined' ? useRouter() : null;
  const [showMenu, setShowMenu] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const menuRef = useRef(null);

  // Track mount state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowMenu(false);
    if (isMounted && router) {
      router.push('/');
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="auth-buttons">
        <button 
          onClick={() => isMounted && router && router.push('/auth/login')}
          className="login-btn"
        >
          Login
        </button>
        <button 
          onClick={() => isMounted && router && router.push('/auth/signup')}
          className="signup-btn"
        >
          Sign Up
        </button>
        <style jsx>{`
          .auth-buttons {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .login-btn, .signup-btn {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.875rem;
            transition: all 0.3s ease;
          }
          .login-btn {
            background: transparent;
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
          }
          .login-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.5);
          }
          .signup-btn {
            background: linear-gradient(135deg, #5856d6, #dd2a7b);
            color: white;
          }
          .signup-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(88, 86, 214, 0.4);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="user-profile" ref={menuRef}>
      <div 
        className="profile-trigger"
        onClick={() => setShowMenu(!showMenu)}
      >
        <div className="user-avatar">
          {user.username?.[0]?.toUpperCase() || 'U'}
        </div>
        {!collapsed && (
          <span className="user-name">{user.username}</span>
        )}
        <svg 
          className="dropdown-icon" 
          width="12" 
          height="12" 
          viewBox="0 0 12 12" 
          fill="none"
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>

      {showMenu && (
        <div className="profile-menu">
          <div className="menu-header">
            <div className="menu-avatar">
              {user.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="menu-user-info">
              <div className="menu-username">{user.username}</div>
              <div className="menu-email">{user.email}</div>
            </div>
          </div>
          <div className="menu-divider"></div>
          <button 
            className="menu-item"
            onClick={() => {
              setShowMenu(false);
              if (isMounted && router) {
                router.push('/dashboard/user');
              }
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 8a3 3 0 100-6 3 3 0 000 6zM2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            My Profile
          </button>
          <button 
            className="menu-item"
            onClick={() => {
              setShowMenu(false);
              if (isMounted && router) {
                router.push('/dashboard/user');
              }
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 8a6 6 0 11-12 0 6 6 0 0112 0z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10.5 6L7 9.5 5.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Preferences
          </button>
          <div className="menu-divider"></div>
          <button 
            className="menu-item logout"
            onClick={handleLogout}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Logout
          </button>
        </div>
      )}

      <style jsx>{`
        .user-profile {
          position: relative;
        }
        .profile-trigger {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          cursor: pointer;
          border-radius: 8px;
          transition: background 0.2s ease;
        }
        .profile-trigger:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #5856d6, #dd2a7b);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.875rem;
          flex-shrink: 0;
        }
        .user-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text, white);
        }
        .dropdown-icon {
          color: rgba(255, 255, 255, 0.7);
          transition: transform 0.2s ease;
        }
        .profile-trigger:hover .dropdown-icon {
          color: white;
        }
        .profile-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 240px;
          background: rgba(18, 18, 18, 0.98);
          backdrop-filter: blur(20px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          padding: 0.5rem;
          z-index: 1000;
          animation: menuSlideIn 0.2s ease;
        }
        @keyframes menuSlideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .menu-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
        }
        .menu-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #5856d6, #dd2a7b);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1rem;
          flex-shrink: 0;
        }
        .menu-user-info {
          flex: 1;
          min-width: 0;
        }
        .menu-username {
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .menu-email {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .menu-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 0.5rem 0;
        }
        .menu-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }
        .menu-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        .menu-item svg {
          flex-shrink: 0;
          opacity: 0.8;
        }
        .menu-item:hover svg {
          opacity: 1;
        }
        .menu-item.logout {
          color: #ff4444;
        }
        .menu-item.logout:hover {
          background: rgba(255, 68, 68, 0.1);
        }
      `}</style>
    </div>
  );
};

export default UserProfile;
