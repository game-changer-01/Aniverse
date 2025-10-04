import React, { useState } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      router.push('/recommendations');
    } else {
      setError(result.message || 'Login failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '400px', width: '100%', background: 'var(--color-surface)', padding: '2rem', borderRadius: '12px' }}>
        <Link href="/">Back to Home</Link>
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div style={{ marginBottom: '1rem' }}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          <button type="submit" style={{ width: '100%', padding: '0.75rem', background: '#ffd700', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Sign In
          </button>
          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            Don't have an account? <Link href="/auth/signup">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

LoginPage.getLayout = function getLayout(page) {
  return page;
};
