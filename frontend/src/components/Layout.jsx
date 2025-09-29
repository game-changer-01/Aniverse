import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

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
  const [q, setQ] = useState('');
  const onSubmit = (e) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    // Navigate to recommendations with search parameter; page will use it to fetch
    router.push(`/recommendations?search=${encodeURIComponent(query)}#browse`);
  };
  return (
    <header className="site-header" role="banner">
      <div className="nav-inner">
        <div className="logo" aria-label="Aniverse">
          <span className="star" aria-hidden>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2l2.6 5.8L21 9l-4.5 4.1L17.5 20 12 16.9 6.5 20l1-6.9L3 9l6.4-1.2L12 2z" fill="url(#g)"/>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ff6b6b"/>
                  <stop offset="0.5" stopColor="#4ecdc4"/>
                  <stop offset="1" stopColor="#45b7d1"/>
                </linearGradient>
              </defs>
            </svg>
          </span>
          <Link href="/" className="wordmark" aria-label="Go to home">Aniverse</Link>
        </div>
        <nav className="primary-nav" aria-label="Main Navigation">
          <Link href="/" className={`nav-btn ${router.pathname === '/' ? 'active' : ''}`} aria-current={router.pathname === '/' ? 'page' : undefined}>Home</Link>
          <Link href="/recommendations" className={`nav-btn ${router.pathname === '/recommendations' ? 'active' : ''}`} aria-current={router.pathname === '/recommendations' ? 'page' : undefined}>Recommendations</Link>
          <Link href="/catalog" className={`nav-btn ${router.pathname === '/catalog' ? 'active' : ''}`} aria-current={router.pathname === '/catalog' ? 'page' : undefined}>Catalog</Link>
          <Link href="/news" className={`nav-btn ${router.pathname === '/news' ? 'active' : ''}`} aria-current={router.pathname === '/news' ? 'page' : undefined}>News</Link>
        </nav>
        <form className="search" role="search" aria-label="Search anime" onSubmit={onSubmit}>
          <input
            type="search"
            placeholder="Search anime..."
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            aria-label="Search anime"
          />
        </form>
      </div>
      <style jsx>{`
        .site-header { backdrop-filter: blur(10px); background: rgba(10,12,20,0.6); position:sticky; top:0; z-index:100; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .nav-inner { max-width:1200px; margin:0 auto; padding:0.6rem 1.25rem; display:flex; align-items:center; gap:1rem; }
        .logo { display:flex; align-items:center; gap:.6rem; }
        .star { display:inline-flex; filter: drop-shadow(0 0 6px rgba(78,205,196,0.6)) drop-shadow(0 0 10px rgba(69,183,209,0.35)); animation: twinkle 3.2s ease-in-out infinite; }
        .wordmark { font-weight:800; font-size:1.8rem; letter-spacing:1.5px; text-transform:capitalize; position:relative; background: linear-gradient(45deg,#ff6b6b,#4ecdc4,#45b7d1); background-size: 300% 300%; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation: hueShift 6s ease-in-out infinite; text-shadow: 0 0 10px rgba(78,205,196,0.25), 0 0 18px rgba(69,183,209,0.18);
        }
        .primary-nav { margin-left:auto; display:flex; align-items:center; gap:.6rem; }
        .nav-btn { display:inline-flex; align-items:center; justify-content:center; background: rgba(255,255,255,0.06); border:1px solid #2e3d55; color:#fff; padding:.5rem .85rem; border-radius:999px; font-size:.9rem; letter-spacing:.3px; transition: background .2s, transform .15s, border-color .2s; }
        .nav-btn:hover, .nav-btn:focus { background: rgba(255,255,255,0.1); transform: translateY(-2px); border-color:#3a4e6d; }
        .nav-btn.active { background: linear-gradient(135deg, rgba(78,205,196,0.28), rgba(69,183,209,0.2)); border-color:#4ecdc4; box-shadow: 0 6px 18px rgba(78,205,196,0.18); }
        .search { margin-left:.5rem; }
        .search input { background:#0f1522; border:1px solid #2e3d55; color:#fff; border-radius:999px; padding:.4rem .8rem; min-width:220px; }

        @keyframes hueShift { 0%,100%{ background-position:0% 50%; } 50%{ background-position:100% 50%; } }
        @keyframes twinkle { 0%,100%{ transform: scale(1); filter: drop-shadow(0 0 6px rgba(78,205,196,0.6)) drop-shadow(0 0 10px rgba(69,183,209,0.35)); } 50%{ transform: scale(1.08); filter: drop-shadow(0 0 10px rgba(78,205,196,0.85)) drop-shadow(0 0 16px rgba(69,183,209,0.55)); } }

        @media (max-width:900px){ .wordmark { font-size:1.4rem; } .search input{ min-width:150px; } }
        @media (max-width:640px){ .primary-nav { display:none; } }
      `}</style>
    </header>
  );
};

const Footer = () => (
  <footer className="site-footer" role="contentinfo">
    <div className="footer-inner">
      <span>© {new Date().getFullYear()} AniVerse</span>
      <div className="links">
        <a href="#" aria-label="Privacy Policy">Privacy</a>
        <a href="#" aria-label="Terms of Service">Terms</a>
      </div>
    </div>
    <style jsx>{`
      .site-footer { background:#101018; padding:2rem 1.5rem; margin-top:4rem; }
      .footer-inner { max-width:1200px; margin:0 auto; display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; opacity:0.7; }
      .links a { margin-left:1rem; }
      .links a:hover { opacity:1; }
    `}</style>
  </footer>
);

export default Layout;