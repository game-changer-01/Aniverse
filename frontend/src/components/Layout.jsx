import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link'; // retained for any other links (wordmark replaced with button)
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import UserProfile from './UserProfile';
import FeedbackButton from './FeedbackButton';
import { useTheme } from '../contexts/ThemeContext';

// Load SmartSearch dynamically (client-side only)
const SmartSearch = dynamic(() => import('./SmartSearch').then(mod => mod.default || mod), {
  ssr: false,
  loading: () => null
});

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
  // Conditional router - only use on client-side
  const router = typeof window !== 'undefined' ? useRouter() : null;
  const { isDark, toggleTheme } = useTheme();
  const [q, setQ] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef(null);
  const [brandExpanded, setBrandExpanded] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    const query = q.trim();
    if (!query || !isMounted || !router) return;
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
    { href: '/recommendations#browse', label: 'Recommend', icon: <span className="material-icons" style={{fontSize: '22px'}}>auto_awesome</span> },
    { href: '/catalog', label: 'Catalog', icon: <span className="material-icons" style={{fontSize: '22px'}}>apps</span> },
    { href: '/manga', label: 'Manga', icon: <span className="material-icons" style={{fontSize: '22px'}}>menu_book</span> },
    { href: '/news', label: 'More', icon: <span className="material-icons" style={{fontSize: '22px'}}>more_horiz</span> }
  ];

  const activeIndex = isMounted && router ? navItems.findIndex(i => {
    const itemPath = i.href.split('#')[0];
    const currentPath = router.pathname === '/' ? '/' : router.pathname;
    return itemPath === currentPath;
  }) : -1;

  const segmentsRef = useRef([]);

  const goTo = (href) => {
    if (!isMounted || !router) return;
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
            <button type="button" className="wordmark brand-btn" aria-label="Go to Guide2Anime home" onClick={() => isMounted && router && router.push('/')}>Guide2Anime</button>
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
          <button className="icon-btn-small search-toggle" aria-label="Open search" onClick={() => setShowSearch(true)}>
            <span className="material-icons" style={{fontSize: '18px'}}>search</span>
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

      {/* Smart Search Modal */}
      <SmartSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />

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
          overflow: visible;
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
  .segmented-highlight { --count:5; position:absolute; top:4px; bottom:4px; width:calc((100% - (0.38rem * (var(--count) - 1)) - 0.64rem) / var(--count)); left:4px; border-radius:18px; background:
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
  /* Small icon button for search - matches theme toggle size */
  .icon-btn-small { background:var(--color-surface); border:1px solid var(--color-border); color:var(--color-text); padding:.4rem; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; transition: all .3s ease; position: relative; z-index: 3; }
  .icon-btn-small:hover { background:linear-gradient(45deg, var(--luxury-gold), var(--luxury-rose)); transform:translateY(-2px) scale(1.05); border-color:var(--luxury-gold); }
  .site-header.collapsed .icon-btn-small.search-toggle { transform:none; }
  .site-header.collapsed .icon-btn-small.search-toggle:hover { transform:translateY(-3px) scale(1.05); }
  .icon-btn { background:var(--color-surface); border:1px solid var(--color-border); color:var(--color-text); padding:.45rem; border-radius:12px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; transition: background .25s, transform .18s, border-color .25s; position: relative; z-index: 3; }
        .icon-btn:hover { background:linear-gradient(45deg, var(--luxury-gold), var(--luxury-rose)); transform:translateY(-3px); border-color:var(--luxury-gold); }
        .icon-btn.active { background: var(--color-accent); color:var(--color-glass); border-color:var(--color-accent); }
  /* Theme toggle styling with golden ring */
  .theme-toggle { 
    padding:.4rem; 
    font-size:0; 
    min-width:auto; 
    border-radius:50%; 
    transition: all .3s ease; 
    position: relative; 
    z-index: 3;
    background: var(--color-surface);
    border: 2px solid transparent;
    background-clip: padding-box;
  }
  .theme-toggle::before {
    content: "";
    position: absolute;
    inset: -2px;
    padding: 2px;
    background: linear-gradient(135deg, var(--luxury-gold), var(--luxury-rose), var(--luxury-gold));
    background-size: 200% 200%;
    border-radius: inherit;
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: xor;
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    animation: themeToggleGlow 3s ease-in-out infinite;
    z-index: -1;
    pointer-events: none;
  }
  .theme-toggle:hover { 
    transform: translateY(-2px) scale(1.08); 
    box-shadow: 0 4px 12px rgba(227, 199, 112, 0.4);
  }
  .theme-toggle:hover::before {
    animation: themeToggleGlow 1.5s ease-in-out infinite;
  }
  .theme-toggle .material-icons { 
    transition: transform .4s ease, filter .3s ease; 
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .theme-toggle:hover .material-icons { 
    transform: rotate(180deg) scale(1.1); 
    filter: drop-shadow(0 0 4px var(--luxury-gold));
  }
  @keyframes themeToggleGlow {
    0%, 100% {
      background-position: 0% 50%;
      opacity: 0.8;
    }
    50% {
      background-position: 100% 50%;
      opacity: 1;
    }
  }
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
    <div className="footer-gradient-bg"></div>
    <div className="footer-decoration">
      <div className="decoration-circle circle-1"></div>
      <div className="decoration-circle circle-2"></div>
      <div className="decoration-circle circle-3"></div>
    </div>
    
    <div className="footer-content">
      <div className="footer-top">
        <div className="footer-brand">
          <h3 className="brand-title">Guide2Anime</h3>
          <p className="brand-tagline">Your Ultimate Anime Companion</p>
        </div>
        
        <div className="footer-social">
          <h4 className="section-title">Connect With Us</h4>
          <div className="social-links">
            <a href="https://twitter.com/SaturoA69525" target="_blank" rel="noopener noreferrer" aria-label="Follow on X (Twitter)" className="social-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/mr_._sam_23/" target="_blank" rel="noopener noreferrer" aria-label="Follow on Instagram" className="social-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="https://www.linkedin.com/in/samarpith-menezes/" target="_blank" rel="noopener noreferrer" aria-label="Connect on LinkedIn" className="social-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="mailto:szproduction447@gmail.com" aria-label="Email us" className="social-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </a>
          </div>
        </div>
        
        <div className="footer-feedback">
          <h4 className="section-title">Share Your Thoughts</h4>
          <FeedbackButton inline={true} />
        </div>
      </div>
      
      <div className="footer-divider"></div>
      
      <div className="footer-bottom">
        <div className="footer-copyright">
          <span>© {new Date().getFullYear()} Guide2Anime</span>
          <span className="separator">•</span>
          <span>Made with ❤️ for Anime Fans</span>
        </div>
        <div className="footer-links">
          <a href="/privacy" aria-label="Privacy Policy">Privacy Policy</a>
          <a href="/terms" aria-label="Terms of Service">Terms of Service</a>
          <a href="/contact" aria-label="Contact Us">Contact</a>
        </div>
      </div>
    </div>
    
    <style jsx>{`
      .site-footer {
        position: relative;
        background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%);
        padding: 4rem 2rem 2rem;
        margin-top: 6rem;
        overflow: hidden;
      }
      
      .footer-gradient-bg {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(180deg, 
          rgba(255, 215, 0, 0.05) 0%, 
          rgba(221, 42, 123, 0.03) 50%, 
          rgba(88, 86, 214, 0.05) 100%
        );
        pointer-events: none;
      }
      
      .footer-decoration {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        overflow: hidden;
      }
      
      .decoration-circle {
        position: absolute;
        border-radius: 50%;
        opacity: 0.1;
        animation: float 20s infinite ease-in-out;
      }
      
      .circle-1 {
        width: 400px;
        height: 400px;
        top: -200px;
        right: -100px;
        background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
        animation-delay: 0s;
      }
      
      .circle-2 {
        width: 300px;
        height: 300px;
        bottom: -150px;
        left: -50px;
        background: radial-gradient(circle, rgba(221, 42, 123, 0.3) 0%, transparent 70%);
        animation-delay: 7s;
      }
      
      .circle-3 {
        width: 250px;
        height: 250px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: radial-gradient(circle, rgba(88, 86, 214, 0.3) 0%, transparent 70%);
        animation-delay: 14s;
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0) scale(1); }
        33% { transform: translateY(-30px) scale(1.05); }
        66% { transform: translateY(20px) scale(0.95); }
      }
      
      .footer-content {
        position: relative;
        max-width: 1400px;
        margin: 0 auto;
        z-index: 1;
      }
      
      .footer-top {
        display: grid;
        grid-template-columns: 2fr 1.5fr 1.5fr;
        gap: 4rem;
        margin-bottom: 3rem;
      }
      
      .footer-brand {
        animation: fadeInUp 0.6s ease-out;
      }
      
      .brand-title {
        font-family: 'Japan Ramen', cursive;
        font-size: 2.5rem;
        background: linear-gradient(135deg, #ffd700 0%, #dd2a7b 50%, #5856d6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0 0 0.5rem 0;
        text-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
        animation: shimmer 3s infinite linear;
      }
      
      @keyframes shimmer {
        0% { background-position: 0% 50%; }
        100% { background-position: 200% 50%; }
      }
      
      .brand-tagline {
        color: rgba(255, 255, 255, 0.6);
        font-size: 1rem;
        margin: 0;
        font-style: italic;
      }
      
      .footer-social,
      .footer-feedback {
        animation: fadeInUp 0.6s ease-out;
      }
      
      .footer-social {
        animation-delay: 0.1s;
      }
      
      .footer-feedback {
        animation-delay: 0.2s;
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .section-title {
        font-size: 1.1rem;
        color: rgba(255, 255, 255, 0.9);
        margin: 0 0 1rem 0;
        font-weight: 600;
        letter-spacing: 0.5px;
      }
      
      .social-links {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }
      
      .social-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid transparent;
        background-clip: padding-box;
        color: #ffd700;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        text-decoration: none;
        position: relative;
        overflow: hidden;
      }
      
      .social-icon::before {
        content: '';
        position: absolute;
        inset: -2px;
        background: linear-gradient(135deg, #ffd700, #dd2a7b, #5856d6);
        border-radius: 50%;
        z-index: -1;
        opacity: 0;
        transition: opacity 0.4s ease;
      }
      
      .social-icon::after {
        content: '';
        position: absolute;
        inset: 2px;
        background: linear-gradient(135deg, #0a0a0f, #1a1a2e);
        border-radius: 50%;
        z-index: -1;
      }
      
      .social-icon:hover {
        transform: translateY(-5px) scale(1.1);
        color: #ffffff;
        box-shadow: 0 10px 30px rgba(255, 215, 0, 0.4);
      }
      
      .social-icon:hover::before {
        opacity: 1;
        animation: rotate 2s linear infinite;
      }
      
      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      .social-icon svg {
        width: 22px;
        height: 22px;
        position: relative;
        z-index: 1;
      }
      
      .footer-divider {
        height: 1px;
        background: linear-gradient(90deg, 
          transparent 0%, 
          rgba(255, 215, 0, 0.3) 20%, 
          rgba(221, 42, 123, 0.3) 50%, 
          rgba(88, 86, 214, 0.3) 80%, 
          transparent 100%
        );
        margin: 3rem 0 2rem;
        box-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
      }
      
      .footer-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 2rem;
        animation: fadeInUp 0.6s ease-out 0.3s both;
      }
      
      .footer-copyright {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.9rem;
      }
      
      .separator {
        color: rgba(255, 215, 0, 0.5);
      }
      
      .footer-links {
        display: flex;
        gap: 2rem;
      }
      
      .footer-links a {
        color: rgba(255, 255, 255, 0.6);
        text-decoration: none;
        font-size: 0.9rem;
        position: relative;
        transition: color 0.3s ease;
      }
      
      .footer-links a::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 0;
        width: 0;
        height: 2px;
        background: linear-gradient(90deg, #ffd700, #dd2a7b);
        transition: width 0.3s ease;
      }
      
      .footer-links a:hover {
        color: #ffd700;
      }
      
      .footer-links a:hover::after {
        width: 100%;
      }
      
      @media (max-width: 1024px) {
        .footer-top {
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
        }
        
        .footer-brand {
          grid-column: 1 / -1;
        }
      }
      
      @media (max-width: 768px) {
        .site-footer {
          padding: 3rem 1.5rem 1.5rem;
        }
        
        .footer-top {
          grid-template-columns: 1fr;
          gap: 2.5rem;
          text-align: center;
        }
        
        .footer-brand {
          grid-column: auto;
        }
        
        .brand-title {
          font-size: 2rem;
        }
        
        .social-links {
          justify-content: center;
        }
        
        .footer-bottom {
          flex-direction: column;
          text-align: center;
          gap: 1.5rem;
        }
        
        .footer-copyright {
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .separator {
          display: none;
        }
        
        .footer-links {
          flex-direction: column;
          gap: 1rem;
        }
      }
      
      @media (max-width: 480px) {
        .brand-title {
          font-size: 1.75rem;
        }
        
        .social-icon {
          width: 44px;
          height: 44px;
        }
      }
    `}</style>
  </footer>
);

export default Layout;