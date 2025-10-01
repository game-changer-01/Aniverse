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
      setError(result.error);
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
    <div className="auth-page">
      <form onSubmit={onSubmit} className="auth-card" noValidate>
        <h1>Welcome back</h1>
        {dbNotice && <div className="notice" role="status">{dbNotice}</div>}
        {error && <div className="err" role="alert">{error}</div>}
        {gisReady && (
          <div className="oauth">
            <div id="google-btn-visible" />
            <div className="or">or</div>
          </div>
        )}
        <label>
          <span>Email</span>
          <input value={email} onChange={e=>{ setEmail(e.target.value); if(error) setError(''); }} type="email" required autoComplete="email" placeholder="you@example.com" />
        </label>
        <label>
          <span>Password</span>
          <input value={password} onChange={e=>{ setPassword(e.target.value); if(error) setError(''); }} type="password" required minLength={6} autoComplete="current-password" placeholder="••••••" />
        </label>
        <button disabled={loading} type="submit">{loading ? 'Signing in…' : 'Sign in'}</button>
        <p className="alt">No account? <Link href="/auth/signup">Sign up</Link></p>
      </form>
      <style jsx>{`
        .auth-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0b0b0f;padding:2rem}
        .auth-card{width:100%;max-width:420px;background:rgba(36,47,70,0.6);backdrop-filter:blur(10px);border:1px solid #2e3d55;border-radius:16px;padding:1.5rem;box-shadow:0 10px 30px rgba(0,0,0,.45);color:#fff}
        h1{margin:0 0 1rem;font-size:1.5rem}
        .notice{background:#26354a;border:1px solid #385477;padding:.5rem;border-radius:8px;margin-bottom:.5rem;opacity:.9}
        .oauth{display:flex;flex-direction:column;gap:.75rem;margin:.5rem 0 1rem}
  #google-btn-visible :global(div[role="button"]){ width:100% !important; justify-content:center }
        .or{opacity:.6;text-align:center;font-size:.8rem}
        label{display:flex;flex-direction:column;gap:.35rem;margin:.6rem 0}
        input{background:#121826;border:1px solid #2e3d55;color:#fff;border-radius:10px;padding:.7rem}
        button{margin-top:1rem;width:100%;background:linear-gradient(45deg,#ff6b6b,#4ecdc4);border:none;color:#fff;padding:.8rem;border-radius:12px;font-weight:600;cursor:pointer}
        .err{background:#40222a;border:1px solid #7a2d3a;padding:.5rem;border-radius:8px;margin-bottom:.5rem}
        .alt{margin-top:.75rem;opacity:.8}
      `}</style>
    </div>
  );
}
