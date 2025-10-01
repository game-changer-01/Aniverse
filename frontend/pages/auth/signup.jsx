import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useAuth } from '../../src/contexts/AuthContext';

function SignupPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dbNotice, setDbNotice] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/recommendations');
    }
  }, [isAuthenticated, router]);

  // DB health notice so users understand failures when DB is offline
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const db = await axios.get('/api/health/db');
        if (!mounted) return;
        const state = db?.data?.state || 'unknown';
        if (state !== 'connected') {
          setDbNotice('Database is offline right now. Sign up may fail until it is restored.');
        }
      } catch {
        if (!mounted) return;
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Basic client-side validation
    if (!username || !email || !password || password.length < 6) {
      setLoading(false);
      return setError('Please fill all fields and use a password with at least 6 characters.');
    }
    
    const result = await register({ username, email, password });
    if (result.success) {
      router.push('/recommendations#browse');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <>
      <div className="auth-page">
        <div className="auth-container">
          <div className="brand-section">
            <h1 className="brand-title">AnimeVerse</h1>
            <p className="brand-subtitle">Join the anime community</p>
          </div>
          <form onSubmit={onSubmit} className="auth-card" noValidate>
            <h2>Create your account</h2>
            {dbNotice && <div className="notice" role="status">{dbNotice}</div>}
            {error && <div className="err" role="alert">{error}</div>}
        <label>
          <span>Username</span>
          <input value={username} onChange={e=>{ setUsername(e.target.value); if(error) setError(''); }} required autoComplete="username" placeholder="Your username" />
        </label>
        <label>
          <span>Email</span>
          <input value={email} onChange={e=>{ setEmail(e.target.value); if(error) setError(''); }} type="email" required autoComplete="email" placeholder="you@example.com" />
        </label>
        <label>
          <span>Password</span>
          <input value={password} onChange={e=>{ setPassword(e.target.value); if(error) setError(''); }} type="password" required minLength={6} autoComplete="new-password" placeholder="••••••" />
        </label>
        <button disabled={loading} type="submit">{loading ? 'Creating…' : 'Create account'}</button>
        <div className="login-link-wrapper">
          <span className="connect-text">Already part of the journey?</span>
          <Link href="/auth/login" className="login-link">
            <span className="link-inner">
              <span className="welcome-back">Welcome back</span>
              <span className="arrow">→</span>
            </span>
          </Link>
        </div>
      </form>
      </div>
    </div>
    <style jsx>{`
        .auth-page{min-height:100vh;background:linear-gradient(135deg, var(--color-bg), var(--color-bg-alt));display:flex;align-items:center;justify-content:center;padding:2rem;position:relative}
        .auth-page::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 30% 20%, var(--luxury-gold)10, transparent 50%), radial-gradient(circle at 70% 80%, var(--luxury-rose)10, transparent 50%);opacity:0.1;pointer-events:none}
        .auth-container{display:grid;grid-template-columns:1fr 1fr;gap:4rem;max-width:1000px;width:100%;align-items:center;position:relative;z-index:1}
        .brand-section{text-align:center}
        .brand-title{font-family:'Japan Ramen',serif;font-size:3.5rem;margin:0 0 1rem;background:linear-gradient(45deg, var(--luxury-gold), var(--luxury-rose));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 4px 8px var(--color-shadow))}
        .brand-subtitle{font-size:1.2rem;color:var(--color-text-dim);margin:0;opacity:0.9}
        .auth-card{width:100%;max-width:420px;background:var(--color-glass);backdrop-filter:blur(15px);border:1px solid var(--color-border);border-radius:24px;padding:2.5rem;box-shadow:0 25px 50px var(--color-shadow);color:var(--color-text)}
        h2{margin:0 0 2rem;font-size:1.8rem;color:var(--color-text);background:linear-gradient(45deg, var(--color-accent), var(--color-accent-glow));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-align:center}
        .notice{background:var(--color-surface);border:1px solid var(--color-border);padding:.75rem;border-radius:12px;margin-bottom:1rem;opacity:.9;color:var(--color-text-dim);font-size:.9rem}
        label{display:flex;flex-direction:column;gap:.5rem;margin:1rem 0}
        label span{color:var(--color-text);font-size:.95rem;font-weight:500}
        input{background:var(--color-surface);border:1px solid var(--color-border);color:var(--color-text);border-radius:12px;padding:.9rem;transition:all .3s ease;font-size:.95rem}
        input:focus{border-color:var(--color-accent);outline:none;box-shadow:0 0 0 3px var(--color-accent)20}
        input::placeholder{color:var(--color-text-dim)}
        button{margin-top:1.5rem;width:100%;background:linear-gradient(45deg,var(--color-accent),var(--color-accent-glow));border:none;color:var(--color-glass);padding:1rem;border-radius:12px;font-weight:600;cursor:pointer;transition:all .3s ease;font-size:1rem}
        button:hover{background:linear-gradient(45deg,var(--color-accent-alt),var(--color-accent));transform:translateY(-1px);box-shadow:0 8px 25px var(--color-accent)30}
        button:disabled{opacity:.6;cursor:not-allowed;transform:none}
        .err{background:var(--color-surface);border:1px solid var(--color-accent);padding:.75rem;border-radius:12px;margin-bottom:1rem;color:var(--color-accent);font-size:.9rem}
        .alt{margin-top:1.5rem;text-align:center;font-size:.95rem;color:var(--color-text-dim)}
        .alt a{color:var(--luxury-gold);text-decoration:none;font-weight:600;transition:all .2s ease;background:linear-gradient(45deg, var(--luxury-gold), var(--luxury-rose));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .alt a:hover{transform:translateY(-1px);filter:brightness(1.2);text-decoration:underline}
        .login-link-wrapper{margin-top:1.8rem;text-align:center}
        .connect-text{display:block;color:var(--color-text-dim);font-size:0.9rem;margin-bottom:1rem;opacity:0.8}
        .login-link{display:inline-block;text-decoration:none;position:relative;background:linear-gradient(135deg, var(--color-surface), var(--color-glass));border:2px solid transparent;background-clip:padding-box;border-radius:20px;padding:0;overflow:hidden;transition:all 0.4s ease}
        .login-link::before{content:'';position:absolute;inset:-2px;background:linear-gradient(45deg, var(--luxury-rose), var(--luxury-gold), var(--luxury-rose), var(--luxury-gold));background-size:300% 300%;border-radius:20px;z-index:-1;animation:borderFlow 4s ease-in-out infinite}
        .link-inner{display:flex;align-items:center;gap:0.8rem;padding:1rem 2rem;background:linear-gradient(135deg, var(--color-surface)95, var(--color-glass)95);border-radius:18px;color:var(--color-text);font-weight:600;font-size:0.95rem;transition:all 0.3s ease}
        .login-link:hover{transform:translateY(-3px);box-shadow:0 10px 30px -10px var(--luxury-rose)50}
        .login-link:hover .link-inner{background:linear-gradient(135deg, var(--luxury-rose)20, var(--luxury-gold)10)}
        .welcome-back{background:linear-gradient(45deg, var(--luxury-gold), var(--luxury-rose));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .arrow{font-size:1.2rem;transition:transform 0.3s ease;opacity:0.7}
        .login-link:hover .arrow{transform:translateX(4px);opacity:1}
        @keyframes borderFlow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @media (max-width: 768px) {
          .auth-container{grid-template-columns:1fr;gap:2rem;text-align:center}
          .brand-title{font-size:2.5rem}
          .auth-card{padding:2rem;margin:0 auto}
        }
      `}</style>
    </>
  );
}

// Custom layout to remove taskbar
SignupPage.getLayout = function getLayout(page) {
  return page;
};

export default SignupPage;
