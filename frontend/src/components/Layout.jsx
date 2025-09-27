import React from 'react';
import Link from 'next/link';

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
  return (
    <header className="site-header" role="banner">
      <div className="nav-inner">
        <div className="logo"><Link href="/">AniVerse</Link></div>
        <nav className="primary-nav" aria-label="Main Navigation">
          <Link href="/recommendations">Recommendations</Link>
        </nav>
      </div>
      <style jsx>{`
        .site-header { backdrop-filter: blur(10px); background: rgba(15,15,25,0.6); position:sticky; top:0; z-index:100; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
        .nav-inner { max-width:1200px; margin:0 auto; padding:0.75rem 1.5rem; display:flex; align-items:center; justify-content:space-between; }
        .logo { font-weight:700; font-size:1.25rem; letter-spacing:1px; background:linear-gradient(45deg,#ff6b6b,#4ecdc4); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .primary-nav a { margin-left:1.5rem; font-size:0.95rem; opacity:0.85; transition:opacity .2s; }
        .primary-nav a:hover, .primary-nav a:focus { opacity:1; }
        @media (max-width:640px){ .primary-nav a { margin-left:1rem; } }
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