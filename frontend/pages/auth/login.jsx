import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useAuth } from '../../src/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, googleLogin, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gisReady, setGisReady] = useState(false);
  const [dbStatus, setDbStatus] = useState('unknown');
  const [dbNotice, setDbNotice] = useState('');

// Custom layout to remove taskbar
LoginPage.getLayout = function getLayout(page) {
  return page;
};

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/recommendations');
    }
  }, [isAuthenticated, router]);

  // GIS script is already loaded globally in _app; just detect availability
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.google?.accounts?.id) setGisReady(true);
  }, []);

  useEffect(() => {
    if (!gisReady) return;
    try {
      const client_id = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;
      if (!client_id) return;
      window.google.accounts.id.initialize({ 
        client_id, 
        callback: async ({ credential }) => {
          if (!credential) return;
          setLoading(true);
          setError('');
          
          const result = await googleLogin(credential);
          if (result.success) {
            router.push('/recommendations#browse');
          } else {
            setError(result.error);
          }
          setLoading(false);
        }
      });
      const el = document.getElementById('google-btn-visible');
      if (el) {
        window.google.accounts.id.renderButton(el, { 
          theme: 'outline', 
          size: 'large', 
          width: 320, 
          shape: 'pill' 
        });
      }
    } catch {}
  }, [gisReady, googleLogin, router]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simple client-side validation
    if (!email || !password || password.length < 6) {
      setLoading(false);
      return setError('Please enter a valid email and a password with at least 6 characters.');
    }
    
    const result = await login({ email, password });
    if (result.success) {
      router.push('/recommendations#browse');
    } else {
      // Check if the error indicates this is a Google OAuth account
      if (result.error && result.error.includes('Google')) {
        setError('This account was created with Google. Please use the "Sign in with Google" button below.');
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    }
    setLoading(false);
  };

  // Show DB connectivity notice to explain failures when Atlas is offline
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const db = await axios.get('/api/health/db');
        if (!mounted) return;
        const state = db?.data?.state || 'unknown';
        setDbStatus(state);
        if (state !== 'connected') {
          setDbNotice('Database is offline right now. Login may fail until it is restored.');
        }
      } catch {
        if (!mounted) return;
        setDbStatus('unknown');
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <div className="auth-page">
        <div className="auth-container">
          <div className="brand-section">
            <h1 className="brand-title">AnimeVerse</h1>
            <p className="brand-subtitle">Discover your next favorite anime</p>
          </div>
          <form onSubmit={onSubmit} className="auth-card" noValidate>
            <h2>Welcome back</h2>
        {dbNotice && <div className="notice" role="status">{dbNotice}</div>}
        {error && <div className="err" role="alert">{error}</div>}
        {gisReady && (
          <div className="oauth">
            <div className="google-signin">
              <div id="google-btn-visible" />
            </div>
            <div className="divider">
              <span>or continue with email</span>
            </div>
          </div>
        )}
        <label>
          <span>Email or Username</span>
          <input value={email} onChange={e=>{ setEmail(e.target.value); if(error) setError(''); }} type="text" required autoComplete="email" placeholder="you@example.com or username" />
        </label>
        <label>
          <span>Password</span>
          <input value={password} onChange={e=>{ setPassword(e.target.value); if(error) setError(''); }} type="password" required minLength={6} autoComplete="current-password" placeholder="••••••" />
        </label>
        <button disabled={loading} type="submit">{loading ? 'Signing in…' : 'Sign in'}</button>
            <div className="auth-link-card">
              <span className="link-text">No account?</span>
              <Link href="/auth/signup" className="signup-link">
                <span className="link-content">
                  <span className="link-icon">✨</span>
                  <span>Join the adventure</span>
                </span>
              </Link>
            </div>
        </form>
      </div>
    </div>
    <style jsx>{`
        .auth-page{min-height:100vh;background:linear-gradient(135deg, var(--color-bg), var(--color-bg-alt));display:flex;align-items:center;justify-content:center;padding:2rem}
        .auth-container{display:grid;grid-template-columns:1fr 1fr;gap:4rem;max-width:1000px;width:100%;align-items:center}
        .brand-section{text-align:center}
        .brand-title{font-family:'Japan Ramen',serif;font-size:3.5rem;margin:0 0 1rem;background:linear-gradient(45deg, var(--luxury-gold), var(--luxury-rose));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 4px 8px var(--color-shadow))}
        .brand-subtitle{font-size:1.2rem;color:var(--color-text-dim);margin:0;opacity:0.9}
        .auth-card{width:100%;max-width:420px;background:var(--color-glass);backdrop-filter:blur(10px);border:1px solid var(--color-border);border-radius:20px;padding:2rem;box-shadow:0 20px 40px var(--color-shadow);color:var(--color-text)}
        h2{margin:0 0 1.5rem;font-size:1.8rem;color:var(--color-text);background:linear-gradient(45deg, var(--color-accent), var(--color-accent-glow));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-align:center}
        .notice{background:var(--color-surface);border:1px solid var(--color-border);padding:.5rem;border-radius:8px;margin-bottom:.5rem;opacity:.9;color:var(--color-text-dim)}
        .oauth{margin-bottom:1.5rem}
        .google-signin{margin-bottom:1rem}
        #google-btn-visible{display:flex;justify-content:center}
        #google-btn-visible :global(div[role="button"]){width:100% !important;justify-content:center;border-radius:12px !important;height:48px !important;font-size:16px !important}
        .divider{position:relative;text-align:center;margin:1.5rem 0;color:var(--color-text-dim);font-size:.85rem}
        .divider::before{content:'';position:absolute;top:50%;left:0;right:0;height:1px;background:linear-gradient(90deg, transparent, var(--color-border), transparent)}
        .divider span{background:var(--color-glass);padding:0 1rem;position:relative}
        label{display:flex;flex-direction:column;gap:.35rem;margin:.6rem 0}
        label span{color:var(--color-text);font-size:.9rem}
        input{background:var(--color-surface);border:1px solid var(--color-border);color:var(--color-text);border-radius:10px;padding:.7rem;transition:border-color .2s}
        input:focus{border-color:var(--color-accent);outline:none}
        input::placeholder{color:var(--color-text-dim)}
        button{margin-top:1rem;width:100%;background:linear-gradient(45deg,var(--color-accent),var(--color-accent-glow));border:none;color:var(--color-glass);padding:.8rem;border-radius:12px;font-weight:600;cursor:pointer;transition:all .2s}
        button:hover{background:linear-gradient(45deg,var(--color-accent-alt),var(--color-accent))}
        button:disabled{opacity:.5;cursor:not-allowed}
        .err{background:var(--color-surface);border:1px solid var(--color-accent);padding:.5rem;border-radius:8px;margin-bottom:.5rem;color:var(--color-accent)}
        .alt{margin-top:1.5rem;text-align:center;font-size:.95rem;color:var(--color-text-dim)}
        .alt a{color:var(--luxury-gold);text-decoration:none;font-weight:600;transition:all .2s ease;background:linear-gradient(45deg, var(--luxury-gold), var(--luxury-rose));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .alt a:hover{transform:translateY(-1px);filter:brightness(1.2);text-decoration:underline}
        .auth-link-card{margin-top:1.5rem;background:linear-gradient(135deg, var(--color-surface), var(--color-glass));border:1px solid var(--color-border);border-radius:16px;padding:1.2rem;text-align:center;backdrop-filter:blur(10px);box-shadow:0 8px 25px -8px var(--color-shadow)}
        .link-text{display:block;color:var(--color-text-dim);font-size:0.9rem;margin-bottom:0.8rem}
        .signup-link{display:inline-block;text-decoration:none;background:linear-gradient(45deg, var(--luxury-gold), var(--luxury-rose), var(--luxury-gold));background-size:200% 200%;padding:0.8rem 1.8rem;border-radius:12px;color:var(--color-glass);font-weight:600;font-size:0.95rem;transition:all 0.3s ease;animation:subtleShimmer 3s ease-in-out infinite;box-shadow:0 4px 15px -5px var(--luxury-gold)40}
        .signup-link:hover{transform:translateY(-2px);box-shadow:0 6px 20px -3px var(--luxury-gold)60;animation-duration:1.5s}
        .link-content{display:flex;align-items:center;gap:0.5rem;justify-content:center}
        .link-icon{font-size:1.1rem;opacity:0.9}
        @keyframes subtleShimmer{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @media (max-width: 768px) {
          .auth-container{grid-template-columns:1fr;gap:2rem;text-align:center}
          .brand-title{font-size:2.5rem}
          .auth-card{padding:1.5rem}
        }
      `}</style>
    </>
  );
}
