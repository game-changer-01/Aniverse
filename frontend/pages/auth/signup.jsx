import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useAuth } from '../../src/contexts/AuthContext';

export default function SignupPage() {
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
    <div className="auth-page">
      <form onSubmit={onSubmit} className="auth-card" noValidate>
        <h1>Create your account</h1>
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
        <p className="alt">Already have an account? <Link href="/auth/login">Log in</Link></p>
      </form>
      <style jsx>{`
        .auth-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0b0b0f;padding:2rem}
        .auth-card{width:100%;max-width:420px;background:rgba(36,47,70,0.6);backdrop-filter:blur(10px);border:1px solid #2e3d55;border-radius:16px;padding:1.5rem;box-shadow:0 10px 30px rgba(0,0,0,.45);color:#fff}
        h1{margin:0 0 1rem;font-size:1.5rem}
        .notice{background:#26354a;border:1px solid #385477;padding:.5rem;border-radius:8px;margin-bottom:.5rem;opacity:.9}
        label{display:flex;flex-direction:column;gap:.35rem;margin:.6rem 0}
        input{background:#121826;border:1px solid #2e3d55;color:#fff;border-radius:10px;padding:.7rem}
        button{margin-top:1rem;width:100%;background:linear-gradient(45deg,#ff6b6b,#4ecdc4);border:none;color:#fff;padding:.8rem;border-radius:12px;font-weight:600;cursor:pointer}
        .err{background:#40222a;border:1px solid #7a2d3a;padding:.5rem;border-radius:8px;margin-bottom:.5rem}
        .alt{margin-top:.75rem;opacity:.8}
      `}</style>
    </div>
  );
}
