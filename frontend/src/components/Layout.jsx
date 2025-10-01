import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link'; // retained for any other links (wordmark replaced with button)
import { useRouter } from 'next/router';
import UserProfile from './UserProfile';
import FeedbackButton from './FeedbackButton';
import { useTheme } from '../contexts/ThemeContext';

const Layout = ({ children }) => {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main" role="main">{children}</main>
      <Footer />
      <style jsx>{`
        .app-shell { min-height:100vh; display:flex; flex-direction:column; }
        .app-main { flex:1; }
      `}</style>
    </div>
  );
};

const Header = () => {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const [q, setQ] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef(null);
  const [brandExpanded, setBrandExpanded] = useState(true); // retained for subtle transitions, but brand text now always visible

  const onSubmit = (e) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    router.push(`/recommendations?search=${encodeURIComponent(query)}#browse`);
    setShowSearch(false);
  };

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Scroll-based brand collapse/expand
  useEffect(() => {
    const threshold = 80; // px from top before collapsing
    let lastY = 0;
    let ticking = false;
    const handleScroll = () => {
      lastY = window.scrollY || 0;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setBrandExpanded(lastY < threshold);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Config for segmented navigation
  const navItems = [
    { href: '/', label: 'Home', icon: <span className="material-icons" style={{fontSize: '22px'}}>home</span> },
    { href: '/recommendations#choose-style', label: 'Recommend', icon: <span className="material-icons" style={{fontSize: '22px'}}>auto_awesome</span> },
    { href: '/catalog', label: 'Catalog', icon: <span className="material-icons" style={{fontSize: '22px'}}>apps</span> },
    { href: '/news', label: 'News', icon: <span className="material-icons" style={{fontSize: '22px'}}>article</span> }
  ];

  const activeIndex = navItems.findIndex(i => {
    const itemPath = i.href.split('#')[0]; // Remove hash part for comparison
    const currentPath = router.pathname === '/' ? '/' : router.pathname;
    return itemPath === currentPath;
  });

  const segmentsRef = useRef([]);

  const goTo = (href) => {
    router.push(href);
  };

  // Keyboard navigation (Arrow keys / Home / End) within segmented nav
  const onSegmentKeyDown = (e) => {
    const count = navItems.length;
    const current = segmentsRef.current.indexOf(document.activeElement);
    if (current === -1) return;
    let next = null;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = (current + 1) % count; break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = (current - 1 + count) % count; break;
      case 'Home':
        next = 0; break;
      case 'End':
        next = count - 1; break;
      case 'Enter':
      case ' ': // Space triggers navigation
        e.preventDefault();
        goTo(navItems[current].href);
        return;
      default:
        return; // ignore other keys
    }
    if (next != null) {
      e.preventDefault();
      segmentsRef.current[next]?.focus();
    }
  };

  return (
    <header className={`site-header ${brandExpanded ? '' : 'collapsed'}`} role="banner">
      <div className="glass-nav">
        {/* Left Group: Logo + Brand */}
        <div className="nav-group brand" aria-label="Brand home">
          <div className="logo" aria-label="Guide2Anime logo">
            <span className="torii" aria-hidden>
              <svg width="34" height="34" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="toriiMetal" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#fafafa" />
                    <stop offset="0.25" stopColor="#d5d9dd" />
                    <stop offset="0.45" stopColor="#b5bcc2" />
                    <stop offset="0.65" stopColor="#f0f3f5" />
                    <stop offset="1" stopColor="#ced4d9" />
                  </linearGradient>
                  <linearGradient id="toriiGlow" x1="12" y1="4" x2="52" y2="60" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
                    <stop offset="0.4" stopColor="#e3c770" stopOpacity="0.35" />
                    <stop offset="1" stopColor="#c43d32" stopOpacity="0.55" />
                  </linearGradient>
                </defs>
                <title>Torii Gate Logo</title>
                <path d="M6 14h52c1.5 0 2.5-1.2 2-2.6l-2.2-6c-.4-.9-1.3-1.4-2.2-1.4H8.4c-.9 0-1.8.5-2.2 1.4L4 11.4C3.5 12.8 4.5 14 6 14Z" fill="url(#toriiMetal)" />
                <rect x="10" y="18" width="44" height="6" rx="1.5" fill="url(#toriiMetal)" />
                <path d="M16 24h8l-2 30h-6c-1.1 0-2-.9-2-2l2-28Z" fill="url(#toriiMetal)" />
                <path d="M40 24h8l2 28c0 1.1-.9 2-2 2h-6l-2-30Z" fill="url(#toriiMetal)" />
                <rect x="12" y="52" width="10" height="4" rx="1" fill="url(#toriiMetal)" />
                <rect x="42" y="52" width="10" height="4" rx="1" fill="url(#toriiMetal)" />
                <rect x="27" y="24" width="10" height="16" rx="1.2" fill="url(#toriiGlow)" opacity="0.55" />
                <path d="M8 10l6 2M50 10l6 2" stroke="#ffffff" strokeOpacity="0.45" strokeLinecap="round" />
              </svg>
            </span>
            <button type="button" className="wordmark brand-btn" aria-label="Go to Guide2Anime home" onClick={() => router.push('/')}>Guide2Anime</button>
          </div>
        </div>

        {/* Middle Group: Primary navigation + search trigger */}
        <div className="nav-group middle" aria-label="Main navigation">
          <div className="segmented-nav" role="tablist" aria-label="Primary" onKeyDown={onSegmentKeyDown}>
            <div className="segmented-highlight" style={{ '--active-index': activeIndex }} aria-hidden="true" />
            {navItems.map((item, idx) => {
              const active = idx === activeIndex;
              return (
                <button
                  key={item.href}
                  ref={el => segmentsRef.current[idx] = el}
                  type="button"
                  className={`segment ${active ? 'active' : ''}`}
                  role="tab"
                  aria-selected={active}
                  tabIndex={activeIndex === -1 && idx === 0 ? 0 : active ? 0 : -1}
                  onClick={() => goTo(item.href)}
                >
                  <span className="icon" aria-hidden>{item.icon}</span>
                  <span className="label">{item.label}</span>
                </button>
              );
            })}
          </div>
          <button className={`icon-btn search-toggle ${showSearch ? 'active' : ''}`} aria-label={showSearch ? 'Close search' : 'Open search'} onClick={() => setShowSearch(s=>!s)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </div>

        {/* Right Group: Theme toggle + Auth / Profile */}
        <div className="nav-group auth-group" aria-label="User actions">
          <button 
            className="theme-toggle btn-japanese" 
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? (
              <span className="material-icons" style={{fontSize: '18px'}}>light_mode</span>
            ) : (
              <span className="material-icons" style={{fontSize: '18px'}}>dark_mode</span>
            )}
          </button>
          <UserProfile collapsed={!brandExpanded} />
        </div>
      </div>

      {/* Expanding search bar overlay */}
      <div className={`search-bar-wrapper ${showSearch ? 'open' : ''}`} aria-hidden={!showSearch}>
        <form className="search-form" role="search" aria-label="Site search" onSubmit={onSubmit}>
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Search anime..."
            value={q}
            onChange={e=>setQ(e.target.value)}
            aria-label="Search anime"
          />
          <button type="submit" className="submit-btn" aria-label="Submit search">Search</button>
        </form>
      </div>

      <style jsx>{`
  .site-header { position:sticky; top:0; z-index:120; padding:0.18rem 0 0.30rem; transition: padding .35s ease; }
  .site-header.collapsed { padding:0rem 0 0.05rem; }
  .glass-nav { max-width:1400px; margin:0 auto; padding:0.30rem 0.80rem; display:flex; align-items:center; justify-content:space-between; gap:0.85rem; border-radius:24px; position:relative; isolation:isolate; 
          background: var(--color-glass);
          backdrop-filter: blur(18px) saturate(180%);
          -webkit-backdrop-filter: blur(18px) saturate(180%);
          box-shadow: 0 4px 22px -6px var(--color-shadow), 0 0 0 1px var(--color-glass) inset, 0 0 0 1px var(--color-border), 0 0 46px -10px var(--color-accent);
          border: 2px solid transparent;
          background-clip: padding-box;
          overflow: hidden;
          transition: padding .5s ease, backdrop-filter .55s ease, background .6s ease, box-shadow .8s ease;
        }

  .glass-nav::before { 
    content:""; 
    position:absolute; 
    inset:-2px; 
    padding:2px; 
    background: linear-gradient(45deg, 
      rgba(255, 215, 0, 0.6), 
      rgba(255, 223, 0, 0.4), 
      rgba(255, 165, 0, 0.6), 
      rgba(255, 215, 0, 0.8), 
      rgba(255, 223, 0, 0.4), 
      rgba(255, 215, 0, 0.6)
    );
    background-size: 300% 300%;
    border-radius: inherit; 
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); 
    mask-composite: xor; 
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); 
    -webkit-mask-composite: xor;
    animation: goldenGlow 4s ease-in-out infinite;
    opacity: 0.8;
    z-index: 1;
    pointer-events: none;
  }

  /* Enhanced Golden Smoke Effects */
  .glass-nav:hover::before {
    animation: goldenGlow 2s ease-in-out infinite, goldenSmoke 6s ease-in-out infinite;
  }

  @keyframes goldenSmoke {
    0%, 100% {
      background: linear-gradient(45deg, 
        rgba(255, 215, 0, 0.6), 
        rgba(255, 223, 0, 0.4), 
        rgba(255, 165, 0, 0.6), 
        rgba(255, 215, 0, 0.8)
      );
      background-size: 300% 300%;
      background-position: 0% 50%;
      filter: blur(0px);
    }
    25% {
      background: linear-gradient(60deg, 
        rgba(255, 215, 0, 0.8), 
        rgba(255, 191, 0, 0.6), 
        rgba(255, 165, 0, 0.7), 
        rgba(255, 215, 0, 0.9)
      );
      background-size: 400% 400%;
      background-position: 50% 0%;
      filter: blur(1px);
    }
    50% {
      background: linear-gradient(90deg, 
        rgba(255, 215, 0, 0.9), 
        rgba(255, 223, 0, 0.7), 
        rgba(255, 140, 0, 0.8), 
        rgba(255, 215, 0, 1)
      );
      background-size: 500% 500%;
      background-position: 100% 50%;
      filter: blur(2px);
    }
    75% {
      background: linear-gradient(120deg, 
        rgba(255, 215, 0, 0.7), 
        rgba(255, 223, 0, 0.5), 
        rgba(255, 165, 0, 0.8), 
        rgba(255, 215, 0, 0.6)
      );
      background-size: 400% 400%;
      background-position: 50% 100%;
      filter: blur(1px);
    }
  }

  .glass-nav::after { 
    content:""; 
    position:absolute; 
    inset:0; 
    background:
      radial-gradient(circle at 22% 25%, var(--color-accent-alt), transparent 60%),
      radial-gradient(circle at 78% 70%, var(--color-accent-glow), transparent 65%),
      radial-gradient(circle at 50% 50%, var(--color-accent), transparent 70%);
    opacity:.2; 
    pointer-events:none; 
    mix-blend-mode:overlay; 
    border-radius: inherit;
  }

  @keyframes goldenGlow {
    0%, 100% {
      background-position: 0% 50%;
      opacity: 0.6;
    }
    25% {
      background-position: 50% 0%;
      opacity: 0.9;
    }
    50% {
      background-position: 100% 50%;
      opacity: 1;
    }
    75% {
      background-position: 50% 100%;
      opacity: 0.9;
    }
  }
  .nav-group { display:flex; align-items:center; gap:0.65rem; transition: gap .35s ease; }
  .site-header.collapsed .nav-group { gap:0.45rem; }
  .nav-group.middle { flex:1; justify-content:center; }
  .nav-group.brand { min-width:170px; padding:0 .25rem; position:relative; }
  .site-header.collapsed .nav-group.brand { padding:0 .22rem; }
        .nav-group.auth-group { justify-content:flex-end; min-width:170px; }
  .logo { display:flex; flex-direction:row; align-items:center; justify-content:center; gap:.55rem; transition: gap .35s ease, transform .5s cubic-bezier(.7,.2,.25,1); height:38px; }
  .site-header.collapsed .logo { gap:.5rem; height:34px; }
  .torii { display:inline-flex; align-items:center; justify-content:center; height:30px; width:30px; filter: drop-shadow(0 0 4px rgba(227,199,112,0.3)) drop-shadow(0 0 8px rgba(196,61,50,0.28)); position:relative; overflow:visible; }
  .torii svg { transition: transform .4s cubic-bezier(.7,.2,.25,1), filter .4s; position:relative; z-index:2; }
  .torii:after { content:""; position:absolute; inset:-8px; background:conic-gradient(from 180deg at 50% 50%, rgba(255,255,255,0.0), rgba(255,255,255,0.55) 25%, rgba(255,255,255,0.0) 55%); filter:blur(12px); opacity:0; animation: toriiSweep 5.8s linear infinite; pointer-events:none; }
    .torii:before { content:""; position:absolute; inset:-6px; background:radial-gradient(circle at 50% 40%, rgba(227,199,112,0.35), rgba(196,61,50,0) 70%); opacity:.55; pointer-events:none; filter:blur(6px); transition:opacity .6s; }
    .site-header.collapsed .torii svg { transform:scale(1.08) translateY(-1px); }
    .torii:hover svg { transform:scale(1.12); }
    .torii:hover:before { opacity:.85; }
  .wordmark { 
    font-weight: 600; 
    font-size: 1.2rem; 
    line-height: 1; 
    letter-spacing: 0.5px; 
    font-family: 'Japan Ramen', 'Inter', system-ui, sans-serif; 
    background: linear-gradient(45deg, var(--luxury-gold), var(--luxury-rose), var(--luxury-gold), var(--luxury-rose));
    background-size: 300% 300%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradientShift 4s ease-in-out infinite;
    text-shadow: 0 1px 2px rgba(0,0,0,0.1); 
    position: relative; 
    z-index: 3;
    transition: all 0.3s ease; 
    border: none; 
    cursor: pointer; 
    padding: 0; 
    display: inline-flex; 
    align-items: center; 
    opacity: 0.95;
  }
  .wordmark:hover {
    opacity: 1;
    transform: translateY(-1px);
    text-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }
  .site-header.collapsed .glass-nav { 
    padding:0.04rem 0.48rem; 
    backdrop-filter: blur(26px) saturate(210%); 
    -webkit-backdrop-filter: blur(26px) saturate(210%); 
    gap:0.45rem; 
    border-radius:22px; 
  }

  .site-header.collapsed .wordmark { transform: scale(0.9); letter-spacing: 0.3px; }
  .wordmark:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 4px; }
  /* Segmented navigation */
  .segmented-nav { position:relative; display:flex; gap:0.38rem; padding:0.32rem; background:var(--color-surface); border:1px solid var(--color-border); border-radius:26px; backdrop-filter: blur(26px) saturate(170%); -webkit-backdrop-filter: blur(26px) saturate(170%); box-shadow:0 5px 20px -10px var(--color-shadow), inset 0 1px 0 var(--color-glass), inset 0 0 0 1px var(--color-glass); overflow:hidden; }
  .segment { position:relative; flex:1; min-width:110px; display:flex; flex-direction:row; align-items:center; justify-content:center; padding:0.34rem 0.75rem 0.36rem; gap:0.55rem; text-decoration:none !important; color:var(--color-text-dim); font-size:0.62rem; letter-spacing:.55px; font-weight:600; text-transform:capitalize; border-radius:18px; z-index:2; transition:color .3s ease, filter .3s ease, background .3s ease; background:none; border:none; cursor:pointer; font-family:inherit; }
    .segment .icon { display:flex; align-items:center; justify-content:center; line-height:1; opacity:.9; filter:drop-shadow(0 2px 3px var(--color-shadow)); transition: transform .32s cubic-bezier(.6,.2,.2,1), opacity .28s, filter .28s; }
    .segment svg { width:17px; height:17px; stroke-width:2; }
    .segment .label { font-size:0.62rem; letter-spacing:.6px; font-weight:600; line-height:1; }
        .segment:hover .icon { transform:translateY(-2px) scale(1.05); opacity:1; filter:drop-shadow(0 4px 9px var(--color-shadow)); }
        .segment.active { color:var(--color-text); text-shadow:0 0 5px var(--color-accent); }
  .segment.active .icon { transform:translateY(-1px) scale(1.04); opacity:1; }
  .segmented-highlight { --count:4; position:absolute; top:4px; bottom:4px; width:calc((100% - (0.38rem * (var(--count) - 1)) - 0.64rem) / var(--count)); left:4px; border-radius:18px; background:
          radial-gradient(circle at 25% 20%, var(--color-glass), rgba(255,255,255,0) 55%),
          linear-gradient(150deg, var(--color-accent), var(--color-accent-alt) 40%, var(--color-accent-glow));
          box-shadow:0 10px 34px -12px var(--color-accent), 0 0 0 1px var(--color-glass) inset, 0 1px 0 var(--color-glass) inset, 0 0 0 1px var(--color-accent);
          backdrop-filter: blur(42px) saturate(190%);
          -webkit-backdrop-filter: blur(42px) saturate(190%);
          transition: transform .42s cubic-bezier(.77,.05,.25,1), width .35s ease; z-index:1;
        }
        .segmented-highlight:after { content:""; position:absolute; inset:0; border-radius:inherit; background:linear-gradient(120deg, var(--color-glass), rgba(255,255,255,0) 45%), linear-gradient(300deg, var(--color-glass), rgba(255,255,255,0) 55%); mix-blend-mode:overlay; opacity:.55; pointer-events:none; }
  .segmented-highlight { transform:translateX(calc(var(--active-index) * (100% + 0.4rem))); }
        .segment:active { transform:translateY(1px); }
  .segment:focus-visible { outline:2px solid #4ecdc4; outline-offset:3px; }
        .segment:not(.active) { transition:color .35s ease, opacity .35s ease; }
        .segment:not(.active):hover { color:var(--color-text); }
  /* Collapsed animations */
  .site-header.collapsed .segment { min-width:64px; padding:0.18rem 0.5rem 0.2rem; gap:0.4rem; }
  .site-header.collapsed .segment .label { opacity:0; transform:translateX(-6px); pointer-events:none; width:0; margin:0; padding:0; }
  .site-header.collapsed .segment .icon { transform:translateY(0) scale(1.14); }
  .site-header.collapsed .segment svg { width:18px; height:18px; }
  .site-header.collapsed .segmented-nav { padding:0.26rem; }
  .site-header.collapsed .segmented-highlight { top:3px; bottom:3px; }
  /* Keep search size constant */
  .site-header.collapsed .icon-btn.search-toggle { transform:none; padding:.45rem; } /* unchanged to keep size */
  .site-header.collapsed .icon-btn.search-toggle:hover { transform:translateY(-3px); }
  .icon-btn { background:var(--color-surface); border:1px solid var(--color-border); color:var(--color-text); padding:.45rem; border-radius:12px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; transition: background .25s, transform .18s, border-color .25s; position: relative; z-index: 3; }
        .icon-btn:hover { background:linear-gradient(45deg, var(--luxury-gold), var(--luxury-rose)); transform:translateY(-3px); border-color:var(--luxury-gold); }
        .icon-btn.active { background: var(--color-accent); color:var(--color-glass); border-color:var(--color-accent); }
  /* Theme toggle styling */
  .theme-toggle { padding:.4rem; font-size:0; min-width:auto; border-radius:50%; transition: all .3s ease; position: relative; z-index: 3; }
  .theme-toggle:hover { transform:translateY(-2px) scale(1.05); }
  .theme-toggle svg { transition: transform .4s ease; }
  .theme-toggle:hover svg { transform:rotate(15deg); }
        .search-bar-wrapper { position:absolute; left:50%; top:100%; transform:translate(-50%, 10px); width:100%; max-width:640px; padding:0 1.25rem; opacity:0; pointer-events:none; transition: opacity .35s ease, transform .35s ease; }
        .search-bar-wrapper.open { opacity:1; transform:translate(-50%, 18px); pointer-events:auto; }
        .search-form { display:flex; gap:.6rem; background:var(--color-surface); backdrop-filter: blur(16px) saturate(180%); -webkit-backdrop-filter: blur(16px) saturate(180%); padding:.9rem 1.1rem; border-radius:22px; border:1px solid var(--color-border); box-shadow:0 14px 38px -10px var(--color-shadow), 0 2px 0 var(--color-glass) inset; }
        .search-form input { flex:1; background:var(--color-bg); border:1px solid var(--color-border); border-radius:14px; padding:.65rem .9rem; font-size:.9rem; color:var(--color-text); }
        .search-form input:focus { outline:none; border-color:var(--color-accent); box-shadow:0 0 0 1px var(--color-accent); }
        .submit-btn { background:linear-gradient(135deg, var(--color-accent), var(--color-accent-glow)); color:var(--color-glass); border:none; border-radius:14px; padding:.65rem 1.1rem; font-weight:600; font-size:.85rem; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; letter-spacing:.4px; box-shadow:0 6px 20px -6px var(--color-accent); transition:transform .2s, box-shadow .2s; }
        .submit-btn:hover { transform:translateY(-3px); box-shadow:0 10px 26px -6px var(--color-accent); }
  @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
  @keyframes hueShift { 0%,100%{ background-position:0% 50%; } 50%{ background-position:100% 50%; } }
  @keyframes lightSweep { 0% { transform:translateX(-130%) skewX(-18deg); opacity:0; } 8% { opacity:.9; } 16% { transform:translateX(10%) skewX(-18deg); opacity:0; } 100% { transform:translateX(110%) skewX(-18deg); opacity:0; } }
  @keyframes toriiSweep { 0% { opacity:0; transform:rotate(0deg) scale(.9);} 6% { opacity:.65;} 10% { opacity:0;} 100% { opacity:0; transform:rotate(360deg) scale(1);} }
  @keyframes wordmarkSheen { 0%,92%,100% { filter:brightness(1); } 8% { filter:brightness(1.18);} 9% { filter:brightness(1); } }
  @media (prefers-reduced-motion: reduce) { 
    .torii:after, .glass-nav::before { 
      animation: none; 
    }
    .glass-nav::before {
      opacity: 0.4;
    }
    .wordmark { 
      animation: none; 
      background: linear-gradient(45deg, var(--luxury-gold), var(--luxury-rose)); 
      -webkit-background-clip: text; 
      -webkit-text-fill-color: transparent; 
      background-clip: text; 
    } 
  }
        @keyframes twinkle { 0%,100%{ transform: scale(1); filter: drop-shadow(0 0 6px rgba(78,205,196,0.6)) drop-shadow(0 0 10px rgba(69,183,209,0.35)); } 50%{ transform: scale(1.08); filter: drop-shadow(0 0 10px rgba(78,205,196,0.85)) drop-shadow(0 0 16px rgba(69,183,209,0.55)); } }
        @media (max-width: 1040px){ 
          .wordmark { font-size:1.4rem; } 
        }
  @media (max-width: 880px){ 
    .segment { min-width:64px; padding:0.34rem 0.5rem 0.34rem; gap:0.4rem; } 
    .segment .label{ display:none; } 
  }
        @media (max-width: 760px){ 
          .segmented-nav { display:none; } 
          .nav-group.middle { justify-content:flex-end; } 
          .glass-nav { padding:.55rem .85rem; } 
          .nav-group.brand { min-width:auto; } 
        }
      `}</style>
    </header>
  );
};

const Footer = () => (
  <footer className="site-footer" role="contentinfo">
    <div className="footer-inner">
      <span>© {new Date().getFullYear()} Guide2Anime</span>
      <div className="footer-center">
        <FeedbackButton inline={true} />
      </div>
      <div className="links">
        <a href="#" aria-label="Privacy Policy">Privacy</a>
        <a href="#" aria-label="Terms of Service">Terms</a>
      </div>
    </div>
    <style jsx>{`
      .site-footer { background:var(--color-bg-alt); padding:2rem 1.5rem; margin-top:4rem; border-top:1px solid var(--color-border); }
      .footer-inner { max-width:1200px; margin:0 auto; display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; color:var(--color-text-dim); }
      .footer-center { flex: 1; display: flex; justify-content: center; }
      .links a { margin-left:1rem; color:var(--color-text-dim); text-decoration:none; transition:color .3s ease; }
      .links a:hover { color:var(--color-accent); }
    `}</style>
  </footer>
);

export default Layout;