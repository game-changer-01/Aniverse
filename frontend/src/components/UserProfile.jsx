import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/router';

const UserProfile = ({ collapsed = false }) => {
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

  const getRandomAnimeAvatar = () => {
    // Array of anime character avatar URLs (using reliable sources)
    const animeAvatars = [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=anime1&backgroundColor=b6e3f4&clothesColor=0a4c9b&eyeType=happy&hairColor=724133&mouthType=smile',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=anime2&backgroundColor=c0aede&clothesColor=94d82d&eyeType=wink&hairColor=f59e0b&mouthType=tongue',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=anime3&backgroundColor=ffd93d&clothesColor=e11d48&eyeType=surprised&hairColor=06b6d4&mouthType=smile',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=anime4&backgroundColor=fed7aa&clothesColor=7c3aed&eyeType=default&hairColor=ec4899&mouthType=default',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=anime5&backgroundColor=bbf7d0&clothesColor=dc2626&eyeType=hearts&hairColor=1e40af&mouthType=twinkle',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=anime6&backgroundColor=fde68a&clothesColor=059669&eyeType=squint&hairColor=7c2d12&mouthType=serious',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=anime7&backgroundColor=ddd6fe&clothesColor=ea580c&eyeType=side&hairColor=0891b2&mouthType=vomit',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=anime8&backgroundColor=fed7d7&clothesColor=16a34a&eyeType=dizzy&hairColor=a21caf&mouthType=eating',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=anime9&backgroundColor=bfdbfe&clothesColor=b45309&eyeType=cry&hairColor=dc2626&mouthType=disbelief',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=anime10&backgroundColor=f3e8ff&clothesColor=0d9488&eyeType=close&hairColor=facc15&mouthType=grimace'
    ];

    // Use user ID or email as seed for consistent avatar per user
    const seed = user?.id || user?.email || 'default';
    const index = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % animeAvatars.length;
    return animeAvatars[index];
  };

  const getProfilePicture = () => {
    // If user has Google profile picture, use it
    if (user?.picture) return user.picture;
    if (user?.avatar) return user.avatar;
    // Return random anime avatar for logged-in users
    return getRandomAnimeAvatar();
  };

  if (!isAuthenticated) {
    const goLogin = () => router.push('/auth/login');
    const goSignup = () => router.push('/auth/signup');
    return (
      <div className={`auth-buttons glass-cluster ${collapsed ? 'collapsed' : ''}`} role="group" aria-label="Authentication">
        <button type="button" onClick={goLogin} className="auth-seg" aria-label="Sign in">
          <span className="auth-icon" aria-hidden>
            <span className="material-icons" style={{fontSize: '18px'}}>person</span>
          </span>
          <span className="auth-label">Sign In</span>
        </button>
        <button type="button" onClick={goSignup} className="auth-seg primary" aria-label="Sign up">
          <span className="auth-icon" aria-hidden>
            <span className="material-icons" style={{fontSize: '18px'}}>person_add</span>
          </span>
          <span className="auth-label">Sign Up</span>
        </button>
          <style jsx>{`
            .auth-buttons { display:flex; align-items:center; gap:.55rem; padding:.4rem; transition: padding .45s ease; }
          .auth-buttons.collapsed { padding:.22rem; }
          .auth-seg { position:relative; z-index: 3; display:inline-flex; align-items:center; justify-content:center; gap:.45rem; padding:.55rem 1.05rem; border-radius:22px; font-size:.72rem; font-weight:600; letter-spacing:.8px; color:var(--color-text); background:var(--color-surface); border:1px solid var(--color-border); cursor:pointer; transition: background .45s ease, color .35s ease, transform .35s cubic-bezier(.6,.2,.2,1), box-shadow .45s, border-color .4s; -webkit-tap-highlight-color: transparent; }
          .auth-seg:hover { background:linear-gradient(45deg, var(--luxury-gold), var(--luxury-rose)); color:var(--color-glass); transform:translateY(-3px); box-shadow:0 12px 30px -12px var(--luxury-gold)40; }
          .auth-seg:active { transform:translateY(-1px) scale(.97); }
          .auth-seg:focus-visible { outline:2px solid var(--color-focus); outline-offset:3px; }
          .auth-seg.primary { background:linear-gradient(145deg, var(--color-accent), var(--color-accent-glow)); color:var(--color-glass); border:1px solid var(--color-accent); box-shadow:0 8px 30px -12px var(--color-accent), 0 0 0 1px var(--color-glass) inset; }
          .auth-seg.primary:hover { box-shadow:0 12px 42px -12px var(--color-accent), 0 0 0 1px var(--color-glass) inset; }
          .auth-icon { display:inline-flex; align-items:center; justify-content:center; width:18px; height:18px; filter:drop-shadow(0 2px 4px var(--color-shadow)); opacity:.9; transition: transform .5s cubic-bezier(.6,.2,.2,1), opacity .4s; }
          .auth-seg:hover .auth-icon { transform:translateY(-2px) scale(1.12); opacity:1; }
          .auth-seg.primary .auth-icon { filter:drop-shadow(0 2px 6px var(--color-accent)); }
          .auth-label { position:relative; top:1px; transition: opacity .4s ease, transform .45s ease; }
          .auth-buttons.collapsed .auth-label { opacity:0; transform:translateY(-8px); pointer-events:none; width:0; margin:0; }
          .auth-buttons.collapsed .auth-seg { padding:.18rem .75rem; gap:0; border-radius:16px; }
          .auth-buttons.collapsed .auth-seg .auth-icon svg { width:17px; height:17px; stroke-width:2; }
          .auth-buttons.collapsed .auth-seg.primary { box-shadow:0 6px 20px -10px var(--color-accent), 0 0 0 1px var(--color-glass) inset; }
          .auth-buttons.collapsed .auth-seg { transform:scale(.92); }
          @media (max-width:760px){ .auth-label{ font-size:.65rem; letter-spacing:.6px; } .auth-seg{ padding:.45rem .75rem; } }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`user-profile ${collapsed ? 'collapsed' : ''}`} ref={dropdownRef}>
      <button 
        className="profile-button"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-expanded={showDropdown}
        aria-haspopup="true"
      >
        <div 
          className="profile-picture-container"
          onClick={(e) => {
            e.stopPropagation();
            router.push('/dashboard/user');
          }}
          title="Go to My Dashboard"
        >
          <img 
            src={getProfilePicture()} 
            alt={`${user.username}'s profile`}
            className="profile-picture"
          />
        </div>
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
            <Link href="/dashboard/user" className="dropdown-item">
              <span>My Dashboard</span>
            </Link>
            {user.isAdmin && (
              <Link href="/dashboard/admin" className="dropdown-item admin-item">
                <span>Admin Dashboard</span>
              </Link>
            )}
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
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          color: var(--color-text);
          padding: 0.4rem 0.8rem;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.4s ease;
          font-size: 0.9rem;
          position: relative;
          z-index: 3;
        }
        .profile-button:hover {
          background: var(--color-accent-alt);
          border-color: var(--color-accent);
          transform: translateY(-1px);
        }
        .profile-picture-container {
          position: relative;
          cursor: pointer;
          border-radius: 50%;
          transition: all 0.3s ease;
          padding: 2px;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.6), rgba(255, 165, 0, 0.8));
        }
        .profile-picture-container:hover {
          transform: scale(1.1);
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 165, 0, 0.4);
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.8), rgba(255, 165, 0, 1));
        }
        .profile-picture-container:active {
          transform: scale(1.05);
        }
        .profile-picture {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          object-fit: cover;
          display: block;
        }
        .profile-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-accent), var(--color-accent-glow));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--color-glass);
        }
        .profile-name {
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: opacity .4s ease, transform .45s ease;
        }
        .user-profile.collapsed .profile-name { opacity:0; transform:translateY(-8px); width:0; margin:0; pointer-events:none; }
  .user-profile.collapsed .profile-button { padding:0.3rem 0.55rem; }
        .dropdown-arrow {
          transition: transform 0.2s ease;
          transform: ${showDropdown ? 'rotate(180deg)' : 'rotate(0deg)'};
        }
        .profile-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: var(--color-surface);
          backdrop-filter: blur(10px);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          box-shadow: 0 10px 30px var(--color-shadow);
          min-width: 240px;
          z-index: 1000;
          overflow: hidden;
        }
        .dropdown-header {
          padding: 1rem;
          background: var(--color-bg-alt);
        }
        .user-info strong {
          display: block;
          font-size: 0.95rem;
          margin-bottom: 0.2rem;
          color: var(--color-text);
        }
        .user-info .email {
          font-size: 0.8rem;
          color: var(--color-text-dim);
        }
        .badges {
          margin-top: 0.5rem;
          display: flex;
          gap: 0.5rem;
        }
        .badge {
          background: var(--color-surface);
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 500;
          border: 1px solid var(--color-border);
        }
        .badge.verified {
          background: var(--color-accent-glow);
          color: var(--color-text);
          border-color: var(--color-accent-glow);
        }
        .badge.unverified {
          background: var(--color-accent-alt);
          color: var(--color-text);
          border-color: var(--color-accent-alt);
        }
        .badge.premium {
          background: linear-gradient(135deg, var(--color-accent), var(--color-accent-glow));
          color: var(--color-glass);
          border-color: var(--color-accent);
        }
        .dropdown-divider {
          height: 1px;
          background: var(--color-border);
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
          color: var(--color-text);
          text-decoration: none;
          font-size: 0.9rem;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .dropdown-item:hover {
          background: var(--color-bg-alt);
        }
        .dropdown-item.premium-action {
          color: var(--color-accent-glow);
        }
        .dropdown-item.admin-item {
          color: var(--color-accent);
          font-weight: 600;
        }
        .dropdown-item.admin-item:hover {
          background: var(--color-accent-alt);
        }
        .dropdown-item.logout {
          color: var(--color-accent);
        }
        .dropdown-item.logout:hover {
          background: var(--color-accent-alt);
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